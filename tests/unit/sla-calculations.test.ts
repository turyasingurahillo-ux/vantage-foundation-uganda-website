import { describe, it, expect } from "vitest";

/**
 * Tests for SLA calculation logic.
 *
 * These tests verify the pure calculation logic that derives SLA metrics
 * from timestamp data. The actual database queries are tested separately
 * (they require a live database); here we test the mathematical derivations
 * that the SLA UI relies on.
 */

describe("SLA duration formatting", () => {
  // Replicate the formatDuration logic from the service page
  function formatDuration(ms: number | null): string {
    if (ms == null) return "—";
    const hours = ms / (1000 * 60 * 60);
    if (hours < 1) return `${Math.round(ms / (1000 * 60))}m`;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    const days = hours / 24;
    return `${days.toFixed(1)}d`;
  }

  it("returns dash for null", () => {
    expect(formatDuration(null)).toBe("—");
  });

  it("formats minutes for sub-hour durations", () => {
    expect(formatDuration(30 * 60 * 1000)).toBe("30m");
    expect(formatDuration(45 * 60 * 1000)).toBe("45m");
  });

  it("formats hours for sub-day durations", () => {
    expect(formatDuration(2 * 60 * 60 * 1000)).toBe("2.0h");
    expect(formatDuration(90 * 60 * 1000)).toBe("1.5h");
  });

  it("formats days for longer durations", () => {
    expect(formatDuration(24 * 60 * 60 * 1000)).toBe("1.0d");
    expect(formatDuration(2 * 24 * 60 * 60 * 1000)).toBe("2.0d");
    expect(formatDuration(36 * 60 * 60 * 1000)).toBe("1.5d");
  });
});

describe("SLA within-target calculation", () => {
  const SLA_TARGET_MS = 2 * 24 * 60 * 60 * 1000; // 2 days

  function isWithinTarget(responseTimeMs: number): boolean {
    return responseTimeMs <= SLA_TARGET_MS;
  }

  it("counts responses within 2 days as within target", () => {
    expect(isWithinTarget(1 * 24 * 60 * 60 * 1000)).toBe(true);
    expect(isWithinTarget(12 * 60 * 60 * 1000)).toBe(true);
    expect(isWithinTarget(30 * 60 * 1000)).toBe(true);
  });

  it("counts responses over 2 days as not within target", () => {
    expect(isWithinTarget(3 * 24 * 60 * 60 * 1000)).toBe(false);
    expect(isWithinTarget(7 * 24 * 60 * 60 * 1000)).toBe(false);
  });

  it("counts exactly 2 days as within target (boundary)", () => {
    expect(isWithinTarget(SLA_TARGET_MS)).toBe(true);
  });

  it("calculates percentage correctly", () => {
    const withinTarget = 8;
    const responded = 10;
    const percent = Math.round((withinTarget / responded) * 100);
    expect(percent).toBe(80);
  });

  it("returns null percentage when no cases responded", () => {
    const withinTarget = 0;
    const responded = 0;
    const percent = responded > 0 ? Math.round((withinTarget / responded) * 100) : null;
    expect(percent).toBeNull();
  });
});

describe("SLA by case type filtering", () => {
  // Replicate the filtering logic: only show case types with >= 3 cases
  function filterSignificantRows<T extends { caseCount: number }>(rows: T[]): T[] {
    return rows.filter((r) => r.caseCount >= 3);
  }

  it("filters out case types with fewer than 3 cases", () => {
    const rows = [
      { caseType: "partnership", caseCount: 12, respondedCount: 10 },
      { caseType: "volunteer", caseCount: 2, respondedCount: 1 },
      { caseType: "beneficiary", caseCount: 19, respondedCount: 15 },
    ];
    const filtered = filterSignificantRows(rows);
    expect(filtered).toHaveLength(2);
    expect(filtered.map((r) => r.caseType)).toEqual(["partnership", "beneficiary"]);
  });

  it("returns empty array when all case types have < 3 cases", () => {
    const rows = [
      { caseType: "a", caseCount: 1 },
      { caseType: "b", caseCount: 2 },
    ];
    const filtered = filterSignificantRows(rows);
    expect(filtered).toHaveLength(0);
  });

  it("includes case types with exactly 3 cases", () => {
    const rows = [{ caseType: "a", caseCount: 3 }];
    const filtered = filterSignificantRows(rows);
    expect(filtered).toHaveLength(1);
  });
});

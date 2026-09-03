import { describe, it, expect } from "vitest";
import {
  formatMoney,
  formatMoneyCompact,
  formatDateTime,
  formatDate,
  formatRelativeTime,
} from "@/lib/format";

describe("formatMoney", () => {
  it("formats UGX without decimals", () => {
    expect(formatMoney(100000, "UGX")).toBe("UGX 100,000");
  });

  it("formats UGX with thousands separators", () => {
    expect(formatMoney(1500000, "UGX")).toBe("UGX 1,500,000");
  });

  it("formats KES without decimals", () => {
    expect(formatMoney(50000, "KES")).toBe("KES 50,000");
  });

  it("formats USD with 2 decimals", () => {
    expect(formatMoney(50.5, "USD")).toBe("USD 50.50");
  });

  it("defaults to UGX when currency is empty", () => {
    expect(formatMoney(1000, "")).toBe("UGX 1,000");
  });

  it("never double-prefixes the currency code", () => {
    const result = formatMoney(100000, "UGX");
    expect(result).toBe("UGX 100,000");
    expect(result).not.toContain("UGX UGX");
  });

  it("handles negative amounts", () => {
    expect(formatMoney(-1000, "UGX")).toBe("-UGX 1,000");
  });
});

describe("formatMoneyCompact", () => {
  it("rounds to whole numbers", () => {
    expect(formatMoneyCompact(100000.99, "UGX")).toBe("UGX 100,001");
  });

  it("formats without decimals for any currency", () => {
    expect(formatMoneyCompact(50.5, "USD")).toBe("USD 51");
  });
});

describe("formatDateTime", () => {
  it("formats a date with day, month, year, and time", () => {
    const date = new Date("2026-08-19T10:39:00Z");
    const result = formatDateTime(date);
    expect(result).toMatch(/19 Aug 2026/);
    expect(result).toMatch(/\d{2}:\d{2}/);
  });

  it("accepts ISO string input", () => {
    const result = formatDateTime("2026-08-19T10:39:00Z");
    expect(result).toMatch(/19 Aug 2026/);
  });
});

describe("formatDate", () => {
  it("formats a date as day month year", () => {
    const date = new Date("2026-08-19T10:39:00Z");
    expect(formatDate(date)).toMatch(/19 Aug 2026/);
  });
});

describe("formatRelativeTime", () => {
  it("returns 'just now' for recent times", () => {
    const now = new Date();
    expect(formatRelativeTime(now)).toBe("just now");
  });

  it("returns minutes ago", () => {
    const date = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("5m ago");
  });

  it("returns hours ago", () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("3h ago");
  });

  it("returns days ago", () => {
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(date)).toBe("2d ago");
  });
});

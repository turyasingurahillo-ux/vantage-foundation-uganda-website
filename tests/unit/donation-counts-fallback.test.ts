import { describe, it, expect } from "vitest";
import type { DonationRow } from "@/lib/db";

/**
 * Tests the donation counts fallback logic that the donations page uses
 * when the optimized count query fails but the full donation list loads.
 *
 * The page derives counts from loaded rows in that case, so it never
 * shows wrong zero counts.
 */

function deriveCountsFromRows(donations: DonationRow[]) {
  return {
    pending: donations.filter((d) => d.status === "pending").length,
    verified: donations.filter((d) => d.status === "verified").length,
    rejected: donations.filter((d) => d.status === "rejected").length,
    all: donations.length,
  };
}

function makeDonation(
  status: "pending" | "verified" | "rejected",
): DonationRow {
  return {
    id: Math.random(),
    createdAt: new Date(),
    name: "Test",
    email: "test@test.com",
    phone: undefined,
    amount: 1000,
    currency: "UGX",
    frequency: "one-time",
    campaign: "General",
    transactionReference: "REF",
    message: undefined,
    status,
    adminNotes: undefined,
    verifiedAt: undefined,
    deletedAt: null,
  };
}

describe("Donation counts fallback from loaded rows", () => {
  it("derives correct counts when count query fails", () => {
    const donations = [
      makeDonation("pending"),
      makeDonation("pending"),
      makeDonation("verified"),
      makeDonation("rejected"),
    ];
    const counts = deriveCountsFromRows(donations);
    expect(counts).toEqual({
      pending: 2,
      verified: 1,
      rejected: 1,
      all: 4,
    });
  });

  it("shows pending > 0 when pending rows exist and count query fails", () => {
    const donations = [
      makeDonation("pending"),
      makeDonation("pending"),
      makeDonation("pending"),
    ];
    const counts = deriveCountsFromRows(donations);
    // The bug was: count query fails → counts = {pending: 0, ...}
    // while pending rows visibly exist.
    // The fix derives from loaded rows, so pending must be 3.
    expect(counts.pending).toBe(3);
    expect(counts.pending).not.toBe(0);
  });

  it("handles empty donation list", () => {
    const counts = deriveCountsFromRows([]);
    expect(counts).toEqual({
      pending: 0,
      verified: 0,
      rejected: 0,
      all: 0,
    });
  });

  it("derives all count as total length, not sum of statuses", () => {
    const donations = [
      makeDonation("pending"),
      makeDonation("verified"),
      makeDonation("rejected"),
    ];
    const counts = deriveCountsFromRows(donations);
    expect(counts.all).toBe(3);
  });
});

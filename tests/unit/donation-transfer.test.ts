import { describe, expect, it } from "vitest";
import { createDonationReference } from "@/lib/donation-transfer";
import { donorSchema } from "@/lib/form-schemas";

describe("donation transfer routing", () => {
  it("creates a short public Vantage reference", () => {
    const reference = createDonationReference(new Date("2026-09-13T00:00:00Z"));
    expect(reference).toMatch(/^VFU-2026-[A-Z0-9]{10}$/);
  });

  it.each(["bank", "remitly", "worldremit"] as const)(
    "accepts %s and persists matching metadata in the audited message",
    (transferMethod) => {
      const parsed = donorSchema.safeParse({
        name: "Test Donor",
        email: "donor@example.com",
        amount: 100000,
        frequency: "one-time",
        campaign: "general",
        transferMethod,
        donationReference: "VFU-2026-ABCDEF1234",
        transactionReference: "TXN-123",
        message: "For community programmes",
      });

      expect(parsed.success).toBe(true);
      if (!parsed.success) return;

      expect(parsed.data.message).toContain(
        "Vantage donation reference: VFU-2026-ABCDEF1234",
      );
      expect(parsed.data.message).toContain("Transfer method:");
      expect(parsed.data.transferMethod).toBe(transferMethod);
    },
  );

  it("rejects an unapproved transfer method", () => {
    const parsed = donorSchema.safeParse({
      name: "Test Donor",
      email: "donor@example.com",
      amount: 100000,
      frequency: "one-time",
      campaign: "general",
      transferMethod: "moneygram",
      donationReference: "VFU-2026-ABCDEF1234",
    });

    expect(parsed.success).toBe(false);
  });
});

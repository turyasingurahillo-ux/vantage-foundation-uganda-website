import { describe, it, expect } from "vitest";
import {
  CASE_REFERRAL_STATUSES,
  CASE_REFERRAL_STATUS_VALUES,
  getCaseReferralStatusLabel,
  CASE_REFERRAL_OUTCOMES,
  CASE_REFERRAL_OUTCOME_VALUES,
  getCaseReferralOutcomeLabel,
  type CaseReferralStatus,
  type CaseReferralOutcome,
} from "@/lib/organisation-types";

describe("Case referral statuses", () => {
  it("includes draft, sent, follow_up_due, applied, closed", () => {
    const values = CASE_REFERRAL_STATUSES.map((s) => s.value);
    expect(values).toContain("draft");
    expect(values).toContain("sent");
    expect(values).toContain("follow_up_due");
    expect(values).toContain("applied");
    expect(values).toContain("closed");
  });

  it("returns correct labels", () => {
    expect(getCaseReferralStatusLabel("draft")).toBe("Draft");
    expect(getCaseReferralStatusLabel("sent")).toBe("Sent");
    expect(getCaseReferralStatusLabel("follow_up_due")).toBe("Follow-up Due");
    expect(getCaseReferralStatusLabel("applied")).toBe("Applied");
    expect(getCaseReferralStatusLabel("closed")).toBe("Closed");
  });

  it("defaults to Draft for null/unknown", () => {
    expect(getCaseReferralStatusLabel(null)).toBe("Draft");
    expect(getCaseReferralStatusLabel(undefined)).toBe("Draft");
  });

  it("has a non-empty tuple for zod", () => {
    expect(CASE_REFERRAL_STATUS_VALUES.length).toBeGreaterThan(0);
  });
});

describe("Case referral outcomes", () => {
  it("includes all required outcomes", () => {
    const values = CASE_REFERRAL_OUTCOMES.map((o) => o.value);
    expect(values).toContain("applied");
    expect(values).toContain("not_applied");
    expect(values).toContain("accepted");
    expect(values).toContain("rejected");
    expect(values).toContain("not_eligible");
    expect(values).toContain("unable_to_contact");
    expect(values).toContain("unknown");
  });

  it("returns correct labels", () => {
    expect(getCaseReferralOutcomeLabel("applied")).toBe("Applied");
    expect(getCaseReferralOutcomeLabel("not_applied")).toBe("Not applied");
    expect(getCaseReferralOutcomeLabel("accepted")).toBe("Accepted");
    expect(getCaseReferralOutcomeLabel("rejected")).toBe("Rejected");
    expect(getCaseReferralOutcomeLabel("not_eligible")).toBe("Not eligible");
    expect(getCaseReferralOutcomeLabel("unable_to_contact")).toBe("Unable to contact");
    expect(getCaseReferralOutcomeLabel("unknown")).toBe("Unknown");
  });

  it("returns empty string for null/unknown", () => {
    expect(getCaseReferralOutcomeLabel(null)).toBe("");
    expect(getCaseReferralOutcomeLabel(undefined)).toBe("");
  });

  it("has a non-empty tuple for zod", () => {
    expect(CASE_REFERRAL_OUTCOME_VALUES.length).toBeGreaterThan(0);
  });

  it("type narrowing works for status and outcome", () => {
    const status: CaseReferralStatus = "sent";
    const outcome: CaseReferralOutcome = "accepted";
    expect(status).toBe("sent");
    expect(outcome).toBe("accepted");
  });
});

import { describe, it, expect } from "vitest";
import {
  ORGANISATION_RELATIONSHIP_STATUSES,
  ORGANISATION_RELATIONSHIP_STATUS_VALUES,
  getOrganisationRelationshipStatusLabel,
  ORGANISATION_TYPES,
  ORGANISATION_TYPE_VALUES,
  getOrganisationTypeLabel,
  DUE_DILIGENCE_LEVELS,
  DUE_DILIGENCE_STATUSES,
  DUE_DILIGENCE_STATUS_VALUES,
  getDueDiligenceStatusLabel,
  isDueDiligenceStatus,
  getDueDiligenceChecksForLevel,
  CASE_DECISIONS,
  CASE_DECISION_VALUES,
  getCaseDecisionLabel,
  CASE_ACTION_STATUSES,
  CASE_ACTION_STATUS_VALUES,
  getCaseActionStatusLabel,
  COMMUNICATION_CHANNELS,
  COMMUNICATION_CHANNEL_VALUES,
  getCommunicationChannelLabel,
  COMMUNICATION_DIRECTIONS,
  INBOUND_EMAIL_STATUSES,
} from "@/lib/organisation-types";

describe("Organisation relationship statuses", () => {
  it("includes all required relationship states", () => {
    const values = ORGANISATION_RELATIONSHIP_STATUSES.map((s) => s.value);
    expect(values).toContain("prospect");
    expect(values).toContain("enquirer");
    expect(values).toContain("under_review");
    expect(values).toContain("potential_partner");
    expect(values).toContain("active_partner");
    expect(values).toContain("donor_funder");
    expect(values).toContain("referral_partner");
    expect(values).toContain("supplier");
    expect(values).toContain("government_authority");
    expect(values).toContain("former_partner");
    expect(values).toContain("restricted");
    expect(values).toContain("other");
  });

  it("returns label for known status", () => {
    expect(getOrganisationRelationshipStatusLabel("active_partner")).toBe("Active Partner");
    expect(getOrganisationRelationshipStatusLabel("restricted")).toBe("Restricted / Do Not Engage");
  });

  it("defaults to Enquirer for unknown/null status", () => {
    expect(getOrganisationRelationshipStatusLabel(null)).toBe("Enquirer");
    expect(getOrganisationRelationshipStatusLabel(undefined)).toBe("Enquirer");
  });

  it("has a non-empty tuple of status values for zod", () => {
    expect(ORGANISATION_RELATIONSHIP_STATUS_VALUES.length).toBeGreaterThan(0);
  });
});

describe("Organisation types", () => {
  it("includes common organisation types", () => {
    const values = ORGANISATION_TYPES.map((t) => t.value);
    expect(values).toContain("ngo");
    expect(values).toContain("government");
    expect(values).toContain("private_company");
    expect(values).toContain("foundation");
  });

  it("returns label for known type", () => {
    expect(getOrganisationTypeLabel("ngo")).toBe("NGO / Non-profit");
    expect(getOrganisationTypeLabel("government")).toBe("Government / public authority");
  });

  it("returns empty string for null/unknown type", () => {
    expect(getOrganisationTypeLabel(null)).toBe("");
    expect(getOrganisationTypeLabel(undefined)).toBe("");
  });

  it("has a non-empty tuple of type values for zod", () => {
    expect(ORGANISATION_TYPE_VALUES.length).toBeGreaterThan(0);
  });
});

describe("Due-diligence framework", () => {
  it("has three progressive levels", () => {
    expect(DUE_DILIGENCE_LEVELS).toHaveLength(3);
    expect(DUE_DILIGENCE_LEVELS[0].value).toBe(1);
    expect(DUE_DILIGENCE_LEVELS[1].value).toBe(2);
    expect(DUE_DILIGENCE_LEVELS[2].value).toBe(3);
  });

  it("Level 1 includes basic identity checks", () => {
    const level1 = getDueDiligenceChecksForLevel(1);
    const keys = level1.map((c) => c.key);
    expect(keys).toContain("identity_confirmed");
    expect(keys).toContain("web_presence_reviewed");
    expect(keys).toContain("contact_identity_verified");
  });

  it("Level 2 includes partnership checks", () => {
    const level2 = getDueDiligenceChecksForLevel(2);
    const keys = level2.map((c) => c.key);
    expect(keys).toContain("registration_reviewed");
    expect(keys).toContain("safeguarding_reviewed");
    expect(keys).toContain("reputation_reviewed");
  });

  it("Level 3 includes funding/implementation checks", () => {
    const level3 = getDueDiligenceChecksForLevel(3);
    const keys = level3.map((c) => c.key);
    expect(keys).toContain("bank_details_verified");
    expect(keys).toContain("mou_agreement");
    expect(keys).toContain("conflict_of_interest");
  });

  it("Level 1 has fewer checks than Level 2, which has fewer than Level 3", () => {
    const l1 = getDueDiligenceChecksForLevel(1);
    const l2 = getDueDiligenceChecksForLevel(2);
    const l3 = getDueDiligenceChecksForLevel(3);
    expect(l1.length).toBeLessThan(l2.length);
    expect(l2.length).toBeLessThan(l3.length);
  });

  it("supports concern and failed statuses for surfacing on dashboard", () => {
    const values = DUE_DILIGENCE_STATUSES.map((s) => s.value);
    expect(values).toContain("concern");
    expect(values).toContain("failed");
    expect(values).toContain("verified");
  });

  it("returns correct labels for due-diligence statuses", () => {
    expect(getDueDiligenceStatusLabel("verified")).toBe("Verified");
    expect(getDueDiligenceStatusLabel("concern")).toBe("Concern");
    expect(getDueDiligenceStatusLabel("failed")).toBe("Failed");
    expect(getDueDiligenceStatusLabel(null)).toBe("Not started");
  });

  it("validates due-diligence status values", () => {
    expect(isDueDiligenceStatus("verified")).toBe(true);
    expect(isDueDiligenceStatus("concern")).toBe(true);
    expect(isDueDiligenceStatus("invalid")).toBe(false);
    expect(isDueDiligenceStatus(123)).toBe(false);
  });

  it("has a non-empty tuple of status values for zod", () => {
    expect(DUE_DILIGENCE_STATUS_VALUES.length).toBeGreaterThan(0);
  });
});

describe("Case decisions", () => {
  it("includes key decision types", () => {
    const values = CASE_DECISIONS.map((d) => d.value);
    expect(values).toContain("proceed");
    expect(values).toContain("proceed_with_conditions");
    expect(values).toContain("request_more_information");
    expect(values).toContain("refer");
    expect(values).toContain("decline");
    expect(values).toContain("close_without_action");
  });

  it("returns label for known decision", () => {
    expect(getCaseDecisionLabel("proceed")).toBe("Proceed");
    expect(getCaseDecisionLabel("proceed_with_conditions")).toBe("Proceed with conditions");
  });

  it("returns empty string for null/unknown decision", () => {
    expect(getCaseDecisionLabel(null)).toBe("");
    expect(getCaseDecisionLabel(undefined)).toBe("");
  });

  it("has a non-empty tuple of decision values for zod", () => {
    expect(CASE_DECISION_VALUES.length).toBeGreaterThan(0);
  });
});

describe("Case action statuses", () => {
  it("includes open, completed, cancelled, skipped", () => {
    const values = CASE_ACTION_STATUSES.map((s) => s.value);
    expect(values).toContain("open");
    expect(values).toContain("completed");
    expect(values).toContain("cancelled");
    expect(values).toContain("skipped");
  });

  it("returns correct labels", () => {
    expect(getCaseActionStatusLabel("open")).toBe("Open");
    expect(getCaseActionStatusLabel("completed")).toBe("Completed");
    expect(getCaseActionStatusLabel(null)).toBe("Open");
  });

  it("has a non-empty tuple of status values for zod", () => {
    expect(CASE_ACTION_STATUS_VALUES.length).toBeGreaterThan(0);
  });
});

describe("Communication channels", () => {
  it("includes WhatsApp, phone, meeting, social media, walk-in", () => {
    const values = COMMUNICATION_CHANNELS.map((c) => c.value);
    expect(values).toContain("whatsapp");
    expect(values).toContain("phone");
    expect(values).toContain("meeting");
    expect(values).toContain("social_media");
    expect(values).toContain("walk_in");
  });

  it("returns correct labels", () => {
    expect(getCommunicationChannelLabel("whatsapp")).toBe("WhatsApp");
    expect(getCommunicationChannelLabel("phone")).toBe("Phone call");
    expect(getCommunicationChannelLabel("social_media")).toBe("Social media");
  });

  it("returns empty string for null/unknown channel", () => {
    expect(getCommunicationChannelLabel(null)).toBe("");
    expect(getCommunicationChannelLabel(undefined)).toBe("");
  });

  it("has a non-empty tuple of channel values for zod", () => {
    expect(COMMUNICATION_CHANNEL_VALUES.length).toBeGreaterThan(0);
  });
});

describe("Communication directions", () => {
  it("includes inbound and outbound", () => {
    const values = COMMUNICATION_DIRECTIONS.map((d) => d.value);
    expect(values).toContain("inbound");
    expect(values).toContain("outbound");
  });
});

describe("Inbound email statuses", () => {
  it("includes processed, unmatched, replay_blocked, error", () => {
    const values = INBOUND_EMAIL_STATUSES.map((s) => s.value);
    expect(values).toContain("processed");
    expect(values).toContain("unmatched");
    expect(values).toContain("replay_blocked");
    expect(values).toContain("error");
  });
});

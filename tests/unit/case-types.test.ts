import { describe, it, expect } from "vitest";
import {
  CASE_WORKFLOW_STATUSES,
  CASE_TYPES,
  CASE_SOURCES,
  CASE_PRIORITIES,
  CASE_RISK_LEVELS,
  CASE_STRATEGIC_VALUES,
  CASE_OUTCOMES,
  DECLINE_REASONS,
  REFERRAL_OUTCOMES,
  CASE_PROGRAMMES,
  CASE_FILTERS,
  isCaseFilter,
  getCaseSourceLabel,
  getCaseTypeLabel,
  getWorkflowStatusLabel,
  getCasePriorityLabel,
  getCaseRiskLabel,
  getCaseProgrammeLabel,
  CASE_WORKFLOW_STATUS_VALUES,
  CASE_TYPE_VALUES,
  CASE_SOURCE_VALUES,
  CASE_PRIORITY_VALUES,
  CASE_RISK_LEVEL_VALUES,
  CASE_STRATEGIC_VALUE_VALUES,
  CASE_OUTCOME_VALUES,
  DECLINE_REASON_VALUES,
  REFERRAL_OUTCOME_VALUES,
  CASE_PROGRAMME_VALUES,
  type CaseWorkflowStatus,
  type CaseType,
  type CaseSource,
  type CasePriority,
  type CaseRiskLevel,
  type CaseStrategicValue,
  type CaseOutcome,
  type DeclineReason,
  type ReferralOutcome,
  type CaseProgramme,
  type CaseFilter,
} from "@/lib/case-types";

describe("case-types enum values", () => {
  it("exports workflow status values", () => {
    expect(CASE_WORKFLOW_STATUS_VALUES).toContain("new");
    expect(CASE_WORKFLOW_STATUS_VALUES).toContain("triage");
    expect(CASE_WORKFLOW_STATUS_VALUES).toContain("awaiting_vantage");
    expect(CASE_WORKFLOW_STATUS_VALUES).toContain("completed");
    expect(CASE_WORKFLOW_STATUS_VALUES).toContain("archived");
  });

  it("exports case type values", () => {
    expect(CASE_TYPE_VALUES).toContain("general_enquiry");
    expect(CASE_TYPE_VALUES).toContain("partnership");
    expect(CASE_TYPE_VALUES).toContain("safeguarding");
    expect(CASE_TYPE_VALUES).toContain("donor");
  });

  it("exports source values including website_form and whatsapp", () => {
    expect(CASE_SOURCE_VALUES).toContain("website_form");
    expect(CASE_SOURCE_VALUES).toContain("whatsapp");
    expect(CASE_SOURCE_VALUES).toContain("phone");
    expect(CASE_SOURCE_VALUES).toContain("referral");
  });

  it("exports priority values", () => {
    expect(CASE_PRIORITY_VALUES).toContain("critical");
    expect(CASE_PRIORITY_VALUES).toContain("high");
    expect(CASE_PRIORITY_VALUES).toContain("normal");
    expect(CASE_PRIORITY_VALUES).toContain("low");
  });

  it("exports risk level values", () => {
    expect(CASE_RISK_LEVEL_VALUES).toContain("unknown");
    expect(CASE_RISK_LEVEL_VALUES).toContain("high");
    expect(CASE_RISK_LEVEL_VALUES).toContain("medium");
    expect(CASE_RISK_LEVEL_VALUES).toContain("low");
  });

  it("exports outcome values", () => {
    expect(CASE_OUTCOME_VALUES).toContain("accepted");
    expect(CASE_OUTCOME_VALUES).toContain("declined");
    expect(CASE_OUTCOME_VALUES).toContain("referred");
    expect(CASE_OUTCOME_VALUES).toContain("completed");
  });

  it("exports decline reason values", () => {
    expect(DECLINE_REASON_VALUES.length).toBeGreaterThan(0);
  });

  it("exports referral outcome values", () => {
    expect(REFERRAL_OUTCOME_VALUES).toContain("applied");
    expect(REFERRAL_OUTCOME_VALUES).toContain("accepted");
    expect(REFERRAL_OUTCOME_VALUES).toContain("rejected");
  });

  it("exports programme values", () => {
    expect(CASE_PROGRAMME_VALUES).toContain("health");
    expect(CASE_PROGRAMME_VALUES).toContain("education");
    expect(CASE_PROGRAMME_VALUES).toContain("humanitarian");
    expect(CASE_PROGRAMME_VALUES).toContain("water");
  });
});

describe("case-types labels", () => {
  it("provides labels for all workflow statuses", () => {
    for (const status of CASE_WORKFLOW_STATUSES) {
      expect(status.label.length).toBeGreaterThan(0);
    }
  });

  it("provides labels for all case types", () => {
    for (const type of CASE_TYPES) {
      expect(type.label.length).toBeGreaterThan(0);
    }
  });

  it("provides labels for all sources", () => {
    for (const source of CASE_SOURCES) {
      expect(source.label.length).toBeGreaterThan(0);
    }
  });

  it("getCaseSourceLabel returns the correct label", () => {
    expect(getCaseSourceLabel("website_form")).toBe("Website form");
    expect(getCaseSourceLabel("whatsapp")).toBe("WhatsApp");
    expect(getCaseSourceLabel("phone")).toBe("Phone");
  });

  it("getCaseTypeLabel returns the correct label", () => {
    expect(getCaseTypeLabel("general_enquiry")).toBe("General enquiry");
    expect(getCaseTypeLabel("safeguarding")).toBe("Safeguarding");
  });

  it("getWorkflowStatusLabel returns the correct label", () => {
    expect(getWorkflowStatusLabel("new")).toBe("New");
    expect(getWorkflowStatusLabel("awaiting_vantage")).toBe("Awaiting Vantage");
    expect(getWorkflowStatusLabel("completed")).toBe("Completed");
  });

  it("getCasePriorityLabel returns the correct label", () => {
    expect(getCasePriorityLabel("critical")).toBe("Critical");
    expect(getCasePriorityLabel("normal")).toBe("Normal");
  });

  it("getCaseRiskLabel returns the correct label", () => {
    expect(getCaseRiskLabel("high")).toBe("High");
    expect(getCaseRiskLabel("unknown")).toBe("Unknown");
  });

  it("getCaseProgrammeLabel returns the correct label", () => {
    expect(getCaseProgrammeLabel("health")).toBe("Vantage Care (Health)");
    expect(getCaseProgrammeLabel("education")).toBe("KikumiKyo Academy (Education)");
  });
});

describe("isCaseFilter", () => {
  it("returns true for valid case filters", () => {
    expect(isCaseFilter("new")).toBe(true);
    expect(isCaseFilter("triage")).toBe(true);
    expect(isCaseFilter("active")).toBe(true);
    expect(isCaseFilter("overdue")).toBe(true);
    expect(isCaseFilter("safeguarding")).toBe(true);
    expect(isCaseFilter("all")).toBe(true);
  });

  it("returns false for invalid filters", () => {
    expect(isCaseFilter("invalid")).toBe(false);
    expect(isCaseFilter("")).toBe(false);
    expect(isCaseFilter(undefined)).toBe(false);
  });
});

describe("CASE_FILTERS", () => {
  it("includes operational slice filters", () => {
    const filterValues = CASE_FILTERS.map((f) => f.value);
    expect(filterValues).toContain("active");
    expect(filterValues).toContain("overdue");
    expect(filterValues).toContain("safeguarding");
    expect(filterValues).toContain("high_priority");
    expect(filterValues).toContain("all");
  });

  it("provides labels for all filters", () => {
    for (const filter of CASE_FILTERS) {
      expect(filter.label.length).toBeGreaterThan(0);
    }
  });
});

describe("case-types type safety", () => {
  it("CaseWorkflowStatus is a string union", () => {
    const status: CaseWorkflowStatus = "new";
    expect(typeof status).toBe("string");
  });

  it("CaseType is a string union", () => {
    const type: CaseType = "general_enquiry";
    expect(typeof type).toBe("string");
  });

  it("CaseSource is a string union", () => {
    const source: CaseSource = "website_form";
    expect(typeof source).toBe("string");
  });

  it("CasePriority is a string union", () => {
    const priority: CasePriority = "normal";
    expect(typeof priority).toBe("string");
  });

  it("CaseFilter is a string union", () => {
    const filter: CaseFilter = "active";
    expect(typeof filter).toBe("string");
  });
});

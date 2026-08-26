import type { ContactCategory } from "@/lib/contact-categories";

/**
 * Case-management domain model.
 *
 * This module is imported by BOTH client and server (like
 * lib/contact-categories.ts), so it must never contain mailbox addresses or
 * any other routing secret. It carries only the enum values, labels, and
 * helpers for the case workflow.
 *
 * Key distinction from the legacy contact-message status:
 *   - The existing `status` column (new / awaiting_response / replied /
 *     archived) is the MESSAGE DELIVERY state — it records whether an email
 *     reply has been sent to the enquirer.
 *   - `CaseWorkflowStatus` is the CASE state — it tracks the underlying
 *     relationship/enquiry through triage, review, due diligence, decision,
 *     acceptance, referral, decline, completion.
 *
 * A successful email reply sets the delivery state to `replied` but does NOT
 * complete the case. For example, "Please send your registration certificate"
 * means the case is `awaiting_external`, not finished.
 */

// ---------------------------------------------------------------------------
// Workflow status (case state)
// ---------------------------------------------------------------------------

export const CASE_WORKFLOW_STATUSES = [
  { value: "new", label: "New" },
  { value: "triage", label: "Triage" },
  { value: "awaiting_vantage", label: "Awaiting Vantage" },
  { value: "awaiting_external", label: "Awaiting External Party" },
  { value: "under_review", label: "Under Review" },
  { value: "due_diligence", label: "Due Diligence" },
  { value: "meeting_scheduled", label: "Meeting Scheduled" },
  { value: "decision_required", label: "Decision Required" },
  { value: "accepted", label: "Accepted" },
  { value: "referred", label: "Referred" },
  { value: "declined", label: "Declined" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
] as const;

export type CaseWorkflowStatus = (typeof CASE_WORKFLOW_STATUSES)[number]["value"];

export const CASE_WORKFLOW_STATUS_VALUES = CASE_WORKFLOW_STATUSES.map(
  (s) => s.value,
) as [CaseWorkflowStatus, ...CaseWorkflowStatus[]];

export function isCaseWorkflowStatus(
  value: unknown,
): value is CaseWorkflowStatus {
  return (
    typeof value === "string" &&
    CASE_WORKFLOW_STATUS_VALUES.includes(value as CaseWorkflowStatus)
  );
}

export function getWorkflowStatusLabel(value: CaseWorkflowStatus): string {
  return CASE_WORKFLOW_STATUSES.find((s) => s.value === value)?.label ?? "New";
}

/**
 * Whether a workflow status represents an active case still needing attention.
 * Used by the dashboard and inbox to distinguish active from resolved cases.
 */
export function isWorkflowStatusActive(
  value: CaseWorkflowStatus,
): boolean {
  return !["accepted", "completed", "archived"].includes(value);
}

// ---------------------------------------------------------------------------
// Intake source
// ---------------------------------------------------------------------------

export const CASE_SOURCES = [
  { value: "website_form", label: "Website form" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "social_media", label: "Social media" },
  { value: "referral", label: "Referral" },
  { value: "walk_in", label: "Walk-in" },
  { value: "other", label: "Other" },
] as const;

export type CaseSource = (typeof CASE_SOURCES)[number]["value"];

export const CASE_SOURCE_VALUES = CASE_SOURCES.map(
  (s) => s.value,
) as [CaseSource, ...CaseSource[]];

export function isCaseSource(value: unknown): value is CaseSource {
  return (
    typeof value === "string" &&
    CASE_SOURCE_VALUES.includes(value as CaseSource)
  );
}

export function getCaseSourceLabel(value: CaseSource): string {
  return CASE_SOURCES.find((s) => s.value === value)?.label ?? "Other";
}

// ---------------------------------------------------------------------------
// Case type (what kind of relationship/request it is)
// ---------------------------------------------------------------------------

export const CASE_TYPES = [
  { value: "beneficiary_request", label: "Beneficiary request" },
  { value: "organisation_assistance", label: "Organisation requesting assistance" },
  { value: "partnership", label: "Partnership" },
  { value: "donor", label: "Donor" },
  { value: "grant_funder", label: "Grant / funder" },
  { value: "volunteer", label: "Volunteer" },
  { value: "research", label: "Research" },
  { value: "media", label: "Media" },
  { value: "government_authority", label: "Government / public authority" },
  { value: "supplier_provider", label: "Supplier / service provider" },
  { value: "complaint", label: "Complaint" },
  { value: "safeguarding", label: "Safeguarding" },
  { value: "general_enquiry", label: "General enquiry" },
  { value: "spam_cold_outreach", label: "Spam / cold outreach" },
  { value: "other", label: "Other" },
] as const;

export type CaseType = (typeof CASE_TYPES)[number]["value"];

export const CASE_TYPE_VALUES = CASE_TYPES.map(
  (t) => t.value,
) as [CaseType, ...CaseType[]];

export function isCaseType(value: unknown): value is CaseType {
  return (
    typeof value === "string" &&
    CASE_TYPE_VALUES.includes(value as CaseType)
  );
}

export function getCaseTypeLabel(value: CaseType | undefined | null): string {
  if (!value) return "Uncategorised";
  return CASE_TYPES.find((t) => t.value === value)?.label ?? "Uncategorised";
}

/**
 * Suggested case type for a website-form submission, derived from the contact
 * category. The category describes WHERE the enquiry belongs; the case type
 * describes WHAT kind of relationship/request it is. Admins can refine the
 * case type during triage.
 */
export function suggestCaseTypeFromCategory(
  category: ContactCategory,
): CaseType {
  switch (category) {
    case "partnerships":
      return "partnership";
    case "grants":
      return "grant_funder";
    case "volunteering":
      return "volunteer";
    case "media":
      return "media";
    case "research":
      return "research";
    case "donation":
      return "donor";
    case "safeguarding":
      return "safeguarding";
    case "programmes":
      return "organisation_assistance";
    case "general":
      return "general_enquiry";
    case "other":
    default:
      return "other";
  }
}

// ---------------------------------------------------------------------------
// Priority, risk, strategic value (independent triage dimensions)
// ---------------------------------------------------------------------------

export const CASE_PRIORITIES = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "normal", label: "Normal" },
  { value: "low", label: "Low" },
] as const;

export type CasePriority = (typeof CASE_PRIORITIES)[number]["value"];

export const CASE_PRIORITY_VALUES = CASE_PRIORITIES.map(
  (p) => p.value,
) as [CasePriority, ...CasePriority[]];

export function getCasePriorityLabel(value: CasePriority): string {
  return CASE_PRIORITIES.find((p) => p.value === value)?.label ?? "Normal";
}

export const CASE_RISK_LEVELS = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "unknown", label: "Unknown" },
] as const;

export type CaseRiskLevel = (typeof CASE_RISK_LEVELS)[number]["value"];

export const CASE_RISK_LEVEL_VALUES = CASE_RISK_LEVELS.map(
  (r) => r.value,
) as [CaseRiskLevel, ...CaseRiskLevel[]];

export function getCaseRiskLabel(value: CaseRiskLevel): string {
  return CASE_RISK_LEVELS.find((r) => r.value === value)?.label ?? "Unknown";
}

export const CASE_STRATEGIC_VALUES = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "unknown", label: "Unknown" },
] as const;

export type CaseStrategicValue = (typeof CASE_STRATEGIC_VALUES)[number]["value"];

export const CASE_STRATEGIC_VALUE_VALUES = CASE_STRATEGIC_VALUES.map(
  (v) => v.value,
) as [CaseStrategicValue, ...CaseStrategicValue[]];

// ---------------------------------------------------------------------------
// Outcome / disposition (separate from workflow status)
// ---------------------------------------------------------------------------

export const CASE_OUTCOMES = [
  { value: "accepted", label: "Accepted" },
  { value: "explore_further", label: "Explore further" },
  { value: "information_requested", label: "Information requested" },
  { value: "referred", label: "Referred" },
  { value: "declined", label: "Declined" },
  { value: "no_response_required", label: "No response required" },
  { value: "completed", label: "Completed" },
] as const;

export type CaseOutcome = (typeof CASE_OUTCOMES)[number]["value"];

export const CASE_OUTCOME_VALUES = CASE_OUTCOMES.map(
  (o) => o.value,
) as [CaseOutcome, ...CaseOutcome[]];

export function getCaseOutcomeLabel(value: CaseOutcome | undefined | null): string {
  if (!value) return "";
  return CASE_OUTCOMES.find((o) => o.value === value)?.label ?? "";
}

// ---------------------------------------------------------------------------
// Decline reasons (structured, for management analytics)
// ---------------------------------------------------------------------------

export const DECLINE_REASONS = [
  { value: "funding_unavailable", label: "Funding unavailable" },
  { value: "outside_mandate", label: "Outside Vantage mandate" },
  { value: "geographic_mismatch", label: "Geographic mismatch" },
  { value: "insufficient_evidence", label: "Insufficient evidence" },
  { value: "capacity_constraints", label: "Capacity constraints" },
  { value: "safeguarding_concern", label: "Safeguarding concern" },
  { value: "reputational_risk", label: "Reputational risk" },
  { value: "proposal_quality", label: "Proposal quality" },
  { value: "duplication", label: "Duplication" },
  { value: "timing", label: "Timing" },
  { value: "requester_withdrew", label: "Requester withdrew" },
  { value: "organisation_unverified", label: "Organisation could not be verified" },
  { value: "conflict_of_interest", label: "Conflict of interest" },
  { value: "other", label: "Other" },
] as const;

export type DeclineReason = (typeof DECLINE_REASONS)[number]["value"];

export const DECLINE_REASON_VALUES = DECLINE_REASONS.map(
  (r) => r.value,
) as [DeclineReason, ...DeclineReason[]];

export function getDeclineReasonLabel(
  value: DeclineReason | undefined | null,
): string {
  if (!value) return "";
  return DECLINE_REASONS.find((r) => r.value === value)?.label ?? "";
}

// ---------------------------------------------------------------------------
// Referral outcomes
// ---------------------------------------------------------------------------

export const REFERRAL_OUTCOMES = [
  { value: "applied", label: "Applied" },
  { value: "not_applied", label: "Not applied" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "unknown", label: "Unknown" },
  { value: "not_eligible", label: "Not eligible" },
] as const;

export type ReferralOutcome = (typeof REFERRAL_OUTCOMES)[number]["value"];

export const REFERRAL_OUTCOME_VALUES = REFERRAL_OUTCOMES.map(
  (o) => o.value,
) as [ReferralOutcome, ...ReferralOutcome[]];

export function getReferralOutcomeLabel(
  value: ReferralOutcome | undefined | null,
): string {
  if (!value) return "";
  return REFERRAL_OUTCOMES.find((o) => o.value === value)?.label ?? "";
}

// ---------------------------------------------------------------------------
// Programmes (mirrors the site's programme ids for case linkage)
// ---------------------------------------------------------------------------

export const CASE_PROGRAMMES = [
  { value: "health", label: "Vantage Care (Health)" },
  { value: "education", label: "KikumiKyo Academy (Education)" },
  { value: "humanitarian", label: "Humanitarian Assistance" },
  { value: "water", label: "Water, Sanitation and Hygiene" },
  { value: "cross_cutting", label: "Cross-cutting" },
  { value: "none", label: "Not programme-specific" },
] as const;

export type CaseProgramme = (typeof CASE_PROGRAMMES)[number]["value"];

export const CASE_PROGRAMME_VALUES = CASE_PROGRAMMES.map(
  (p) => p.value,
) as [CaseProgramme, ...CaseProgramme[]];

export function getCaseProgrammeLabel(
  value: CaseProgramme | undefined | null,
): string {
  if (!value) return "";
  return CASE_PROGRAMMES.find((p) => p.value === value)?.label ?? "";
}

// ---------------------------------------------------------------------------
// Inbox filter — the case workspace filters by workflow status plus
// operational slices (my cases, overdue, safeguarding, high priority).
// ---------------------------------------------------------------------------

export type CaseFilter =
  | CaseWorkflowStatus
  | "all"
  | "active"
  | "my_cases"
  | "overdue"
  | "safeguarding"
  | "high_priority";

export const CASE_FILTERS: { value: CaseFilter; label: string }[] = [
  { value: "new", label: "New" },
  { value: "triage", label: "Triage" },
  { value: "awaiting_vantage", label: "Awaiting Vantage" },
  { value: "awaiting_external", label: "Awaiting External" },
  { value: "under_review", label: "Under Review" },
  { value: "due_diligence", label: "Due Diligence" },
  { value: "decision_required", label: "Decision Required" },
  { value: "referred", label: "Referred" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
  { value: "active", label: "All active" },
  { value: "my_cases", label: "My cases" },
  { value: "overdue", label: "Overdue" },
  { value: "safeguarding", label: "Safeguarding" },
  { value: "high_priority", label: "High priority" },
  { value: "all", label: "All" },
];

export function isCaseFilter(value: unknown): value is CaseFilter {
  return typeof value === "string" && CASE_FILTERS.some((f) => f.value === value);
}

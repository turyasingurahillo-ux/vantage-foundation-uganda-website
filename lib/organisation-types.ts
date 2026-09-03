/**
 * Organisation + Person relationship domain model.
 *
 * Client/server safe — no secrets, no mailbox addresses.
 */

// ---------------------------------------------------------------------------
// Organisation relationship status
// ---------------------------------------------------------------------------

export const ORGANISATION_RELATIONSHIP_STATUSES = [
  { value: "prospect", label: "Prospect" },
  { value: "enquirer", label: "Enquirer" },
  { value: "under_review", label: "Under Review" },
  { value: "potential_partner", label: "Potential Partner" },
  { value: "active_partner", label: "Active Partner" },
  { value: "donor_funder", label: "Donor / Funder" },
  { value: "referral_partner", label: "Referral Partner" },
  { value: "supplier", label: "Supplier" },
  { value: "government_authority", label: "Government / Authority" },
  { value: "former_partner", label: "Former Partner" },
  { value: "restricted", label: "Restricted / Do Not Engage" },
  { value: "other", label: "Other" },
] as const;

export type OrganisationRelationshipStatus =
  (typeof ORGANISATION_RELATIONSHIP_STATUSES)[number]["value"];

export const ORGANISATION_RELATIONSHIP_STATUS_VALUES =
  ORGANISATION_RELATIONSHIP_STATUSES.map(
    (s) => s.value,
  ) as [OrganisationRelationshipStatus, ...OrganisationRelationshipStatus[]];

export function getOrganisationRelationshipStatusLabel(
  value: OrganisationRelationshipStatus | undefined | null,
): string {
  if (!value) return "Enquirer";
  return (
    ORGANISATION_RELATIONSHIP_STATUSES.find((s) => s.value === value)?.label ??
    "Enquirer"
  );
}

// ---------------------------------------------------------------------------
// Organisation type
// ---------------------------------------------------------------------------

export const ORGANISATION_TYPES = [
  { value: "ngo", label: "NGO / Non-profit" },
  { value: "community_based", label: "Community-based organisation" },
  { value: "government", label: "Government / public authority" },
  { value: "private_company", label: "Private company" },
  { value: "foundation", label: "Foundation / trust" },
  { value: "academic", label: "Academic / research institution" },
  { value: "religious", label: "Religious institution" },
  { value: "media", label: "Media organisation" },
  { value: "donor_agency", label: "Donor / funding agency" },
  { value: "other", label: "Other" },
] as const;

export type OrganisationType =
  (typeof ORGANISATION_TYPES)[number]["value"] | null;

export const ORGANISATION_TYPE_VALUES = ORGANISATION_TYPES.map(
  (t) => t.value,
) as [string, ...string[]];

export function getOrganisationTypeLabel(
  value: OrganisationType | undefined | null,
): string {
  if (!value) return "";
  return ORGANISATION_TYPES.find((t) => t.value === value)?.label ?? "";
}

// ---------------------------------------------------------------------------
// Due-diligence framework
// ---------------------------------------------------------------------------

export type DueDiligenceLevel = 1 | 2 | 3;

export const DUE_DILIGENCE_LEVELS: {
  value: DueDiligenceLevel;
  label: string;
  description: string;
}[] = [
  {
    value: 1,
    label: "Level 1 — Basic",
    description: "Identity, presence, mandate, contact verification",
  },
  {
    value: 2,
    label: "Level 2 — Standard partnership",
    description: "Registration, leadership, programme history, safeguarding, reputation",
  },
  {
    value: 3,
    label: "Level 3 — Funding / implementation",
    description: "Documentation, signatory, banking, budget, MOU, conflict of interest",
  },
];

export const DUE_DILIGENCE_CHECKS: {
  level: DueDiligenceLevel;
  key: string;
  label: string;
}[] = [
  // Level 1 — Basic
  { level: 1, key: "identity_confirmed", label: "Organisation identity confirmed" },
  { level: 1, key: "web_presence_reviewed", label: "Website / social presence reviewed" },
  { level: 1, key: "contact_identity_verified", label: "Contact identity verified" },
  { level: 1, key: "mandate_reviewed", label: "Mandate reviewed" },
  { level: 1, key: "geographic_area_reviewed", label: "Geographic area reviewed" },
  // Level 2 — Standard partnership
  { level: 2, key: "registration_reviewed", label: "Registration reviewed" },
  { level: 2, key: "leadership_verified", label: "Leadership / contact verified" },
  { level: 2, key: "programme_history_reviewed", label: "Programme history reviewed" },
  { level: 2, key: "references_checked", label: "References checked" },
  { level: 2, key: "safeguarding_reviewed", label: "Safeguarding reviewed" },
  { level: 2, key: "financial_arrangements_clarified", label: "Financial arrangements clarified" },
  { level: 2, key: "reputation_reviewed", label: "Reputation reviewed" },
  // Level 3 — Funding / implementation
  { level: 3, key: "registration_documentation", label: "Registration documentation" },
  { level: 3, key: "authorised_signatory", label: "Authorised signatory" },
  { level: 3, key: "bank_details_verified", label: "Bank / payment details verification" },
  { level: 3, key: "budget_review", label: "Programme budget review" },
  { level: 3, key: "procurement_expectations", label: "Procurement expectations" },
  { level: 3, key: "safeguarding_requirements", label: "Safeguarding requirements" },
  { level: 3, key: "beneficiary_protection", label: "Beneficiary-protection requirements" },
  { level: 3, key: "reporting_requirements", label: "Reporting requirements" },
  { level: 3, key: "mou_agreement", label: "MOU / agreement" },
  { level: 3, key: "conflict_of_interest", label: "Conflict-of-interest review" },
];

export const DUE_DILIGENCE_STATUSES = [
  { value: "not_required", label: "Not required" },
  { value: "not_started", label: "Not started" },
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "concern", label: "Concern" },
  { value: "failed", label: "Failed" },
] as const;

export type DueDiligenceStatus =
  (typeof DUE_DILIGENCE_STATUSES)[number]["value"];

export const DUE_DILIGENCE_STATUS_VALUES = DUE_DILIGENCE_STATUSES.map(
  (s) => s.value,
) as [DueDiligenceStatus, ...DueDiligenceStatus[]];

export function getDueDiligenceStatusLabel(
  value: DueDiligenceStatus | undefined | null,
): string {
  if (!value) return "Not started";
  return DUE_DILIGENCE_STATUSES.find((s) => s.value === value)?.label ?? "Not started";
}

export function isDueDiligenceStatus(
  value: unknown,
): value is DueDiligenceStatus {
  return (
    typeof value === "string" &&
    DUE_DILIGENCE_STATUS_VALUES.includes(value as DueDiligenceStatus)
  );
}

export function getDueDiligenceChecksForLevel(
  level: DueDiligenceLevel,
): { key: string; label: string }[] {
  return DUE_DILIGENCE_CHECKS.filter((c) => c.level === level).map((c) => ({
    key: c.key,
    label: c.label,
  }));
}

// ---------------------------------------------------------------------------
// Decision record
// ---------------------------------------------------------------------------

export const CASE_DECISIONS = [
  { value: "proceed", label: "Proceed" },
  { value: "proceed_with_conditions", label: "Proceed with conditions" },
  { value: "request_more_information", label: "Request more information" },
  { value: "refer", label: "Refer" },
  { value: "decline", label: "Decline" },
  { value: "close_without_action", label: "Close without action" },
] as const;

export type CaseDecision = (typeof CASE_DECISIONS)[number]["value"];

export const CASE_DECISION_VALUES = CASE_DECISIONS.map(
  (d) => d.value,
) as [CaseDecision, ...CaseDecision[]];

export function getCaseDecisionLabel(
  value: CaseDecision | undefined | null,
): string {
  if (!value) return "";
  return CASE_DECISIONS.find((d) => d.value === value)?.label ?? "";
}

// ---------------------------------------------------------------------------
// Case action status
// ---------------------------------------------------------------------------

export const CASE_ACTION_STATUSES = [
  { value: "open", label: "Open" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "skipped", label: "Skipped" },
] as const;

export type CaseActionStatus = (typeof CASE_ACTION_STATUSES)[number]["value"];

export const CASE_ACTION_STATUS_VALUES = CASE_ACTION_STATUSES.map(
  (s) => s.value,
) as [CaseActionStatus, ...CaseActionStatus[]];

export function getCaseActionStatusLabel(
  value: CaseActionStatus | undefined | null,
): string {
  if (!value) return "Open";
  return CASE_ACTION_STATUSES.find((s) => s.value === value)?.label ?? "Open";
}

// ---------------------------------------------------------------------------
// Case communication channel
// ---------------------------------------------------------------------------

export const COMMUNICATION_CHANNELS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "phone", label: "Phone call" },
  { value: "meeting", label: "Meeting" },
  { value: "social_media", label: "Social media" },
  { value: "walk_in", label: "Walk-in" },
  { value: "email", label: "Email" },
  { value: "other", label: "Other" },
] as const;

export type CommunicationChannel =
  (typeof COMMUNICATION_CHANNELS)[number]["value"];

export const COMMUNICATION_CHANNEL_VALUES = COMMUNICATION_CHANNELS.map(
  (c) => c.value,
) as [CommunicationChannel, ...CommunicationChannel[]];

export function getCommunicationChannelLabel(
  value: CommunicationChannel | undefined | null,
): string {
  if (!value) return "";
  return (
    COMMUNICATION_CHANNELS.find((c) => c.value === value)?.label ?? ""
  );
}

// ---------------------------------------------------------------------------
// Communication direction
// ---------------------------------------------------------------------------

export const COMMUNICATION_DIRECTIONS = [
  { value: "inbound", label: "Inbound" },
  { value: "outbound", label: "Outbound" },
] as const;

export type CommunicationDirection =
  (typeof COMMUNICATION_DIRECTIONS)[number]["value"];

// ---------------------------------------------------------------------------
// Inbound email log status
// ---------------------------------------------------------------------------

export const INBOUND_EMAIL_STATUSES = [
  { value: "processed", label: "Processed" },
  { value: "unmatched", label: "Unmatched" },
  { value: "replay_blocked", label: "Replay blocked" },
  { value: "error", label: "Error" },
] as const;

export type InboundEmailStatus =
  (typeof INBOUND_EMAIL_STATUSES)[number]["value"];

// ---------------------------------------------------------------------------
// Case referral status + outcome
// ---------------------------------------------------------------------------

export const CASE_REFERRAL_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "follow_up_due", label: "Follow-up Due" },
  { value: "applied", label: "Applied" },
  { value: "closed", label: "Closed" },
] as const;

export type CaseReferralStatus =
  (typeof CASE_REFERRAL_STATUSES)[number]["value"];

export const CASE_REFERRAL_STATUS_VALUES = CASE_REFERRAL_STATUSES.map(
  (s) => s.value,
) as [CaseReferralStatus, ...CaseReferralStatus[]];

export function getCaseReferralStatusLabel(
  value: CaseReferralStatus | undefined | null,
): string {
  if (!value) return "Draft";
  return (
    CASE_REFERRAL_STATUSES.find((s) => s.value === value)?.label ?? "Draft"
  );
}

export const CASE_REFERRAL_OUTCOMES = [
  { value: "applied", label: "Applied" },
  { value: "not_applied", label: "Not applied" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "not_eligible", label: "Not eligible" },
  { value: "unable_to_contact", label: "Unable to contact" },
  { value: "unknown", label: "Unknown" },
] as const;

export type CaseReferralOutcome =
  (typeof CASE_REFERRAL_OUTCOMES)[number]["value"];

export const CASE_REFERRAL_OUTCOME_VALUES = CASE_REFERRAL_OUTCOMES.map(
  (o) => o.value,
) as [CaseReferralOutcome, ...CaseReferralOutcome[]];

export function getCaseReferralOutcomeLabel(
  value: CaseReferralOutcome | undefined | null,
): string {
  if (!value) return "";
  return (
    CASE_REFERRAL_OUTCOMES.find((o) => o.value === value)?.label ?? ""
  );
}

// ---------------------------------------------------------------------------
// Row types (matching database rows)
// ---------------------------------------------------------------------------

export interface OrganisationRow {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  organisationType: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  geographicArea: string | null;
  registrationNumber: string | null;
  relationshipStatus: OrganisationRelationshipStatus;
  primaryOwnerId: string | null;
  notes: string | null;
}

export interface PersonRow {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  fullName: string;
  primaryEmail: string | null;
  phone: string | null;
  roleTitle: string | null;
  organisationId: number | null;
  notes: string | null;
}

export interface CaseActionRow {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  caseId: number;
  title: string;
  ownerId: string | null;
  dueAt: Date | null;
  completedAt: Date | null;
  status: CaseActionStatus;
  note: string | null;
}

export interface CaseDecisionRow {
  id: number;
  createdAt: Date;
  caseId: number;
  decision: CaseDecision;
  decisionDate: Date;
  decisionMakerId: string | null;
  rationale: string | null;
  conditions: string | null;
}

export interface CaseCommunicationRow {
  id: number;
  createdAt: Date;
  caseId: number;
  direction: CommunicationDirection;
  channel: CommunicationChannel;
  occurredAt: Date;
  summary: string;
  staffMember: string | null;
  isInternal: boolean;
}

export interface DueDiligenceCheckRow {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  organisationId: number;
  level: DueDiligenceLevel;
  checkKey: string;
  label: string;
  status: DueDiligenceStatus;
  reviewerId: string | null;
  reviewedAt: Date | null;
  note: string | null;
  documentRef: string | null;
}

export interface InboundEmailLogRow {
  id: number;
  receivedAt: Date;
  messageIdHash: string;
  fromAddress: string;
  inReplyTo: string | null;
  subject: string | null;
  matchedCaseId: number | null;
  matchedReplyId: number | null;
  status: InboundEmailStatus;
  errorDetail: string | null;
}

export interface CaseReferralRow {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  caseId: number;
  organisationId: number | null;
  opportunityName: string;
  referredToName: string;
  description: string | null;
  urlReference: string | null;
  referredBy: string | null;
  referredAt: Date;
  followUpAt: Date | null;
  status: CaseReferralStatus;
  outcome: CaseReferralOutcome | null;
  outcomeAt: Date | null;
  notes: string | null;
}

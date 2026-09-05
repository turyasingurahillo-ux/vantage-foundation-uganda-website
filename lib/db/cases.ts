import type { ContactCategory } from "@/lib/contact-categories";
import type { ContactMessageStatus } from "@/lib/db/contact";
import type {
  CaseWorkflowStatus,
  CaseSource,
  CaseType,
  CaseProgramme,
  CasePriority,
  CaseRiskLevel,
  CaseStrategicValue,
  CaseOutcome,
  DeclineReason,
  ReferralOutcome,
  CaseFilter,
} from "@/lib/case-types";
import { getSql } from "@/lib/db/client";

/**
 * Case-management database queries.
 *
 * A "case" is a contact_messages row enriched with the case-workflow columns
 * introduced by the case-management-pipeline migration. This module owns the
 * case-specific queries (workflow updates, notes, referral, decline, counts,
 * dashboard slices); the legacy message queries (create, reply bookkeeping)
 * remain in lib/db/contact.ts and lib/db/contact-replies.ts.
 *
 * The two layers cooperate: a contact submission creates a contact_messages
 * row (lib/db/contact.ts) and then seeds its case fields via
 * seedCaseFromContactSubmission() here. Manual intake creates a row directly
 * here via createManualCase().
 */

// ---------------------------------------------------------------------------
// Row types
// ---------------------------------------------------------------------------

export interface CaseRow {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  email: string;
  phone?: string;
  organisation?: string;
  category: ContactCategory;
  message: string;
  emailSent: boolean;
  /** Legacy message delivery state: new / awaiting_response / replied / archived. */
  status: ContactMessageStatus;
  /** Case workflow state (the rich enum). */
  workflowStatus: CaseWorkflowStatus;
  source: CaseSource;
  caseType?: CaseType;
  programme?: CaseProgramme;
  priority: CasePriority;
  riskLevel: CaseRiskLevel;
  strategicValue: CaseStrategicValue;
  ownerId?: string;
  collaborators: string[];
  nextAction?: string;
  nextActionDueAt?: Date;
  outcome?: CaseOutcome;
  declineReason?: DeclineReason;
  declineDetail?: string;
  referralOrg?: string;
  referralDate?: Date;
  referralLink?: string;
  referralFollowupDate?: Date;
  referralOutcome?: ReferralOutcome;
  referralDetail?: string;
  firstResponseAt?: Date;
  closedAt?: Date;
  lastRepliedAt?: Date;
  archivedAt?: Date;
  organisationId?: number;
  personId?: number;
  triagedAt?: Date;
  receivedAt?: Date;
  /** The public page the contact form was submitted from (e.g. "/get-involved"). */
  originPage?: string;
}

export interface CaseNoteRow {
  id: number;
  createdAt: Date;
  caseId: number;
  body: string;
  adminActorId?: string;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Mapping
// ---------------------------------------------------------------------------

function mapCase(row: Record<string, unknown>): CaseRow {
  return {
    id: Number(row.id),
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
    name: row.name as string,
    email: row.email as string,
    phone: (row.phone as string) ?? undefined,
    organisation: (row.organisation as string) ?? undefined,
    category: row.category as ContactCategory,
    message: row.message as string,
    emailSent: Boolean(row.email_sent),
    status: (row.status as ContactMessageStatus) ?? "new",
    workflowStatus: (row.workflow_status as CaseWorkflowStatus) ?? "new",
    source: (row.source as CaseSource) ?? "website_form",
    caseType: (row.case_type as CaseType) ?? undefined,
    programme: (row.programme as CaseProgramme) ?? undefined,
    priority: (row.priority as CasePriority) ?? "normal",
    riskLevel: (row.risk_level as CaseRiskLevel) ?? "unknown",
    strategicValue: (row.strategic_value as CaseStrategicValue) ?? "unknown",
    ownerId: (row.owner_id as string) ?? undefined,
    collaborators: Array.isArray(row.collaborators)
      ? (row.collaborators as string[])
      : [],
    nextAction: (row.next_action as string) ?? undefined,
    nextActionDueAt: row.next_action_due_at
      ? new Date(row.next_action_due_at as string)
      : undefined,
    outcome: (row.outcome as CaseOutcome) ?? undefined,
    declineReason: (row.decline_reason as DeclineReason) ?? undefined,
    declineDetail: (row.decline_detail as string) ?? undefined,
    referralOrg: (row.referral_org as string) ?? undefined,
    referralDate: row.referral_date
      ? new Date(row.referral_date as string)
      : undefined,
    referralLink: (row.referral_link as string) ?? undefined,
    referralFollowupDate: row.referral_followup_date
      ? new Date(row.referral_followup_date as string)
      : undefined,
    referralOutcome: (row.referral_outcome as ReferralOutcome) ?? undefined,
    referralDetail: (row.referral_detail as string) ?? undefined,
    firstResponseAt: row.first_response_at
      ? new Date(row.first_response_at as string)
      : undefined,
    closedAt: row.closed_at ? new Date(row.closed_at as string) : undefined,
    lastRepliedAt: row.last_replied_at
      ? new Date(row.last_replied_at as string)
      : undefined,
    archivedAt: row.archived_at
      ? new Date(row.archived_at as string)
      : undefined,
    organisationId: row.organisation_id
      ? Number(row.organisation_id)
      : undefined,
    personId: row.person_id ? Number(row.person_id) : undefined,
    triagedAt: row.triaged_at
      ? new Date(row.triaged_at as string)
      : undefined,
    receivedAt: row.received_at
      ? new Date(row.received_at as string)
      : undefined,
    originPage: (row.origin_page as string) || undefined,
  };
}

function mapNote(row: Record<string, unknown>): CaseNoteRow {
  return {
    id: Number(row.id),
    createdAt: new Date(row.created_at as string),
    caseId: Number(row.case_id),
    body: row.body as string,
    adminActorId: (row.admin_actor_id as string) ?? undefined,
    updatedAt: new Date(row.updated_at as string),
  };
}

// ---------------------------------------------------------------------------
// Seeding: populate case fields when a contact submission is stored
// ---------------------------------------------------------------------------

/**
 * Seeds the case fields on a freshly-created contact_messages row.
 *
 * Website-form submissions get source='website_form' and a suggested case type
 * derived from the contact category. Called immediately after
 * createContactMessage() in the submit action. Safe to call even if the
 * migration has not run (the columns default on the table); failures are
 * non-fatal because the legacy message is already stored.
 */
export async function seedCaseFromContactSubmission(
  id: number,
  category: ContactCategory,
  suggestedCaseType: CaseType,
): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE contact_messages
    SET source = 'website_form',
        case_type = ${suggestedCaseType},
        received_at = COALESCE(received_at, created_at),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id} AND deleted_at IS NULL
  `;
}

// ---------------------------------------------------------------------------
// Manual intake: create a case from a non-website source
// ---------------------------------------------------------------------------

export interface ManualCaseInput {
  name: string;
  email?: string;
  phone?: string;
  organisation?: string;
  category: ContactCategory;
  caseType?: CaseType;
  programme?: CaseProgramme;
  source: CaseSource;
  message: string;
  priority?: CasePriority;
  ownerId?: string;
  /** Optional override of the received timestamp (defaults to now). */
  receivedAt?: Date;
}

/**
 * Creates a case from a non-website intake channel (WhatsApp, phone, social
 * media, referral, walk-in, direct email). Reuses the contact_messages table
 * so the case has the full reply/note/audit infrastructure.
 *
 * `email` is optional because phone/WhatsApp/walk-in intakes may not have one.
 * The legacy contact_messages.email column is NOT NULL, so a placeholder is
 * stored when no email is available; the case UI shows the phone instead.
 */
export async function createManualCase(
  input: ManualCaseInput,
): Promise<number> {
  const sql = getSql();
  const email = input.email && input.email.trim() ? input.email.trim() : "(no email)";
  const receivedAt = input.receivedAt ?? new Date();
  const rows = await sql`
    INSERT INTO contact_messages (
      name, email, phone, organisation, category, message,
      source, case_type, programme, priority, owner_id, workflow_status,
      created_at, received_at, updated_at
    ) VALUES (
      ${input.name}, ${email}, ${input.phone || null},
      ${input.organisation || null}, ${input.category}, ${input.message},
      ${input.source}, ${input.caseType || null}, ${input.programme || null},
      ${input.priority || "normal"}, ${input.ownerId || null}, ${"triage"},
      ${receivedAt}, ${receivedAt}, CURRENT_TIMESTAMP
    )
    RETURNING id
  `;
  return Number(rows[0].id);
}

// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------

const CASE_COLUMNS = `
  id, created_at, updated_at, name, email, phone, organisation, category,
  message, email_sent, status, workflow_status, source, case_type, programme,
  priority, risk_level, strategic_value, owner_id, collaborators,
  next_action, next_action_due_at, outcome, decline_reason, decline_detail,
  referral_org, referral_date, referral_link, referral_followup_date,
  referral_outcome, referral_detail, first_response_at, closed_at,
  last_replied_at, archived_at, organisation_id, person_id, triaged_at,
  received_at, origin_page
`;

/** Returns one case by id, or null. */
export async function getCaseById(id: number): Promise<CaseRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT ${sql.unsafe(CASE_COLUMNS)}
    FROM contact_messages
    WHERE id = ${id} AND deleted_at IS NULL
  `;
  if (rows.length === 0) return null;
  return mapCase(rows[0]);
}

// ---------------------------------------------------------------------------
// Case summary for the workspace list (bounded preview, no full body)
// ---------------------------------------------------------------------------

export const CASE_PREVIEW_LENGTH = 160;

export interface CaseSummary {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  email: string;
  phone?: string;
  organisation?: string;
  category: ContactCategory;
  messagePreview: string;
  emailSent: boolean;
  status: ContactMessageStatus;
  workflowStatus: CaseWorkflowStatus;
  source: CaseSource;
  caseType?: CaseType;
  programme?: CaseProgramme;
  priority: CasePriority;
  riskLevel: CaseRiskLevel;
  strategicValue: CaseStrategicValue;
  ownerId?: string;
  nextAction?: string;
  nextActionDueAt?: Date;
  outcome?: CaseOutcome;
  lastRepliedAt?: Date;
  receivedAt?: Date;
}

function mapSummary(row: Record<string, unknown>): CaseSummary {
  return {
    id: Number(row.id),
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
    name: row.name as string,
    email: row.email as string,
    phone: (row.phone as string) ?? undefined,
    organisation: (row.organisation as string) ?? undefined,
    category: row.category as ContactCategory,
    messagePreview: row.message_preview as string,
    emailSent: Boolean(row.email_sent),
    status: (row.status as ContactMessageStatus) ?? "new",
    workflowStatus: (row.workflow_status as CaseWorkflowStatus) ?? "new",
    source: (row.source as CaseSource) ?? "website_form",
    caseType: (row.case_type as CaseType) ?? undefined,
    programme: (row.programme as CaseProgramme) ?? undefined,
    priority: (row.priority as CasePriority) ?? "normal",
    riskLevel: (row.risk_level as CaseRiskLevel) ?? "unknown",
    strategicValue: (row.strategic_value as CaseStrategicValue) ?? "unknown",
    ownerId: (row.owner_id as string) ?? undefined,
    nextAction: (row.next_action as string) ?? undefined,
    nextActionDueAt: row.next_action_due_at
      ? new Date(row.next_action_due_at as string)
      : undefined,
    outcome: (row.outcome as CaseOutcome) ?? undefined,
    lastRepliedAt: row.last_replied_at
      ? new Date(row.last_replied_at as string)
      : undefined,
    receivedAt: row.received_at
      ? new Date(row.received_at as string)
      : undefined,
  };
}

/**
 * Case workspace list with workflow filters, operational slices, and search.
 *
 * Filters:
 *   - workflow status values match the workflow_status column
 *   - "active" = all non-accepted/completed/archived cases
 *   - "my_cases" = cases owned by the given actorId
 *   - "overdue" = next_action_due_at < today AND workflow active
 *   - "safeguarding" = case_type = 'safeguarding'
 *   - "high_priority" = priority IN ('critical','high')
 *   - "all" = everything
 *
 * Search matches name, email, organisation, category, case_type, message.
 * Both the filter and search term are bound parameters — the search string
 * never becomes SQL.
 */
export async function searchCaseSummaries(options: {
  filter?: CaseFilter;
  query?: string;
  actorId?: string;
  limit?: number;
}): Promise<CaseSummary[]> {
  const sql = getSql();
  const filter = options.filter ?? "active";
  const limit = options.limit ?? 200;
  const term = options.query?.trim();
  const like = term ? `%${term}%` : null;
  const actorId = options.actorId;

  const rows = await sql`
    SELECT
      id, created_at, updated_at, name, email, phone, organisation, category,
      LEFT(message, ${CASE_PREVIEW_LENGTH}) AS message_preview,
      email_sent, status, workflow_status, source, case_type, programme,
      priority, risk_level, strategic_value, owner_id,
      next_action, next_action_due_at, outcome, last_replied_at, received_at
    FROM contact_messages
    WHERE deleted_at IS NULL
      AND (
        ${filter} = 'all'
        OR (${filter} = 'active' AND workflow_status NOT IN ('accepted','completed','archived'))
        OR (${filter} = 'my_cases' AND owner_id = ${actorId ?? ""})
        OR (${filter} = 'overdue' AND next_action_due_at IS NOT NULL
            AND next_action_due_at < CURRENT_DATE
            AND workflow_status NOT IN ('accepted','completed','archived'))
        OR (${filter} = 'safeguarding' AND case_type = 'safeguarding')
        OR (${filter} = 'high_priority' AND priority IN ('critical','high'))
        OR workflow_status = ${filter}
      )
      AND (
        ${like}::text IS NULL
        OR name ILIKE ${like}
        OR email ILIKE ${like}
        OR category ILIKE ${like}
        OR case_type ILIKE ${like}
        OR message ILIKE ${like}
        OR COALESCE(organisation, '') ILIKE ${like}
      )
    ORDER BY
      CASE WHEN next_action_due_at IS NOT NULL
             AND next_action_due_at < CURRENT_DATE
            THEN 0 ELSE 1 END,
      next_action_due_at ASC NULLS LAST,
      created_at DESC
    LIMIT ${limit}
  `;
  return rows.map(mapSummary);
}

// ---------------------------------------------------------------------------
// Counts for the workspace tabs and dashboard
// ---------------------------------------------------------------------------

export interface CaseCounts {
  new: number;
  triage: number;
  awaiting_vantage: number;
  awaiting_external: number;
  under_review: number;
  due_diligence: number;
  meeting_scheduled: number;
  decision_required: number;
  accepted: number;
  referred: number;
  declined: number;
  completed: number;
  archived: number;
  active: number;
  all: number;
  overdue: number;
  safeguarding: number;
  high_priority: number;
  /**
   * Cases where owner_id matches the actorId passed to getCaseCounts().
   * Uses the same `owner_id = actorId` predicate as searchCaseSummaries'
   * `my_cases` filter, so the tab badge count is always consistent with
   * the result set. When actorId is not provided, this is 0.
   */
  my_cases: number;
}

/**
 * Per-filter counts for the case workspace header and the dashboard attention
 * centre. One pass over the table.
 *
 * When `actorId` is provided, the `my_cases` count is computed from the same
 * `owner_id = actorId` predicate used by `searchCaseSummaries` for the
 * `my_cases` filter. This keeps the tab badge consistent with the result set
 * without duplicating the filter logic in TypeScript.
 */
export async function getCaseCounts(actorId?: string): Promise<CaseCounts> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      COUNT(*) FILTER (WHERE workflow_status = 'new')::int AS new,
      COUNT(*) FILTER (WHERE workflow_status = 'triage')::int AS triage,
      COUNT(*) FILTER (WHERE workflow_status = 'awaiting_vantage')::int AS awaiting_vantage,
      COUNT(*) FILTER (WHERE workflow_status = 'awaiting_external')::int AS awaiting_external,
      COUNT(*) FILTER (WHERE workflow_status = 'under_review')::int AS under_review,
      COUNT(*) FILTER (WHERE workflow_status = 'due_diligence')::int AS due_diligence,
      COUNT(*) FILTER (WHERE workflow_status = 'meeting_scheduled')::int AS meeting_scheduled,
      COUNT(*) FILTER (WHERE workflow_status = 'decision_required')::int AS decision_required,
      COUNT(*) FILTER (WHERE workflow_status = 'accepted')::int AS accepted,
      COUNT(*) FILTER (WHERE workflow_status = 'referred')::int AS referred,
      COUNT(*) FILTER (WHERE workflow_status = 'declined')::int AS declined,
      COUNT(*) FILTER (WHERE workflow_status = 'completed')::int AS completed,
      COUNT(*) FILTER (WHERE workflow_status = 'archived')::int AS archived,
      COUNT(*) FILTER (WHERE workflow_status NOT IN ('accepted','completed','archived'))::int AS active,
      COUNT(*)::int AS all,
      COUNT(*) FILTER (
        WHERE next_action_due_at IS NOT NULL
          AND next_action_due_at < CURRENT_DATE
          AND workflow_status NOT IN ('accepted','completed','archived')
      )::int AS overdue,
      COUNT(*) FILTER (WHERE case_type = 'safeguarding')::int AS safeguarding,
      COUNT(*) FILTER (WHERE priority IN ('critical','high'))::int AS high_priority,
      COUNT(*) FILTER (WHERE owner_id = ${actorId ?? null})::int AS my_cases
    FROM contact_messages
    WHERE deleted_at IS NULL
  `;
  const r = rows[0];
  return {
    new: Number(r.new),
    triage: Number(r.triage),
    awaiting_vantage: Number(r.awaiting_vantage),
    awaiting_external: Number(r.awaiting_external),
    under_review: Number(r.under_review),
    due_diligence: Number(r.due_diligence),
    meeting_scheduled: Number(r.meeting_scheduled),
    decision_required: Number(r.decision_required),
    accepted: Number(r.accepted),
    referred: Number(r.referred),
    declined: Number(r.declined),
    completed: Number(r.completed),
    archived: Number(r.archived),
    active: Number(r.active),
    all: Number(r.all),
    overdue: Number(r.overdue),
    safeguarding: Number(r.safeguarding),
    high_priority: Number(r.high_priority),
    my_cases: Number(r.my_cases),
  };
}

// ---------------------------------------------------------------------------
// Upcoming actions for the dashboard
// ---------------------------------------------------------------------------

export interface UpcomingAction {
  id: number;
  name: string;
  organisation?: string;
  nextAction: string;
  nextActionDueAt: Date;
  workflowStatus: CaseWorkflowStatus;
  priority: CasePriority;
  ownerId?: string;
}

/**
 * Upcoming next-actions for the dashboard attention centre.
 *
 * `bucket` selects the slice:
 *   - "overdue"   due before today
 *   - "today"     due today
 *   - "upcoming"  due in the next 7 days (excluding today/overdue)
 *
 * Only active cases (not accepted/completed/archived) with a next action and
 * due date are returned. Safeguarding cases are surfaced but their message
 * body is never included — only the next-action label, name, and org.
 */
export async function getUpcomingActions(
  bucket: "overdue" | "today" | "upcoming",
  limit = 10,
): Promise<UpcomingAction[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, name, organisation, next_action, next_action_due_at,
           workflow_status, priority, owner_id
    FROM contact_messages
    WHERE deleted_at IS NULL
      AND next_action IS NOT NULL
      AND next_action_due_at IS NOT NULL
      AND workflow_status NOT IN ('accepted','completed','archived')
      AND (
        (${bucket} = 'overdue' AND next_action_due_at < CURRENT_DATE)
        OR (${bucket} = 'today' AND next_action_due_at = CURRENT_DATE)
        OR (${bucket} = 'upcoming' AND next_action_due_at > CURRENT_DATE
            AND next_action_due_at < CURRENT_DATE + INTERVAL '7 days')
      )
    ORDER BY next_action_due_at ASC, priority DESC
    LIMIT ${limit}
  `;
  return rows.map((row) => ({
    id: Number(row.id),
    name: row.name as string,
    organisation: (row.organisation as string) ?? undefined,
    nextAction: row.next_action as string,
    nextActionDueAt: new Date(row.next_action_due_at as string),
    workflowStatus: (row.workflow_status as CaseWorkflowStatus) ?? "new",
    priority: (row.priority as CasePriority) ?? "normal",
    ownerId: (row.owner_id as string) ?? undefined,
  }));
}

// ---------------------------------------------------------------------------
// Updates
// ---------------------------------------------------------------------------

export interface CaseUpdateInput {
  workflowStatus?: CaseWorkflowStatus;
  caseType?: CaseType | null;
  programme?: CaseProgramme | null;
  priority?: CasePriority;
  riskLevel?: CaseRiskLevel;
  strategicValue?: CaseStrategicValue;
  ownerId?: string | null;
  collaborators?: string[];
  nextAction?: string | null;
  nextActionDueAt?: Date | null;
  outcome?: CaseOutcome | null;
  declineReason?: DeclineReason | null;
  declineDetail?: string | null;
  referralOrg?: string | null;
  referralDate?: Date | null;
  referralLink?: string | null;
  referralFollowupDate?: Date | null;
  referralOutcome?: ReferralOutcome | null;
  referralDetail?: string | null;
}

/**
 * Updates the case-workflow fields on a contact_messages row.
 *
 * Only the fields present in `input` are written; absent fields are left
 * unchanged. When workflow_status moves to a terminal state (accepted,
 * completed, archived), closed_at is stamped. When it moves back to an active
 * state, closed_at is cleared.
 *
 * Returns the updated row, or null if the case was not found.
 */
export async function updateCase(
  id: number,
  input: CaseUpdateInput,
): Promise<CaseRow | null> {
  const sql = getSql();
  const existing = await getCaseById(id);
  if (!existing) return null;

  const next: Required<{
    [K in keyof CaseUpdateInput]: CaseUpdateInput[K] | null;
  }> = {
    workflowStatus: input.workflowStatus ?? existing.workflowStatus,
    caseType: input.caseType === undefined ? existing.caseType ?? null : input.caseType,
    programme: input.programme === undefined ? existing.programme ?? null : input.programme,
    priority: input.priority ?? existing.priority,
    riskLevel: input.riskLevel ?? existing.riskLevel,
    strategicValue: input.strategicValue ?? existing.strategicValue,
    ownerId: input.ownerId === undefined ? existing.ownerId ?? null : input.ownerId,
    collaborators: input.collaborators ?? existing.collaborators,
    nextAction: input.nextAction === undefined ? existing.nextAction ?? null : input.nextAction,
    nextActionDueAt: input.nextActionDueAt === undefined ? existing.nextActionDueAt ?? null : input.nextActionDueAt,
    outcome: input.outcome === undefined ? existing.outcome ?? null : input.outcome,
    declineReason: input.declineReason === undefined ? existing.declineReason ?? null : input.declineReason,
    declineDetail: input.declineDetail === undefined ? existing.declineDetail ?? null : input.declineDetail,
    referralOrg: input.referralOrg === undefined ? existing.referralOrg ?? null : input.referralOrg,
    referralDate: input.referralDate === undefined ? existing.referralDate ?? null : input.referralDate,
    referralLink: input.referralLink === undefined ? existing.referralLink ?? null : input.referralLink,
    referralFollowupDate: input.referralFollowupDate === undefined ? existing.referralFollowupDate ?? null : input.referralFollowupDate,
    referralOutcome: input.referralOutcome === undefined ? existing.referralOutcome ?? null : input.referralOutcome,
    referralDetail: input.referralDetail === undefined ? existing.referralDetail ?? null : input.referralDetail,
  };

  const isTerminal = ["accepted", "completed", "archived"].includes(
    next.workflowStatus as string,
  );

  await sql`
    UPDATE contact_messages
    SET
      workflow_status = ${next.workflowStatus},
      case_type = ${next.caseType},
      programme = ${next.programme},
      priority = ${next.priority},
      risk_level = ${next.riskLevel},
      strategic_value = ${next.strategicValue},
      owner_id = ${next.ownerId},
      collaborators = ${next.collaborators},
      next_action = ${next.nextAction},
      next_action_due_at = ${next.nextActionDueAt},
      outcome = ${next.outcome},
      decline_reason = ${next.declineReason},
      decline_detail = ${next.declineDetail},
      referral_org = ${next.referralOrg},
      referral_date = ${next.referralDate},
      referral_link = ${next.referralLink},
      referral_followup_date = ${next.referralFollowupDate},
      referral_outcome = ${next.referralOutcome},
      referral_detail = ${next.referralDetail},
      closed_at =
        CASE
          WHEN ${isTerminal} THEN CURRENT_TIMESTAMP
          ELSE NULL
        END,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id} AND deleted_at IS NULL
  `;

  return getCaseById(id);
}

// ---------------------------------------------------------------------------
// Internal notes
// ---------------------------------------------------------------------------

/**
 * Adds an internal note to a case.
 *
 * Internal notes are NEVER emailed and NEVER exposed publicly. They live in
 * the case_notes table, structurally separate from contact_message_replies
 * (outward-facing correspondence), so no code path can accidentally send a
 * note as an email.
 */
export async function addCaseNote(input: {
  caseId: number;
  body: string;
  adminActorId?: string;
}): Promise<CaseNoteRow> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO case_notes (case_id, body, admin_actor_id)
    VALUES (${input.caseId}, ${input.body}, ${input.adminActorId || null})
    RETURNING *
  `;
  return mapNote(rows[0]);
}

/** All notes for a case, oldest first. */
export async function getCaseNotes(caseId: number): Promise<CaseNoteRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM case_notes
    WHERE case_id = ${caseId}
    ORDER BY created_at ASC, id ASC
  `;
  return rows.map(mapNote);
}

/** Notes for several cases at once, grouped by case id. */
export async function getCaseNotesForCases(
  caseIds: number[],
): Promise<Map<number, CaseNoteRow[]>> {
  const grouped = new Map<number, CaseNoteRow[]>();
  if (caseIds.length === 0) return grouped;
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM case_notes
    WHERE case_id = ANY(${caseIds})
    ORDER BY created_at ASC, id ASC
  `;
  for (const raw of rows) {
    const note = mapNote(raw);
    const list = grouped.get(note.caseId) ?? [];
    list.push(note);
    grouped.set(note.caseId, list);
  }
  return grouped;
}

/** Lightweight note counts for a set of cases (for list badges). */
export async function getCaseNoteCounts(
  caseIds: number[],
): Promise<Map<number, number>> {
  const counts = new Map<number, number>();
  if (caseIds.length === 0) return counts;
  const sql = getSql();
  const rows = await sql`
    SELECT case_id, COUNT(*)::int AS note_count
    FROM case_notes
    WHERE case_id = ANY(${caseIds})
    GROUP BY case_id
  `;
  for (const row of rows) {
    counts.set(Number(row.case_id), Number(row.note_count));
  }
  return counts;
}

// ---------------------------------------------------------------------------
// First-response stamp (SLA foundation)
// ---------------------------------------------------------------------------

/**
 * Records the first outbound response timestamp, if not already set.
 * Called by the reply route after a reply is successfully sent, so the
 * received → first-response interval can be computed for SLA reporting.
 */
export async function stampFirstResponseIfFirst(id: number): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE contact_messages
    SET first_response_at = COALESCE(first_response_at, CURRENT_TIMESTAMP),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id} AND first_response_at IS NULL
  `;
}

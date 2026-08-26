import { neon } from "@neondatabase/serverless";
import type {
  CaseActionRow,
  CaseDecisionRow,
  CaseCommunicationRow,
  CaseActionStatus,
  CaseDecision,
  CommunicationChannel,
  CommunicationDirection,
  CaseReferralRow,
  CaseReferralStatus,
  CaseReferralOutcome,
} from "@/lib/organisation-types";

/**
 * Case action history, decision records, and communication logging.
 *
 * These tables preserve the full operational history of a case — not just
 * the current "next action" — so Vantage staff can see what happened over
 * time without searching email or WhatsApp.
 */

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }
  return neon(url);
}

// ---------------------------------------------------------------------------
// Mapping
// ---------------------------------------------------------------------------

function mapCaseAction(row: Record<string, unknown>): CaseActionRow {
  return {
    id: Number(row.id),
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
    caseId: Number(row.case_id),
    title: row.title as string,
    ownerId: (row.owner_id as string) ?? null,
    dueAt: row.due_at ? new Date(row.due_at as string) : null,
    completedAt: row.completed_at
      ? new Date(row.completed_at as string)
      : null,
    status: (row.status as CaseActionStatus) ?? "open",
    note: (row.note as string) ?? null,
  };
}

function mapCaseDecision(row: Record<string, unknown>): CaseDecisionRow {
  return {
    id: Number(row.id),
    createdAt: new Date(row.created_at as string),
    caseId: Number(row.case_id),
    decision: row.decision as CaseDecision,
    decisionDate: new Date(row.decision_date as string),
    decisionMakerId: (row.decision_maker_id as string) ?? null,
    rationale: (row.rationale as string) ?? null,
    conditions: (row.conditions as string) ?? null,
  };
}

function mapCaseCommunication(
  row: Record<string, unknown>,
): CaseCommunicationRow {
  return {
    id: Number(row.id),
    createdAt: new Date(row.created_at as string),
    caseId: Number(row.case_id),
    direction: (row.direction as CommunicationDirection) ?? "inbound",
    channel: (row.channel as CommunicationChannel) ?? "other",
    occurredAt: new Date(row.occurred_at as string),
    summary: row.summary as string,
    staffMember: (row.staff_member as string) ?? null,
    isInternal: Boolean(row.is_internal),
  };
}

// ---------------------------------------------------------------------------
// Case actions (history)
// ---------------------------------------------------------------------------

export interface CaseActionInput {
  caseId: number;
  title: string;
  ownerId?: string | null;
  dueAt?: Date | null;
  note?: string | null;
  adminActorId?: string | null;
}

export async function addCaseAction(
  input: CaseActionInput,
): Promise<CaseActionRow> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO case_actions (
      case_id, title, owner_id, due_at, note, admin_actor_id
    ) VALUES (
      ${input.caseId},
      ${input.title},
      ${input.ownerId ?? null},
      ${input.dueAt ?? null},
      ${input.note ?? null},
      ${input.adminActorId ?? null}
    )
    RETURNING *
  `;
  return mapCaseAction(rows[0]);
}

export async function getCaseActions(caseId: number): Promise<CaseActionRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM case_actions
    WHERE case_id = ${caseId}
    ORDER BY created_at DESC
  `;
  return rows.map(mapCaseAction);
}

export async function completeCaseAction(
  actionId: number,
  note?: string,
): Promise<CaseActionRow | null> {
  const sql = getSql();
  const rows = await sql`
    UPDATE case_actions SET
      status = 'completed',
      completed_at = CURRENT_TIMESTAMP,
      note = COALESCE(${note ?? null}, note),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${actionId} AND status = 'open'
    RETURNING *
  `;
  return rows.length > 0 ? mapCaseAction(rows[0]) : null;
}

export async function cancelCaseAction(
  actionId: number,
): Promise<CaseActionRow | null> {
  const sql = getSql();
  const rows = await sql`
    UPDATE case_actions SET
      status = 'cancelled',
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${actionId} AND status = 'open'
    RETURNING *
  `;
  return rows.length > 0 ? mapCaseAction(rows[0]) : null;
}

// ---------------------------------------------------------------------------
// Case decisions
// ---------------------------------------------------------------------------

export interface CaseDecisionInput {
  caseId: number;
  decision: CaseDecision;
  decisionMakerId?: string | null;
  rationale?: string | null;
  conditions?: string | null;
  adminActorId?: string | null;
}

export async function addCaseDecision(
  input: CaseDecisionInput,
): Promise<CaseDecisionRow> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO case_decisions (
      case_id, decision, decision_maker_id, rationale, conditions, admin_actor_id
    ) VALUES (
      ${input.caseId},
      ${input.decision},
      ${input.decisionMakerId ?? null},
      ${input.rationale ?? null},
      ${input.conditions ?? null},
      ${input.adminActorId ?? null}
    )
    RETURNING *
  `;
  return mapCaseDecision(rows[0]);
}

export async function getCaseDecisions(
  caseId: number,
): Promise<CaseDecisionRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM case_decisions
    WHERE case_id = ${caseId}
    ORDER BY decision_date DESC, created_at DESC
  `;
  return rows.map(mapCaseDecision);
}

export async function getLatestCaseDecision(
  caseId: number,
): Promise<CaseDecisionRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM case_decisions
    WHERE case_id = ${caseId}
    ORDER BY decision_date DESC, created_at DESC
    LIMIT 1
  `;
  return rows.length > 0 ? mapCaseDecision(rows[0]) : null;
}

// ---------------------------------------------------------------------------
// Case communications (manual logging)
// ---------------------------------------------------------------------------

export interface CaseCommunicationInput {
  caseId: number;
  direction: CommunicationDirection;
  channel: CommunicationChannel;
  occurredAt?: Date | null;
  summary: string;
  staffMember?: string | null;
  isInternal?: boolean;
  adminActorId?: string | null;
}

export async function addCaseCommunication(
  input: CaseCommunicationInput,
): Promise<CaseCommunicationRow> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO case_communications (
      case_id, direction, channel, occurred_at, summary, staff_member, is_internal, admin_actor_id
    ) VALUES (
      ${input.caseId},
      ${input.direction},
      ${input.channel},
      COALESCE(${input.occurredAt ?? null}, CURRENT_TIMESTAMP),
      ${input.summary},
      ${input.staffMember ?? null},
      ${input.isInternal ?? false},
      ${input.adminActorId ?? null}
    )
    RETURNING *
  `;
  return mapCaseCommunication(rows[0]);
}

export async function getCaseCommunications(
  caseId: number,
): Promise<CaseCommunicationRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM case_communications
    WHERE case_id = ${caseId}
    ORDER BY occurred_at DESC, created_at DESC
  `;
  return rows.map(mapCaseCommunication);
}

// ---------------------------------------------------------------------------
// SLA / response analytics
// ---------------------------------------------------------------------------

export interface CaseSlaData {
  caseId: number;
  receivedAt: Date;
  triagedAt: Date | null;
  firstResponseAt: Date | null;
  closedAt: Date | null;
  currentWaitingParty: "vantage" | "external" | "unknown" | null;
  totalTimeOpenMs: number | null;
  responseTimeMs: number | null;
  isOverdue: boolean;
}

export async function getCaseSlaData(caseId: number): Promise<CaseSlaData | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      id,
      created_at,
      triaged_at,
      first_response_at,
      closed_at,
      workflow_status,
      next_action_due_at,
      CASE
        WHEN workflow_status IN ('awaiting_vantage', 'decision_required') THEN 'vantage'
        WHEN workflow_status IN ('awaiting_external', 'information_requested'::text)
          OR (workflow_status = 'triage' AND first_response_at IS NOT NULL)
        THEN 'external'
        WHEN workflow_status IN ('accepted', 'completed', 'archived', 'declined')
        THEN NULL
        ELSE NULL
      END AS current_waiting_party
    FROM contact_messages
    WHERE id = ${caseId} AND deleted_at IS NULL
  `;
  if (rows.length === 0) return null;
  const row = rows[0];
  const receivedAt = new Date(row.created_at as string);
  const triagedAt = row.triaged_at ? new Date(row.triaged_at as string) : null;
  const firstResponseAt = row.first_response_at
    ? new Date(row.first_response_at as string)
    : null;
  const closedAt = row.closed_at ? new Date(row.closed_at as string) : null;
  const waitingParty = (row.current_waiting_party as string) ?? null;

  const totalTimeOpenMs = closedAt
    ? closedAt.getTime() - receivedAt.getTime()
    : null;
  const responseTimeMs = firstResponseAt
    ? firstResponseAt.getTime() - receivedAt.getTime()
    : null;
  const isOverdue =
    row.next_action_due_at != null &&
    new Date(row.next_action_due_at as string).getTime() <
      new Date().getTime() &&
    !["accepted", "completed", "archived"].includes(
      row.workflow_status as string,
    );

  return {
    caseId: Number(row.id),
    receivedAt,
    triagedAt,
    firstResponseAt,
    closedAt,
    currentWaitingParty:
      (waitingParty as CaseSlaData["currentWaitingParty"]) ?? null,
    totalTimeOpenMs,
    responseTimeMs,
    isOverdue,
  };
}

export interface SlaSummary {
  medianFirstResponseMs: number | null;
  averageFirstResponseMs: number | null;
  untriagedCount: number;
  overdueCount: number;
  awaitingVantageCount: number;
  awaitingExternalCount: number;
  respondedCount: number;
  withinTargetCount: number;
  sampleSize: number;
  periodLabel: string;
}

export type SlaPeriod = "30d" | "90d" | "all";

/**
 * Target first-response time: 2 business days expressed in milliseconds.
 * This is a configurable operational target, not a hard SLA contract.
 * Cases responded to within this window count as "within target".
 */
const SLA_TARGET_MS = 2 * 24 * 60 * 60 * 1000;

export async function getSlaSummary(
  period: SlaPeriod = "90d",
): Promise<SlaSummary> {
  const sql = getSql();
  const intervalClause =
    period === "30d"
      ? sql`CURRENT_DATE - INTERVAL '30 days'`
      : period === "90d"
        ? sql`CURRENT_DATE - INTERVAL '90 days'`
        : sql`TIMESTAMP '-infinity'`;

  const periodLabel =
    period === "30d" ? "Last 30 days" : period === "90d" ? "Last 90 days" : "All time";

  const rows = await sql`
    SELECT
      COUNT(*) FILTER (WHERE first_response_at IS NOT NULL)::int AS responded,
      COUNT(*) FILTER (
        WHERE first_response_at IS NOT NULL
          AND EXTRACT(EPOCH FROM (first_response_at - created_at)) * 1000 <= ${SLA_TARGET_MS}
      )::int AS within_target,
      COUNT(*) FILTER (WHERE workflow_status = 'new')::int AS untriaged,
      COUNT(*) FILTER (
        WHERE next_action_due_at IS NOT NULL
          AND next_action_due_at < CURRENT_DATE
          AND workflow_status NOT IN ('accepted','completed','archived')
      )::int AS overdue,
      COUNT(*) FILTER (WHERE workflow_status = 'awaiting_vantage')::int AS awaiting_vantage,
      COUNT(*) FILTER (WHERE workflow_status = 'awaiting_external')::int AS awaiting_external,
      COUNT(*)::int AS total,
      PERCENTILE_CONT(0.5) WITHIN GROUP (
        ORDER BY EXTRACT(EPOCH FROM (first_response_at - created_at)) * 1000
      ) AS median_response_ms,
      AVG(EXTRACT(EPOCH FROM (first_response_at - created_at)) * 1000) AS avg_response_ms
    FROM contact_messages
    WHERE deleted_at IS NULL
      AND created_at > ${intervalClause}
  `;
  const row = rows[0];
  return {
    medianFirstResponseMs:
      row.median_response_ms != null
        ? Number(row.median_response_ms)
        : null,
    averageFirstResponseMs:
      row.avg_response_ms != null ? Number(row.avg_response_ms) : null,
    untriagedCount: (row.untriaged as number) ?? 0,
    overdueCount: (row.overdue as number) ?? 0,
    awaitingVantageCount: (row.awaiting_vantage as number) ?? 0,
    awaitingExternalCount: (row.awaiting_external as number) ?? 0,
    respondedCount: (row.responded as number) ?? 0,
    withinTargetCount: (row.within_target as number) ?? 0,
    sampleSize: (row.total as number) ?? 0,
    periodLabel,
  };
}

// ---------------------------------------------------------------------------
// SLA breakdown by case type
// ---------------------------------------------------------------------------

export interface SlaByCaseTypeRow {
  caseType: string | null;
  caseCount: number;
  respondedCount: number;
  medianFirstResponseMs: number | null;
  withinTargetCount: number;
  withinTargetPercent: number | null;
}

export async function getSlaByCaseType(
  period: SlaPeriod = "90d",
): Promise<SlaByCaseTypeRow[]> {
  const sql = getSql();
  const intervalClause =
    period === "30d"
      ? sql`CURRENT_DATE - INTERVAL '30 days'`
      : period === "90d"
        ? sql`CURRENT_DATE - INTERVAL '90 days'`
        : sql`TIMESTAMP '-infinity'`;

  const rows = await sql`
    SELECT
      case_type,
      COUNT(*)::int AS case_count,
      COUNT(*) FILTER (WHERE first_response_at IS NOT NULL)::int AS responded,
      PERCENTILE_CONT(0.5) WITHIN GROUP (
        ORDER BY EXTRACT(EPOCH FROM (first_response_at - created_at)) * 1000
      ) AS median_response_ms,
      COUNT(*) FILTER (
        WHERE first_response_at IS NOT NULL
          AND EXTRACT(EPOCH FROM (first_response_at - created_at)) * 1000 <= ${SLA_TARGET_MS}
      )::int AS within_target
    FROM contact_messages
    WHERE deleted_at IS NULL
      AND created_at > ${intervalClause}
    GROUP BY case_type
    ORDER BY case_count DESC
  `;
  return rows.map((row) => {
    const responded = (row.responded as number) ?? 0;
    const withinTarget = (row.within_target as number) ?? 0;
    return {
      caseType: (row.case_type as string) ?? null,
      caseCount: (row.case_count as number) ?? 0,
      respondedCount: responded,
      medianFirstResponseMs:
        row.median_response_ms != null
          ? Number(row.median_response_ms)
          : null,
      withinTargetCount: withinTarget,
      withinTargetPercent:
        responded > 0 ? Math.round((withinTarget / responded) * 100) : null,
    };
  });
}

// ---------------------------------------------------------------------------
// Referral follow-ups due
// ---------------------------------------------------------------------------

export interface ReferralFollowup {
  caseId: number;
  caseName: string;
  referralOrg: string;
  referralFollowupDate: Date;
  referralOutcome: string | null;
}

export async function getReferralFollowupsDue(
  limit = 10,
): Promise<ReferralFollowup[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, name, referral_org, referral_followup_date, referral_outcome
    FROM contact_messages
    WHERE deleted_at IS NULL
      AND referral_followup_date IS NOT NULL
      AND referral_followup_date <= CURRENT_DATE + INTERVAL '7 days'
      AND (referral_outcome IS NULL OR referral_outcome IN ('applied', 'unknown'))
      AND workflow_status NOT IN ('completed', 'archived')
    ORDER BY referral_followup_date ASC
    LIMIT ${limit}
  `;
  return rows.map((row) => ({
    caseId: Number(row.id),
    caseName: row.name as string,
    referralOrg: row.referral_org as string,
    referralFollowupDate: new Date(row.referral_followup_date as string),
    referralOutcome: (row.referral_outcome as string) ?? null,
  }));
}

// ---------------------------------------------------------------------------
// Stamp triaged_at when workflow_status moves from 'new' to 'triage'
// ---------------------------------------------------------------------------

export async function stampTriagedIfFirst(id: number): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE contact_messages
    SET triaged_at = COALESCE(triaged_at, CURRENT_TIMESTAMP),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id} AND triaged_at IS NULL
  `;
}

// ---------------------------------------------------------------------------
// Case referrals — historical referral records
// ---------------------------------------------------------------------------

function mapCaseReferral(row: Record<string, unknown>): CaseReferralRow {
  return {
    id: Number(row.id),
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
    caseId: Number(row.case_id),
    organisationId: row.organisation_id ? Number(row.organisation_id) : null,
    opportunityName: row.opportunity_name as string,
    referredToName: row.referred_to_name as string,
    description: (row.description as string) ?? null,
    urlReference: (row.url_reference as string) ?? null,
    referredBy: (row.referred_by as string) ?? null,
    referredAt: new Date(row.referred_at as string),
    followUpAt: row.follow_up_at ? new Date(row.follow_up_at as string) : null,
    status: (row.status as CaseReferralStatus) ?? "draft",
    outcome: (row.outcome as CaseReferralOutcome) ?? null,
    outcomeAt: row.outcome_at ? new Date(row.outcome_at as string) : null,
    notes: (row.notes as string) ?? null,
  };
}

export interface CaseReferralInput {
  caseId: number;
  organisationId?: number | null;
  opportunityName: string;
  referredToName: string;
  description?: string | null;
  urlReference?: string | null;
  referredBy?: string | null;
  referredAt?: Date | null;
  followUpAt?: Date | null;
  status?: CaseReferralStatus;
  notes?: string | null;
  adminActorId?: string | null;
}

export async function addCaseReferral(
  input: CaseReferralInput,
): Promise<CaseReferralRow> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO case_referrals (
      case_id, organisation_id, opportunity_name, referred_to_name,
      description, url_reference, referred_by, referred_at, follow_up_at,
      status, notes, admin_actor_id
    ) VALUES (
      ${input.caseId},
      ${input.organisationId ?? null},
      ${input.opportunityName},
      ${input.referredToName},
      ${input.description ?? null},
      ${input.urlReference ?? null},
      ${input.referredBy ?? null},
      ${input.referredAt ?? null}::date,
      ${input.followUpAt ?? null}::date,
      ${input.status ?? "draft"},
      ${input.notes ?? null},
      ${input.adminActorId ?? null}
    )
    RETURNING *
  `;
  return mapCaseReferral(rows[0]);
}

export async function getCaseReferrals(
  caseId: number,
): Promise<CaseReferralRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM case_referrals
    WHERE case_id = ${caseId}
    ORDER BY referred_at DESC, created_at DESC
  `;
  return rows.map(mapCaseReferral);
}

export async function updateCaseReferral(
  referralId: number,
  input: Partial<CaseReferralInput>,
): Promise<CaseReferralRow | null> {
  const sql = getSql();
  const rows = await sql`
    UPDATE case_referrals SET
      organisation_id = COALESCE(${input.organisationId ?? null}, organisation_id),
      opportunity_name = COALESCE(${input.opportunityName ?? null}, opportunity_name),
      referred_to_name = COALESCE(${input.referredToName ?? null}, referred_to_name),
      description = COALESCE(${input.description ?? null}, description),
      url_reference = COALESCE(${input.urlReference ?? null}, url_reference),
      referred_by = COALESCE(${input.referredBy ?? null}, referred_by),
      referred_at = COALESCE(${input.referredAt ?? null}::date, referred_at),
      follow_up_at = COALESCE(${input.followUpAt ?? null}::date, follow_up_at),
      status = COALESCE(${input.status ?? null}, status),
      notes = COALESCE(${input.notes ?? null}, notes),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${referralId}
    RETURNING *
  `;
  return rows.length > 0 ? mapCaseReferral(rows[0]) : null;
}

export async function setCaseReferralOutcome(
  referralId: number,
  outcome: CaseReferralOutcome,
  notes?: string,
): Promise<CaseReferralRow | null> {
  const sql = getSql();
  const rows = await sql`
    UPDATE case_referrals SET
      outcome = ${outcome},
      outcome_at = CURRENT_DATE,
      status = 'closed',
      notes = COALESCE(${notes ?? null}, notes),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${referralId}
    RETURNING *
  `;
  return rows.length > 0 ? mapCaseReferral(rows[0]) : null;
}

// ---------------------------------------------------------------------------
// Referral follow-ups — from the dedicated case_referrals table
// ---------------------------------------------------------------------------

export interface CaseReferralFollowup {
  referralId: number;
  caseId: number;
  caseName: string;
  opportunityName: string;
  referredToName: string;
  followUpAt: Date;
  status: CaseReferralStatus;
  outcome: CaseReferralOutcome | null;
}

export async function getCaseReferralFollowupsDue(
  limit = 20,
): Promise<CaseReferralFollowup[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      cr.id AS referral_id,
      cr.case_id,
      cm.name AS case_name,
      cr.opportunity_name,
      cr.referred_to_name,
      cr.follow_up_at,
      cr.status,
      cr.outcome
    FROM case_referrals cr
    JOIN contact_messages cm ON cm.id = cr.case_id
    WHERE cr.follow_up_at IS NOT NULL
      AND cr.follow_up_at <= CURRENT_DATE + INTERVAL '7 days'
      AND cr.status NOT IN ('closed')
      AND (cr.outcome IS NULL OR cr.outcome IN ('applied', 'unknown'))
      AND cm.deleted_at IS NULL
    ORDER BY cr.follow_up_at ASC
    LIMIT ${limit}
  `;
  return rows.map((row) => ({
    referralId: Number(row.referral_id),
    caseId: Number(row.case_id),
    caseName: row.case_name as string,
    opportunityName: row.opportunity_name as string,
    referredToName: row.referred_to_name as string,
    followUpAt: new Date(row.follow_up_at as string),
    status: (row.status as CaseReferralStatus) ?? "sent",
    outcome: (row.outcome as CaseReferralOutcome) ?? null,
  }));
}

// ---------------------------------------------------------------------------
// Referral analytics summary
// ---------------------------------------------------------------------------

export interface ReferralAnalyticsSummary {
  totalReferrals: number;
  appliedCount: number;
  acceptedCount: number;
  rejectedCount: number;
  notEligibleCount: number;
  notAppliedCount: number;
  unableToContactCount: number;
  unknownOutcomeCount: number;
  closedCount: number;
  openCount: number;
}

export async function getReferralAnalyticsSummary(): Promise<ReferralAnalyticsSummary> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE outcome = 'applied')::int AS applied,
      COUNT(*) FILTER (WHERE outcome = 'accepted')::int AS accepted,
      COUNT(*) FILTER (WHERE outcome = 'rejected')::int AS rejected,
      COUNT(*) FILTER (WHERE outcome = 'not_eligible')::int AS not_eligible,
      COUNT(*) FILTER (WHERE outcome = 'not_applied')::int AS not_applied,
      COUNT(*) FILTER (WHERE outcome = 'unable_to_contact')::int AS unable_to_contact,
      COUNT(*) FILTER (WHERE outcome = 'unknown')::int AS unknown_outcome,
      COUNT(*) FILTER (WHERE status = 'closed')::int AS closed,
      COUNT(*) FILTER (WHERE status != 'closed')::int AS open
    FROM case_referrals
  `;
  const row = rows[0];
  return {
    totalReferrals: (row.total as number) ?? 0,
    appliedCount: (row.applied as number) ?? 0,
    acceptedCount: (row.accepted as number) ?? 0,
    rejectedCount: (row.rejected as number) ?? 0,
    notEligibleCount: (row.not_eligible as number) ?? 0,
    notAppliedCount: (row.not_applied as number) ?? 0,
    unableToContactCount: (row.unable_to_contact as number) ?? 0,
    unknownOutcomeCount: (row.unknown_outcome as number) ?? 0,
    closedCount: (row.closed as number) ?? 0,
    openCount: (row.open as number) ?? 0,
  };
}

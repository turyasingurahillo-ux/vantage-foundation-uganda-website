import { neon } from "@neondatabase/serverless";
import type { AuditLogEntry } from "./audit";
import { getInboxCounts } from "./contact";
import { getCaseCounts, getUpcomingActions } from "./cases";

/**
 * Efficient count queries and recent-activity fetches for the Vantage HQ
 * dashboard. These avoid loading full rows of donor PII just to render
 * badges and attention counts.
 */

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }
  return neon(url);
}

export interface DonationCounts {
  pending: number;
  verified: number;
  rejected: number;
  all: number;
}

/**
 * Per-status donation counts in a single query.
 * Excludes soft-deleted rows.
 */
export async function getDonationCounts(): Promise<DonationCounts> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
      COUNT(*) FILTER (WHERE status = 'verified')::int AS verified,
      COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected,
      COUNT(*)::int AS all
    FROM donations
    WHERE deleted_at IS NULL
  `;
  const r = rows[0];
  return {
    pending: Number(r.pending),
    verified: Number(r.verified),
    rejected: Number(r.rejected),
    all: Number(r.all),
  };
}

export interface DashboardAttention {
  pendingDonations: number;
  newMessages: number;
  awaitingResponseMessages: number;
  draftStories: number;
  mediaPendingConsent: number;
  // Case-management pipeline attention counts
  untriagedCases: number;
  awaitingVantageCases: number;
  overdueCases: number;
  safeguardingCases: number;
  highPriorityCases: number;
  activeCases: number;
}

export interface DashboardUpcomingActions {
  overdue: Awaited<ReturnType<typeof getUpcomingActions>>;
  today: Awaited<ReturnType<typeof getUpcomingActions>>;
  upcoming: Awaited<ReturnType<typeof getUpcomingActions>>;
}

/**
 * Fetches all attention counts for the dashboard in parallel.
 * Each source is wrapped so a missing table or DB error yields 0
 * (the dashboard shows a calm resolved state, not a crash).
 */
export async function getDashboardAttention(): Promise<{
  attention: DashboardAttention;
  sources: Record<string, boolean>;
}> {
  const sources: Record<string, boolean> = {
    donations: true,
    contactMessages: true,
    stories: true,
    media: true,
    cases: true,
  };

  const attention: DashboardAttention = {
    pendingDonations: 0,
    newMessages: 0,
    awaitingResponseMessages: 0,
    draftStories: 0,
    mediaPendingConsent: 0,
    untriagedCases: 0,
    awaitingVantageCases: 0,
    overdueCases: 0,
    safeguardingCases: 0,
    highPriorityCases: 0,
    activeCases: 0,
  };

  const [
    donationsResult,
    contactResult,
    storiesResult,
    mediaResult,
    caseCountsResult,
  ] = await Promise.allSettled([
    getDonationCounts(),
    getInboxCounts(),
    getDraftStoryCount(),
    getMediaPendingConsentCount(),
    getCaseCounts(),
  ]);

  if (donationsResult.status === "fulfilled") {
    attention.pendingDonations = donationsResult.value.pending;
  } else {
    sources.donations = false;
  }

  if (contactResult.status === "fulfilled") {
    attention.newMessages = contactResult.value.new;
    attention.awaitingResponseMessages = contactResult.value.awaiting_response;
  } else {
    sources.contactMessages = false;
  }

  if (storiesResult.status === "fulfilled") {
    attention.draftStories = storiesResult.value;
  } else {
    sources.stories = false;
  }

  if (mediaResult.status === "fulfilled") {
    attention.mediaPendingConsent = mediaResult.value;
  } else {
    sources.media = false;
  }

  if (caseCountsResult.status === "fulfilled") {
    const cc = caseCountsResult.value;
    attention.untriagedCases = cc.new + cc.triage;
    attention.awaitingVantageCases = cc.awaiting_vantage;
    attention.overdueCases = cc.overdue;
    attention.safeguardingCases = cc.safeguarding;
    attention.highPriorityCases = cc.high_priority;
    attention.activeCases = cc.active;
  } else {
    sources.cases = false;
  }

  return { attention, sources };
}

/**
 * Fetches upcoming/overdue actions for the dashboard attention centre.
 * Each bucket is fetched independently so a failure in one doesn't block
 * the others.
 */
export async function getDashboardUpcomingActions(): Promise<{
  actions: DashboardUpcomingActions;
  available: boolean;
}> {
  const [overdueResult, todayResult, upcomingResult] = await Promise.allSettled([
    getUpcomingActions("overdue", 10),
    getUpcomingActions("today", 10),
    getUpcomingActions("upcoming", 10),
  ]);

  return {
    actions: {
      overdue: overdueResult.status === "fulfilled" ? overdueResult.value : [],
      today: todayResult.status === "fulfilled" ? todayResult.value : [],
      upcoming: upcomingResult.status === "fulfilled" ? upcomingResult.value : [],
    },
    available:
      overdueResult.status === "fulfilled" ||
      todayResult.status === "fulfilled" ||
      upcomingResult.status === "fulfilled",
  };
}

async function getDraftStoryCount(): Promise<number> {
  const sql = getSql();
  const rows = await sql`
    SELECT COUNT(*)::int AS count FROM stories
    WHERE deleted_at IS NULL AND published = false
  `;
  return Number(rows[0].count);
}

async function getMediaPendingConsentCount(): Promise<number> {
  const sql = getSql();
  const rows = await sql`
    SELECT COUNT(*)::int AS count FROM media_objects
    WHERE deleted_at IS NULL AND consent = 'pending'
  `;
  return Number(rows[0].count);
}

/**
 * Fetches recent audit log entries for the dashboard activity feed.
 * Returns up to `limit` entries, newest first.
 */
export async function getRecentActivity(
  limit = 10,
): Promise<AuditLogEntry[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM audit_log
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows.map((row) => ({
    id: row.id as number,
    createdAt: row.created_at as Date,
    actorId: row.actor_id as string,
    actorKind: row.actor_kind as "admin" | "bootstrap" | "system",
    action: row.action as string,
    resourceType: row.resource_type as string,
    resourceId: (row.resource_id as string) ?? null,
    before: row.before ?? null,
    after: row.after ?? null,
    ip: (row.ip as string) ?? null,
  }));
}

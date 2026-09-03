import type { ContactCategory } from "@/lib/contact-categories";
import { getSql } from "@/lib/db/client";

/**
 * Persistence for public contact-form submissions.
 *
 * Messages are written here BEFORE the notification email is attempted, so a
 * transient SMTP outage cannot silently lose an inquiry from a donor,
 * grantmaker, researcher or partner. If the database is unavailable the form
 * still works — the caller treats a failure here as non-fatal and falls back
 * to email-only delivery.
 */

export interface ContactMessageInput {
  name: string;
  email: string;
  phone?: string;
  organisation?: string;
  category: ContactCategory;
  message: string;
}

/** True when a database is configured at all. */
export function isContactStoreConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** Stores a submission and returns its id. */
export async function createContactMessage(
  input: ContactMessageInput,
): Promise<number> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO contact_messages (
      name, email, phone, organisation, category, message
    ) VALUES (
      ${input.name}, ${input.email}, ${input.phone || null},
      ${input.organisation || null}, ${input.category}, ${input.message}
    )
    RETURNING id
  `;
  return Number(rows[0].id);
}

/**
 * Where a conversation stands on being answered.
 *
 * - `new`               nobody has actioned it yet (insert default)
 * - `awaiting_response` Vantage owes a reply: set explicitly by an admin, and
 *                       automatically when a reply attempt fails, since the
 *                       enquirer is still waiting. Phase 2 inbound replies
 *                       would also land here. Shown to admins as "Needs
 *                       reply"; the stored value is unchanged so no historical
 *                       row has to be rewritten.
 * - `replied`           at least one reply reached `sent` at the provider
 *
 * Archiving is deliberately NOT one of these. It used to be, which meant
 * archiving a conversation overwrote how it stood — a replied thread came back
 * from the archive as `new`. Archive state now lives entirely in
 * `archived_at`, orthogonal to this column, so the two can be changed
 * independently and neither destroys the other.
 */
export type ContactMessageStatus = "new" | "awaiting_response" | "replied";

export function isContactMessageStatus(
  value: unknown,
): value is ContactMessageStatus {
  return value === "new" || value === "awaiting_response" || value === "replied";
}

export interface ContactMessageRow extends ContactMessageInput {
  id: number;
  createdAt: Date;
  /** Whether the INTERNAL notification reached the team inbox — not a reply. */
  emailSent: boolean;
  status: ContactMessageStatus;
  lastRepliedAt?: Date;
  archivedAt?: Date;
  /** Latest of submission and any delivered reply. Drives inbox ordering. */
  lastActivityAt: Date;
}

/** Card-level correspondence facts, without any reply bodies. */
export interface ReplySummary {
  sentCount: number;
  failedCount: number;
  pendingCount: number;
  lastSentAt?: Date;
}

export interface ContactMessageListRow extends ContactMessageRow {
  summary: ReplySummary;
}

function toDate(value: unknown): Date {
  return value instanceof Date ? value : new Date(value as string);
}

function optionalDate(value: unknown): Date | undefined {
  return value ? toDate(value) : undefined;
}

function mapMessage(row: Record<string, unknown>): ContactMessageRow {
  const createdAt = toDate(row.created_at);
  return {
    id: Number(row.id),
    createdAt,
    name: row.name as string,
    email: row.email as string,
    phone: (row.phone as string) ?? undefined,
    organisation: (row.organisation as string) ?? undefined,
    category: row.category as ContactCategory,
    message: row.message as string,
    emailSent: Boolean(row.email_sent),
    status: (row.status as ContactMessageStatus) ?? "new",
    lastRepliedAt: optionalDate(row.last_replied_at),
    archivedAt: optionalDate(row.archived_at),
    lastActivityAt: row.last_activity_at
      ? toDate(row.last_activity_at)
      : createdAt,
  };
}

function mapListRow(row: Record<string, unknown>): ContactMessageListRow {
  return {
    ...mapMessage(row),
    summary: {
      sentCount: Number(row.sent_count ?? 0),
      failedCount: Number(row.failed_count ?? 0),
      pendingCount: Number(row.pending_count ?? 0),
      lastSentAt: optionalDate(row.last_sent_at),
    },
  };
}

/** Returns one submission by id, or null. */
export async function getContactMessageById(
  id: number,
): Promise<ContactMessageRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, created_at, name, email, phone, organisation, category,
           message, email_sent, status, last_replied_at, archived_at,
           last_activity_at
    FROM contact_messages
    WHERE id = ${id} AND deleted_at IS NULL
  `;
  if (rows.length === 0) return null;
  return mapMessage(rows[0]);
}

/**
 * Returns recent submissions, newest first.
 *
 * This is the safety net for the case where SMTP is misconfigured or down:
 * without it, messages would be written to the table and never read.
 */
export async function getContactMessages(
  limit = 200,
): Promise<ContactMessageRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, created_at, name, email, phone, organisation, category,
           message, email_sent, status, last_replied_at, archived_at,
           last_activity_at
    FROM contact_messages
    WHERE deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows.map(mapMessage);
}

/**
 * Inbox tabs.
 *
 * The three workflow values and "all" address the ACTIVE inbox — archived
 * conversations are excluded from every one of them. "archived" is the only
 * view that returns them, so nothing an administrator has deliberately filed
 * away can reappear in a working list without being asked for.
 */
export type InboxFilter = ContactMessageStatus | "archived" | "all";

export function isInboxFilter(value: unknown): value is InboxFilter {
  return (
    value === "new" ||
    value === "awaiting_response" ||
    value === "replied" ||
    value === "archived" ||
    value === "all"
  );
}

/** Conversations per page. */
export const INBOX_PAGE_SIZE = 25;

/**
 * The inbox predicate, shared verbatim between the count and the page query so
 * the two can never disagree about what is on page 3.
 *
 * Contains no interpolation of any kind — only numbered placeholders, which
 * the driver binds:
 *   $1 archived wanted (boolean)   $2 status or NULL
 *   $3 category or NULL            $4 ILIKE pattern or NULL
 */
const INBOX_WHERE = `
  m.deleted_at IS NULL
  AND (
    CASE WHEN $1::boolean
      THEN m.archived_at IS NOT NULL
      ELSE m.archived_at IS NULL
    END
  )
  AND ($2::text IS NULL OR m.status = $2::text)
  AND ($3::text IS NULL OR m.category = $3::text)
  AND (
    $4::text IS NULL
    OR m.name ILIKE $4::text
    OR m.email ILIKE $4::text
    OR m.category ILIKE $4::text
    OR m.message ILIKE $4::text
    OR COALESCE(m.organisation, '') ILIKE $4::text
    OR EXISTS (
      SELECT 1 FROM contact_message_replies r
      WHERE r.message_id = m.id AND r.body ILIKE $4::text
    )
  )
`;

export interface InboxPage {
  messages: ContactMessageListRow[];
  /** Conversations matching the filter and search, across every page. */
  total: number;
  page: number;
  pageCount: number;
}

/**
 * One page of the inbox.
 *
 * Deliberately a single round trip that returns only what a collapsed card
 * draws. Two things it does NOT do:
 *
 *  - it does not load reply bodies. The previous implementation fetched the
 *    entire correspondence history of every conversation in the result set in
 *    order to render "3 replies" on each card, which meant reading every
 *    personal message Vantage has ever sent just to display a number. The
 *    LATERAL below counts them instead, and the bodies are read only for the
 *    conversation actually opened.
 *  - it does not run one aggregate per candidate row. The counts are attached
 *    after LIMIT, inside a CTE, so exactly one page's worth of aggregates is
 *    computed however large the table grows.
 *
 * Search matches the things an administrator would actually recognise a
 * conversation by, including text that exists only in a reply. The reply match
 * is an EXISTS, not a join, so a conversation with three matching replies is
 * still returned once.
 *
 * Ordering is by conversation activity, not submission date: a thread answered
 * this morning belongs above one submitted this morning and ignored.
 *
 * Every value below is a bound parameter. Nothing the administrator types
 * becomes SQL.
 */
export async function getInboxPage(options: {
  filter?: InboxFilter;
  query?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}): Promise<InboxPage> {
  const sql = getSql();
  const filter = options.filter ?? "new";
  const pageSize = options.pageSize ?? INBOX_PAGE_SIZE;
  const term = options.query?.trim();
  const like = term ? `%${term}%` : null;
  const category = options.category || null;

  // Archive predicate, kept separate from the workflow predicate so the two
  // cannot interfere: `archived` means "filed away, whatever it owed",
  // everything else means "active, with this status".
  const wantArchived = filter === "archived";
  const statusFilter = filter === "archived" || filter === "all" ? null : filter;
  const params = [wantArchived, statusFilter, category, like];

  const countRows = await sql.query(
    `SELECT COUNT(*)::int AS total FROM contact_messages m WHERE ${INBOX_WHERE}`,
    params,
  );
  const total = Number(countRows[0]?.total ?? 0);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  // Clamp rather than trust: a stale bookmark to page 40 of a list that has
  // shrunk to three pages shows the last page, not an empty one.
  const page = Math.min(Math.max(1, Math.floor(options.page ?? 1)), pageCount);
  const offset = (page - 1) * pageSize;

  const rows = await sql.query(
    `WITH page AS (
       SELECT m.id, m.created_at, m.name, m.email, m.phone, m.organisation,
              m.category, m.message, m.email_sent, m.status, m.last_replied_at,
              m.archived_at, m.last_activity_at
       FROM contact_messages m
       WHERE ${INBOX_WHERE}
       ORDER BY m.last_activity_at DESC, m.id DESC
       LIMIT $5 OFFSET $6
     )
     SELECT page.*, s.sent_count, s.failed_count, s.pending_count, s.last_sent_at
     FROM page
     LEFT JOIN LATERAL (
       SELECT
         COUNT(*) FILTER (
           WHERE r.direction = 'outbound' AND r.send_status = 'sent'
         )::int AS sent_count,
         COUNT(*) FILTER (
           WHERE r.direction = 'outbound' AND r.send_status = 'failed'
         )::int AS failed_count,
         COUNT(*) FILTER (
           WHERE r.direction = 'outbound' AND r.send_status = 'pending'
         )::int AS pending_count,
         MAX(r.sent_at) AS last_sent_at
       FROM contact_message_replies r
       WHERE r.message_id = page.id
     ) s ON TRUE
     ORDER BY page.last_activity_at DESC, page.id DESC`,
    [...params, pageSize, offset],
  );

  return { messages: rows.map(mapListRow), total, page, pageCount };
}

/**
 * Per-tab counts for the inbox header.
 *
 * One pass over the table. The workflow tallies count ACTIVE conversations
 * only, matching what clicking the tab will show — a badge that promises
 * twelve and delivers nine is worse than no badge.
 */
export async function getInboxCounts(): Promise<Record<InboxFilter, number>> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      COUNT(*) FILTER (
        WHERE archived_at IS NULL AND status = 'new'
      )::int AS new,
      COUNT(*) FILTER (
        WHERE archived_at IS NULL AND status = 'awaiting_response'
      )::int AS awaiting_response,
      COUNT(*) FILTER (
        WHERE archived_at IS NULL AND status = 'replied'
      )::int AS replied,
      COUNT(*) FILTER (WHERE archived_at IS NOT NULL)::int AS archived,
      COUNT(*) FILTER (WHERE archived_at IS NULL)::int AS all
    FROM contact_messages
    WHERE deleted_at IS NULL
  `;
  const r = rows[0];
  return {
    new: Number(r.new),
    awaiting_response: Number(r.awaiting_response),
    replied: Number(r.replied),
    archived: Number(r.archived),
    all: Number(r.all),
  };
}

/**
 * Moves a conversation between response states.
 *
 * `replied` is deliberately NOT settable here — it is only ever reached via
 * markContactMessageReplied() once the provider has accepted a reply, so an
 * admin cannot mark a conversation answered without an email going out.
 *
 * Archive state is untouched: an archived conversation that is marked as
 * needing a reply stays archived until somebody unarchives it.
 */
export async function setContactMessageStatus(
  id: number,
  status: Exclude<ContactMessageStatus, "replied">,
): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE contact_messages
    SET status = ${status},
        handled_at = CASE
          WHEN ${status} = 'new' THEN NULL
          ELSE COALESCE(handled_at, CURRENT_TIMESTAMP)
        END
    WHERE id = ${id} AND deleted_at IS NULL
  `;
}

/**
 * Files a conversation away, or brings it back.
 *
 * Only `archived_at` moves. Whatever the conversation owed — or didn't — when
 * it was archived is exactly what it owes when it returns.
 */
export async function setContactMessageArchived(
  id: number,
  archived: boolean,
): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE contact_messages
    SET archived_at = ${archived ? "now()" : null}::timestamptz,
        handled_at = CASE
          WHEN ${archived}::boolean THEN COALESCE(handled_at, CURRENT_TIMESTAMP)
          ELSE handled_at
        END
    WHERE id = ${id} AND deleted_at IS NULL
  `;
}

/**
 * Called only after a reply has been accepted by the email provider.
 *
 * Archived conversations stay archived — answering one should not drag it back
 * into the active workflow — but they do become `replied`, because they were.
 */
export async function markContactMessageReplied(id: number): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE contact_messages
    SET status = 'replied',
        last_replied_at = CURRENT_TIMESTAMP,
        last_activity_at = CURRENT_TIMESTAMP,
        handled_at = COALESCE(handled_at, CURRENT_TIMESTAMP)
    WHERE id = ${id} AND deleted_at IS NULL
  `;
}

/**
 * How long an enquiry may sit unanswered before the dashboard calls it
 * overdue.
 *
 * A deliberate single number rather than an SLA engine: change it here and
 * every surface that reports overdue work follows. It is a prompt for a human,
 * not a promise made to anyone outside.
 */
export const CONTACT_RESPONSE_TARGET_HOURS = 24;

export interface ContactMessageCounts {
  unhandled: number;
  notEmailed: number;
  /** Unhandled for longer than CONTACT_RESPONSE_TARGET_HOURS. */
  overdue: number;
  /** Submission time of the longest-waiting unhandled enquiry. */
  oldestUnhandledAt?: Date;
}

/**
 * Counts active submissions nobody has answered yet, how many of those never
 * got a notification email out, and how long the oldest has been waiting.
 *
 * A count query rather than reusing getContactMessages() so the dashboard does
 * not pull rows of personal data just to render a badge.
 */
export async function getContactMessageCounts(): Promise<ContactMessageCounts> {
  const sql = getSql();
  const cutoff = `${CONTACT_RESPONSE_TARGET_HOURS} hours`;
  const rows = await sql`
    SELECT
      COUNT(*)::int AS unhandled,
      COUNT(*) FILTER (WHERE email_sent = false)::int AS not_emailed,
      COUNT(*) FILTER (
        WHERE created_at < CURRENT_TIMESTAMP - ${cutoff}::interval
      )::int AS overdue,
      MIN(created_at) AS oldest_unhandled_at
    FROM contact_messages
    WHERE deleted_at IS NULL
      AND archived_at IS NULL
      AND status IN ('new', 'awaiting_response')
  `;
  return {
    unhandled: Number(rows[0].unhandled),
    notEmailed: Number(rows[0].not_emailed),
    overdue: Number(rows[0].overdue),
    oldestUnhandledAt: optionalDate(rows[0].oldest_unhandled_at),
  };
}

/** Records whether the internal notification email was delivered. */
export async function markContactMessageEmailed(
  id: number,
  sent: boolean,
): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE contact_messages
    SET email_sent = ${sent}
    WHERE id = ${id}
  `;
}

import { neon } from "@neondatabase/serverless";
import type { ContactCategory } from "@/lib/contact-categories";

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

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }
  return neon(url);
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
 * Workflow state of a conversation.
 *
 * - `new`               nobody has actioned it yet (insert default)
 * - `awaiting_response` Vantage owes a reply: set explicitly by an admin, and
 *                       automatically when a reply attempt fails, since the
 *                       enquirer is still waiting. Phase 2 inbound replies
 *                       would also land here.
 * - `replied`           at least one reply reached `sent` at the provider
 * - `archived`          deliberately taken out of the active workflow
 */
export type ContactMessageStatus =
  | "new"
  | "awaiting_response"
  | "replied"
  | "archived";

export interface ContactMessageRow extends ContactMessageInput {
  id: number;
  createdAt: Date;
  /** Whether the INTERNAL notification reached the team inbox — not a reply. */
  emailSent: boolean;
  status: ContactMessageStatus;
  lastRepliedAt?: Date;
  archivedAt?: Date;
}

function mapMessage(row: Record<string, unknown>): ContactMessageRow {
  return {
    id: Number(row.id),
    createdAt: new Date(row.created_at as string),
    name: row.name as string,
    email: row.email as string,
    phone: (row.phone as string) ?? undefined,
    organisation: (row.organisation as string) ?? undefined,
    category: row.category as ContactCategory,
    message: row.message as string,
    emailSent: Boolean(row.email_sent),
    status: (row.status as ContactMessageStatus) ?? "new",
    lastRepliedAt: row.last_replied_at
      ? new Date(row.last_replied_at as string)
      : undefined,
    archivedAt: row.archived_at
      ? new Date(row.archived_at as string)
      : undefined,
  };
}

/** Returns one submission by id, or null. Used by the re-send action. */
export async function getContactMessageById(
  id: number,
): Promise<ContactMessageRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, created_at, name, email, phone, organisation, category,
           message, email_sent, status, last_replied_at, archived_at
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
           message, email_sent, status, last_replied_at, archived_at
    FROM contact_messages
    WHERE deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows.map(mapMessage);
}

/** Inbox tabs. "all" spans every status including archived. */
export type InboxFilter = ContactMessageStatus | "all";

/**
 * Bounded preview length for the inbox list.
 *
 * The list does not need the full message body — a short preview is enough
 * for an administrator to recognise a conversation. The full body is only
 * fetched for the selected conversation via getContactMessageById().
 */
export const MESSAGE_PREVIEW_LENGTH = 160;

/**
 * Lightweight summary of a contact message for inbox list rendering.
 *
 * Unlike ContactMessageRow, this does NOT carry the full `message` body —
 * only a bounded `messagePreview`. This is real PII minimisation: the full
 * body never reaches the list HTML, only the selected conversation pane.
 */
export interface ContactMessageSummary {
  id: number;
  createdAt: Date;
  name: string;
  email: string;
  phone?: string;
  organisation?: string;
  category: ContactCategory;
  /** Bounded preview of the message body, never the full text. */
  messagePreview: string;
  emailSent: boolean;
  status: ContactMessageStatus;
  lastRepliedAt?: Date;
  archivedAt?: Date;
}

function mapSummary(row: Record<string, unknown>): ContactMessageSummary {
  return {
    id: Number(row.id),
    createdAt: new Date(row.created_at as string),
    name: row.name as string,
    email: row.email as string,
    phone: (row.phone as string) ?? undefined,
    organisation: (row.organisation as string) ?? undefined,
    category: row.category as ContactCategory,
    messagePreview: row.message_preview as string,
    emailSent: Boolean(row.email_sent),
    status: (row.status as ContactMessageStatus) ?? "new",
    lastRepliedAt: row.last_replied_at
      ? new Date(row.last_replied_at as string)
      : undefined,
    archivedAt: row.archived_at
      ? new Date(row.archived_at as string)
      : undefined,
  };
}

/**
 * Inbox list summaries with an optional free-text search.
 *
 * Search matches against the FULL message body (message ILIKE ...) even
 * though only a bounded preview is SELECTed. This gives real PII
 * minimisation — the full body never leaves the database for list rows —
 * without sacrificing search fidelity.
 *
 * Both the filter and the search term are passed as bound parameters — the
 * search string never becomes SQL.
 */
export async function searchContactMessageSummaries(options: {
  filter?: InboxFilter;
  query?: string;
  limit?: number;
}): Promise<ContactMessageSummary[]> {
  const sql = getSql();
  const filter = options.filter ?? "new";
  const limit = options.limit ?? 200;
  const term = options.query?.trim();
  const like = term ? `%${term}%` : null;

  const rows = await sql`
    SELECT id, created_at, name, email, phone, organisation, category,
           LEFT(message, ${MESSAGE_PREVIEW_LENGTH}) AS message_preview,
           email_sent, status, last_replied_at, archived_at
    FROM contact_messages
    WHERE deleted_at IS NULL
      AND (${filter} = 'all' OR status = ${filter})
      AND (
        ${like}::text IS NULL
        OR name ILIKE ${like}
        OR email ILIKE ${like}
        OR category ILIKE ${like}
        OR message ILIKE ${like}
        OR COALESCE(organisation, '') ILIKE ${like}
      )
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows.map(mapSummary);
}

/**
 * Inbox listing with an optional free-text search across the fields an admin
 * would actually recognise a conversation by.
 *
 * Both the filter and the search term are passed as bound parameters — the
 * search string never becomes SQL.
 */
export async function searchContactMessages(options: {
  filter?: InboxFilter;
  query?: string;
  limit?: number;
}): Promise<ContactMessageRow[]> {
  const sql = getSql();
  const filter = options.filter ?? "new";
  const limit = options.limit ?? 200;
  const term = options.query?.trim();
  const like = term ? `%${term}%` : null;

  const rows = await sql`
    SELECT id, created_at, name, email, phone, organisation, category,
           message, email_sent, status, last_replied_at, archived_at
    FROM contact_messages
    WHERE deleted_at IS NULL
      AND (${filter} = 'all' OR status = ${filter})
      AND (
        ${like}::text IS NULL
        OR name ILIKE ${like}
        OR email ILIKE ${like}
        OR category ILIKE ${like}
        OR message ILIKE ${like}
        OR COALESCE(organisation, '') ILIKE ${like}
      )
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows.map(mapMessage);
}

/** Per-tab counts for the inbox header. One pass over the table. */
export async function getInboxCounts(): Promise<Record<InboxFilter, number>> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      COUNT(*) FILTER (WHERE status = 'new')::int AS new,
      COUNT(*) FILTER (WHERE status = 'awaiting_response')::int AS awaiting_response,
      COUNT(*) FILTER (WHERE status = 'replied')::int AS replied,
      COUNT(*) FILTER (WHERE status = 'archived')::int AS archived,
      COUNT(*)::int AS all
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
 * Moves a conversation to an explicit workflow state.
 *
 * `replied` is deliberately NOT settable here — it is only ever reached via
 * markContactMessageReplied() once the provider has accepted a reply, so an
 * admin cannot mark a conversation answered without an email going out.
 */
export async function setContactMessageStatus(
  id: number,
  status: Exclude<ContactMessageStatus, "replied">,
): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE contact_messages
    SET status = ${status},
        archived_at = ${status === "archived" ? "now()" : null}::timestamptz,
        handled_at = CASE
          WHEN ${status} = 'new' THEN NULL
          ELSE COALESCE(handled_at, CURRENT_TIMESTAMP)
        END
    WHERE id = ${id} AND deleted_at IS NULL
  `;
}

/**
 * Called only after a reply has been accepted by the email provider.
 * Archived conversations stay archived — answering one should not drag it back
 * into the active workflow.
 */
export async function markContactMessageReplied(id: number): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE contact_messages
    SET status = CASE WHEN status = 'archived' THEN 'archived' ELSE 'replied' END,
        last_replied_at = CURRENT_TIMESTAMP,
        handled_at = COALESCE(handled_at, CURRENT_TIMESTAMP)
    WHERE id = ${id} AND deleted_at IS NULL
  `;
}

/**
 * Counts submissions nobody has actioned yet, and how many of those never
 * got a notification email out.
 *
 * A count query rather than reusing getContactMessages() so the dashboard does
 * not pull up to 200 rows of personal data just to render a badge.
 */
export async function getContactMessageCounts(): Promise<{
  unhandled: number;
  notEmailed: number;
}> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      COUNT(*) FILTER (WHERE status IN ('new', 'awaiting_response'))::int AS unhandled,
      COUNT(*) FILTER (
        WHERE status IN ('new', 'awaiting_response') AND email_sent = false
      )::int AS not_emailed
    FROM contact_messages
    WHERE deleted_at IS NULL
  `;
  return {
    unhandled: Number(rows[0].unhandled),
    notEmailed: Number(rows[0].not_emailed),
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

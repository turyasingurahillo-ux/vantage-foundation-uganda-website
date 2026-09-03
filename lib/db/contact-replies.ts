import { getSql } from "@/lib/db/client";

/**
 * Correspondence attached to a contact submission.
 *
 * Replies live in their own table rather than being appended to the original
 * message, so the visitor's words stay exactly as they wrote them and each
 * outgoing reply carries its own audit trail (who sent it, to whom, when, and
 * what the provider said).
 *
 * Email is treated as a fallible external call. A reply row is created as
 * `pending` BEFORE the provider is contacted, then moved to `sent` or
 * `failed`. A conversation is only ever marked replied off the back of a
 * `sent` row, so a provider rejection can never masquerade as a delivered
 * reply.
 *
 * Nothing here rewrites history. A failed attempt stays in the conversation
 * with its provider error; retrying adds a new row that points back at it.
 */

export type ReplyDirection = "outbound" | "inbound";
export type ReplySendStatus = "pending" | "sent" | "failed";

/**
 * How long a reply may sit `pending` before its outcome is treated as
 * genuinely unknown rather than merely in flight.
 *
 * A send either completes or the request dies within seconds. Anything still
 * pending after this was interrupted — the function timed out, the instance
 * was recycled — somewhere between handing the mail to SMTP and recording the
 * answer. Whether the enquirer received it is not knowable from here, which is
 * exactly why the UI stops and asks instead of guessing.
 */
export const PENDING_STALE_AFTER_MS = 10 * 60 * 1000;

export function isReplyPendingStale(reply: ContactReplyRow, now = new Date()) {
  return (
    reply.sendStatus === "pending" &&
    now.getTime() - reply.createdAt.getTime() > PENDING_STALE_AFTER_MS
  );
}

export interface ContactReplyRow {
  id: number;
  messageId: number;
  createdAt: Date;
  direction: ReplyDirection;
  body: string;
  senderEmail?: string;
  recipientEmail: string;
  adminActorId?: string;
  providerMessageId?: string;
  sendStatus: ReplySendStatus;
  errorDetail?: string;
  sentAt?: Date;
  /** The failed attempt this reply was sent to replace, if any. */
  retryOfReplyId?: number;
  /** Admin who declared the outcome of an interrupted send. */
  resolvedBy?: string;
  resolvedAt?: Date;
}

function toDate(value: unknown): Date {
  return value instanceof Date ? value : new Date(value as string);
}

function mapReply(row: Record<string, unknown>): ContactReplyRow {
  return {
    id: Number(row.id),
    messageId: Number(row.message_id),
    createdAt: toDate(row.created_at),
    direction: row.direction as ReplyDirection,
    body: row.body as string,
    senderEmail: (row.sender_email as string) ?? undefined,
    recipientEmail: row.recipient_email as string,
    adminActorId: (row.admin_actor_id as string) ?? undefined,
    providerMessageId: (row.provider_message_id as string) ?? undefined,
    sendStatus: row.send_status as ReplySendStatus,
    errorDetail: (row.error_detail as string) ?? undefined,
    sentAt: row.sent_at ? toDate(row.sent_at) : undefined,
    retryOfReplyId: row.retry_of_reply_id
      ? Number(row.retry_of_reply_id)
      : undefined,
    resolvedBy: (row.resolved_by as string) ?? undefined,
    resolvedAt: row.resolved_at ? toDate(row.resolved_at) : undefined,
  };
}

/**
 * Creates the pending reply row.
 *
 * The unique index is on (message_id, idempotency_key), NOT on the key alone.
 * A replayed submission (double-click, browser retry) hits it, and we return
 * the existing row instead of queuing a second email — but a key that happens
 * to collide with one used on a DIFFERENT conversation cannot resolve to that
 * other conversation's reply, because the conflict is scoped to this message.
 * The lookup after the conflict is scoped the same way, belt and braces.
 */
export async function createPendingReply(input: {
  messageId: number;
  body: string;
  senderEmail?: string;
  recipientEmail: string;
  adminActorId?: string;
  idempotencyKey: string;
  retryOfReplyId?: number;
}): Promise<{ reply: ContactReplyRow; alreadyExisted: boolean }> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO contact_message_replies (
      message_id, direction, body, sender_email, recipient_email,
      admin_actor_id, idempotency_key, send_status, retry_of_reply_id
    ) VALUES (
      ${input.messageId}, 'outbound', ${input.body},
      ${input.senderEmail || null}, ${input.recipientEmail},
      ${input.adminActorId || null}, ${input.idempotencyKey}, 'pending',
      ${input.retryOfReplyId ?? null}
    )
    ON CONFLICT (message_id, idempotency_key) DO NOTHING
    RETURNING *
  `;

  if (rows.length > 0) {
    return { reply: mapReply(rows[0]), alreadyExisted: false };
  }

  // Conflict: the same submission, on this same conversation, is already in
  // flight or complete.
  const existing = await sql`
    SELECT * FROM contact_message_replies
    WHERE message_id = ${input.messageId}
      AND idempotency_key = ${input.idempotencyKey}
  `;
  if (existing.length === 0) {
    // The conflicting row disappeared between the insert and the lookup (a
    // concurrent delete, or the parent message being purged). Report it rather
    // than inventing a reply that does not exist.
    throw new Error("reply conflicted but could not be read back");
  }
  return { reply: mapReply(existing[0]), alreadyExisted: true };
}

/** Marks a reply as accepted by the provider and stamps the conversation. */
export async function markReplySent(
  replyId: number,
  providerMessageId: string | null,
  providerStatus: string | null,
): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE contact_message_replies
    SET send_status = 'sent',
        provider_message_id = ${providerMessageId},
        provider_status = ${providerStatus},
        error_detail = NULL,
        sent_at = CURRENT_TIMESTAMP
    WHERE id = ${replyId}
  `;
}

/** Records a provider rejection. The reply stays visible and can be retried. */
export async function markReplyFailed(
  replyId: number,
  errorDetail: string,
): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE contact_message_replies
    SET send_status = 'failed',
        error_detail = ${errorDetail.substring(0, 500)}
    WHERE id = ${replyId}
  `;
}

/**
 * Records an administrator's decision about an interrupted send.
 *
 * Only ever called with a human's answer to "did this actually arrive?", taken
 * after they have looked in the sending mailbox. The system never resolves a
 * stale pending row on its own: SMTP is not transactional, so guessing "failed"
 * risks a second copy of an email the enquirer already has, and guessing
 * "sent" risks an enquirer who is never answered.
 *
 * Scoped by message id and by `send_status = 'pending'` so a resolution cannot
 * touch a reply on another conversation, and cannot rewrite an outcome the
 * provider already gave us.
 */
export async function resolvePendingReply(input: {
  replyId: number;
  messageId: number;
  outcome: "sent" | "failed";
  actorId: string;
}): Promise<ContactReplyRow | null> {
  const sql = getSql();
  const rows = await sql`
    UPDATE contact_message_replies
    SET send_status = ${input.outcome},
        sent_at = CASE
          WHEN ${input.outcome} = 'sent' THEN COALESCE(sent_at, CURRENT_TIMESTAMP)
          ELSE sent_at
        END,
        error_detail = CASE
          WHEN ${input.outcome} = 'failed'
            THEN 'Delivery could not be confirmed; an administrator recorded it as not delivered.'
          ELSE error_detail
        END,
        resolved_by = ${input.actorId},
        resolved_at = CURRENT_TIMESTAMP
    WHERE id = ${input.replyId}
      AND message_id = ${input.messageId}
      AND send_status = 'pending'
    RETURNING *
  `;
  return rows.length ? mapReply(rows[0]) : null;
}

/** One reply, scoped to the conversation it must belong to. */
export async function getReplyForMessage(
  messageId: number,
  replyId: number,
): Promise<ContactReplyRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM contact_message_replies
    WHERE id = ${replyId} AND message_id = ${messageId}
  `;
  return rows.length ? mapReply(rows[0]) : null;
}

/**
 * All correspondence for one conversation, oldest first.
 *
 * Called for the conversation an administrator has actually opened, and no
 * other. The inbox list uses the counts on each row instead — reading every
 * reply body Vantage has ever sent in order to render "3 replies" on a
 * collapsed card is personal data retrieved for no reason.
 */
export async function getRepliesForMessage(
  messageId: number,
): Promise<ContactReplyRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM contact_message_replies
    WHERE message_id = ${messageId}
    ORDER BY created_at ASC, id ASC
  `;
  return rows.map(mapReply);
}

/**
 * Correspondence for several conversations at once, so rendering the inbox
 * does not fire one query per card.
 */
export async function getRepliesForMessages(
  messageIds: number[],
): Promise<Map<number, ContactReplyRow[]>> {
  const grouped = new Map<number, ContactReplyRow[]>();
  if (messageIds.length === 0) return grouped;

  const sql = getSql();
  const rows = await sql`
    SELECT * FROM contact_message_replies
    WHERE message_id = ANY(${messageIds})
    ORDER BY created_at ASC, id ASC
  `;
  for (const raw of rows) {
    const reply = mapReply(raw);
    const list = grouped.get(reply.messageId) ?? [];
    list.push(reply);
    grouped.set(reply.messageId, list);
  }
  return grouped;
}

/**
 * Lightweight grouped count of sent replies for a set of conversations.
 *
 * Returns only counts — no reply bodies, error details, or recipient
 * addresses. Used by the inbox list to show reply counts without loading
 * full reply rows for every message.
 *
 * Only `direction='outbound' AND send_status='sent'` replies are counted,
 * matching the canonical "replied" semantics: a pending or failed reply
 * does not count as a successful reply.
 */
export async function getSentReplyCountsForMessages(
  messageIds: number[],
): Promise<Map<number, number>> {
  const counts = new Map<number, number>();
  if (messageIds.length === 0) return counts;

  const sql = getSql();
  const rows = await sql`
    SELECT
      message_id,
      COUNT(*) FILTER (
        WHERE direction = 'outbound' AND send_status = 'sent'
      )::int AS reply_count
    FROM contact_message_replies
    WHERE message_id = ANY(${messageIds})
    GROUP BY message_id
  `;
  for (const row of rows) {
    counts.set(Number(row.message_id), Number(row.reply_count));
  }
  return counts;
}

/**
 * The most recent successfully sent outbound reply, used to thread the next
 * one via In-Reply-To / References.
 */
export async function getLastSentReply(
  messageId: number,
): Promise<ContactReplyRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM contact_message_replies
    WHERE message_id = ${messageId}
      AND direction = 'outbound'
      AND send_status = 'sent'
      AND provider_message_id IS NOT NULL
    ORDER BY sent_at DESC, id DESC
    LIMIT 1
  `;
  return rows.length ? mapReply(rows[0]) : null;
}

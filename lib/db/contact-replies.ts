import { neon } from "@neondatabase/serverless";

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
 */

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }
  return neon(url);
}

export type ReplyDirection = "outbound" | "inbound";
export type ReplySendStatus = "pending" | "sent" | "failed";

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
}

function mapReply(row: Record<string, unknown>): ContactReplyRow {
  return {
    id: Number(row.id),
    messageId: Number(row.message_id),
    createdAt: new Date(row.created_at as string),
    direction: row.direction as ReplyDirection,
    body: row.body as string,
    senderEmail: (row.sender_email as string) ?? undefined,
    recipientEmail: row.recipient_email as string,
    adminActorId: (row.admin_actor_id as string) ?? undefined,
    providerMessageId: (row.provider_message_id as string) ?? undefined,
    sendStatus: row.send_status as ReplySendStatus,
    errorDetail: (row.error_detail as string) ?? undefined,
    sentAt: row.sent_at ? new Date(row.sent_at as string) : undefined,
  };
}

/**
 * Creates the pending reply row.
 *
 * `idempotencyKey` is UNIQUE in the schema. A double-click replays the same
 * key, the insert conflicts, and we return the existing row instead of queuing
 * a second email.
 */
export async function createPendingReply(input: {
  messageId: number;
  body: string;
  senderEmail?: string;
  recipientEmail: string;
  adminActorId?: string;
  idempotencyKey: string;
}): Promise<{ reply: ContactReplyRow; alreadyExisted: boolean }> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO contact_message_replies (
      message_id, direction, body, sender_email, recipient_email,
      admin_actor_id, idempotency_key, send_status
    ) VALUES (
      ${input.messageId}, 'outbound', ${input.body},
      ${input.senderEmail || null}, ${input.recipientEmail},
      ${input.adminActorId || null}, ${input.idempotencyKey}, 'pending'
    )
    ON CONFLICT (idempotency_key) DO NOTHING
    RETURNING *
  `;

  if (rows.length > 0) {
    return { reply: mapReply(rows[0]), alreadyExisted: false };
  }

  // Conflict: the same submission is already in flight or complete.
  const existing = await sql`
    SELECT * FROM contact_message_replies WHERE idempotency_key = ${input.idempotencyKey}
  `;
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

/** All correspondence for one conversation, oldest first. */
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

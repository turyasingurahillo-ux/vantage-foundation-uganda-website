import { neon } from "@neondatabase/serverless";
import { createHash } from "node:crypto";
import type { InboundEmailLogRow, InboundEmailStatus } from "@/lib/organisation-types";

/**
 * Inbound email processing — application side.
 *
 * This module implements the application-side logic for receiving inbound emails
 * that are replies to outbound Vantage correspondence. The email transport
 * (Cloudflare Email Routing / Email Workers) is configured separately; this
 * module receives parsed email data from an authenticated endpoint, matches it
 * to an existing case via In-Reply-To / References headers, creates an inbound
 * reply row, and updates the case workflow.
 *
 * Replay protection: each inbound email is hashed (Message-ID + sender + date)
 * and stored in inbound_email_log with a UNIQUE constraint. A replay of the
 * same email is silently rejected.
 *
 * Security:
 *   - The endpoint authenticates via a shared secret (INBOUND_EMAIL_SECRET)
 *   - Sender/thread validation: In-Reply-To must match a stored provider_message_id
 *   - No arbitrary case-ID injection: the case is resolved from the reply thread
 *   - Size limits: body is truncated to 100KB
 *   - No secrets are exposed in responses
 */

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }
  return neon(url);
}

const MAX_BODY_SIZE = 100_000; // 100 KB

function mapInboundEmailLog(row: Record<string, unknown>): InboundEmailLogRow {
  return {
    id: Number(row.id),
    receivedAt: new Date(row.received_at as string),
    messageIdHash: row.message_id_hash as string,
    fromAddress: row.from_address as string,
    inReplyTo: (row.in_reply_to as string) ?? null,
    subject: (row.subject as string) ?? null,
    matchedCaseId: row.matched_case_id ? Number(row.matched_case_id) : null,
    matchedReplyId: row.matched_reply_id
      ? Number(row.matched_reply_id)
      : null,
    status: (row.status as InboundEmailStatus) ?? "processed",
    errorDetail: (row.error_detail as string) ?? null,
  };
}

/**
 * Hash a Message-ID + sender + date for replay protection.
 * Uses SHA-256 truncated to 32 hex chars.
 */
export function hashInboundEmail(
  messageId: string,
  fromAddress: string,
  date: string,
): string {
  return createHash("sha256")
    .update(`${messageId}|${fromAddress}|${date}`)
    .digest("hex")
    .slice(0, 32);
}

export interface InboundEmailInput {
  messageId: string;
  fromAddress: string;
  inReplyTo: string | null;
  references: string | null;
  subject: string | null;
  body: string;
  date: string;
}

export interface InboundEmailResult {
  status: "processed" | "unmatched" | "replay_blocked" | "error";
  caseId?: number;
  replyId?: number;
  error?: string;
}

/**
 * Process an inbound email:
 * 1. Hash and check for replay
 * 2. Match In-Reply-To / References to a stored outbound provider_message_id
 * 3. Create an inbound reply row on the matched case
 * 4. Update case workflow to 'awaiting_vantage'
 * 5. Log the result
 */
export async function processInboundEmail(
  input: InboundEmailInput,
): Promise<InboundEmailResult> {
  const sql = getSql();
  const hash = hashInboundEmail(
    input.messageId,
    input.fromAddress,
    input.date,
  );

  // 1. Replay protection — check if we've already seen this email
  const existing = await sql`
    SELECT id FROM inbound_email_log WHERE message_id_hash = ${hash}
  `;
  if (existing.length > 0) {
    return { status: "replay_blocked" };
  }

  // 2. Match In-Reply-To / References to a stored outbound reply
  const replyHeaders = [
    ...(input.inReplyTo ? [input.inReplyTo.trim()] : []),
    ...(input.references
      ? input.references.split(/\s+/).map((r) => r.trim()).filter(Boolean)
      : []),
  ].filter((h) => h.length > 0);

  if (replyHeaders.length === 0) {
    // No threading headers — cannot match to a case
    await sql`
      INSERT INTO inbound_email_log (
        message_id_hash, from_address, in_reply_to, subject, status, error_detail
      ) VALUES (
        ${hash}, ${input.fromAddress}, ${input.inReplyTo ?? null},
        ${input.subject ?? null}, 'unmatched', 'No In-Reply-To or References headers'
      )
    `;
    return { status: "unmatched", error: "No threading headers" };
  }

  // Find the outbound reply whose provider_message_id matches a reply header
  const matchedReply = await sql`
    SELECT * FROM contact_message_replies
    WHERE direction = 'outbound'
      AND send_status = 'sent'
      AND provider_message_id = ANY(${replyHeaders})
    ORDER BY sent_at DESC
    LIMIT 1
  `;

  if (matchedReply.length === 0) {
    await sql`
      INSERT INTO inbound_email_log (
        message_id_hash, from_address, in_reply_to, subject, status, error_detail
      ) VALUES (
        ${hash}, ${input.fromAddress}, ${input.inReplyTo ?? null},
        ${input.subject ?? null}, 'unmatched', 'No matching outbound reply found'
      )
    `;
    return { status: "unmatched", error: "No matching outbound reply" };
  }

  const reply = matchedReply[0];
  const caseId = Number(reply.message_id);
  const replyId = Number(reply.id);
  const truncatedBody = input.body.slice(0, MAX_BODY_SIZE);

  // 3. Create an inbound reply row
  const inboundReply = await sql`
    INSERT INTO contact_message_replies (
      message_id, direction, body, sender_email, recipient_email,
      send_status, provider_message_id
    ) VALUES (
      ${caseId}, 'inbound', ${truncatedBody},
      ${input.fromAddress}, ${reply.recipient_email},
      'sent', ${input.messageId}
    )
    RETURNING *
  `;

  const inboundReplyId = Number(inboundReply[0].id);

  // 4. Update case workflow to 'awaiting_vantage' and reset delivery status
  await sql`
    UPDATE contact_messages
    SET
      workflow_status = 'awaiting_vantage',
      status = 'awaiting_response',
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${caseId} AND deleted_at IS NULL
  `;

  // 5. Log the result
  await sql`
    INSERT INTO inbound_email_log (
      message_id_hash, from_address, in_reply_to, subject,
      matched_case_id, matched_reply_id, status
    ) VALUES (
      ${hash}, ${input.fromAddress}, ${input.inReplyTo ?? null},
      ${input.subject ?? null}, ${caseId}, ${replyId}, 'processed'
    )
  `;

  return {
    status: "processed",
    caseId,
    replyId: inboundReplyId,
  };
}

export async function getInboundEmailLog(
  limit = 50,
): Promise<InboundEmailLogRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM inbound_email_log
    ORDER BY received_at DESC
    LIMIT ${limit}
  `;
  return rows.map(mapInboundEmailLog);
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getContactMessageById,
  markContactMessageReplied,
  setContactMessageStatus,
} from "@/lib/db/contact";
import {
  createPendingReply,
  getLastSentReply,
  markReplyFailed,
  markReplySent,
} from "@/lib/db/contact-replies";
import { sendContactReply } from "@/lib/contact-reply";
import { parseReplyForm } from "@/lib/reply-validation";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { logInfo, logWarn, logError } from "@/lib/logger";
import { appendAuditLog } from "@/lib/db/audit";
import { stampFirstResponseIfFirst } from "@/lib/db/cases";

/**
 * Sends an administrator's reply to whoever submitted a contact form.
 *
 * Security model:
 *  - the admin session is verified here, in the mutation, not just on the page
 *  - CSRF double-submit is required
 *  - the recipient is read from the stored contact row; the request body
 *    carries only a message id, so a caller cannot redirect mail to an
 *    arbitrary address
 *  - the body is length-bounded and must contain real text
 *  - sends are rate limited per admin IP
 *
 * Delivery model: the reply row is written as `pending` before the provider is
 * called, then moved to `sent` or `failed`. The conversation is only marked
 * replied off the back of a `sent` row, so a provider rejection is never
 * displayed as a delivered reply, and a failed reply can be retried.
 *
 * Case model: a successful reply sets the MESSAGE DELIVERY state to `replied`
 * (the legacy `status` column) and stamps `first_response_at` for SLA
 * reporting, but does NOT change the CASE WORKFLOW state (`workflow_status`).
 * The admin decides what happens next in the relationship — e.g. "please send
 * your registration certificate" means the case is `awaiting_external`, not
 * completed — via the case workspace controls. A failed reply does not mark
 * the case resolved either; the conversation moves to `awaiting_response`.
 *
 * Validation lives in `lib/reply-validation.ts` so every failure mode maps
 * onto a fixed application error code (`empty`, `too-long`, `invalid`) rather
 * than leaking raw Zod messages into a redirect URL.
 */

function back(request: Request, id: number | string, params: string) {
  return NextResponse.redirect(
    new URL(`/admin/messages?open=${id}&${params}`, request.url),
    303,
  );
}

export async function POST(request: Request) {
  const cookieStore = await cookies();

  const session = verifySessionToken(cookieStore.get(sessionCookieName)?.value);
  if (!session) {
    logWarn("message_reply_unauthorized", {});
    return NextResponse.redirect(new URL("/admin/login", request.url), 302);
  }
  const { actorId } = session;

  const ip = getClientIp(request.headers);
  if (!rateLimit({ key: `admin-msg-reply:${ip}`, limit: 10, windowMs: 60_000 })) {
    logWarn("message_reply_rate_limited", { ip });
    return back(request, "", "error=rate-limited");
  }

  const formData = await request.formData();
  if (!validateCsrf(cookieStore, formData)) {
    logWarn("message_reply_csrf_failed", {});
    return back(request, "", "error=csrf");
  }

  const parsed = parseReplyForm({
    id: formData.get("id"),
    body: formData.get("body"),
    idempotencyKey: formData.get("idempotencyKey"),
  });
  if (!parsed.ok) {
    const rawId = String(formData.get("id") ?? "");
    return back(request, rawId, `error=${parsed.code}`);
  }

  const { id, body, idempotencyKey } = parsed.data;

  try {
    // Recipient comes from the database, never from the request.
    const message = await getContactMessageById(id);
    if (!message) {
      return back(request, id, "error=notfound");
    }

    const { reply, alreadyExisted } = await createPendingReply({
      messageId: message.id,
      body,
      recipientEmail: message.email,
      adminActorId: actorId,
      idempotencyKey,
    });

    // A replayed submission (double-click, browser retry) hits the unique
    // index and lands here. Never send a second copy.
    if (alreadyExisted) {
      logWarn("message_reply_duplicate", { id: message.id });
      return back(
        request,
        id,
        reply.sendStatus === "failed" ? "error=send" : "replied=1",
      );
    }

    const previous = await getLastSentReply(message.id);

    const result = await sendContactReply({
      recipientEmail: message.email,
      recipientName: message.name,
      category: message.category,
      replyBody: body,
      originalMessage: message.message,
      originalSentAt: message.createdAt,
      inReplyTo: previous?.providerMessageId,
    });

    if (!result.ok) {
      await markReplyFailed(reply.id, result.error ?? "unknown error");
      // The enquirer is still waiting, so the conversation owes a response.
      if (message.status !== "archived") {
        await setContactMessageStatus(message.id, "awaiting_response");
      }
      logWarn("message_reply_send_failed", { id: message.id });
      return back(request, id, "error=send");
    }

    await markReplySent(
      reply.id,
      result.messageId ?? null,
      result.providerStatus ?? null,
    );
    await markContactMessageReplied(message.id);

    // Stamp the first-response timestamp for SLA reporting. This records
    // when the first OUTBOUND reply was sent, separate from the case
    // workflow status — a reply does NOT complete the case. The admin
    // decides whether the case is now awaiting_external (e.g. "please send
    // your registration certificate"), awaiting_vantage (e.g. "we will
    // review this"), or another state, via the case workspace controls.
    try {
      await stampFirstResponseIfFirst(message.id);
    } catch {
      // Non-fatal — SLA stamp is bookkeeping, not gating.
    }

    await appendAuditLog({
      actorId,
      action: "contact_message.reply",
      resourceType: "contact_message",
      resourceId: message.id,
      before: { status: message.status },
      after: { status: "replied", replyId: reply.id },
      ip,
    });

    logInfo("message_reply_sent", {
      id: message.id,
      replyId: reply.id,
      category: message.category,
    });
    return back(request, id, "replied=1");
  } catch (err) {
    logError("message_reply_error", {
      error: (err instanceof Error ? err.message : String(err)).substring(0, 200),
    });
    return back(request, id, "error=server");
  }
}

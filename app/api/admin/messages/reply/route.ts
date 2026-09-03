import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  getContactMessageById,
  markContactMessageReplied,
  setContactMessageStatus,
} from "@/lib/db/contact";
import {
  createPendingReply,
  getLastSentReply,
  getReplyForMessage,
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
 * The admin decides what happens next in the relationship via the case
 * workspace controls. A failed reply moves the message delivery state to
 * `awaiting_response` (unless the conversation is archived) so the team knows
 * the enquirer still needs an answer.
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

  // Optional retryOf: this reply replaces a previously failed attempt.
  const retryOfRaw = formData.get("retryOf");
  const retryOfParsed = z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .safeParse(retryOfRaw === null ? undefined : retryOfRaw);
  const retryOf = retryOfParsed.success ? retryOfParsed.data : undefined;

  try {
    // Recipient comes from the database, never from the request.
    const message = await getContactMessageById(id);
    if (!message) {
      return back(request, id, "error=notfound");
    }

    // A retry must name a genuinely failed attempt on THIS conversation.
    if (retryOf !== undefined) {
      const original = await getReplyForMessage(message.id, retryOf);
      if (!original || original.sendStatus !== "failed") {
        logWarn("message_reply_bad_retry", { id: message.id });
        return back(request, id, "error=retry-invalid");
      }
    }

    const { reply, alreadyExisted } = await createPendingReply({
      messageId: message.id,
      body,
      recipientEmail: message.email,
      adminActorId: actorId,
      idempotencyKey,
      retryOfReplyId: retryOf,
    });

    // A replayed submission (double-click, browser retry) hits the unique
    // index and lands here. Never send a second copy — but report what the
    // existing attempt actually did.
    if (alreadyExisted) {
      if (reply.messageId !== message.id) {
        logError("message_reply_idempotency_mismatch", { id: message.id });
        return back(request, id, "error=server");
      }

      logWarn("message_reply_duplicate", {
        id: message.id,
        sendStatus: reply.sendStatus,
      });

      if (reply.sendStatus === "sent") {
        return back(request, id, "replied=1");
      }
      if (reply.sendStatus === "failed") {
        return back(request, id, "error=send");
      }
      return back(request, id, "error=in-flight");
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
      // Do not overwrite an already-replied conversation or an archived one.
      if (message.status !== "archived" && message.status !== "replied") {
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
    // workflow status.
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
      retry: Boolean(retryOf),
    });
    return back(request, id, "replied=1");
  } catch (err) {
    logError("message_reply_error", {
      error: (err instanceof Error ? err.message : String(err)).substring(0, 200),
    });
    return back(request, id, "error=server");
  }
}

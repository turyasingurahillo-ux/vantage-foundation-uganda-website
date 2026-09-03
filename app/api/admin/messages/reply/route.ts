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
import { REPLY_MAX_LENGTH, sendContactReply } from "@/lib/contact-reply";
import {
  buildInboxUrl,
  parseInboxContext,
  withOpen,
  type InboxContext,
} from "@/lib/admin/inbox-context";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { logInfo, logWarn, logError } from "@/lib/logger";
import { appendAuditLog } from "@/lib/db/audit";

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
 *  - the redirect target is rebuilt from validated fields, never from a URL
 *    supplied by the browser
 *
 * Delivery model: the reply row is written as `pending` before the provider is
 * called, then moved to `sent` or `failed`. The conversation is only marked
 * replied off the back of a `sent` row, so a provider rejection is never
 * displayed as a delivered reply, and a failed reply can be retried.
 */

const schema = z.object({
  id: z.coerce.number().int().positive(),
  body: z
    .string()
    .trim()
    .min(1, "empty")
    .max(REPLY_MAX_LENGTH, "too-long"),
  // Generated per composer render. UNIQUE per conversation in the schema, so a
  // double submit collapses onto the same row instead of sending twice.
  idempotencyKey: z.string().min(8).max(100),
  /** Set when this reply replaces a failed attempt. Validated below. */
  retryOf: z.coerce.number().int().positive().optional(),
});

function back(
  request: Request,
  context: InboxContext,
  extra: Record<string, string | number>,
) {
  return NextResponse.redirect(
    new URL(buildInboxUrl(context, extra), request.url),
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

  const formData = await request.formData();
  const context = parseInboxContext(formData);

  const ip = getClientIp(request.headers);
  if (!rateLimit({ key: `admin-msg-reply:${ip}`, limit: 10, windowMs: 60_000 })) {
    logWarn("message_reply_rate_limited", { ip });
    return back(request, context, { error: "rate-limited" });
  }

  if (!validateCsrf(cookieStore, formData)) {
    logWarn("message_reply_csrf_failed", {});
    return back(request, context, { error: "csrf" });
  }

  const parsed = schema.safeParse({
    id: formData.get("id"),
    body: formData.get("body"),
    idempotencyKey: formData.get("idempotencyKey"),
    retryOf: formData.get("retryOf") || undefined,
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0]?.message ?? "invalid";
    return back(request, context, { error: issue });
  }

  const { id, body, idempotencyKey, retryOf } = parsed.data;
  // Whatever tab they were on, the conversation they just replied to should be
  // the one that is open when they land back.
  const here = withOpen(context, id);

  try {
    // Recipient comes from the database, never from the request.
    const message = await getContactMessageById(id);
    if (!message) {
      return back(request, here, { error: "notfound" });
    }

    // A retry must name a genuinely failed attempt on THIS conversation.
    // Anything else — a reply id from someone else's message, a pending
    // attempt whose outcome nobody has established, an already-delivered one —
    // is refused rather than quietly ignored, because sending it would be
    // sending a second copy of an email that may already have arrived.
    if (retryOf !== undefined) {
      const original = await getReplyForMessage(message.id, retryOf);
      if (!original || original.sendStatus !== "failed") {
        logWarn("message_reply_bad_retry", { id: message.id });
        return back(request, here, { error: "retry-invalid" });
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
    // index and lands here. Never send a second copy — but do report what the
    // existing attempt actually did.
    //
    // The three states are genuinely different and were previously collapsed
    // into two, which meant a reply still waiting on the provider was reported
    // to the administrator as delivered:
    //
    //   sent    the email went out; the replay is a no-op and this is success
    //   failed  the provider rejected it; offer the retry, do not claim success
    //   pending nobody knows yet. Saying "replied" here would be a lie, and
    //           sending again risks a duplicate email to a member of the
    //           public. The conversation view shows the in-flight attempt and,
    //           once it is old enough to be doubtful, asks the administrator
    //           to establish what happened.
    if (alreadyExisted) {
      // Defence in depth: the unique index is scoped to (message_id,
      // idempotency_key), so this cannot be another conversation's reply.
      // Assert it anyway rather than trusting a schema invariant at runtime.
      if (reply.messageId !== message.id) {
        logError("message_reply_idempotency_mismatch", { id: message.id });
        return back(request, here, { error: "server" });
      }

      logWarn("message_reply_duplicate", {
        id: message.id,
        sendStatus: reply.sendStatus,
      });

      if (reply.sendStatus === "sent") {
        return back(request, here, { replied: 1 });
      }
      if (reply.sendStatus === "failed") {
        return back(request, here, { error: "send" });
      }
      return back(request, here, { error: "in-flight" });
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
      if (message.status !== "awaiting_response") {
        await setContactMessageStatus(message.id, "awaiting_response");
      }
      logWarn("message_reply_send_failed", { id: message.id });
      return back(request, here, { error: "send" });
    }

    await markReplySent(
      reply.id,
      result.messageId ?? null,
      result.providerStatus ?? null,
    );
    await markContactMessageReplied(message.id);

    await appendAuditLog({
      actorId,
      action: "contact_message.reply",
      resourceType: "contact_message",
      resourceId: message.id,
      before: { status: message.status },
      after: {
        status: "replied",
        replyId: reply.id,
        ...(retryOf ? { retryOf } : {}),
      },
      ip,
    });

    logInfo("message_reply_sent", {
      id: message.id,
      replyId: reply.id,
      category: message.category,
      retry: Boolean(retryOf),
    });
    return back(request, here, { replied: 1 });
  } catch (err) {
    logError("message_reply_error", {
      error: (err instanceof Error ? err.message : String(err)).substring(0, 200),
    });
    return back(request, here, { error: "server" });
  }
}

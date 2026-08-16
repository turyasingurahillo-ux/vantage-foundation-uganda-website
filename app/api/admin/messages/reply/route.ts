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
  markReplyFailed,
  markReplySent,
} from "@/lib/db/contact-replies";
import { REPLY_MAX_LENGTH, sendContactReply } from "@/lib/contact-reply";
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
  // Generated per composer mount. UNIQUE in the schema, so a double submit
  // collapses onto the same row instead of sending twice.
  idempotencyKey: z.string().min(8).max(100),
});

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

  const parsed = schema.safeParse({
    id: formData.get("id"),
    body: formData.get("body"),
    idempotencyKey: formData.get("idempotencyKey"),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0]?.message ?? "invalid";
    const rawId = String(formData.get("id") ?? "");
    return back(request, rawId, `error=${encodeURIComponent(issue)}`);
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

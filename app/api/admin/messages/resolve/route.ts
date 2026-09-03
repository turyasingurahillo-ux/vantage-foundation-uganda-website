import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  getContactMessageById,
  markContactMessageReplied,
  setContactMessageStatus,
} from "@/lib/db/contact";
import {
  getReplyForMessage,
  isReplyPendingStale,
  resolvePendingReply,
} from "@/lib/db/contact-replies";
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
 * Records what actually happened to a reply whose send was interrupted.
 *
 * A `pending` row means the application handed the email to SMTP and never
 * learned the answer — the function timed out, the instance was recycled. SMTP
 * is not transactional, so the application cannot recover this on its own:
 * assuming failure and resending risks a second copy landing on a member of
 * the public, and assuming success risks an enquirer who is never answered.
 *
 * The only party who can settle it is a person who looks in the sending
 * mailbox. This endpoint records their finding, and nothing else — it sends no
 * email. Once recorded, the normal paths take over: "not delivered" makes the
 * attempt a failed one that Retry can replace, and "delivered" marks the
 * conversation replied exactly as a confirmed send would have.
 */

const schema = z.object({
  id: z.coerce.number().int().positive(),
  replyId: z.coerce.number().int().positive(),
  outcome: z.enum(["sent", "failed"]),
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
    logWarn("message_resolve_unauthorized", {});
    return NextResponse.redirect(new URL("/admin/login", request.url), 302);
  }
  const { actorId } = session;

  const formData = await request.formData();
  const context = parseInboxContext(formData);

  const ip = getClientIp(request.headers);
  if (
    !rateLimit({ key: `admin-msg-resolve:${ip}`, limit: 20, windowMs: 60_000 })
  ) {
    logWarn("message_resolve_rate_limited", { ip });
    return back(request, context, { error: "rate-limited" });
  }

  if (!validateCsrf(cookieStore, formData)) {
    logWarn("message_resolve_csrf_failed", {});
    return back(request, context, { error: "csrf" });
  }

  const parsed = schema.safeParse({
    id: formData.get("id"),
    replyId: formData.get("replyId"),
    outcome: formData.get("outcome"),
  });
  if (!parsed.success) {
    return back(request, context, { error: "invalid" });
  }
  const { id, replyId, outcome } = parsed.data;
  const here = withOpen(context, id);

  try {
    const message = await getContactMessageById(id);
    if (!message) {
      return back(request, here, { error: "notfound" });
    }

    // Scoped to the conversation, so a reply id belonging to somebody else's
    // message cannot be resolved from here.
    const reply = await getReplyForMessage(message.id, replyId);
    if (!reply || reply.sendStatus !== "pending") {
      return back(request, here, { error: "resolve-invalid" });
    }
    // Only offered once the attempt is genuinely doubtful. A send that started
    // thirty seconds ago is probably still running, and declaring it either way
    // would be guessing at exactly the moment the truth is about to arrive.
    if (!isReplyPendingStale(reply)) {
      return back(request, here, { error: "in-flight" });
    }

    const resolved = await resolvePendingReply({
      replyId: reply.id,
      messageId: message.id,
      outcome,
      actorId,
    });
    if (!resolved) {
      // Lost a race with the send itself finishing. Its own answer wins.
      return back(request, here, { error: "resolve-invalid" });
    }

    if (outcome === "sent") {
      await markContactMessageReplied(message.id);
    } else if (message.status !== "awaiting_response") {
      await setContactMessageStatus(message.id, "awaiting_response");
    }

    await appendAuditLog({
      actorId,
      action: "contact_message.reply_resolved",
      resourceType: "contact_message",
      resourceId: message.id,
      before: { replyId: reply.id, sendStatus: "pending" },
      after: { replyId: reply.id, sendStatus: outcome, resolvedBy: actorId },
      ip,
    });

    logInfo("message_reply_resolved", { id: message.id, replyId, outcome });
    return back(request, here, { resolved: outcome });
  } catch (err) {
    logError("message_resolve_error", {
      error: (err instanceof Error ? err.message : String(err)).substring(0, 200),
    });
    return back(request, here, { error: "server" });
  }
}

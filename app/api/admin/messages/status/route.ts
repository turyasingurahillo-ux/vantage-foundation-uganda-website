import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  getContactMessageById,
  setContactMessageArchived,
  setContactMessageStatus,
} from "@/lib/db/contact";
import {
  buildInboxUrl,
  parseInboxContext,
  type InboxContext,
} from "@/lib/admin/inbox-context";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { logInfo, logWarn, logError } from "@/lib/logger";
import { appendAuditLog } from "@/lib/db/audit";

/**
 * Moves a conversation through the inbox workflow.
 *
 * Archiving is a separate action from the response state, because they answer
 * different questions: "have we replied?" and "is this still on the desk?".
 * Conflating them meant filing a conversation away destroyed the record of
 * whether it had been answered, and taking it back out invented a state it had
 * never been in. Each action here moves exactly one of the two.
 *
 * `replied` is deliberately not settable: a conversation only becomes replied
 * when the email provider accepts an actual reply, so an administrator cannot
 * mark something answered that was never sent.
 */

const ACTIONS = ["mark-new", "needs-reply", "archive", "unarchive"] as const;

const schema = z.object({
  id: z.coerce.number().int().positive(),
  action: z.enum(ACTIONS),
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
    logWarn("message_status_unauthorized", {});
    return NextResponse.redirect(new URL("/admin/login", request.url), 302);
  }
  const { actorId } = session;

  const formData = await request.formData();
  const context = parseInboxContext(formData);

  const ip = getClientIp(request.headers);
  if (!rateLimit({ key: `admin-msg-status:${ip}`, limit: 30, windowMs: 60_000 })) {
    logWarn("message_status_rate_limited", { ip });
    return back(request, context, { error: "rate-limited" });
  }

  if (!validateCsrf(cookieStore, formData)) {
    logWarn("message_status_csrf_failed", {});
    return back(request, context, { error: "csrf" });
  }

  const parsed = schema.safeParse({
    id: formData.get("id"),
    action: formData.get("action"),
  });
  if (!parsed.success) {
    return back(request, context, { error: "invalid" });
  }
  const { id, action } = parsed.data;

  try {
    const message = await getContactMessageById(id);
    if (!message) {
      return back(request, context, { error: "notfound" });
    }

    const before = {
      status: message.status,
      archived: Boolean(message.archivedAt),
    };

    switch (action) {
      case "mark-new":
        await setContactMessageStatus(message.id, "new");
        break;
      case "needs-reply":
        await setContactMessageStatus(message.id, "awaiting_response");
        break;
      case "archive":
        // Response state is untouched: a replied conversation is still a
        // replied conversation once it is filed away.
        await setContactMessageArchived(message.id, true);
        break;
      case "unarchive":
        await setContactMessageArchived(message.id, false);
        break;
    }

    const after = {
      status:
        action === "mark-new"
          ? "new"
          : action === "needs-reply"
            ? "awaiting_response"
            : message.status,
      archived: action === "archive" ? true : action === "unarchive" ? false : before.archived,
    };

    await appendAuditLog({
      actorId,
      action: "contact_message.status",
      resourceType: "contact_message",
      resourceId: message.id,
      before,
      after,
      ip,
    });

    logInfo("message_status_changed", { id: message.id, action });
    // Stay exactly where they were — same tab, same search, same page. An
    // archived conversation has left the tab they are on, so it is no longer
    // expanded there.
    const stay =
      action === "archive" && context.open === message.id
        ? { ...context, open: null }
        : context;
    // A code, not a sentence: the page owns the wording, so the URL cannot be
    // used to put arbitrary text in front of an administrator.
    return back(request, stay, { done: action });
  } catch (err) {
    logError("message_status_error", {
      error: (err instanceof Error ? err.message : String(err)).substring(0, 200),
    });
    return back(request, context, { error: "server" });
  }
}

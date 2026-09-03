import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  getContactMessageById,
  markContactMessageEmailed,
} from "@/lib/db/contact";
import { sendContactNotification } from "@/lib/contact-notify";
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
 * Re-sends the internal notification for an already-stored contact message.
 *
 * Messages are persisted before the notification is attempted, so anything
 * submitted while SMTP was unconfigured or failing sits in the database with
 * `email_sent = false` and never reaches an inbox. This lets an administrator
 * push those to the team mailbox once email is working.
 *
 * The message id is the ONLY input. The recipient is resolved from the stored
 * category plus server env, exactly as it is for a fresh submission, so this
 * cannot be turned into a way to mail an arbitrary address.
 */

const schema = z.object({
  id: z.coerce.number().int().positive(),
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
    logWarn("message_resend_unauthorized", {});
    return NextResponse.redirect(new URL("/admin/login", request.url), 302);
  }
  const { actorId } = session;

  const formData = await request.formData();
  const context = parseInboxContext(formData);

  const ip = getClientIp(request.headers);
  if (!rateLimit({ key: `admin-msg-resend:${ip}`, limit: 20, windowMs: 60_000 })) {
    logWarn("message_resend_rate_limited", { ip });
    return back(request, context, { error: "rate-limited" });
  }

  if (!validateCsrf(cookieStore, formData)) {
    logWarn("message_resend_csrf_failed", {});
    return back(request, context, { error: "csrf" });
  }

  const parsed = schema.safeParse({ id: formData.get("id") });
  if (!parsed.success) {
    return back(request, context, { error: "invalid" });
  }

  try {
    const message = await getContactMessageById(parsed.data.id);
    if (!message) {
      return back(request, context, { error: "notfound" });
    }

    const sent = await sendContactNotification(
      {
        name: message.name,
        email: message.email,
        phone: message.phone,
        organisation: message.organisation,
        category: message.category,
        message: message.message,
      },
      { resend: true },
    );

    if (!sent) {
      logWarn("message_resend_failed", { id: message.id });
      return back(request, context, { error: "notify" });
    }

    await markContactMessageEmailed(message.id, true);

    await appendAuditLog({
      actorId,
      action: "contact_message.resend",
      resourceType: "contact_message",
      resourceId: message.id,
      before: { emailSent: message.emailSent },
      after: { emailSent: true },
      ip,
    });

    logInfo("message_resend_ok", { id: message.id, category: message.category });
    return back(request, context, { resent: 1 });
  } catch (err) {
    logError("message_resend_error", {
      error: (err instanceof Error ? err.message : String(err)).substring(0, 200),
    });
    return back(request, context, { error: "server" });
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  getContactMessageById,
  setContactMessageStatus,
} from "@/lib/db/contact";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { logInfo, logWarn, logError } from "@/lib/logger";
import { appendAuditLog } from "@/lib/db/audit";

/**
 * Moves a conversation between workflow states (archive, reopen, mark as
 * needing a response).
 *
 * `replied` is deliberately not accepted: a conversation only becomes replied
 * when the email provider accepts an actual reply, so an administrator cannot
 * mark something answered that was never sent.
 */

const schema = z.object({
  id: z.coerce.number().int().positive(),
  status: z.enum(["new", "awaiting_response", "archived"]),
});

function back(request: Request, params: string) {
  return NextResponse.redirect(
    new URL(`/admin/messages?${params}`, request.url),
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

  const ip = getClientIp(request.headers);
  if (!rateLimit({ key: `admin-msg-status:${ip}`, limit: 30, windowMs: 60_000 })) {
    logWarn("message_status_rate_limited", { ip });
    return back(request, "error=rate-limited");
  }

  const formData = await request.formData();
  if (!validateCsrf(cookieStore, formData)) {
    logWarn("message_status_csrf_failed", {});
    return back(request, "error=csrf");
  }

  const parsed = schema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return back(request, "error=invalid");
  }

  try {
    const message = await getContactMessageById(parsed.data.id);
    if (!message) {
      return back(request, "error=notfound");
    }

    await setContactMessageStatus(message.id, parsed.data.status);

    await appendAuditLog({
      actorId,
      action: "contact_message.status",
      resourceType: "contact_message",
      resourceId: message.id,
      before: { status: message.status },
      after: { status: parsed.data.status },
      ip,
    });

    logInfo("message_status_changed", {
      id: message.id,
      status: parsed.data.status,
    });
    return back(request, `status=1&filter=${message.status}`);
  } catch (err) {
    logError("message_status_error", {
      error: (err instanceof Error ? err.message : String(err)).substring(0, 200),
    });
    return back(request, "error=server");
  }
}

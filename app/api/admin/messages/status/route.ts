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
 * Updates the legacy message-delivery state of a contact message.
 *
 * Allowed transitions are driven by the state buttons in the admin workspace:
 *   - new              reset / reopen a conversation
 *   - awaiting_response  mark as needing a reply
 *   - archived         file the conversation away
 *
 * `replied` is deliberately not settable here — it is only ever reached via a
 * successful email reply, so an admin cannot mark a message answered without
 * an actual reply going out.
 *
 * Archive state is kept in `archived_at` and is orthogonal to the response
 * state; `setContactMessageStatus` sets or clears `archived_at` as needed.
 */

const schema = z.object({
  id: z.coerce.number().int().positive(),
  status: z.enum(["new", "awaiting_response", "archived"] as const),
});

function back(request: Request, id: number, open: number | null, done: string) {
  const params = new URLSearchParams();
  if (open) params.set("open", String(open));
  params.set("done", done);
  const query = params.toString();
  return NextResponse.redirect(
    new URL(`/admin/messages${query ? `?${query}` : ""}`, request.url),
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
    return NextResponse.redirect(
      new URL("/admin/messages?error=rate-limited", request.url),
      303,
    );
  }

  const formData = await request.formData();
  if (!validateCsrf(cookieStore, formData)) {
    logWarn("message_status_csrf_failed", {});
    return NextResponse.redirect(
      new URL("/admin/messages?error=csrf", request.url),
      303,
    );
  }

  const parsed = schema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return NextResponse.redirect(
      new URL("/admin/messages?error=invalid", request.url),
      303,
    );
  }

  const { id, status } = parsed.data;

  try {
    const message = await getContactMessageById(id);
    if (!message) {
      return NextResponse.redirect(
        new URL("/admin/messages?error=notfound", request.url),
        303,
      );
    }

    const before = {
      status: message.status,
      archived: Boolean(message.archivedAt),
    };

    await setContactMessageStatus(id, status);

    const after = {
      status,
      archived: status === "archived",
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

    logInfo("message_status_changed", { id: message.id, status });
    // An archived conversation leaves the active list, so do not expand it.
    return back(request, id, status === "archived" ? null : id, status);
  } catch (err) {
    logError("message_status_error", {
      error: (err instanceof Error ? err.message : String(err)).substring(0, 200),
    });
    return NextResponse.redirect(
      new URL("/admin/messages?error=server", request.url),
      303,
    );
  }
}

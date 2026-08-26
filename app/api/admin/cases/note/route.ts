import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { addCaseNote } from "@/lib/db/cases";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { logInfo, logWarn, logError } from "@/lib/logger";
import { appendAuditLog } from "@/lib/db/audit";

/**
 * Adds an internal note to a case.
 *
 * Internal notes are NEVER emailed to the enquirer and NEVER exposed
 * publicly. They live in the case_notes table, structurally separate from
 * contact_message_replies (outward-facing correspondence), so no code path
 * can accidentally send a note as an email. This route only writes to
 * case_notes — it does not touch contact_message_replies or the email
 * transport.
 *
 * Security model: session verified, CSRF double-submit, rate-limited, audited.
 */

const NOTE_MAX_LENGTH = 5000;

const schema = z.object({
  id: z.coerce.number().int().positive(),
  body: z.string().trim().min(1, "empty").max(NOTE_MAX_LENGTH, "too-long"),
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
    logWarn("case_note_unauthorized", {});
    return NextResponse.redirect(new URL("/admin/login", request.url), 302);
  }
  const { actorId } = session;

  const ip = getClientIp(request.headers);
  if (!rateLimit({ key: `admin-case-note:${ip}`, limit: 30, windowMs: 60_000 })) {
    logWarn("case_note_rate_limited", { ip });
    return back(request, "", "error=rate-limited");
  }

  const formData = await request.formData();
  if (!validateCsrf(cookieStore, formData)) {
    logWarn("case_note_csrf_failed", {});
    return back(request, "", "error=csrf");
  }

  const parsed = schema.safeParse({
    id: formData.get("id"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    const rawId = String(formData.get("id") ?? "");
    const issue = parsed.error.issues[0]?.message ?? "invalid";
    const code = issue === "empty" ? "empty" : issue === "too-long" ? "too-long" : "invalid";
    return back(request, rawId, `error=${code}`);
  }

  const { id, body } = parsed.data;

  try {
    const note = await addCaseNote({
      caseId: id,
      body,
      adminActorId: actorId,
    });

    await appendAuditLog({
      actorId,
      action: "case.note_added",
      resourceType: "contact_message",
      resourceId: id,
      before: null,
      after: { noteId: note.id, length: body.length },
      ip,
    });

    logInfo("case_note_added", { id, noteId: note.id });
    return back(request, id, "noted=1");
  } catch (err) {
    logError("case_note_error", {
      error: (err instanceof Error ? err.message : String(err)).substring(0, 200),
    });
    return back(request, id, "error=server");
  }
}

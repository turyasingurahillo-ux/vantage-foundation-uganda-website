import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { addCaseAction, completeCaseAction } from "@/lib/db/case-history";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { logWarn } from "@/lib/logger";
import { appendAuditLog } from "@/lib/db/audit";

const addActionSchema = z.object({
  caseId: z.coerce.number().int().positive(),
  title: z.string().min(1).max(300),
  ownerId: z.string().max(100).nullable().optional(),
  dueAt: z.string().datetime().nullable().optional(),
  note: z.string().max(2000).nullable().optional(),
});

const completeActionSchema = z.object({
  actionId: z.coerce.number().int().positive(),
  note: z.string().max(2000).nullable().optional(),
});

function back(request: Request, caseId: number | string, params: string) {
  return NextResponse.redirect(
    new URL(`/admin/messages?open=${caseId}&${params}`, request.url),
    303,
  );
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = verifySessionToken(
    cookieStore.get(sessionCookieName)?.value,
  );
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url), 302);
  }
  const { actorId } = session;

  const ip = getClientIp(request.headers);
  if (!rateLimit({ key: `admin-case-action:${ip}`, limit: 30, windowMs: 60_000 })) {
    logWarn("case_action_rate_limited", { ip });
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }

  const formData = await request.formData();
  if (!validateCsrf(cookieStore, formData)) {
    logWarn("case_action_csrf_failed", {});
    return NextResponse.json({ error: "csrf" }, { status: 403 });
  }

  const intent = formData.get("intent");
  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key === "csrf_token") continue;
    raw[key] = value === "" ? null : value;
  }

  try {
    if (intent === "complete") {
      const parsed = completeActionSchema.safeParse(raw);
      if (!parsed.success) {
        return NextResponse.json({ error: "invalid" }, { status: 400 });
      }
      const completed = await completeCaseAction(
        parsed.data.actionId,
        parsed.data.note ?? undefined,
      );
      if (completed) {
        await appendAuditLog({
          action: "case_action.complete",
          actorId,
          resourceType: "case_action",
          resourceId: String(completed.id),
          before: { status: "open" },
          after: { status: "completed" },
          ip,
        });
      }
      return back(request, completed?.caseId ?? "", "action=completed");
    }

    // Default: add action
    const parsed = addActionSchema.safeParse(raw);
    if (!parsed.success) {
      logWarn("case_action_invalid", { issues: parsed.error.issues.length });
      return back(request, String(raw.caseId ?? ""), "error=action-invalid");
    }

    const action = await addCaseAction({
      caseId: parsed.data.caseId,
      title: parsed.data.title,
      ownerId: parsed.data.ownerId,
      dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null,
      note: parsed.data.note,
      adminActorId: actorId,
    });

    await appendAuditLog({
      action: "case_action.add",
      actorId,
      resourceType: "case_action",
      resourceId: String(action.id),
      before: null,
      after: { caseId: action.caseId, title: action.title },
      ip,
    });

    return back(request, parsed.data.caseId, "action=added");
  } catch (error) {
    logWarn("case_action_error", { error: String(error) });
    return back(request, String(raw.caseId ?? ""), "error=action-server");
  }
}

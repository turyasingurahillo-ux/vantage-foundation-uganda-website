import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { CASE_DECISION_VALUES, type CaseDecision } from "@/lib/organisation-types";
import { addCaseDecision } from "@/lib/db/case-history";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { logWarn } from "@/lib/logger";
import { appendAuditLog } from "@/lib/db/audit";

const decisionSchema = z.object({
  caseId: z.coerce.number().int().positive(),
  decision: z.enum(CASE_DECISION_VALUES),
  decisionMakerId: z.string().max(100).nullable().optional(),
  rationale: z.string().max(5000).nullable().optional(),
  conditions: z.string().max(5000).nullable().optional(),
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
  if (!rateLimit({ key: `admin-case-decision:${ip}`, limit: 20, windowMs: 60_000 })) {
    logWarn("case_decision_rate_limited", { ip });
    return back(request, "", "error=rate-limited");
  }

  const formData = await request.formData();
  if (!validateCsrf(cookieStore, formData)) {
    logWarn("case_decision_csrf_failed", {});
    return back(request, "", "error=csrf");
  }

  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key === "csrf_token") continue;
    raw[key] = value === "" ? null : value;
  }

  const parsed = decisionSchema.safeParse(raw);
  if (!parsed.success) {
    logWarn("case_decision_invalid", { issues: parsed.error.issues.length });
    return back(request, String(raw.caseId ?? ""), "error=decision-invalid");
  }

  const data = parsed.data;
  try {
    const decision = await addCaseDecision({
      caseId: data.caseId,
      decision: data.decision as CaseDecision,
      decisionMakerId: data.decisionMakerId,
      rationale: data.rationale,
      conditions: data.conditions,
      adminActorId: actorId,
    });

    await appendAuditLog({
      action: "case_decision.add",
      actorId,
      resourceType: "case_decision",
      resourceId: String(decision.id),
      before: null,
      after: { caseId: decision.caseId, decision: decision.decision },
      ip,
    });

    return back(request, data.caseId, "decision=recorded");
  } catch (error) {
    logWarn("case_decision_error", { error: String(error) });
    return back(request, String(raw.caseId ?? ""), "error=decision-server");
  }
}

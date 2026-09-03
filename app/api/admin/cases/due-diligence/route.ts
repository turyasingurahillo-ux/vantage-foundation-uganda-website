import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  DUE_DILIGENCE_STATUS_VALUES,
  DUE_DILIGENCE_CHECKS,
  type DueDiligenceLevel,
  type DueDiligenceStatus,
} from "@/lib/organisation-types";
import { upsertDueDiligenceCheck } from "@/lib/db/organisations";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { logWarn } from "@/lib/logger";
import { appendAuditLog } from "@/lib/db/audit";

const checkSchema = z.object({
  organisationId: z.coerce.number().int().positive(),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  checkKey: z.string().min(1).max(100),
  status: z.enum(DUE_DILIGENCE_STATUS_VALUES),
  reviewerId: z.string().max(100).nullable().optional(),
  note: z.string().max(2000).nullable().optional(),
  documentRef: z.string().max(500).nullable().optional(),
});

function back(request: Request, orgId: number | string, params: string) {
  return NextResponse.redirect(
    new URL(`/admin/organisations/${orgId}?${params}#due-diligence`, request.url),
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
  if (!rateLimit({ key: `admin-dd-check:${ip}`, limit: 30, windowMs: 60_000 })) {
    logWarn("dd_check_rate_limited", { ip });
    return back(request, "", "error=rate-limited");
  }

  const formData = await request.formData();
  if (!validateCsrf(cookieStore, formData)) {
    logWarn("dd_check_csrf_failed", {});
    return back(request, "", "error=csrf");
  }

  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key === "csrf_token") continue;
    raw[key] = value === "" ? null : value;
  }

  const parsed = checkSchema.safeParse(raw);
  if (!parsed.success) {
    logWarn("dd_check_invalid", { issues: parsed.error.issues.length });
    return back(request, String(raw.organisationId ?? ""), "error=dd-invalid");
  }

  const data = parsed.data;
  const checkDef = DUE_DILIGENCE_CHECKS.find(
    (c) => c.key === data.checkKey && c.level === data.level,
  );
  if (!checkDef) {
    return back(request, data.organisationId, "error=dd-unknown-check");
  }

  try {
    const check = await upsertDueDiligenceCheck({
      organisationId: data.organisationId,
      level: data.level as DueDiligenceLevel,
      checkKey: data.checkKey,
      label: checkDef.label,
      status: data.status as DueDiligenceStatus,
      reviewerId: data.reviewerId,
      note: data.note,
      documentRef: data.documentRef,
    });

    await appendAuditLog({
      action: "due_diligence.update",
      actorId,
      resourceType: "due_diligence_check",
      resourceId: String(check.id),
      before: null,
      after: { organisationId: check.organisationId, checkKey: check.checkKey, status: check.status },
      ip,
    });

    return back(request, data.organisationId, "dd=updated");
  } catch (error) {
    logWarn("dd_check_error", { error: String(error) });
    return back(request, String(raw.organisationId ?? ""), "error=dd-server");
  }
}

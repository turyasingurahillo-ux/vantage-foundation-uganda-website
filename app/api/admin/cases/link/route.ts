import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { linkCaseToOrganisation, linkCaseToPerson } from "@/lib/db/organisations";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { logWarn } from "@/lib/logger";
import { appendAuditLog } from "@/lib/db/audit";

const linkSchema = z.object({
  caseId: z.coerce.number().int().positive(),
  organisationId: z.coerce.number().int().positive().nullable().optional(),
  personId: z.coerce.number().int().positive().nullable().optional(),
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
  if (!rateLimit({ key: `admin-case-link:${ip}`, limit: 20, windowMs: 60_000 })) {
    logWarn("case_link_rate_limited", { ip });
    return back(request, "", "error=rate-limited");
  }

  const formData = await request.formData();
  if (!validateCsrf(cookieStore, formData)) {
    logWarn("case_link_csrf_failed", {});
    return back(request, "", "error=csrf");
  }

  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key === "csrf_token") continue;
    raw[key] = value === "" ? null : value;
  }

  const parsed = linkSchema.safeParse(raw);
  if (!parsed.success) {
    logWarn("case_link_invalid", { issues: parsed.error.issues.length });
    return back(request, String(raw.caseId ?? ""), "error=link-invalid");
  }

  const data = parsed.data;
  try {
    if (data.organisationId !== undefined) {
      await linkCaseToOrganisation(data.caseId, data.organisationId);
      await appendAuditLog({
        action: "case.link_organisation",
        actorId,
        resourceType: "case",
        resourceId: String(data.caseId),
        before: null,
        after: { organisationId: data.organisationId },
        ip,
      });
    }
    if (data.personId !== undefined) {
      await linkCaseToPerson(data.caseId, data.personId);
      await appendAuditLog({
        action: "case.link_person",
        actorId,
        resourceType: "case",
        resourceId: String(data.caseId),
        before: null,
        after: { personId: data.personId },
        ip,
      });
    }
    return back(request, data.caseId, "link=updated");
  } catch (error) {
    logWarn("case_link_error", { error: String(error) });
    return back(request, String(raw.caseId ?? ""), "error=link-server");
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { CONTACT_CATEGORY_VALUES } from "@/lib/contact-categories";
import {
  CASE_SOURCE_VALUES,
  CASE_TYPE_VALUES,
  CASE_PROGRAMME_VALUES,
  CASE_PRIORITY_VALUES,
  type CaseSource,
  type CaseType,
  type CaseProgramme,
  type CasePriority,
} from "@/lib/case-types";
import { createManualCase } from "@/lib/db/cases";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { logInfo, logWarn, logError } from "@/lib/logger";
import { appendAuditLog } from "@/lib/db/audit";

/**
 * Creates a case from a non-website intake channel (WhatsApp, phone, social
 * media, referral, walk-in, direct email, other).
 *
 * This reuses the contact_messages table so the case has the full
 * reply/note/audit infrastructure. The `source` column distinguishes
 * website-form submissions from manual intake, and the `workflow_status`
 * starts at 'triage' (not 'new') because a manual intake has already been
 * received by a person.
 *
 * Security model: session verified, CSRF double-submit, rate-limited, audited.
 * The message body is length-bounded. Email is optional for non-email sources.
 */

const MAX_NAME = 100;
const MAX_ORGANISATION = 150;
const MAX_PHONE = 40;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;

const schema = z.object({
  name: z.string().trim().min(2, "name").max(MAX_NAME, "name"),
  email: z.string().trim().max(MAX_EMAIL, "email").email("email").optional(),
  phone: z.string().trim().max(MAX_PHONE, "phone").optional(),
  organisation: z.string().trim().max(MAX_ORGANISATION, "organisation").optional(),
  category: z.enum(CONTACT_CATEGORY_VALUES, { message: "category" }),
  caseType: z.enum(CASE_TYPE_VALUES).optional(),
  programme: z.enum(CASE_PROGRAMME_VALUES).optional(),
  source: z.enum(CASE_SOURCE_VALUES, { message: "source" }),
  message: z.string().trim().min(10, "message").max(MAX_MESSAGE, "message"),
  priority: z.enum(CASE_PRIORITY_VALUES).optional(),
  ownerId: z.string().max(100).optional(),
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
    logWarn("case_intake_unauthorized", {});
    return NextResponse.redirect(new URL("/admin/login", request.url), 302);
  }
  const { actorId } = session;

  const ip = getClientIp(request.headers);
  if (!rateLimit({ key: `admin-case-intake:${ip}`, limit: 20, windowMs: 60_000 })) {
    logWarn("case_intake_rate_limited", { ip });
    return back(request, "error=rate-limited");
  }

  const formData = await request.formData();
  if (!validateCsrf(cookieStore, formData)) {
    logWarn("case_intake_csrf_failed", {});
    return back(request, "error=csrf");
  }

  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key === "csrf_token") continue;
    raw[key] = value === "" ? undefined : value;
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    logWarn("case_intake_invalid", {
      issues: parsed.error.issues.length,
    });
    const issue = parsed.error.issues[0]?.message ?? "invalid";
    return back(request, `error=invalid&field=${issue}`);
  }

  const data = parsed.data;

  try {
    const caseId = await createManualCase({
      name: data.name,
      email: data.email,
      phone: data.phone,
      organisation: data.organisation,
      category: data.category,
      caseType: data.caseType as CaseType | undefined,
      programme: data.programme as CaseProgramme | undefined,
      source: data.source as CaseSource,
      message: data.message,
      priority: data.priority as CasePriority | undefined,
      ownerId: data.ownerId,
    });

    await appendAuditLog({
      actorId,
      action: "case.manual_intake",
      resourceType: "contact_message",
      resourceId: caseId,
      before: null,
      after: {
        source: data.source,
        category: data.category,
        caseType: data.caseType,
        name: data.name,
        organisation: data.organisation,
      },
      ip,
    });

    logInfo("case_manual_intake", {
      id: caseId,
      source: data.source,
      category: data.category,
    });
    return back(request, `open=${caseId}&created=1`);
  } catch (err) {
    logError("case_intake_error", {
      error: (err instanceof Error ? err.message : String(err)).substring(0, 200),
    });
    return back(request, "error=server");
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  CASE_REFERRAL_STATUS_VALUES,
  CASE_REFERRAL_OUTCOME_VALUES,
  type CaseReferralStatus,
  type CaseReferralOutcome,
} from "@/lib/organisation-types";
import {
  addCaseReferral,
  updateCaseReferral,
  setCaseReferralOutcome,
} from "@/lib/db/case-history";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { logWarn } from "@/lib/logger";
import { appendAuditLog } from "@/lib/db/audit";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const addSchema = z.object({
  caseId: z.coerce.number().int().positive(),
  organisationId: z.coerce.number().int().positive().nullable().optional(),
  opportunityName: z.string().min(1).max(300),
  referredToName: z.string().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  urlReference: z.string().max(500).nullable().optional(),
  referredBy: z.string().max(200).nullable().optional(),
  referredAt: z.string().regex(dateRegex).nullable().optional(),
  followUpAt: z.string().regex(dateRegex).nullable().optional(),
  status: z.enum(CASE_REFERRAL_STATUS_VALUES).optional(),
  notes: z.string().max(5000).nullable().optional(),
});

const updateSchema = z.object({
  referralId: z.coerce.number().int().positive(),
  opportunityName: z.string().min(1).max(300).optional(),
  referredToName: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  urlReference: z.string().max(500).nullable().optional(),
  referredBy: z.string().max(200).nullable().optional(),
  referredAt: z.string().regex(dateRegex).nullable().optional(),
  followUpAt: z.string().regex(dateRegex).nullable().optional(),
  status: z.enum(CASE_REFERRAL_STATUS_VALUES).optional(),
  notes: z.string().max(5000).nullable().optional(),
});

const outcomeSchema = z.object({
  referralId: z.coerce.number().int().positive(),
  outcome: z.enum(CASE_REFERRAL_OUTCOME_VALUES),
  notes: z.string().max(5000).nullable().optional(),
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
  if (!rateLimit({ key: `admin-referral:${ip}`, limit: 30, windowMs: 60_000 })) {
    logWarn("referral_rate_limited", { ip });
    return back(request, "", "error=rate-limited");
  }

  const formData = await request.formData();
  if (!validateCsrf(cookieStore, formData)) {
    logWarn("referral_csrf_failed", {});
    return back(request, "", "error=csrf");
  }

  const intent = formData.get("intent");
  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key === "csrf_token") continue;
    raw[key] = value === "" ? null : value;
  }

  try {
    if (intent === "outcome") {
      const parsed = outcomeSchema.safeParse(raw);
      if (!parsed.success) {
        logWarn("referral_outcome_invalid", { issues: parsed.error.issues.length });
        return back(request, "", "error=referral-invalid");
      }
      const updated = await setCaseReferralOutcome(
        parsed.data.referralId,
        parsed.data.outcome as CaseReferralOutcome,
        parsed.data.notes ?? undefined,
      );
      if (updated) {
        await appendAuditLog({
          action: "referral.outcome",
          actorId,
          resourceType: "case_referral",
          resourceId: String(updated.id),
          before: null,
          after: { outcome: updated.outcome, status: updated.status },
          ip,
        });
        return back(request, updated.caseId, "referral=outcome");
      }
      return back(request, "", "error=referral-notfound");
    }

    if (intent === "update") {
      const parsed = updateSchema.safeParse(raw);
      if (!parsed.success) {
        logWarn("referral_update_invalid", { issues: parsed.error.issues.length });
        return back(request, "", "error=referral-invalid");
      }
      const updated = await updateCaseReferral(parsed.data.referralId, {
        opportunityName: parsed.data.opportunityName,
        referredToName: parsed.data.referredToName,
        description: parsed.data.description,
        urlReference: parsed.data.urlReference,
        referredBy: parsed.data.referredBy,
        referredAt: parsed.data.referredAt ? new Date(parsed.data.referredAt) : undefined,
        followUpAt: parsed.data.followUpAt ? new Date(parsed.data.followUpAt) : undefined,
        status: parsed.data.status as CaseReferralStatus | undefined,
        notes: parsed.data.notes,
      });
      if (updated) {
        await appendAuditLog({
          action: "referral.update",
          actorId,
          resourceType: "case_referral",
          resourceId: String(updated.id),
          before: null,
          after: { status: updated.status, followUpAt: updated.followUpAt },
          ip,
        });
        return back(request, updated.caseId, "referral=updated");
      }
      return back(request, "", "error=referral-notfound");
    }

    // Default: add referral
    const parsed = addSchema.safeParse(raw);
    if (!parsed.success) {
      logWarn("referral_add_invalid", { issues: parsed.error.issues.length });
      return back(request, String(raw.caseId ?? ""), "error=referral-invalid");
    }

    const data = parsed.data;
    const referral = await addCaseReferral({
      caseId: data.caseId,
      organisationId: data.organisationId,
      opportunityName: data.opportunityName,
      referredToName: data.referredToName,
      description: data.description,
      urlReference: data.urlReference,
      referredBy: data.referredBy,
      referredAt: data.referredAt ? new Date(data.referredAt) : null,
      followUpAt: data.followUpAt ? new Date(data.followUpAt) : null,
      status: data.status,
      notes: data.notes,
      adminActorId: actorId,
    });

    await appendAuditLog({
      action: "referral.add",
      actorId,
      resourceType: "case_referral",
      resourceId: String(referral.id),
      before: null,
      after: {
        caseId: referral.caseId,
        referredToName: referral.referredToName,
        status: referral.status,
      },
      ip,
    });

    return back(request, data.caseId, "referral=added");
  } catch (error) {
    logWarn("referral_error", { error: String(error) });
    return back(request, String(raw.caseId ?? ""), "error=referral-server");
  }
}

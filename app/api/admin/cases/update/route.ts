import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  CASE_WORKFLOW_STATUS_VALUES,
  CASE_TYPE_VALUES,
  CASE_PROGRAMME_VALUES,
  CASE_PRIORITY_VALUES,
  CASE_RISK_LEVEL_VALUES,
  CASE_STRATEGIC_VALUE_VALUES,
  CASE_OUTCOME_VALUES,
  DECLINE_REASON_VALUES,
  REFERRAL_OUTCOME_VALUES,
  type CaseWorkflowStatus,
  type CaseType,
  type CaseProgramme,
  type CasePriority,
  type CaseRiskLevel,
  type CaseStrategicValue,
  type CaseOutcome,
  type DeclineReason,
  type ReferralOutcome,
} from "@/lib/case-types";
import { updateCase, getCaseById } from "@/lib/db/cases";
import { stampTriagedIfFirst } from "@/lib/db/case-history";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { logInfo, logWarn, logError } from "@/lib/logger";
import { appendAuditLog } from "@/lib/db/audit";

/**
 * Updates the case-workflow fields on a contact message.
 *
 * This is the single mutation point for case management: workflow status,
 * case type, programme, priority, risk, strategic value, owner, collaborators,
 * next action + due date, outcome, decline reason/detail, and referral
 * fields. The message delivery state (status) and reply history are NOT
 * touched here — those are owned by the reply route and lib/db/contact.ts.
 *
 * Security model mirrors the reply route: session verified in the mutation,
 * CSRF double-submit, rate-limited per admin IP, every change audited with
 * before/after snapshots.
 */

const nullableDate = z.string().datetime().nullable().optional();

const updateSchema = z.object({
  id: z.coerce.number().int().positive(),
  workflowStatus: z.enum(CASE_WORKFLOW_STATUS_VALUES).optional(),
  caseType: z.enum(CASE_TYPE_VALUES).nullable().optional(),
  programme: z.enum(CASE_PROGRAMME_VALUES).nullable().optional(),
  priority: z.enum(CASE_PRIORITY_VALUES).optional(),
  riskLevel: z.enum(CASE_RISK_LEVEL_VALUES).optional(),
  strategicValue: z.enum(CASE_STRATEGIC_VALUE_VALUES).optional(),
  ownerId: z.string().max(100).nullable().optional(),
  collaborators: z.array(z.string().max(100)).max(20).optional(),
  nextAction: z.string().max(500).nullable().optional(),
  nextActionDueAt: nullableDate,
  outcome: z.enum(CASE_OUTCOME_VALUES).nullable().optional(),
  declineReason: z.enum(DECLINE_REASON_VALUES).nullable().optional(),
  declineDetail: z.string().max(2000).nullable().optional(),
  referralOrg: z.string().max(200).nullable().optional(),
  referralDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  referralLink: z.string().max(500).nullable().optional(),
  referralFollowupDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  referralOutcome: z.enum(REFERRAL_OUTCOME_VALUES).nullable().optional(),
  referralDetail: z.string().max(2000).nullable().optional(),
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
    logWarn("case_update_unauthorized", {});
    return NextResponse.redirect(new URL("/admin/login", request.url), 302);
  }
  const { actorId } = session;

  const ip = getClientIp(request.headers);
  if (!rateLimit({ key: `admin-case-update:${ip}`, limit: 30, windowMs: 60_000 })) {
    logWarn("case_update_rate_limited", { ip });
    return back(request, "", "error=rate-limited");
  }

  const formData = await request.formData();
  if (!validateCsrf(cookieStore, formData)) {
    logWarn("case_update_csrf_failed", {});
    return back(request, "", "error=csrf");
  }

  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key === "csrf_token") continue;
    if (key === "collaborators") {
      const existing = raw.collaborators;
      if (Array.isArray(existing)) {
        (existing as string[]).push(String(value));
      } else {
        raw.collaborators = [String(value)];
      }
    } else {
      raw[key] = value === "" ? null : value;
    }
  }

  const parsed = updateSchema.safeParse(raw);
  if (!parsed.success) {
    logWarn("case_update_invalid", {
      issues: parsed.error.issues.length,
    });
    const rawId = String(formData.get("id") ?? "");
    return back(request, rawId, "error=invalid");
  }

  const data = parsed.data;
  const id = data.id;

  try {
    const before = await getCaseById(id);
    if (!before) {
      return back(request, id, "error=notfound");
    }

    const input: Parameters<typeof updateCase>[1] = {};
    if (data.workflowStatus !== undefined)
      input.workflowStatus = data.workflowStatus as CaseWorkflowStatus;
    if (data.caseType !== undefined)
      input.caseType = data.caseType as CaseType | null;
    if (data.programme !== undefined)
      input.programme = data.programme as CaseProgramme | null;
    if (data.priority !== undefined)
      input.priority = data.priority as CasePriority;
    if (data.riskLevel !== undefined)
      input.riskLevel = data.riskLevel as CaseRiskLevel;
    if (data.strategicValue !== undefined)
      input.strategicValue = data.strategicValue as CaseStrategicValue;
    if (data.ownerId !== undefined) input.ownerId = data.ownerId;
    if (data.collaborators !== undefined) input.collaborators = data.collaborators;
    if (data.nextAction !== undefined) input.nextAction = data.nextAction;
    if (data.nextActionDueAt !== undefined)
      input.nextActionDueAt = data.nextActionDueAt
        ? new Date(data.nextActionDueAt)
        : null;
    if (data.outcome !== undefined)
      input.outcome = data.outcome as CaseOutcome | null;
    if (data.declineReason !== undefined)
      input.declineReason = data.declineReason as DeclineReason | null;
    if (data.declineDetail !== undefined) input.declineDetail = data.declineDetail;
    if (data.referralOrg !== undefined) input.referralOrg = data.referralOrg;
    if (data.referralDate !== undefined)
      input.referralDate = data.referralDate ? new Date(data.referralDate) : null;
    if (data.referralLink !== undefined) input.referralLink = data.referralLink;
    if (data.referralFollowupDate !== undefined)
      input.referralFollowupDate = data.referralFollowupDate
        ? new Date(data.referralFollowupDate)
        : null;
    if (data.referralOutcome !== undefined)
      input.referralOutcome = data.referralOutcome as ReferralOutcome | null;
    if (data.referralDetail !== undefined) input.referralDetail = data.referralDetail;

    const after = await updateCase(id, input);
    if (!after) {
      return back(request, id, "error=notfound");
    }

    // Stamp triaged_at when the case moves from 'new' to any triaged state
    if (
      before.workflowStatus === "new" &&
      after.workflowStatus !== "new" &&
      after.workflowStatus !== "archived"
    ) {
      try {
        await stampTriagedIfFirst(id);
      } catch {
        // Non-fatal — the update still succeeded
      }
    }

    await appendAuditLog({
      actorId,
      action: "case.update",
      resourceType: "contact_message",
      resourceId: id,
      before: {
        workflowStatus: before.workflowStatus,
        caseType: before.caseType,
        priority: before.priority,
        riskLevel: before.riskLevel,
        ownerId: before.ownerId,
        nextAction: before.nextAction,
        nextActionDueAt: before.nextActionDueAt?.toISOString() ?? null,
        outcome: before.outcome,
        declineReason: before.declineReason,
        referralOrg: before.referralOrg,
        referralOutcome: before.referralOutcome,
      },
      after: {
        workflowStatus: after.workflowStatus,
        caseType: after.caseType,
        priority: after.priority,
        riskLevel: after.riskLevel,
        ownerId: after.ownerId,
        nextAction: after.nextAction,
        nextActionDueAt: after.nextActionDueAt?.toISOString() ?? null,
        outcome: after.outcome,
        declineReason: after.declineReason,
        referralOrg: after.referralOrg,
        referralOutcome: after.referralOutcome,
      },
      ip,
    });

    logInfo("case_updated", {
      id,
      workflowStatus: after.workflowStatus,
      priority: after.priority,
      ownerId: after.ownerId,
    });
    return back(request, id, "updated=1");
  } catch (err) {
    logError("case_update_error", {
      error: (err instanceof Error ? err.message : String(err)).substring(0, 200),
    });
    return back(request, id, "error=server");
  }
}

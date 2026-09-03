import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  COMMUNICATION_CHANNEL_VALUES,
  type CommunicationChannel,
  type CommunicationDirection,
} from "@/lib/organisation-types";
import { addCaseCommunication } from "@/lib/db/case-history";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { logWarn } from "@/lib/logger";
import { appendAuditLog } from "@/lib/db/audit";

const commSchema = z.object({
  caseId: z.coerce.number().int().positive(),
  direction: z.enum(["inbound", "outbound"] as [string, ...string[]]),
  channel: z.enum(COMMUNICATION_CHANNEL_VALUES as unknown as [string, ...string[]]),
  occurredAt: z.string().datetime().nullable().optional(),
  summary: z.string().min(1).max(2000),
  staffMember: z.string().max(200).nullable().optional(),
  isInternal: z.string().optional(),
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
  if (!rateLimit({ key: `admin-case-comm:${ip}`, limit: 30, windowMs: 60_000 })) {
    logWarn("case_comm_rate_limited", { ip });
    return back(request, "", "error=rate-limited");
  }

  const formData = await request.formData();
  if (!validateCsrf(cookieStore, formData)) {
    logWarn("case_comm_csrf_failed", {});
    return back(request, "", "error=csrf");
  }

  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key === "csrf_token") continue;
    raw[key] = value === "" ? null : value;
  }
  raw.isInternal = formData.has("isInternal") ? "true" : null;

  const parsed = commSchema.safeParse(raw);
  if (!parsed.success) {
    logWarn("case_comm_invalid", { issues: parsed.error.issues.length });
    return back(request, String(raw.caseId ?? ""), "error=comm-invalid");
  }

  const data = parsed.data;
  try {
    const comm = await addCaseCommunication({
      caseId: data.caseId,
      direction: data.direction as CommunicationDirection,
      channel: data.channel as CommunicationChannel,
      occurredAt: data.occurredAt ? new Date(data.occurredAt) : null,
      summary: data.summary,
      staffMember: data.staffMember,
      isInternal: data.isInternal === "true",
      adminActorId: actorId,
    });

    await appendAuditLog({
      action: "case_communication.add",
      actorId,
      resourceType: "case_communication",
      resourceId: String(comm.id),
      before: null,
      after: { caseId: comm.caseId, channel: comm.channel, direction: comm.direction },
      ip,
    });

    return back(request, data.caseId, "comm=logged");
  } catch (error) {
    logWarn("case_comm_error", { error: String(error) });
    return back(request, String(raw.caseId ?? ""), "error=comm-server");
  }
}

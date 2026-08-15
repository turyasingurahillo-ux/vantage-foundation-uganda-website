import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  updateDonationStatus,
  getDonationById,
} from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { verifySessionToken, sessionCookieName, BOOTSTRAP_ACTOR_ID } from "@/lib/session";
import { logInfo, logWarn, logError } from "@/lib/logger";
import { appendAuditLog } from "@/lib/db/audit";

const validStatuses = ["pending", "verified", "rejected"] as const;

const verifySchema = z.object({
  id: z.coerce.number().int().positive(),
  status: z.enum(validStatuses),
  adminNotes: z.string().optional().default(""),
  csrf_token: z.string().optional(),
});

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get(sessionCookieName)?.value;

  // Verify the signed session token (HMAC-based, not the raw secret).
  const session = verifySessionToken(adminCookie);
  if (!session) {
    logWarn("verify_unauthorized", {});
    return NextResponse.redirect(new URL("/admin/login", request.url), 302);
  }
  const { actorId } = session;

  // Rate limit status changes: 20 per minute per admin IP.
  const ip = getClientIp(request.headers);
  if (!rateLimit({ key: `admin-verify:${ip}`, limit: 20, windowMs: 60_000 })) {
    logWarn("verify_rate_limited", { ip });
    return NextResponse.redirect(
      new URL("/admin/donations?error=rate-limited", request.url),
      303
    );
  }

  const formData = await request.formData();

  // CSRF validation (double-submit cookie).
  if (!validateCsrf(cookieStore, formData)) {
    logWarn("verify_csrf_failed", {});
    return NextResponse.redirect(
      new URL("/admin/donations?error=csrf", request.url),
      303
    );
  }

  const parsed = verifySchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    adminNotes: (formData.get("adminNotes") as string) || "",
  });

  if (!parsed.success) {
    logWarn("verify_validation_failed", {
      issues: parsed.error.issues.length,
    });
    return NextResponse.redirect(
      new URL("/admin/donations?error=invalid", request.url),
      303
    );
  }

  const { id, status, adminNotes } = parsed.data;

  try {
    // Fetch the current donation to capture the before-state for audit logging.
    const before = await getDonationById(id);
    if (!before) {
      logWarn("verify_donation_not_found", { id });
      return NextResponse.redirect(
        new URL("/admin/donations?error=notfound", request.url),
        303
      );
    }

    // Only log and update if the status is actually changing.
    const statusChanged = before.status !== status;
    const notesChanged = (before.adminNotes || "") !== (adminNotes || "");

    if (!statusChanged && !notesChanged) {
      // No change — skip the update and redirect.
      return NextResponse.redirect(
        new URL("/admin/donations?noop=1", request.url),
        303
      );
    }

    await updateDonationStatus(id, status, adminNotes);

    const action = `donation.${status}`;
    const after = {
      status,
      adminNotes: adminNotes ? "(set)" : "(empty)",
      verifiedAt: status === "verified" ? new Date().toISOString() : null,
    };

    // Structured log (retained for operational visibility).
    logInfo("donation_status_updated", {
      id,
      before_status: before.status,
      after_status: status,
      before_notes: before.adminNotes ? "(set)" : "(empty)",
      after_notes: adminNotes ? "(set)" : "(empty)",
      status_changed: statusChanged,
      actor: actorId,
      admin_ip: ip,
    });

    // Immutable audit log row with before/after snapshot and actor identity.
    await appendAuditLog({
      actorId,
      actorKind: actorId === BOOTSTRAP_ACTOR_ID ? "bootstrap" : "admin",
      action,
      resourceType: "donation",
      resourceId: id,
      before: {
        status: before.status,
        adminNotes: before.adminNotes ? "(set)" : "(empty)",
      },
      after,
      ip,
    });

    return NextResponse.redirect(
      new URL("/admin/donations?updated=1", request.url),
      303
    );
  } catch (err) {
    logError("donation_update_failed", {
      id,
      status,
      error: (err instanceof Error ? err.message : String(err)).substring(0, 200),
    });
    return NextResponse.redirect(
      new URL("/admin/donations?error=db", request.url),
      303
    );
  }
}

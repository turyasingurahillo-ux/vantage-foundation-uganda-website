import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifySessionToken, sessionCookieName, BOOTSTRAP_ACTOR_ID } from "@/lib/session";
import { validateCsrf, validateCsrfHeader, CSRF_HEADER_NAME } from "@/lib/csrf";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { logWarn, logInfo, logError } from "@/lib/logger";
import { createAdmin, getAdmins, disableAdmin } from "@/lib/db/admins";
import { hashPassword } from "@/lib/password";
import { appendAuditLog } from "@/lib/db/audit";

// ---------------------------------------------------------------------------
// Shared auth + CSRF + rate-limit guard.
// ---------------------------------------------------------------------------

async function guard(
  request: Request
): Promise<{ ok: true; ip: string; actorId: string } | { ok: false; response: NextResponse }> {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(sessionCookieName)?.value);
  if (!session) {
    logWarn("admins_api_unauthorized", {});
    return { ok: false, response: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }
  const ip = getClientIp(request.headers);
  if (!rateLimit({ key: `admins-api:${ip}`, limit: 20, windowMs: 60_000 })) {
    logWarn("admins_api_rate_limited", { ip });
    return { ok: false, response: NextResponse.json({ error: "rate-limited" }, { status: 429 }) };
  }
  return { ok: true, ip, actorId: session.actorId };
}

// ---------------------------------------------------------------------------
// GET /api/admin/admins — list all admins (including disabled).
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  const guardResult = await guard(request);
  if (!guardResult.ok) return guardResult.response;
  const { ip } = guardResult;

  try {
    const admins = await getAdmins();
    // Never return password hashes to the client.
    const safe = admins.map((a) => ({
      id: a.id,
      username: a.username,
      createdAt: a.createdAt,
      disabledAt: a.disabledAt,
    }));
    logInfo("admins_list_ok", { count: safe.length, ip });
    return NextResponse.json({ items: safe });
  } catch (err) {
    logError("admins_list_failed", {
      error: (err instanceof Error ? err.message : String(err)).substring(0, 200),
    });
    return NextResponse.json({ error: "db" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/admins — create a new admin.
// ---------------------------------------------------------------------------

const createSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username may only contain letters, numbers, hyphens and underscores"),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .max(200, "Password is too long"),
  csrf_token: z.string().optional(),
});

export async function POST(request: Request) {
  const guardResult = await guard(request);
  if (!guardResult.ok) return guardResult.response;
  const { ip, actorId } = guardResult;

  const cookieStore = await cookies();
  const contentType = request.headers.get("content-type") ?? "";
  let body: unknown;
  if (contentType.includes("application/json")) {
    if (!validateCsrfHeader(cookieStore, request.headers.get(CSRF_HEADER_NAME))) {
      logWarn("admins_create_csrf_failed", { ip });
      return NextResponse.json({ error: "csrf" }, { status: 403 });
    }
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "invalid-json" }, { status: 400 });
    }
  } else {
    const formData = await request.formData();
    if (!validateCsrf(cookieStore, formData)) {
      logWarn("admins_create_csrf_failed", { ip });
      return NextResponse.json({ error: "csrf" }, { status: 403 });
    }
    body = {
      username: formData.get("username"),
      password: formData.get("password"),
    };
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid", issues: parsed.error.issues.map((i) => i.message) },
      { status: 400 }
    );
  }

  try {
    const passwordHash = hashPassword(parsed.data.password);
    const admin = await createAdmin(parsed.data.username, passwordHash);
    logInfo("admin_created", { id: admin.id, username: admin.username, ip, actor: actorId });
    await appendAuditLog({
      actorId,
      actorKind: actorId === BOOTSTRAP_ACTOR_ID ? "bootstrap" : "admin",
      action: "admin.created",
      resourceType: "admin",
      resourceId: admin.id,
      after: { username: admin.username },
      ip,
    });
    // Never return the password hash.
    return NextResponse.json(
      { item: { id: admin.id, username: admin.username, createdAt: admin.createdAt, disabledAt: admin.disabledAt } },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Unique constraint violation on username.
    if (message.includes("unique") || message.includes("duplicate")) {
      return NextResponse.json({ error: "duplicate", issues: ["Username already exists"] }, { status: 409 });
    }
    logError("admin_create_failed", {
      error: message.substring(0, 200),
    });
    return NextResponse.json({ error: "db" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/admins — disable an admin (soft-delete, retained for audit).
// ---------------------------------------------------------------------------

const deleteSchema = z.object({
  id: z.coerce.number().int().positive(),
  csrf_token: z.string().optional(),
});

export async function DELETE(request: Request) {
  const guardResult = await guard(request);
  if (!guardResult.ok) return guardResult.response;
  const { ip, actorId } = guardResult;

  const cookieStore = await cookies();
  const contentType = request.headers.get("content-type") ?? "";
  let body: unknown;
  if (contentType.includes("application/json")) {
    if (!validateCsrfHeader(cookieStore, request.headers.get(CSRF_HEADER_NAME))) {
      logWarn("admins_delete_csrf_failed", { ip });
      return NextResponse.json({ error: "csrf" }, { status: 403 });
    }
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "invalid-json" }, { status: 400 });
    }
  } else {
    const formData = await request.formData();
    if (!validateCsrf(cookieStore, formData)) {
      logWarn("admins_delete_csrf_failed", { ip });
      return NextResponse.json({ error: "csrf" }, { status: 403 });
    }
    body = { id: formData.get("id") };
  }

  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid", issues: parsed.error.issues.map((i) => i.message) },
      { status: 400 }
    );
  }

  const { id } = parsed.data;

  // Prevent self-disable to avoid locking everyone out.
  if (String(id) === actorId) {
    return NextResponse.json(
      { error: "invalid", issues: ["You cannot disable your own account"] },
      { status: 400 }
    );
  }

  try {
    const disabled = await disableAdmin(id);
    if (!disabled) {
      return NextResponse.json({ error: "not-found" }, { status: 404 });
    }
    logInfo("admin_disabled", { id, ip, actor: actorId });
    await appendAuditLog({
      actorId,
      actorKind: actorId === BOOTSTRAP_ACTOR_ID ? "bootstrap" : "admin",
      action: "admin.disabled",
      resourceType: "admin",
      resourceId: id,
      ip,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    logError("admin_disable_failed", {
      id,
      error: (err instanceof Error ? err.message : String(err)).substring(0, 200),
    });
    return NextResponse.json({ error: "db" }, { status: 500 });
  }
}

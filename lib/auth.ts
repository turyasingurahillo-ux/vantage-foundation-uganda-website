import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifySessionToken,
  sessionCookieName,
  BOOTSTRAP_ACTOR_ID,
  type SessionInfo,
} from "@/lib/session";
import { countActiveAdmins, isAdminActive } from "@/lib/db/admins";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * Active session authorization — Layer B.
 *
 * `verifySessionToken` (Layer A) performs pure cryptographic verification:
 * token structure, expiry, actor-id format, and HMAC signature. It is sync,
 * has no database dependency, and remains independently testable.
 *
 * `verifyActiveAdminSession` (Layer B) builds on Layer A and additionally
 * verifies that the actor is still authorized at the present moment:
 *
 * - For `bootstrap` tokens: queries `countActiveAdmins()` and accepts only
 *   when zero active named admins exist. Fails closed on DB/query errors.
 *
 * - For named-admin tokens: queries `isAdminActive(id)` and accepts only
 *   when the admin row exists and `disabled_at IS NULL`. Fails closed on
 *   DB/query errors.
 *
 * Every security boundary controlling admin access must use this function
 * (or the shared `guard()` helper below) instead of `verifySessionToken`
 * alone, so that disabled admins and retired bootstrap sessions are rejected
 * immediately without waiting for token expiry.
 */
export async function verifyActiveAdminSession(
  token: string | undefined
): Promise<SessionInfo | null> {
  // Layer A — cryptographic verification (no DB I/O).
  const session = verifySessionToken(token);
  if (!session) return null;

  // Layer B — active authorization (DB I/O, fail closed on errors).
  if (session.actorId === BOOTSTRAP_ACTOR_ID) {
    try {
      const count = await countActiveAdmins();
      if (count > 0) {
        // Named admins exist — bootstrap sessions are no longer valid.
        return null;
      }
      return session;
    } catch {
      // DB error — fail closed. Do not allow a bootstrap session when we
      // cannot verify that zero active named admins exist.
      return null;
    }
  }

  // Named-admin token — verify the admin is still active.
  const adminId = Number(session.actorId);
  if (!Number.isInteger(adminId) || adminId <= 0) return null;

  try {
    const { active } = await isAdminActive(adminId);
    if (!active) return null;
    return session;
  } catch {
    // DB error — fail closed. Do not allow the session when we cannot
    // verify the admin's active status.
    return null;
  }
}

/**
 * Shared request guard for admin API routes.
 *
 * Verifies the active admin session (Layer A + Layer B), then applies a
 * per-route rate limit. Returns `{ ok: true, ip, actorId, cookieStore }` on
 * success, or `{ ok: false, response }` on failure.
 *
 * Usage:
 *   const guarded = await guard(request, { limit: 60, windowMs: 60_000 });
 *   if (!guarded.ok) return guarded.response;
 *   const { ip, actorId } = guarded;
 */
export async function guard(
  request: Request,
  opts?: { limit?: number; windowMs?: number; keyPrefix?: string }
): Promise<
  | { ok: true; ip: string; actorId: string; cookieStore: Awaited<ReturnType<typeof cookies>> }
  | { ok: false; response: NextResponse }
> {
  const cookieStore = await cookies();
  const session = await verifyActiveAdminSession(
    cookieStore.get(sessionCookieName)?.value
  );
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "unauthorized" }, { status: 401 }),
    };
  }
  const ip = getClientIp(request.headers);
  const limit = opts?.limit ?? 60;
  const windowMs = opts?.windowMs ?? 60_000;
  const keyPrefix = opts?.keyPrefix ?? "admin";
  if (!rateLimit({ key: `${keyPrefix}:${ip}`, limit, windowMs })) {
    return {
      ok: false,
      response: NextResponse.json({ error: "rate-limited" }, { status: 429 }),
    };
  }
  return { ok: true, ip, actorId: session.actorId, cookieStore };
}

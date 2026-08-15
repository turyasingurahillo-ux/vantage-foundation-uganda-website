import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";
import {
  rateLimit,
  getClientIp,
  recordFailure,
  isLockedOut,
  clearFailures,
} from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import {
  createSessionToken,
  sessionCookieName,
  sessionMaxAge,
  BOOTSTRAP_ACTOR_ID,
} from "@/lib/session";
import { logWarn, logInfo, logError } from "@/lib/logger";
import { getActiveAdminByUsername, countActiveAdmins } from "@/lib/db/admins";
import { verifyPassword } from "@/lib/password";

// Lockout policy: after 5 failed attempts within 15 minutes, lock out for 15 minutes.
const LOCKOUT_MAX_FAILURES = 5;
const LOCKOUT_WINDOW_MS = 15 * 60_000;
const LOCKOUT_DURATION_MS = 15 * 60_000;

/**
 * Timing-safe string comparison. Compares equal-length buffers without
 * leaking length information (the length check itself is not secret here —
 * the attacker can observe whether the password was accepted).
 */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const lockoutKey = `admin-login-lockout:${ip}`;

  // Check lockout first (before rate limit, since lockout is stricter).
  const { locked, remainingSeconds } = isLockedOut(lockoutKey);
  if (locked) {
    logWarn("admin_login_locked_out", { ip, remainingSeconds });
    const url = new URL("/admin/login?error=locked", request.url);
    url.searchParams.set("seconds", remainingSeconds.toString());
    return NextResponse.redirect(url, 302);
  }

  // Rate limit: 5 attempts per minute (in addition to lockout).
  if (!rateLimit({ key: `admin-login:${ip}`, limit: 5, windowMs: 60_000 })) {
    logWarn("admin_login_rate_limited", { ip });
    return NextResponse.redirect(
      new URL("/admin/login?error=rate-limited", request.url),
      302
    );
  }

  const formData = await request.formData();
  const cookieStore = await cookies();
  if (!validateCsrf(cookieStore, formData)) {
    logWarn("admin_login_csrf_failed", { ip });
    return NextResponse.redirect(
      new URL("/admin/login?error=csrf", request.url),
      302
    );
  }

  const username = (formData.get("username") as string)?.trim() || "";
  const password = (formData.get("password") as string) || "";

  // --- Named admin login path ---
  // If a username is provided, look up the admin and verify the password
  // using scrypt + timing-safe comparison.
  if (username) {
    let admin: Awaited<ReturnType<typeof getActiveAdminByUsername>> = null;
    try {
      admin = await getActiveAdminByUsername(username);
    } catch (err) {
      // DB not configured or admins table missing — fall through to the
      // bootstrap path below, which may still work if ADMIN_SECRET is set
      // and zero admins exist (countActiveAdmins will also throw).
      logError("admin_login_db_error", {
        error: (err instanceof Error ? err.message : String(err)).substring(0, 200),
      });
    }

    if (admin) {
      if (verifyPassword(password, admin.passwordHash)) {
        clearFailures(lockoutKey);
        logInfo("admin_login_success", { ip, actor: admin.id, username });

        const { token } = createSessionToken(String(admin.id));
        const response = NextResponse.redirect(
          new URL("/admin/donations", request.url),
          302
        );
        response.cookies.set(sessionCookieName, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/admin",
          maxAge: sessionMaxAge,
        });
        return response;
      }
      // Password mismatch — record failure.
      recordFailure({
        key: lockoutKey,
        maxFailures: LOCKOUT_MAX_FAILURES,
        lockoutMs: LOCKOUT_DURATION_MS,
        windowMs: LOCKOUT_WINDOW_MS,
      });
      logWarn("admin_login_failed", { ip, username });
      return NextResponse.redirect(new URL("/admin/login?error=1", request.url), 302);
    }

    // Username not found. If the DB is working but the admin doesn't exist,
    // we still record a failure (don't reveal whether the username exists).
    recordFailure({
      key: lockoutKey,
      maxFailures: LOCKOUT_MAX_FAILURES,
      lockoutMs: LOCKOUT_DURATION_MS,
      windowMs: LOCKOUT_WINDOW_MS,
    });
    logWarn("admin_login_failed", { ip, username });
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url), 302);
  }

  // --- Bootstrap fallback path ---
  // ADMIN_SECRET login is only allowed when zero active admins exist. Once
  // at least one named admin has been created, the shared secret is
  // disabled for login (it remains in use as the HMAC signing key for
  // session tokens and can still be rotated to revoke all sessions).
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    logWarn("admin_login_no_secret", { ip });
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url), 302);
  }

  let activeCount = 0;
  try {
    activeCount = await countActiveAdmins();
  } catch (err) {
    // DB not configured — allow ADMIN_SECRET login as the only option.
    logError("admin_login_count_failed", {
      error: (err instanceof Error ? err.message : String(err)).substring(0, 200),
    });
  }

  if (activeCount > 0) {
    // Named admins exist — bootstrap is disabled. Don't reveal this to the
    // caller; treat as a generic login failure.
    recordFailure({
      key: lockoutKey,
      maxFailures: LOCKOUT_MAX_FAILURES,
      lockoutMs: LOCKOUT_DURATION_MS,
      windowMs: LOCKOUT_WINDOW_MS,
    });
    logWarn("admin_login_bootstrap_disabled", { ip });
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url), 302);
  }

  // Timing-safe comparison against ADMIN_SECRET.
  if (!safeEqual(password, adminSecret)) {
    recordFailure({
      key: lockoutKey,
      maxFailures: LOCKOUT_MAX_FAILURES,
      lockoutMs: LOCKOUT_DURATION_MS,
      windowMs: LOCKOUT_WINDOW_MS,
    });
    logWarn("admin_login_failed", { ip });
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url), 302);
  }

  // Successful bootstrap login.
  clearFailures(lockoutKey);
  logInfo("admin_login_success", { ip, actor: BOOTSTRAP_ACTOR_ID });

  const { token } = createSessionToken(BOOTSTRAP_ACTOR_ID);
  const response = NextResponse.redirect(new URL("/admin/donations", request.url), 302);
  response.cookies.set(sessionCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: sessionMaxAge,
  });

  return response;
}

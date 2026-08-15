import { createHmac, timingSafeEqual, randomBytes } from "crypto";

/**
 * Signed session token utilities for admin authentication.
 *
 * Instead of storing the raw ADMIN_SECRET in a cookie, we issue a signed
 * session token: a random session ID + the actor identity + an expiry
 * timestamp + an HMAC signature. The secret is never exposed in the cookie
 * value.
 *
 * Token format: `{sessionId}.{actorId}.{expiresAt}.{hmac}`
 * - sessionId: 32 random bytes, hex-encoded (64 chars)
 * - actorId: either a numeric admin id (matching admins.id) or the literal
 *   "bootstrap" for ADMIN_SECRET fallback logins
 * - expiresAt: Unix timestamp (seconds) when the token expires
 * - hmac: HMAC-SHA256 of `${sessionId}.${actorId}.${expiresAt}` using
 *   ADMIN_SECRET as key (64 chars)
 *
 * The embedded expiry ensures the token cannot be replayed beyond its
 * lifetime even if exfiltrated — the cookie maxAge alone only controls
 * browser retention, not server-side validity. For emergency revocation
 * of all outstanding tokens, rotate ADMIN_SECRET.
 */

const SESSION_COOKIE_NAME = "vantage_admin";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 1 day

/** Actor id used when logging in via the ADMIN_SECRET bootstrap fallback. */
export const BOOTSTRAP_ACTOR_ID = "bootstrap";

function getSecret(): string {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SECRET is not configured");
  }
  return secret;
}

/**
 * Creates a signed session token with an embedded expiry and actor identity.
 * Returns `{ token, maxAge }` for setting as a cookie.
 *
 * The actorId is embedded in the token so that audit logs can attribute
 * actions to a specific admin without a server-side session store. It is
 * covered by the HMAC signature and cannot be tampered with.
 */
export function createSessionToken(actorId: string): { token: string; maxAge: number } {
  const secret = getSecret();
  const sessionId = randomBytes(32).toString("hex");
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  const payload = `${sessionId}.${actorId}.${expiresAt}`;
  const hmac = createHmac("sha256", secret).update(payload).digest("hex");
  return {
    token: `${payload}.${hmac}`,
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export interface SessionInfo {
  actorId: string;
}

/**
 * Verifies a signed session token.
 * Returns `{ actorId }` if the token is valid (correct format + not expired
 * + valid HMAC), or `null` if invalid. The actorId is the embedded identity
 * (a numeric admin id string or "bootstrap").
 *
 * Callers that only need a boolean check can use the truthiness of the
 * return value: `if (!verifySessionToken(token))` works because `null` is
 * falsy and the object is truthy.
 */
export function verifySessionToken(token: string | undefined): SessionInfo | null {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [sessionId, actorId, expiresAt, signature] = parts;

  // Validate format to prevent injection.
  if (!/^[a-f0-9]{64}$/.test(sessionId) || !/^[a-f0-9]{64}$/.test(signature)) {
    return null;
  }
  if (!/^\d+$/.test(expiresAt)) return null;
  // actorId is either "bootstrap" or a numeric string.
  if (actorId !== BOOTSTRAP_ACTOR_ID && !/^\d+$/.test(actorId)) return null;

  // Check expiry before performing any crypto work.
  const now = Math.floor(Date.now() / 1000);
  if (Number(expiresAt) <= now) return null;

  try {
    const secret = getSecret();
    const payload = `${sessionId}.${actorId}.${expiresAt}`;
    const expectedHmac = createHmac("sha256", secret).update(payload).digest("hex");

    // Timing-safe comparison to prevent timing attacks.
    const a = Buffer.from(signature, "hex");
    const b = Buffer.from(expectedHmac, "hex");
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;
    return { actorId };
  } catch {
    return null;
  }
}

export const sessionCookieName = SESSION_COOKIE_NAME;
export const sessionMaxAge = SESSION_MAX_AGE_SECONDS;

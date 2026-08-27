// In-memory sliding-window rate limiter.
//
// Suitable for a small site running on a single instance or a few serverless
// instances. Each instance keeps its own window, so the effective limit is
// multiplied by the number of warm instances. For stricter cross-instance
// limits, upgrade to Upstash Redis or Vercel KV in the future.
//
// Usage:
//   const ok = rateLimit({ key: `login:${ip}`, limit: 5, windowMs: 60_000 });
//   if (!ok) return new Response("Too many requests", { status: 429 });

const buckets = new Map<string, number[]>();

// Lockout tracking: keys that are temporarily locked out.
// Maps key -> unlock timestamp (ms since epoch).
const lockouts = new Map<string, number>();

// Prune expired buckets periodically to avoid unbounded memory growth.
// Called opportunistically on every rateLimit() invocation.
const PRUNE_INTERVAL_MS = 60_000;
let lastPrune = Date.now();

function prune(now: number) {
  if (now - lastPrune < PRUNE_INTERVAL_MS) return;
  lastPrune = now;
  for (const [key, timestamps] of buckets) {
    // Keep only timestamps from the last hour (upper bound on any window).
    const cutoff = now - 3_600_000;
    const recent = timestamps.filter((t) => t > cutoff);
    if (recent.length === 0) {
      buckets.delete(key);
    } else if (recent.length !== timestamps.length) {
      buckets.set(key, recent);
    }
  }
  // Prune expired lockouts.
  for (const [key, unlockAt] of lockouts) {
    if (unlockAt <= now) {
      lockouts.delete(key);
      buckets.delete(key); // Reset the bucket so they get a fresh start.
    }
  }
}

interface RateLimitOptions {
  /** Unique key identifying the rate-limit bucket (e.g. `login:${ip}`). */
  key: string;
  /** Maximum number of requests allowed within the window. */
  limit: number;
  /** Sliding window duration in milliseconds. */
  windowMs: number;
}

/**
 * Returns `true` if the request is within the limit, `false` if it exceeds it.
 * Each call records a timestamp in the bucket.
 *
 * This function also checks for lockouts on the same key. If the key is
 * locked out (via `recordFailure` with the same key), the request is rejected.
 * Callers that use separate keys for rate limiting and lockouts (e.g. the
 * login route uses `admin-login:${ip}` for rate limiting but
 * `admin-login-lockout:${ip}` for lockouts) must call `isLockedOut()`
 * separately before calling this function.
 */
export function rateLimit({ key, limit, windowMs }: RateLimitOptions): boolean {
  const now = Date.now();
  prune(now);

  // Check if currently locked out (same key only).
  const unlockAt = lockouts.get(key);
  if (unlockAt && unlockAt > now) {
    return false;
  }

  const cutoff = now - windowMs;
  const timestamps = (buckets.get(key) ?? []).filter((t) => t > cutoff);

  if (timestamps.length >= limit) {
    buckets.set(key, timestamps);
    return false;
  }

  timestamps.push(now);
  buckets.set(key, timestamps);
  return true;
}

interface LockoutOptions {
  /** Unique key identifying the lockout bucket (e.g. `admin-login:${ip}`). */
  key: string;
  /** Maximum number of failures before lockout triggers. */
  maxFailures: number;
  /** How long to lock out after maxFailures is reached (milliseconds). */
  lockoutMs: number;
  /** Window for counting failures (milliseconds). */
  windowMs: number;
}

/**
 * Records a failed attempt and triggers a lockout if the threshold is reached.
 * Use this for login attempts: call `recordFailure` on each failed login,
 * and check `isLockedOut` before attempting authentication.
 */
export function recordFailure({ key, maxFailures, lockoutMs, windowMs }: LockoutOptions): void {
  const now = Date.now();
  prune(now);

  const cutoff = now - windowMs;
  const timestamps = (buckets.get(key) ?? []).filter((t) => t > cutoff);

  timestamps.push(now);
  buckets.set(key, timestamps);

  if (timestamps.length >= maxFailures) {
    lockouts.set(key, now + lockoutMs);
  }
}

/**
 * Returns `true` if the key is currently locked out, along with the
 * remaining lockout duration in seconds.
 */
export function isLockedOut(key: string): { locked: boolean; remainingSeconds: number } {
  const now = Date.now();
  const unlockAt = lockouts.get(key);
  if (unlockAt && unlockAt > now) {
    return { locked: true, remainingSeconds: Math.ceil((unlockAt - now) / 1000) };
  }
  return { locked: false, remainingSeconds: 0 };
}

/**
 * Clears the failure count and lockout for a key (e.g. on successful login).
 */
export function clearFailures(key: string): void {
  buckets.delete(key);
  lockouts.delete(key);
}

/**
 * Extracts the client IP from standard proxy headers.
 * Returns "unknown" if no IP can be determined.
 *
 * Trust order (most-trusted first):
 *   1. `x-vercel-forwarded-for` — set by Vercel's edge with the real client IP.
 *      Preferred on Vercel deployments and harder to forge than the standard
 *      XFF header.
 *   2. `x-forwarded-for` — take the RIGHTMOST entry (added by the closest
 *      trusted proxy). The leftmost entry is the easiest to forge, so trusting
 *      it lets an attacker rotate arbitrary IPs to bypass rate limiting if the
 *      app is ever reached without a proxy that overwrites this header.
 *   3. `x-real-ip` — fallback for some hosting providers.
 *
 * Note: this assumes a single trusted proxy hop in front of the app. If the app
 * is ever deployed behind multiple chained proxies, the trust-hop count must be
 * adjusted (e.g. via a TRUSTED_PROXY_HOPS env var) to take the Nth-from-right
 * entry instead of the rightmost.
 */
export function getClientIp(headers: Headers): string {
  // Vercel sets this with the real client IP; prefer it on Vercel deployments.
  const vff = headers.get("x-vercel-forwarded-for");
  if (vff) {
    const ip = vff.split(",")[0]?.trim();
    if (ip) return ip;
  }
  // Standard XFF: trust the rightmost entry (added by the closest proxy),
  // not the leftmost (which is client-controlled and easy to forge).
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) {
      const ip = parts[parts.length - 1];
      if (ip) return ip;
    }
  }
  // Fallback for some hosting providers.
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

import "server-only";

import { logWarn, logError } from "@/lib/logger";

/**
 * Cloudflare Turnstile verification.
 *
 * Turnstile is optional and env-gated: it is only enforced when BOTH
 * TURNSTILE_SECRET_KEY (server) and NEXT_PUBLIC_TURNSTILE_SITE_KEY (client)
 * are set. Until then the form relies on its other layers (dual honeypot,
 * time-trap, rate limiting, strict server-side validation) and no challenge is
 * rendered — so enabling it later is a pure configuration change with no code
 * edit and no risk of locking visitors out of a half-configured widget.
 *
 * The secret key is read only here, server-side, and is never sent to the
 * browser. Only the site key (public by design) is exposed to the client.
 */

const VERIFY_ENDPOINT =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const VERIFY_TIMEOUT_MS = 5000;

/** True when Turnstile is fully configured and should be enforced. */
export function isTurnstileEnabled(): boolean {
  return Boolean(
    process.env.TURNSTILE_SECRET_KEY &&
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  );
}

/**
 * Verifies a Turnstile token against Cloudflare's siteverify API.
 *
 * Returns true when Turnstile is not configured (nothing to enforce).
 * On a network error or timeout it fails OPEN — a Cloudflare outage must not
 * block a grantmaker or donor from reaching Vantage, and the remaining
 * anti-spam layers still apply. Genuine token rejections still fail closed.
 */
export async function verifyTurnstile(
  token: unknown,
  clientIp?: string,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) return true;

  if (typeof token !== "string" || token.length === 0 || token.length > 2048) {
    logWarn("turnstile_token_missing", {});
    return false;
  }

  const body = new URLSearchParams({ secret, response: token });
  // Cloudflare treats "unknown" as an invalid IP, so only send a real one.
  if (clientIp && clientIp !== "unknown") body.set("remoteip", clientIp);

  try {
    const res = await fetch(VERIFY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
      cache: "no-store",
    });

    if (!res.ok) {
      logError("turnstile_verify_http_error", { status: res.status });
      return true; // Fail open on provider-side failure.
    }

    const data = (await res.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };

    if (!data.success) {
      logWarn("turnstile_verify_rejected", {
        codes: (data["error-codes"] ?? []).join(",").substring(0, 100),
      });
      return false;
    }

    return true;
  } catch (err) {
    logError("turnstile_verify_failed", {
      error: (err instanceof Error ? err.message : String(err)).substring(0, 200),
    });
    return true; // Fail open: never block legitimate contact on an outage.
  }
}

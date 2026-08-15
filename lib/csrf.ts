// CSRF protection using the double-submit cookie pattern.
//
// In Next.js 16, cookies cannot be set in Server Components (only in Server
// Actions or Route Handlers). So the CSRF cookie is set by middleware.ts,
// which runs before the page renders. The middleware also passes the token
// to the page via the `x-csrf-token` request header, which the page reads to
// embed in the form as a hidden field.
//
// Flow:
//   1. Browser requests /admin/login (no CSRF cookie yet)
//   2. Proxy generates a token, sets it as a response cookie (vantage_csrf),
//      and passes it as a request header (x-csrf-token)
//   3. Page reads the token from the x-csrf-token header and embeds it in
//      the form as a hidden field
//   4. Browser submits the form: sends both the cookie and the hidden field
//   5. Route handler compares the cookie with the form field (validateCsrf)
//
// The CSRF cookie uses sameSite=strict for defense in depth.

import { cookies as getCookies } from "next/headers";
import { headers as getHeaders } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "vantage_csrf";
const HEADER_NAME = "x-csrf-token";
const FIELD_NAME = "csrf_token";

export const CSRF_COOKIE_NAME = COOKIE_NAME;
export const CSRF_HEADER_NAME = HEADER_NAME;
export const CSRF_FIELD_NAME = FIELD_NAME;

function generateToken(): string {
  // 32 bytes of randomness, hex-encoded (64 chars).
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Reads or generates the CSRF token. Used by proxy.ts to set the cookie
 * and pass the token to the page via a request header.
 *
 * If a valid CSRF cookie already exists, it is reused. Otherwise a new
 * token is generated.
 */
export function getOrCreateCsrfToken(cookieValue?: string): string {
  if (cookieValue && /^[a-f0-9]{64}$/.test(cookieValue)) {
    return cookieValue;
  }
  return generateToken();
}

/**
 * Returns the CSRF token for the current request. In Server Components,
 * this reads the `x-csrf-token` header set by proxy.ts.
 *
 * Throws if the header is not present (indicates proxy.ts is not running).
 */
export async function getCsrfTokenFromRequest(): Promise<string> {
  const h = await getHeaders();
  const token = h.get(HEADER_NAME);
  if (!token) {
    // Fallback: generate a throwaway token. The form will fail CSRF
    // validation on submit, which is the safe default.
    return generateToken();
  }
  return token;
}

/**
 * Validates that the CSRF cookie matches the CSRF form field.
 * Returns true if valid, false otherwise.
 */
export function validateCsrf(
  cookieStore: Awaited<ReturnType<typeof getCookies>>,
  formData: FormData
): boolean {
  const cookieToken = cookieStore.get(COOKIE_NAME)?.value;
  const formToken = (formData.get(FIELD_NAME) as string) || "";
  if (!cookieToken || !formToken) return false;
  return timingSafeEqual(cookieToken, formToken);
}

/**
 * Validates that the CSRF cookie matches the CSRF header value.
 * Used by JSON-based route handlers (e.g. /api/admin/admins) that send
 * the token via the `x-csrf-token` header instead of a form field.
 * Returns true if valid, false otherwise.
 */
export function validateCsrfHeader(
  cookieStore: Awaited<ReturnType<typeof getCookies>>,
  headerValue: string | null
): boolean {
  const cookieToken = cookieStore.get(COOKIE_NAME)?.value;
  if (!cookieToken || !headerValue) return false;
  return timingSafeEqual(cookieToken, headerValue);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Clears the CSRF cookie (used on logout).
 */
export function clearCsrfCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

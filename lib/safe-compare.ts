import { timingSafeEqual } from "crypto";

/**
 * Constant-time comparison of two secret strings.
 *
 * Uses `crypto.timingSafeEqual` to avoid timing side-channels on secret
 * comparison. Handles different-length inputs safely by performing a
 * constant-time check on the length first, then comparing the contents
 * only when lengths match.
 *
 * Returns true only when both strings are non-empty and exactly equal.
 */
export function safeSecretEqual(provided: string, expected: string): boolean {
  if (!provided || !expected) return false;

  const providedBuf = Buffer.from(provided, "utf8");
  const expectedBuf = Buffer.from(expected, "utf8");

  // If lengths differ, compare the expected buffer against itself to
  // keep timing roughly constant, then return false.
  if (providedBuf.length !== expectedBuf.length) {
    timingSafeEqual(expectedBuf, expectedBuf);
    return false;
  }

  return timingSafeEqual(providedBuf, expectedBuf);
}

/**
 * Parses a Bearer token from an Authorization header.
 *
 * Returns the token string if the header is a well-formed Bearer header,
 * or null if the header is missing, empty, or does not use the Bearer scheme.
 */
export function parseBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

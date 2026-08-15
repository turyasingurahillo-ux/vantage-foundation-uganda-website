/**
 * Input sanitization helpers for user-submitted form data.
 *
 * Used before data is stored or sent via email to prevent injection attacks
 * (e.g. email header injection via CR/LF or other control characters).
 */

/** Default cap, suitable for short single-line fields (names, subjects). */
export const DEFAULT_SANITISE_MAX_LENGTH = 1000;

/**
 * Strips control characters (including CR, LF, tab, and the full 0x00–0x1f
 * range) and limits length to prevent email header injection and oversized
 * payloads. Returns an empty string for null/undefined input.
 *
 * `maxLength` is configurable because the contact form accepts messages of up
 * to 5000 characters — a detailed grant or partnership inquiry legitimately
 * runs past the 1000-character default, and truncating it in the notification
 * email would silently hide the end of what the sender wrote.
 */
export function sanitiseValue(
  value: unknown,
  maxLength: number = DEFAULT_SANITISE_MAX_LENGTH,
): string {
  if (value == null) return "";
  return String(value)
    .replace(/[\r\n\t]/g, " ") // strip line breaks and tabs
    .replace(/[\x00-\x1f]/g, " ") // strip remaining control chars (VT, FF, etc.)
    .substring(0, maxLength);
}

/**
 * HTML-escapes a value for safe insertion into HTML email templates.
 * Prevents user-controlled content from injecting markup into the email
 * body (email clients strip scripts, but HTML injection can still mislead
 * recipients or break layout).
 */
export function escapeHtml(value: unknown): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

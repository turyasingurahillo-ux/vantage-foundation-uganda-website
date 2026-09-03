/**
 * WhatsApp quick-contact helper.
 *
 * Centralises the WhatsApp number, normalisation, wa.me URL generation and
 * prefilled message. This is a public contact channel — it is NOT the
 * protected operational mailbox (foundationvantage@gmail.com), which is
 * server-only in lib/contact-inbox.ts.
 *
 * This module is client-safe: it contains no secrets, only the public
 * WhatsApp number and URL construction logic.
 */

/**
 * Normalises a phone number to digits-only form for wa.me.
 *
 * wa.me expects the international number without "+", spaces, hyphens or
 * other formatting. For example, "+256 786 585 216" → "256786585216".
 *
 * Strips everything that is not a digit. If the number starts with a single
 * leading 0 (local format), it is replaced with the Uganda country code
 * "256" — but only when the input does not already start with a country
 * code. This handles the common Ugandan local format "0786 585 216".
 */
export function normaliseWhatsAppNumber(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  // Strip everything that is not a digit.
  const digits = trimmed.replace(/\D/g, "");

  if (!digits) return "";

  // If it starts with a double-zero (international prefix "00"), replace
  // with the country code that follows. e.g. "00256..." → "256..."
  if (digits.startsWith("00")) {
    return digits.slice(2);
  }

  // If it starts with a single 0 (local format), replace with Uganda's
  // country code 256. e.g. "0786585216" → "256786585216".
  // Only do this when the number does not already start with a country code
  // (256 is Uganda). Numbers starting with other country codes are left as-is.
  if (digits.startsWith("0") && !digits.startsWith("256")) {
    return "256" + digits.slice(1);
  }

  return digits;
}

/**
 * The default prefilled message for WhatsApp quick-contact CTAs.
 *
 * Friendly, concise, and identifies the sender as someone reaching
 * Vantage Foundation Uganda. The message is URL-encoded by buildWhatsAppUrl.
 */
export const DEFAULT_WHATSAPP_MESSAGE =
  "Hello Vantage Foundation Uganda, I would like to get in touch.";

/**
 * Builds a wa.me URL with an optional prefilled message.
 *
 * The number is normalised to digits (see normaliseWhatsAppNumber). The
 * message is URL-encoded. Returns an empty string if the number cannot be
 * normalised, so callers can gracefully fall back to the contact form.
 *
 * Example: buildWhatsAppUrl("+256 786 585 216", "Hello")
 *   → "https://wa.me/256786585216?text=Hello"
 */
export function buildWhatsAppUrl(
  number: string,
  message: string = DEFAULT_WHATSAPP_MESSAGE,
): string {
  const normalised = normaliseWhatsAppNumber(number);
  if (!normalised) return "";
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${normalised}?text=${encoded}`;
}

/**
 * Builds an accessible aria-label for a WhatsApp link.
 *
 * Example: "Chat on WhatsApp: +256 786 585 216"
 */
export function buildWhatsAppAriaLabel(
  displayNumber: string,
  context?: string,
): string {
  const base = `Chat on WhatsApp: ${displayNumber}`;
  if (context) return `${base} (${context})`;
  return base;
}

/**
 * The display form of the WhatsApp number, for showing to humans.
 * This is the formatted version (e.g. "+256 786 585 216"), not the
 * normalised digits.
 */
export function getWhatsAppDisplayNumber(
  whatsapp: string = getDefaultWhatsAppNumber(),
): string {
  return whatsapp.trim();
}

/**
 * Returns the configured WhatsApp number from the site config.
 * Used as a fallback when a caller doesn't pass one explicitly.
 */
export function getDefaultWhatsAppNumber(): string {
  // Importing site here would create a circular dependency in some contexts,
  // so we expose a stable default. The actual site config value is the
  // source of truth and is passed explicitly by components that read it.
  return "+256 786 585 216";
}

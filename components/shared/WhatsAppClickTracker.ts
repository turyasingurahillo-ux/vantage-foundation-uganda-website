"use client";

/**
 * WhatsApp click tracker — fires a `whatsapp_contact_click` event to the
 * first-party analytics endpoint when a visitor clicks a WhatsApp CTA.
 *
 * Privacy: no names, emails, IPs or browsing profiles are sent. The only
 * identifier is the anonymous `vantage_reader` cookie (HMAC-hashed
 * server-side). The destination is the wa.me URL (already public).
 *
 * This module is client-only — it uses `navigator` and `fetch`.
 */

interface WhatsAppClickParams {
  /** Where the CTA appeared, e.g. "contact page", "footer", "homepage hero". */
  context: string;
  /** The wa.me URL the user is navigating to. */
  destination: string;
  /** Optional position label, e.g. "hero", "card", "footer". */
  position?: string;
}

/**
 * Tracks a WhatsApp contact click. Fire-and-forget — never blocks navigation.
 * Returns a promise that resolves once the event is sent (or fails silently).
 */
export function trackWhatsAppClick({
  context,
  destination,
  position,
}: WhatsAppClickParams): Promise<void> {
  try {
    return fetch("/api/analytics/whatsapp-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "whatsapp_contact_click",
        context,
        destination,
        position,
      }),
      keepalive: true,
    })
      .then(() => undefined)
      .catch(() => undefined);
  } catch {
    return Promise.resolve();
  }
}

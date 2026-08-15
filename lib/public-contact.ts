/**
 * The public-facing contact address, if one has actually been configured.
 *
 * This is client-safe by construction: it resolves ONLY from
 * `NEXT_PUBLIC_CONTACT_EMAIL`, which an administrator sets after creating and
 * verifying a domain alias (e.g. contact@vantagefoundationuganda.com) in
 * Cloudflare Email Routing. Vantage's protected operational mailbox is never
 * referenced here — it lives behind `server-only` in `lib/contact-inbox.ts`.
 *
 * When the variable is unset the site publishes NO address at all and points
 * visitors at the contact form instead, so the site can never display a
 * fictional or non-working address.
 */

const ADDRESS_REGEX = /^[^\s@,;<>()[\]\\]+@[^\s@,;<>()[\]\\]+\.[^\s@,;<>()[\]\\]+$/;

/**
 * Consumer mailbox providers are rejected as public addresses. The whole point
 * of this change is that Vantage's personal/operational Gmail account stops
 * being the published address, so a misconfigured deployment must fail closed
 * rather than re-publish it.
 */
const CONSUMER_MAIL_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "aol.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
];

export function resolvePublicContactEmail(
  value = process.env.NEXT_PUBLIC_CONTACT_EMAIL,
): string | undefined {
  if (!value) return undefined;

  const address = value.trim().toLowerCase();
  if (!ADDRESS_REGEX.test(address) || address.length > 254) return undefined;

  const domain = address.split("@")[1];
  if (!domain || CONSUMER_MAIL_DOMAINS.includes(domain)) return undefined;

  return address;
}

/** True when a verified public alias is configured and safe to display. */
export function hasPublicContactEmail(): boolean {
  return resolvePublicContactEmail() !== undefined;
}

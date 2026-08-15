import "server-only";

import type { ContactCategory } from "@/lib/contact-categories";
import { logWarn } from "@/lib/logger";

/**
 * Server-only mailbox routing for public form submissions.
 *
 * `foundationvantage@gmail.com` is Vantage's PROTECTED operational mailbox. It
 * is used for administration, account recovery, Google services, finance and
 * grant correspondence, and it must never be rendered into any public page,
 * JSON-LD block, metadata field or server-action response. It lives here —
 * behind `server-only`, so the module cannot be imported into a client bundle
 * and the address is never shipped to the browser.
 *
 * Destinations are resolved from server environment variables and a fixed
 * category enum. Nothing in a visitor's request can influence the recipient,
 * so this endpoint cannot be used as an open relay.
 */

/**
 * Last-resort destination, used when no CONTACT_INBOX env var is configured.
 * Keeping it here (rather than only in env) means form delivery keeps working
 * on existing deployments that have not set the new variables yet.
 */
const PROTECTED_INBOX_FALLBACK = "foundationvantage@gmail.com";

/** Single address, no CRLF, no comma — a comma would let one env value fan out. */
const SINGLE_ADDRESS_REGEX = /^[^\s@,;<>()[\]\\]+@[^\s@,;<>()[\]\\]+\.[^\s@,;<>()[\]\\]+$/;

function readAddressEnv(name: string): string | null {
  const raw = process.env[name];
  if (!raw) return null;
  const value = raw.trim();
  if (!SINGLE_ADDRESS_REGEX.test(value) || value.length > 254) {
    // Never fall through to an unvalidated address: log and ignore it.
    logWarn("contact_inbox_env_invalid", { variable: name });
    return null;
  }
  return value;
}

/**
 * Per-category mailbox overrides. Set these once the matching Cloudflare Email
 * Routing aliases exist (see docs/email-privacy-and-contact.md). Any category
 * left unset falls back to the default inbox, so partial configuration is safe.
 */
const CATEGORY_ENV: Partial<Record<ContactCategory, string>> = {
  partnerships: "CONTACT_INBOX_PARTNERSHIPS",
  grants: "CONTACT_INBOX_GRANTS",
  media: "CONTACT_INBOX_MEDIA",
  research: "CONTACT_INBOX_RESEARCH",
  safeguarding: "CONTACT_INBOX_SAFEGUARDING",
};

/** The default destination for anything without a category-specific mailbox. */
export function getDefaultInbox(): string {
  return readAddressEnv("CONTACT_INBOX") ?? PROTECTED_INBOX_FALLBACK;
}

/**
 * Resolves the destination mailbox for a validated category.
 * Falls back to the default inbox when no override is configured.
 */
export function resolveInboxFor(category: ContactCategory): string {
  const envName = CATEGORY_ENV[category];
  if (envName) {
    const specific = readAddressEnv(envName);
    if (specific) return specific;
  }
  return getDefaultInbox();
}

/**
 * The envelope "From" address for outgoing notifications.
 *
 * Most SMTP providers require this to match the authenticated user or a
 * verified sender domain, so it is env-driven. It deliberately does NOT fall
 * back to the protected mailbox: an unverified From address gets the mail
 * rejected by SPF/DMARC anyway, and SMTP_USER is the address the provider
 * actually authorised.
 */
export function getFromAddress(): string | null {
  return readAddressEnv("SMTP_FROM") ?? readAddressEnv("SMTP_USER");
}

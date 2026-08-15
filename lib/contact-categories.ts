/**
 * Public inquiry categories for the contact form.
 *
 * This module is imported by BOTH the client form and the server action, so it
 * must never contain mailbox addresses or any other routing secret. It carries
 * only the category value, the visitor-facing label, and the subject prefix
 * used to tag the notification email.
 *
 * The mapping from a category to an actual destination mailbox lives in
 * `lib/contact-inbox.ts`, which is server-only. Visitors never learn which
 * mailbox their message reaches.
 */

export const CONTACT_CATEGORIES = [
  { value: "general", label: "General inquiry", tag: "GENERAL" },
  { value: "partnerships", label: "Partnerships", tag: "PARTNERSHIP" },
  { value: "grants", label: "Grants & funding", tag: "GRANTS" },
  { value: "programmes", label: "Programmes", tag: "PROGRAMMES" },
  { value: "volunteering", label: "Volunteering", tag: "VOLUNTEERING" },
  { value: "media", label: "Media / press", tag: "MEDIA" },
  { value: "research", label: "Research", tag: "RESEARCH" },
  { value: "donation", label: "Donation support", tag: "DONATION" },
  { value: "safeguarding", label: "Safeguarding concern", tag: "SAFEGUARDING" },
  { value: "other", label: "Other", tag: "OTHER" },
] as const;

export type ContactCategory = (typeof CONTACT_CATEGORIES)[number]["value"];

/** Category values as a plain array, for Zod enum validation. */
export const CONTACT_CATEGORY_VALUES = CONTACT_CATEGORIES.map(
  (c) => c.value,
) as [ContactCategory, ...ContactCategory[]];

export function isContactCategory(value: unknown): value is ContactCategory {
  return (
    typeof value === "string" &&
    CONTACT_CATEGORY_VALUES.includes(value as ContactCategory)
  );
}

export function getCategoryLabel(value: ContactCategory): string {
  return CONTACT_CATEGORIES.find((c) => c.value === value)?.label ?? "Inquiry";
}

/**
 * Subject line for the internal notification email, e.g.
 * `[VANTAGE CONTACT — PARTNERSHIP] Message from Jane Doe`.
 *
 * The prefix lets the Vantage team filter and label incoming mail in Gmail
 * without needing separate mailboxes.
 */
export function buildSubjectPrefix(value: ContactCategory): string {
  const tag = CONTACT_CATEGORIES.find((c) => c.value === value)?.tag ?? "OTHER";
  return `[VANTAGE CONTACT — ${tag}]`;
}

/**
 * Legacy `?subject=` query values used by older CTAs across the site, mapped to
 * their current category. Keeps existing deep links working after the category
 * list was expanded (e.g. `/contact?subject=partner`).
 */
const LEGACY_SUBJECT_ALIASES: Record<string, ContactCategory> = {
  partner: "partnerships",
  sponsor: "partnerships",
  volunteer: "volunteering",
  funding: "grants",
  press: "media",
  programs: "programmes",
};

/** Resolves a `?subject=` query value to a category, or "" if unrecognised. */
export function resolveCategoryFromQuery(value: string | undefined): string {
  if (!value) return "";
  if (isContactCategory(value)) return value;
  return LEGACY_SUBJECT_ALIASES[value] ?? "";
}

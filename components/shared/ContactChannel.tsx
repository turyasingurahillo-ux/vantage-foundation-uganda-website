import Link from "next/link";
import { site } from "@/content/site";
import type { ContactCategory } from "@/lib/contact-categories";
import { getPageContent } from "@/lib/i18n/content/pages";
import type { Locale } from "@/lib/i18n/config";

/**
 * The site's public contact channel.
 *
 * Vantage's operational mailbox is never published. These components show a
 * `mailto:` link ONLY when a verified domain alias has been configured via
 * NEXT_PUBLIC_CONTACT_EMAIL; otherwise they route the visitor to the contact
 * form, which applies the anti-spam controls before anything reaches the
 * protected inbox.
 */

function contactHref(category?: ContactCategory) {
  return category ? `/contact?subject=${category}` : "/contact";
}

/**
 * Inline link, for use mid-sentence.
 * Renders the public alias if configured, otherwise "our contact form".
 */
export function ContactChannelLink({
  category,
  className = "text-primary underline",
  formLabel,
  locale = "en",
}: {
  category?: ContactCategory;
  className?: string;
  formLabel?: string;
  locale?: Locale;
}) {
  const email = site.contact.publicEmail;
  const ui = getPageContent(locale).ui.contactChannel;
  const label = formLabel ?? ui.formLabel;

  if (email) {
    return (
      <a href={`mailto:${email}`} className={className}>
        {email}
      </a>
    );
  }

  return (
    <Link href={contactHref(category)} className={className}>
      {label}
    </Link>
  );
}

/**
 * List-item variant used by the legal/policy pages, which present contact
 * routes as a bulleted list alongside phone and address.
 */
export function ContactChannelListItem({
  category,
  className = "text-primary underline",
  locale = "en",
}: {
  category?: ContactCategory;
  className?: string;
  locale?: Locale;
}) {
  const email = site.contact.publicEmail;
  const ui = getPageContent(locale).ui.contactChannel;

  if (email) {
    return (
      <li>
        {ui.emailLabel}{" "}
        <a href={`mailto:${email}`} className={className}>
          {email}
        </a>
      </li>
    );
  }

  return (
    <li>
      {ui.contactFormLabel}{" "}
      <Link href={contactHref(category)} className={className}>
        vantagefoundationuganda.com/contact
      </Link>
    </li>
  );
}

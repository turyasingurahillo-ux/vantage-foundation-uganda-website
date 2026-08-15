import Link from "next/link";
import { site } from "@/content/site";
import type { ContactCategory } from "@/lib/contact-categories";

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
  formLabel = "our contact form",
}: {
  category?: ContactCategory;
  className?: string;
  formLabel?: string;
}) {
  const email = site.contact.publicEmail;

  if (email) {
    return (
      <a href={`mailto:${email}`} className={className}>
        {email}
      </a>
    );
  }

  return (
    <Link href={contactHref(category)} className={className}>
      {formLabel}
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
}: {
  category?: ContactCategory;
  className?: string;
}) {
  const email = site.contact.publicEmail;

  if (email) {
    return (
      <li>
        Email:{" "}
        <a href={`mailto:${email}`} className={className}>
          {email}
        </a>
      </li>
    );
  }

  return (
    <li>
      Contact form:{" "}
      <Link href={contactHref(category)} className={className}>
        vantagefoundationuganda.com/contact
      </Link>
    </li>
  );
}

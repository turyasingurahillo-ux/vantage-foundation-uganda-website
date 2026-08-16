import Link from "next/link";
import { CSRF_FIELD_NAME } from "@/lib/csrf";

/**
 * One navigation bar for every admin page.
 *
 * Each admin page previously hand-rolled its own row of links, and they had
 * drifted: donations offered two destinations, stories three, audit five, and
 * none of them linked to Contact messages. An administrator who landed on
 * /admin/donations after logging in had no way to reach messages except by
 * typing the URL — which is how a real enquiry sat unread.
 */

const LINKS: { href: string; label: string }[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/donations", label: "Donations" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/stories", label: "Stories & Insights" },
  { href: "/admin/media", label: "Media library" },
  { href: "/admin/admins", label: "Admins" },
  { href: "/admin/audit", label: "Audit log" },
];

const baseClass =
  "rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

const currentClass =
  "rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

export function AdminNav({
  current,
  csrfToken,
}: {
  /** Path of the page being rendered, e.g. "/admin/messages". */
  current: string;
  csrfToken: string;
}) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Admin navigation">
      {LINKS.map((link) => {
        const isCurrent = link.href === current;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isCurrent ? "page" : undefined}
            className={isCurrent ? currentClass : baseClass}
          >
            {link.label}
          </Link>
        );
      })}
      <form method="post" action="/api/admin/logout" className="inline">
        <input type="hidden" name={CSRF_FIELD_NAME} value={csrfToken} />
        <button type="submit" className={baseClass}>
          Log out
        </button>
      </form>
    </nav>
  );
}

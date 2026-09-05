import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you are looking for could not be found.",
  // Next.js automatically adds noindex for 404 responses, but be explicit.
  robots: { index: false, follow: true },
};

/**
 * Global 404 page for unmatched URLs.
 *
 * The app has multiple root layouts (`app/(public)/[locale]/layout.tsx` and
 * `app/admin/layout.tsx`), so a root `app/not-found.tsx` cannot be composed
 * from a single layout. This file bypasses layout rendering entirely and
 * returns a full HTML document.
 *
 * The locale-level `app/(public)/[locale]/not-found.tsx` handles 404s within
 * a matched locale (e.g. a valid locale prefix but unknown sub-path) and
 * includes the full Header/Footer chrome. This global page handles only
 * truly unmatched URLs that fall outside any route tree.
 *
 * It is intentionally minimal: no Header/Footer, no fonts, no JS. It imports
 * globals.css for theme variables but otherwise uses inline styles so it
 * renders correctly without any layout wrapper.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          backgroundColor: "#f8fafc",
          color: "#0f172a",
          textAlign: "center",
        }}
      >
        <main style={{ maxWidth: "28rem" }}>
          <p
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#b45309",
              margin: 0,
            }}
          >
            404
          </p>
          <h1
            style={{
              marginTop: "0.75rem",
              fontSize: "2rem",
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            Page not found
          </h1>
          <p
            style={{
              marginTop: "1.5rem",
              fontSize: "1.125rem",
              lineHeight: 1.6,
              color: "#64748b",
            }}
          >
            The page you are looking for could not be found. It may have been
            moved or no longer exists.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              marginTop: "2rem",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              backgroundColor: "#b45309",
              color: "#ffffff",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Return to {site.name}
          </Link>
        </main>
      </body>
    </html>
  );
}

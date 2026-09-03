import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import "../globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SkipToContent } from "@/components/shared/SkipToContent";
import { site } from "@/content/site";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { defaultLocale } from "@/lib/i18n/config";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

// Public pages live under `app/[locale]`, which is a root layout in its own
// right, so the admin tree needs its own `<html>`/`<body>`. The admin UI is
// staff-facing and deliberately English-only: it is not part of the Phase 1
// translation scope, and a locale prefix in front of it is rejected by the
// middleware rather than rendering the panel under another language.
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `Admin | ${site.name}`,
    template: `%s | ${site.name}`,
  },
  // Centralized noindex for all admin routes. Individual admin pages can still
  // override this if needed, but this ensures no admin page is ever indexed
  // even if someone forgets to add robots metadata.
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dictionary = await getDictionary(defaultLocale);

  return (
    <html
      lang={defaultLocale}
      className={`${sourceSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SkipToContent label={dictionary.common.skipToContent} />
        <Header locale={defaultLocale} dictionary={dictionary} />
        <main id="main" tabIndex={-1} className="flex-1">
          {children}
        </main>
        <Footer locale={defaultLocale} dictionary={dictionary} />
      </body>
    </html>
  );
}

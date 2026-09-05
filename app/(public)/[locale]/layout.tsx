import type { Metadata } from "next";
import { Source_Sans_3, Noto_Sans_Arabic } from "next/font/google";
import "../../globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SkipToContent } from "@/components/shared/SkipToContent";
import { JsonLd, buildNgoJsonLd, buildWebSiteJsonLd } from "@/components/shared/JsonLd";
import { AnalyticsScripts } from "@/components/shared/AnalyticsScripts";
import { site } from "@/content/site";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localePath, locales, type Locale } from "@/lib/i18n/config";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/params";
import { createPublicMetadata } from "@/lib/metadata";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  // Use "block" to eliminate CLS from font swap. The body uses
  // min-h-full flex flex-col, which pushes the footer to the viewport
  // bottom on initial render. With "swap" or "optional", the font swap
  // causes text reflow that pushes the footer down — a visible CLS of
  // ~0.32 on pages with content near viewport height. With "block",
  // text is invisible for up to 3s while the font loads, then appears
  // directly with the custom font — no fallback-to-custom swap, no CLS.
  // The font is self-hosted and preloaded, so it loads in ~100-200ms
  // and the invisible period is imperceptible.
  display: "block",
  adjustFontFallback: true,
});

const arabicSans = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic-sans",
  display: "block",
  adjustFontFallback: true,
  // Only preload the Arabic font on Arabic pages to avoid unnecessary
  // font downloads on non-Arabic locales.
  preload: false,
});

export const dynamicParams = false;

export function generateStaticParams(): Array<{ locale: Locale }> {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: LocaleParams;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const dictionary = await getDictionary(locale);

  const base = createPublicMetadata({
    title: dictionary.meta.siteTitle,
    description: dictionary.meta.siteDescription,
    path: "/",
    locale,
  });

  return {
    metadataBase: new URL(site.url),
    ...base,
    title: {
      default: dictionary.meta.siteTitle,
      template: `%s | ${site.name}`,
    },
    applicationName: site.name,
    creator: site.name,
    publisher: site.legalName,
    category: "nonprofit",
    keywords: [...dictionary.meta.keywords],
    alternates: {
      ...base.alternates,
      types: {
        "application/rss+xml": [
          {
            url: localePath("/stories/rss.xml", locale),
            title: `${site.name} - ${dictionary.navigation.stories}`,
          },
        ],
      },
    },
  };
}

const ngoJsonLd = buildNgoJsonLd({
  name: site.name,
  legalName: site.legalName,
  url: site.url,
  email: site.contact.publicEmail,
  telephone: site.contact.phone,
  address: site.contact.address,
  city: site.contact.city,
  country: site.contact.country,
  description: site.description,
  logoUrl: "/brand/logos/vantage-logo-horizontal.svg",
  socials: site.socials,
  foundingDate: "2020-12",
});

const websiteJsonLd = buildWebSiteJsonLd(site.url, site.name);

export default async function LocaleRootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: LocaleParams;
}>) {
  const locale = await resolveLocale(params);
  const dictionary = await getDictionary(locale);
  const isRtl = locale === "ar";

  return (
    <html
      lang={locale}
      dir={isRtl ? "rtl" : "ltr"}
      className={`${sourceSans.variable} ${arabicSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SkipToContent label={dictionary.common.skipToContent} />
        <JsonLd data={ngoJsonLd} />
        <JsonLd data={websiteJsonLd} />
        <Header locale={locale} dictionary={dictionary} />
        <main id="main" tabIndex={-1} className="flex-1">
          {children}
        </main>
        <Footer locale={locale} dictionary={dictionary} />
        <AnalyticsScripts />
      </body>
    </html>
  );
}

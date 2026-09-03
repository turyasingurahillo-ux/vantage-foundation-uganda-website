import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
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

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

// The locale segment is the only source of truth for language, so every
// public page can still be prerendered. `dynamicParams = false` means an
// unsupported prefix such as /es/about-us 404s instead of rendering English
// under a language the site does not offer.
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

  return {
    metadataBase: new URL(site.url),
    title: {
      default: dictionary.meta.siteTitle,
      template: `%s | ${site.name}`,
    },
    description: dictionary.meta.siteDescription,
    applicationName: site.name,
    creator: site.name,
    publisher: site.legalName,
    category: "nonprofit",
    keywords: [...dictionary.meta.keywords],
    openGraph: {
      title: site.name,
      description: dictionary.meta.siteDescription,
      url: localePath("/", locale),
      type: "website",
      locale: openGraphLocale(locale),
      siteName: site.name,
      images: [
        {
          url: "/brand/social/vantage-foundation-uganda-og.jpg",
          width: 1200,
          height: 630,
          alt: site.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: site.name,
      description: dictionary.meta.siteDescription,
      images: ["/brand/social/vantage-foundation-uganda-og.jpg"],
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: localePath("/", locale),
      languages: {
        en: "/",
        de: "/de",
        fr: "/fr",
        "x-default": "/",
      },
      types: {
        "application/rss+xml": [
          {
            url: localePath("/stories/rss.xml", locale),
            title: `${site.name} — ${dictionary.navigation.stories}`,
          },
        ],
      },
    },
  };
}

function openGraphLocale(locale: Locale): string {
  return locale === "de" ? "de_DE" : locale === "fr" ? "fr_FR" : "en_UG";
}

const ngoJsonLd = buildNgoJsonLd({
  name: site.name,
  legalName: site.legalName,
  url: site.url,
  // Undefined unless a verified public alias is configured, so the protected
  // mailbox is never emitted into structured data.
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

  return (
    <html lang={locale} className={`${sourceSans.variable} h-full antialiased`}>
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

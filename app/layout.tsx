import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SkipToContent } from "@/components/shared/SkipToContent";
import { JsonLd, buildNgoJsonLd, buildWebSiteJsonLd } from "@/components/shared/JsonLd";
import { AnalyticsScripts } from "@/components/shared/AnalyticsScripts";
import { site } from "@/content/site";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Vantage Foundation Uganda | Community-led impact",
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  creator: site.name,
  publisher: site.legalName,
  category: "nonprofit",
  keywords: [
    "Vantage Foundation Uganda",
    "Uganda nonprofit",
    "community health Uganda",
    "financial literacy Uganda",
    "humanitarian assistance Uganda",
    "WASH Uganda",
    "youth-led nonprofit",
  ],
  openGraph: {
    title: site.name,
    description: site.description,
    url: "/",
    type: "website",
    locale: "en_UG",
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
    description: site.description,
    images: ["/brand/social/vantage-foundation-uganda-og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [
        {
          url: "/stories/rss.xml",
          title: `${site.name} — Stories & Insights`,
        },
      ],
    },
  },
};

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sourceSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SkipToContent />
        <JsonLd data={ngoJsonLd} />
        <JsonLd data={websiteJsonLd} />
        <Header />
        <main id="main" tabIndex={-1} className="flex-1">
          {children}
        </main>
        <Footer />
        <AnalyticsScripts />
      </body>
    </html>
  );
}

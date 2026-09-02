"use client";

import Link from "next/link";
import { trackArticleCta } from "./ArticleAnalytics";
import { localePath, type Locale } from "@/lib/i18n/config";
import { getPageContent } from "@/lib/i18n/content/pages";

/**
 * ArticleCtaBar — meaningful-action calls to action shown at the end of an
 * article. Each click fires an `article_cta_click` event with the cta_type
 * and destination so the admin panel can measure article-generated impact
 * (donations, volunteering, partnerships, newsletter sign-ups, etc.) rather
 * than judging articles by page views alone.
 *
 * CTAs: Donate, Volunteer, Partner with us, Contact, Join newsletter,
 * Visit programmes, Read about us.
 */
interface ArticleCtaBarProps {
  slug: string;
  locale?: Locale;
}

function CtaLink({
  href,
  ctaType,
  label,
  position,
}: {
  href: string;
  ctaType: string;
  label: string;
  position: string;
}) {
  return (
    <Link
      href={href}
      onClick={() => trackArticleCta(ctaType, href, position)}
      className="inline-flex items-center rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      {label}
    </Link>
  );
}

export function ArticleCtaBar({ slug, locale = "en" }: ArticleCtaBarProps) {
  // slug is included in the prop for future per-article CTA customization;
  // the tracker already knows the article via window.__vantageArticle.
  void slug;
  const c = getPageContent(locale).common;
  const p = getPageContent(locale).story;

  return (
    <div className="mt-12 rounded-xl border border-border bg-surface p-6">
      <h2 className="text-lg font-semibold">{c.takeAction}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {p.ctaDescription}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <CtaLink href={localePath("/donate", locale)} ctaType="donate" label={c.donate} position="cta-bar" />
        <CtaLink href={localePath("/get-involved#volunteer", locale)} ctaType="volunteer" label={c.volunteer} position="cta-bar" />
        <CtaLink href={localePath("/get-involved#partner", locale)} ctaType="partner" label={c.partnerWithUs} position="cta-bar" />
        <CtaLink href={localePath("/contact", locale)} ctaType="contact" label={c.contactVantage} position="cta-bar" />
        <CtaLink href={localePath("/our-work", locale)} ctaType="programmes" label={c.visitProgrammes} position="cta-bar" />
        <CtaLink href={localePath("/about-us", locale)} ctaType="about" label={c.aboutUs} position="cta-bar" />
      </div>
    </div>
  );
}

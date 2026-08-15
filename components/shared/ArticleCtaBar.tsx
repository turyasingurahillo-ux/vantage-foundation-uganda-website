"use client";

import { trackArticleCta } from "./ArticleAnalytics";

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
    <a
      href={href}
      onClick={() => trackArticleCta(ctaType, href, position)}
      className="inline-flex items-center rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      {label}
    </a>
  );
}

export function ArticleCtaBar({ slug }: ArticleCtaBarProps) {
  // slug is included in the prop for future per-article CTA customization;
  // the tracker already knows the article via window.__vantageArticle.
  void slug;
  return (
    <div className="mt-12 rounded-xl border border-border bg-surface p-6">
      <h2 className="text-lg font-semibold">Take action</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Inspired by this story? Here are ways you can help Vantage Foundation Uganda create more impact.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <CtaLink href="/donate" ctaType="donate" label="Donate" position="cta-bar" />
        <CtaLink href="/get-involved#volunteer" ctaType="volunteer" label="Volunteer" position="cta-bar" />
        <CtaLink href="/get-involved#partner" ctaType="partner" label="Partner with us" position="cta-bar" />
        <CtaLink href="/contact" ctaType="contact" label="Contact Vantage" position="cta-bar" />
        <CtaLink href="/our-work" ctaType="programmes" label="Visit programmes" position="cta-bar" />
        <CtaLink href="/about-us" ctaType="about" label="About us" position="cta-bar" />
      </div>
    </div>
  );
}

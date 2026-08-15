interface JsonLdProps {
  data: Record<string, unknown>;
}

function toAbsoluteUrl(baseUrl: string, value: string) {
  return new URL(value, `${baseUrl.replace(/\/$/, "")}/`).toString();
}

/**
 * Renders a JSON-LD structured data script tag.
 * Use this to add schema.org structured data to any page for SEO.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/**
 * Builds a BreadcrumbList schema.org object.
 */
export function buildBreadcrumbJsonLd(
  items: { label: string; url: string }[],
  baseUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: toAbsoluteUrl(baseUrl, item.url),
    })),
  };
}

/**
 * Builds an Article schema.org object for story pages.
 */
export function buildArticleJsonLd(args: {
  title: string;
  description: string;
  url: string;
  baseUrl: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
  authorType?: "Person" | "Organization";
  image?: string;
  type?: "Article" | "BlogPosting";
}) {
  const pageUrl = toAbsoluteUrl(args.baseUrl, args.url);

  return {
    "@context": "https://schema.org",
    "@type": args.type ?? "Article",
    headline: args.title,
    description: args.description,
    url: pageUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    datePublished: args.datePublished,
    dateModified: args.dateModified ?? args.datePublished,
    author: args.author
      ? { "@type": args.authorType ?? "Person", name: args.author }
      : undefined,
    image: args.image ? toAbsoluteUrl(args.baseUrl, args.image) : undefined,
    publisher: {
      "@type": "Organization",
      name: "Vantage Foundation Uganda",
      url: args.baseUrl,
      logo: {
        "@type": "ImageObject",
        url: toAbsoluteUrl(
          args.baseUrl,
          "/brand/logos/vantage-logo-horizontal.svg"
        ),
      },
    },
  };
}

/**
 * Builds a WebSite schema.org object (for the homepage).
 */
export function buildWebSiteJsonLd(baseUrl: string, name: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/projects?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Builds an FAQPage schema.org object for the FAQ page.
 */
export function buildFaqJsonLd(
  faqs: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Builds an Organization/NGO schema.org object with rich metadata.
 */
export function buildNgoJsonLd(args: {
  name: string;
  legalName: string;
  url: string;
  /**
   * Optional. Only pass a PUBLIC alias here, never Vantage's protected
   * operational mailbox — structured data is the single easiest field for an
   * address harvester to scrape. When omitted, a ContactPoint pointing at the
   * contact page is emitted instead, so search engines still get a contact
   * signal without an address being published.
   */
  email?: string;
  telephone: string;
  address: string;
  city: string;
  country: string;
  description: string;
  logoUrl?: string;
  socials?: { instagram?: string; linkedin?: string; youtube?: string };
  foundingDate?: string;
}) {
  const sameAs: string[] = [];
  if (args.socials?.instagram) sameAs.push(args.socials.instagram);
  if (args.socials?.linkedin) sameAs.push(args.socials.linkedin);
  if (args.socials?.youtube) sameAs.push(args.socials.youtube);

  return {
    "@context": "https://schema.org",
    "@type": ["NGO", "Organization"],
    name: args.name,
    alternateName: args.legalName,
    legalName: args.legalName,
    url: args.url,
    logo: args.logoUrl ? `${args.url}${args.logoUrl}` : undefined,
    image: args.logoUrl ? `${args.url}${args.logoUrl}` : undefined,
    email: args.email,
    telephone: args.telephone,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      telephone: args.telephone,
      url: toAbsoluteUrl(args.url, "/contact"),
      ...(args.email ? { email: args.email } : {}),
      areaServed: args.country,
      availableLanguage: "English",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: args.address,
      addressLocality: args.city,
      addressCountry: args.country,
    },
    description: args.description,
    foundingDate: args.foundingDate,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  };
}

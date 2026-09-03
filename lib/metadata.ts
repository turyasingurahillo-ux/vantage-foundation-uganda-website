import type { Metadata } from "next";
import { site } from "@/content/site";
import {
  resolveSocialImage,
  type SocialImageCandidate,
} from "@/lib/social-image";
import { localePath, type Locale } from "@/lib/i18n/config";

type PublicPageMetadata = {
  title: string;
  description: string;
  path: `/${string}` | "/";
  /**
   * The social card. A bare string is treated as an image path; pass an array
   * to express a preference chain (dedicated card, then hand-made OG image,
   * then hero image). Entries in a format link-preview crawlers cannot render
   * are skipped, and the branded site-wide card is used when none survive —
   * see `lib/social-image.ts`.
   */
  image?: SocialImageCandidate | ReadonlyArray<SocialImageCandidate | undefined>;
  /** Alt text used when the chosen candidate carries none. */
  imageAlt?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  locale?: Locale;
  /**
   * Whether the *principal content* of this page exists in the requested
   * language, not merely the navigation around it.
   *
   * Pages built from the dictionaries (home, about, legal, FAQ …) are truly
   * localized and advertise `en`/`de`/`fr`/`x-default` alternates.
   *
   * Editorial detail pages — a story, project, programme or team biography —
   * have a translated shell wrapped around an English body. Claiming a German
   * alternate for those would tell search engines a German version exists
   * when it does not, and would put three near-duplicate pages into the
   * index. For those we emit no `hreflang` and point every localized variant
   * at the English URL as the canonical, so the versions consolidate onto one
   * indexable page. See docs/internationalization.md.
   */
  contentLocalized?: boolean;
};

export function createPublicMetadata({
  title,
  description,
  path,
  image,
  imageAlt,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
  locale = "en",
  contentLocalized = true,
}: PublicPageMetadata): Metadata {
  const localizedPath = localePath(path, locale);
  const canonicalPath = contentLocalized ? localizedPath : localePath(path, "en");
  const socialTitle = title.includes(site.name)
    ? title
    : `${title} | ${site.name}`;

  const socialImage = resolveSocialImage(
    Array.isArray(image) ? image : [image as SocialImageCandidate | undefined],
    imageAlt?.trim() || socialTitle
  );

  // `secureUrl` is emitted as og:image:secure_url, which Facebook reads in
  // preference to og:image. The resolver always returns absolute HTTPS, so the
  // two carry the same value.
  const openGraphImage = {
    url: socialImage.url,
    secureUrl: socialImage.url,
    alt: socialImage.alt,
    type: socialImage.type,
    ...(socialImage.width ? { width: socialImage.width } : {}),
    ...(socialImage.height ? { height: socialImage.height } : {}),
  };

function openGraphLocaleValue(locale: Locale): string {
  switch (locale) {
    case "de":
      return "de_DE";
    case "fr":
      return "fr_FR";
    case "es":
      return "es_ES";
    case "ar":
      return "ar_AR";
    default:
      return "en_UG";
  }
}

  const openGraphBase = {
    title: socialTitle,
    description,
    url: localizedPath,
    siteName: site.name,
    locale: openGraphLocaleValue(locale),
    alternateLocale: ["en_UG", "de_DE", "fr_FR", "es_ES", "ar_AR"].filter(
      (value) => value !== openGraphLocaleValue(locale),
    ),
    images: [openGraphImage],
  };

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
      ...(contentLocalized
        ? {
            languages: {
              en: localePath(path, "en"),
              de: localePath(path, "de"),
              fr: localePath(path, "fr"),
              es: localePath(path, "es"),
              ar: localePath(path, "ar"),
              "x-default": localePath(path, "en"),
            },
          }
        : {}),
    },
    openGraph:
      type === "article"
        ? {
            ...openGraphBase,
            type: "article",
            publishedTime,
            modifiedTime,
            authors,
          }
        : {
            ...openGraphBase,
            type: "website",
          },
    twitter: {
      // X falls back to the grey generic-document card rather than the
      // article artwork unless it gets a large-image card it can size, so the
      // image descriptor carries the same dimensions and type as the OG one.
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [openGraphImage],
    },
  };
}

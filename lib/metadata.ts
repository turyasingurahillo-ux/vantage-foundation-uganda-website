import type { Metadata } from "next";
import { site } from "@/content/site";
import {
  resolveSocialImage,
  type SocialImageCandidate,
} from "@/lib/social-image";

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
}: PublicPageMetadata): Metadata {
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

  const openGraphBase = {
    title: socialTitle,
    description,
    url: path,
    siteName: site.name,
    locale: "en_UG",
    images: [openGraphImage],
  };

  return {
    title,
    description,
    alternates: {
      canonical: path,
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

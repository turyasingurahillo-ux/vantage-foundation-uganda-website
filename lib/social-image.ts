import type { SeoMeta, SocialImageSource } from "@/types";
import { toCanonicalUrl } from "@/lib/site-url";

/**
 * Social-card image resolution.
 *
 * Link previews on X, LinkedIn, Facebook and WhatsApp are rendered by crawlers
 * that are far less capable than a browser, and they need two things the site
 * itself never has to think about:
 *
 *   1. A format they can decode. The site serves WebP and AVIF heroes because
 *      browsers handle them and they are much smaller. Link-preview crawlers
 *      are a different story: LinkedIn and WhatsApp do not render WebP
 *      previews at all, and X degrades a `summary_large_image` card to the
 *      grey generic-document placeholder when it cannot decode or size the
 *      asset. Only the formats in `SOCIAL_SAFE_MIME_BY_EXTENSION` are safe to
 *      advertise.
 *
 *   2. Declared dimensions and a MIME type. Without `og:image:width` and
 *      `og:image:height` a crawler has to fetch and decode the image before it
 *      can decide whether the card qualifies as a large one, and several give
 *      up rather than do the work.
 *
 * So `resolveSocialImage` walks a candidate chain and returns the first entry
 * a crawler can be trusted to render — falling back to the branded site-wide
 * card rather than advertising an image that previews as broken. A hero image
 * in an unsupported format is silently skipped: a correct generic card beats a
 * grey placeholder where the article's own artwork should be.
 */

/** Open Graph's recommended card size, and what `npm run generate:social` emits. */
export const SOCIAL_CARD_WIDTH = 1200;
export const SOCIAL_CARD_HEIGHT = 630;

/** Where `npm run generate:social` writes per-item cards. */
export const SOCIAL_CARD_DIRECTORY = "/images/social";

/** The site-wide card, used whenever an item has no usable image of its own. */
export const DEFAULT_SOCIAL_IMAGE: Required<
  Omit<SocialImageSource, "alt">
> = {
  url: "/brand/social/vantage-foundation-uganda-og.jpg",
  width: SOCIAL_CARD_WIDTH,
  height: SOCIAL_CARD_HEIGHT,
  type: "image/jpeg",
};

/**
 * Extensions every major link-preview crawler decodes.
 *
 * `.webp` and `.avif` are deliberately absent — see the module comment. Adding
 * either here is what reintroduces the grey-placeholder bug.
 */
const SOCIAL_SAFE_MIME_BY_EXTENSION: Readonly<Record<string, string>> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
};

const SOCIAL_SAFE_MIME_TYPES = new Set(
  Object.values(SOCIAL_SAFE_MIME_BY_EXTENSION)
);

/** A candidate for the card slot: either a bare path or a described image. */
export type SocialImageCandidate = string | SocialImageSource;

/** What the metadata helper emits. `url` is always absolute HTTPS. */
export type ResolvedSocialImage = {
  url: string;
  alt: string;
  type: string;
  width?: number;
  height?: number;
};

/**
 * The MIME type for a path, but only for formats crawlers render reliably.
 * Returns undefined for WebP, AVIF, SVG and anything unrecognised — callers
 * treat that as "not usable as a social card".
 */
export function socialMimeType(url: string): string | undefined {
  const path = url.split(/[?#]/)[0].toLowerCase();
  const dot = path.lastIndexOf(".");
  if (dot === -1) return undefined;
  return SOCIAL_SAFE_MIME_BY_EXTENSION[path.slice(dot)];
}

/**
 * Whether a candidate can be advertised to link-preview crawlers.
 *
 * Two rules, both load-bearing:
 *
 *   - It must be a site-relative path. Admin-authored stories carry a
 *     presigned R2 hero URL with a 24-hour TTL (see lib/stories-public.ts),
 *     and crawlers cache an og:image for far longer than that — the preview
 *     would silently rot into a broken image. Cards are served from the
 *     Vantage domain or not at all.
 *   - It must be a format every major crawler decodes.
 */
export function isSocialSafeImage(candidate: SocialImageCandidate): boolean {
  const source = typeof candidate === "string" ? { url: candidate } : candidate;
  const url = source.url?.trim();
  if (!url || !url.startsWith("/") || url.startsWith("//")) return false;
  const type = source.type ?? socialMimeType(url);
  return Boolean(type && SOCIAL_SAFE_MIME_TYPES.has(type));
}

/**
 * The card generated for a content item by `npm run generate:social`.
 *
 * The generator's contract is that every card it writes is exactly
 * 1200×630 JPEG, so the dimensions are known without reading the file —
 * which matters because `public/` is served by the CDN and is not reliably
 * readable from the filesystem at render time. `npm run validate-content`
 * checks that each referenced card actually exists on disk.
 */
export function socialCard(slug: string, alt?: string): SocialImageSource {
  return {
    url: `${SOCIAL_CARD_DIRECTORY}/${slug}-og.jpg`,
    width: SOCIAL_CARD_WIDTH,
    height: SOCIAL_CARD_HEIGHT,
    type: "image/jpeg",
    ...(alt ? { alt } : {}),
  };
}

/** The shape `contentSocialImageCandidates` needs from a story or project. */
export type SocialImageContentItem = {
  slug: string;
  heroImage?: string;
  seo?: SeoMeta;
  /** Set on admin-authored items loaded from the database. */
  dbId?: number;
};

/**
 * The card preference chain for a story or project, in order:
 *
 *   1. `seo.socialImage` — an explicitly described card.
 *   2. `seo.ogImage` — a hand-made OG image (Healers in Crisis has one).
 *   3. The generated card for the slug, from `npm run generate:social`.
 *   4. The hero image, for the rare item whose hero is already a safe format.
 *
 * Routes and `npm run validate-content` both go through this, so the card the
 * validator checks for is always the card the page will actually advertise.
 *
 * Admin-authored items have no generated card — they are written after the
 * build — so step 3 is skipped for them and they fall through to the branded
 * site-wide card. That is deliberate: advertising a card URL that 404s is
 * worse than advertising a generic one that works.
 */
export function contentSocialImageCandidates(
  item: SocialImageContentItem
): ReadonlyArray<SocialImageCandidate | undefined> {
  return [
    item.seo?.socialImage,
    item.seo?.ogImage,
    item.dbId === undefined ? socialCard(item.slug) : undefined,
    item.heroImage,
  ];
}

/**
 * Pick the first candidate a link-preview crawler can render, and return it
 * with an absolute HTTPS URL, alt text and a MIME type.
 *
 * Candidates are tried in order and unusable ones are skipped, so callers can
 * express a preference chain — dedicated card, then hand-made OG image, then
 * hero image — without checking formats themselves. When nothing survives, the
 * branded site-wide card is returned.
 */
export function resolveSocialImage(
  candidates: ReadonlyArray<SocialImageCandidate | undefined | null>,
  fallbackAlt: string
): ResolvedSocialImage {
  for (const candidate of candidates) {
    if (!candidate) continue;
    const source =
      typeof candidate === "string" ? { url: candidate } : candidate;
    if (!isSocialSafeImage(source)) continue;

    const url = source.url.trim();
    const type = source.type ?? socialMimeType(url)!;
    return {
      url: toCanonicalUrl(url),
      alt: source.alt?.trim() || fallbackAlt,
      type,
      ...(source.width ? { width: source.width } : {}),
      ...(source.height ? { height: source.height } : {}),
    };
  }

  return {
    url: toCanonicalUrl(DEFAULT_SOCIAL_IMAGE.url),
    alt: fallbackAlt,
    type: DEFAULT_SOCIAL_IMAGE.type,
    width: DEFAULT_SOCIAL_IMAGE.width,
    height: DEFAULT_SOCIAL_IMAGE.height,
  };
}

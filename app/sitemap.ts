import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getProjectSlugs } from "@/content/projects";
import { getStorySlugs } from "@/content/stories";
import { getDbStorySlugs } from "@/lib/stories-public";
import { getPublishedAreas } from "@/content/areas";
import { getTeamSlugs } from "@/content/team";
import { localePath, locales, type Locale } from "@/lib/i18n/config";

/**
 * Routes whose principal content is genuinely translated. These get one entry
 * per locale plus reciprocal `hreflang` alternates.
 */
const LOCALIZED_ROUTES = [
  "/",
  "/about-us",
  "/about-us/team",
  "/our-work",
  "/projects",
  "/impact",
  "/stories",
  "/gallery",
  "/get-involved",
  "/donors-and-sponsors",
  "/donate",
  "/contact",
  "/reports-and-accountability",
  "/faq",
  "/privacy",
  "/terms",
  "/safeguarding",
  "/accessibility",
];

/**
 * Editorial detail routes have a localized shell around an English body, so
 * only the English URL is listed. `lib/metadata.ts` canonicalises the `/de`
 * and `/fr` variants onto that same English URL, so the sitemap and the
 * hreflang/canonical tags tell search engines the same story. Advertising
 * `/de/stories/...` here while emitting no German `hreflang` would be exactly
 * the contradiction we want to avoid.
 */
function englishOnlyEntries(
  baseUrl: string,
  paths: string[],
  priority: number,
): MetadataRoute.Sitemap {
  return paths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority,
  }));
}

function languageAlternates(baseUrl: string, path: string) {
  return Object.fromEntries(
    locales.map((locale) => [locale, `${baseUrl}${localePath(path, locale)}`]),
  ) as Record<Locale, string>;
}

function localizedEntries(
  baseUrl: string,
  path: string,
  priority: number,
  changeFrequency: "monthly" = "monthly",
): MetadataRoute.Sitemap {
  const languages = languageAlternates(baseUrl, path);
  return locales.map((locale) => ({
    url: `${baseUrl}${localePath(path, locale)}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = site.url;

  const routes: MetadataRoute.Sitemap = LOCALIZED_ROUTES.flatMap((route) =>
    localizedEntries(baseUrl, route, route === "/" ? 1 : 0.8),
  );

  const storySlugs = [
    ...new Set([...getStorySlugs(), ...(await getDbStorySlugs())]),
  ];

  return [
    ...routes,
    ...englishOnlyEntries(
      baseUrl,
      getPublishedAreas().map((area) => `/programmes/${area.id}`),
      0.7,
    ),
    ...englishOnlyEntries(
      baseUrl,
      getProjectSlugs().map((slug) => `/projects/${slug}`),
      0.7,
    ),
    ...englishOnlyEntries(
      baseUrl,
      storySlugs.map((slug) => `/stories/${slug}`),
      0.7,
    ),
    ...englishOnlyEntries(
      baseUrl,
      getTeamSlugs().map((slug) => `/about-us/team/${slug}`),
      0.6,
    ),
  ];
}

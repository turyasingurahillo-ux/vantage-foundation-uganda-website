/**
 * Broken link checker: scans all internal links in the codebase and
 * verifies they point to valid routes or real files in public/.
 *
 * Route matching understands the site's localization architecture:
 * - English is the default locale and is unprefixed.
 * - Translated locales use prefixes (e.g. /de/about-us, /fr/projects).
 * - /en/... redirects to the unprefixed canonical and is also accepted.
 * - Dynamic segments are matched as wildcards at any position in the path.
 *
 * Finite dynamic-route validation:
 * - /projects/[slug] validated against content/projects.ts slugs.
 * - /programmes/[slug] validated against content/areas.ts ids.
 * - /stories/[slug] validated against published static content/stories.ts
 *   slugs (DB-backed stories are out of scope for a static source checker).
 * - /about-us/team/[slug] validated against published content/team.ts slugs.
 *
 * Run: npm run check-links
 */
import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { getProjectSlugs } from "../content/projects";
import { areasOfWork } from "../content/areas";
import { getStorySlugs } from "../content/stories";
import { getTeamSlugs } from "../content/team";

const ROOT = process.cwd();
const APP_DIR = join(ROOT, "app");
const PUBLIC_DIR = join(ROOT, "public");

const IGNORED_SCAN_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "tests",
  "test-results",
  "playwright-report",
  "coverage",
]);

const PAGE_FILE = /^page\.(tsx|ts|jsx|js)$/;
const ROUTE_FILE = /^route\.(tsx|ts|js)$/;

// Supported locales — must match lib/i18n/config.ts.
const LOCALES = ["en", "de", "fr", "es", "ar"];
const DEFAULT_LOCALE = "en";

// Finite slug sets for content-backed dynamic routes.
// Derived from the authoritative content helpers — no hardcoded lists.
// Stories: only static content/stories.ts slugs are checked. DB-backed
// story slugs (runtime-generated) are out of scope for a static source
// checker and are documented as a known limitation.
const FINITE_SLUGS: Record<string, Set<string>> = {
  projects: new Set(getProjectSlugs()),
  programmes: new Set(areasOfWork.map((a) => a.id)),
  stories: new Set(getStorySlugs()),
  team: new Set(getTeamSlugs()),
};

/**
 * Collect routes from the app directory.
 *
 * `basePath` must accumulate down the tree — an earlier version passed only
 * the current segment, so nested routes such as app/about-us/team registered
 * as "/team" and every real link to them was reported broken.
 *
 * Dynamic segments (`[locale]`, `[slug]`, `[id]`) are recorded as `*` in the
 * route pattern. The route pattern is a slash-separated string where `*`
 * matches exactly one path segment (not zero, not multiple).
 */
async function collectRoutes(dir: string, basePath = ""): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const routes: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      // Private folders (_components) are never routable.
      if (entry.name.startsWith("_")) continue;

      const isGroup = entry.name.startsWith("(") && entry.name.endsWith(")");
      const isDynamic = entry.name.startsWith("[") && entry.name.endsWith("]");

      // Route groups contribute no path segment; dynamic segments match
      // exactly one path segment.
      const nextBase = isGroup
        ? basePath
        : isDynamic
          ? `${basePath}/*`
          : `${basePath}/${entry.name}`;

      routes.push(...(await collectRoutes(fullPath, nextBase)));
    } else if (PAGE_FILE.test(entry.name) || ROUTE_FILE.test(entry.name)) {
      // Only a page/route file makes a path routable — a bare directory
      // does not.
      routes.push(basePath || "/");
    }
  }

  return routes;
}

/** Every file actually served from public/, as an absolute URL path. */
async function collectPublicFiles(dir: string, basePath = ""): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(
        ...(await collectPublicFiles(fullPath, `${basePath}/${entry.name}`)),
      );
    } else {
      files.push(`${basePath}/${entry.name}`);
    }
  }
  return files;
}

/**
 * Convert a route pattern (with wildcard segments) into a RegExp.
 *
 * Each wildcard in the pattern matches exactly one path segment (one or more
 * characters that are not a slash). This prevents a wildcard from matching
 * multiple segments or zero segments.
 */
function routePatternToRegex(pattern: string): RegExp {
  // Escape regex special characters, then replace escaped \* with a
  // segment-matching group.
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, (ch) => {
    if (ch === "*") return "\u0000"; // placeholder for wildcard
    return "\\" + ch;
  });
  const regexStr = escaped.replace(/\u0000/g, "([^/]+)");
  return new RegExp("^" + regexStr + "$");
}

/**
 * Extract the slug from a candidate path for a given finite route prefix.
 *
 * For example, given prefix "wildcard/projects" and candidate
 * "/en/projects/kasaale", returns "kasaale". Returns null if the path
 * does not match the prefix shape.
 */
function extractSlug(candidate: string, prefix: string): string | null {
  // Build a regex that captures the slug segment after the prefix.
  // The prefix uses * as a wildcard for one segment.
  const prefixRegex = routePatternToRegex(`${prefix}/*`);
  const match = candidate.match(prefixRegex);
  return match ? match[match.length - 1] : null;
}

/**
 * Match a URL path against the collected route patterns.
 *
 * Handles the site localization architecture:
 * - The [locale] dynamic segment produces a wildcard at the root, so routes
 *   like wildcard/about-us exist in the route table.
 * - English is unprefixed: /about-us is the canonical English route.
 *   We synthesize an English-prefixed version (/en/about-us) for matching
 *   against the wildcard patterns, and also try the unprefixed path directly.
 * - /en/... is accepted (it redirects, but the route exists).
 * - Other locale prefixes (/de/..., /fr/..., etc.) match the wildcard patterns.
 * - Non-locale first segments (e.g. /admin, /api) match exact or
 *   non-locale route patterns directly.
 *
 * Finite dynamic routes (projects, programmes, stories, team) validate
 * the slug against the known content slug sets.
 */
function matchRoute(urlPath: string, routePatterns: string[]): boolean {
  // We try multiple candidate paths to handle the locale architecture.
  const candidates = [urlPath];

  const firstSegment = urlPath.split("/")[1] ?? "";
  const hasLocalePrefix = LOCALES.includes(firstSegment);
  const isNonLocaleRoute =
    firstSegment === "admin" ||
    firstSegment === "api" ||
    firstSegment === "" ||
    firstSegment === "icon.svg" ||
    firstSegment === "manifest.webmanifest" ||
    firstSegment === "robots.txt" ||
    firstSegment === "sitemap.xml" ||
    firstSegment === "apple-icon.png";

  // If the path has no locale prefix and is not a known non-locale route,
  // try prepending each locale to see if it matches a localized route
  // pattern. This handles the English canonical case: /about-us should
  // match the wildcard-prefixed route pattern because English is the
  // default locale.
  if (!hasLocalePrefix && !isNonLocaleRoute) {
    for (const locale of LOCALES) {
      candidates.push(`/${locale}${urlPath}`);
    }
  }

  // If the path starts with /en/, also try the unprefixed version.
  if (urlPath.startsWith(`/${DEFAULT_LOCALE}/`)) {
    candidates.push(urlPath.replace(`/${DEFAULT_LOCALE}`, "") || "/");
  }

  for (const candidate of candidates) {
    for (const pattern of routePatterns) {
      // The root "/*" pattern represents the [locale] dynamic segment.
      // It should only match known locale prefixes, not arbitrary
      // single-segment paths like /this-route-does-not-exist.
      if (pattern === "/*") {
        const seg = candidate.split("/")[1] ?? "";
        if (LOCALES.includes(seg) && candidate.split("/").length === 2) {
          return true;
        }
        continue;
      }

      // Patterns starting with "/*/" represent [locale]/... routes.
      // The first wildcard segment must be a known locale, not an
      // arbitrary string like "xx". This prevents /xx/about-us from
      // matching the /*/about-us pattern.
      if (pattern.startsWith("/*/")) {
        const seg = candidate.split("/")[1] ?? "";
        if (!LOCALES.includes(seg)) continue;
      }

      const regex = routePatternToRegex(pattern);
      if (!regex.test(candidate)) continue;

      // Finite dynamic-route validation: check the slug against known
      // content slugs for content-backed routes.
      //
      // The pattern is like "/*/projects/*" (locale/projects/[slug]).
      // We need to extract the slug and check it against FINITE_SLUGS.
      //
      // Map route prefixes to finite slug set keys.
      const finiteRouteMap: Record<string, keyof typeof FINITE_SLUGS> = {
        "/*/projects": "projects",
        "/*/programmes": "programmes",
        "/*/stories": "stories",
        "/*/about-us/team": "team",
      };

      let isFiniteRoute = false;
      for (const [prefix, slugKey] of Object.entries(finiteRouteMap)) {
        if (pattern === `${prefix}/*`) {
          isFiniteRoute = true;
          const slug = extractSlug(candidate, prefix);
          if (slug && FINITE_SLUGS[slugKey].has(slug)) {
            return true;
          }
          // Slug doesn't match — this candidate is invalid for this
          // finite route. Break out of the inner loop; do NOT fall
          // through to the generic "pattern matched" return true below.
          break;
        }
      }

      // If this was a finite route pattern but the slug didn't match,
      // do not accept the candidate — try the next pattern.
      if (isFiniteRoute) continue;

      // Not a finite dynamic route — pattern matched, accept it.
      return true;
    }
  }

  return false;
}

const LINK_PATTERNS = [
  /href=["'`]([^"'`]+)["'`]/g,
  /<Link\s+href=["'`]([^"'`]+)["'`]/g,
  /url:\s*["'`]([^"'`]+)["'`]/g,
];

async function scanLinks(dir: string): Promise<{ url: string; file: string }[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const links: { url: string; file: string }[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_SCAN_DIRS.has(entry.name)) continue;
      links.push(...(await scanLinks(fullPath)));
    } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
      const content = await readFile(fullPath, "utf8");
      for (const pattern of LINK_PATTERNS) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const url = match[1];
          if (!url.startsWith("/") || url.startsWith("//")) continue;
          // Interpolated hrefs (`/team/${slug}`) resolve at runtime.
          if (url.includes("${")) continue;
          links.push({ url, file: fullPath });
        }
      }
    }
  }

  return links;
}

// Export for testing.
export {
  collectRoutes,
  collectPublicFiles,
  scanLinks,
  matchRoute,
  routePatternToRegex,
  extractSlug,
  LINK_PATTERNS,
  LOCALES,
  FINITE_SLUGS,
};

async function main() {
  console.log("Collecting routes...");
  const routePatterns = await collectRoutes(APP_DIR);
  const publicFiles = new Set(await collectPublicFiles(PUBLIC_DIR));

  console.log(
    `Found ${routePatterns.length} routes and ${publicFiles.size} public files.\n`,
  );

  console.log("Scanning for internal links...");
  const links = await scanLinks(ROOT);

  const uniqueLinks = [...new Map(links.map((l) => [l.url, l])).values()];
  console.log(`Found ${uniqueLinks.length} unique internal links.\n`);

  const broken: { url: string; file: string }[] = [];
  for (const link of uniqueLinks) {
    const url = link.url.split("?")[0].split("#")[0];
    if (url === "/" || url === "") continue;

    if (publicFiles.has(url)) continue;

    if (!matchRoute(url, routePatterns)) {
      broken.push(link);
    }
  }

  if (broken.length === 0) {
    console.log("✓ No broken internal links found.");
    process.exit(0);
  }

  console.log(`✗ Found ${broken.length} broken link(s):\n`);
  for (const link of broken) {
    const relativePath = link.file
      .replace(ROOT, "")
      .replace(/^[\\/]/, "")
      .replace(/\\/g, "/");
    console.log(`  ${link.url} (in ${relativePath})`);
  }

  process.exit(1);
}

// Run main() only when this module is the direct entry point,
// not when imported as a library (e.g. by tests/unit/check-links.test.ts).
const isMainModule = (() => {
  if (!process.argv[1]) return false;
  const argvPath = resolve(process.argv[1]).replace(/\\/g, "/");
  const modulePath = fileURLToPath(import.meta.url).replace(/\\/g, "/");
  return argvPath === modulePath;
})();

if (isMainModule) {
  main().catch((err) => {
    console.error("Link check failed:", err);
    process.exit(1);
  });
}

// @vitest-environment node
/**
 * Regression tests for the check-links route matcher.
 *
 * These tests prove the matcher correctly handles:
 * - Dynamic segments at any path position (not just suffixes)
 * - The hidden/default English locale (unprefixed canonical)
 * - Supported locale prefixes (de, fr, es, ar)
 * - English-prefixed paths (/en/... redirects to canonical)
 * - Static asset validation
 * - Deliberately nonexistent routes and assets
 */
import { describe, it, expect } from "vitest";
import { matchRoute, routePatternToRegex } from "../../scripts/check-links";

// Route patterns as collected from the app directory by collectRoutes().
// These mirror the actual app/ structure: [locale] produces a wildcard
// at the root, so public routes are wildcard-prefixed.
const ROUTE_PATTERNS = [
  "/",
  "/*",
  "/*/about-us",
  "/*/about-us/team",
  "/*/about-us/team/*",
  "/*/accessibility",
  "/*/brand-guide",
  "/*/contact",
  "/*/donate",
  "/*/donors-and-sponsors",
  "/*/faq",
  "/*/gallery",
  "/*/get-involved",
  "/*/impact",
  "/*/our-work",
  "/*/privacy",
  "/*/programmes/*",
  "/*/projects",
  "/*/projects/*",
  "/*/reports-and-accountability",
  "/*/safeguarding",
  "/*/stories",
  "/*/stories/*",
  "/*/stories/rss.xml",
  "/*/terms",
  "/admin",
  "/admin/admins",
  "/admin/analytics",
  "/admin/analytics/service",
  "/admin/audit",
  "/admin/donations",
  "/admin/donations/*",
  "/admin/login",
  "/admin/media",
  "/admin/messages",
  "/admin/organisations",
  "/admin/organisations/*",
  "/admin/stories",
  "/admin/stories/*",
  "/api/admin/admins",
  "/api/admin/login",
  "/api/admin/media",
  "/api/admin/media/presign",
  "/api/admin/messages/reply",
  "/api/analytics/events",
  "/api/analytics/whatsapp-click",
  "/api/inbound/email",
  "/api/locale",
];

describe("routePatternToRegex", () => {
  it("matches exact paths", () => {
    expect(routePatternToRegex("/admin").test("/admin")).toBe(true);
    expect(routePatternToRegex("/admin").test("/admin/login")).toBe(false);
  });

  it("matches a single wildcard segment", () => {
    const re = routePatternToRegex("/*");
    expect(re.test("/en")).toBe(true);
    expect(re.test("/de")).toBe(true);
    expect(re.test("/admin")).toBe(true);
    // Wildcard matches exactly one segment, not multiple
    expect(re.test("/en/about-us")).toBe(false);
    expect(re.test("/")).toBe(false);
  });

  it("matches wildcards at non-suffix positions", () => {
    const re = routePatternToRegex("/*/about-us");
    expect(re.test("/en/about-us")).toBe(true);
    expect(re.test("/de/about-us")).toBe(true);
    expect(re.test("/en/projects")).toBe(false);
  });

  it("matches multiple wildcards", () => {
    const re = routePatternToRegex("/*/projects/*");
    expect(re.test("/en/projects/kasaale-deep-borehole")).toBe(true);
    expect(re.test("/de/projects/kasaale-deep-borehole")).toBe(true);
    // Wildcard does not match multiple segments
    expect(re.test("/en/projects/foo/bar")).toBe(false);
  });
});

describe("matchRoute — basic paths", () => {
  it("matches /", () => {
    expect(matchRoute("/", ROUTE_PATTERNS)).toBe(true);
  });

  it("matches /admin", () => {
    expect(matchRoute("/admin", ROUTE_PATTERNS)).toBe(true);
  });

  it("matches /api/admin/media/presign", () => {
    expect(matchRoute("/api/admin/media/presign", ROUTE_PATTERNS)).toBe(true);
  });
});

describe("matchRoute — English canonical (unprefixed)", () => {
  it("matches /about-us as the English canonical route", () => {
    expect(matchRoute("/about-us", ROUTE_PATTERNS)).toBe(true);
  });

  it("matches /projects as the English canonical route", () => {
    expect(matchRoute("/projects", ROUTE_PATTERNS)).toBe(true);
  });

  it("matches /contact as the English canonical route", () => {
    expect(matchRoute("/contact", ROUTE_PATTERNS)).toBe(true);
  });

  it("matches /stories as the English canonical route", () => {
    expect(matchRoute("/stories", ROUTE_PATTERNS)).toBe(true);
  });
});

describe("matchRoute — English-prefixed (redirects to canonical)", () => {
  it("matches /en/about-us (redirects to /about-us but route exists)", () => {
    expect(matchRoute("/en/about-us", ROUTE_PATTERNS)).toBe(true);
  });

  it("matches /en/projects (redirects to /projects but route exists)", () => {
    expect(matchRoute("/en/projects", ROUTE_PATTERNS)).toBe(true);
  });
});

describe("matchRoute — translated locale prefixes", () => {
  it("matches /de/about-us", () => {
    expect(matchRoute("/de/about-us", ROUTE_PATTERNS)).toBe(true);
  });

  it("matches /fr/projects", () => {
    expect(matchRoute("/fr/projects", ROUTE_PATTERNS)).toBe(true);
  });

  it("matches /es/stories", () => {
    expect(matchRoute("/es/stories", ROUTE_PATTERNS)).toBe(true);
  });

  it("matches /ar/contact", () => {
    expect(matchRoute("/ar/contact", ROUTE_PATTERNS)).toBe(true);
  });
});

describe("matchRoute — dynamic slugs", () => {
  it("matches /projects/kasaale-deep-borehole", () => {
    expect(matchRoute("/projects/kasaale-deep-borehole", ROUTE_PATTERNS)).toBe(
      true,
    );
  });

  it("matches /de/projects/kasaale-deep-borehole (localized project detail)", () => {
    expect(
      matchRoute("/de/projects/kasaale-deep-borehole", ROUTE_PATTERNS),
    ).toBe(true);
  });

  it("matches /stories/healers-in-crisis-ugandas-medical-interns", () => {
    expect(
      matchRoute(
        "/stories/healers-in-crisis-ugandas-medical-interns",
        ROUTE_PATTERNS,
      ),
    ).toBe(true);
  });

  it("matches /fr/stories/healers-in-crisis-ugandas-medical-interns (localized story)", () => {
    expect(
      matchRoute(
        "/fr/stories/healers-in-crisis-ugandas-medical-interns",
        ROUTE_PATTERNS,
      ),
    ).toBe(true);
  });

  it("matches /programmes/health (dynamic programme slug)", () => {
    expect(matchRoute("/programmes/health", ROUTE_PATTERNS)).toBe(true);
  });

  it("matches /de/programmes/health (localized programme)", () => {
    expect(matchRoute("/de/programmes/health", ROUTE_PATTERNS)).toBe(true);
  });
});

describe("matchRoute — nonexistent routes", () => {
  it("rejects a deliberately nonexistent route", () => {
    expect(matchRoute("/this-route-does-not-exist", ROUTE_PATTERNS)).toBe(
      false,
    );
  });

  it("rejects a nonexistent nested route", () => {
    expect(
      matchRoute("/about-us/nonexistent-subpage", ROUTE_PATTERNS),
    ).toBe(false);
  });

  it("rejects a nonexistent admin sub-route", () => {
    expect(matchRoute("/admin/nonexistent", ROUTE_PATTERNS)).toBe(false);
  });

  it("rejects an unsupported locale prefix (/xx/about-us)", () => {
    expect(matchRoute("/xx/about-us", ROUTE_PATTERNS)).toBe(false);
  });

  it("rejects an unsupported locale prefix on a detail route (/xx/projects/example)", () => {
    expect(matchRoute("/xx/projects/example", ROUTE_PATTERNS)).toBe(false);
  });
});

describe("matchRoute — admin routes (non-locale)", () => {
  it("matches /admin/donations/123 (dynamic admin donation id)", () => {
    expect(matchRoute("/admin/donations/123", ROUTE_PATTERNS)).toBe(true);
  });

  it("matches /admin/stories/42 (dynamic admin story id)", () => {
    expect(matchRoute("/admin/stories/42", ROUTE_PATTERNS)).toBe(true);
  });

  it("does not treat /admin as a locale prefix", () => {
    // /admin should match the exact /admin route, not be prepended with locales
    expect(matchRoute("/admin", ROUTE_PATTERNS)).toBe(true);
  });
});

describe("matchRoute — edge cases", () => {
  it("rejects empty string", () => {
    expect(matchRoute("", ROUTE_PATTERNS)).toBe(false);
  });

  it("handles paths with trailing slashes by not matching (Next.js canonical URLs have no trailing slash)", () => {
    // The route patterns don't include trailing slashes, so /about-us/ should
    // not match. This is intentional — Next.js canonical URLs omit trailing
    // slashes, and links should not include them.
    expect(matchRoute("/about-us/", ROUTE_PATTERNS)).toBe(false);
  });
});

describe("check-links negative fixture — broken link detection", () => {
  it("a known-bad route is rejected by matchRoute (would cause exit 1)", () => {
    // This is the negative fixture: if someone introduces a link to
    // /this-route-does-not-exist, the checker must flag it.
    expect(matchRoute("/this-route-does-not-exist", ROUTE_PATTERNS)).toBe(
      false,
    );
  });

  it("a known-bad asset path is not in the public files set", async () => {
    // Simulate what the main function does: check against public files.
    // A deliberately nonexistent asset should not be found.
    const { collectPublicFiles } = await import("../../scripts/check-links");
    const { join } = await import("node:path");
    const publicFiles = new Set(
      await collectPublicFiles(join(process.cwd(), "public")),
    );
    expect(publicFiles.has("/images/this-asset-does-not-exist.png")).toBe(false);
  });

  it("a real public asset is found in the public files set", async () => {
    const { collectPublicFiles } = await import("../../scripts/check-links");
    const { join } = await import("node:path");
    const publicFiles = new Set(
      await collectPublicFiles(join(process.cwd(), "public")),
    );
    // The OG image is a known static asset referenced in the codebase.
    expect(publicFiles.has("/brand/social/vantage-foundation-uganda-og.jpg")).toBe(
      true,
    );
  });
});

describe("matchRoute — finite dynamic slug validation", () => {
  it("accepts a known project slug", () => {
    expect(matchRoute("/projects/kasaale-deep-borehole", ROUTE_PATTERNS)).toBe(
      true,
    );
  });

  it("rejects an unknown project slug", () => {
    expect(matchRoute("/projects/not-a-project", ROUTE_PATTERNS)).toBe(false);
  });

  it("accepts a known localized project slug", () => {
    expect(
      matchRoute("/de/projects/kasaale-deep-borehole", ROUTE_PATTERNS),
    ).toBe(true);
  });

  it("rejects an unknown localized project slug", () => {
    expect(matchRoute("/de/projects/not-a-project", ROUTE_PATTERNS)).toBe(false);
  });

  it("accepts a known programme slug", () => {
    expect(matchRoute("/programmes/health", ROUTE_PATTERNS)).toBe(true);
  });

  it("rejects an unknown programme slug", () => {
    expect(matchRoute("/programmes/not-a-programme", ROUTE_PATTERNS)).toBe(
      false,
    );
  });

  it("accepts a known localized programme slug", () => {
    expect(matchRoute("/fr/programmes/health", ROUTE_PATTERNS)).toBe(true);
  });

  it("rejects an unknown localized programme slug", () => {
    expect(matchRoute("/fr/programmes/not-a-programme", ROUTE_PATTERNS)).toBe(
      false,
    );
  });

  it("accepts a known static story slug", () => {
    expect(
      matchRoute("/stories/what-are-we-without-our-dreams", ROUTE_PATTERNS),
    ).toBe(true);
  });

  it("rejects an unknown literal story slug", () => {
    expect(matchRoute("/stories/not-a-story", ROUTE_PATTERNS)).toBe(false);
  });

  it("accepts a known localized story slug", () => {
    expect(
      matchRoute(
        "/es/stories/what-are-we-without-our-dreams",
        ROUTE_PATTERNS,
      ),
    ).toBe(true);
  });

  it("rejects an unknown localized story slug", () => {
    expect(matchRoute("/es/stories/not-a-story", ROUTE_PATTERNS)).toBe(false);
  });

  it("accepts a known published team slug", () => {
    expect(
      matchRoute("/about-us/team/nassazi-kauthar-wangi", ROUTE_PATTERNS),
    ).toBe(true);
  });

  it("rejects an unknown team slug", () => {
    expect(
      matchRoute("/about-us/team/not-a-team-member", ROUTE_PATTERNS),
    ).toBe(false);
  });

  it("accepts a known localized team slug", () => {
    expect(
      matchRoute(
        "/ar/about-us/team/nassazi-kauthar-wangi",
        ROUTE_PATTERNS,
      ),
    ).toBe(true);
  });

  it("rejects an unknown localized team slug", () => {
    expect(
      matchRoute("/ar/about-us/team/not-a-team-member", ROUTE_PATTERNS),
    ).toBe(false);
  });
});

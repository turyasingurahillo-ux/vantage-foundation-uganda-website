import { test, expect } from "@playwright/test";

const canonicalOrigin = "https://www.vantagefoundationuganda.com";
const publicPages = [
  "/",
  "/about-us",
  "/about-us/team",
  "/accessibility",
  "/contact",
  "/donate",
  "/donors-and-sponsors",
  "/faq",
  "/gallery",
  "/get-involved",
  "/impact",
  "/our-work",
  "/projects",
  "/reports-and-accountability",
  "/safeguarding",
  "/stories",
  "/privacy",
  "/terms",
];

test.describe("SEO — page metadata", () => {
  test("every public page has unique, complete metadata and an exact canonical", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const titles = new Set<string>();
    const socialTitles = new Set<string>();

    for (const path of publicPages) {
      await page.goto(path);

      const title = await page.title();
      const description = await page
        .locator('meta[name="description"]')
        .getAttribute("content");
      const canonical = await page
        .locator('link[rel="canonical"]')
        .getAttribute("href");
      const ogTitle = await page
        .locator('meta[property="og:title"]')
        .getAttribute("content");
      const ogDescription = await page
        .locator('meta[property="og:description"]')
        .getAttribute("content");
      const ogImage = await page
        .locator('meta[property="og:image"]')
        .getAttribute("content");
      const twitterCard = await page
        .locator('meta[name="twitter:card"]')
        .getAttribute("content");
      const twitterTitle = await page
        .locator('meta[name="twitter:title"]')
        .getAttribute("content");

      expect(title, path).toContain("Vantage Foundation Uganda");
      expect(description?.length, path).toBeGreaterThan(50);
      const expectedCanonical =
        path === "/" ? canonicalOrigin : `${canonicalOrigin}${path}`;
      expect(canonical, path).toBe(expectedCanonical);
      expect(ogTitle, path).toBeTruthy();
      expect(ogDescription, path).toBe(description);
      expect(ogImage, path).toMatch(
        /^https:\/\/www\.vantagefoundationuganda\.com\//,
      );
      expect(twitterCard, path).toBe("summary_large_image");
      expect(twitterTitle, path).toBe(ogTitle);

      expect(titles.has(title), `${path} duplicates title ${title}`).toBe(false);
      expect(
        socialTitles.has(ogTitle!),
        `${path} duplicates social title ${ogTitle}`,
      ).toBe(false);
      titles.add(title);
      socialTitles.add(ogTitle!);
    }
  });

  test("dynamic project, story, programme and team routes are canonical", async ({
    page,
  }) => {
    const routes = [
      "/projects/kasaale-deep-borehole",
      "/stories/what-are-we-without-our-dreams",
      "/programmes/health",
      "/stories/the-meaning-of-advantage",
      "/about-us/team/nassazi-kauthar-wangi",
    ];

    for (const path of routes) {
      await page.goto(path);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `${canonicalOrigin}${path}`,
      );
      await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
      await expect(page.locator('meta[name="twitter:title"]')).toHaveCount(1);
    }
  });

  test("admin pages have noindex", async ({ page }) => {
    await page.goto("/admin/login");
    const metaRobots = await page
      .locator('meta[name="robots"]')
      .getAttribute("content");
    expect(metaRobots).toContain("noindex");
  });
});

test.describe("SEO — structured data", () => {
  test("homepage has Organization and WebSite JSON-LD with canonical identity", async ({
    page,
  }) => {
    await page.goto("/");
    const records = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    expect(records.length).toBeGreaterThanOrEqual(2);
    expect(
      records.some(
        (record) =>
          record.includes("Organization") &&
          record.includes("logo") &&
          record.includes(canonicalOrigin) &&
          record.includes("sameAs") &&
          record.includes("instagram"),
      ),
    ).toBe(true);
  });

  test("story page has Article JSON-LD", async ({ page }) => {
    await page.goto("/stories/what-are-we-without-our-dreams");
    const records = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    expect(records.some((record) => record.includes('"Article"'))).toBe(true);
  });

  test("FAQ page has FAQPage JSON-LD", async ({ page }) => {
    await page.goto("/faq");
    const records = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    expect(records.some((record) => record.includes("FAQPage"))).toBe(true);
  });
});

test.describe("SEO — discovery files and social image", () => {
  test("manifest and branded social image are accessible", async ({ request }) => {
    const manifest = await request.get("/manifest.webmanifest");
    const socialImage = await request.get(
      "/brand/social/vantage-foundation-uganda-og.jpg",
    );
    expect(manifest.status()).toBe(200);
    expect(socialImage.status()).toBe(200);
    expect(socialImage.headers()["content-type"]).toContain("image/jpeg");
  });

  test("sitemap contains only the exact canonical origin", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    const content = await response.text();
    expect(content).toContain(`<loc>${canonicalOrigin}/</loc>`);
    expect(content).toContain(
      `<loc>${canonicalOrigin}/programmes/health</loc>`,
    );
    expect(content).not.toContain("https://http/");
    expect(content).not.toContain("vantage-foundation-uganda-website.vercel.app");
  });

  test("robots identifies the canonical host and blocks private routes", async ({
    request,
  }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const content = await response.text();
    expect(content).toContain("Disallow: /admin/");
    expect(content).toContain(`Host: ${canonicalOrigin}`);
    expect(content).toContain(`Sitemap: ${canonicalOrigin}/sitemap.xml`);
  });
});

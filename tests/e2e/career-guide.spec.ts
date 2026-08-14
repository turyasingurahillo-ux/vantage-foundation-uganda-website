import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const path = "/stories/beyond-the-ward";

test("Beyond the Ward is a navigable career guide", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto(path);

  await expect(page.getByText("Vantage Career Guide", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Beyond the Ward" })).toBeVisible();
  await expect(page.getByText("Last verified: 14 August 2026")).toBeVisible();
  await expect(page.getByRole("heading", { name: "If you only have 2 minutes" })).toBeVisible();
  await expect(page.locator("#start-here li")).toHaveCount(7);
  await expect(page.getByRole("link", { name: /Start with my next 30 days/ })).toHaveAttribute(
    "href",
    "#1-your-next-30-days"
  );
  await expect(page.locator('a[href^="#a-research-career"]')).toBeVisible();
  await expect(page.locator('a[href^="#f-digital-health-and-data"]')).toBeVisible();
  await expect(page.getByText("The white coat", { exact: false }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "The Vantage Funding Check" })).toBeVisible();
  await expect(page.getByText("Funding: unconfirmed").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Career resilience is not workforce reform" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Verification and corrections" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Get verified Vantage career alerts" })).toBeVisible();

  await expect(page).toHaveTitle(
    "Careers for Medical Graduates in Uganda | Vantage Foundation Uganda"
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://www.vantagefoundationuganda.com/stories/beyond-the-ward"
  );
  const structuredData = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  const schemas = structuredData.map((value) => JSON.parse(value));
  const articleSchema = schemas.find((value) => value["@type"] === "Article");
  expect(articleSchema).toMatchObject({
    datePublished: "2026-08-14",
    dateModified: "2026-08-14",
    author: {
      "@type": "Organization",
      name: "Vantage Foundation Uganda Research Team",
    },
  });
  expect(schemas.some((value) => value["@type"] === "BreadcrumbList")).toBe(true);
  expect(schemas.some((value) => value["@type"] === "FAQPage")).toBe(false);

  const board = page.locator('[id="11-opportunity-board-14-august-2026"]');
  await expect(board.locator("article")).toHaveCount(28);
  await board.getByRole("button", { name: "Not for now" }).click();
  await expect(board.locator("article")).toHaveCount(9);

  expect(errors).toEqual([]);
});

test("mobile guide navigation, anchors and tables remain usable", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(path);

  const jump = page.getByRole("button", { name: /Jump to section/ });
  await expect(jump).toBeVisible();
  await jump.click();
  const mobileNav = page.getByRole("navigation", { name: "Career guide sections" });
  await expect(mobileNav).toBeVisible();
  await mobileNav.getByRole("link", { name: /Your next 30 days/ }).click();
  await expect(page).toHaveURL(/#1-your-next-30-days$/);
  await expect(page.locator('[id="1-your-next-30-days"]')).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth
  );
  expect(overflow).toBe(false);
  await expect(
    page.getByRole("region", { name: "Scrollable comparison table" }).first()
  ).toBeVisible();
});

test("guide remains overflow-free across mobile, tablet and desktop widths", async ({
  page,
}) => {
  for (const viewport of [
    { width: 430, height: 932 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(path, { waitUntil: "domcontentloaded" });
    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(dimensions.scrollWidth, `overflow at ${viewport.width}px`).toBeLessThanOrEqual(
      dimensions.clientWidth
    );
  }
});

test("guide has no automated WCAG A/AA violations", async ({ page }) => {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

  expect(
    results.violations,
    results.violations
      .map((violation) => `${violation.id} (${violation.nodes.length})`)
      .join(", ")
  ).toEqual([]);
});

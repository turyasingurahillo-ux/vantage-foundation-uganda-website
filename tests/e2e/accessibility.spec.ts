import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const publicRoutes = [
  "/",
  "/about-us",
  "/about-us/team",
  "/about-us/team/nassazi-kauthar-wangi",
  "/accessibility",
  "/stories/the-meaning-of-advantage",
  "/contact",
  "/donate",
  "/donors-and-sponsors",
  "/faq",
  "/gallery",
  "/get-involved",
  "/impact",
  "/our-work",
  "/programmes/health",
  "/programmes/education",
  "/programmes/humanitarian",
  "/programmes/water",
  "/projects",
  "/projects/kasaale-deep-borehole",
  "/reports-and-accountability",
  "/safeguarding",
  "/stories",
  "/stories/what-are-we-without-our-dreams",
  "/privacy",
  "/terms",
];

test.describe("Accessibility — document structure", () => {
  for (const path of publicRoutes) {
    test(`${path} has one visible h1 and a main landmark`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toBeVisible();
    });
  }
});

test.describe("Accessibility — keyboard navigation", () => {
  test("skip link is first, visible on focus, and moves focus to main", async ({
    page,
  }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", { name: /skip to .*content/i });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.locator("main")).toBeFocused();
  });

  test("mobile navigation opens, receives focus and closes with Escape", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const trigger = page.getByRole("button", { name: /open menu/i });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});

test.describe("Accessibility — axe-core automated checks", () => {
  const pages = [
    "/",
    "/about-us",
    "/contact",
    "/donate",
    "/faq",
    "/get-involved",
    "/impact",
    "/our-work",
    "/projects",
    "/reports-and-accountability",
    "/stories",
    "/stories/the-meaning-of-advantage",
    "/gallery",
    "/privacy",
    "/terms",
    "/safeguarding",
    "/accessibility",
  ];

  for (const path of pages) {
    test(`${path} has no axe-core violations`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      const results = await new AxeBuilder({ page })
        .withTags([
          "wcag2a",
          "wcag2aa",
          "wcag21a",
          "wcag21aa",
          "wcag22aa",
        ])
        .analyze();

      expect(
        results.violations,
        `${path}: ${results.violations
          .map((violation) => `${violation.id} (${violation.nodes.length})`)
          .join(", ")}`,
      ).toEqual([]);
    });
  }
});

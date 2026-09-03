import { expect, test } from "@playwright/test";

test.describe("public locale switching", () => {
  test("switches between English, German and French and persists the choice", async ({ page, context }) => {
    await context.clearCookies();
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    const desktopLanguage = page.locator("#language-desktop");
    await desktopLanguage.selectOption("de");
    await page.waitForURL(/\/de$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
    await expect(page.getByRole("heading", { name: /Chancen schaffen/i })).toBeVisible();

    // Deep unprefixed URLs are stable shareable links: the saved preference
    // only redirects at the site root, so /about-us should stay English.
    await page.goto("/about-us?from=locale-test");
    await expect(page).toHaveURL(/\/about-us\?from=locale-test$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await page.locator("#language-desktop").selectOption("fr");
    await page.waitForURL(/\/fr\/about-us/);
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(page.getByRole("heading", { name: "À propos de Vantage Foundation Uganda" })).toBeVisible();

    await page.locator("#language-desktop").selectOption("en");
    await page.waitForURL(/\/about-us/);
    await expect(page).not.toHaveURL(/\/(?:de|fr)\//);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("exposes the selector inside the mobile menu", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.locator("#language-mobile")).toBeVisible();
    await page.locator("#language-mobile").selectOption("fr");
    await page.waitForURL(/\/fr$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  });

  test("does not localize admin routes or loop on prefixed routes", async ({ page }) => {
    await page.goto("/de/contact");
    await expect(page).toHaveURL(/\/de\/contact$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
    await page.goto("/admin/login");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("renders representative public pages in every locale without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`${page.url()}: ${message.text()}`);
    });
    page.on("pageerror", (error) => errors.push(`${page.url()}: ${error.message}`));

    for (const locale of ["en", "de", "fr"] as const) {
      for (const route of ["/", "/about-us", "/contact", "/our-work"]) {
        const prefix = locale === "en" ? "" : `/${locale}`;
        await page.goto(`${prefix}${route === "/" ? "" : route}`);
        await expect(page.locator("html")).toHaveAttribute("lang", locale);
        await expect(page.locator("h1").first()).toBeVisible();
        await expect(page.locator("body")).not.toContainText("[object Object]");
      }
    }

    expect(errors).toEqual([]);
  });
});

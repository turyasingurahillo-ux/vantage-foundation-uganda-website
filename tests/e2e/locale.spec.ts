import { expect, test } from "@playwright/test";

const locales = ["en", "de", "fr", "es", "ar"] as const;

test.describe("public locale switching", () => {
  test("switches between all supported locales and persists the choice", async ({ page, context }) => {
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

    await page.locator("#language-desktop").selectOption("es");
    await page.waitForURL(/\/es\/about-us/);
    await expect(page.locator("html")).toHaveAttribute("lang", "es");

    await page.locator("#language-desktop").selectOption("ar");
    await page.waitForURL(/\/ar\/about-us/);
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveCSS("direction", "rtl");

    await page.locator("#language-desktop").selectOption("en");
    await page.waitForURL(/\/about-us/);
    await expect(page).not.toHaveURL(/\/(?:de|fr|es|ar)\//);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("html")).toHaveCSS("direction", "ltr");
  });

  test("exposes the selector inside the mobile menu", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.locator("#language-mobile")).toBeVisible();
    await page.locator("#language-mobile").selectOption("fr");
    await page.waitForURL(/\/fr$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");

    await page.goto("/de/projects/kasaale-deep-borehole");
    await page.getByRole("button", { name: "Menü öffnen" }).click();
    await page.locator("#language-mobile").selectOption("es");
    await page.waitForURL(/\/es\/projects\/kasaale-deep-borehole/);
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
  });

  test("does not localize admin or API routes", async ({ page }) => {
    await page.goto("/de/contact");
    await expect(page).toHaveURL(/\/de\/contact$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
    await page.goto("/es/admin");
    await expect(page).toHaveURL(/\/es\/admin$/);
    // The (public)/[locale] tree has no admin page, so this is a 404.
    await expect(page.locator("h1").first()).toBeVisible();
    await page.goto("/ar/api/contact");
    await expect(page).toHaveURL(/\/ar\/api\/contact$/);
    await page.goto("/admin/login");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("renders representative public pages in every locale without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`${page.url()}: ${message.text()}`);
    });
    page.on("pageerror", (error) => errors.push(`${page.url()}: ${error.message}`));

    for (const locale of locales) {
      for (const route of ["/", "/about-us", "/contact", "/our-work"]) {
        const prefix = locale === "en" ? "" : `/${locale}`;
        await page.goto(`${prefix}${route === "/" ? "" : route}`);
        await expect(page.locator("html")).toHaveAttribute("lang", locale);
        await expect(page.locator("html")).toHaveCSS("direction", locale === "ar" ? "rtl" : "ltr");
        await expect(page.locator("h1").first()).toBeVisible();
        await expect(page.locator("body")).not.toContainText("[object Object]");
      }
    }

    expect(errors).toEqual([]);
  });

  test("language selector lists all five language names", async ({ page }) => {
    await page.goto("/");
    const options = await page.locator("#language-desktop option").allTextContents();
    expect(options).toEqual(["English", "Deutsch", "Français", "Español", "العربية"]);
  });

  test("explicit URL beats conflicting locale cookie", async ({ page, context }) => {
    await context.addCookies([
      { name: "vantage_locale", value: "fr", domain: "localhost", path: "/" },
    ]);
    await page.goto("/ar/about-us");
    await expect(page).toHaveURL(/\/ar\/about-us/);
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  });
});

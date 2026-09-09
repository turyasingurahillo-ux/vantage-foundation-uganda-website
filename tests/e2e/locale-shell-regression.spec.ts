import { expect, test } from "@playwright/test";

const projectSlug = "kasaale-deep-borehole";

test.describe("locale shell regression", () => {
  test("English to German remounts the locale-owned shell", async ({ page }) => {
    await page.goto("/");
    await Promise.all([
      page.waitForURL("/de"),
      page.locator("#language-desktop").selectOption("de"),
    ]);
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.locator("header")).toContainText("Über uns");
    await expect(page.locator("footer")).toContainText("Büro Jinja");
    await expect(page.locator("#language-desktop")).toHaveValue("de");
    await expect(page.locator("#language-desktop")).toBeEnabled();
  });

  test("English to French remounts the locale-owned shell", async ({ page }) => {
    await page.goto("/");
    await Promise.all([
      page.waitForURL("/fr"),
      page.locator("#language-desktop").selectOption("fr"),
    ]);
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(page.locator("header")).toContainText("À propos");
    await expect(page.locator("footer")).toContainText("Bureau de Jinja");
    await expect(page.locator("#language-desktop")).toHaveValue("fr");
    await expect(page.locator("#language-desktop")).toBeEnabled();
  });

  test("English to Spanish remounts the locale-owned shell", async ({ page }) => {
    await page.goto("/");
    await Promise.all([
      page.waitForURL("/es"),
      page.locator("#language-desktop").selectOption("es"),
    ]);
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await expect(page.locator("header")).toContainText("Sobre nosotros");
    await expect(page.locator("footer")).toContainText("Oficina de Jinja");
    await expect(page.locator("#language-desktop")).toHaveValue("es");
    await expect(page.locator("#language-desktop")).toBeEnabled();
  });

  test("English to Arabic remounts the locale-owned shell with RTL", async ({ page }) => {
    await page.goto("/");
    await Promise.all([
      page.waitForURL("/ar"),
      page.locator("#language-desktop").selectOption("ar"),
    ]);
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveCSS("direction", "rtl");
    await expect(page.locator("header")).toContainText("نبذة عنا");
    await expect(page.locator("footer")).toContainText("مكتب جينجا");
    await expect(page.locator("#language-desktop")).toHaveValue("ar");
    await expect(page.locator("#language-desktop")).toBeEnabled();
  });

  test("Back to English removes locale prefix and restores LTR", async ({ page }) => {
    await page.goto("/de/about-us");
    await Promise.all([
      page.waitForURL("/about-us"),
      page.locator("#language-desktop").selectOption("en"),
    ]);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.locator("header")).toContainText("About");
    await expect(page.locator("#language-desktop")).toHaveValue("en");
    await expect(page.locator("#language-desktop")).toBeEnabled();
  });

  test("Preserves path, query and hash when switching locale on a project detail page", async ({ page }) => {
    await page.goto(`/projects/${projectSlug}?source=test#section`);
    await Promise.all([
      page.waitForURL(
        (url) =>
          url.pathname === `/fr/projects/${projectSlug}` &&
          url.search === "?source=test" &&
          url.hash === "#section",
      ),
      page.locator("#language-desktop").selectOption("fr"),
    ]);
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(page.locator("header")).toContainText("À propos");
  });

  test("Locale preference request is made exactly once", async ({ page }) => {
    let count = 0;
    await page.route("/api/locale", async (route, request) => {
      if (request.method() === "POST") count += 1;
      await route.continue();
    });
    await page.goto("/");
    await Promise.all([
      page.waitForURL("/de"),
      page.locator("#language-desktop").selectOption("de"),
    ]);
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
    expect(count).toBe(1);
  });

  test("Failed locale preference request does not navigate and re-enables the selector", async ({ page }) => {
    await page.route("/api/locale", (route) =>
      route.fulfill({ status: 500, contentType: "application/json", body: "{}" }),
    );
    await page.goto("/");
    await page.locator("#language-desktop").selectOption("de");
    await expect(page.locator("#language-desktop")).toBeEnabled();
    await expect(page).toHaveURL("/");
    await expect(page.locator("#language-desktop")).toHaveValue("en");
  });
});

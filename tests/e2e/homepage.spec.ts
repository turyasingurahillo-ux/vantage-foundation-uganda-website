import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads and shows hero heading", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Vantage Foundation Uganda/);
    // The hero section should have an h1.
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();
  });

  test("skip link is present and focusable", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.getByRole("link", { name: /skip to (main )?content/i });
    await expect(skipLink).toBeAttached();
  });

  test("navigation links work", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /^Programmes$/i }).click();
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Vantage Care" })
      .click();
    await expect(page).toHaveURL(/\/programmes\/health/);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("logo is visible in header", async ({ page }) => {
    await page.goto("/");
    const headerLogo = page.locator("header img");
    await expect(headerLogo).toBeVisible();
    const src = await headerLogo.getAttribute("src");
    expect(src).toContain("vantage-logo-horizontal");
    expect(src).not.toContain("/_next/image");
    const box = await headerLogo.boundingBox();
    expect(box?.width).toBeGreaterThan(100);
    expect(box?.height).toBeGreaterThan(30);
  });

  test("logo is visible in footer", async ({ page }) => {
    await page.goto("/");
    const footerLogo = page.locator("footer img");
    await expect(footerLogo).toBeVisible();
    const src = await footerLogo.getAttribute("src");
    expect(src).toContain("vantage-logo-horizontal");
    const box = await footerLogo.boundingBox();
    expect(box?.width).toBeGreaterThan(100);
    expect(box?.height).toBeGreaterThan(30);
  });

  test("homepage sections appear in correct order", async ({ page }) => {
    await page.goto("/");
    // Verify key section headings appear in the expected order.
    const heroH1 = page.locator("h1").first();
    await expect(heroH1).toContainText("Changing the world");

    // Trust strip items
    await expect(page.getByText("Youth-led since")).toBeVisible();
    await expect(page.getByText("100% volunteer-run")).toBeVisible();

    // Impact section
    await expect(
      page.locator("main").getByRole("heading", { name: /evidence with context/i })
    ).toBeVisible();

    // Programmes section
    await expect(
      page.locator("main").getByRole("heading", { name: /four connected programmes/i })
    ).toBeVisible();

    // Final CTA
    await expect(page.getByRole("heading", { name: /help us create one more advantage/i })).toBeVisible();
  });

  test("no placeholder text is visible", async ({ page }) => {
    await page.goto("/");
    const body = page.locator("body");
    await expect(body).not.toContainText("Image coming soon");
    await expect(body).not.toContainText("Video coming soon");
    await expect(body).not.toContainText("Our first posts are on the way");
    await expect(body).not.toContainText("[Number]");
    await expect(body).not.toContainText("[Partner name to be added]");
  });

  test("Donate button is prominent in header", async ({ page }) => {
    await page.goto("/");
    const donateButton = page.locator("header").getByRole("link", { name: /donate/i });
    await expect(donateButton).toBeVisible();
  });

  test("header is sticky", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header");
    await expect(header).toHaveClass(/sticky/);
  });

  test("Instagram section is visible", async ({ page }) => {
    await page.goto("/");
    const igSection = page.getByRole("heading", { name: /Popular on Instagram/i });
    await expect(igSection).toBeVisible();
  });

  test("Instagram follow button is present", async ({ page }) => {
    await page.goto("/");
    const followLink = page.getByRole("link", { name: /@vantagefoundationuganda/i });
    await expect(followLink).toBeVisible();
    const href = await followLink.getAttribute("href");
    expect(href).toContain("instagram.com");
  });
});

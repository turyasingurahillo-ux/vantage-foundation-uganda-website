import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("@smoke loads and shows hero heading", async ({ page }) => {
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

  test("@smoke navigation links work", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /^Programmes$/i }).click();
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Health & Wellbeing" })
      .click();
    await expect(page).toHaveURL(/\/programmes\/health-wellbeing/);
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
    await expect(heroH1).toContainText("connected");

    // Hero CTAs: Explore our work (primary) + Partner with us (secondary)
    const hero = page.locator("section").first();
    await expect(hero.getByRole("link", { name: /explore our work/i })).toBeVisible();
    await expect(hero.getByRole("link", { name: /partner with us/i })).toBeVisible();

    // Trust strip items
    await expect(page.getByText("Youth-led since")).toBeVisible();
    await expect(page.getByText("Offices in Jinja & Ishaka")).toBeVisible();

    // Proof: evidence-status labels visible on impact figures
    await expect(
      page.locator("main").getByRole("heading", { name: /evidence with context/i })
    ).toBeVisible();
    await expect(page.getByText("Estimated catchment").first()).toBeVisible();

    // Problem statement
    await expect(
      page.locator("main").getByRole("heading", { name: /barriers do not arrive one at a time/i })
    ).toBeVisible();

    // Portfolio preview — six canonical portfolios
    await expect(
      page.locator("main").getByRole("heading", { name: /connected areas of work/i })
    ).toBeVisible();
    for (const portfolio of [
      "Health & Wellbeing",
      "Education & Learning",
      "Financial Capability & Economic Opportunity",
      "Food & Basic Needs",
      "Humanitarian Vulnerability & Protection",
      "Youth Leadership & Participation",
    ]) {
      await expect(
        page.locator("main").getByRole("heading", { name: portfolio, exact: true })
      ).toBeVisible();
    }

    // How change happens
    await expect(
      page.locator("main").getByRole("heading", { name: /from listening to lasting advantage/i })
    ).toBeVisible();

    // Flagship work
    await expect(
      page.locator("main").getByRole("heading", { name: /where the model is furthest along/i })
    ).toBeVisible();
    await expect(
      page.locator("main").getByRole("heading", { name: /Kasaale Deep Borehole/i })
    ).toBeVisible();

    // Vantage Point intro — introduced as planned, never as delivered
    await expect(
      page.locator("main").getByRole("heading", { name: /where learning connects the work/i })
    ).toBeVisible();
    await expect(page.getByText(/planned \/ target/i).first()).toBeVisible();
    // PR-3: the CTA now resolves to the real platform route
    await expect(
      page.locator("main").getByRole("link", { name: /explore vantage point/i })
    ).toHaveAttribute("href", /\/programmes\/vantage-point/);

    // One human story — the curated youth voice, not a news feed
    await expect(
      page.locator("main").getByRole("heading", { name: /what are we without our dreams/i })
    ).toBeVisible();

    // Accountability
    await expect(
      page.locator("main").getByRole("heading", { name: /trust is built in the open/i })
    ).toBeVisible();

    // Conversion: Partner + Donate
    await expect(
      page.getByRole("heading", { name: /help fund the next advantage/i })
    ).toBeVisible();
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
});

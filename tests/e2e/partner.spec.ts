import { test, expect } from "@playwright/test";

test.describe("Partner hub (PR-5)", () => {
  test("@smoke /partner renders the institutional partnership architecture", async ({
    page,
  }) => {
    await page.goto("/partner");
    await expect(page.locator("h1")).toHaveText("Partner with Vantage");

    // Exactly six partnership mechanisms — not programmes, not tiers
    const mechanisms = page
      .locator("#mechanisms")
      .getByRole("heading", { level: 3 });
    await expect(mechanisms).toHaveCount(6);
    await expect(mechanisms.nth(0)).toHaveText(/fund a programme/i);
    await expect(mechanisms.nth(1)).toHaveText(/fund evidence & learning/i);
    await expect(mechanisms.nth(2)).toHaveText(/technology & equipment/i);
    await expect(mechanisms.nth(3)).toHaveText(/research collaboration/i);
    await expect(mechanisms.nth(4)).toHaveText(/pro bono expertise/i);
    await expect(mechanisms.nth(5)).toHaveText(
      /referral & ecosystem partnership/i,
    );

    // The six portfolios come from canonical programme data
    await expect(
      page.getByRole("heading", {
        name: /what a partnership could connect to/i,
      }),
    ).toBeVisible();
    const portfolioLinks = page.locator(
      "main a[href*='/programmes/']:not([href*='vantage-point'])",
    );
    await expect(
      portfolioLinks.filter({ hasText: /Health & Wellbeing/i }).first(),
    ).toHaveAttribute("href", /\/programmes\/health-wellbeing/);

    // Vantage Point is a platform, not a seventh portfolio — still planned
    await expect(
      page.getByRole("link", { name: /about vantage point/i }),
    ).toHaveAttribute("href", /\/programmes\/vantage-point/);

    // Accountability layer precedes the form
    await expect(
      page.getByRole("heading", { name: /how we approach partnership/i }),
    ).toBeVisible();
    await expect(
      page.locator("main").getByRole("link", { name: /safeguarding/i }).first(),
    ).toHaveAttribute("href", /\/safeguarding/);

    // The tailored form exists with required mechanism select
    const form = page.locator("#enquiry form");
    await expect(form).toBeVisible();
    await expect(form.locator("select[name='partnership_type']")).toBeVisible();
    await expect(
      form.locator("select[name='partnership_type'] option"),
    ).toHaveCount(7); // placeholder + six mechanisms
    await expect(form.locator("select[name='programme'] option")).toHaveCount(
      7,
    ); // placeholder + six portfolios

    // Donate stays a separate path
    await expect(
      page.locator("main a[href*='/donate']").first(),
    ).toBeVisible();
  });

  test("@smoke ?type=research deep-links the mechanism into the form", async ({
    page,
  }) => {
    await page.goto("/partner?type=research");
    await expect(
      page.locator("#enquiry select[name='partnership_type']"),
    ).toHaveValue("research");
    // Message label is tailored to the research prompt
    await expect(
      page.getByText(/tell us briefly about the research or learning question/i),
    ).toBeVisible();
  });

  test("an invalid ?type= is ignored safely", async ({ page }) => {
    await page.goto("/partner?type=gold-partner");
    await expect(
      page.locator("#enquiry select[name='partnership_type']"),
    ).toHaveValue("");
  });

  test("mechanism cards deep-link to the tailored form", async ({ page }) => {
    await page.goto("/partner");
    const discussLinks = page.locator("#mechanisms a[href*='#enquiry']");
    await expect(discussLinks).toHaveCount(6);
    await expect(discussLinks.nth(0)).toHaveAttribute(
      "href",
      /type=programme-funding#enquiry/,
    );
    await discussLinks.nth(3).click();
    await expect(
      page.locator("#enquiry select[name='partnership_type']"),
    ).toHaveValue("research");
  });

  test("no fake partnership packages or funding tiers exist", async ({
    page,
  }) => {
    await page.goto("/partner");
    const body = await page.locator("main").innerText();
    expect(body).not.toMatch(/gold partner|silver partner|\$\d|tier 1|tier 2/i);
    expect(body).not.toMatch(/sponsor a village|corporate champion/i);
  });

  test("institutional CTAs now route to /partner", async ({ page }) => {
    // Homepage hero + final CTA
    await page.goto("/");
    const partnerLinks = page.locator("main a[href='/partner']");
    await expect(partnerLinks.first()).toBeVisible();
    // No institutional CTA still points at the old anchor
    await expect(
      page.locator("main a[href*='/get-involved#partner']"),
    ).toHaveCount(0);

    // A programme page CTA
    await page.goto("/programmes/health-wellbeing");
    await expect(
      page.locator("main a[href='/partner']").first(),
    ).toBeVisible();
  });

  test("/partner renders in translated locales and Arabic RTL", async ({
    page,
  }) => {
    await page.goto("/de/partner");
    await expect(page.locator("h1")).toHaveText("Partner werden");
    await expect(
      page
        .locator("#enquiry select[name='partnership_type'] option")
        .nth(1),
    ).toContainText(/programm finanzieren/i);

    await page.goto("/ar/partner");
    await expect(page.locator("h1")).toHaveText("شاركوا Vantage");
    const dims = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(dims.scrollWidth).toBeLessThanOrEqual(dims.clientWidth);
  });

  test("the form is comfortable at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto("/partner?type=pro-bono");
    await expect(
      page.locator("#enquiry select[name='partnership_type']"),
    ).toHaveValue("pro-bono");
    const dims = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(dims.scrollWidth).toBeLessThanOrEqual(dims.clientWidth);
  });
});

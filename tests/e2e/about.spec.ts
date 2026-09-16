import { test, expect } from "@playwright/test";

test.describe("About institutional narrative (PR-7)", () => {
  test("@smoke /about-us renders the full institutional profile", async ({
    page,
  }) => {
    await page.goto("/about-us");
    await expect(page.locator("h1")).toHaveText(
      "About Vantage Foundation Uganda",
    );
    await expect(
      page.getByText("Youth-led. Community-rooted. Evidence-driven."),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Why Vantage exists" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Our story", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "What our identity means" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "How Vantage works" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Six connected portfolios" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Where we work" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /meet the team/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /governance and accountability/i }),
    ).toBeVisible();
  });

  test("timeline only carries documented milestones", async ({ page }) => {
    await page.goto("/about-us");
    await expect(page.getByText("December 2020").first()).toBeVisible();
    await expect(page.getByText("SaveGirl Uganda").first()).toBeVisible();
    await expect(page.getByText("Kasaale Deep Borehole").first()).toBeVisible();
    // No fabricated milestone years
    const body = await page.locator("main").innerText();
    expect(body).not.toMatch(/\b201[0-9]\b/);
  });

  test("six canonical portfolios render; Vantage Point is separate + planned", async ({
    page,
  }) => {
    await page.goto("/about-us");
    for (const title of [
      "Health & Wellbeing",
      "Education & Learning",
      "Financial Capability & Economic Opportunity",
      "Food & Basic Needs",
      "Humanitarian Vulnerability & Protection",
      "Youth Leadership & Participation",
    ]) {
      await expect(
        page.locator("main").getByRole("link", { name: title, exact: true }),
      ).toBeVisible();
    }
    // Vantage Point is not a seventh portfolio card
    const vp = page.getByRole("heading", { name: "Vantage Point", exact: true });
    await expect(vp).toBeVisible();
    await expect(page.getByText("Planned", { exact: true })).toBeVisible();
  });

  test("identity section explains rather than repeats the tagline", async ({
    page,
  }) => {
    await page.goto("/about-us");
    // Evidence-driven framed as discipline, not claimed mature evidence
    await expect(
      page.getByText(/not a claim that every programme/i),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /how we measure and report/i }),
    ).toHaveAttribute("href", /\/impact/);
  });

  test("cross-links resolve to canonical routes", async ({ page }) => {
    await page.goto("/about-us");
    await expect(
      page.getByRole("link", { name: /theory of change/i }).first(),
    ).toHaveAttribute("href", /\/theory-of-change/);
    await expect(
      page.getByRole("link", { name: /explore where we work/i }),
    ).toHaveAttribute("href", /\/where-we-work/);
    await expect(
      page.getByRole("link", { name: /partner with us/i }),
    ).toHaveAttribute("href", /\/partner/);
  });

  test("#governance deep link and translated locales render", async ({
    page,
  }) => {
    await page.goto("/about-us#governance");
    await expect(page.locator("#governance")).toBeAttached();

    await page.goto("/de/about-us");
    await expect(
      page.getByRole("heading", { name: "Warum es Vantage gibt" }),
    ).toBeVisible();

    await page.goto("/ar/about-us");
    await expect(
      page.getByText("بقيادة الشباب. متجذرة في المجتمعات. مستندة إلى الأدلة."),
    ).toBeVisible();
    const dims = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(dims.scrollWidth).toBeLessThanOrEqual(dims.clientWidth);
  });
});

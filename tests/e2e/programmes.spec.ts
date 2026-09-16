import { test, expect } from "@playwright/test";

const PORTFOLIOS = [
  { slug: "health-wellbeing", title: "Health & Wellbeing" },
  { slug: "education-learning", title: "Education & Learning" },
  {
    slug: "financial-capability-economic-opportunity",
    title: "Financial Capability & Economic Opportunity",
  },
  { slug: "food-basic-needs", title: "Food & Basic Needs" },
  {
    slug: "humanitarian-vulnerability-protection",
    title: "Humanitarian Vulnerability & Protection",
  },
  {
    slug: "youth-leadership-participation",
    title: "Youth Leadership & Participation",
  },
];

test.describe("Programme architecture (PR-3)", () => {
  test("@smoke all six portfolio routes render the editorial template", async ({
    page,
  }) => {
    for (const { slug, title } of PORTFOLIOS) {
      await page.goto(`/programmes/${slug}`);
      await expect(page.locator("h1")).toHaveText(title);
      // 02 — Why this matters
      await expect(
        page.getByRole("heading", { name: /why this matters/i }),
      ).toBeVisible();
      // 03 — Our approach
      await expect(
        page.getByRole("heading", { name: /our approach/i }),
      ).toBeVisible();
      // 05 — Results & evidence (cards or honest empty state, never fabricated)
      await expect(
        page.getByRole("heading", { name: /results & evidence/i }),
      ).toBeVisible();
    }
  });

  test("project status is visible on portfolio project cards", async ({
    page,
  }) => {
    await page.goto("/programmes/health-wellbeing");
    // SaveGirl Uganda (Active) belongs to health-wellbeing
    const card = page.locator("a", { hasText: /SaveGirl Uganda/i }).first();
    await expect(card).toBeVisible();
    await expect(
      page.getByText(/^Active$/).or(page.getByText(/^Completed$/)).first(),
    ).toBeVisible();
  });

  test("evidence-status labels appear on published results", async ({
    page,
  }) => {
    await page.goto("/programmes/food-basic-needs");
    await expect(page.getByText(/estimated catchment/i).first()).toBeVisible();
    // Kasaale result is an estimate, not a beneficiary count
    await expect(page.getByText(/not a beneficiary count/i)).toBeVisible();
  });

  test("developing portfolios show honest empty evidence state", async ({
    page,
  }) => {
    await page.goto("/programmes/youth-leadership-participation");
    await expect(page.getByText(/developing/i).first()).toBeVisible();
    await expect(
      page.getByText(/no programme-level results are published yet/i),
    ).toBeVisible();
  });

  test("@smoke Vantage Point renders as a platform, not a portfolio", async ({
    page,
  }) => {
    await page.goto("/programmes/vantage-point");
    await expect(page.locator("h1")).toHaveText("Vantage Point");
    await expect(
      page.getByText(/cross-programme platform/i).first(),
    ).toBeVisible();
    // Planned status — no fabricated results section
    await expect(page.getByText(/planned/i).first()).toBeVisible();
    // Links to the six portfolios
    for (const { title } of PORTFOLIOS) {
      await expect(
        page.locator("main").getByRole("link", { name: title }),
      ).toBeVisible();
    }
  });

  test("@smoke /our-work shows six portfolios plus a separate Vantage Point", async ({
    page,
  }) => {
    await page.goto("/our-work");
    for (const { title } of PORTFOLIOS) {
      await expect(
        page.locator("main").getByRole("heading", { name: title, exact: true }),
      ).toBeVisible();
    }
    // Vantage Point is a platform feature, not a seventh card
    await expect(
      page.getByText(/cross-programme platform/i).first(),
    ).toBeVisible();
  });

  test("legacy programme URLs redirect to the new slugs", async ({ page }) => {
    await page.goto("/programmes/water");
    await expect(page).toHaveURL(/\/programmes\/food-basic-needs/);
    await page.goto("/programmes/education");
    await expect(page).toHaveURL(
      /\/programmes\/financial-capability-economic-opportunity/,
    );
    await page.goto("/programmes/health");
    await expect(page).toHaveURL(/\/programmes\/health-wellbeing/);
    await page.goto("/programmes/humanitarian");
    await expect(page).toHaveURL(
      /\/programmes\/humanitarian-vulnerability-protection/,
    );
    await page.goto("/programmes/youth-leadership");
    await expect(page).toHaveURL(
      /\/programmes\/youth-leadership-participation/,
    );
  });

  test("programme pages render in translated locales", async ({ page }) => {
    await page.goto("/de/programmes/health-wellbeing");
    await expect(page.locator("h1")).toHaveText("Health & Wellbeing");
    await page.goto("/ar/programmes/vantage-point");
    await expect(page.locator("h1")).toHaveText("Vantage Point");
  });
});

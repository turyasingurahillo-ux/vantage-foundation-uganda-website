import { test, expect } from "@playwright/test";

test.describe("Impact & Learning hub (PR-4)", () => {
  test("@smoke /impact renders the institutional evidence architecture", async ({
    page,
  }) => {
    await page.goto("/impact");
    await expect(page.locator("h1")).toHaveText("Impact & Learning");

    // Measurement framework — five distinct concepts
    await expect(
      page.getByRole("heading", { name: /how Vantage thinks about impact/i }),
    ).toBeVisible();
    await expect(
      page.locator("main").getByText("Outputs", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText(/not a count of unique people/i)).toBeVisible();

    // How to read our evidence — all six statuses explained
    await expect(
      page.getByRole("heading", { name: /how to read our evidence/i }),
    ).toBeVisible();
    await expect(
      page.getByText(/not independently audited/i).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/not an achieved result/i),
    ).toBeVisible();

    // ToC feature links to the real page
    await expect(
      page.getByRole("link", { name: /read the theory of change/i }),
    ).toHaveAttribute("href", /\/theory-of-change/);

    // Programme learning is attributed to its portfolio
    await expect(
      page.getByRole("heading", { name: /what Vantage is learning/i }),
    ).toBeVisible();
    await expect(
      page.getByText(/From Health & Wellbeing/i).first(),
    ).toBeVisible();

    // Evidence library — honest empty state, no fabricated publications
    await expect(
      page.getByRole("heading", { name: /evidence library/i }),
    ).toBeVisible();
    await expect(
      page.getByText(/no approved evidence publications yet/i),
    ).toBeVisible();

    // Reports & policies surface the canonical destinations
    await expect(
      page.getByRole("link", { name: /see reports & accountability/i }),
    ).toHaveAttribute("href", /\/reports-and-accountability/);
    await expect(
      page.locator("main").getByRole("link", { name: /safeguarding/i }),
    ).toHaveAttribute("href", /\/safeguarding/);

    // Vantage Point stays planned — not inflated
    await expect(
      page.getByRole("link", { name: /about vantage point/i }),
    ).toHaveAttribute("href", /\/programmes\/vantage-point/);
  });

  test("@smoke /theory-of-change renders the four-layer causal flow", async ({
    page,
  }) => {
    await page.goto("/theory-of-change");
    await expect(page.locator("h1")).toHaveText("Theory of Change");

    const flow = page.locator("ol").filter({
      has: page.getByRole("heading", { name: /context & problems/i }),
    });
    const layers = flow.getByRole("heading", { level: 3 });
    await expect(layers).toHaveCount(4);
    await expect(layers.nth(0)).toHaveText(/context & problems/i);
    await expect(layers.nth(1)).toHaveText(/what Vantage does/i);
    await expect(layers.nth(2)).toHaveText(/intermediate outcomes/i);
    await expect(layers.nth(3)).toHaveText(/longer-term outcomes/i);

    // Assumptions are exposed, not disguised as evidence
    await expect(
      page.getByRole("heading", { name: /assumptions we depend on/i }),
    ).toBeVisible();

    // External actors distinguish partner from ecosystem
    await expect(
      page.getByRole("heading", { name: /external actors we depend on/i }),
    ).toBeVisible();
    await expect(
      page.getByText("The wider ecosystem").first(),
    ).toBeVisible();

    // Measurement + learning loop + limitations
    await expect(
      page.getByRole("heading", { name: /how we measure/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /how learning feeds back/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /where our evidence is limited/i }),
    ).toBeVisible();

    // Links resolve
    await expect(
      page.getByRole("link", { name: /explore the six portfolios/i }),
    ).toHaveAttribute("href", /\/our-work/);
  });

  test("ToC causal order survives a 320px viewport", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto("/theory-of-change");
    const layers = page
      .locator("ol")
      .filter({
        has: page.getByRole("heading", { name: /context & problems/i }),
      })
      .getByRole("heading", { level: 3 });
    await expect(layers.nth(0)).toHaveText(/context/i);
    await expect(layers.nth(3)).toHaveText(/longer-term/i);
    const dims = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(dims.scrollWidth).toBeLessThanOrEqual(dims.clientWidth);
  });

  test("homepage ToC teaser links to /theory-of-change", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.locator("main a[href*='/theory-of-change']").first(),
    ).toBeVisible();
  });

  test("Impact & Learning + ToC render in translated locales", async ({
    page,
  }) => {
    await page.goto("/de/impact");
    await expect(page.locator("h1")).toHaveText("Wirkung & Lernen");
    await expect(
      page.getByRole("heading", { name: /wie man unsere evidenz liest/i }),
    ).toBeVisible();

    await page.goto("/ar/theory-of-change");
    await expect(page.locator("h1")).toHaveText("نظرية التغيير");
    await expect(
      page.getByRole("heading", { name: /افتراضات نعتمد عليها/ }),
    ).toBeVisible();
  });
});

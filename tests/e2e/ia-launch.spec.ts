import { test, expect } from "@playwright/test";

test.describe("Final IA (PR-6)", () => {
  test("@smoke top-level nav is the blueprint hierarchy", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: /main navigation/i });
    // Dropdown parents are buttons; leaf items are links.
    for (const label of ["About", "Programmes", "Impact", "Stories"]) {
      await expect(
        nav.getByRole("button", { name: new RegExp(label, "i") }).first(),
      ).toBeVisible();
    }
    await expect(
      nav.getByRole("link", { name: "Partner" }).first(),
    ).toBeVisible();
    await expect(
      nav.getByRole("link", { name: "Donate" }).first(),
    ).toBeVisible();
    // Get Involved is no longer a top-level destination
    await expect(
      nav.getByRole("button", { name: /get involved/i }),
    ).toHaveCount(0);
    await expect(
      nav.getByRole("link", { name: /get involved/i }),
    ).toHaveCount(0);
  });

  test("About dropdown carries the blueprint children", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: /main navigation/i });
    await nav.getByRole("button", { name: "About" }).click();
    await expect(
      nav.getByRole("link", { name: "Our Story" }),
    ).toBeVisible();
    await expect(
      nav.getByRole("link", { name: "Leadership" }),
    ).toBeVisible();
    await expect(
      nav.getByRole("link", { name: "Where We Work" }),
    ).toHaveAttribute("href", /\/where-we-work/);
  });

  test("@smoke /stories taxonomy filters are URL-addressable", async ({
    page,
  }) => {
    await page.goto("/stories?category=research");
    await expect(
      page.getByRole("link", { name: "Research", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    // Research stories render; a field story does not appear in the grid
    await expect(
      page.getByRole("link", { name: /Why Youth Spaces Matter/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /What are we without our dreams/i }),
    ).toHaveCount(0);

    // Category labels are taxonomy ids translated, not raw enum text
    await expect(
      page.getByRole("link", { name: "Field Stories" }),
    ).toBeVisible();
  });

  test("field-story filter shows field narratives, not news", async ({
    page,
  }) => {
    await page.goto("/stories?category=field-story");
    await expect(
      page.getByRole("link", { name: /pads to mentorship/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /International Women.*Day/i }),
    ).toHaveCount(0);
  });

  test("@smoke /where-we-work is the canonical geography page", async ({
    page,
  }) => {
    await page.goto("/where-we-work");
    await expect(page.locator("h1")).toHaveText("Where We Work");
    await expect(
      page.getByTestId("uganda-reach-map-section"),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Kampala on the map/i }),
    ).toBeVisible();
    // Documented districts only — no unverified additions
    const body = await page.locator("main").innerText();
    expect(body).not.toMatch(/Napak|Mbarara/);
    // Honest framing — a district is not an office
    await expect(
      page.getByText(/district is not an office/i),
    ).toBeVisible();
  });

  test("/impact#where-we-work remains a working teaser anchor", async ({
    page,
  }) => {
    await page.goto("/impact#where-we-work");
    await expect(
      page.getByRole("link", { name: /see where we work/i }),
    ).toHaveAttribute("href", /\/where-we-work/);
  });

  test("/get-involved legacy anchors bridge to /partner", async ({
    page,
  }) => {
    await page.goto("/get-involved#sponsor");
    await expect(
      page.getByText(/sponsorship, CSR or institutional collaboration/i),
    ).toBeVisible();
    await expect(
      page
        .locator("main")
        .getByRole("link", { name: /partner with us/i })
        .first(),
    ).toHaveAttribute("href", /\/partner/);
    // Only three real pathways remain
    await expect(page.getByRole("heading", { name: "Donate" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Volunteer" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Partner" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /corporate social responsibility/i }),
    ).toHaveCount(0);
  });

  test("footer carries Partner, Donate, Stories, Contact", async ({
    page,
  }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(
      footer.getByRole("link", { name: "Partner" }),
    ).toHaveAttribute("href", /\/partner/);
    await expect(
      footer.getByRole("link", { name: /stories/i }),
    ).toHaveAttribute("href", /\/stories/);
  });

  test("nav + where-we-work render in de and ar (RTL, no overflow)", async ({
    page,
  }) => {
    await page.goto("/de/where-we-work");
    await expect(page.locator("h1")).toHaveText("Wo wir arbeiten");
    await page.goto("/ar/stories?category=research");
    await expect(
      page.getByRole("link", { name: "بحث", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    const dims = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(dims.scrollWidth).toBeLessThanOrEqual(dims.clientWidth);
  });
});

test.describe("Office-claim correction (closeout)", () => {
  test("homepage trust strip contains no office claim", async ({ page }) => {
    await page.goto("/");
    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(/office/i);
    await expect(page.getByText("Six outcome portfolios")).toBeVisible();
  });

  test("footer and contact show country only, no office list", async ({
    page,
  }) => {
    await page.goto("/contact");
    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(/office/i);
    // Verified postal mailing address is labelled as such — a P.O. Box is
    // correspondence infrastructure, not a physical office.
    await expect(
      page.getByText("Postal address:", { exact: false }),
    ).toBeVisible();
    await expect(
      page.getByText("P.O. Box 130524, Kampala GPO, Uganda").first(),
    ).toBeVisible();
  });

  test("terms page no longer claims offices", async ({ page }) => {
    await page.goto("/terms");
    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(/office/i);
  });
});

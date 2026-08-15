import { test, expect } from "@playwright/test";

const routes = [
  "/",
  "/about-us",
  "/about-us/team",
  "/about-us/team/nassazi-kauthar-wangi",
  "/accessibility",
  "/stories/the-meaning-of-advantage",
  "/contact",
  "/donate",
  "/donors-and-sponsors",
  "/faq",
  "/gallery",
  "/get-involved",
  "/impact",
  "/our-work",
  "/programmes/health",
  "/programmes/education",
  "/programmes/humanitarian",
  "/programmes/water",
  "/projects",
  "/projects/kasaale-deep-borehole",
  "/reports-and-accountability",
  "/safeguarding",
  "/stories",
  "/stories/what-are-we-without-our-dreams",
  "/privacy",
  "/terms",
];

for (const width of [320, 360, 390, 430, 768]) {
  test(`all public routes fit a ${width}px viewport`, async ({ page }) => {
    test.setTimeout(300_000);
    await page.setViewportSize({ width, height: width === 768 ? 1024 : 844 });

    for (const path of routes) {
      await page.goto(path);
      const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(
        dimensions.scrollWidth,
        `${path} overflows at ${width}px`,
      ).toBeLessThanOrEqual(dimensions.clientWidth);
    }
  });
}

test("homepage critical images decode successfully", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  });

  const failedImages = await page.locator("header img, main img, footer img").evaluateAll(
    (images) =>
      images
        .filter(
          (image) =>
            image instanceof HTMLImageElement &&
            image.complete &&
            image.naturalWidth === 0,
        )
        .map((image) => ({
          src: (image as HTMLImageElement).currentSrc,
          alt: (image as HTMLImageElement).alt,
        })),
  );
  expect(failedImages).toEqual([]);
});

test("primary mobile controls meet a 44px touch target", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const menuButton = page.getByRole("button", { name: /open menu/i });
  const menuBox = await menuButton.boundingBox();
  expect(menuBox?.width).toBeGreaterThanOrEqual(44);
  expect(menuBox?.height).toBeGreaterThanOrEqual(44);

  const primaryCta = page.getByRole("link", { name: /support our work/i }).first();
  const ctaBox = await primaryCta.boundingBox();
  expect(ctaBox?.height).toBeGreaterThanOrEqual(44);
});

test("Uganda reach map is tappable and shows project details on a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const mapPin = page.getByRole("button", { name: "Kampala on the map: view details" });
  await mapPin.scrollIntoViewIfNeeded();
  await expect(mapPin).toHaveAttribute("aria-expanded", "false");

  await mapPin.click();
  await expect(mapPin).toHaveAttribute("aria-expanded", "true");

  // Scope to the panel this pin controls. Several districts run the same
  // project, so an unscoped link lookup matches more than one entry in the
  // district list and trips strict mode.
  const panelId = await mapPin.getAttribute("aria-controls");
  expect(panelId).toBeTruthy();
  await expect(
    page
      .locator(`[id="${panelId}"]`)
      .getByRole("link", {
        name: /Mental Health & Financial Literacy Workshops/i,
      })
  ).toBeVisible();
});

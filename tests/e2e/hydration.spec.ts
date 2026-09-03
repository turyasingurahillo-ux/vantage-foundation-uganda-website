import { expect, test, type Page } from "@playwright/test";

/**
 * Hydration regression coverage for `LazySection`.
 *
 * This has to run against a production build: `next dev` renders every request
 * on demand, so a server/client first-render disagreement that only shows up
 * against prerendered HTML does not reproduce there. `playwright.config.ts`
 * builds and serves the app, so these specs exercise the real thing.
 *
 * Previously `LazySection` seeded its state from
 * `typeof IntersectionObserver === "undefined"`, so the server emitted the
 * children while the browser's first render emitted the placeholder. React
 * reported that as minified error #418 and rebuilt the tree on the client.
 */

// Routes whose page trees include a <LazySection> (homepage reach map,
// project detail gallery) plus locale variants of each.
const LAZY_ROUTES = [
  "/",
  "/de",
  "/fr",
  "/projects/kasaale-deep-borehole",
  "/de/projects/kasaale-deep-borehole",
  "/fr/projects/kasaale-deep-borehole",
];

// Controls: same layout and locale plumbing, no LazySection. These guard
// against a fix that trades one hydration mismatch for another.
const CONTROL_ROUTES = ["/impact", "/de/impact"];

const HYDRATION_PATTERN = /minified react error #(418|423|425)|hydrat|did not match|server rendered/i;

/**
 * React reports hydration failures as uncaught errors in a production build,
 * and as console errors in development, so collect both.
 */
function collectHydrationProblems(page: Page): string[] {
  const problems: string[] = [];
  const keep = (message: string) => {
    if (HYDRATION_PATTERN.test(message)) problems.push(message);
  };
  page.on("pageerror", (error) => keep(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") keep(message.text());
  });
  return problems;
}

for (const route of [...LAZY_ROUTES, ...CONTROL_ROUTES]) {
  test(`hydrates ${route} without a server/client mismatch`, async ({ page }) => {
    const problems = collectHydrationProblems(page);

    await page.goto(route, { waitUntil: "load" });
    await expect(page.locator("h1").first()).toBeVisible();
    // Hydration is asynchronous — give React time to finish and report.
    await page.waitForTimeout(1500);

    expect(problems).toEqual([]);
  });
}

test("the lazily rendered reach map is absent until scrolled to, then renders", async ({
  page,
}) => {
  const problems = collectHydrationProblems(page);
  const reachMapHeading = page.getByRole("heading", { name: "Our Reach Across Uganda" });

  await page.goto("/", { waitUntil: "load" });
  await expect(page.locator("h1").first()).toBeVisible();

  // Deferred: the section sits far below the fold, so it must not be mounted
  // yet. If this starts failing, LazySection has stopped deferring anything.
  await expect(reachMapHeading).toHaveCount(0);

  // The placeholder must still reserve space so revealing it does not shunt
  // the rest of the page around.
  const placeholder = page.locator('main > .bg-white[aria-hidden="true"]').first();
  await expect(placeholder).toBeVisible();
  await expect(placeholder).toHaveCSS("height", "600px");

  // Scrolling the placeholder into view should bring it within the observer
  // rootMargin, causing LazySection to mount and render the deferred content.
  await placeholder.scrollIntoViewIfNeeded();

  // Revealed on approach, and still no hydration fallout from mounting it.
  await expect(reachMapHeading).toBeVisible();
  await expect(page.getByText("Where We Work").first()).toBeVisible();
  expect(problems).toEqual([]);
});

// Form routes that render <HoneypotFields>. Guard against SSR/client
// nondeterminism in the hidden loadedAt / submissionId values.
const HONEYPOT_ROUTES = ["/contact", "/de/contact", "/donate"];

for (const route of HONEYPOT_ROUTES) {
  test(`honeypot fields on ${route} hydrate without mismatch and populate`, async ({ page }) => {
    const problems = collectHydrationProblems(page);

    await page.goto(route, { waitUntil: "load" });
    await expect(page.locator("h1").first()).toBeVisible();
    await page.waitForTimeout(800);

    // Time-trap value is populated after client hydration.
    const loadedAt = page.locator('input[name="form_loaded_at"]').first();
    await expect(loadedAt).toHaveValue(/^[0-9]+$/);

    if (route === "/donate") {
      const submissionId = page.locator('input[name="submissionId"]').first();
      await expect(submissionId).toHaveValue(/\S/);
    }

    // Honeypot fields remain hidden and non-focusable.
    const website = page.locator('input[name="website"]').first();
    await expect(website).toBeHidden();
    await expect(website).toHaveAttribute("tabindex", "-1");
    await expect(website).toHaveAttribute("aria-hidden", "true");

    expect(problems).toEqual([]);
  });
}

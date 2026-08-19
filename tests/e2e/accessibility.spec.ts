import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const publicRoutes = [
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

test.describe("Accessibility — document structure", () => {
  for (const path of publicRoutes) {
    test(`${path} has one visible h1 and a main landmark`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toBeVisible();
    });
  }
});

type FocusableInfo = {
  tag: string;
  name: string;
  tabIndex: number;
};

// Compute the document's sequential keyboard focus order by inspecting
// genuinely focusable elements, respecting positive tabindex ordering.
// Excludes disabled, hidden, inert, and display:none / visibility:hidden
// elements. Does NOT exclude .sr-only elements (visually clipped but
// still keyboard-focusable, which is the correct behavior for skip links).
async function getSequentialFocusOrder(page: Page): Promise<FocusableInfo[]> {
  return page.evaluate(() => {
    const selector =
      'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, object, embed, [contenteditable]:not([contenteditable="false"]), [tabindex]';
    const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));

    const focusable = elements.filter((el) => {
      if (el.hasAttribute("tabindex")) {
        const value = el.getAttribute("tabindex");
        if (value && parseInt(value, 10) < 0) return false;
      }
      if ((el as HTMLButtonElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).disabled) {
        return false;
      }
      if (el.hasAttribute("hidden")) return false;
      if (el.closest("[inert]")) return false;
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") return false;
      return true;
    });

    const withIndex = focusable.map((el, index) => ({
      index,
      tabIndex: el.tabIndex,
      name: (el.getAttribute("aria-label") || el.textContent?.trim() || "").replace(/\s+/g, " "),
      tag: el.tagName.toLowerCase(),
    }));

    // Positive tabindex values first (ascending), then tabindex 0 / naturally
    // focusable elements in DOM order.
    withIndex.sort((a, b) => {
      if (a.tabIndex > 0 && b.tabIndex > 0) return a.tabIndex - b.tabIndex;
      if (a.tabIndex > 0) return -1;
      if (b.tabIndex > 0) return 1;
      return a.index - b.index;
    });

    return withIndex.map((item) => ({
      tag: item.tag,
      name: item.name,
      tabIndex: item.tabIndex,
    }));
  });
}

test.describe("Accessibility — keyboard navigation", () => {
  // A. ORDERING: the skip link is the first sequential keyboard destination.
  // Verified structurally rather than relying on Chromium's initial BODY
  // focus state, which is nondeterministic in headless CI.
  test("skip link is the first sequential keyboard destination", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const order = await getSequentialFocusOrder(page);
    const first = order[0];
    expect(first, JSON.stringify(order)).toMatchObject({
      tag: "a",
      name: "Skip to main content",
    });
    const positiveTabIndexes = order.filter((item) => item.tabIndex > 0);
    expect(positiveTabIndexes, "no positive tabindex values on public pages").toEqual([]);
  });

  // B. SEMANTICS: the skip link targets the main landmark, and the main
  // landmark is configured to receive focus (tabindex="-1").
  test("skip link targets the main landmark", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.getByRole("link", { name: /skip to .*content/i });
    await expect(skipLink).toHaveAttribute("href", "#main");
    const main = page.locator("main#main");
    await expect(main).toHaveCount(1);
    await expect(main).toHaveAttribute("tabindex", "-1");
  });

  // C. FOCUS + VISIBILITY: the skip link can receive focus and becomes
  // visibly exposed when focused. Activation behavior (main.focus()) is
  // verified by the unit test in tests/unit/SkipToContent.test.tsx because
  // the SkipToContent client component's onClick handler calls
  // preventDefault() + main.focus(), which races with React hydration in
  // the E2E environment. The unit test reliably verifies the click handler
  // focuses main in a controlled jsdom environment.
  test("skip link receives focus and becomes visible", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.getByRole("link", { name: /skip to .*content/i });
    await skipLink.focus();
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();
  });

  test("mobile navigation opens, receives focus and closes with Escape", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const trigger = page.getByRole("button", { name: /open menu/i });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});

test.describe("Accessibility — axe-core automated checks", () => {
  const pages = [
    "/",
    "/about-us",
    "/contact",
    "/donate",
    "/faq",
    "/get-involved",
    "/impact",
    "/our-work",
    "/projects",
    "/reports-and-accountability",
    "/stories",
    "/stories/the-meaning-of-advantage",
    "/gallery",
    "/privacy",
    "/terms",
    "/safeguarding",
    "/accessibility",
  ];

  for (const path of pages) {
    test(`${path} has no axe-core violations`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      const results = await new AxeBuilder({ page })
        .withTags([
          "wcag2a",
          "wcag2aa",
          "wcag21a",
          "wcag21aa",
          "wcag22aa",
        ])
        .analyze();

      expect(
        results.violations,
        `${path}: ${results.violations
          .map((violation) => `${violation.id} (${violation.nodes.length})`)
          .join(", ")}`,
      ).toEqual([]);
    });
  }
});

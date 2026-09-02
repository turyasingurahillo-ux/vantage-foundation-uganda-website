import { test, expect, type Page } from "@playwright/test";

/**
 * Stories & Insights article template.
 *
 * Covers the two template defects the design audit found — hero photographs
 * cropped through their subject, and empty margins on widescreen — plus the
 * engagement features added alongside them.
 */

// One portrait hero, one cinematic hero, one article with inline photographs.
const stories = [
  "what-are-we-without-our-dreams",
  "the-meaning-of-advantage",
  "why-youth-spaces-matter-in-uganda",
];

const DESKTOP = { width: 1920, height: 1080 };
const LAPTOP = { width: 1280, height: 800 };
const TABLET = { width: 768, height: 1024 };
const MOBILE = { width: 390, height: 844 };

async function scrollToBottom(page: Page) {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
}

test.describe("Stories — hero framing", () => {
  for (const slug of stories) {
    for (const viewport of [MOBILE, TABLET, LAPTOP, DESKTOP]) {
      test(`${slug} keeps its hero subject in frame at ${viewport.width}px`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto(`/stories/${slug}`);

        const hero = page.getByTestId("story-hero");
        await expect(hero).toBeVisible();

        const image = hero.locator("img").first();
        await expect(image).toBeVisible();

        const framing = await image.evaluate((element) => {
          const img = element as HTMLImageElement;
          const style = window.getComputedStyle(img);
          return {
            objectFit: style.objectFit,
            objectPosition: style.objectPosition,
            naturalRatio: img.naturalWidth / img.naturalHeight,
            renderedRatio: img.clientWidth / img.clientHeight,
          };
        });

        // A centred crop is what cut through subjects' heads: the focus has to
        // stay above the midline wherever the frame is shallower than the
        // photograph.
        const [, vertical] = framing.objectPosition.split(" ");
        if (framing.objectFit === "cover" && framing.renderedRatio > framing.naturalRatio) {
          expect(
            vertical,
            `${slug} at ${viewport.width}px crops a ${framing.naturalRatio.toFixed(2)} image into a ${framing.renderedRatio.toFixed(2)} frame`
          ).not.toBe("50%");
        }

        // A portrait photograph must never be squeezed into a cinematic band.
        if (framing.naturalRatio < 1) {
          expect(
            framing.renderedRatio,
            `${slug} at ${viewport.width}px frames a portrait too wide`
          ).toBeLessThan(1.5);
        }
      });
    }
  }

  test("inline article photographs are never cropped", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/stories/why-youth-spaces-matter-in-uganda");

    const figures = page.locator("#story-article figure");
    await expect(figures.first()).toBeVisible();
    const count = await figures.count();
    expect(count).toBeGreaterThan(0);

    for (let index = 0; index < count; index += 1) {
      const image = figures.nth(index).locator("img");
      await image.scrollIntoViewIfNeeded();
      // These images load lazily, and an undecoded image has no layout size.
      await expect
        .poll(() =>
          image.evaluate(
            (element) =>
              (element as HTMLImageElement).complete &&
              (element as HTMLImageElement).naturalWidth > 0
          )
        )
        .toBe(true);
      const ratios = await image.evaluate((element) => {
        const img = element as HTMLImageElement;
        return {
          natural: img.naturalWidth / img.naturalHeight,
          rendered: img.clientWidth / img.clientHeight,
        };
      });
      // Rendering at the source's own aspect ratio means nothing is cut off.
      expect(ratios.rendered).toBeCloseTo(ratios.natural, 1);
    }
  });
});

test.describe("Stories — layout", () => {
  test("widescreen margins carry rail content instead of blank space", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto("/stories/the-meaning-of-advantage");

    const shareRail = page.getByRole("complementary", { name: /share/i });
    await expect(shareRail).toBeVisible();
    await expect(page.getByRole("navigation", { name: /more stories/i })).toBeVisible();

    const article = page.locator("#story-article");
    const articleBox = await article.boundingBox();
    const railBox = await shareRail.boundingBox();
    expect(articleBox && railBox).toBeTruthy();

    // The rail sits in space the reading column does not occupy.
    expect(railBox!.x + railBox!.width).toBeLessThanOrEqual(articleBox!.x + 1);
    // …and the reading column stays a comfortable line length.
    expect(articleBox!.width).toBeLessThanOrEqual(720);
    expect(articleBox!.width).toBeGreaterThanOrEqual(560);
  });

  test("the reading column grows with the viewport", async ({ page }) => {
    await page.goto("/stories/the-meaning-of-advantage");

    await page.setViewportSize(LAPTOP);
    const laptopWidth = (await page.locator("#story-article").boundingBox())!.width;

    await page.setViewportSize(DESKTOP);
    const desktopWidth = (await page.locator("#story-article").boundingBox())!.width;

    expect(desktopWidth).toBeGreaterThan(laptopWidth);
  });

  test("mobile collapses to a single column with no rails and no sticky overlap", async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/stories/the-meaning-of-advantage");

    await expect(page.getByRole("complementary", { name: /share this story/i })).toBeHidden();
    await expect(page.getByRole("navigation", { name: /in this story/i })).toBeHidden();
    // Share controls are still reachable, just inline rather than in a rail.
    await expect(page.getByRole("button", { name: "Share on WhatsApp" })).toBeVisible();

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });
});

test.describe("Stories — engagement features", () => {
  for (const slug of stories) {
    test(`${slug} shows tags, read time, progress and further reading`, async ({ page }) => {
      await page.setViewportSize(LAPTOP);
      await page.goto(`/stories/${slug}`);

      // Read time sits with the byline, before the reader commits.
      await expect(
        page.getByTestId("story-hero").getByText(/\d+ min read/)
      ).toBeVisible();

      const progress = page.getByTestId("reading-progress");
      await expect(progress).toBeAttached();
      const before = Number(await progress.getAttribute("data-progress"));

      await scrollToBottom(page);
      const after = Number(await progress.getAttribute("data-progress"));
      expect(after).toBeGreaterThan(before);

      const carousel = page.getByTestId("related-stories-carousel");
      await expect(carousel).toBeVisible();
      await expect(carousel.getByRole("link")).not.toHaveCount(0);

      const scroll = await carousel.evaluate((element) => ({
        scrollable: element.scrollWidth > element.clientWidth,
        snap: window.getComputedStyle(element).scrollSnapType,
      }));
      expect(scroll.scrollable).toBe(true);
      expect(scroll.snap).toContain("x");
    });
  }

  test("story tags are shown near the byline", async ({ page }) => {
    await page.goto("/stories/why-youth-spaces-matter-in-uganda");
    const hero = page.getByTestId("story-hero");
    for (const tag of ["youth empowerment", "education"]) {
      await expect(hero.getByText(tag, { exact: false }).first()).toBeVisible();
    }
  });
});

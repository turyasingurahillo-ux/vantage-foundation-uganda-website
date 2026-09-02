import { expect, test, type Page } from "@playwright/test";

const IMPACT_PAGE = "/";
const MOBILE_VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
];
const EXPANDABLE_ITEMS = ["About", "Programmes", "Impact", "Get Involved"];

async function openMenuOverImpactEvidence(page: Page) {
  const evidence = page.getByRole("link", { name: "View project evidence" }).first();
  await evidence.scrollIntoViewIfNeeded();
  const evidenceBox = await evidence.boundingBox();
  const scrollYBeforeMenu = await page.evaluate(() => Math.round(window.scrollY));

  const trigger = page.getByRole("button", { name: /open menu/i });
  await trigger.click();
  const menu = page.getByRole("dialog", { name: /mobile navigation/i });
  await expect(menu).toBeVisible();
  return { evidenceBox, menu, scrollYBeforeMenu, trigger };
}

async function pointsNotCoveredByMenu(page: Page) {
  return page.evaluate(() => {
    const menu = document.getElementById("mobile-menu");
    if (!menu) return ["#mobile-menu is missing"];

    const leaks: string[] = [];
    const stepX = Math.max(8, Math.floor(window.innerWidth / 12));
    const stepY = Math.max(8, Math.floor(window.innerHeight / 24));

    for (let x = 2; x < window.innerWidth; x += stepX) {
      for (let y = 2; y < window.innerHeight; y += stepY) {
        const element = document.elementFromPoint(x, y);
        const isDevToolbar = element?.closest("nextjs-portal");
        if ((!element || !menu.contains(element)) && !isDevToolbar) {
          leaks.push(`(${x},${y}) -> ${element?.tagName.toLowerCase() ?? "nothing"}`);
        }
      }
    }
    return leaks;
  });
}

async function menuLayoutProblems(page: Page) {
  return page.evaluate(() => {
    const menu = document.getElementById("mobile-menu")!;
    const controls = Array.from(
      menu.querySelectorAll<HTMLElement>("nav a[href], nav button"),
    );
    const problems: string[] = [];

    for (const control of controls) {
      const rect = control.getBoundingClientRect();
      const label = (control.textContent || "?").trim();
      if (rect.height < 44) problems.push(`${label}: ${Math.round(rect.height)}px tall`);
      if (rect.left < -0.5 || rect.right > window.innerWidth + 0.5) {
        problems.push(`${label}: horizontal overflow`);
      }
    }

    for (let index = 0; index < controls.length; index += 1) {
      for (let next = index + 1; next < controls.length; next += 1) {
        if (controls[index].contains(controls[next]) || controls[next].contains(controls[index])) {
          continue;
        }
        const a = controls[index].getBoundingClientRect();
        const b = controls[next].getBoundingClientRect();
        const overlaps =
          a.left < b.right - 1 &&
          b.left < a.right - 1 &&
          a.top < b.bottom - 1 &&
          b.top < a.bottom - 1;
        if (overlaps) {
          problems.push(
            `"${controls[index].textContent?.trim()}" overlaps "${controls[next].textContent?.trim()}"`,
          );
        }
      }
    }

    return problems;
  });
}

for (const viewport of MOBILE_VIEWPORTS) {
  test(`mobile accordion uses normal flow at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto(IMPACT_PAGE, { waitUntil: "networkidle" });

    const evidenceCardProblems = await page.evaluate(() => {
      const problems: string[] = [];
      const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("article a")).filter(
        (link) => link.textContent?.trim() === "View project evidence",
      );
      for (const link of links) {
        const article = link.closest("article")!;
        const description = article.querySelector("dl")!;
        if (description.getBoundingClientRect().bottom > link.getBoundingClientRect().top + 1) {
          problems.push("evidence link overlaps its description");
        }
        if (article.scrollWidth > article.clientWidth + 1) {
          problems.push("evidence card content does not wrap");
        }
        if (link.getBoundingClientRect().bottom > article.getBoundingClientRect().bottom + 1) {
          problems.push("evidence link escapes its card");
        }
      }
      return { count: links.length, problems };
    });
    expect(evidenceCardProblems.count).toBeGreaterThan(0);
    expect(evidenceCardProblems.problems).toEqual([]);

    const { evidenceBox, menu } = await openMenuOverImpactEvidence(page);

    const geometry = await menu.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        background: style.backgroundColor,
      };
    });
    expect(geometry.top).toBeLessThanOrEqual(0);
    expect(geometry.left).toBeLessThanOrEqual(0);
    expect(geometry.width).toBeGreaterThanOrEqual(viewport.width - 1);
    expect(geometry.height).toBeGreaterThanOrEqual(viewport.height - 1);
    expect(geometry.background).toBe("rgb(255, 255, 255)");
    expect(await pointsNotCoveredByMenu(page)).toEqual([]);

    if (evidenceBox) {
      const evidenceIsCovered = await page.evaluate(({ x, y }) => {
        const menuElement = document.getElementById("mobile-menu")!;
        const topmost = document.elementFromPoint(x, y);
        return !!topmost && menuElement.contains(topmost);
      }, {
        x: Math.min(evidenceBox.x + 4, viewport.width - 2),
        y: Math.min(Math.max(evidenceBox.y + evidenceBox.height / 2, 1), viewport.height - 2),
      });
      expect(evidenceIsCovered).toBe(true);
    }

    for (const label of EXPANDABLE_ITEMS) {
      const button = menu.getByRole("button", { name: label, exact: true });
      const row = button.locator("xpath=..");
      const followingRow = row.locator("xpath=following-sibling::*[1]");
      const before = await followingRow.boundingBox();

      await button.click();
      await expect(button).toHaveAttribute("aria-expanded", "true");
      const panelId = await button.getAttribute("aria-controls");
      expect(panelId).toBeTruthy();
      const panel = page.locator(`[id="${panelId}"]`);
      await expect(panel).toBeAttached();

      const expanded = await followingRow.boundingBox();
      const panelBox = await panel.boundingBox();
      const rowBox = await row.boundingBox();
      expect(expanded?.y).toBeGreaterThan(before?.y ?? 0);
      expect(rowBox?.height).toBeGreaterThan(panelBox?.height ?? 0);
      expect(await menuLayoutProblems(page)).toEqual([]);

      await button.click();
      await expect(button).toHaveAttribute("aria-expanded", "false");
      await expect(panel).toHaveCount(0);
      const collapsed = await followingRow.boundingBox();
      expect(Math.abs((collapsed?.y ?? 0) - (before?.y ?? 0))).toBeLessThanOrEqual(1);
    }

    for (const label of EXPANDABLE_ITEMS) {
      await menu.getByRole("button", { name: label, exact: true }).click();
    }
    expect(await menuLayoutProblems(page)).toEqual([]);

    const flow = await page.evaluate(() => {
      const menuElement = document.getElementById("mobile-menu")!;
      const scroller = document.getElementById("mobile-menu-scroll")!;
      const rows = Array.from(menuElement.querySelectorAll<HTMLElement>("nav > ul > li"));
      const rowOverlap = rows.some((row, index) => {
        const next = rows[index + 1];
        return next ? row.getBoundingClientRect().bottom > next.getBoundingClientRect().top + 1 : false;
      });
      scroller.scrollTop = scroller.scrollHeight;
      const donate = rows
        .flatMap((row) => Array.from(row.children))
        .find((element) => element.textContent?.trim() === "Donate") as HTMLElement | undefined;
      const donateRect = donate?.getBoundingClientRect();
      return {
        canScroll: scroller.scrollHeight > scroller.clientHeight,
        scrollTop: scroller.scrollTop,
        rowOverlap,
        donateInViewport:
          !!donateRect && donateRect.top >= 0 && donateRect.bottom <= window.innerHeight + 1,
      };
    });
    expect(flow.rowOverlap).toBe(false);
    expect(flow.canScroll).toBe(true);
    expect(flow.scrollTop).toBeGreaterThan(0);
    expect(flow.donateInViewport).toBe(true);
    expect(await pointsNotCoveredByMenu(page)).toEqual([]);
  });
}

test("closing the menu restores the page without blank space", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(IMPACT_PAGE, { waitUntil: "networkidle" });
  const { menu, scrollYBeforeMenu, trigger } = await openMenuOverImpactEvidence(page);

  const programmes = menu.getByRole("button", { name: "Programmes", exact: true });
  await programmes.click();
  await programmes.click();
  await page.getByRole("button", { name: /close menu/i }).click();

  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.locator("header")).not.toHaveAttribute("inert", "");
  expect(
    Math.abs(
      (await page.evaluate(() => Math.round(window.scrollY))) - scrollYBeforeMenu,
    ),
  ).toBeLessThanOrEqual(2);
  await expect(page.locator("body")).toHaveCSS("overflow", /visible|auto/);
});

test("desktop dropdown layout remains unchanged", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(IMPACT_PAGE, { waitUntil: "networkidle" });

  await expect(page.getByRole("button", { name: /open menu/i })).toBeHidden();
  const nav = page.getByRole("navigation", { name: /main navigation/i });
  await expect(nav).toBeVisible();
  const impact = nav.getByRole("button", { name: "Impact", exact: true });
  await impact.click();
  await expect(impact).toHaveAttribute("aria-expanded", "true");
  await expect(nav.getByRole("link", { name: "Impact Results" })).toBeVisible();
  await expect(page.getByRole("link", { name: "View project evidence" }).first()).toBeAttached();
});

test("an open mobile menu closes when the desktop navigation takes over", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(IMPACT_PAGE, { waitUntil: "networkidle" });
  await openMenuOverImpactEvidence(page);

  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.locator("body")).toHaveCSS("overflow", /visible|auto/);
});

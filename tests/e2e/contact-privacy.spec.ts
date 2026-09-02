import { test, expect } from "@playwright/test";

/**
 * Email-privacy and contact-form behaviour, exercised against the real build.
 *
 * The central guarantee: Vantage's protected operational mailbox must not be
 * reachable from anything the site serves to a browser — rendered HTML,
 * structured data, or the client JS bundles.
 */

const PROTECTED_MAILBOX = "foundationvantage@gmail.com";

// Every route a harvester would realistically crawl.
const publicRoutes = [
  "/",
  "/about-us",
  "/contact",
  "/donate",
  "/faq",
  "/get-involved",
  "/privacy",
  "/terms",
  "/safeguarding",
  "/accessibility",
  "/reports-and-accountability",
];

test.describe("protected mailbox is not published", () => {
  for (const route of publicRoutes) {
    test(`${route} does not expose the protected address`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBeLessThan(400);

      const html = await page.content();
      expect(html).not.toContain(PROTECTED_MAILBOX);

      // Also catch an obfuscated variant (e.g. "foundationvantage [at] gmail").
      expect(html).not.toMatch(/foundationvantage/i);
    });
  }

  test("organization JSON-LD carries no email address", async ({ page }) => {
    await page.goto("/");
    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();

    const ngo = blocks
      .map((b) => JSON.parse(b))
      .find((d) => JSON.stringify(d["@type"] ?? "").includes("NGO"));

    expect(ngo).toBeTruthy();
    expect(ngo.email).toBeUndefined();
    expect(JSON.stringify(ngo)).not.toContain(PROTECTED_MAILBOX);
    // SEO signal is preserved via a contact URL instead of an address.
    expect(ngo.contactPoint?.url).toContain("/contact");
  });

  test("footer offers a contact route without an address", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(
      footer.getByRole("link", { name: /contact vantage/i }),
    ).toBeVisible();
  });
});

/**
 * The footer newsletter form also renders honeypot fields and a submit button,
 * so every form assertion is scoped to the contact form itself (the only form
 * containing #message).
 */
function contactForm(page: import("@playwright/test").Page) {
  return page.locator("form").filter({ has: page.locator("#message") });
}

/**
 * The form carries a time-trap: anything submitted within 2 seconds of load is
 * treated as a bot. Playwright fills fields far faster than a human, so tests
 * that expect a submission to be processed on its merits must wait it out.
 */
async function clearTimeTrap(page: import("@playwright/test").Page) {
  await page.waitForTimeout(2500);
}

test.describe("contact form", () => {
  test("shows all required inquiry categories", async ({ page }) => {
    await page.goto("/contact");
    const select = page.locator("select#subject");

    for (const label of [
      "General inquiry",
      "Partnerships",
      "Grants & funding",
      "Programmes",
      "Volunteering",
      "Media / press",
      "Research",
      "Other",
    ]) {
      await expect(select.locator("option", { hasText: label })).toHaveCount(1);
    }
  });

  test("preselects the category from a deep link, including legacy values", async ({
    page,
  }) => {
    await page.goto("/contact?subject=partner");
    await expect(page.locator("select#subject")).toHaveValue("partnerships");

    await page.goto("/contact?subject=grants");
    await expect(page.locator("select#subject")).toHaveValue("grants");

    // An unrecognised value must not be trusted into the field.
    await page.goto("/contact?subject=%3Cscript%3E");
    await expect(page.locator("select#subject")).toHaveValue("");
  });

  test("rejects an invalid email with a visible, associated error", async ({
    page,
  }) => {
    await page.goto("/contact");
    await page.fill("#name", "Test Person");
    await page.fill("#email", "not-an-email");
    await page.selectOption("#subject", "general");
    await page.fill("#message", "This is a long enough test message.");
    await clearTimeTrap(page);
    await contactForm(page).getByRole("button", { name: /send message/i }).click();

    const error = page.locator("#email-error");
    await expect(error).toBeVisible();
    await expect(page.locator("#email")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#email")).toHaveAttribute(
      "aria-describedby",
      "email-error",
    );
  });

  test("rejects an empty submission across all required fields", async ({
    page,
  }) => {
    await page.goto("/contact");
    await clearTimeTrap(page);
    await contactForm(page).getByRole("button", { name: /send message/i }).click();

    await expect(page.locator("#name-error")).toBeVisible();
    await expect(page.locator("#email-error")).toBeVisible();
    await expect(page.locator("#subject-error")).toBeVisible();
    await expect(page.locator("#message-error")).toBeVisible();
  });

  test("rejects an over-long message", async ({ page }) => {
    await page.goto("/contact");
    await page.fill("#name", "Test Person");
    await page.fill("#email", "test@example.com");
    await page.selectOption("#subject", "general");
    // Bypass the maxLength attribute the way a scripted client would.
    await page.locator("#message").evaluate((el, value) => {
      const textarea = el as HTMLTextAreaElement;
      textarea.removeAttribute("maxlength");
      textarea.value = value;
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    }, "x".repeat(6000));
    await clearTimeTrap(page);
    await contactForm(page).getByRole("button", { name: /send message/i }).click();

    await expect(page.locator("#message-error")).toBeVisible();
  });

  test("honeypot submissions are discarded without a distinguishable response", async ({
    page,
  }) => {
    await page.goto("/contact");
    await page.fill("#name", "Spam Bot");
    await page.fill("#email", "bot@example.com");
    await page.selectOption("#subject", "general");
    await page.fill("#message", "Buy cheap SEO services for your website now.");

    // Fill the hidden honeypot the way a naive bot would.
    await contactForm(page)
      .locator('input[name="website"]')
      .evaluate((el) => ((el as HTMLInputElement).value = "http://spam.example"));

    // Wait past the time-trap so the honeypot is the only thing rejecting this.
    await clearTimeTrap(page);
    await contactForm(page).getByRole("button", { name: /send message/i }).click();

    // The bot gets the same confirmation a human gets, learning nothing.
    await expect(page.getByText(/message received/i)).toBeVisible();
  });

  test("form fields are keyboard reachable and labelled", async ({ page }) => {
    await page.goto("/contact");

    for (const id of ["name", "email", "organisation", "phone", "subject", "message"]) {
      const field = page.locator(`#${id}`);
      await expect(field).toBeVisible();
      // Each control has an associated <label for=...>.
      await expect(page.locator(`label[for="${id}"]`)).toHaveCount(1);
      await field.focus();
      await expect(field).toBeFocused();
    }
  });

  test("honeypot fields are hidden from assistive technology", async ({
    page,
  }) => {
    await page.goto("/contact");
    const honeypot = contactForm(page).locator('input[name="website"]');
    await expect(honeypot).toHaveAttribute("aria-hidden", "true");
    await expect(honeypot).toHaveAttribute("tabindex", "-1");
    await expect(honeypot).toBeHidden();
  });

  test("renders usably on a small mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/contact");

    await expect(page.locator("#message")).toBeVisible();
    await expect(
      contactForm(page).getByRole("button", { name: /send message/i }),
    ).toBeVisible();

    // No horizontal overflow.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});

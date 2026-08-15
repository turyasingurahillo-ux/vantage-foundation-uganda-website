import { test, expect } from "@playwright/test";

/**
 * Access control for /admin/messages.
 *
 * The page renders contact-form submissions — names, email addresses,
 * organisations and message bodies. Knowing the URL must never be enough to
 * read any of it.
 *
 * Vantage's admin auth is a single shared credential (ADMIN_SECRET) exchanged
 * for an HMAC-signed session token (lib/session.ts). There is one admin role,
 * so these tests cover the boundary that actually exists: signed-in versus not.
 */

// Strings that only ever appear once the page has rendered real data.
const PAGE_BODY_MARKER = "Submissions from the public contact form";

// A well-formed but unsigned token: correct shape, wrong HMAC.
const FORGED_TOKEN = `${"a".repeat(64)}.9999999999.${"b".repeat(64)}`;
// Correct shape, already expired.
const EXPIRED_TOKEN = `${"a".repeat(64)}.1.${"b".repeat(64)}`;

test.describe("/admin/messages access control", () => {
  test("an unauthenticated visitor gets no message data", async ({ page }) => {
    await page.goto("/admin/messages");

    const html = await page.content();
    expect(html).not.toContain(PAGE_BODY_MARKER);

    // The browser is sent to the login screen rather than the messages page.
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("an unauthenticated RSC request returns no message data", async ({
    request,
  }) => {
    const res = await request.get("/admin/messages?_rsc=probe", {
      headers: { RSC: "1" },
    });
    const body = await res.text();
    expect(body).not.toContain(PAGE_BODY_MARKER);
    // No row content of any kind — a stored message always has an @ address.
    expect(body).not.toMatch(/@example\.(com|invalid)/);
  });

  test("a forged session cookie is rejected", async ({ request }) => {
    const res = await request.get("/admin/messages", {
      headers: { Cookie: `vantage_admin=${FORGED_TOKEN}` },
    });
    expect(await res.text()).not.toContain(PAGE_BODY_MARKER);
  });

  test("an expired session token is rejected", async ({ request }) => {
    const res = await request.get("/admin/messages", {
      headers: { Cookie: `vantage_admin=${EXPIRED_TOKEN}` },
    });
    expect(await res.text()).not.toContain(PAGE_BODY_MARKER);
  });

  test("responses are never cached by a CDN or browser", async ({ request }) => {
    const res = await request.get("/admin/messages");
    const cacheControl = res.headers()["cache-control"] ?? "";
    expect(cacheControl).toMatch(/no-store/);
    expect(cacheControl).toMatch(/private/);
  });

  test("the page is marked noindex, nofollow", async ({ page }) => {
    // Read the served document directly: following the redirect would give us
    // the login page's metadata instead.
    const res = await page.request.get("/admin/messages");
    expect(await res.text()).toMatch(
      /<meta name="robots" content="noindex, nofollow"/,
    );
  });

  test("robots.txt disallows the admin area", async ({ request }) => {
    const body = await (await request.get("/robots.txt")).text();
    expect(body).toMatch(/Disallow:\s*\/admin\//);
  });
});

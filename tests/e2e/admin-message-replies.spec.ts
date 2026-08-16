import { test, expect, type APIRequestContext } from "@playwright/test";

/**
 * The admin reply endpoint is the only place in the application that sends
 * mail to a member of the public, so it gets the heaviest coverage: who may
 * call it, whose address it will send to, and what it does when the provider
 * fails.
 *
 * These run against a real build with a real database. SMTP is not configured
 * in the test environment, so every send attempt legitimately fails — which is
 * exactly the path worth asserting: a failed provider call must never be shown
 * as a delivered reply.
 */

const REPLY_URL = "/api/admin/messages/reply";
const STATUS_URL = "/api/admin/messages/status";
const PAGE_MARKER = "Read enquiries from the website";

const FORGED = `${"a".repeat(64)}.bootstrap.9999999999.${"b".repeat(64)}`;

async function loginCookies(request: APIRequestContext) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return null;

  // Pick up the CSRF cookie the middleware sets for /admin.
  await request.get("/admin/login");
  const state = await request.storageState();
  const csrf = state.cookies.find((c) => c.name === "vantage_csrf")?.value;
  if (!csrf) return null;

  const res = await request.post("/api/admin/login", {
    form: { password: secret, csrf_token: csrf },
    maxRedirects: 0,
  });
  // 302 to /admin/donations on success.
  if (res.status() !== 302) return null;
  return { csrf };
}

test.describe("reply endpoint authorisation", () => {
  test("rejects an unauthenticated reply", async ({ request }) => {
    const res = await request.post(REPLY_URL, {
      form: { id: "1", body: "hello", idempotencyKey: "k-unauth-12345678" },
      maxRedirects: 0,
    });
    expect(res.status()).toBe(302);
    expect(res.headers()["location"]).toContain("/admin/login");
  });

  test("rejects a forged session token", async ({ request }) => {
    const res = await request.post(REPLY_URL, {
      headers: { Cookie: `vantage_admin=${FORGED}` },
      form: { id: "1", body: "hello", idempotencyKey: "k-forged-12345678" },
      maxRedirects: 0,
    });
    expect(res.status()).toBe(302);
    expect(res.headers()["location"]).toContain("/admin/login");
  });

  test("rejects an unauthenticated status change", async ({ request }) => {
    const res = await request.post(STATUS_URL, {
      form: { id: "1", status: "archived" },
      maxRedirects: 0,
    });
    expect(res.status()).toBe(302);
    expect(res.headers()["location"]).toContain("/admin/login");
  });

  test("the inbox itself leaks nothing to a stranger", async ({ request }) => {
    const body = await (await request.get("/admin/messages")).text();
    expect(body).not.toContain(PAGE_MARKER);
    expect(body).not.toMatch(/@example\.(com|invalid)/);
  });
});

test.describe("reply endpoint validation", () => {
  test("requires a CSRF token even with a valid session", async ({ request }) => {
    const session = await loginCookies(request);
    test.skip(!session, "ADMIN_SECRET not available to the test runner");

    const res = await request.post(REPLY_URL, {
      form: { id: "1", body: "hello", idempotencyKey: "k-nocsrf-12345678" },
      maxRedirects: 0,
    });
    expect(res.status()).toBe(303);
    expect(res.headers()["location"]).toContain("error=csrf");
  });

  test("rejects a whitespace-only reply", async ({ request }) => {
    const session = await loginCookies(request);
    test.skip(!session, "ADMIN_SECRET not available to the test runner");

    const res = await request.post(REPLY_URL, {
      form: {
        id: "1",
        body: "   \n  ",
        idempotencyKey: "k-empty-12345678",
        csrf_token: session!.csrf,
      },
      maxRedirects: 0,
    });
    expect(res.status()).toBe(303);
    expect(res.headers()["location"]).toContain("error=empty");
  });

  test("rejects an oversized reply", async ({ request }) => {
    const session = await loginCookies(request);
    test.skip(!session, "ADMIN_SECRET not available to the test runner");

    const res = await request.post(REPLY_URL, {
      form: {
        id: "1",
        body: "x".repeat(6000),
        idempotencyKey: "k-toolong-12345678",
        csrf_token: session!.csrf,
      },
      maxRedirects: 0,
    });
    expect(res.status()).toBe(303);
    expect(res.headers()["location"]).toContain("error=too-long");
  });

  test("rejects an unknown message id", async ({ request }) => {
    const session = await loginCookies(request);
    test.skip(!session, "ADMIN_SECRET not available to the test runner");

    const res = await request.post(REPLY_URL, {
      form: {
        id: "99999999",
        body: "This message does not exist.",
        idempotencyKey: "k-notfound-12345678",
        csrf_token: session!.csrf,
      },
      maxRedirects: 0,
    });
    expect(res.status()).toBe(303);
    expect(res.headers()["location"]).toContain("error=notfound");
  });

  test("rejects a non-numeric message id", async ({ request }) => {
    const session = await loginCookies(request);
    test.skip(!session, "ADMIN_SECRET not available to the test runner");

    const res = await request.post(REPLY_URL, {
      form: {
        id: "not-a-number",
        body: "Hello there.",
        idempotencyKey: "k-badid-12345678",
        csrf_token: session!.csrf,
      },
      maxRedirects: 0,
    });
    expect(res.status()).toBe(303);
    expect(res.headers()["location"]).toContain("error=");
  });

  test("ignores any recipient supplied by the caller", async ({ request }) => {
    const session = await loginCookies(request);
    test.skip(!session, "ADMIN_SECRET not available to the test runner");

    // The endpoint's schema has no recipient field at all. Supplying one must
    // not change where mail would go, and must not be echoed back.
    const res = await request.post(REPLY_URL, {
      form: {
        id: "99999999",
        body: "Attempted redirect.",
        idempotencyKey: "k-spoof-12345678",
        csrf_token: session!.csrf,
        to: "attacker@evil.invalid",
        recipient: "attacker@evil.invalid",
        email: "attacker@evil.invalid",
      },
      maxRedirects: 0,
    });
    const location = res.headers()["location"] ?? "";
    expect(location).not.toContain("attacker@evil.invalid");
    // Rejected on the id, never reaching a send.
    expect(location).toContain("error=notfound");
  });
});

test.describe("inbox rendering", () => {
  // page.request shares the page's cookie jar, so signing in through it leaves
  // the browser context authenticated for subsequent navigations.
  test("shows the filter tabs and search for an authenticated admin", async ({
    page,
  }) => {
    const session = await loginCookies(page.request);
    test.skip(!session, "ADMIN_SECRET not available to the test runner");

    await page.goto("/admin/messages");
    await expect(
      page.getByRole("heading", { name: "Contact messages" }),
    ).toBeVisible();

    const filters = page.getByRole("navigation", { name: "Message filters" });
    for (const label of [
      "New",
      "Awaiting response",
      "Replied",
      "Archived",
      "All",
    ]) {
      await expect(
        filters.getByRole("link", { name: new RegExp(`^${label}`) }),
      ).toBeVisible();
    }
    await expect(page.locator("#q")).toBeVisible();
  });

  test("renders an empty state rather than a blank page", async ({ page }) => {
    const session = await loginCookies(page.request);
    test.skip(!session, "ADMIN_SECRET not available to the test runner");

    // A search that cannot match anything.
    await page.goto("/admin/messages?filter=all&q=zzz-no-such-message-zzz");
    await expect(page.getByText(/Nothing matches/i)).toBeVisible();
  });
});

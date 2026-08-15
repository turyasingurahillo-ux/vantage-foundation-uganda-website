import { defineConfig, devices } from "@playwright/test";

// A dedicated, non-default port for the e2e/test webServer — this machine
// also runs a separate project (kikumikyo) whose dev server defaults to
// :3000, and Playwright's `reuseExistingServer` will happily (and silently)
// run tests against whatever's already listening there. :3100 avoids that
// collision without touching the normal `npm run dev` workflow (still :3000).
const PORT = 3100;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      // Every test drives the forms from the same (localhost) IP, so the
      // production default of 3 submissions/minute throttles the suite itself.
      // The limiter's own behaviour is covered deterministically in
      // tests/unit/rate-limit.test.ts; here we raise it so the functional and
      // accessibility assertions can run. This does NOT change the deployed
      // default — see FORM_RATE_LIMIT in app/actions.ts.
      FORM_RATE_LIMIT: "500",
    },
  },
});

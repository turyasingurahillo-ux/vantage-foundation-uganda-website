import { defineConfig, devices } from "@playwright/test";

// Temporary local config — runs specs against the already-running dev
// server on :3000 instead of building + starting its own production
// server. Deleted after use; not committed.
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  reporter: "line",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});

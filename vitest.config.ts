import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    exclude: ["tests/e2e/**", "node_modules/**"],
    // PGlite integration tests spin up a real PostgreSQL in-process and
    // apply the full schema + migrations per test. Under parallel load
    // this can exceed the default 5s/10s timeouts.
    testTimeout: 30_000,
    hookTimeout: 30_000,
    // Limit parallel file concurrency. PGlite tests create an in-process
    // PostgreSQL per test; running too many in parallel causes memory
    // pressure and deadlocks on resource-constrained machines.
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
      // Next.js's `server-only` package throws when imported from a client
      // component. In unit tests we just want it to be a no-op so we can
      // exercise the pure helpers in modules that import it.
      "server-only": resolve(__dirname, "tests/stubs/server-only.ts"),
    },
  },
});

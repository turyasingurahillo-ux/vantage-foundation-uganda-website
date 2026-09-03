/**
 * Build-time schema migration + analytics registry seeding.
 *
 * Runs the idempotent schema in lib/db/schema.sql against whatever database the
 * build is configured for, so a deployment can never land on an environment
 * that is missing a table the deployed code needs. This matters for
 * `contact_messages` in particular: contact submissions are persisted there
 * before the notification email is attempted, so if the table is absent AND
 * SMTP is unconfigured, the form has no working delivery path at all.
 *
 * Also synchronizes the analytics_articles registry from currently published
 * stories (static manifest + DB) so the admin dashboard lists every trackable
 * article while retaining historical analytics for content that later becomes
 * inactive.
 *
 * DEPLOYMENT SAFETY: This script mutates the database (schema + registry
 * rows). For preview deployments it requires an explicit operator confirmation:
 *
 *   production                              → migrations allowed
 *   preview + PREVIEW_DATABASE_ISOLATED=true → migrations allowed
 *   preview without confirmation             → migrations refused
 *   local/CI (VERCEL_ENV unset)               → migrations allowed
 *
 * IMPORTANT: PREVIEW_DATABASE_ISOLATED=true is a safety/confirmation gate. The
 * boolean does not mathematically prove that DATABASE_URL is non-production.
 * Isolation must be established operationally by verifying that the Preview
 * DATABASE_URL points to the intended isolated database/branch. If the flag is
 * absent on a preview build, this script refuses to mutate any database.
 *
 * Deliberately NON-FATAL. A database blip must not break a deployment of a
 * mostly-static marketing site — the app already degrades gracefully when the
 * database is unreachable. Failures are logged loudly and the build continues.
 *
 * Skips silently when DATABASE_URL is unset (local builds, CI without secrets).
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

if (!process.env.DATABASE_URL) {
  console.log("[migrate] DATABASE_URL not set — skipping schema migration.");
  process.exit(0);
}

// OPERATOR CONFIRMATION GATE: preview builds are allowed to mutate the configured
// database only when PREVIEW_DATABASE_ISOLATED=true. The flag is not itself an
// isolation proof; operators must separately verify the Preview DATABASE_URL.
if (
  process.env.VERCEL_ENV === "preview" &&
  process.env.PREVIEW_DATABASE_ISOLATED !== "true"
) {
  console.warn(
    "[migrate] VERCEL_ENV=preview but PREVIEW_DATABASE_ISOLATED is not 'true'.\n" +
      "  Refusing to run schema migration or analytics registry seeding to " +
      "protect against accidental preview writes to an unconfirmed database.\n" +
      "  To enable preview migrations, set PREVIEW_DATABASE_ISOLATED=true in " +
      "the Vercel Preview environment only after verifying DATABASE_URL points " +
      "to the intended isolated preview database."
  );
  process.exit(0);
}

if (
  process.env.VERCEL_ENV === "preview" &&
  process.env.PREVIEW_DATABASE_ISOLATED === "true"
) {
  console.log(
    "[migrate] VERCEL_ENV=preview, PREVIEW_DATABASE_ISOLATED=true — " +
      "operator confirmation present; proceeding against the configured Preview DATABASE_URL."
  );
}

const result = spawnSync(
  process.execPath,
  [join(__dirname, "setup-db.mjs")],
  { stdio: "inherit" },
);

if (result.status !== 0) {
  console.warn(
    "[migrate] Schema migration did not complete. The build will continue, " +
      "but verify the database schema — contact form persistence may be " +
      "unavailable until it is applied.",
  );
}

// Synchronize the analytics registry after the schema is in place. Uses tsx to
// run the TypeScript script (which imports content modules).
const seedResult = spawnSync(
  "npx",
  ["tsx", join(__dirname, "seed-analytics-registry.ts")],
  { stdio: "inherit", shell: true },
);

if (seedResult.status !== 0) {
  console.warn(
    "[migrate] Analytics registry synchronization did not complete. The build " +
      "will continue; the script is designed to skip the inactive sweep when " +
      "the active-content snapshot cannot be completed safely.",
  );
}

process.exit(0);

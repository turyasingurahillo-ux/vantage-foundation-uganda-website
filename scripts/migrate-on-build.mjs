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
 * Also seeds the analytics_articles registry from all published stories
 * (static manifest + DB) so the admin dashboard lists every trackable article
 * from the first deployment.
 *
 * DEPLOYMENT SAFETY: This script mutates the database (schema + registry
 * rows). To prevent a preview build from accidentally mutating the production
 * database, the script uses an explicit isolation-confirmation flag:
 *
 *   production                        → migrations allowed
 *   preview + PREVIEW_DATABASE_ISOLATED=true  → migrations allowed (preview DB)
 *   preview without isolation flag    → migrations refused (safety skip)
 *   local/CI (VERCEL_ENV unset)       → migrations allowed (existing behavior)
 *
 * The PREVIEW_DATABASE_ISOLATED flag is set in the Vercel Preview environment
 * only, and only for branches whose DATABASE_URL points at an isolated Neon
 * preview branch — never the production database. If the flag is absent on a
 * preview build, the script refuses to migrate and logs a clear safety message.
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

// DEPLOYMENT SAFETY GATE: Prevent preview builds from mutating a database
// unless the deployment has explicitly confirmed it is using an isolated
// (non-production) database via PREVIEW_DATABASE_ISOLATED=true.
//
// Vercel sets VERCEL_ENV to "preview" for preview deployments. If that flag
// is present but PREVIEW_DATABASE_ISOLATED is not "true", the script refuses
// to migrate — this protects against accidental shared-DB configuration.
//
// Production builds ("production") and local/CI builds (VERCEL_ENV unset)
// always proceed normally.
if (
  process.env.VERCEL_ENV === "preview" &&
  process.env.PREVIEW_DATABASE_ISOLATED !== "true"
) {
  console.warn(
    "[migrate] VERCEL_ENV=preview but PREVIEW_DATABASE_ISOLATED is not 'true'.\n" +
      "  Refusing to run schema migration or analytics registry seeding to " +
      "protect against accidentally mutating a shared production database.\n" +
      "  To enable preview migrations, set PREVIEW_DATABASE_ISOLATED=true in " +
      "the Vercel Preview environment AND ensure DATABASE_URL points at an " +
      "isolated Neon preview branch — never the production database."
  );
  process.exit(0);
}

if (process.env.VERCEL_ENV === "preview" && process.env.PREVIEW_DATABASE_ISOLATED === "true") {
  console.log(
    "[migrate] VERCEL_ENV=preview, PREVIEW_DATABASE_ISOLATED=true — " +
      "proceeding with migration and seeding against the isolated preview database."
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

// Seed the analytics registry after the schema is in place. Uses tsx to run
// the TypeScript seeding script (which imports content modules).
const seedResult = spawnSync(
  "npx",
  ["tsx", join(__dirname, "seed-analytics-registry.ts")],
  { stdio: "inherit", shell: true },
);

if (seedResult.status !== 0) {
  console.warn(
    "[migrate] Analytics registry seeding did not complete. The build will " +
      "continue, but the analytics dashboard may not list all published " +
      "articles until the next successful build.",
  );
}

process.exit(0);

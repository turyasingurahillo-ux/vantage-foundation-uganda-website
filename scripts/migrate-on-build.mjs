/**
 * Build-time schema migration.
 *
 * Runs the idempotent schema in lib/db/schema.sql against whatever database the
 * build is configured for, so a deployment can never land on an environment
 * that is missing a table the deployed code needs. This matters for
 * `contact_messages` in particular: contact submissions are persisted there
 * before the notification email is attempted, so if the table is absent AND
 * SMTP is unconfigured, the form has no working delivery path at all.
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

process.exit(0);

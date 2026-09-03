import { neon } from "@neondatabase/serverless";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { splitSql } from "./split-sql.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function executeScript(sql, script, label) {
  for (const statement of splitSql(script)) {
    await sql.query(statement);
    console.log(`[${label}] Executed:`, statement.split("\n")[0].trim(), "...");
  }
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Error: DATABASE_URL is not set.");
    console.error(
      "Set it in your environment or in .env.local, then run this script again.",
    );
    process.exit(1);
  }

  const sql = neon(url);
  const schema = await readFile(
    join(__dirname, "..", "lib", "db", "schema.sql"),
    "utf8",
  );
  const analyticsLifecycle = await readFile(
    join(
      __dirname,
      "..",
      "lib",
      "db",
      "migrations",
      "phase2c-analytics-lifecycle.sql",
    ),
    "utf8",
  );
  const casePipeline = await readFile(
    join(
      __dirname,
      "..",
      "lib",
      "db",
      "migrations",
      "case-management-pipeline.sql",
    ),
    "utf8",
  );
  const orgPipeline = await readFile(
    join(
      __dirname,
      "..",
      "lib",
      "db",
      "migrations",
      "organisation-relationship-pipeline.sql",
    ),
    "utf8",
  );

  await executeScript(sql, schema, "schema");
  await executeScript(sql, analyticsLifecycle, "phase2c-analytics-lifecycle");
  await executeScript(sql, casePipeline, "case-management-pipeline");
  await executeScript(sql, orgPipeline, "organisation-relationship-pipeline");

  console.log("Database setup complete.");
}

main().catch((error) => {
  console.error("Setup failed:", error);
  process.exit(1);
});

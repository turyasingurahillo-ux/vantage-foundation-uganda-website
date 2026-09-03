import { neon } from "@neondatabase/serverless";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { splitSql } from "./split-sql.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Error: DATABASE_URL is not set.");
    console.error("Set it in your environment or in .env.local, then run this script again.");
    process.exit(1);
  }

  const sql = neon(url);
  const schema = await readFile(join(__dirname, "..", "lib", "db", "schema.sql"), "utf8");

  const statements = splitSql(schema);

  for (const statement of statements) {
    await sql.query(statement);
    console.log("Executed:", statement.split("\n")[0].trim(), "...");
  }

  console.log("Database setup complete.");
}

main().catch((error) => {
  console.error("Setup failed:", error);
  process.exit(1);
});

/**
 * Splits a SQL script into individual statements, respecting:
 * - Dollar-quoted blocks ($$ ... $$)
 * - Single-quoted strings (' ... ')
 * - Double-quoted identifiers (" ... ")
 * - Line comments (-- ... \n)
 *
 * Simple semicolon splitting breaks on DO $$ ... END $$ blocks.
 *
 * Extracted from setup-db.mjs so the test suite can apply lib/db/schema.sql
 * through the exact same splitter the deployment uses. A migration that only
 * works when a human pastes it into a SQL console is not a migration.
 */
export function splitSql(sql) {
  const statements = [];
  let current = "";
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inLineComment = false;
  let dollarTag = null;

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    const next = sql[i + 1] ?? "";

    // Handle line comments (-- ... \n). Must be checked before the semicolon
    // branch so that semicolons inside comments don't trigger a split.
    if (inLineComment) {
      current += ch;
      if (ch === "\n") {
        inLineComment = false;
      }
      continue;
    }
    if (ch === "-" && next === "-" && !inSingleQuote && !inDoubleQuote && dollarTag === null) {
      inLineComment = true;
      current += ch;
      continue;
    }

    current += ch;

    if (dollarTag !== null) {
      // Inside a dollar-quoted block; look for the closing $tag$.
      if (ch === "$") {
        const rest = sql.slice(i);
        if (rest.startsWith(dollarTag)) {
          current += sql.slice(i + 1, i + dollarTag.length);
          i += dollarTag.length - 1;
          dollarTag = null;
        }
      }
      continue;
    }

    if (ch === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
    } else if (ch === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
    } else if (ch === "$" && !inSingleQuote && !inDoubleQuote) {
      // Check for dollar-quote start: $tag$
      const match = sql.slice(i).match(/^\$(\w*)\$/);
      if (match) {
        dollarTag = match[0];
        current += sql.slice(i + 1, i + match[0].length);
        i += match[0].length - 1;
      }
    } else if (ch === ";" && !inSingleQuote && !inDoubleQuote) {
      // End of statement.
      const trimmed = current.trim();
      if (trimmed.length > 0) {
        statements.push(trimmed);
      }
      current = "";
    }
  }

  const trimmed = current.trim();
  if (trimmed.length > 0) {
    statements.push(trimmed);
  }

  return statements;
}

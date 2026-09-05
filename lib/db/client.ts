import { neon } from "@neondatabase/serverless";

/**
 * The SQL handle used by the contact-inbox queries.
 *
 * Previously each module built its own `neon(DATABASE_URL)` inline. That is
 * fine in production but leaves the queries themselves untestable: the inbox's
 * hardest behaviour — archive semantics, activity ordering, idempotency
 * scoping — lives in SQL, not in TypeScript, so asserting it requires running
 * the real statements against a real PostgreSQL.
 *
 * Routing them through one accessor lets the test suite point them at an
 * in-process PostgreSQL (PGlite) that has been migrated with the very same
 * lib/db/schema.sql the deployment applies. Production behaviour is unchanged:
 * with no override installed this is exactly the previous `neon()` call.
 */

/**
 * The subset of the Neon serverless driver these modules use: a tagged
 * template that returns plain row objects, plus the driver's `query()` escape
 * hatch for the one statement whose WHERE clause has to be shared between a
 * count and a page (numbered placeholders, parameters still bound).
 */
export type SqlClient = ((
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<Record<string, unknown>[]>) & {
  query: (
    text: string,
    params?: unknown[],
  ) => Promise<Record<string, unknown>[]>;
  /**
   * Escape hatch for embedding a raw SQL fragment (e.g. a shared column
   * list) into a tagged-template query. The caller is responsible for
   * ensuring the fragment contains no user-controlled input.
   */
  unsafe: (text: string) => { __unsafe_sql: string };
};

let override: SqlClient | null = null;

export function getSql(): SqlClient {
  if (override) return override;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }
  return neon(url) as unknown as SqlClient;
}

/**
 * Installs a stand-in SQL client. Test-only, and refuses to arm itself in a
 * production build so it cannot be reached from a deployed environment.
 */
export function setSqlClientForTests(client: SqlClient | null): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error("setSqlClientForTests is not available in production");
  }
  override = client;
}

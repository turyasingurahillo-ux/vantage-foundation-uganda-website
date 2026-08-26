/**
 * Database integration test helper.
 *
 * The Neon serverless driver uses HTTP fetch to Neon's cloud API and cannot
 * connect to a local PostgreSQL instance directly. To test the actual SQL
 * queries against a real PostgreSQL, we mock the `@neondatabase/serverless`
 * module so that `neon()` returns a `pg`-backed tagged template function.
 *
 * Requirements:
 *   - PostgreSQL running locally (default: localhost:5432)
 *   - INTEGRATION_TEST=1 environment variable
 *   - INTEGRATION_DATABASE_URL pointing to a migrated test database
 *
 * Run with:
 *   INTEGRATION_TEST=1 npx vitest run tests/integration/
 */

import { Pool } from "pg";
import type { QueryResult } from "pg";
import { describe } from "vitest";

export const TEST_DATABASE_URL =
  process.env.INTEGRATION_DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/vantage_test";

export const shouldRunIntegrationTests = process.env.INTEGRATION_TEST === "1";

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: TEST_DATABASE_URL,
      max: 5,
    });
  }
  return pool;
}

/**
 * A Neon-compatible tagged template function backed by `pg`.
 */
function createPgSqlClient() {
  const sqlFn = function (
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<Record<string, unknown>[]> {
    let text = "";
    const params: unknown[] = [];
    for (let i = 0; i < strings.length; i++) {
      text += strings[i];
      if (i < values.length) {
        const val = values[i];
        if (val && typeof val === "object" && "__unsafe_sql" in val) {
          text += (val as { __unsafe_sql: string }).__unsafe_sql;
        } else {
          params.push(val);
          text += `$${params.length}`;
        }
      }
    }
    return getPool()
      .query(text, params as never)
      .then((r: QueryResult) => r.rows);
  };

  (sqlFn as unknown as { unsafe: (text: string) => { __unsafe_sql: string } }).unsafe = (
    text: string,
  ) => ({ __unsafe_sql: text });

  (sqlFn as unknown as { query: (text: string, params: unknown[]) => Promise<Record<string, unknown>[]> }).query = (
    text: string,
    params: unknown[],
  ) =>
    getPool()
      .query(text, params as never)
      .then((r) => r.rows);

  return sqlFn as unknown as ReturnType<
    typeof import("@neondatabase/serverless")["neon"]
  >;
}

/**
 * Creates the mock factory for vi.mock.
 * Must be self-contained (no external variable references).
 */
export function getNeonMockFactory() {
  return () => {
    // Re-import pg inside the factory to avoid hoisting issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require("pg") as typeof import("pg");
    const dbUrl =
      process.env.INTEGRATION_DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5432/vantage_test";

    const p = new Pool({ connectionString: dbUrl, max: 5 });

    const sqlFn = function (
      strings: TemplateStringsArray,
      ...values: unknown[]
    ): Promise<Record<string, unknown>[]> {
      let text = "";
      const params: unknown[] = [];
      for (let i = 0; i < strings.length; i++) {
        text += strings[i];
        if (i < values.length) {
          const val = values[i];
          if (val && typeof val === "object" && "__unsafe_sql" in val) {
            text += (val as { __unsafe_sql: string }).__unsafe_sql;
          } else {
            params.push(val);
            text += `$${params.length}`;
          }
        }
      }
      return p.query(text, params as never).then((r) => r.rows);
    };

    (sqlFn as unknown as { unsafe: (text: string) => unknown }).unsafe = (
      text: string,
    ) => ({ __unsafe_sql: text });

    (sqlFn as unknown as { query: (text: string, params: unknown[]) => Promise<Record<string, unknown>[]> }).query = (
      text: string,
      params: unknown[],
    ) => p.query(text, params as never).then((r) => r.rows);

    return { neon: () => sqlFn };
  };
}

/**
 * Skips a test suite when integration tests are not enabled.
 */
export const describeIntegration = shouldRunIntegrationTests
  ? describe
  : describe.skip;

/**
 * Cleans all case-management tables before each test.
 */
export async function cleanCaseTables() {
  const sql = createPgSqlClient();
  await sql`DELETE FROM case_referrals`;
  await sql`DELETE FROM case_communications`;
  await sql`DELETE FROM case_decisions`;
  await sql`DELETE FROM case_actions`;
  await sql`DELETE FROM case_notes`;
  await sql`DELETE FROM due_diligence_checks`;
  await sql`DELETE FROM inbound_email_log`;
  await sql`DELETE FROM contact_message_replies`;
  await sql`DELETE FROM persons`;
  await sql`DELETE FROM organisations`;
  await sql`DELETE FROM contact_messages`;
}

/**
 * Inserts a minimal contact_messages row and returns the id.
 */
export async function insertTestCase(
  overrides: Record<string, unknown> = {},
): Promise<number> {
  const sql = createPgSqlClient();
  const defaults: Record<string, unknown> = {
    name: "Test Person",
    email: "test@example.com",
    phone: null,
    organisation: null,
    category: "general",
    message: "Test message",
    email_sent: false,
    status: "new",
    workflow_status: "new",
    source: "website_form",
    priority: "normal",
    risk_level: "unknown",
    strategic_value: "unknown",
  };
  const row = { ...defaults, ...overrides };

  const cols: string[] = [
    "name", "email", "phone", "organisation", "category", "message",
    "email_sent", "status", "workflow_status", "source",
    "priority", "risk_level", "strategic_value",
  ];
  const vals: unknown[] = [
    row.name, row.email, row.phone, row.organisation, row.category, row.message,
    row.email_sent, row.status, row.workflow_status, row.source,
    row.priority, row.risk_level, row.strategic_value,
  ];

  for (const optCol of ["received_at", "first_response_at", "case_type", "closed_at", "triaged_at"]) {
    if (overrides[optCol] !== undefined) {
      cols.push(optCol);
      vals.push(overrides[optCol]);
    }
  }

  const placeholders = vals.map((_, i) => `$${i + 1}`).join(", ");
  const colList = cols.join(", ");
  const rows = (await sql.query(
    `INSERT INTO contact_messages (${colList}) VALUES (${placeholders}) RETURNING id`,
    vals,
  )) as Record<string, unknown>[];
  return Number(rows[0].id);
}

/**
 * Closes the connection pool after all tests.
 */
export async function closeTestPool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

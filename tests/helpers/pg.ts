import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { splitSql } from "../../scripts/split-sql.mjs";
import { setSqlClientForTests, type SqlClient } from "@/lib/db/client";

/**
 * A real PostgreSQL for the inbox tests.
 *
 * The behaviour this pull request is meant to fix lives in SQL, not in
 * TypeScript: whether archiving preserves the response state, whether a page
 * of results excludes archived rows, whether an idempotency key can resolve to
 * another conversation's reply. A hand-written fake would only ever assert
 * what the fake was written to do. PGlite is genuine PostgreSQL compiled to
 * WebAssembly, so these run the actual statements.
 *
 * The schema is applied from lib/db/schema.sql and all migration files
 * through the same splitter scripts/setup-db.mjs uses, which means the tests
 * also exercise the migration path itself rather than a transcription of it.
 */

const MIGRATIONS_DIR = resolve(__dirname, "../../lib/db/migrations");

/** All migration files in the same order setup-db.mjs applies them. */
const MIGRATION_FILES = [
  resolve(MIGRATIONS_DIR, "phase2c-analytics-lifecycle.sql"),
  resolve(MIGRATIONS_DIR, "case-management-pipeline.sql"),
  resolve(MIGRATIONS_DIR, "organisation-relationship-pipeline.sql"),
  resolve(
    MIGRATIONS_DIR,
    "fix-workflow-status-constraint-collision.sql",
  ),
];

const SCHEMA_PATH = resolve(__dirname, "../../lib/db/schema.sql");

/** Adapts PGlite to the Neon serverless driver's shape. */
function adapt(db: PGlite): SqlClient {
  const tagged = async (
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<Record<string, unknown>[]> => {
    // Neon's tagged template binds every interpolated value as a parameter.
    // Rebuild the same statement with $1..$n placeholders.
    const text = strings.reduce(
      (acc, part, i) => acc + part + (i < values.length ? `$${i + 1}` : ""),
      "",
    );
    const result = await db.query(text, values as unknown[]);
    return result.rows as Record<string, unknown>[];
  };

  const client = tagged as SqlClient;
  client.query = async (text: string, params: unknown[] = []) => {
    const result = await db.query(text, params);
    return result.rows as Record<string, unknown>[];
  };
  return client;
}

export interface TestDatabase {
  sql: SqlClient;
  db: PGlite;
  /** Applies lib/db/schema.sql + all migrations once more; proves idempotency. */
  applySchema(): Promise<void>;
  close(): Promise<void>;
}

/**
 * Creates a test database with schema.sql and all migration files applied,
 * in the same order as setup-db.mjs.
 */
export async function createTestDatabase(): Promise<TestDatabase> {
  const db = await new PGlite();

  const allStatements: string[] = [];
  const schema = await readFile(SCHEMA_PATH, "utf8");
  allStatements.push(...splitSql(schema));
  for (const file of MIGRATION_FILES) {
    const sql = await readFile(file, "utf8");
    allStatements.push(...splitSql(sql));
  }

  const applySchema = async () => {
    for (const statement of allStatements) {
      await db.exec(statement);
    }
  };

  await applySchema();

  const sql = adapt(db);
  setSqlClientForTests(sql);

  return {
    sql,
    db,
    applySchema,
    async close() {
      setSqlClientForTests(null);
      await db.close();
    },
  };
}

/**
 * Creates a test database with ONLY schema.sql applied (no migrations).
 * Used to test migration behaviour against a freshly-created schema.
 */
export async function createBareTestDatabase(): Promise<TestDatabase> {
  const db = await new PGlite();
  const schema = await readFile(SCHEMA_PATH, "utf8");
  const statements = splitSql(schema);

  const applySchema = async () => {
    for (const statement of statements) {
      await db.exec(statement);
    }
  };

  await applySchema();

  const sql = adapt(db);
  setSqlClientForTests(sql);

  return {
    sql,
    db,
    applySchema,
    async close() {
      setSqlClientForTests(null);
      await db.close();
    },
  };
}

/**
 * Applies a single migration file to an existing test database.
 * Used to test migrations in isolation.
 */
export async function applyMigrationFile(
  db: PGlite,
  filename: string,
): Promise<void> {
  const path = resolve(MIGRATIONS_DIR, filename);
  const sql = await readFile(path, "utf8");
  for (const statement of splitSql(sql)) {
    await db.exec(statement);
  }
}

/** Inserts a submission, optionally backdated, and returns its id. */
export async function seedMessage(
  sql: SqlClient,
  overrides: {
    name?: string;
    email?: string;
    organisation?: string | null;
    category?: string;
    message?: string;
    createdAt?: Date;
    status?: string;
    archivedAt?: Date | null;
    lastRepliedAt?: Date | null;
    lastActivityAt?: Date;
  } = {},
): Promise<number> {
  const createdAt = overrides.createdAt ?? new Date();
  const rows = await sql.query(
    `INSERT INTO contact_messages
       (name, email, organisation, category, message, created_at, status,
        archived_at, last_replied_at, last_activity_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id`,
    [
      overrides.name ?? "Test Person",
      overrides.email ?? "test.person@example.invalid",
      overrides.organisation ?? null,
      overrides.category ?? "general",
      overrides.message ?? "I would like to know more about your programmes.",
      createdAt,
      overrides.status ?? "new",
      overrides.archivedAt ?? null,
      overrides.lastRepliedAt ?? null,
      overrides.lastActivityAt ?? createdAt,
    ],
  );
  return Number(rows[0].id);
}

/** Inserts a reply row directly, for setting up states the API would reach. */
export async function seedReply(
  sql: SqlClient,
  messageId: number,
  overrides: {
    body?: string;
    sendStatus?: "pending" | "sent" | "failed";
    idempotencyKey?: string;
    createdAt?: Date;
    sentAt?: Date | null;
    recipientEmail?: string;
    providerMessageId?: string | null;
    retryOfReplyId?: number | null;
  } = {},
): Promise<number> {
  const rows = await sql.query(
    `INSERT INTO contact_message_replies
       (message_id, direction, body, recipient_email, idempotency_key,
        send_status, created_at, sent_at, provider_message_id,
        retry_of_reply_id)
     VALUES ($1, 'outbound', $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id`,
    [
      messageId,
      overrides.body ?? "Thank you for getting in touch.",
      overrides.recipientEmail ?? "test.person@example.invalid",
      overrides.idempotencyKey ?? `key-${messageId}-${Math.random()}`,
      overrides.sendStatus ?? "sent",
      overrides.createdAt ?? new Date(),
      overrides.sentAt ?? null,
      overrides.providerMessageId ?? null,
      overrides.retryOfReplyId ?? null,
    ],
  );
  return Number(rows[0].id);
}

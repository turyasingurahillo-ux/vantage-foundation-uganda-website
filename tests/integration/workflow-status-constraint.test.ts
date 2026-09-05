// @vitest-environment node
/**
 * Regression tests for the workflow_status CHECK constraint collision fix.
 *
 * These tests verify:
 *   1. Fresh database setup: both constraints exist on the correct columns.
 *   2. Migration of an existing schema affected by the collision: the fix
 *      migration correctly renames/drops the misnamed constraint and adds
 *      the correct one.
 *   3. Repeated migration execution (idempotency): re-running the fix
 *      migration is a no-op.
 *   4. Rejection of an invalid workflow_status: the constraint prevents
 *      invalid values from being inserted.
 *   5. Acceptance of every valid workflow status: all 13 enum values are
 *      accepted by the constraint.
 *
 * These tests use PGlite (real PostgreSQL compiled to WebAssembly) so they
 * exercise the actual SQL statements, not a mock. The Node environment is
 * required because PGlite uses Node's Buffer/ArrayBuffer APIs.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { splitSql } from "../../scripts/split-sql.mjs";

const MIGRATIONS_DIR = resolve(__dirname, "../../lib/db/migrations");
const SCHEMA_PATH = resolve(__dirname, "../../lib/db/schema.sql");

async function execFile(db: PGlite, path: string): Promise<void> {
  const sql = await readFile(path, "utf8");
  for (const statement of splitSql(sql)) {
    await db.exec(statement);
  }
}

async function execFileByName(db: PGlite, filename: string): Promise<void> {
  await execFile(db, resolve(MIGRATIONS_DIR, filename));
}

/**
 * Checks whether a named CHECK constraint exists on a specific column of
 * contact_messages. Queries pg_constraint joined with pg_attribute, the
 * same way the migration does — so the test verifies the same thing the
 * migration checks.
 */
async function constraintOnColumn(
  db: PGlite,
  constraintName: string,
  columnName: string,
): Promise<boolean> {
  const result = await db.query<{
    exists: boolean;
  }>(
    `SELECT EXISTS (
       SELECT 1
       FROM pg_constraint c
       JOIN pg_class t ON t.oid = c.conrelid
       JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY (c.conkey)
       WHERE c.conname = $1
         AND t.relname = 'contact_messages'
         AND a.attname = $2
     ) AS exists`,
    [constraintName, columnName],
  );
  return Boolean(result.rows[0]?.exists);
}

/**
 * Inserts a contact_messages row with a specific workflow_status value.
 * Returns without throwing if the insert succeeds; throws if the constraint
 * rejects it.
 */
async function insertWithWorkflowStatus(
  db: PGlite,
  workflowStatus: string,
): Promise<void> {
  await db.query(
    `INSERT INTO contact_messages (name, email, category, message, status, workflow_status)
     VALUES ('Test', 'test@example.invalid', 'general', 'test message', 'new', $1)`,
    [workflowStatus],
  );
}

const VALID_WORKFLOW_STATUSES = [
  "new",
  "triage",
  "awaiting_vantage",
  "awaiting_external",
  "under_review",
  "due_diligence",
  "meeting_scheduled",
  "decision_required",
  "accepted",
  "referred",
  "declined",
  "completed",
  "archived",
];

describe("workflow_status CHECK constraint collision fix", () => {
  let db: PGlite;

  beforeEach(async () => {
    db = await new PGlite();
  });

  afterEach(async () => {
    await db.close();
  });

  // -------------------------------------------------------------------------
  // 1. Fresh database setup
  // -------------------------------------------------------------------------
  describe("fresh database setup (schema + all migrations)", () => {
    beforeEach(async () => {
      await execFile(db, SCHEMA_PATH);
      await execFileByName(db, "phase2c-analytics-lifecycle.sql");
      await execFileByName(db, "case-management-pipeline.sql");
      await execFileByName(db, "organisation-relationship-pipeline.sql");
      await execFileByName(
        db,
        "fix-workflow-status-constraint-collision.sql",
      );
    });

    it("creates contact_messages_status_values on the `status` column", async () => {
      expect(
        await constraintOnColumn(db, "contact_messages_status_values", "status"),
      ).toBe(true);
    });

    it("creates contact_messages_workflow_status_values on the `workflow_status` column", async () => {
      expect(
        await constraintOnColumn(
          db,
          "contact_messages_workflow_status_values",
          "workflow_status",
        ),
      ).toBe(true);
    });

    it("does NOT have contact_messages_workflow_status_values on the `status` column", async () => {
      expect(
        await constraintOnColumn(
          db,
          "contact_messages_workflow_status_values",
          "status",
        ),
      ).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // 2. Migration of an existing schema affected by the collision
  // -------------------------------------------------------------------------
  describe("migrating a database with the collision", () => {
    // Simulate the collision state that existing production databases have:
    //   - schema.sql (old version) created contact_messages_workflow_status_values
    //     on the `status` column
    //   - case-management-pipeline.sql (old guard) saw the name existed and
    //     skipped creating the workflow_status constraint
    //   - Result: workflow_status column exists but has no CHECK constraint
    //
    // We simulate this by:
    //   1. Applying schema.sql (fixed version creates contact_messages_status_values)
    //   2. Applying case-management-pipeline.sql (creates workflow_status column
    //      and contact_messages_workflow_status_values on workflow_status)
    //   3. Dropping both constraints and re-adding the misnamed one on `status`
    //      to simulate the collision state
    beforeEach(async () => {
      await execFile(db, SCHEMA_PATH);
      await execFileByName(db, "case-management-pipeline.sql");
      // Simulate the collision: drop the correct constraints and re-add
      // the misnamed one on `status`, exactly as the original buggy
      // schema.sql did. The workflow_status column exists but has no CHECK.
      await db.exec(`
        ALTER TABLE contact_messages
          DROP CONSTRAINT IF EXISTS contact_messages_status_values;
        ALTER TABLE contact_messages
          DROP CONSTRAINT IF EXISTS contact_messages_workflow_status_values;
        ALTER TABLE contact_messages
          ADD CONSTRAINT contact_messages_workflow_status_values
          CHECK (status IN ('new', 'awaiting_response', 'replied'));
      `);
    });

    it("confirms the collision state: constraint name is on `status`, not `workflow_status`", async () => {
      expect(
        await constraintOnColumn(
          db,
          "contact_messages_workflow_status_values",
          "status",
        ),
      ).toBe(true);
      expect(
        await constraintOnColumn(
          db,
          "contact_messages_workflow_status_values",
          "workflow_status",
        ),
      ).toBe(false);
    });

    it("case-management-pipeline guard alone cannot fix the collision (name is taken)", async () => {
      // The fixed guard in case-management-pipeline.sql correctly detects
      // the constraint is NOT on workflow_status. But ADD CONSTRAINT fails
      // because the name contact_messages_workflow_status_values already
      // exists on `status`. The fix migration is required to free the name.
      await expect(
        execFileByName(db, "case-management-pipeline.sql"),
      ).rejects.toThrow(/already exists/i);
    });

    it("fix migration renames the misnamed constraint and adds the correct one", async () => {
      // Apply the fix migration — this should:
      // 1. Rename contact_messages_workflow_status_values (on `status`)
      //    to contact_messages_status_values
      // 2. Add contact_messages_workflow_status_values on `workflow_status`
      await execFileByName(
        db,
        "fix-workflow-status-constraint-collision.sql",
      );

      // The misnamed constraint on `status` should be renamed to
      // contact_messages_status_values
      expect(
        await constraintOnColumn(
          db,
          "contact_messages_status_values",
          "status",
        ),
      ).toBe(true);
      // The workflow_status constraint should now exist on the correct column
      expect(
        await constraintOnColumn(
          db,
          "contact_messages_workflow_status_values",
          "workflow_status",
        ),
      ).toBe(true);
      // The misnamed constraint should no longer be on `status`
      expect(
        await constraintOnColumn(
          db,
          "contact_messages_workflow_status_values",
          "status",
        ),
      ).toBe(false);
    });

    it("fix migration then re-running case-management-pipeline is idempotent", async () => {
      // After the fix migration frees the name and creates the correct
      // constraint, re-running case-management-pipeline.sql should be a
      // no-op (its guard sees the constraint on the correct column).
      await execFileByName(
        db,
        "fix-workflow-status-constraint-collision.sql",
      );
      await expect(
        execFileByName(db, "case-management-pipeline.sql"),
      ).resolves.toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // 3. Idempotency — re-running the fix migration is a no-op
  // -------------------------------------------------------------------------
  describe("idempotency", () => {
    beforeEach(async () => {
      await execFile(db, SCHEMA_PATH);
      await execFileByName(db, "case-management-pipeline.sql");
      await execFileByName(
        db,
        "fix-workflow-status-constraint-collision.sql",
      );
    });

    it("re-running the fix migration does not error", async () => {
      // Should not throw
      await execFileByName(
        db,
        "fix-workflow-status-constraint-collision.sql",
      );
    });

    it("re-running the fix migration preserves the constraints", async () => {
      await execFileByName(
        db,
        "fix-workflow-status-constraint-collision.sql",
      );
      expect(
        await constraintOnColumn(
          db,
          "contact_messages_workflow_status_values",
          "workflow_status",
        ),
      ).toBe(true);
      expect(
        await constraintOnColumn(db, "contact_messages_status_values", "status"),
      ).toBe(true);
    });

    it("re-running all migrations (full setup-db) is idempotent", async () => {
      // Apply everything again
      await execFile(db, SCHEMA_PATH);
      await execFileByName(db, "phase2c-analytics-lifecycle.sql");
      await execFileByName(db, "case-management-pipeline.sql");
      await execFileByName(db, "organisation-relationship-pipeline.sql");
      await execFileByName(
        db,
        "fix-workflow-status-constraint-collision.sql",
      );

      expect(
        await constraintOnColumn(
          db,
          "contact_messages_workflow_status_values",
          "workflow_status",
        ),
      ).toBe(true);
      expect(
        await constraintOnColumn(db, "contact_messages_status_values", "status"),
      ).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // 4. Rejection of an invalid workflow_status
  // -------------------------------------------------------------------------
  describe("rejection of invalid workflow_status values", () => {
    beforeEach(async () => {
      await execFile(db, SCHEMA_PATH);
      await execFileByName(db, "case-management-pipeline.sql");
      await execFileByName(
        db,
        "fix-workflow-status-constraint-collision.sql",
      );
    });

    it("rejects a completely invalid workflow_status", async () => {
      await expect(
        insertWithWorkflowStatus(db, "not_a_real_status"),
      ).rejects.toThrow();
    });

    it("rejects an empty string workflow_status", async () => {
      await expect(insertWithWorkflowStatus(db, "")).rejects.toThrow();
    });

    it("rejects a typo of a valid status", async () => {
      await expect(
        insertWithWorkflowStatus(db, "awaiting_vantge"),
      ).rejects.toThrow();
    });
  });

  // -------------------------------------------------------------------------
  // 5. Acceptance of every valid workflow status
  // -------------------------------------------------------------------------
  describe("acceptance of all valid workflow statuses", () => {
    beforeEach(async () => {
      await execFile(db, SCHEMA_PATH);
      await execFileByName(db, "case-management-pipeline.sql");
      await execFileByName(
        db,
        "fix-workflow-status-constraint-collision.sql",
      );
    });

    for (const status of VALID_WORKFLOW_STATUSES) {
      it(`accepts workflow_status = '${status}'`, async () => {
        await expect(
          insertWithWorkflowStatus(db, status),
        ).resolves.toBeUndefined();
      });
    }
  });

  // -------------------------------------------------------------------------
  // 6. Data validation guard — migration refuses to add constraint if
  //    invalid data exists
  // -------------------------------------------------------------------------
  describe("data validation guard", () => {
    it("migration raises an exception if invalid workflow_status data exists", async () => {
      // Set up a database with the collision state. We need the
      // workflow_status column to exist, so we apply schema.sql +
      // case-management-pipeline.sql first, then simulate the collision.
      await execFile(db, SCHEMA_PATH);
      await execFileByName(db, "case-management-pipeline.sql");
      await db.exec(`
        ALTER TABLE contact_messages
          DROP CONSTRAINT IF EXISTS contact_messages_status_values;
        ALTER TABLE contact_messages
          DROP CONSTRAINT IF EXISTS contact_messages_workflow_status_values;
        ALTER TABLE contact_messages
          ADD CONSTRAINT contact_messages_workflow_status_values
          CHECK (status IN ('new', 'awaiting_response', 'replied'));
      `);

      // Insert a row with an invalid workflow_status. This is possible
      // because the workflow_status column has no CHECK constraint (that's
      // the collision bug). The column has a NOT NULL DEFAULT 'new' but
      // no CHECK, so any text value is accepted.
      await db.exec(`
        INSERT INTO contact_messages (name, email, category, message, status, workflow_status)
        VALUES ('Bad', 'bad@example.invalid', 'general', 'test', 'new', 'corrupted_value')
      `);

      // The fix migration should detect the invalid data and raise an
      // exception rather than silently failing or modifying the data.
      await expect(
        execFileByName(db, "fix-workflow-status-constraint-collision.sql"),
      ).rejects.toThrow(/invalid workflow_status values/i);
    });

    it("migration succeeds when all workflow_status data is valid", async () => {
      await execFile(db, SCHEMA_PATH);
      await execFileByName(db, "case-management-pipeline.sql");
      await db.exec(`
        ALTER TABLE contact_messages
          DROP CONSTRAINT IF EXISTS contact_messages_status_values;
        ALTER TABLE contact_messages
          DROP CONSTRAINT IF EXISTS contact_messages_workflow_status_values;
        ALTER TABLE contact_messages
          ADD CONSTRAINT contact_messages_workflow_status_values
          CHECK (status IN ('new', 'awaiting_response', 'replied'));
      `);

      // Insert rows with valid workflow_status values
      for (const status of VALID_WORKFLOW_STATUSES) {
        await db.query(
          `INSERT INTO contact_messages (name, email, category, message, status, workflow_status)
           VALUES ($1, $2, 'general', 'test', 'new', $3)`,
          [`Test-${status}`, `${status}@example.invalid`, status],
        );
      }

      // The fix migration should succeed
      await expect(
        execFileByName(db, "fix-workflow-status-constraint-collision.sql"),
      ).resolves.toBeUndefined();

      // And the constraint should now exist
      expect(
        await constraintOnColumn(
          db,
          "contact_messages_workflow_status_values",
          "workflow_status",
        ),
      ).toBe(true);
    });
  });
});

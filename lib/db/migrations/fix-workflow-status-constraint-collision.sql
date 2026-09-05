-- Forward migration: fix the constraint-name collision that left
-- contact_messages.workflow_status without a CHECK constraint.
--
-- Background: both lib/db/schema.sql and case-management-pipeline.sql
-- originally created a constraint named contact_messages_workflow_status_values.
-- schema.sql created it on the `status` column; case-management-pipeline.sql
-- intended to create it on the `workflow_status` column. Because schema.sql
-- runs first and the guard in case-management-pipeline.sql only checked the
-- constraint name (not the column), the workflow_status constraint was
-- silently skipped on every database that ran both migrations.
--
-- This migration is a safety net for databases that already have the
-- collision. It:
--   1. If a constraint named contact_messages_workflow_status_values exists
--      on the `status` column (the collision), renames or drops it to free
--      the name.
--   2. Checks whether the intended CHECK constraint on workflow_status
--      exists AND is attached to the correct column.
--   3. Verifies existing data contains no invalid workflow_status values.
--      If invalid rows are found, raises an exception so the operator can
--      investigate rather than silently failing.
--   4. Adds the constraint if absent.
--
-- This migration is idempotent — safe to re-run. It does not drop or
-- recreate the table, and preserves all existing data.
--
-- It runs AFTER schema.sql, case-management-pipeline.sql, and
-- organisation-relationship-pipeline.sql in setup-db.mjs, so on a fresh
-- database the constraint is already correctly created and this migration
-- is a no-op. On an existing database with the collision, schema.sql's
-- updated block will have already cleaned up the misnamed constraint, and
-- case-management-pipeline.sql's updated guard will have created the
-- correct one. This migration is the belt-and-braces guarantee that the
-- constraint exists even if only this file is run against a collided
-- database.

-- ---------------------------------------------------------------------------
-- Step 1: Free the constraint name if it is on the wrong column.
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  -- If a constraint named contact_messages_workflow_status_values exists
  -- on the `status` column (the collision), rename it to
  -- contact_messages_status_values (or drop it if that name is already
  -- taken). This frees the name for the legitimate workflow_status
  -- constraint. We verify the column to avoid touching a correctly-placed
  -- constraint on workflow_status.
  IF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY (c.conkey)
    WHERE c.conname = 'contact_messages_workflow_status_values'
      AND t.relname = 'contact_messages'
      AND a.attname = 'status'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'contact_messages_status_values'
    ) THEN
      ALTER TABLE contact_messages
        RENAME CONSTRAINT contact_messages_workflow_status_values
        TO contact_messages_status_values;
    ELSE
      -- The correct name already exists on `status`; just drop the
      -- misnamed duplicate.
      ALTER TABLE contact_messages
        DROP CONSTRAINT contact_messages_workflow_status_values;
    END IF;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Step 2: Add the workflow_status CHECK constraint if it does not exist.
--          Verify it is on the correct column, not just the name.
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  -- Check if the intended CHECK constraint on workflow_status exists AND
  -- is attached to the correct column. We do NOT rely on the constraint
  -- name alone — a constraint with the same name on a different column
  -- does not count.
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY (c.conkey)
    WHERE c.conname = 'contact_messages_workflow_status_values'
      AND t.relname = 'contact_messages'
      AND a.attname = 'workflow_status'
  ) THEN
    -- Before adding the constraint, verify no existing data would violate
    -- it. If invalid rows exist, raise an exception so the migration stops
    -- and the operator can investigate rather than silently failing or
    -- modifying data automatically.
    IF EXISTS (
      SELECT 1 FROM contact_messages
      WHERE workflow_status IS NOT NULL
        AND workflow_status NOT IN (
          'new', 'triage', 'awaiting_vantage', 'awaiting_external',
          'under_review', 'due_diligence', 'meeting_scheduled',
          'decision_required', 'accepted', 'referred', 'declined',
          'completed', 'archived'
        )
    ) THEN
      RAISE EXCEPTION
        'Cannot add workflow_status CHECK constraint: existing rows contain '
        'invalid workflow_status values. Investigate and correct before '
        're-running this migration.';
    END IF;

    ALTER TABLE contact_messages
      ADD CONSTRAINT contact_messages_workflow_status_values
      CHECK (workflow_status IN (
        'new', 'triage', 'awaiting_vantage', 'awaiting_external',
        'under_review', 'due_diligence', 'meeting_scheduled',
        'decision_required', 'accepted', 'referred', 'declined',
        'completed', 'archived'
      ));
  END IF;
END $$;

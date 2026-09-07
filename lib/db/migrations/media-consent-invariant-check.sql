-- Migration: add DB-level CHECK constraint enforcing the media consent invariant.
--
-- The invariant: a media row with published = true must NOT have consent = 'pending'.
-- This is defense-in-depth at the DB level. The application layer already enforces
-- this atomically in the UPDATE WHERE clause (lib/db/media.ts) and in the shared
-- assertConsentGate helper (app/api/admin/media/route.ts), but a CHECK constraint
-- ensures the invariant cannot be violated even by direct SQL access or a future
-- code path that bypasses the application check.
--
-- Idempotent: safe to re-run. Uses DO $$ to check whether the constraint already
-- exists before adding it.
--
-- IMPORTANT: if any existing rows violate the invariant (published = true AND
-- consent = 'pending'), this migration will fail. In that case, fix the offending
-- rows first:
--   UPDATE media_objects SET published = false WHERE published = true AND consent = 'pending';
-- Then re-run this migration.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'media_objects'
      AND constraint_name = 'media_published_consent'
      AND constraint_type = 'CHECK'
  ) THEN
    ALTER TABLE media_objects
      ADD CONSTRAINT media_published_consent
      CHECK (NOT (published = true AND consent = 'pending'));
  END IF;
END $$;

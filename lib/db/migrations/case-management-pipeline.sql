-- Case-management pipeline: upgrades contact_messages from a simple inbox
-- (new / awaiting_response / replied / archived) into a relationship and
-- case-management workflow.
--
-- Design principle (see docs/case-management-pipeline.md):
--   * Message delivery state and case workflow state are SEPARATE.
--     - The existing `status` column (new / awaiting_response / replied /
--       archived) is preserved as the MESSAGE/DELIVERY state: it records
--       whether an email reply has been sent to the enquirer. A successful
--       email reply sets `status = 'replied'` but does NOT complete the case.
--     - The new `workflow_status` column is the CASE state: it tracks the
--       underlying relationship/enquiry through triage, review, due
--       diligence, decision, acceptance, referral, decline, completion.
--   * All columns are additive (ADD COLUMN IF NOT EXISTS) and idempotent, so
--     this is safe to re-run on existing databases. Historical contact
--     messages remain accessible and map onto the new model with neutral
--     defaults (source = 'website_form', workflow_status = 'new').
--   * Manual intake (WhatsApp, phone, social media, referral, walk-in) creates
--     a contact_messages row with the appropriate `source`, reusing all
--     existing reply/note/audit infrastructure.
--
-- This migration is run by scripts/setup-db.mjs alongside schema.sql, and by
-- the prebuild migrate-on-build gate, so a deployment cannot land on a
-- database missing the case columns.

-- ---------------------------------------------------------------------------
-- Case workflow columns on contact_messages.
-- ---------------------------------------------------------------------------

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS workflow_status TEXT NOT NULL DEFAULT 'new';

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'website_form';

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS case_type TEXT;

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS programme TEXT;

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal';

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS risk_level TEXT NOT NULL DEFAULT 'unknown';

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS strategic_value TEXT NOT NULL DEFAULT 'unknown';

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS owner_id TEXT;

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS collaborators TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS next_action TEXT;

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS next_action_due_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS outcome TEXT;

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS decline_reason TEXT;

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS decline_detail TEXT;

-- Referral is a first-class outcome. A case may record one referral
-- opportunity (organisation, date, link, follow-up, outcome). Repeated
-- referrals can later be modelled via a case_referrals table (P4 follow-up);
-- these columns capture the current/primary referral without blocking that.
ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS referral_org TEXT;

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS referral_date DATE;

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS referral_link TEXT;

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS referral_followup_date DATE;

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS referral_outcome TEXT;

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS referral_detail TEXT;

-- SLA / response-time foundation (Part R). These timestamps let the system
-- compute received → first handled → first outbound response → closed, and
-- compare against configurable service standards, without hard-coding an SLA
-- engine now. handled_at already exists; first_response_at records the first
-- OUTBOUND reply, closed_at records case completion.
ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS first_response_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Due-diligence foundation (Part N, P4). Stored as JSONB so the level can be
-- proportional to the relationship (basic / standard / money) without a
-- fixed schema per level. The UI for full due-diligence checklists is a P4
-- follow-up; this column lets data be captured now without blocking later
-- structured tooling.
ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS due_diligence JSONB;

-- Optional link to a person/organisation record (P4 follow-up). Nullable so
-- existing and new cases work without the CRM tables; populated later when
-- person/organisation memory is introduced.
ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS person_id INTEGER;

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS organisation_id INTEGER;

-- ---------------------------------------------------------------------------
-- Constraints. Added separately (and guarded) because ADD CONSTRAINT has no
-- IF NOT EXISTS in PostgreSQL.
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  -- Verify the constraint exists AND is attached to the workflow_status
  -- column, not just that the name exists. This prevents the collision
  -- where a constraint with the same name on the `status` column would
  -- silently block this one from being created.
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY (c.conkey)
    WHERE c.conname = 'contact_messages_workflow_status_values'
      AND t.relname = 'contact_messages'
      AND a.attname = 'workflow_status'
  ) THEN
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contact_messages_source_values'
  ) THEN
    ALTER TABLE contact_messages
      ADD CONSTRAINT contact_messages_source_values
      CHECK (source IN (
        'website_form', 'whatsapp', 'email', 'phone',
        'social_media', 'referral', 'walk_in', 'other'
      ));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contact_messages_priority_values'
  ) THEN
    ALTER TABLE contact_messages
      ADD CONSTRAINT contact_messages_priority_values
      CHECK (priority IN ('critical', 'high', 'normal', 'low'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contact_messages_risk_level_values'
  ) THEN
    ALTER TABLE contact_messages
      ADD CONSTRAINT contact_messages_risk_level_values
      CHECK (risk_level IN ('high', 'medium', 'low', 'unknown'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contact_messages_strategic_value_values'
  ) THEN
    ALTER TABLE contact_messages
      ADD CONSTRAINT contact_messages_strategic_value_values
      CHECK (strategic_value IN ('high', 'medium', 'low', 'unknown'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contact_messages_outcome_values'
  ) THEN
    ALTER TABLE contact_messages
      ADD CONSTRAINT contact_messages_outcome_values
      CHECK (outcome IS NULL OR outcome IN (
        'accepted', 'explore_further', 'information_requested',
        'referred', 'declined', 'no_response_required', 'completed'
      ));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contact_messages_referral_outcome_values'
  ) THEN
    ALTER TABLE contact_messages
      ADD CONSTRAINT contact_messages_referral_outcome_values
      CHECK (referral_outcome IS NULL OR referral_outcome IN (
        'applied', 'not_applied', 'accepted', 'rejected',
        'unknown', 'not_eligible'
      ));
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Indexes for the case workspace filters and dashboard counts.
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_contact_messages_workflow_status
  ON contact_messages(workflow_status);

CREATE INDEX IF NOT EXISTS idx_contact_messages_source
  ON contact_messages(source);

CREATE INDEX IF NOT EXISTS idx_contact_messages_case_type
  ON contact_messages(case_type);

CREATE INDEX IF NOT EXISTS idx_contact_messages_owner_id
  ON contact_messages(owner_id);

CREATE INDEX IF NOT EXISTS idx_contact_messages_priority
  ON contact_messages(priority);

CREATE INDEX IF NOT EXISTS idx_contact_messages_next_action_due_at
  ON contact_messages(next_action_due_at)
  WHERE next_action_due_at IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_contact_messages_risk_level
  ON contact_messages(risk_level);

-- ---------------------------------------------------------------------------
-- case_notes: internal notes attached to a case.
--
-- Internal notes are NEVER emailed to the enquirer and NEVER exposed
-- publicly. They are structurally separate from contact_message_replies
-- (which are outward-facing correspondence) so there is no code path that
-- can accidentally send a note as an email. Each note carries an author and
-- timestamp for the audit trail.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS case_notes (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  case_id INTEGER NOT NULL REFERENCES contact_messages(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  admin_actor_id TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_case_notes_case_id
  ON case_notes(case_id, created_at);

-- ---------------------------------------------------------------------------
-- Backfill: map historical contact_messages onto the case model with neutral
-- defaults. Existing rows already get column defaults (source='website_form',
-- workflow_status='new', priority='normal', etc.) from ADD COLUMN, so no
-- explicit UPDATE is required. Historical cases that were 'replied' or
-- 'archived' in the legacy `status` keep that delivery state; their
-- workflow_status defaults to 'new' (untriaged) so they surface for review
-- rather than being silently reclassified — the task explicitly forbids
-- "silently reclassify historical cases incorrectly". Admins can bulk-triage
-- or archive them via the workspace.
-- ---------------------------------------------------------------------------

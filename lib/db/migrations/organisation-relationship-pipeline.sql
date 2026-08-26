-- Organisation + Person relationship pipeline.
--
-- This migration introduces the relationship layer that was deferred in the
-- original case-management pipeline. It is additive and idempotent:
--   * New tables (CREATE TABLE IF NOT EXISTS)
--   * New columns on contact_messages (ADD COLUMN IF NOT EXISTS)
--   * Constraints guarded by DO $$ ... END $$ blocks
--   * No destructive ALTER or DROP
--
-- The model is:
--
--   Person ──represents──> Organisation
--     │                       │
--     │                       ├── has many Cases (contact_messages)
--     │                       ├── has many Due-diligence checks
--     │                       └── has relationship notes
--     │
--     └── has many Cases
--
-- Existing cases (contact_messages rows) keep their text name/email/organisation
-- fields for backwards compatibility. The new person_id / organisation_id
-- columns (already added by case-management-pipeline.sql) are nullable so
-- existing and new cases work without the CRM tables. Admins link cases to
-- people/organisations explicitly — no automatic merging.

-- ---------------------------------------------------------------------------
-- organisations
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS organisations (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  name TEXT NOT NULL,
  organisation_type TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  geographic_area TEXT,
  registration_number TEXT,
  relationship_status TEXT NOT NULL DEFAULT 'enquirer',
  primary_owner_id TEXT,
  notes TEXT,
  deleted_at TIMESTAMP WITH TIME ZONE
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'organisations_relationship_status_values'
  ) THEN
    ALTER TABLE organisations
      ADD CONSTRAINT organisations_relationship_status_values
      CHECK (relationship_status IN (
        'prospect', 'enquirer', 'under_review', 'potential_partner',
        'active_partner', 'donor_funder', 'referral_partner', 'supplier',
        'government_authority', 'former_partner', 'restricted', 'other'
      ));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_organisations_name
  ON organisations(name)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_organisations_relationship_status
  ON organisations(relationship_status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_organisations_primary_owner_id
  ON organisations(primary_owner_id)
  WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- persons
--
-- A person is a contact individual. They may or may not belong to an
-- organisation. Email/phone matches may be suggested but should not silently
-- merge uncertain identities — the UI offers suggestions, the admin decides.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS persons (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  full_name TEXT NOT NULL,
  primary_email TEXT,
  phone TEXT,
  role_title TEXT,
  organisation_id INTEGER REFERENCES organisations(id) ON DELETE SET NULL,
  notes TEXT,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_persons_organisation_id
  ON persons(organisation_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_persons_primary_email
  ON persons(primary_email)
  WHERE deleted_at IS NULL AND primary_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_persons_name
  ON persons(full_name)
  WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- Foreign keys from contact_messages to persons / organisations.
-- The columns already exist (added by case-management-pipeline.sql); we only
-- add the FK constraints now that the referenced tables exist.
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contact_messages_person_id_fkey'
  ) THEN
    ALTER TABLE contact_messages
      ADD CONSTRAINT contact_messages_person_id_fkey
      FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contact_messages_organisation_id_fkey'
  ) THEN
    ALTER TABLE contact_messages
      ADD CONSTRAINT contact_messages_organisation_id_fkey
      FOREIGN KEY (organisation_id) REFERENCES organisations(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- triaged_at — SLA timestamp for first triage (distinct from first_response_at
-- which records the first OUTBOUND reply).
-- ---------------------------------------------------------------------------

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS triaged_at TIMESTAMP WITH TIME ZONE;

-- ---------------------------------------------------------------------------
-- case_actions — action / follow-up history.
--
-- Each case may have many actions over time. The case's `next_action` /
-- `next_action_due_at` columns remain the "highlighted" current action, but
-- previous actions are preserved here so the history is not lost when the
-- next action changes.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS case_actions (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  case_id INTEGER NOT NULL REFERENCES contact_messages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  owner_id TEXT,
  due_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'open',
  note TEXT,
  admin_actor_id TEXT
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'case_actions_status_values'
  ) THEN
    ALTER TABLE case_actions
      ADD CONSTRAINT case_actions_status_values
      CHECK (status IN ('open', 'completed', 'cancelled', 'skipped'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_case_actions_case_id
  ON case_actions(case_id, created_at);

CREATE INDEX IF NOT EXISTS idx_case_actions_due_at
  ON case_actions(due_at)
  WHERE due_at IS NOT NULL AND status = 'open';

CREATE INDEX IF NOT EXISTS idx_case_actions_owner_id
  ON case_actions(owner_id)
  WHERE status = 'open';

-- ---------------------------------------------------------------------------
-- case_decisions — decision record for cases requiring organisational judgment.
--
-- A case may have multiple decisions over time (e.g. "request more info" then
-- "proceed with conditions"). The latest decision is the current one; previous
-- decisions remain for the audit trail.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS case_decisions (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  case_id INTEGER NOT NULL REFERENCES contact_messages(id) ON DELETE CASCADE,
  decision TEXT NOT NULL,
  decision_date DATE NOT NULL DEFAULT CURRENT_DATE,
  decision_maker_id TEXT,
  rationale TEXT,
  conditions TEXT,
  admin_actor_id TEXT
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'case_decisions_decision_values'
  ) THEN
    ALTER TABLE case_decisions
      ADD CONSTRAINT case_decisions_decision_values
      CHECK (decision IN (
        'proceed', 'proceed_with_conditions', 'request_more_information',
        'refer', 'decline', 'close_without_action'
      ));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_case_decisions_case_id
  ON case_decisions(case_id, decision_date DESC);

-- ---------------------------------------------------------------------------
-- case_communications — manual WhatsApp / phone / social / meeting / walk-in
-- logging on an EXISTING case. This avoids creating a new case every time the
-- same requester contacts Vantage through a different channel.
--
-- This is distinct from contact_message_replies (which are email
-- correspondence) and from case_notes (which are internal-only). A
-- communication log entry records that a conversation happened, with a
-- summary — it is not the full transcript.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS case_communications (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  case_id INTEGER NOT NULL REFERENCES contact_messages(id) ON DELETE CASCADE,
  direction TEXT NOT NULL DEFAULT 'inbound',
  channel TEXT NOT NULL,
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  summary TEXT NOT NULL,
  staff_member TEXT,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,
  admin_actor_id TEXT
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'case_communications_direction_values'
  ) THEN
    ALTER TABLE case_communications
      ADD CONSTRAINT case_communications_direction_values
      CHECK (direction IN ('inbound', 'outbound'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'case_communications_channel_values'
  ) THEN
    ALTER TABLE case_communications
      ADD CONSTRAINT case_communications_channel_values
      CHECK (channel IN ('whatsapp', 'phone', 'meeting', 'social_media', 'walk_in', 'email', 'other'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_case_communications_case_id
  ON case_communications(case_id, occurred_at DESC);

-- ---------------------------------------------------------------------------
-- due_diligence_checks — progressive due-diligence framework.
--
-- Each row is a single check within a level. An organisation may have many
-- checks across levels 1, 2 and 3. Not every check is required for every
-- organisation — the admin decides which checks apply.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS due_diligence_checks (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  organisation_id INTEGER NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  check_key TEXT NOT NULL,
  label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started',
  reviewer_id TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  note TEXT,
  document_ref TEXT
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'due_diligence_checks_level_values'
  ) THEN
    ALTER TABLE due_diligence_checks
      ADD CONSTRAINT due_diligence_checks_level_values
      CHECK (level IN (1, 2, 3));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'due_diligence_checks_status_values'
  ) THEN
    ALTER TABLE due_diligence_checks
      ADD CONSTRAINT due_diligence_checks_status_values
      CHECK (status IN ('not_required', 'not_started', 'pending', 'verified', 'concern', 'failed'));
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_due_diligence_unique
  ON due_diligence_checks(organisation_id, check_key)
  WHERE check_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_due_diligence_organisation_id
  ON due_diligence_checks(organisation_id, level);

CREATE INDEX IF NOT EXISTS idx_due_diligence_status
  ON due_diligence_checks(status)
  WHERE status IN ('concern', 'failed', 'pending');

-- ---------------------------------------------------------------------------
-- inbound_email_log — replay protection and audit trail for inbound email.
--
-- When an inbound email is received (via Cloudflare Email Worker → authenticated
-- endpoint), we store a hash of the Message-ID + sender + received timestamp
-- to prevent replay. The actual inbound reply content is stored in
-- contact_message_replies with direction = 'inbound'.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS inbound_email_log (
  id SERIAL PRIMARY KEY,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  message_id_hash TEXT NOT NULL UNIQUE,
  from_address TEXT NOT NULL,
  in_reply_to TEXT,
  subject TEXT,
  matched_case_id INTEGER,
  matched_reply_id INTEGER,
  status TEXT NOT NULL DEFAULT 'processed',
  error_detail TEXT
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'inbound_email_log_status_values'
  ) THEN
    ALTER TABLE inbound_email_log
      ADD CONSTRAINT inbound_email_log_status_values
      CHECK (status IN ('processed', 'unmatched', 'replay_blocked', 'error'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_inbound_email_log_received_at
  ON inbound_email_log(received_at DESC);

CREATE INDEX IF NOT EXISTS idx_inbound_email_log_matched_case_id
  ON inbound_email_log(matched_case_id)
  WHERE matched_case_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Index for inbound email thread matching.
-- The inbound email endpoint queries contact_message_replies by
-- provider_message_id to match In-Reply-To/References headers to outbound
-- replies. Without this index, every inbound email triggers a full scan.
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_cmr_provider_message_id
  ON contact_message_replies(provider_message_id)
  WHERE provider_message_id IS NOT NULL AND direction = 'outbound';

-- ---------------------------------------------------------------------------
-- Index for case → organisation / person FK lookups (not covered by
-- case-management-pipeline.sql which only added the columns, not indexes).
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_contact_messages_organisation_id
  ON contact_messages(organisation_id)
  WHERE organisation_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contact_messages_person_id
  ON contact_messages(person_id)
  WHERE person_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- case_referrals — historical referral records per case.

CREATE TABLE IF NOT EXISTS case_referrals (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  case_id INTEGER NOT NULL REFERENCES contact_messages(id) ON DELETE CASCADE,
  organisation_id INTEGER REFERENCES organisations(id) ON DELETE SET NULL,
  opportunity_name TEXT NOT NULL,
  referred_to_name TEXT NOT NULL,
  description TEXT,
  url_reference TEXT,
  referred_by TEXT,
  referred_at DATE NOT NULL DEFAULT CURRENT_DATE,
  follow_up_at DATE,
  status TEXT NOT NULL DEFAULT 'draft',
  outcome TEXT,
  outcome_at DATE,
  notes TEXT,
  admin_actor_id TEXT
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'case_referrals_status_values'
  ) THEN
    ALTER TABLE case_referrals
      ADD CONSTRAINT case_referrals_status_values
      CHECK (status IN ('draft', 'sent', 'follow_up_due', 'applied', 'closed'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'case_referrals_outcome_values'
  ) THEN
    ALTER TABLE case_referrals
      ADD CONSTRAINT case_referrals_outcome_values
      CHECK (outcome IS NULL OR outcome IN (
        'applied', 'not_applied', 'accepted', 'rejected',
        'not_eligible', 'unable_to_contact', 'unknown'
      ));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_case_referrals_case_id
  ON case_referrals(case_id, referred_at DESC);

CREATE INDEX IF NOT EXISTS idx_case_referrals_follow_up_at
  ON case_referrals(follow_up_at)
  WHERE follow_up_at IS NOT NULL AND status NOT IN ('closed');

CREATE INDEX IF NOT EXISTS idx_case_referrals_organisation_id
  ON case_referrals(organisation_id)
  WHERE organisation_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_case_referrals_status
  ON case_referrals(status);

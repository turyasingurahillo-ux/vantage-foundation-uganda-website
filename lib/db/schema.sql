-- Run this SQL against your Neon database once to create the donations table.
-- Do not store payment credentials (PINs, OTPs, card numbers, etc.) here or anywhere.

CREATE TABLE IF NOT EXISTS donations (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT DEFAULT 'UGX' NOT NULL,
  frequency TEXT NOT NULL,
  campaign TEXT NOT NULL,
  transaction_reference TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT status_values CHECK (status IN ('pending', 'verified', 'rejected')),
  CONSTRAINT currency_values CHECK (currency IN ('UGX', 'USD', 'EUR', 'GBP', 'KES'))
);

-- Partial unique index on transaction_reference: non-null references must be
-- unique so duplicate bank-statement references cannot be submitted. NULL
-- references (donor didn't supply one) are allowed multiple times.
CREATE UNIQUE INDEX IF NOT EXISTS idx_donations_transaction_reference_unique
  ON donations (transaction_reference)
  WHERE transaction_reference IS NOT NULL;

-- Migration: add deleted_at column to pre-existing tables (safe to re-run).
-- Runs AFTER CREATE TABLE so fresh installs already have the column,
-- and BEFORE the CREATE INDEX for deleted_at so the index can reference it.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donations' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE donations ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_email ON donations(email);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_deleted_at ON donations(deleted_at);

-- ---------------------------------------------------------------------------
-- media_objects: admin-uploaded media stored in Cloudflare R2.
--
-- Each row records the R2 object key (NOT a signed URL — signed URLs expire,
-- so we store the stable key and mint a fresh presigned GET URL at render
-- time), the original filename, content-type, byte size, alt text, consent
-- classification, and optional programme/project linkage for editorial
-- categorisation. Soft-deleted rows are retained for audit (deleted_at).
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS media_objects (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  -- Stable R2 object key, e.g. "vantage/gallery/abc123-photo.webp".
  -- The browser src is derived from this (r2://<key> for private-bucket mode,
  -- or https://<cdn>/<key> for public-CDN mode). Never store signed URLs here.
  object_key TEXT NOT NULL UNIQUE,
  -- Original client filename (sanitised) for display in the admin UI.
  original_filename TEXT NOT NULL,
  -- MIME type confirmed via R2 HEAD after upload completes.
  content_type TEXT NOT NULL,
  -- Byte size confirmed via R2 HEAD after upload completes.
  byte_size INTEGER NOT NULL,
  -- Image width/height in pixels (NULL for non-image assets like PDFs).
  width INTEGER,
  height INTEGER,
  -- Descriptive alt text (required for images; safeguarding rule: no invented
  -- names for children). Empty string allowed for decorative images.
  alt_text TEXT NOT NULL DEFAULT '',
  -- Optional caption shown below the image on the public site.
  caption TEXT,
  -- Consent classification, mirroring the existing MediaAsset type.
  consent TEXT NOT NULL DEFAULT 'pending',
  -- Free-form notes about consent provenance (e.g. "Cleared by management 2026-07-27").
  consent_notes TEXT,
  -- Optional programme area id this media relates to (health, education, etc.).
  programme TEXT,
  -- Optional project slug this media relates to.
  project_slug TEXT,
  -- Whether the media is published (visible on the public site). Unpublished
  -- media is retained in R2 and the DB but not rendered.
  published BOOLEAN NOT NULL DEFAULT false,
  -- Soft-delete timestamp. Soft-deleted rows are excluded from list queries
  -- but retained for audit; the R2 object is deleted immediately on soft-delete.
  deleted_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT media_consent_values CHECK (consent IN ('none', 'verified', 'pending', 'group-consent'))
);

CREATE INDEX IF NOT EXISTS idx_media_objects_programme ON media_objects(programme);
CREATE INDEX IF NOT EXISTS idx_media_objects_project_slug ON media_objects(project_slug);
CREATE INDEX IF NOT EXISTS idx_media_objects_published ON media_objects(published);
CREATE INDEX IF NOT EXISTS idx_media_objects_created_at ON media_objects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_objects_deleted_at ON media_objects(deleted_at);

-- ---------------------------------------------------------------------------
-- stories: admin-published Stories & Insights content. Static stories in
-- content/stories.ts and rows here share the same public Story shape.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS stories (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  author TEXT,
  role TEXT,
  published_date DATE NOT NULL DEFAULT CURRENT_DATE,
  location TEXT,
  category TEXT NOT NULL,
  body TEXT NOT NULL,
  hero_image_key TEXT,
  hero_image_alt TEXT,
  hero_image_credit TEXT,
  related_project_slugs TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  consent_classification TEXT NOT NULL DEFAULT 'none',
  seo_title TEXT,
  seo_description TEXT,
  seo_og_image TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT story_consent_values CHECK (consent_classification IN ('none', 'verified', 'pending', 'group-consent'))
);

CREATE INDEX IF NOT EXISTS idx_stories_slug ON stories(slug);
CREATE INDEX IF NOT EXISTS idx_stories_category ON stories(category);
CREATE INDEX IF NOT EXISTS idx_stories_published ON stories(published);
CREATE INDEX IF NOT EXISTS idx_stories_published_date ON stories(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_stories_deleted_at ON stories(deleted_at);

-- ---------------------------------------------------------------------------
-- admins: named admin accounts that replace the single shared ADMIN_SECRET
-- model for daily logins. Passwords are hashed with scrypt (see
-- lib/password.ts) and never stored in plaintext. A disabled admin
-- (disabled_at IS NOT NULL) cannot log in but the row is retained for audit
-- history. The first admin is created via the ADMIN_SECRET bootstrap fallback
-- in the login route (only when zero active admins exist).
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  disabled_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_disabled_at ON admins(disabled_at);

-- ---------------------------------------------------------------------------
-- audit_log: immutable, append-only record of admin actions. Every
-- state-changing admin operation (donation verification, media CRUD, admin
-- create/disable) writes exactly one row with a before/after
-- JSON snapshot. There is no UPDATE or DELETE path — the table is an
-- immutable record of who did what and when.
--
-- actor_id is either a numeric admin id (matching admins.id) or the literal
-- "bootstrap" for actions taken via the ADMIN_SECRET fallback. actor_kind
-- distinguishes the source: "admin", "bootstrap", or "system".
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  actor_id TEXT NOT NULL,
  actor_kind TEXT NOT NULL DEFAULT 'admin',
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  before JSONB,
  after JSONB,
  ip TEXT,
  CONSTRAINT audit_actor_kind_values CHECK (actor_kind IN ('admin', 'bootstrap', 'system'))
);

CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource_type ON audit_log(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor_id ON audit_log(actor_id);

-- ===========================================================================
-- Content Analytics — first-party, privacy-safe article performance tracking.
--
-- Design principles (see docs/content-analytics.md):
--   * Aggregate, don't surveil. No names, emails, IPs, or identifiable
--     browsing profiles are stored. The only per-reader identifier is a
--     one-way HMAC hash of an anonymous random cookie (vantage_reader),
--     which exists solely for unique-reader deduplication and scroll-milestone
--     de-duplication within a day. It cannot be reversed to a person.
--   * Prefer aggregated daily rollups over millions of raw events. The
--     article_analytics_daily table is the fast-query surface for the admin
--     dashboard; article_reader_sessions is the per-reader-per-day dedup
--     layer that feeds it.
--   * Drafts and unpublished stories are excluded from public-performance
--     totals (the ingestion API rejects events for unpublished articles).
--   * Deleted/unpublished content does not corrupt historical reporting:
--     analytics rows reference article_id but aggregation joins to stories
--     with a LEFT JOIN so historical data survives even if a story is later
--     soft-deleted (the admin UI labels orphaned rows as "removed article").
-- ===========================================================================

-- Analytics article registry. Maps every trackable published story (both
-- static-manifest stories from content/stories.ts and database stories in the
-- stories table) to a stable integer id used as article_id across all analytics
-- tables. This decouples analytics identity from the editorial stories table so
-- anonymous pageviews never need to create or modify editorial content records.
--
-- Seeded at build time by scripts/seed-analytics-registry.ts from all published
-- stories (static + DB). The ingestion endpoint may also lazily create a row for
-- a slug that has been validated as published via the canonical resolver — this
-- is an analytics-only record (slug + cached title/category), NOT editorial
-- content, and ensures no analytics is silently lost for stories published
-- between builds.
CREATE TABLE IF NOT EXISTS analytics_articles (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'static' CHECK (source IN ('static', 'db')),
  published_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_articles_slug ON analytics_articles(slug);
CREATE INDEX IF NOT EXISTS idx_analytics_articles_source ON analytics_articles(source);

-- Per-reader, per-article, per-day dedup + scroll-milestone tracking.
-- One row per anonymous reader per article per calendar day. The reader_hash
-- is an HMAC-SHA256 of the vantage_reader cookie value keyed with ADMIN_SECRET
-- — it is a pseudonymous dedup key, NOT personally identifiable information.
CREATE TABLE IF NOT EXISTS article_reader_sessions (
  article_id INTEGER NOT NULL,
  reader_hash TEXT NOT NULL,
  day DATE NOT NULL DEFAULT CURRENT_DATE,
  source_group TEXT NOT NULL DEFAULT 'direct',
  reached_25 BOOLEAN NOT NULL DEFAULT false,
  reached_50 BOOLEAN NOT NULL DEFAULT false,
  reached_75 BOOLEAN NOT NULL DEFAULT false,
  reached_90 BOOLEAN NOT NULL DEFAULT false,
  completed BOOLEAN NOT NULL DEFAULT false,
  engagement_seconds INTEGER NOT NULL DEFAULT 0,
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (article_id, reader_hash, day)
);

CREATE INDEX IF NOT EXISTS idx_article_reader_sessions_day ON article_reader_sessions(day DESC);
CREATE INDEX IF NOT EXISTS idx_article_reader_sessions_article_day ON article_reader_sessions(article_id, day DESC);
CREATE INDEX IF NOT EXISTS idx_article_reader_sessions_source ON article_reader_sessions(source_group);

-- Aggregated daily rollup per article, per traffic-source group. This is the
-- primary fast-query table for the admin analytics dashboard. Upserted on each
-- inbound analytics event so opening the dashboard never scans raw events.
CREATE TABLE IF NOT EXISTS article_analytics_daily (
  article_id INTEGER NOT NULL,
  day DATE NOT NULL DEFAULT CURRENT_DATE,
  source_group TEXT NOT NULL DEFAULT 'direct',
  views INTEGER NOT NULL DEFAULT 0,
  unique_readers INTEGER NOT NULL DEFAULT 0,
  scroll_25 INTEGER NOT NULL DEFAULT 0,
  scroll_50 INTEGER NOT NULL DEFAULT 0,
  scroll_75 INTEGER NOT NULL DEFAULT 0,
  scroll_90 INTEGER NOT NULL DEFAULT 0,
  completions INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  cta_clicks INTEGER NOT NULL DEFAULT 0,
  organic_impressions INTEGER NOT NULL DEFAULT 0,
  organic_clicks INTEGER NOT NULL DEFAULT 0,
  engagement_seconds_total INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (article_id, day, source_group)
);

CREATE INDEX IF NOT EXISTS idx_article_analytics_daily_day ON article_analytics_daily(day DESC);
CREATE INDEX IF NOT EXISTS idx_article_analytics_daily_article_day ON article_analytics_daily(article_id, day DESC);
CREATE INDEX IF NOT EXISTS idx_article_analytics_daily_source ON article_analytics_daily(source_group);

-- Detailed share events (low volume) for the per-platform share breakdown.
-- reader_hash is stored for unique-sharer deduplication but never displayed.
CREATE TABLE IF NOT EXISTS article_share_events (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  article_id INTEGER NOT NULL,
  platform TEXT NOT NULL,
  reader_hash TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_article_share_events_article ON article_share_events(article_id);
CREATE INDEX IF NOT EXISTS idx_article_share_events_created_at ON article_share_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_article_share_events_platform ON article_share_events(platform);
CREATE INDEX IF NOT EXISTS idx_article_share_events_article_created ON article_share_events(article_id, created_at DESC);

-- Detailed CTA / impact events for the per-cta-type breakdown. Captures
-- meaningful actions originating from articles (donate, volunteer, partner,
-- newsletter, etc.) so articles can be judged by impact, not just page views.
CREATE TABLE IF NOT EXISTS article_cta_events (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  article_id INTEGER NOT NULL,
  cta_type TEXT NOT NULL,
  destination TEXT,
  position TEXT,
  reader_hash TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_article_cta_events_article ON article_cta_events(article_id);
CREATE INDEX IF NOT EXISTS idx_article_cta_events_created_at ON article_cta_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_article_cta_events_cta_type ON article_cta_events(cta_type);
CREATE INDEX IF NOT EXISTS idx_article_cta_events_article_created ON article_cta_events(article_id, created_at DESC);

-- Cached Google Search Console query-level data per article. Populated by a
-- periodic server-side sync (never from the browser — service credentials are
-- server-only). date_fetched records when the cache row was last refreshed.
CREATE TABLE IF NOT EXISTS article_search_queries (
  id SERIAL PRIMARY KEY,
  article_id INTEGER NOT NULL,
  query TEXT NOT NULL,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  position NUMERIC(6, 2) NOT NULL DEFAULT 0,
  date_fetched TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (article_id, query)
);

CREATE INDEX IF NOT EXISTS idx_article_search_queries_article ON article_search_queries(article_id);
CREATE INDEX IF NOT EXISTS idx_article_search_queries_clicks ON article_search_queries(clicks DESC);

-- Single-row Search Console connection state. Tracks whether the integration
-- is connected and when data was last synced, so the admin UI can show a clean
-- setup state instead of broken/empty widgets when it is not yet configured.
CREATE TABLE IF NOT EXISTS search_console_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  connected BOOLEAN NOT NULL DEFAULT false,
  site_url TEXT,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  CONSTRAINT search_console_config_singleton CHECK (id = 1)
);

INSERT INTO search_console_config (id, connected) VALUES (1, false)
  ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- contact_messages: submissions from the public contact form.
--
-- Persisted BEFORE the notification email is attempted so that a transient
-- SMTP/provider outage never loses a message from a donor, grantmaker,
-- researcher or partner. The email_sent column records whether the
-- notification was delivered, so the team can follow up on anything that
-- failed to send.
--
-- Only fields the visitor chose to provide are stored. The category column is one of
-- the fixed values in lib/contact-categories.ts (validated server-side), never
-- free text from the request.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  organisation TEXT,
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  -- Whether the internal notification email was successfully handed to SMTP.
  email_sent BOOLEAN NOT NULL DEFAULT FALSE,
  -- Set once a team member has actioned the message.
  handled_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_category ON contact_messages(category);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email_sent ON contact_messages(email_sent);
CREATE INDEX IF NOT EXISTS idx_contact_messages_deleted_at ON contact_messages(deleted_at);

-- ---------------------------------------------------------------------------
-- Correspondence: replies sent to a contact submission, and the workflow state
-- of the conversation.
--
-- Replies are NOT appended to contact_messages.message — the original
-- submission stays exactly as the visitor wrote it, and each reply is its own
-- row so the conversation can be reconstructed in order and audited.
--
-- `direction` leaves room for inbound replies (Phase 2). Only 'outbound' is
-- written today; see docs/email-privacy-and-contact.md for the inbound route.
--
-- `send_status` models email as the fallible external call it is:
--   pending -> the row exists but the provider has not accepted it yet
--   sent    -> the provider accepted it and returned a message id
--   failed  -> the provider rejected it or errored; safe to retry
-- A conversation only becomes 'replied' once a reply reaches 'sent'.
-- ---------------------------------------------------------------------------

-- Workflow columns on the existing table. ADD COLUMN IF NOT EXISTS is native
-- in PostgreSQL and idempotent, so this is safe to re-run.
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new';
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS last_replied_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

-- The CHECK constraint on `status` is defined further down, in the "Inbox v2"
-- section: 'archived' used to be one of the permitted values and is now
-- expressed by archived_at instead, so there is one authoritative definition
-- rather than an old one that a later block has to undo.

CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);

CREATE TABLE IF NOT EXISTS contact_message_replies (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  message_id INTEGER NOT NULL REFERENCES contact_messages(id) ON DELETE CASCADE,
  -- 'outbound' = Vantage -> enquirer. 'inbound' reserved for Phase 2.
  direction TEXT NOT NULL DEFAULT 'outbound',
  body TEXT NOT NULL,
  sender_email TEXT,
  recipient_email TEXT NOT NULL,
  -- Actor from the admin session (a named admin id, or 'bootstrap').
  admin_actor_id TEXT,
  -- RFC 5322 Message-ID returned by the provider, used for threading.
  provider_message_id TEXT,
  provider_status TEXT,
  send_status TEXT NOT NULL DEFAULT 'pending',
  error_detail TEXT,
  -- Client-supplied token used to collapse double submissions.
  idempotency_key TEXT UNIQUE,
  sent_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT contact_message_replies_direction CHECK (direction IN ('outbound', 'inbound')),
  CONSTRAINT contact_message_replies_send_status CHECK (send_status IN ('pending', 'sent', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_cmr_message_id ON contact_message_replies(message_id, created_at);
CREATE INDEX IF NOT EXISTS idx_cmr_send_status ON contact_message_replies(send_status);

-- ---------------------------------------------------------------------------
-- Inbox v2: archive separated from workflow state, activity ordering, and
-- per-conversation idempotency.
--
-- Everything below is written to be re-runnable against a database that has
-- already been migrated: each step is either natively idempotent
-- (IF NOT EXISTS) or guarded on the state it is about to change.
-- ---------------------------------------------------------------------------

-- 1. Retry lineage. A failed reply is never rewritten; a retry is a NEW row
--    that points back at the attempt it replaces, so the audit trail keeps
--    both the failure and its resolution.
ALTER TABLE contact_message_replies
  ADD COLUMN IF NOT EXISTS retry_of_reply_id INTEGER
  REFERENCES contact_message_replies(id) ON DELETE SET NULL;

-- 2. How a `pending` row was finally resolved when the provider never
--    answered. Written only by an administrator who has checked the mailbox —
--    the system will not guess (see lib/db/contact-replies.ts).
ALTER TABLE contact_message_replies
  ADD COLUMN IF NOT EXISTS resolved_by TEXT;
ALTER TABLE contact_message_replies
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE;

-- 3. Scope idempotency to the conversation.
--
--    `idempotency_key TEXT UNIQUE` was global, so a key collision between two
--    different conversations would return a reply belonging to somebody else's
--    message. Scoping the uniqueness to (message_id, idempotency_key) makes
--    that structurally impossible. Existing rows already satisfy the narrower
--    index because the old constraint was strictly stronger.
CREATE UNIQUE INDEX IF NOT EXISTS idx_cmr_message_idempotency
  ON contact_message_replies(message_id, idempotency_key);

--    Drop the old global constraint only AFTER the replacement index exists,
--    so there is no window without protection. The name is Postgres's
--    auto-generated one for a column-level UNIQUE.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'contact_message_replies_idempotency_key_key'
  ) THEN
    ALTER TABLE contact_message_replies
      DROP CONSTRAINT contact_message_replies_idempotency_key_key;
  END IF;
END $$;

-- 4. Conversation activity timestamp.
--
--    An inbox sorted by original submission time buries a two-week-old thread
--    that was answered five minutes ago. last_activity_at is the latest of:
--    the submission itself, and any successful outbound reply. (Phase 2
--    inbound replies will feed the same column.)
--
--    Deliberately NOT touched by archive/unarchive or by manual status
--    changes: those are administrator bookkeeping, not conversation activity,
--    and must not reshuffle the inbox.
ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE contact_messages
  ALTER COLUMN last_activity_at SET DEFAULT CURRENT_TIMESTAMP;

--    Backfill. GREATEST ignores nothing, so COALESCE the nullable sides down
--    to created_at first. Only touches rows that have never been stamped, so
--    re-running cannot move a live value.
UPDATE contact_messages m
SET last_activity_at = GREATEST(
  m.created_at,
  COALESCE(m.last_replied_at, m.created_at),
  COALESCE(
    (SELECT MAX(COALESCE(r.sent_at, r.created_at))
     FROM contact_message_replies r
     WHERE r.message_id = m.id
       AND r.direction = 'outbound'
       AND r.send_status = 'sent'),
    m.created_at
  )
)
WHERE m.last_activity_at IS NULL;

ALTER TABLE contact_messages
  ALTER COLUMN last_activity_at SET NOT NULL;

-- 5. Retire 'archived' as a workflow status.
--
--    archived_at already recorded the fact; storing it in `status` as well
--    meant archiving destroyed the response state, and unarchiving had to
--    invent a new one (replied -> archive -> unarchive came back as new).
--
--    Migration rule: keep archived_at, and recover the response state from
--    evidence rather than assumption. A conversation is only restored to
--    'replied' if there is a delivered reply behind it; everything else falls
--    back to 'new', which claims nothing.
--
--    Naturally idempotent: after this runs no row has status = 'archived'.
UPDATE contact_messages m
SET
  archived_at = COALESCE(m.archived_at, m.handled_at, m.created_at),
  status = CASE
    WHEN m.last_replied_at IS NOT NULL THEN 'replied'
    WHEN EXISTS (
      SELECT 1 FROM contact_message_replies r
      WHERE r.message_id = m.id
        AND r.direction = 'outbound'
        AND r.send_status = 'sent'
    ) THEN 'replied'
    ELSE 'new'
  END
WHERE m.status = 'archived';

--    Swap the CHECK constraint to the three-state delivery model.
--
--    The constraint is named contact_messages_status_values so it cannot
--    collide with contact_messages_workflow_status_values, which is the
--    CHECK constraint on the workflow_status column created by
--    case-management-pipeline.sql. A previous version of this block used
--    the workflow_status name for the `status` column, which silently
--    blocked the case-management migration from creating its own
--    constraint — see fix-workflow-status-constraint-collision.sql.
DO $$
BEGIN
  -- Clean up the collision from the original Inbox V2 migration: if a
  -- constraint named contact_messages_workflow_status_values exists on the
  -- `status` column (wrong column), drop it so the name is free for the
  -- legitimate workflow_status constraint. We verify the column to avoid
  -- dropping a correctly-placed constraint on workflow_status.
  IF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY (c.conkey)
    WHERE c.conname = 'contact_messages_workflow_status_values'
      AND t.relname = 'contact_messages'
      AND a.attname = 'status'
  ) THEN
    ALTER TABLE contact_messages
      DROP CONSTRAINT contact_messages_workflow_status_values;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'contact_messages_status_values'
  ) THEN
    ALTER TABLE contact_messages
      ADD CONSTRAINT contact_messages_status_values
      CHECK (status IN ('new', 'awaiting_response', 'replied'));
  END IF;
END $$;

-- 6. Indexes for the inbox query shapes.
--
--    Each of these serves one of the three listings the page can produce, and
--    each is partial so it only carries rows that listing can return. The
--    ordering columns match ORDER BY last_activity_at DESC, id DESC exactly,
--    so the planner can walk the index instead of sorting the table.
--
--    idx_..._active_status_activity — the New / Needs reply / Replied tabs:
--      equality on status, then an already-ordered scan.
CREATE INDEX IF NOT EXISTS idx_contact_messages_active_status_activity
  ON contact_messages (status, last_activity_at DESC, id DESC)
  WHERE deleted_at IS NULL AND archived_at IS NULL;

--    idx_..._active_activity — the "All active" tab, which has no status
--      predicate and therefore cannot use the index above.
CREATE INDEX IF NOT EXISTS idx_contact_messages_active_activity
  ON contact_messages (last_activity_at DESC, id DESC)
  WHERE deleted_at IS NULL AND archived_at IS NULL;

--    idx_..._archived_activity — the Archived tab.
CREATE INDEX IF NOT EXISTS idx_contact_messages_archived_activity
  ON contact_messages (last_activity_at DESC, id DESC)
  WHERE deleted_at IS NULL AND archived_at IS NOT NULL;

--    No index is added for searching reply bodies. That search is always
--    correlated (EXISTS ... WHERE r.message_id = m.id AND r.body ILIKE $1), so
--    it is served by idx_cmr_message_id and only ever inspects the handful of
--    replies belonging to a candidate conversation. A trigram index would only
--    pay for itself on an uncorrelated full-table body search, which the inbox
--    never issues.

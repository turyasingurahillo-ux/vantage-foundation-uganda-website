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

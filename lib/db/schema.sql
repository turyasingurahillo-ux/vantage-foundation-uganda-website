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
  CONSTRAINT status_values CHECK (status IN ('pending', 'verified', 'rejected'))
);

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

-- Self-service blog, managed via /admin/blog. Mirrors the BlogPost type in
-- types/index.ts and the content/blog.ts static manifest's shape — the
-- public /blog routes merge rows from here with that (normally empty)
-- static file.
CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  summary TEXT NOT NULL,
  -- Markdown body, rendered the same way as content/stories.ts entries.
  body TEXT NOT NULL,
  author TEXT,
  published_at DATE NOT NULL DEFAULT CURRENT_DATE,
  reading_time_minutes INTEGER,
  -- R2 object key (see lib/storage/vantage-objects.ts, "blog" folder) —
  -- never a signed URL. Resolved to a presigned GET URL at render time,
  -- same pattern as media_objects.object_key.
  hero_image_key TEXT,
  hero_image_alt TEXT,
  -- Consent classification for the hero image, mirroring media_objects.
  consent_classification TEXT NOT NULL DEFAULT 'none',
  -- Optional per-post SEO title/description overrides.
  seo_title TEXT,
  seo_description TEXT,
  -- Whether the post is published (visible on the public site). Defaults to
  -- false so a new post is a draft until an editor explicitly publishes it.
  published BOOLEAN NOT NULL DEFAULT false,
  -- Soft-delete timestamp. Soft-deleted rows are excluded from list queries
  -- but retained for audit.
  deleted_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT blog_category_values CHECK (category IN (
    'Health', 'Education', 'Humanitarian Action', 'Community Stories',
    'Foundation News', 'Research & Learning', 'Accountability'
  )),
  CONSTRAINT blog_consent_values CHECK (consent_classification IN ('none', 'verified', 'pending', 'group-consent'))
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_deleted_at ON blog_posts(deleted_at);

-- ---------------------------------------------------------------------------
-- contact_messages: submissions from the public contact form.
--
-- Persisted BEFORE the notification email is attempted so that a transient
-- SMTP/provider outage never loses a message from a donor, grantmaker,
-- researcher or partner. `email_sent` records whether the notification was
-- delivered, so the team can follow up on anything that failed to send.
--
-- Only fields the visitor chose to provide are stored. `category` is one of
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

-- Phase 2C foundation: retain analytics identity/history when public content
-- is unpublished, deleted, or removed from the static manifest.
ALTER TABLE analytics_articles
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_analytics_articles_active
  ON analytics_articles(is_active);

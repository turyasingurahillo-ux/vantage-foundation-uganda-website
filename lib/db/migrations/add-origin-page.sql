-- Add origin_page column to contact_messages.
--
-- This column records which public page the contact form was submitted from
-- (e.g. '/get-involved', '/contact', '/donate'). It is nullable because
-- existing rows and manual intake rows do not have this value.
--
-- The column is purely additive: no existing queries, indexes, or constraints
-- are affected. The value is set by the server action from a hidden form
-- field populated by usePathname() in the ContactForm client component.
--
-- Idempotent: safe to re-run.

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS origin_page TEXT;

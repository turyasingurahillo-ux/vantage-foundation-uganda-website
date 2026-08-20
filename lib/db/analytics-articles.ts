import { neon } from "@neondatabase/serverless";
import type { PublishedStoryRef } from "@/lib/stories-public";

/**
 * Analytics article registry — maps every trackable published story to a
 * stable integer id used as `article_id` across all analytics tables.
 *
 * This decouples analytics identity from the editorial `stories` table so
 * anonymous pageviews never create or modify editorial content records. The
 * registry stores only slug + cached title/category (analytics metadata),
 * never editorial body or hero images.
 *
 * Seeded at build time from all published stories (static manifest + DB).
 * The ingestion endpoint may also lazily create a row for a slug that has
 * already been validated as published via the canonical resolver — this is
 * an analytics-only record, NOT editorial content, and ensures no analytics
 * is silently lost for stories published between builds.
 */

export interface AnalyticsArticleRow {
  id: number;
  slug: string;
  title: string;
  category: string;
  source: "static" | "db";
  publishedDate: string | null;
}

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  return neon(url);
}

function mapRow(row: Record<string, unknown>): AnalyticsArticleRow {
  return {
    id: row.id as number,
    slug: row.slug as string,
    title: (row.title as string) ?? "",
    category: (row.category as string) ?? "",
    source: row.source as "static" | "db",
    publishedDate: row.published_date ? String(row.published_date) : null,
  };
}

/**
 * Looks up a registry row by slug. Returns null if not found.
 */
export async function getAnalyticsArticleBySlug(
  slug: string
): Promise<AnalyticsArticleRow | null> {
  const sql = getSql();
  const rows = await sql`SELECT * FROM analytics_articles WHERE slug = ${slug}`;
  return rows.length ? mapRow(rows[0]) : null;
}

/**
 * Looks up a registry row by id. Returns null if not found.
 */
export async function getAnalyticsArticleById(
  id: number
): Promise<AnalyticsArticleRow | null> {
  const sql = getSql();
  const rows = await sql`SELECT * FROM analytics_articles WHERE id = ${id}`;
  return rows.length ? mapRow(rows[0]) : null;
}

/**
 * Returns all registry rows, ordered by slug.
 */
export async function getAllAnalyticsArticles(): Promise<AnalyticsArticleRow[]> {
  const sql = getSql();
  const rows = await sql`SELECT * FROM analytics_articles ORDER BY slug ASC`;
  return rows.map(mapRow);
}

/**
 * Idempotently inserts or updates a registry row for a published story ref.
 * Used by both the build-time seeding script and the ingestion endpoint's
 * lazy-creation path. Only analytics metadata (slug, title, category, source)
 * is stored — never editorial body or hero.
 *
 * Returns the registry id.
 */
export async function upsertAnalyticsArticle(
  ref: PublishedStoryRef
): Promise<number> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO analytics_articles (slug, title, category, source, published_date, updated_at)
    VALUES (${ref.slug}, ${ref.title}, ${ref.category}, ${ref.source}, ${ref.publishedDate ?? null}, NOW())
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      category = EXCLUDED.category,
      source = EXCLUDED.source,
      published_date = EXCLUDED.published_date,
      updated_at = NOW()
    RETURNING id
  `;
  return rows[0].id as number;
}

/**
 * Resolves a slug to a registry id, creating the row if it doesn't exist.
 * The caller MUST have already validated the slug as a published story via
 * `resolvePublishedStoryBySlug` — this function does not re-validate.
 *
 * Documented exception to "don't create registry records from anonymous
 * pageviews": without lazy creation, any story published after the last
 * build would silently lose all analytics until the next build runs. The
 * registry is an analytics-only construct (not editorial content); creating
 * a row stores only the slug and cached metadata of an already-validated
 * published story. This is analogous to how the system already creates
 * `article_reader_sessions` rows in response to pageviews.
 */
export async function ensureAnalyticsArticleId(
  ref: PublishedStoryRef
): Promise<number> {
  const existing = await getAnalyticsArticleBySlug(ref.slug);
  if (existing) return existing.id;
  return upsertAnalyticsArticle(ref);
}

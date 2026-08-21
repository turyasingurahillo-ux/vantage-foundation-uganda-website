import { neon } from "@neondatabase/serverless";
import type { PublishedStoryRef } from "@/lib/stories-public";

/**
 * Analytics article registry — maps every trackable published story to the
 * stable integer id used as article_id across analytics tables.
 *
 * Registry rows are historical identities. Removing or unpublishing content
 * never deletes analytics history: is_active controls current trackability.
 */
export interface AnalyticsArticleRow {
  id: number;
  slug: string;
  title: string;
  category: string;
  source: "static" | "db";
  publishedDate: string | null;
  isActive: boolean;
}

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  return neon(url);
}

function mapRow(row: Record<string, unknown>): AnalyticsArticleRow {
  return {
    id: Number(row.id),
    slug: String(row.slug),
    title: (row.title as string) ?? "",
    category: (row.category as string) ?? "",
    source: row.source as "static" | "db",
    publishedDate: row.published_date ? String(row.published_date) : null,
    isActive: row.is_active !== false,
  };
}

/** Looks up a registry row by slug, including inactive historical rows. */
export async function getAnalyticsArticleBySlug(
  slug: string,
): Promise<AnalyticsArticleRow | null> {
  const sql = getSql();
  const rows = await sql`SELECT * FROM analytics_articles WHERE slug = ${slug}`;
  return rows.length ? mapRow(rows[0]) : null;
}

/** Looks up a registry row by id, including inactive historical rows. */
export async function getAnalyticsArticleById(
  id: number,
): Promise<AnalyticsArticleRow | null> {
  const sql = getSql();
  const rows = await sql`SELECT * FROM analytics_articles WHERE id = ${id}`;
  return rows.length ? mapRow(rows[0]) : null;
}

/**
 * Returns registry rows ordered by slug. Current callers (Search Console sync)
 * should see only active/trackable content unless historical rows are
 * explicitly requested.
 */
export async function getAllAnalyticsArticles(options?: {
  includeInactive?: boolean;
}): Promise<AnalyticsArticleRow[]> {
  const sql = getSql();
  const rows = options?.includeInactive
    ? await sql`SELECT * FROM analytics_articles ORDER BY slug ASC`
    : await sql`
        SELECT * FROM analytics_articles
        WHERE is_active = true
        ORDER BY slug ASC
      `;
  return rows.map(mapRow);
}

/**
 * Idempotently inserts or refreshes a registry row for a currently published
 * story. Re-publishing an inactive story reactivates the same analytics id.
 */
export async function upsertAnalyticsArticle(
  ref: PublishedStoryRef,
): Promise<number> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO analytics_articles
      (slug, title, category, source, published_date, is_active, updated_at)
    VALUES (
      ${ref.slug}, ${ref.title}, ${ref.category}, ${ref.source},
      ${ref.publishedDate ?? null}, true, NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      category = EXCLUDED.category,
      source = EXCLUDED.source,
      published_date = EXCLUDED.published_date,
      is_active = true,
      updated_at = NOW()
    RETURNING id
  `;
  return Number(rows[0].id);
}

/**
 * Marks registry rows not present in a complete public-content snapshot as
 * inactive. Historical analytics rows are retained.
 *
 * Call this only after every active story upsert has succeeded and only when
 * the caller knows it obtained a complete static + DB snapshot. That ordering
 * prevents a partial/failed seed from deactivating valid content.
 */
export async function markAnalyticsArticlesInactiveExcept(
  activeSlugs: string[],
): Promise<void> {
  const sql = getSql();
  if (activeSlugs.length === 0) {
    await sql`
      UPDATE analytics_articles
      SET is_active = false, updated_at = NOW()
      WHERE is_active = true
    `;
    return;
  }

  await sql`
    UPDATE analytics_articles
    SET is_active = false, updated_at = NOW()
    WHERE is_active = true
      AND NOT (slug = ANY(${activeSlugs}))
  `;
}

/**
 * Resolves a validated published story to its analytics id. Existing inactive
 * rows are reactivated rather than replaced so historical identity remains
 * stable.
 */
export async function ensureAnalyticsArticleId(
  ref: PublishedStoryRef,
): Promise<number> {
  const existing = await getAnalyticsArticleBySlug(ref.slug);
  if (existing?.isActive) return existing.id;
  return upsertAnalyticsArticle(ref);
}

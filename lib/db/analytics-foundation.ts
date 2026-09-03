import "server-only";
import { neon } from "@neondatabase/serverless";
import {
  computeImpactScore,
  getSearchConsoleStatus,
  getTrend,
  type AnalyticsOverview,
  type CategoryIntelligenceRow,
  type DateRange,
  type ImpactScoreBreakdown,
  type TrendPoint,
} from "@/lib/db/analytics";

/**
 * Phase 2C foundation aggregation model.
 *
 * Identity is deliberately explicit:
 * - analyticsArticleId -> analytics_articles.id -> analytics tables
 * - storyId            -> stories.id -> editorial routes/mutations
 * - slug               -> /stories/[slug] -> public route
 *
 * Search Console is a current query-window cache, not a daily event stream.
 * Search clicks therefore come directly from article_search_queries and are
 * never copied into article_analytics_daily.
 */
export interface FoundationArticlePerformanceRow {
  analyticsArticleId: number;
  storyId: number | null;
  slug: string;
  title: string;
  status: "published" | "inactive";
  isActive: boolean;
  publishedDate: string;
  author: string | null;
  category: string;
  views: number;
  readers: number;
  avgEngagementSeconds: number;
  completionRate: number;
  shares: number;
  googleClicks: number;
  ctaActions: number;
  impactScore: number;
}

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  return neon(url);
}

/**
 * Overview metrics for the selected analytics range. Google clicks are the
 * current Search Console cache window total and are intentionally independent
 * of the daily range because article_search_queries is not date-partitioned.
 */
export async function getFoundationOverview(
  range: DateRange,
  options: { includeSearchWindow?: boolean } = {},
): Promise<AnalyticsOverview> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      COALESCE(SUM(views), 0) AS total_views,
      COALESCE(SUM(unique_readers), 0) AS unique_readers,
      COALESCE(SUM(engagement_seconds_total), 0) AS engagement_total,
      COALESCE(SUM(scroll_90), 0) AS completions,
      COALESCE(SUM(shares), 0) AS shares,
      COALESCE(SUM(cta_clicks), 0) AS cta_clicks
    FROM article_analytics_daily
    WHERE day >= ${range.start}::date AND day <= ${range.end}::date
  `;
  const r = rows[0] ?? {};
  const uniqueReaders = Number(r.unique_readers ?? 0);
  const completions = Number(r.completions ?? 0);
  const engagementTotal = Number(r.engagement_total ?? 0);
  const status = await getSearchConsoleStatus();

  let organicClicks = 0;
  if (status.connected && options.includeSearchWindow !== false) {
    const searchRows = await sql`
      SELECT COALESCE(SUM(clicks), 0) AS clicks
      FROM article_search_queries
    `;
    organicClicks = Number(searchRows[0]?.clicks ?? 0);
  }

  return {
    totalViews: Number(r.total_views ?? 0),
    uniqueReaders,
    avgEngagementSeconds: uniqueReaders ? Math.round(engagementTotal / uniqueReaders) : 0,
    avgCompletionRate: uniqueReaders
      ? Math.round((completions / uniqueReaders) * 1000) / 10
      : 0,
    totalShares: Number(r.shares ?? 0),
    organicClicks,
    ctaActions: Number(r.cta_clicks ?? 0),
    searchConsoleConnected: status.connected,
  };
}

/**
 * Per-article performance with all three identity namespaces exposed.
 * A deleted story does not produce an editorial id. An unpublished-but-live
 * DB story may still have storyId for editing while its registry row is marked
 * inactive. Static stories always have storyId = null.
 */
export async function getFoundationArticlePerformance(
  range: DateRange,
): Promise<FoundationArticlePerformanceRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      a.id AS analytics_article_id,
      s.id AS story_id,
      a.slug,
      a.title,
      a.category,
      a.published_date,
      a.is_active,
      s.author,
      COALESCE(SUM(d.views), 0) AS views,
      COALESCE(SUM(d.unique_readers), 0) AS readers,
      COALESCE(SUM(d.engagement_seconds_total), 0) AS engagement_total,
      COALESCE(SUM(d.scroll_90), 0) AS completions,
      COALESCE(SUM(d.shares), 0) AS shares,
      COALESCE(MAX(q.google_clicks), 0) AS google_clicks,
      COALESCE(SUM(d.cta_clicks), 0) AS cta_actions
    FROM analytics_articles a
    LEFT JOIN stories s
      ON s.slug = a.slug AND s.deleted_at IS NULL
    LEFT JOIN article_analytics_daily d
      ON d.article_id = a.id
      AND d.day >= ${range.start}::date
      AND d.day <= ${range.end}::date
    LEFT JOIN (
      SELECT article_id, SUM(clicks) AS google_clicks
      FROM article_search_queries
      GROUP BY article_id
    ) q ON q.article_id = a.id
    GROUP BY
      a.id, s.id, a.slug, a.title, a.category, a.published_date,
      a.is_active, s.author
    ORDER BY views DESC
  `;

  return rows.map((r) => {
    const readers = Number(r.readers ?? 0);
    const completions = Number(r.completions ?? 0);
    const engagementTotal = Number(r.engagement_total ?? 0);
    const isActive = Boolean(r.is_active);
    return {
      analyticsArticleId: Number(r.analytics_article_id),
      storyId: r.story_id == null ? null : Number(r.story_id),
      slug: String(r.slug),
      title: String(r.title),
      status: isActive ? "published" : "inactive",
      isActive,
      publishedDate: r.published_date ? String(r.published_date) : "",
      author: (r.author as string | null) ?? null,
      category: String(r.category ?? ""),
      views: Number(r.views ?? 0),
      readers,
      avgEngagementSeconds: readers ? Math.round(engagementTotal / readers) : 0,
      completionRate: readers
        ? Math.round((completions / readers) * 1000) / 10
        : 0,
      shares: Number(r.shares ?? 0),
      googleClicks: Number(r.google_clicks ?? 0),
      ctaActions: Number(r.cta_actions ?? 0),
      impactScore: 0,
    };
  });
}

export function computeFoundationImpactScores(
  rows: FoundationArticlePerformanceRow[],
): Map<number, ImpactScoreBreakdown> {
  const reachMax = Math.max(
    ...rows.map((r) => r.views * 0.5 + r.readers * 0.5),
    1,
  );
  const engagementMax = Math.max(...rows.map((r) => r.completionRate), 1);
  const searchMax = Math.max(...rows.map((r) => r.googleClicks), 1);
  const amplificationMax = Math.max(...rows.map((r) => r.shares), 1);
  const actionMax = Math.max(...rows.map((r) => r.ctaActions), 1);
  const result = new Map<number, ImpactScoreBreakdown>();

  for (const row of rows) {
    result.set(
      row.analyticsArticleId,
      computeImpactScore(
        {
          views: row.views,
          readers: row.readers,
          completionRate: row.completionRate,
          avgEngagementSeconds: row.avgEngagementSeconds,
          shares: row.shares,
          googleClicks: row.googleClicks,
          ctaActions: row.ctaActions,
        },
        {
          reach: reachMax,
          engagement: engagementMax,
          search: searchMax,
          amplification: amplificationMax,
          action: actionMax,
        },
      ),
    );
  }

  return result;
}

/** Category intelligence with Search Console sourced from its cache. */
export async function getFoundationCategoryIntelligence(
  range: DateRange,
): Promise<CategoryIntelligenceRow[]> {
  const sql = getSql();
  const rows = await sql`
    WITH search_by_article AS (
      SELECT article_id, COALESCE(SUM(clicks), 0) AS search_clicks
      FROM article_search_queries
      GROUP BY article_id
    ), article_metrics AS (
      SELECT
        a.id,
        a.category,
        COALESCE(SUM(d.unique_readers), 0) AS readers,
        COALESCE(SUM(d.engagement_seconds_total), 0) AS engagement_total,
        COALESCE(SUM(d.scroll_90), 0) AS completions,
        COALESCE(SUM(d.shares), 0) AS shares,
        COALESCE(SUM(d.cta_clicks), 0) AS cta_clicks,
        COALESCE(MAX(q.search_clicks), 0) AS search_clicks
      FROM analytics_articles a
      LEFT JOIN article_analytics_daily d
        ON d.article_id = a.id
        AND d.day >= ${range.start}::date
        AND d.day <= ${range.end}::date
      LEFT JOIN search_by_article q ON q.article_id = a.id
      GROUP BY a.id, a.category
    )
    SELECT
      category,
      COUNT(*) AS article_count,
      COALESCE(SUM(readers), 0) AS total_readers,
      COALESCE(SUM(engagement_total), 0) AS engagement_total,
      COALESCE(SUM(completions), 0) AS completions,
      COALESCE(SUM(search_clicks), 0) AS search_clicks,
      COALESCE(SUM(shares), 0) AS shares,
      COALESCE(SUM(cta_clicks), 0) AS cta_clicks
    FROM article_metrics
    GROUP BY category
    ORDER BY total_readers DESC
  `;

  return rows.map((r) => {
    const articleCount = Number(r.article_count ?? 0);
    const totalReaders = Number(r.total_readers ?? 0);
    const engagementTotal = Number(r.engagement_total ?? 0);
    const completions = Number(r.completions ?? 0);
    const ctaClicks = Number(r.cta_clicks ?? 0);
    return {
      category: String(r.category ?? ""),
      articleCount,
      totalReaders,
      avgReadersPerArticle: articleCount
        ? Math.round(totalReaders / articleCount)
        : 0,
      avgEngagementSeconds: totalReaders
        ? Math.round(engagementTotal / totalReaders)
        : 0,
      completionRate: totalReaders
        ? Math.round((completions / totalReaders) * 1000) / 10
        : 0,
      searchClicks: Number(r.search_clicks ?? 0),
      shares: Number(r.shares ?? 0),
      ctaConversionRate: totalReaders
        ? Math.round((ctaClicks / totalReaders) * 1000) / 10
        : 0,
      avgImpactScore: 0,
    };
  });
}

/**
 * Search Console cache has no daily partition, so a daily Google-click trend
 * would be fabricated. Return no daily points until date-partitioned Search
 * Console storage exists; all other trends retain their existing semantics.
 */
export async function getFoundationTrend(
  metric:
    | "views"
    | "readers"
    | "google_clicks"
    | "engagement"
    | "shares"
    | "cta_conversions",
  range: DateRange,
  analyticsArticleId?: number,
): Promise<TrendPoint[]> {
  if (metric === "google_clicks") return [];
  return getTrend(metric, range, analyticsArticleId);
}

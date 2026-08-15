import "server-only";
import { neon } from "@neondatabase/serverless";

/**
 * Content Analytics database layer.
 *
 * Two responsibilities:
 *   1. Ingestion — called by the public /api/analytics/events endpoint to
 *      record article views, scroll milestones, completions, shares and CTA
 *      clicks. Uses upserts so the dashboard never scans raw events.
 *   2. Aggregation — called by admin analytics API routes to compute overview
 *      KPIs, per-article performance, traffic sources, reading behaviour,
 *      category intelligence, rankings, trends and the Article Impact Score.
 *
 * Privacy: the only per-reader identifier is `reader_hash`, an HMAC-SHA256 of
 * the anonymous `vantage_reader` cookie keyed with ADMIN_SECRET. It is a
 * pseudonymous dedup key — it cannot be reversed to a person, and no PII
 * (names, emails, IPs) is ever stored. See docs/content-analytics.md.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SourceGroup =
  | "google"
  | "direct"
  | "whatsapp"
  | "linkedin"
  | "instagram"
  | "x"
  | "facebook"
  | "other-social"
  | "referral"
  | "email"
  | "other";

export type AnalyticsEventType =
  | "article_view"
  | "article_scroll"
  | "article_complete"
  | "article_share"
  | "article_cta_click"
  | "article_engagement";

export interface AnalyticsOverview {
  totalViews: number;
  uniqueReaders: number;
  avgEngagementSeconds: number;
  avgCompletionRate: number;
  totalShares: number;
  organicClicks: number;
  ctaActions: number;
}

export interface ArticlePerformanceRow {
  articleId: number;
  slug: string;
  title: string;
  status: "published" | "draft";
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

export interface TrafficSourceRow {
  sourceGroup: SourceGroup;
  readers: number;
  percentage: number;
  engagementSeconds: number;
  completionRate: number;
}

export interface ReadingFunnel {
  opened: number;
  reached25: number;
  reached50: number;
  reached75: number;
  reached90: number;
  completionRate: number;
}

export interface CategoryIntelligenceRow {
  category: string;
  articleCount: number;
  totalReaders: number;
  avgReadersPerArticle: number;
  avgEngagementSeconds: number;
  completionRate: number;
  searchClicks: number;
  shares: number;
  ctaConversionRate: number;
  avgImpactScore: number;
}

export interface TrendPoint {
  day: string;
  value: number;
}

export interface SearchQueryRow {
  query: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
}

export interface SearchConsoleStatus {
  connected: boolean;
  siteUrl: string | null;
  lastSyncAt: Date | null;
  lastError: string | null;
}

export interface ArticleSearchPerformance {
  impressions: number;
  clicks: number;
  ctr: number;
  avgPosition: number;
  available: boolean;
}

export interface ImpactScoreBreakdown {
  total: number;
  reach: number;
  reachMax: number;
  engagement: number;
  engagementMax: number;
  search: number;
  searchMax: number;
  amplification: number;
  amplificationMax: number;
  action: number;
  actionMax: number;
}

// ---------------------------------------------------------------------------
// Connection helper
// ---------------------------------------------------------------------------

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  return neon(url);
}

// ---------------------------------------------------------------------------
// Date range helpers
// ---------------------------------------------------------------------------

export type DatePreset = "7d" | "30d" | "90d" | "year" | "all" | "custom";

export interface DateRange {
  start: string;
  end: string;
}

export function resolveDateRange(preset: DatePreset, custom?: { start?: string; end?: string }): DateRange {
  const today = new Date();
  const end = today.toISOString().slice(0, 10);
  if (preset === "all") {
    return { start: "2000-01-01", end };
  }
  if (preset === "year") {
    const start = `${today.getFullYear()}-01-01`;
    return { start, end };
  }
  if (preset === "custom" && custom?.start && custom?.end) {
    return { start: custom.start, end: custom.end };
  }
  const days = preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
  const start = new Date(today.getTime() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  return { start, end };
}

/** Returns the immediately preceding range of equal length for comparison. */
export function previousRange(range: DateRange): DateRange {
  const start = new Date(range.start);
  const end = new Date(range.end);
  const lengthMs = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - lengthMs);
  return {
    start: prevStart.toISOString().slice(0, 10),
    end: prevEnd.toISOString().slice(0, 10),
  };
}

// ---------------------------------------------------------------------------
// Source classification
// ---------------------------------------------------------------------------

/**
 * Classifies a referrer URL + UTM params into a traffic-source group.
 * UTMs take precedence over referrer heuristics so campaign attribution works.
 * Exported for the ingestion API and for tests.
 */
export function classifySource(referrer: string | null, utm?: {
  source?: string;
  medium?: string;
}): SourceGroup {
  const utmSource = utm?.source?.toLowerCase().trim();
  const utmMedium = utm?.medium?.toLowerCase().trim();
  if (utmSource) {
    if (utmSource === "google" || utmMedium === "organic") return "google";
    if (utmSource.includes("whatsapp") || utmMedium === "whatsapp") return "whatsapp";
    if (utmSource.includes("linkedin")) return "linkedin";
    if (utmSource.includes("instagram")) return "instagram";
    if (utmSource === "x" || utmSource === "twitter" || utmSource.includes("t.co")) return "x";
    if (utmSource.includes("facebook") || utmSource.includes("fb")) return "facebook";
    if (utmMedium === "email" || utmSource.includes("mail")) return "email";
    if (utmMedium === "referral") return "referral";
    if (utmMedium === "social") return "other-social";
  }
  if (!referrer) return "direct";
  const r = referrer.toLowerCase();
  if (r.includes("google.")) return "google";
  if (r.includes("whatsapp.com") || r.includes("wa.me")) return "whatsapp";
  if (r.includes("linkedin.com")) return "linkedin";
  if (r.includes("instagram.com")) return "instagram";
  if (r.includes("twitter.com") || r.includes("x.com") || r.includes("t.co")) return "x";
  if (r.includes("facebook.com") || r.includes("fb.com")) return "facebook";
  if (r.startsWith("mailto:") || r.includes("mail.")) return "email";
  // Same-origin referrer = direct navigation within the site. We cannot check
  // the request host here (server-only module), so same-origin detection is
  // handled by the ingestion API which passes source_group directly. A
  // referrer that is a bare path or same host is classified as direct by the
  // caller before reaching this function.
  return "referral";
}

// ---------------------------------------------------------------------------
// Ingestion
// ---------------------------------------------------------------------------

export interface IngestEventInput {
  articleId: number;
  eventType: AnalyticsEventType;
  readerHash: string;
  sourceGroup: SourceGroup;
  percentage?: number;
  platform?: string;
  ctaType?: string;
  destination?: string;
  position?: string;
  engagementSeconds?: number;
}

/**
 * Records a single analytics event, upserting the daily rollup and per-reader
 * session tables. Designed to be called from the public ingestion API. Errors
 * are caught by the caller; this function throws on DB failure so the API can
 * return a 500 and the client can silently retry.
 *
 * Scroll milestone dedup: the client only sends a milestone once per page
 * session, and the server additionally checks the reader-session row so a
 * repeated network request cannot inflate scroll counts.
 */
export async function ingestEvent(input: IngestEventInput): Promise<void> {
  const sql = getSql();
  const today = new Date().toISOString().slice(0, 10);

  // article_view needs to check reader existence BEFORE any upsert so
  // unique_readers is only bumped for genuinely new readers. It handles its
  // own session upsert, so we skip the shared upsert for that event type.
  if (input.eventType !== "article_view") {
    await sql`
      INSERT INTO article_reader_sessions
        (article_id, reader_hash, day, source_group, first_seen_at, last_seen_at)
      VALUES (${input.articleId}, ${input.readerHash}, ${today}::date, ${input.sourceGroup}, NOW(), NOW())
      ON CONFLICT (article_id, reader_hash, day) DO UPDATE SET
        last_seen_at = NOW(),
        engagement_seconds = GREATEST(article_reader_sessions.engagement_seconds, ${input.engagementSeconds ?? 0})
    `;
  }

  // article_complete marks the reader session as completed.
  if (input.eventType === "article_complete") {
    await sql`
      UPDATE article_reader_sessions SET completed = true
      WHERE article_id = ${input.articleId} AND reader_hash = ${input.readerHash} AND day = ${today}::date
    `;
  }

  // Upsert the daily rollup. views/unique_readers are bumped only on
  // article_view; scroll/completion/shares/cta are bumped on their events.
  if (input.eventType === "article_view") {
    // Check if this reader already has a session today BEFORE upserting, so
    // unique_readers is only bumped for genuinely new readers.
    const existing = await sql`
      SELECT 1 FROM article_reader_sessions
      WHERE article_id = ${input.articleId} AND reader_hash = ${input.readerHash} AND day = ${today}::date
    `;
    const isNewReader = existing.length === 0;
    await sql`
      INSERT INTO article_reader_sessions
        (article_id, reader_hash, day, source_group, first_seen_at, last_seen_at)
      VALUES (${input.articleId}, ${input.readerHash}, ${today}::date, ${input.sourceGroup}, NOW(), NOW())
      ON CONFLICT (article_id, reader_hash, day) DO UPDATE SET last_seen_at = NOW()
    `;
    await sql`
      INSERT INTO article_analytics_daily (article_id, day, source_group, views, unique_readers)
      VALUES (${input.articleId}, ${today}::date, ${input.sourceGroup}, 1, ${isNewReader ? 1 : 0})
      ON CONFLICT (article_id, day, source_group) DO UPDATE SET
        views = article_analytics_daily.views + 1,
        unique_readers = article_analytics_daily.unique_readers + ${isNewReader ? 1 : 0}
    `;
    return;
  }

  if (input.eventType === "article_scroll" && input.percentage) {
    // Determine the milestone level (25/50/75/90). Each has a fixed column
    // name in both article_reader_sessions and article_analytics_daily, so we
    // use explicit queries per level rather than dynamic column interpolation
    // (the neon tagged template does not support identifier interpolation).
    const level = input.percentage >= 90 ? 90 : input.percentage >= 75 ? 75 : input.percentage >= 50 ? 50 : input.percentage >= 25 ? 25 : 0;
    if (level === 0) return;

    // Check if the reader had ALREADY reached this milestone today (dedup).
    // We check BEFORE setting the flag so a duplicate request is skipped.
    let already: { 1?: number }[] = [];
    if (level === 90) {
      already = await sql`SELECT 1 FROM article_reader_sessions WHERE article_id = ${input.articleId} AND reader_hash = ${input.readerHash} AND day = ${today}::date AND reached_90 = true`;
    } else if (level === 75) {
      already = await sql`SELECT 1 FROM article_reader_sessions WHERE article_id = ${input.articleId} AND reader_hash = ${input.readerHash} AND day = ${today}::date AND reached_75 = true`;
    } else if (level === 50) {
      already = await sql`SELECT 1 FROM article_reader_sessions WHERE article_id = ${input.articleId} AND reader_hash = ${input.readerHash} AND day = ${today}::date AND reached_50 = true`;
    } else {
      already = await sql`SELECT 1 FROM article_reader_sessions WHERE article_id = ${input.articleId} AND reader_hash = ${input.readerHash} AND day = ${today}::date AND reached_25 = true`;
    }
    if (already.length > 0) return; // duplicate request — milestone already counted

    // Mark the milestone reached in the reader session.
    if (level === 90) {
      await sql`UPDATE article_reader_sessions SET reached_90 = true WHERE article_id = ${input.articleId} AND reader_hash = ${input.readerHash} AND day = ${today}::date`;
    } else if (level === 75) {
      await sql`UPDATE article_reader_sessions SET reached_75 = true WHERE article_id = ${input.articleId} AND reader_hash = ${input.readerHash} AND day = ${today}::date`;
    } else if (level === 50) {
      await sql`UPDATE article_reader_sessions SET reached_50 = true WHERE article_id = ${input.articleId} AND reader_hash = ${input.readerHash} AND day = ${today}::date`;
    } else {
      await sql`UPDATE article_reader_sessions SET reached_25 = true WHERE article_id = ${input.articleId} AND reader_hash = ${input.readerHash} AND day = ${today}::date`;
    }

    // Bump the daily rollup for this milestone.
    if (level === 90) {
      await sql`
        INSERT INTO article_analytics_daily (article_id, day, source_group, scroll_90)
        VALUES (${input.articleId}, ${today}::date, ${input.sourceGroup}, 1)
        ON CONFLICT (article_id, day, source_group) DO UPDATE SET scroll_90 = article_analytics_daily.scroll_90 + 1
      `;
    } else if (level === 75) {
      await sql`
        INSERT INTO article_analytics_daily (article_id, day, source_group, scroll_75)
        VALUES (${input.articleId}, ${today}::date, ${input.sourceGroup}, 1)
        ON CONFLICT (article_id, day, source_group) DO UPDATE SET scroll_75 = article_analytics_daily.scroll_75 + 1
      `;
    } else if (level === 50) {
      await sql`
        INSERT INTO article_analytics_daily (article_id, day, source_group, scroll_50)
        VALUES (${input.articleId}, ${today}::date, ${input.sourceGroup}, 1)
        ON CONFLICT (article_id, day, source_group) DO UPDATE SET scroll_50 = article_analytics_daily.scroll_50 + 1
      `;
    } else {
      await sql`
        INSERT INTO article_analytics_daily (article_id, day, source_group, scroll_25)
        VALUES (${input.articleId}, ${today}::date, ${input.sourceGroup}, 1)
        ON CONFLICT (article_id, day, source_group) DO UPDATE SET scroll_25 = article_analytics_daily.scroll_25 + 1
      `;
    }
    return;
  }

  if (input.eventType === "article_complete") {
    await sql`
      INSERT INTO article_analytics_daily (article_id, day, source_group, completions)
      VALUES (${input.articleId}, ${today}::date, ${input.sourceGroup}, 1)
      ON CONFLICT (article_id, day, source_group) DO UPDATE SET
        completions = article_analytics_daily.completions + 1
    `;
    return;
  }

  if (input.eventType === "article_share") {
    await sql`
      INSERT INTO article_share_events (article_id, platform, reader_hash)
      VALUES (${input.articleId}, ${input.platform ?? "unknown"}, ${input.readerHash})
    `;
    await sql`
      INSERT INTO article_analytics_daily (article_id, day, source_group, shares)
      VALUES (${input.articleId}, ${today}::date, ${input.sourceGroup}, 1)
      ON CONFLICT (article_id, day, source_group) DO UPDATE SET
        shares = article_analytics_daily.shares + 1
    `;
    return;
  }

  if (input.eventType === "article_cta_click") {
    await sql`
      INSERT INTO article_cta_events (article_id, cta_type, destination, position, reader_hash)
      VALUES (${input.articleId}, ${input.ctaType ?? "unknown"}, ${input.destination ?? null}, ${input.position ?? null}, ${input.readerHash})
    `;
    await sql`
      INSERT INTO article_analytics_daily (article_id, day, source_group, cta_clicks)
      VALUES (${input.articleId}, ${today}::date, ${input.sourceGroup}, 1)
      ON CONFLICT (article_id, day, source_group) DO UPDATE SET
        cta_clicks = article_analytics_daily.cta_clicks + 1
    `;
    return;
  }

  if (input.eventType === "article_engagement" && input.engagementSeconds) {
    await sql`
      INSERT INTO article_analytics_daily (article_id, day, source_group, engagement_seconds_total)
      VALUES (${input.articleId}, ${today}::date, ${input.sourceGroup}, 0)
      ON CONFLICT (article_id, day, source_group) DO NOTHING
    `;
    // Recompute engagement total from reader sessions for accuracy.
    await sql`
      UPDATE article_analytics_daily d SET engagement_seconds_total = sub.total
      FROM (
        SELECT article_id, day, source_group, COALESCE(SUM(engagement_seconds), 0) AS total
        FROM article_reader_sessions
        WHERE article_id = ${input.articleId} AND day = ${today}::date AND source_group = ${input.sourceGroup}
        GROUP BY article_id, day, source_group
      ) sub
      WHERE d.article_id = sub.article_id AND d.day = sub.day AND d.source_group = sub.source_group
    `;
  }
}

// ---------------------------------------------------------------------------
// Admin aggregation queries
// ---------------------------------------------------------------------------

/**
 * Overview KPIs across all published articles for a date range.
 */
export async function getOverview(range: DateRange): Promise<AnalyticsOverview> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      COALESCE(SUM(views), 0) AS total_views,
      COALESCE(SUM(unique_readers), 0) AS unique_readers,
      COALESCE(SUM(engagement_seconds_total), 0) AS engagement_total,
      COALESCE(SUM(scroll_90), 0) AS completions,
      COALESCE(SUM(shares), 0) AS shares,
      COALESCE(SUM(organic_clicks), 0) AS organic_clicks,
      COALESCE(SUM(cta_clicks), 0) AS cta_clicks
    FROM article_analytics_daily
    WHERE day >= ${range.start}::date AND day <= ${range.end}::date
  `;
  const r = rows[0] ?? {};
  const uniqueReaders = Number(r.unique_readers ?? 0);
  const completions = Number(r.completions ?? 0);
  const engagementTotal = Number(r.engagement_total ?? 0);
  return {
    totalViews: Number(r.total_views ?? 0),
    uniqueReaders,
    avgEngagementSeconds: uniqueReaders ? Math.round(engagementTotal / uniqueReaders) : 0,
    avgCompletionRate: uniqueReaders ? Math.round((completions / uniqueReaders) * 1000) / 10 : 0,
    totalShares: Number(r.shares ?? 0),
    organicClicks: Number(r.organic_clicks ?? 0),
    ctaActions: Number(r.cta_clicks ?? 0),
  };
}

/**
 * Per-article performance for the sortable admin table. Joins analytics to the
 * stories table so drafts can be listed (with zero metrics) and orphaned
 * analytics rows (deleted articles) are labelled. Includes the Impact Score.
 */
export async function getArticlePerformance(range: DateRange): Promise<ArticlePerformanceRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      s.id AS article_id,
      s.slug,
      s.title,
      s.published,
      s.published_date,
      s.author,
      s.category,
      COALESCE(SUM(d.views), 0) AS views,
      COALESCE(SUM(d.unique_readers), 0) AS readers,
      COALESCE(SUM(d.engagement_seconds_total), 0) AS engagement_total,
      COALESCE(SUM(d.scroll_90), 0) AS completions,
      COALESCE(SUM(d.shares), 0) AS shares,
      COALESCE(SUM(d.organic_clicks), 0) AS google_clicks,
      COALESCE(SUM(d.cta_clicks), 0) AS cta_actions
    FROM stories s
    LEFT JOIN article_analytics_daily d
      ON d.article_id = s.id AND d.day >= ${range.start}::date AND d.day <= ${range.end}::date
    WHERE s.deleted_at IS NULL
    GROUP BY s.id, s.slug, s.title, s.published, s.published_date, s.author, s.category
    ORDER BY views DESC
  `;
  return rows.map((r) => {
    const readers = Number(r.readers ?? 0);
    const completions = Number(r.completions ?? 0);
    const engagementTotal = Number(r.engagement_total ?? 0);
    const views = Number(r.views ?? 0);
    const shares = Number(r.shares ?? 0);
    const googleClicks = Number(r.google_clicks ?? 0);
    const ctaActions = Number(r.cta_actions ?? 0);
    return {
      articleId: r.article_id as number,
      slug: r.slug as string,
      title: r.title as string,
      status: (r.published ? "published" : "draft") as "published" | "draft",
      publishedDate: String(r.published_date),
      author: (r.author as string | null) ?? null,
      category: r.category as string,
      views,
      readers,
      avgEngagementSeconds: readers ? Math.round(engagementTotal / readers) : 0,
      completionRate: readers ? Math.round((completions / readers) * 1000) / 10 : 0,
      shares,
      googleClicks,
      ctaActions,
      impactScore: 0, // computed below
    };
  }).map((row) => ({
    ...row,
    impactScore: computeImpactScore({
      views: row.views,
      readers: row.readers,
      completionRate: row.completionRate,
      avgEngagementSeconds: row.avgEngagementSeconds,
      shares: row.shares,
      googleClicks: row.googleClicks,
      ctaActions: row.ctaActions,
    }).total,
  }));
}

/**
 * Reading-behaviour funnel for a single article across a date range.
 */
export async function getReadingFunnel(articleId: number, range: DateRange): Promise<ReadingFunnel> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      COALESCE(SUM(views), 0) AS opened,
      COALESCE(SUM(scroll_25), 0) AS reached_25,
      COALESCE(SUM(scroll_50), 0) AS reached_50,
      COALESCE(SUM(scroll_75), 0) AS reached_75,
      COALESCE(SUM(scroll_90), 0) AS reached_90,
      COALESCE(SUM(unique_readers), 0) AS readers
    FROM article_analytics_daily
    WHERE article_id = ${articleId} AND day >= ${range.start}::date AND day <= ${range.end}::date
  `;
  const r = rows[0] ?? {};
  const opened = Number(r.opened ?? 0);
  const readers = Number(r.readers ?? 0);
  const reached90 = Number(r.reached_90 ?? 0);
  return {
    opened,
    reached25: Number(r.reached_25 ?? 0),
    reached50: Number(r.reached_50 ?? 0),
    reached75: Number(r.reached_75 ?? 0),
    reached90,
    completionRate: readers ? Math.round((reached90 / readers) * 1000) / 10 : 0,
  };
}

/**
 * Traffic-source breakdown for a single article (or all articles when
 * articleId is null) across a date range.
 */
export async function getTrafficSources(
  articleId: number | null,
  range: DateRange
): Promise<TrafficSourceRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      source_group,
      COALESCE(SUM(unique_readers), 0) AS readers,
      COALESCE(SUM(engagement_seconds_total), 0) AS engagement_total,
      COALESCE(SUM(scroll_90), 0) AS completions
    FROM article_analytics_daily
    WHERE day >= ${range.start}::date AND day <= ${range.end}::date
      ${articleId != null ? sql`AND article_id = ${articleId}` : sql``}
    GROUP BY source_group
    ORDER BY readers DESC
  `;
  const totalReaders = rows.reduce((sum, r) => sum + Number(r.readers ?? 0), 0);
  return rows.map((r) => {
    const readers = Number(r.readers ?? 0);
    const completions = Number(r.completions ?? 0);
    return {
      sourceGroup: r.source_group as SourceGroup,
      readers,
      percentage: totalReaders ? Math.round((readers / totalReaders) * 1000) / 10 : 0,
      engagementSeconds: readers ? Math.round(Number(r.engagement_total ?? 0) / readers) : 0,
      completionRate: readers ? Math.round((completions / readers) * 1000) / 10 : 0,
    };
  });
}

/**
 * Per-platform share breakdown for a single article.
 */
export async function getShareBreakdown(
  articleId: number,
  range: DateRange
): Promise<{ platform: string; count: number }[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT platform, COUNT(*) AS count
    FROM article_share_events
    WHERE article_id = ${articleId}
      AND created_at >= ${range.start}::date AND created_at <= ${range.end}::date + INTERVAL '1 day'
    GROUP BY platform
    ORDER BY count DESC
  `;
  return rows.map((r) => ({ platform: r.platform as string, count: Number(r.count) }));
}

/**
 * Per-CTA-type breakdown for a single article.
 */
export async function getCtaBreakdown(
  articleId: number,
  range: DateRange
): Promise<{ ctaType: string; count: number }[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT cta_type, COUNT(*) AS count
    FROM article_cta_events
    WHERE article_id = ${articleId}
      AND created_at >= ${range.start}::date AND created_at <= ${range.end}::date + INTERVAL '1 day'
    GROUP BY cta_type
    ORDER BY count DESC
  `;
  return rows.map((r) => ({ ctaType: r.cta_type as string, count: Number(r.count) }));
}

/**
 * CTA conversion rate: unique readers who completed a CTA / unique readers.
 */
export async function getCtaConversionRate(articleId: number, range: DateRange): Promise<number> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      COALESCE(SUM(d.unique_readers), 0) AS readers,
      COUNT(DISTINCT CASE WHEN c.id IS NOT NULL THEN c.reader_hash END) AS converters
    FROM article_analytics_daily d
    LEFT JOIN article_cta_events c
      ON c.article_id = d.article_id
      AND c.created_at >= ${range.start}::date
      AND c.created_at <= ${range.end}::date + INTERVAL '1 day'
    WHERE d.article_id = ${articleId} AND d.day >= ${range.start}::date AND d.day <= ${range.end}::date
  `;
  const r = rows[0] ?? {};
  const readers = Number(r.readers ?? 0);
  const converters = Number(r.converters ?? 0);
  return readers ? Math.round((converters / readers) * 1000) / 10 : 0;
}

/**
 * Google Search Console performance for a single article (from the cache).
 * Returns available=false when Search Console is not connected or no data.
 */
export async function getArticleSearchPerformance(
  articleId: number
): Promise<ArticleSearchPerformance> {
  const sql = getSql();
  const status = await getSearchConsoleStatus();
  if (!status.connected) {
    return { impressions: 0, clicks: 0, ctr: 0, avgPosition: 0, available: false };
  }
  const rows = await sql`
    SELECT
      COALESCE(SUM(impressions), 0) AS impressions,
      COALESCE(SUM(clicks), 0) AS clicks,
      COALESCE(AVG(position), 0) AS avg_position
    FROM article_search_queries
    WHERE article_id = ${articleId}
  `;
  const r = rows[0] ?? {};
  const impressions = Number(r.impressions ?? 0);
  const clicks = Number(r.clicks ?? 0);
  return {
    impressions,
    clicks,
    ctr: impressions ? Math.round((clicks / impressions) * 1000) / 10 : 0,
    avgPosition: Math.round(Number(r.avg_position ?? 0) * 10) / 10,
    available: true,
  };
}

/**
 * Top search queries for a single article (from the Search Console cache).
 */
export async function getArticleSearchQueries(articleId: number): Promise<SearchQueryRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT query, impressions, clicks, position
    FROM article_search_queries
    WHERE article_id = ${articleId}
    ORDER BY clicks DESC, impressions DESC
    LIMIT 50
  `;
  return rows.map((r) => {
    const impressions = Number(r.impressions ?? 0);
    const clicks = Number(r.clicks ?? 0);
    return {
      query: r.query as string,
      impressions,
      clicks,
      ctr: impressions ? Math.round((clicks / impressions) * 1000) / 10 : 0,
      position: Math.round(Number(r.position ?? 0) * 10) / 10,
    };
  });
}

/**
 * Search Console connection status (single-row config table).
 */
export async function getSearchConsoleStatus(): Promise<SearchConsoleStatus> {
  const sql = getSql();
  const rows = await sql`SELECT * FROM search_console_config WHERE id = 1`;
  const r = rows[0];
  if (!r) return { connected: false, siteUrl: null, lastSyncAt: null, lastError: null };
  return {
    connected: Boolean(r.connected),
    siteUrl: (r.site_url as string | null) ?? null,
    lastSyncAt: r.last_sync_at ? (r.last_sync_at as Date) : null,
    lastError: (r.last_error as string | null) ?? null,
  };
}

/**
 * Category intelligence: aggregate analytics grouped by story category.
 * Helps answer "what should Vantage write more about?"
 */
export async function getCategoryIntelligence(range: DateRange): Promise<CategoryIntelligenceRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      s.category,
      COUNT(DISTINCT s.id) AS article_count,
      COALESCE(SUM(d.unique_readers), 0) AS total_readers,
      COALESCE(SUM(d.engagement_seconds_total), 0) AS engagement_total,
      COALESCE(SUM(d.scroll_90), 0) AS completions,
      COALESCE(SUM(d.organic_clicks), 0) AS search_clicks,
      COALESCE(SUM(d.shares), 0) AS shares,
      COALESCE(SUM(d.cta_clicks), 0) AS cta_clicks
    FROM stories s
    LEFT JOIN article_analytics_daily d
      ON d.article_id = s.id AND d.day >= ${range.start}::date AND d.day <= ${range.end}::date
    WHERE s.deleted_at IS NULL AND s.published = true
    GROUP BY s.category
    ORDER BY total_readers DESC
  `;
  return rows.map((r) => {
    const articleCount = Number(r.article_count ?? 0);
    const totalReaders = Number(r.total_readers ?? 0);
    const engagementTotal = Number(r.engagement_total ?? 0);
    const completions = Number(r.completions ?? 0);
    const ctaClicks = Number(r.cta_clicks ?? 0);
    const avgImpactScore = 0; // placeholder; computed per-article elsewhere
    return {
      category: r.category as string,
      articleCount,
      totalReaders,
      avgReadersPerArticle: articleCount ? Math.round(totalReaders / articleCount) : 0,
      avgEngagementSeconds: totalReaders ? Math.round(engagementTotal / totalReaders) : 0,
      completionRate: totalReaders ? Math.round((completions / totalReaders) * 1000) / 10 : 0,
      searchClicks: Number(r.search_clicks ?? 0),
      shares: Number(r.shares ?? 0),
      ctaConversionRate: totalReaders ? Math.round((ctaClicks / totalReaders) * 1000) / 10 : 0,
      avgImpactScore,
    };
  });
}

/**
 * Trend over time for a single metric, optionally filtered to one article.
 * Returns one point per day in the range.
 */
export async function getTrend(
  metric: "views" | "readers" | "google_clicks" | "engagement" | "shares" | "cta_conversions",
  range: DateRange,
  articleId?: number
): Promise<TrendPoint[]> {
  const sql = getSql();
  // Use explicit queries per metric since the neon tagged template does not
  // support dynamic column-name interpolation.
  const articleFilter = articleId != null ? sql`AND article_id = ${articleId}` : sql``;
  // neon returns Record<string, any>[]; we map to TrendPoint below.
  let rows: Record<string, unknown>[];
  if (metric === "views") {
    rows = await sql`
      SELECT day, COALESCE(SUM(views), 0) AS value
      FROM article_analytics_daily
      WHERE day >= ${range.start}::date AND day <= ${range.end}::date ${articleFilter}
      GROUP BY day ORDER BY day ASC
    `;
  } else if (metric === "readers") {
    rows = await sql`
      SELECT day, COALESCE(SUM(unique_readers), 0) AS value
      FROM article_analytics_daily
      WHERE day >= ${range.start}::date AND day <= ${range.end}::date ${articleFilter}
      GROUP BY day ORDER BY day ASC
    `;
  } else if (metric === "google_clicks") {
    rows = await sql`
      SELECT day, COALESCE(SUM(organic_clicks), 0) AS value
      FROM article_analytics_daily
      WHERE day >= ${range.start}::date AND day <= ${range.end}::date ${articleFilter}
      GROUP BY day ORDER BY day ASC
    `;
  } else if (metric === "engagement") {
    rows = await sql`
      SELECT day, COALESCE(SUM(engagement_seconds_total), 0) AS value
      FROM article_analytics_daily
      WHERE day >= ${range.start}::date AND day <= ${range.end}::date ${articleFilter}
      GROUP BY day ORDER BY day ASC
    `;
  } else if (metric === "shares") {
    rows = await sql`
      SELECT day, COALESCE(SUM(shares), 0) AS value
      FROM article_analytics_daily
      WHERE day >= ${range.start}::date AND day <= ${range.end}::date ${articleFilter}
      GROUP BY day ORDER BY day ASC
    `;
  } else {
    rows = await sql`
      SELECT day, COALESCE(SUM(cta_clicks), 0) AS value
      FROM article_analytics_daily
      WHERE day >= ${range.start}::date AND day <= ${range.end}::date ${articleFilter}
      GROUP BY day ORDER BY day ASC
    `;
  }
  return rows.map((r) => ({ day: String(r.day), value: Number(r.value ?? 0) }));
}

// ---------------------------------------------------------------------------
// Article Impact Score
// ---------------------------------------------------------------------------
//
// The Impact Score prevents raw page views from becoming the only definition
// of successful content. It normalises each metric against the best-performing
// article in the current cohort so a single viral article cannot distort the
// score, then applies the following weighting:
//
//   Reach            25%  — views + unique readers (normalised)
//   Engagement       25%  — completion rate + avg engagement (normalised)
//   Search           20%  — organic Google clicks (normalised)
//   Amplification    15%  — shares (normalised)
//   Action           15%  — CTA actions / conversion (normalised)
//
// Each sub-score is scaled to its weight's max (25/25/20/15/15). The total is
// 0–100. This is an internal editorial comparison tool, not an absolute
// measure — it is most meaningful when comparing articles within the same
// date range.
//
// Normalisation: for a metric value v and cohort max M, the normalised score
// is min(v / M, 1) * weightMax. When M is 0 (no data in cohort), the sub-score
// is 0. This prevents division-by-zero and keeps the score bounded.

export interface ImpactScoreInput {
  views: number;
  readers: number;
  completionRate: number;
  avgEngagementSeconds: number;
  shares: number;
  googleClicks: number;
  ctaActions: number;
}

export interface ImpactScoreCohortMax {
  reach: number;
  engagement: number;
  search: number;
  amplification: number;
  action: number;
}

/**
 * Computes the Impact Score for a single article given its metrics and the
 * cohort maximums (the best values across the comparison set). When cohort
 * maxes are not supplied (single-article view), each sub-score is capped at
 * a sensible absolute ceiling so the score is still meaningful in isolation.
 */
export function computeImpactScore(
  input: ImpactScoreInput,
  cohort?: ImpactScoreCohortMax
): ImpactScoreBreakdown {
  // Default absolute ceilings used when no cohort is provided (single-article
  // view). These represent a "strong" article so a typical article scores
  // in the 40–70 range rather than always 100.
  const reachMax = cohort?.reach ?? 5000;
  const engagementMax = cohort?.engagement ?? 60; // completion rate % ceiling
  const searchMax = cohort?.search ?? 500;
  const amplificationMax = cohort?.amplification ?? 100;
  const actionMax = cohort?.action ?? 50;

  // Reach: blend of views and readers (50/50) so a few repeat views don't
  // dominate, then normalise against the cohort max.
  const reachRaw = (input.views * 0.5 + input.readers * 0.5);
  const reach = reachMax > 0 ? Math.min(reachRaw / reachMax, 1) * 25 : 0;

  // Engagement: blend completion rate (70%) and engagement time (30%).
  // Engagement time normalised against a 5-minute (300s) "fully engaged" read.
  const engagementPct = input.completionRate * 0.7 + Math.min(input.avgEngagementSeconds / 300, 1) * 100 * 0.3;
  const engagement = engagementMax > 0 ? Math.min(engagementPct / engagementMax, 1) * 25 : 0;

  const search = searchMax > 0 ? Math.min(input.googleClicks / searchMax, 1) * 20 : 0;
  const amplification = amplificationMax > 0 ? Math.min(input.shares / amplificationMax, 1) * 15 : 0;
  const action = actionMax > 0 ? Math.min(input.ctaActions / actionMax, 1) * 15 : 0;

  return {
    total: Math.round(reach + engagement + search + amplification + action),
    reach: Math.round(reach),
    reachMax: 25,
    engagement: Math.round(engagement),
    engagementMax: 25,
    search: Math.round(search),
    searchMax: 20,
    amplification: Math.round(amplification),
    amplificationMax: 15,
    action: Math.round(action),
    actionMax: 15,
  };
}

/**
 * Computes cohort maximums from a set of article performance rows, then
 * returns Impact Score breakdowns keyed by article id. Use this when ranking
 * a table of articles so scores are comparable to one another.
 */
export function computeImpactScoresForCohort(
  rows: ArticlePerformanceRow[]
): Map<number, ImpactScoreBreakdown> {
  const cohort: ImpactScoreCohortMax = {
    reach: Math.max(...rows.map((r) => r.views * 0.5 + r.readers * 0.5), 1),
    engagement: Math.max(...rows.map((r) => r.completionRate), 1),
    search: Math.max(...rows.map((r) => r.googleClicks), 1),
    amplification: Math.max(...rows.map((r) => r.shares), 1),
    action: Math.max(...rows.map((r) => r.ctaActions), 1),
  };
  const map = new Map<number, ImpactScoreBreakdown>();
  for (const row of rows) {
    map.set(row.articleId, computeImpactScore({
      views: row.views,
      readers: row.readers,
      completionRate: row.completionRate,
      avgEngagementSeconds: row.avgEngagementSeconds,
      shares: row.shares,
      googleClicks: row.googleClicks,
      ctaActions: row.ctaActions,
    }, cohort));
  }
  return map;
}

// ---------------------------------------------------------------------------
// Search Console cache writes (called by the server-side sync job)
// ---------------------------------------------------------------------------

export async function upsertSearchQuery(
  articleId: number,
  query: string,
  impressions: number,
  clicks: number,
  position: number
): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO article_search_queries (article_id, query, impressions, clicks, position, date_fetched)
    VALUES (${articleId}, ${query}, ${impressions}, ${clicks}, ${position}, NOW())
    ON CONFLICT (article_id, query) DO UPDATE SET
      impressions = EXCLUDED.impressions,
      clicks = EXCLUDED.clicks,
      position = EXCLUDED.position,
      date_fetched = NOW()
  `;
}

export async function setSearchConsoleStatus(status: {
  connected: boolean;
  siteUrl?: string | null;
  lastError?: string | null;
}): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE search_console_config SET
      connected = ${status.connected},
      site_url = ${status.siteUrl ?? null},
      last_sync_at = NOW(),
      last_error = ${status.lastError ?? null}
    WHERE id = 1
  `;
}

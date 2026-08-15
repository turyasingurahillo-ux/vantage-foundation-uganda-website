import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { logError } from "@/lib/logger";
import {
  getOverview,
  getArticlePerformance,
  getReadingFunnel,
  getTrafficSources,
  getShareBreakdown,
  getCtaBreakdown,
  getCtaConversionRate,
  getArticleSearchPerformance,
  getArticleSearchQueries,
  getSearchConsoleStatus,
  getCategoryIntelligence,
  getTrend,
  computeImpactScore,
  computeImpactScoresForCohort,
  resolveDateRange,
  previousRange,
  type DatePreset,
} from "@/lib/db/analytics";

/**
 * Admin analytics API. Returns aggregated content intelligence for the
 * Stories & Insights analytics dashboard. All queries hit the pre-aggregated
 * article_analytics_daily table — no raw event scanning on dashboard load.
 *
 * Query params:
 *   - report: overview | articles | article-detail | traffic | reading-funnel |
 *             shares | ctas | search-performance | search-queries |
 *             search-console-status | categories | trend
 *   - range: 7d | 30d | 90d | year | all | custom
 *   - start, end: custom range dates (when range=custom)
 *   - articleId: for article-detail / traffic / reading-funnel / shares / ctas
 *   - metric: for trend (views | readers | google_clicks | engagement | shares | cta_conversions)
 *   - compare: 1 to include previous-period comparison
 */

async function guard(request: Request) {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(sessionCookieName)?.value);
  if (!session) {
    return { ok: false as const, response: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }
  const ip = getClientIp(request.headers);
  if (!rateLimit({ key: `analytics-admin:${ip}`, limit: 60, windowMs: 60_000 })) {
    return { ok: false as const, response: NextResponse.json({ error: "rate-limited" }, { status: 429 }) };
  }
  return { ok: true as const };
}

export async function GET(request: Request) {
  const guarded = await guard(request);
  if (!guarded.ok) return guarded.response;

  const url = new URL(request.url);
  const report = url.searchParams.get("report") ?? "overview";
  const rangeParam = (url.searchParams.get("range") ?? "30d") as DatePreset;
  const customStart = url.searchParams.get("start") ?? undefined;
  const customEnd = url.searchParams.get("end") ?? undefined;
  const articleIdParam = url.searchParams.get("articleId");
  const articleId = articleIdParam ? Number(articleIdParam) : undefined;
  const metric = url.searchParams.get("metric") ?? "views";
  const compare = url.searchParams.get("compare") === "1";

  try {
    const range = resolveDateRange(rangeParam, { start: customStart, end: customEnd });

    switch (report) {
      case "overview": {
        const current = await getOverview(range);
        let previous = null;
        if (compare) {
          previous = await getOverview(previousRange(range));
        }
        return NextResponse.json({ current, previous, range });
      }

      case "articles": {
        const rows = await getArticlePerformance(range);
        const scores = computeImpactScoresForCohort(rows);
        return NextResponse.json({
          articles: rows.map((r) => ({
            ...r,
            impactScore: scores.get(r.articleId)?.total ?? 0,
          })),
          range,
        });
      }

      case "article-detail": {
        if (!articleId) return NextResponse.json({ error: "articleId required" }, { status: 400 });
        const id = articleId;
        const [performance, funnel, traffic, shares, ctas, ctaRate, searchPerf] = await Promise.all([
          getArticlePerformance(range).then((rows) => rows.find((r) => r.articleId === id) ?? null),
          getReadingFunnel(id, range),
          getTrafficSources(id, range),
          getShareBreakdown(id, range),
          getCtaBreakdown(id, range),
          getCtaConversionRate(id, range),
          getArticleSearchPerformance(id),
        ]);
        const searchStatus = await getSearchConsoleStatus();
        const impactScore = performance
          ? computeImpactScore({
              views: performance.views,
              readers: performance.readers,
              completionRate: performance.completionRate,
              avgEngagementSeconds: performance.avgEngagementSeconds,
              shares: performance.shares,
              googleClicks: performance.googleClicks,
              ctaActions: performance.ctaActions,
            })
          : computeImpactScore({ views: 0, readers: 0, completionRate: 0, avgEngagementSeconds: 0, shares: 0, googleClicks: 0, ctaActions: 0 });
        let previousOverview = null;
        if (compare) {
          const prevRange = previousRange(range);
          const [prevFunnel, prevTraffic] = await Promise.all([
            getReadingFunnel(id, prevRange),
            getTrafficSources(id, prevRange),
          ]);
          previousOverview = { funnel: prevFunnel, traffic: prevTraffic };
        }
        return NextResponse.json({
          performance,
          funnel,
          traffic,
          shares,
          ctas,
          ctaRate,
          searchPerf,
          searchStatus,
          impactScore,
          previous: previousOverview,
          range,
        });
      }

      case "reading-funnel": {
        if (!articleId) return NextResponse.json({ error: "articleId required" }, { status: 400 });
        const funnel = await getReadingFunnel(articleId, range);
        return NextResponse.json({ funnel, range });
      }

      case "traffic": {
        const traffic = await getTrafficSources(articleId ?? null, range);
        return NextResponse.json({ traffic, range });
      }

      case "shares": {
        if (!articleId) return NextResponse.json({ error: "articleId required" }, { status: 400 });
        const shares = await getShareBreakdown(articleId, range);
        return NextResponse.json({ shares, range });
      }

      case "ctas": {
        if (!articleId) return NextResponse.json({ error: "articleId required" }, { status: 400 });
        const [ctas, ctaRate] = await Promise.all([
          getCtaBreakdown(articleId, range),
          getCtaConversionRate(articleId, range),
        ]);
        return NextResponse.json({ ctas, ctaRate, range });
      }

      case "search-performance": {
        if (!articleId) return NextResponse.json({ error: "articleId required" }, { status: 400 });
        const perf = await getArticleSearchPerformance(articleId);
        return NextResponse.json({ searchPerformance: perf, range });
      }

      case "search-queries": {
        if (!articleId) return NextResponse.json({ error: "articleId required" }, { status: 400 });
        const queries = await getArticleSearchQueries(articleId);
        return NextResponse.json({ queries, range });
      }

      case "search-console-status": {
        const status = await getSearchConsoleStatus();
        return NextResponse.json({ status });
      }

      case "categories": {
        const categories = await getCategoryIntelligence(range);
        return NextResponse.json({ categories, range });
      }

      case "trend": {
        const trend = await getTrend(
          metric as "views" | "readers" | "google_clicks" | "engagement" | "shares" | "cta_conversions",
          range,
          articleId
        );
        return NextResponse.json({ trend, metric, range });
      }

      default:
        return NextResponse.json({ error: "unknown report" }, { status: 400 });
    }
  } catch (error) {
    logError("analytics_admin_failed", { report, error: String(error).slice(0, 200) });
    return NextResponse.json({ error: "db" }, { status: 500 });
  }
}

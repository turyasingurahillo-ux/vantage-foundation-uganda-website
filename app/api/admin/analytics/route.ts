import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { logError } from "@/lib/logger";
import {
  getReadingFunnel,
  getTrafficSources,
  getShareBreakdown,
  getCtaBreakdown,
  getCtaConversionRate,
  getArticleSearchPerformance,
  getArticleSearchQueries,
  getSearchConsoleStatus,
  computeImpactScore,
  resolveDateRange,
  previousRange,
  type DatePreset,
} from "@/lib/db/analytics";
import {
  computeFoundationImpactScores,
  getFoundationArticlePerformance,
  getFoundationCategoryIntelligence,
  getFoundationOverview,
  getFoundationTrend,
} from "@/lib/db/analytics-foundation";

/**
 * Admin analytics API. Returns aggregated content intelligence for the
 * Stories & Insights analytics dashboard.
 *
 * Identity contract for article rows:
 *   analyticsArticleId -> analytics_articles.id -> analytics queries
 *   storyId            -> stories.id -> editorial routes/mutations
 *   slug               -> /stories/[slug] -> public route
 *
 * Search Console clicks are sourced from article_search_queries, which is a
 * current query-window cache rather than a daily event store. The API does not
 * fabricate daily Search Console history by copying cumulative totals into the
 * daily rollup.
 *
 * Query params:
 *   - report: overview | articles | article-detail | traffic | reading-funnel |
 *             shares | ctas | search-performance | search-queries |
 *             search-console-status | categories | trend
 *   - range: 7d | 30d | 90d | year | all | custom
 *   - start, end: custom range dates (when range=custom)
 *   - articleId: analytics_articles.id for article analytics reports
 *   - metric: for trend (views | readers | google_clicks | engagement | shares | cta_conversions)
 *   - compare: 1 to include previous-period comparison
 */

async function guard(request: Request) {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(sessionCookieName)?.value);
  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "unauthorized" }, { status: 401 }),
    };
  }
  const ip = getClientIp(request.headers);
  if (!rateLimit({ key: `analytics-admin:${ip}`, limit: 60, windowMs: 60_000 })) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "rate-limited" }, { status: 429 }),
    };
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
    const range = resolveDateRange(rangeParam, {
      start: customStart,
      end: customEnd,
    });

    switch (report) {
      case "overview": {
        const current = await getFoundationOverview(range);
        let previous = null;
        if (compare) {
          // Search Console is a current query-window cache, so there is no
          // mathematically valid previous-period click value to compare here.
          previous = await getFoundationOverview(previousRange(range), {
            includeSearchWindow: false,
          });
        }
        return NextResponse.json({
          current,
          previous,
          range,
          searchConsoleMetricScope: "current-query-window",
        });
      }

      case "articles": {
        const rows = await getFoundationArticlePerformance(range);
        const scores = computeFoundationImpactScores(rows);
        return NextResponse.json({
          articles: rows.map((r) => ({
            ...r,
            impactScore: scores.get(r.analyticsArticleId)?.total ?? 0,
          })),
          range,
          searchConsoleMetricScope: "current-query-window",
        });
      }

      case "article-detail": {
        if (!articleId) {
          return NextResponse.json(
            { error: "articleId required" },
            { status: 400 },
          );
        }
        const analyticsArticleId = articleId;
        const [performance, funnel, traffic, shares, ctas, ctaRate, searchPerf] =
          await Promise.all([
            getFoundationArticlePerformance(range).then(
              (rows) =>
                rows.find(
                  (r) => r.analyticsArticleId === analyticsArticleId,
                ) ?? null,
            ),
            getReadingFunnel(analyticsArticleId, range),
            getTrafficSources(analyticsArticleId, range),
            getShareBreakdown(analyticsArticleId, range),
            getCtaBreakdown(analyticsArticleId, range),
            getCtaConversionRate(analyticsArticleId, range),
            getArticleSearchPerformance(analyticsArticleId),
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
          : computeImpactScore({
              views: 0,
              readers: 0,
              completionRate: 0,
              avgEngagementSeconds: 0,
              shares: 0,
              googleClicks: 0,
              ctaActions: 0,
            });
        let previousOverview = null;
        if (compare) {
          const prevRange = previousRange(range);
          const [prevFunnel, prevTraffic] = await Promise.all([
            getReadingFunnel(analyticsArticleId, prevRange),
            getTrafficSources(analyticsArticleId, prevRange),
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
          searchConsoleMetricScope: "current-query-window",
        });
      }

      case "reading-funnel": {
        if (!articleId) {
          return NextResponse.json(
            { error: "articleId required" },
            { status: 400 },
          );
        }
        const funnel = await getReadingFunnel(articleId, range);
        return NextResponse.json({ funnel, range });
      }

      case "traffic": {
        const traffic = await getTrafficSources(articleId ?? null, range);
        return NextResponse.json({ traffic, range });
      }

      case "shares": {
        if (!articleId) {
          return NextResponse.json(
            { error: "articleId required" },
            { status: 400 },
          );
        }
        const shares = await getShareBreakdown(articleId, range);
        return NextResponse.json({ shares, range });
      }

      case "ctas": {
        if (!articleId) {
          return NextResponse.json(
            { error: "articleId required" },
            { status: 400 },
          );
        }
        const [ctas, ctaRate] = await Promise.all([
          getCtaBreakdown(articleId, range),
          getCtaConversionRate(articleId, range),
        ]);
        return NextResponse.json({ ctas, ctaRate, range });
      }

      case "search-performance": {
        if (!articleId) {
          return NextResponse.json(
            { error: "articleId required" },
            { status: 400 },
          );
        }
        const perf = await getArticleSearchPerformance(articleId);
        return NextResponse.json({ searchPerformance: perf, range });
      }

      case "search-queries": {
        if (!articleId) {
          return NextResponse.json(
            { error: "articleId required" },
            { status: 400 },
          );
        }
        const queries = await getArticleSearchQueries(articleId);
        return NextResponse.json({ queries, range });
      }

      case "search-console-status": {
        const status = await getSearchConsoleStatus();
        return NextResponse.json({ status });
      }

      case "categories": {
        const categories = await getFoundationCategoryIntelligence(range);
        return NextResponse.json({
          categories,
          range,
          searchConsoleMetricScope: "current-query-window",
        });
      }

      case "trend": {
        const trend = await getFoundationTrend(
          metric as
            | "views"
            | "readers"
            | "google_clicks"
            | "engagement"
            | "shares"
            | "cta_conversions",
          range,
          articleId,
        );
        return NextResponse.json({
          trend,
          metric,
          range,
          dailyAvailable: metric !== "google_clicks",
          searchConsoleMetricScope:
            metric === "google_clicks" ? "current-query-window" : undefined,
        });
      }

      default:
        return NextResponse.json({ error: "unknown report" }, { status: 400 });
    }
  } catch (error) {
    logError("analytics_admin_failed", {
      report,
      error: String(error).slice(0, 200),
    });
    return NextResponse.json({ error: "db" }, { status: 500 });
  }
}

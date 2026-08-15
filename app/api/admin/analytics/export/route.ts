import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { logError } from "@/lib/logger";
import {
  getArticlePerformance,
  getArticleSearchPerformance,
  resolveDateRange,
  type DatePreset,
} from "@/lib/db/analytics";

/**
 * CSV export of article performance for donor/board/grant reporting.
 *
 * Fields: Article, Author, Category, Publication date, Views, Readers,
 * Engagement time, Completion rate, Shares, Google impressions, Google clicks,
 * CTR, CTA actions, Conversion rate, Impact Score.
 */

function csvEscape(value: string | number | null | undefined): string {
  if (value == null) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function formatDuration(seconds: number): string {
  if (!seconds) return "0s";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  if (!verifySessionToken(cookieStore.get(sessionCookieName)?.value)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const ip = getClientIp(request.headers);
  if (!rateLimit({ key: `analytics-export:${ip}`, limit: 10, windowMs: 60_000 })) {
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }

  const url = new URL(request.url);
  const rangeParam = (url.searchParams.get("range") ?? "30d") as DatePreset;
  const customStart = url.searchParams.get("start") ?? undefined;
  const customEnd = url.searchParams.get("end") ?? undefined;

  try {
    const range = resolveDateRange(rangeParam, { start: customStart, end: customEnd });
    const articles = await getArticlePerformance(range);

    // Fetch search performance per article for the CSV (best-effort).
    const searchPerf = await Promise.all(
      articles.map((a) => getArticleSearchPerformance(a.articleId).catch(() => ({ impressions: 0, clicks: 0, ctr: 0, avgPosition: 0, available: false })))
    );

    const headers = [
      "Article", "Author", "Category", "Publication date",
      "Views", "Readers", "Engagement time", "Completion rate",
      "Shares", "Google impressions", "Google clicks", "CTR",
      "CTA actions", "Conversion rate", "Impact Score",
    ];

    const rows = articles.map((a, i) => {
      const sp = searchPerf[i];
      const ctr = sp.impressions ? ((sp.clicks / sp.impressions) * 100).toFixed(1) : "—";
      return [
        a.title, a.author ?? "", a.category, a.publishedDate,
        a.views, a.readers, formatDuration(a.avgEngagementSeconds), `${a.completionRate}%`,
        a.shares, sp.available ? sp.impressions : "—", sp.available ? sp.clicks : "—", ctr,
        a.ctaActions, a.readers ? `${((a.ctaActions / a.readers) * 100).toFixed(1)}%` : "—", a.impactScore,
      ].map(csvEscape).join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const filename = `vantage-article-performance-${range.start}-to-${range.end}.csv`;
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    logError("analytics_export_failed", { error: String(error).slice(0, 200) });
    return NextResponse.json({ error: "db" }, { status: 500 });
  }
}

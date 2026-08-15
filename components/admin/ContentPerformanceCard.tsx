"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/**
 * ContentPerformanceCard — compact summary for the main admin dashboard.
 * Shows this month's content KPIs and the top performing article, with a link
 * to the full Content Analytics dashboard.
 */

interface OverviewData {
  totalViews: number;
  uniqueReaders: number;
  avgEngagementSeconds: number;
  avgCompletionRate: number;
  totalShares: number;
  organicClicks: number;
  ctaActions: number;
}

interface TopArticle {
  articleId: number;
  title: string;
  slug: string;
  impactScore: number;
  readers: number;
  completionRate: number;
}

function formatNumber(n: number): string { return n.toLocaleString(); }
function formatPct(p: number): string { return p > 0 ? `${p}%` : "—"; }

export function ContentPerformanceCard() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [topArticle, setTopArticle] = useState<TopArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbAvailable, setDbAvailable] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/analytics?report=overview&range=30d").then((r) => r.json()),
      fetch("/api/admin/analytics?report=articles&range=30d").then((r) => r.json()),
    ])
      .then(([ov, art]) => {
        if (ov.error === "db") { setDbAvailable(false); return; }
        setOverview(ov.current ?? null);
        const articles = art.articles ?? [];
        if (articles.length > 0) {
          const top = [...articles].sort((a: { impactScore: number }, b: { impactScore: number }) => b.impactScore - a.impactScore)[0];
          setTopArticle(top);
        }
      })
      .catch(() => setDbAvailable(false))
      .finally(() => setLoading(false));
  }, []);

  if (!dbAvailable) {
    return (
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Content performance</h2>
        <p className="mt-2 text-sm text-muted-foreground">Analytics tables not set up. Run <code className="rounded bg-slate-100 px-1 text-xs">node scripts/setup-db.mjs</code> to enable content analytics.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Content performance</h2>
        <span className="text-xs text-muted-foreground">This month</span>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
      ) : overview ? (
        <>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-5">
            <MiniMetric label="Article readers" value={formatNumber(overview.uniqueReaders)} />
            <MiniMetric label="Google clicks" value={formatNumber(overview.organicClicks)} />
            <MiniMetric label="Avg. completion" value={formatPct(overview.avgCompletionRate)} />
            <MiniMetric label="Shares" value={formatNumber(overview.totalShares)} />
            <MiniMetric label="CTA actions" value={formatNumber(overview.ctaActions)} />
          </div>

          {topArticle && (
            <div className="mt-6 rounded-lg border border-border bg-surface p-4">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Top performing article</div>
              <Link href={`/admin/stories/${topArticle.articleId}`} className="mt-1 block font-semibold text-primary hover:underline">
                {topArticle.title}
              </Link>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>Impact Score: <strong className="text-foreground">{topArticle.impactScore}/100</strong></span>
                <span>Readers: <strong className="text-foreground">{formatNumber(topArticle.readers)}</strong></span>
                <span>Completion: <strong className="text-foreground">{formatPct(topArticle.completionRate)}</strong></span>
              </div>
            </div>
          )}

          <Link href="/admin/stories" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
            View Content Analytics →
          </Link>
        </>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">No analytics data yet. Content performance will appear once readers start viewing articles.</p>
      )}
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

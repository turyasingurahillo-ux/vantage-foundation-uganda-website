"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DonutChart,
  BarChart,
  FunnelChart,
  LineChart,
  type DonutSlice,
  type BarItem,
  type FunnelStage,
  type LinePoint,
} from "@/components/admin/charts/Charts";

/**
 * ArticleAnalyticsDetail — the per-article analytics view shown on the
 * /admin/stories/[id] page. Progressive disclosure: performance overview →
 * reading behaviour funnel → traffic sources → Google search → sharing →
 * CTA/impact → Impact Score breakdown.
 *
 * Distinguishes "0 = measured and none occurred" from "— = data unavailable"
 * per the brief's empty-state requirements.
 */

type DatePreset = "7d" | "30d" | "90d" | "year" | "all" | "custom";

const PRESET_LABELS: Record<DatePreset, string> = {
  "7d": "7 days", "30d": "30 days", "90d": "90 days", year: "This year", all: "All time", custom: "Custom",
};

const SOURCE_LABELS: Record<string, string> = {
  google: "Google / Organic", direct: "Direct", whatsapp: "WhatsApp", linkedin: "LinkedIn",
  instagram: "Instagram", x: "X", facebook: "Facebook", "other-social": "Other Social",
  referral: "Referral", email: "Email", other: "Other",
};

function formatNumber(n: number): string { return n.toLocaleString(); }
function formatDuration(s: number): string { if (!s) return "—"; const m = Math.floor(s / 60); const sec = s % 60; return m > 0 ? `${m}m ${sec}s` : `${sec}s`; }
function formatPct(p: number): string { return p > 0 ? `${p}%` : "—"; }
function dash(value: number, available: boolean): string { return available ? (value > 0 ? formatNumber(value) : "0") : "—"; }

interface ImpactScoreData {
  total: number; reach: number; reachMax: number; engagement: number; engagementMax: number;
  search: number; searchMax: number; amplification: number; amplificationMax: number;
  action: number; actionMax: number;
}

interface ArticleDetailData {
  performance: {
    views: number; readers: number; avgEngagementSeconds: number; completionRate: number;
    shares: number; ctaActions: number; googleClicks: number;
  } | null;
  funnel: { opened: number; reached25: number; reached50: number; reached75: number; reached90: number; completionRate: number };
  traffic: { sourceGroup: string; readers: number; percentage: number; engagementSeconds: number; completionRate: number }[];
  shares: { platform: string; count: number }[];
  ctas: { ctaType: string; count: number }[];
  ctaRate: number;
  searchPerf: { impressions: number; clicks: number; ctr: number; avgPosition: number; available: boolean };
  searchStatus: { connected: boolean; siteUrl: string | null; lastSyncAt: string | null; lastError: string | null };
  impactScore: ImpactScoreData;
  previous: { funnel: ArticleDetailData["funnel"]; traffic: ArticleDetailData["traffic"] } | null;
}

export function ArticleAnalyticsDetail({ articleId }: { articleId: number }) {
  const [range, setRange] = useState<DatePreset>("30d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ArticleDetailData | null>(null);
  const [trendData, setTrendData] = useState<LinePoint[]>([]);
  const [trendMetric, setTrendMetric] = useState("views");
  const [dbAvailable, setDbAvailable] = useState(true);

  const buildQuery = useCallback((report: string, extra?: Record<string, string>) => {
    const params = new URLSearchParams({ report, range, articleId: String(articleId) });
    if (range === "custom" && customStart && customEnd) { params.set("start", customStart); params.set("end", customEnd); }
    params.set("compare", "1");
    if (extra) for (const [k, v] of Object.entries(extra)) params.set(k, v);
    return `/api/admin/analytics?${params.toString()}`;
  }, [range, articleId, customStart, customEnd]);

  useEffect(() => {
    if (range === "custom" && (!customStart || !customEnd)) return;
    let cancelled = false;
    Promise.resolve().then(async () => {
      if (cancelled) return;
      setLoading(true);
      try {
        const res = await fetch(buildQuery("article-detail"));
        const d = await res.json();
        if (cancelled) return;
        if (d.error === "db") { setDbAvailable(false); return; }
        setDbAvailable(true);
        setData(d);
      } catch {
        if (!cancelled) setDbAvailable(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
      try {
        const tr = await fetch(buildQuery("trend", { metric: trendMetric }));
        const td = await tr.json();
        if (cancelled) return;
        setTrendData((td.trend ?? []).map((t: { day: string; value: number }) => ({ label: t.day, value: t.value })));
      } catch {
        // trend fetch failure is non-critical
      }
    });
    return () => { cancelled = true; };
  }, [range, customStart, customEnd, articleId, trendMetric, buildQuery]);

  if (!dbAvailable) {
    return <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted-foreground">Analytics database tables are not set up yet. Run `node scripts/setup-db.mjs` to create them.</div>;
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading article analytics…</p>;
  if (!data) return null;

  const p = data.performance;
  const hasData = p && (p.views > 0 || p.readers > 0);
  const is = data.impactScore;

  const funnelStages: FunnelStage[] = [
    { label: "Opened", value: data.funnel.opened },
    { label: "25%", value: data.funnel.reached25 },
    { label: "50%", value: data.funnel.reached50 },
    { label: "75%", value: data.funnel.reached75 },
    { label: "90%", value: data.funnel.reached90 },
  ];

  const donutData: DonutSlice[] = data.traffic.map((t) => ({
    label: SOURCE_LABELS[t.sourceGroup] ?? t.sourceGroup,
    value: t.readers,
  }));

  const shareBars: BarItem[] = data.shares.map((s) => ({ label: s.platform, value: s.count }));
  const ctaBars: BarItem[] = data.ctas.map((c) => ({ label: c.ctaType, value: c.count }));

  return (
    <div className="space-y-6">
      {/* Date filter */}
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(PRESET_LABELS) as DatePreset[]).filter((p) => p !== "custom").map((p) => (
          <button key={p} type="button" onClick={() => setRange(p)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${range === p ? "bg-primary text-white" : "border border-border bg-white hover:bg-slate-50"}`}>
            {PRESET_LABELS[p]}
          </button>
        ))}
        <button type="button" onClick={() => setRange("custom")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${range === "custom" ? "bg-primary text-white" : "border border-border bg-white hover:bg-slate-50"}`}>
          Custom
        </button>
        {range === "custom" && (
          <div className="flex items-center gap-2">
            <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="rounded-lg border border-border px-2 py-1.5 text-sm" />
            <span className="text-muted-foreground">to</span>
            <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="rounded-lg border border-border px-2 py-1.5 text-sm" />
          </div>
        )}
      </div>

      {!hasData && (
        <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
          <p className="text-sm text-muted-foreground">This article was recently published or has not received enough readers yet. Analytics will appear here once readers start viewing it.</p>
        </div>
      )}

      {/* Performance overview */}
      {hasData && p && (
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold">Performance overview</h3>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <Metric label="Views" value={formatNumber(p.views)} />
            <Metric label="Unique readers" value={formatNumber(p.readers)} />
            <Metric label="Avg. engagement" value={formatDuration(p.avgEngagementSeconds)} />
            <Metric label="Completion rate" value={formatPct(data.funnel.completionRate)} />
            <Metric label="Shares" value={formatNumber(p.shares)} />
            <Metric label="CTA clicks" value={formatNumber(p.ctaActions)} />
            <Metric label="75% completions" value={formatNumber(data.funnel.reached75)} />
            <Metric label="90% completions" value={formatNumber(data.funnel.reached90)} />
            <Metric label="Google impressions" value={dash(data.searchPerf.impressions, data.searchPerf.available)} />
            <Metric label="Google clicks" value={dash(data.searchPerf.clicks, data.searchPerf.available)} />
            <Metric label="Google CTR" value={data.searchPerf.available ? formatPct(data.searchPerf.ctr) : "—"} />
            <Metric label="Avg. Google position" value={data.searchPerf.available ? String(data.searchPerf.avgPosition) : "—"} />
          </div>
        </div>
      )}

      {/* Impact Score */}
      {hasData && (
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-primary text-white">
              <span className="text-2xl font-bold">{is.total}</span>
              <span className="text-xs opacity-80">/ 100</span>
            </div>
            <div>
              <h3 className="text-base font-semibold">Article Impact Score</h3>
              <p className="text-sm text-muted-foreground">A composite score (0–100) combining reach, engagement, search, amplification and action. Used for comparing articles — not an absolute measure.</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {([
              ["Reach", is.reach, is.reachMax],
              ["Engagement", is.engagement, is.engagementMax],
              ["Search", is.search, is.searchMax],
              ["Amplification", is.amplification, is.amplificationMax],
              ["Action", is.action, is.actionMax],
            ] as [string, number, number][]).map(([label, score, max]) => (
              <div key={label} className="flex items-center gap-3">
                <span className="w-28 text-sm text-muted-foreground">{label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(score / max) * 100}%` }} />
                </div>
                <span className="w-16 text-right text-sm font-medium tabular-nums">{score}/{max}</span>
              </div>
            ))}
          </div>
          <details className="mt-4 text-xs text-muted-foreground">
            <summary className="cursor-pointer font-medium">Scoring methodology</summary>
            <p className="mt-2">Reach (25%): views + unique readers, normalised against cohort. Engagement (25%): completion rate (70%) + engagement time (30%). Search (20%): organic Google clicks. Amplification (15%): shares. Action (15%): CTA actions. Each sub-score is normalised so a single viral article cannot distort the score. See lib/db/analytics.ts for the full implementation.</p>
          </details>
        </div>
      )}

      {/* Trend chart */}
      {hasData && (
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Performance over time</h3>
            <select value={trendMetric} onChange={(e) => setTrendMetric(e.target.value)} className="rounded-lg border border-border px-2 py-1 text-sm">
              <option value="views">Views</option>
              <option value="readers">Readers</option>
              <option value="google_clicks">Google clicks</option>
              <option value="engagement">Engagement (seconds)</option>
              <option value="shares">Shares</option>
              <option value="cta_conversions">CTA conversions</option>
            </select>
          </div>
          <div className="mt-4">
            {trendData.length > 1 ? <LineChart data={trendData} unit={trendMetric === "engagement" ? "s" : ""} /> : <p className="text-sm text-muted-foreground">Not enough data yet.</p>}
          </div>
        </div>
      )}

      {/* Reading behaviour funnel */}
      {hasData && (
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold">Reading behaviour</h3>
          <p className="mt-1 text-xs text-muted-foreground">How far readers scroll. Completion rate = readers reaching 90% / total readers. Repeated scroll events from the same session are not double-counted.</p>
          <div className="mt-4">
            {data.funnel.opened > 0 ? (
              <FunnelChart stages={funnelStages} />
            ) : (
              <p className="text-sm text-muted-foreground">Not enough data yet.</p>
            )}
          </div>
          <div className="mt-4 text-sm">
            <strong>Completion Rate: </strong>
            <span className="text-primary font-semibold">{formatPct(data.funnel.completionRate)}</span>
            <span className="text-muted-foreground"> = {formatNumber(data.funnel.reached90)} readers reaching 90% / {formatNumber(p?.readers ?? 0)} readers</span>
          </div>
        </div>
      )}

      {/* Traffic sources */}
      {hasData && (
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold">Where readers came from</h3>
          <p className="mt-1 text-xs text-muted-foreground">Traffic source attribution with UTM support (utm_source, utm_medium, utm_campaign, utm_content). UTMs are not stripped before attribution.</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            {donutData.length > 0 ? <DonutChart data={donutData} /> : <p className="text-sm text-muted-foreground">Traffic data will appear once readers arrive.</p>}
            {data.traffic.length > 0 && (
              <table className="min-w-full text-sm">
                <thead><tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                  <th className="pb-2 pr-4">Source</th><th className="pb-2 pr-4 text-right">Readers</th><th className="pb-2 pr-4 text-right">Share</th><th className="pb-2 pr-4 text-right">Engagement</th><th className="pb-2 text-right">Completion</th>
                </tr></thead>
                <tbody>
                  {data.traffic.map((t) => (
                    <tr key={t.sourceGroup} className="border-b border-border/50">
                      <td className="py-2 pr-4 font-medium">{SOURCE_LABELS[t.sourceGroup] ?? t.sourceGroup}</td>
                      <td className="py-2 pr-4 text-right">{formatNumber(t.readers)}</td>
                      <td className="py-2 pr-4 text-right text-muted-foreground">{t.percentage}%</td>
                      <td className="py-2 pr-4 text-right text-muted-foreground">{formatDuration(t.engagementSeconds)}</td>
                      <td className="py-2 text-right text-muted-foreground">{formatPct(t.completionRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Google Search Console */}
      {hasData && (
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold">Google Search performance</h3>
          {data.searchPerf.available ? (
            <>
              <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                <Metric label="Impressions" value={formatNumber(data.searchPerf.impressions)} />
                <Metric label="Clicks" value={formatNumber(data.searchPerf.clicks)} />
                <Metric label="CTR" value={formatPct(data.searchPerf.ctr)} />
                <Metric label="Avg. position" value={String(data.searchPerf.avgPosition)} />
              </div>
              <TopSearchQueries articleId={articleId} />
            </>
          ) : (
            <div className="mt-4 rounded-lg border border-dashed border-border bg-surface p-6 text-center">
              <p className="text-sm text-muted-foreground">Connect Google Search Console to see how this article performs in Google Search.</p>
              <p className="mt-2 text-xs text-muted-foreground">Set GSC_SERVICE_ACCOUNT_EMAIL, GSC_PRIVATE_KEY and GSC_SITE_URL environment variables, then run the sync job. Credentials are never exposed to the browser.</p>
            </div>
          )}
        </div>
      )}

      {/* Sharing analytics */}
      {hasData && (
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold">Sharing analytics</h3>
          <p className="mt-1 text-xs text-muted-foreground">Clicks on article share controls, broken down by platform.</p>
          <div className="mt-4">
            {shareBars.length > 0 ? <BarChart data={shareBars} /> : <p className="text-sm text-muted-foreground">Sharing data will appear once readers begin using share buttons.</p>}
          </div>
        </div>
      )}

      {/* CTA / Impact tracking */}
      {hasData && (
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold">Article-generated actions</h3>
          <p className="mt-1 text-xs text-muted-foreground">Meaningful actions originating from this article: donations, volunteering, partnerships, newsletter sign-ups, etc.</p>
          <div className="mt-4">
            {ctaBars.length > 0 ? <BarChart data={ctaBars} /> : <p className="text-sm text-muted-foreground">No CTA actions recorded yet for this article.</p>}
          </div>
          <div className="mt-4 text-sm">
            <strong>CTA Conversion Rate: </strong>
            <span className="text-primary font-semibold">{formatPct(data.ctaRate)}</span>
            <span className="text-muted-foreground"> = unique readers who completed a CTA / unique readers</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-lg font-bold tabular-nums">{value}</div>
    </div>
  );
}

function TopSearchQueries({ articleId }: { articleId: number }) {
  const [queries, setQueries] = useState<{ query: string; impressions: number; clicks: number; ctr: number; position: number }[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`/api/admin/analytics?report=search-queries&articleId=${articleId}`)
      .then((r) => r.json())
      .then((d) => setQueries(d.queries ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [articleId]);

  if (loading) return <p className="mt-4 text-sm text-muted-foreground">Loading search queries…</p>;
  if (queries.length === 0) return <p className="mt-4 text-sm text-muted-foreground">No search queries recorded for this article yet.</p>;

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead><tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
          <th className="pb-2 pr-4">Search query</th><th className="pb-2 pr-4 text-right">Impressions</th><th className="pb-2 pr-4 text-right">Clicks</th><th className="pb-2 pr-4 text-right">CTR</th><th className="pb-2 text-right">Position</th>
        </tr></thead>
        <tbody>
          {queries.slice(0, 20).map((q) => (
            <tr key={q.query} className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium">{q.query}</td>
              <td className="py-2 pr-4 text-right tabular-nums">{q.impressions.toLocaleString()}</td>
              <td className="py-2 pr-4 text-right tabular-nums">{q.clicks.toLocaleString()}</td>
              <td className="py-2 pr-4 text-right tabular-nums text-muted-foreground">{q.ctr > 0 ? `${q.ctr}%` : "—"}</td>
              <td className="py-2 text-right tabular-nums text-muted-foreground">{q.position > 0 ? q.position : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

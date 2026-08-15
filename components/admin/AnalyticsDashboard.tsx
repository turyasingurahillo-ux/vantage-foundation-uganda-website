"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { StoryRow } from "@/lib/db/stories";
import {
  DonutChart,
  LineChart,
  Sparkline,
  type DonutSlice,
  type LinePoint,
} from "@/components/admin/charts/Charts";

/**
 * AnalyticsDashboard — the content analytics & intelligence dashboard for the
 * Stories & Insights admin page. Progressive disclosure: KPI summary → trend →
 * performance table → rankings → category intelligence. All data is fetched
 * from /api/admin/analytics (server-aggregated, never raw events).
 */

// ---------------------------------------------------------------------------
// Types matching the API responses
// ---------------------------------------------------------------------------

interface OverviewData {
  totalViews: number;
  uniqueReaders: number;
  avgEngagementSeconds: number;
  avgCompletionRate: number;
  totalShares: number;
  organicClicks: number;
  ctaActions: number;
}

interface ArticleRow {
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

interface TrafficRow {
  sourceGroup: string;
  readers: number;
  percentage: number;
  engagementSeconds: number;
  completionRate: number;
}

interface CategoryRow {
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

type DatePreset = "7d" | "30d" | "90d" | "year" | "all" | "custom";
type SortKey = "title" | "publishedDate" | "views" | "readers" | "avgEngagementSeconds" | "completionRate" | "shares" | "googleClicks" | "ctaActions" | "impactScore";
type SortDir = "asc" | "desc";

const PRESET_LABELS: Record<DatePreset, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  year: "This year",
  all: "All time",
  custom: "Custom range",
};

const SOURCE_LABELS: Record<string, string> = {
  google: "Google / Organic",
  direct: "Direct",
  whatsapp: "WhatsApp",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  x: "X",
  facebook: "Facebook",
  "other-social": "Other Social",
  referral: "Referral",
  email: "Email",
  other: "Other",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function formatDuration(seconds: number): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatPct(pct: number): string {
  return pct > 0 ? `${pct}%` : "—";
}

function changePct(current: number, previous: number): { value: number; up: boolean; neutral: boolean } {
  if (previous === 0 && current === 0) return { value: 0, up: false, neutral: true };
  if (previous === 0) return { value: 100, up: current > 0, neutral: false };
  const change = ((current - previous) / previous) * 100;
  return { value: Math.round(Math.abs(change) * 10) / 10, up: change >= 0, neutral: change === 0 };
}

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------

function KpiCard({
  label,
  value,
  previousValue,
  format = "number",
  sparkData,
}: {
  label: string;
  value: number;
  previousValue?: number;
  format?: "number" | "duration" | "percent";
  sparkData?: number[];
}) {
  const formatted =
    format === "duration" ? formatDuration(value) :
    format === "percent" ? formatPct(value) :
    formatNumber(value);
  const change = previousValue !== undefined ? changePct(value, previousValue) : null;
  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold text-foreground">{formatted}</div>
      <div className="mt-1 flex items-center gap-2">
        {change && !change.neutral && (
          <span className={`text-xs font-semibold ${change.up ? "text-success-fg" : "text-destructive-fg"}`}>
            {change.up ? "↑" : "↓"} {change.value}% vs previous
          </span>
        )}
        {change && change.neutral && (
          <span className="text-xs text-muted-foreground">— vs previous</span>
        )}
        {sparkData && sparkData.length > 1 && <Sparkline data={sparkData} />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Three-dot contextual menu
// ---------------------------------------------------------------------------

function RowMenu({ article, onEdit, onDelete }: {
  article: ArticleRow;
  onEdit: (a: ArticleRow) => void;
  onDelete: (a: ArticleRow) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="rounded-lg p-1.5 text-muted-foreground hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`Actions for ${article.title}`}
        aria-expanded={open}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="3" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="8" cy="13" r="1.5"/></svg>
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-44 rounded-lg border border-border bg-white py-1 shadow-lg">
          <a href={`/stories/${article.slug}`} target="_blank" rel="noopener noreferrer" className="block px-3 py-1.5 text-sm hover:bg-slate-50">Preview</a>
          <a href={`/admin/stories/${article.articleId}`} className="block px-3 py-1.5 text-sm hover:bg-slate-50">View analytics</a>
          <button type="button" onMouseDown={() => onEdit(article)} className="block w-full px-3 py-1.5 text-left text-sm hover:bg-slate-50">Edit</button>
          <button type="button" onMouseDown={() => navigator.clipboard?.writeText(`${window.location.origin}/stories/${article.slug}`)} className="block w-full px-3 py-1.5 text-left text-sm hover:bg-slate-50">Copy link</button>
          <div className="my-1 border-t border-border" />
          <button type="button" onMouseDown={() => onDelete(article)} className="block w-full px-3 py-1.5 text-left text-sm text-destructive-fg hover:bg-red-50">Delete</button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main dashboard component
// ---------------------------------------------------------------------------

interface AnalyticsDashboardProps {
  stories: StoryRow[];
  onEditStory: (story: StoryRow) => void;
  onDeleteStory: (story: StoryRow) => void;
}

export function AnalyticsDashboard({ stories, onEditStory, onDeleteStory }: AnalyticsDashboardProps) {
  const [range, setRange] = useState<DatePreset>("30d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [compare, setCompare] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "performance" | "rankings" | "categories">("overview");
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [previousOverview, setPreviousOverview] = useState<OverviewData | null>(null);
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [traffic, setTraffic] = useState<TrafficRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [trendData, setTrendData] = useState<LinePoint[]>([]);
  const [trendMetric, setTrendMetric] = useState<string>("views");
  const [dbAvailable, setDbAvailable] = useState(true);

  // Table state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [authorFilter, setAuthorFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("views");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showFilters, setShowFilters] = useState(false);

  const buildQuery = useCallback((report: string, extra?: Record<string, string>) => {
    const params = new URLSearchParams({ report, range });
    if (range === "custom" && customStart && customEnd) {
      params.set("start", customStart);
      params.set("end", customEnd);
    }
    if (compare) params.set("compare", "1");
    if (extra) {
      for (const [k, v] of Object.entries(extra)) params.set(k, v);
    }
    return `/api/admin/analytics?${params.toString()}`;
  }, [range, customStart, customEnd, compare]);

  const fetchAll = useCallback(async () => {
    try {
      const [ovRes, artRes, trafficRes, catRes, trendRes] = await Promise.all([
        fetch(buildQuery("overview")).then((r) => r.json()),
        fetch(buildQuery("articles")).then((r) => r.json()),
        fetch(buildQuery("traffic")).then((r) => r.json()),
        fetch(buildQuery("categories")).then((r) => r.json()),
        fetch(buildQuery("trend", { metric: trendMetric })).then((r) => r.json()),
      ]);
      if (ovRes.error === "db") { setDbAvailable(false); setLoading(false); return; }
      setDbAvailable(true);
      setOverview(ovRes.current ?? null);
      setPreviousOverview(ovRes.previous ?? null);
      setArticles(artRes.articles ?? []);
      setTraffic(trafficRes.traffic ?? []);
      setCategories(catRes.categories ?? []);
      setTrendData((trendRes.trend ?? []).map((t: { day: string; value: number }) => ({ label: t.day, value: t.value })));
    } catch {
      setDbAvailable(false);
    } finally {
      setLoading(false);
    }
  }, [buildQuery, trendMetric]);

  useEffect(() => {
    if (range !== "custom" || (customStart && customEnd)) {
      // Defer the fetch so setLoading doesn't run synchronously in the effect.
      let cancelled = false;
      Promise.resolve().then(async () => {
        if (cancelled) return;
        setLoading(true);
        await fetchAll();
      });
      return () => { cancelled = true; };
    }
  }, [fetchAll, range, customStart, customEnd]);

  // Refetch trend when metric changes.
  useEffect(() => {
    if (range === "custom" && (!customStart || !customEnd)) return;
    fetch(buildQuery("trend", { metric: trendMetric }))
      .then((r) => r.json())
      .then((d) => setTrendData((d.trend ?? []).map((t: { day: string; value: number }) => ({ label: t.day, value: t.value }))))
      .catch(() => {});
  }, [trendMetric, buildQuery, range, customStart, customEnd]);

  // Derived data
  const categoriesList = useMemo(
    () => [...new Set(stories.map((s) => s.category))].sort(),
    [stories]
  );
  const authorsList = useMemo(
    () => [...new Set(stories.map((s) => s.author).filter(Boolean))] as string[],
    [stories]
  );

  const filteredArticles = useMemo(() => {
    let result = [...articles];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((a) => a.title.toLowerCase().includes(q) || a.slug.includes(q));
    }
    if (statusFilter !== "all") result = result.filter((a) => a.status === statusFilter);
    if (categoryFilter !== "all") result = result.filter((a) => a.category === categoryFilter);
    if (authorFilter !== "all") result = result.filter((a) => a.author === authorFilter);
    result.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return result;
  }, [articles, search, statusFilter, categoryFilter, authorFilter, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const handleEdit = (a: ArticleRow) => {
    const story = stories.find((s) => s.id === a.articleId);
    if (story) onEditStory(story);
  };
  const handleDelete = (a: ArticleRow) => {
    const story = stories.find((s) => s.id === a.articleId);
    if (story) onDeleteStory(story);
  };

  const handleExport = () => {
    const params = new URLSearchParams({ range });
    if (range === "custom" && customStart && customEnd) {
      params.set("start", customStart);
      params.set("end", customEnd);
    }
    window.open(`/api/admin/analytics/export?${params.toString()}`, "_blank");
  };

  const donutData: DonutSlice[] = traffic.map((t) => ({
    label: SOURCE_LABELS[t.sourceGroup] ?? t.sourceGroup,
    value: t.readers,
  }));

  const trendUnit = trendMetric === "engagement" ? "s" : "";

  if (!dbAvailable) {
    return (
      <div className="mt-8">
        <EmptyState message="Analytics database tables are not set up yet. Run `node scripts/setup-db.mjs` to create the analytics tables, then reload this page." />
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      {/* Date filter bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(PRESET_LABELS) as DatePreset[]).filter((p) => p !== "custom").map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setRange(p)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${range === p ? "bg-primary text-white" : "border border-border bg-white hover:bg-slate-50"}`}
            >
              {PRESET_LABELS[p]}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setRange("custom")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${range === "custom" ? "bg-primary text-white" : "border border-border bg-white hover:bg-slate-50"}`}
          >
            Custom
          </button>
        </div>
        {range === "custom" && (
          <div className="flex items-center gap-2">
            <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="rounded-lg border border-border px-2 py-1.5 text-sm" />
            <span className="text-muted-foreground">to</span>
            <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="rounded-lg border border-border px-2 py-1.5 text-sm" />
          </div>
        )}
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} />
          Compare to previous period
        </label>
        <button
          type="button"
          onClick={handleExport}
          className="ml-auto rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-semibold hover:bg-slate-50"
        >
          Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {([
          ["overview", "Overview"],
          ["performance", "Performance table"],
          ["rankings", "Top content"],
          ["categories", "Category intelligence"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`border-b-2 px-4 py-2 text-sm font-semibold ${activeTab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading analytics…</p>}

      {/* ---- Overview tab ---- */}
      {!loading && activeTab === "overview" && overview && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-7">
            <KpiCard label="Article views" value={overview.totalViews} previousValue={previousOverview?.totalViews} />
            <KpiCard label="Unique readers" value={overview.uniqueReaders} previousValue={previousOverview?.uniqueReaders} />
            <KpiCard label="Avg. engagement" value={overview.avgEngagementSeconds} previousValue={previousOverview?.avgEngagementSeconds} format="duration" />
            <KpiCard label="Avg. completion" value={overview.avgCompletionRate} previousValue={previousOverview?.avgCompletionRate} format="percent" />
            <KpiCard label="Total shares" value={overview.totalShares} previousValue={previousOverview?.totalShares} />
            <KpiCard label="Google clicks" value={overview.organicClicks} previousValue={previousOverview?.organicClicks} />
            <KpiCard label="CTA actions" value={overview.ctaActions} previousValue={previousOverview?.ctaActions} />
          </div>

          {/* Trend chart */}
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Performance over time</h3>
              <select
                value={trendMetric}
                onChange={(e) => setTrendMetric(e.target.value)}
                className="rounded-lg border border-border px-2 py-1 text-sm"
              >
                <option value="views">Views</option>
                <option value="readers">Readers</option>
                <option value="google_clicks">Google clicks</option>
                <option value="engagement">Engagement (seconds)</option>
                <option value="shares">Shares</option>
                <option value="cta_conversions">CTA conversions</option>
              </select>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Daily {trendMetric.replace(/_/g, " ")} for the selected period. Each chart shows one metric to avoid mixing scales.</p>
            <div className="mt-4">
              {trendData.length > 1 ? (
                <LineChart data={trendData} unit={trendUnit} />
              ) : (
                <EmptyState message="Not enough data yet. Trend data will appear once readers start viewing articles." />
              )}
            </div>
          </div>

          {/* Traffic sources */}
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold">Where readers come from</h3>
            <p className="mt-1 text-xs text-muted-foreground">Traffic source attribution including UTM support. UTMs are not stripped before attribution.</p>
            <div className="mt-4 grid gap-6 lg:grid-cols-2">
              {donutData.length > 0 ? (
                <DonutChart data={donutData} />
              ) : (
                <EmptyState message="Traffic source data will appear once readers start arriving." />
              )}
              {traffic.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                        <th className="pb-2 pr-4">Source</th>
                        <th className="pb-2 pr-4 text-right">Readers</th>
                        <th className="pb-2 pr-4 text-right">Share</th>
                        <th className="pb-2 pr-4 text-right">Engagement</th>
                        <th className="pb-2 text-right">Completion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {traffic.map((t) => (
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
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---- Performance table tab ---- */}
      {!loading && activeTab === "performance" && (
        <div className="space-y-4">
          {/* Search + filter toggle */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="search"
              placeholder="Search by title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-xs rounded-lg border border-border px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Filters {showFilters ? "▲" : "▼"}
            </button>
          </div>
          {showFilters && (
            <div className="flex flex-wrap gap-3 rounded-lg border border-border bg-surface p-4">
              <label className="text-sm">
                <span className="block text-xs text-muted-foreground">Status</span>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="mt-1 rounded-lg border border-border px-2 py-1.5 text-sm">
                  <option value="all">All</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="block text-xs text-muted-foreground">Category</span>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="mt-1 rounded-lg border border-border px-2 py-1.5 text-sm">
                  <option value="all">All</option>
                  {categoriesList.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="text-sm">
                <span className="block text-xs text-muted-foreground">Author</span>
                <select value={authorFilter} onChange={(e) => setAuthorFilter(e.target.value)} className="mt-1 rounded-lg border border-border px-2 py-1.5 text-sm">
                  <option value="all">All</option>
                  {authorsList.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </label>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {([
                    ["title", "Article"], ["status", "Status"], ["publishedDate", "Published"],
                    ["views", "Views"], ["readers", "Readers"], ["avgEngagementSeconds", "Engagement"],
                    ["completionRate", "Completion"], ["shares", "Shares"], ["googleClicks", "Google"],
                    ["ctaActions", "CTA"], ["impactScore", "Impact"],
                  ] as [SortKey, string][]).map(([key, label]) => (
                    <th key={key} className="cursor-pointer whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground" onClick={() => handleSort(key)}>
                      {label} {sortKey === key && (sortDir === "asc" ? "↑" : "↓")}
                    </th>
                  ))}
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredArticles.length === 0 ? (
                  <tr><td colSpan={12} className="px-4 py-8 text-center text-muted-foreground">No articles match the current filters.</td></tr>
                ) : filteredArticles.map((a) => (
                  <tr key={a.articleId} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <a href={`/admin/stories/${a.articleId}`} className="font-medium text-primary hover:underline">{a.title}</a>
                      <div className="text-xs text-muted-foreground">/stories/{a.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${a.status === "published" ? "bg-success-bg text-success-fg" : "bg-warning-bg text-warning-fg"}`}>
                        {a.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{a.publishedDate}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatNumber(a.views)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatNumber(a.readers)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{formatDuration(a.avgEngagementSeconds)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{formatPct(a.completionRate)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatNumber(a.shares)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{formatNumber(a.googleClicks)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatNumber(a.ctaActions)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${a.impactScore >= 70 ? "bg-success-bg text-success-fg" : a.impactScore >= 40 ? "bg-warning-bg text-warning-fg" : "bg-slate-100 text-muted-foreground"}`}>
                        {a.impactScore}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <RowMenu article={a} onEdit={handleEdit} onDelete={handleDelete} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---- Rankings tab ---- */}
      {!loading && activeTab === "rankings" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <RankingCard title="Most viewed" articles={articles} metric="views" />
          <RankingCard title="Most read / completed" articles={articles} metric="readers" />
          <RankingCard title="Highest engagement" articles={articles} metric="avgEngagementSeconds" />
          <RankingCard title="Most shared" articles={articles} metric="shares" />
          <RankingCard title="Best Google performance" articles={articles} metric="googleClicks" />
          <RankingCard title="Highest conversion" articles={articles} metric="ctaActions" />
          <RankingCard title="Highest Impact Score" articles={articles} metric="impactScore" />
        </div>
      )}

      {/* ---- Category intelligence tab ---- */}
      {!loading && activeTab === "categories" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Aggregate analytics by content category. Helps answer: <strong>what should Vantage write more about?</strong></p>
          {categories.length === 0 ? (
            <EmptyState message="Category intelligence will appear once published articles start receiving readers." />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {["Category", "Articles", "Total readers", "Avg readers/article", "Avg engagement", "Completion", "Search clicks", "Shares", "CTA conv.", "Avg impact"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {categories.map((c) => (
                    <tr key={c.category} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium">{c.category}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{c.articleCount}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatNumber(c.totalReaders)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{formatNumber(c.avgReadersPerArticle)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{formatDuration(c.avgEngagementSeconds)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{formatPct(c.completionRate)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{formatNumber(c.searchClicks)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatNumber(c.shares)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{formatPct(c.ctaConversionRate)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{c.avgImpactScore || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ranking card (for the Top Content tab)
// ---------------------------------------------------------------------------

function RankingCard({ title, articles, metric }: {
  title: string;
  articles: ArticleRow[];
  metric: keyof ArticleRow;
}) {
  const top = [...articles]
    .sort((a, b) => (b[metric] as number) - (a[metric] as number))
    .slice(0, 5);
  const max = top.length > 0 ? (top[0][metric] as number) : 0;
  const formatVal = (v: number) => metric === "avgEngagementSeconds" ? formatDuration(v) : formatNumber(v);
  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-3 space-y-2">
        {top.length === 0 || max === 0 ? (
          <p className="text-sm text-muted-foreground">Not enough data yet.</p>
        ) : top.map((a, i) => (
          <div key={a.articleId} className="flex items-center gap-3">
            <span className="w-5 text-xs font-bold text-muted-foreground">{i + 1}</span>
            <a href={`/admin/stories/${a.articleId}`} className="flex-1 truncate text-sm font-medium text-primary hover:underline" title={a.title}>{a.title}</a>
            <span className="text-sm tabular-nums text-muted-foreground">{formatVal(a[metric] as number)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

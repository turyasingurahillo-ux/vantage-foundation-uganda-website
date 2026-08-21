"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { StoryRow } from "@/lib/db/stories";
import {
  DonutChart,
  LineChart,
  type DonutSlice,
  type LinePoint,
} from "@/components/admin/charts/Charts";
import { adminStoryHref, publicStoryHref } from "@/lib/analytics-identity";

interface OverviewData {
  totalViews: number;
  uniqueReaders: number;
  avgEngagementSeconds: number;
  avgCompletionRate: number;
  totalShares: number;
  organicClicks: number;
  ctaActions: number;
  searchConsoleConnected?: boolean;
}

interface ArticleRow {
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
type SortKey =
  | "title"
  | "publishedDate"
  | "views"
  | "readers"
  | "avgEngagementSeconds"
  | "completionRate"
  | "shares"
  | "googleClicks"
  | "ctaActions"
  | "impactScore";
type SortDir = "asc" | "desc";

type Tab = "overview" | "performance" | "rankings" | "categories";

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

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function formatDuration(seconds: number): string {
  if (!seconds) return "—";
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return minutes > 0 ? `${minutes}m ${remainder}s` : `${remainder}s`;
}

function formatPct(pct: number): string {
  return pct > 0 ? `${pct}%` : "—";
}

function KpiCard({
  label,
  value,
  previousValue,
  format = "number",
  unavailable = false,
  note,
}: {
  label: string;
  value: number;
  previousValue?: number;
  format?: "number" | "duration" | "percent";
  unavailable?: boolean;
  note?: string;
}) {
  const rendered = unavailable
    ? "—"
    : format === "duration"
      ? formatDuration(value)
      : format === "percent"
        ? formatPct(value)
        : formatNumber(value);
  let comparison = "";
  if (!unavailable && previousValue !== undefined) {
    if (previousValue === 0 && value === 0) comparison = "— vs previous";
    else if (previousValue === 0) comparison = "↑ 100% vs previous";
    else {
      const change = ((value - previousValue) / previousValue) * 100;
      comparison = `${change >= 0 ? "↑" : "↓"} ${Math.round(Math.abs(change) * 10) / 10}% vs previous`;
    }
  }
  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-foreground">{rendered}</div>
      {(note || comparison) && (
        <div className="mt-1 text-xs text-muted-foreground">
          {note || comparison}
        </div>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function RowMenu({
  article,
  onEdit,
  onDelete,
}: {
  article: ArticleRow;
  onEdit: (article: ArticleRow) => void;
  onDelete: (article: ArticleRow) => void;
}) {
  const [open, setOpen] = useState(false);
  const adminHref = adminStoryHref(article);
  const publicHref = publicStoryHref(article);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="rounded-lg p-1.5 text-muted-foreground hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`Actions for ${article.title}`}
        aria-expanded={open}
      >
        ⋮
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-48 rounded-lg border border-border bg-white py-1 shadow-lg">
          <a
            href={publicHref}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            View public story
          </a>
          {adminHref ? (
            <>
              <a
                href={`${adminHref}?tab=analytics`}
                className="block px-3 py-1.5 text-sm hover:bg-slate-50"
              >
                View analytics
              </a>
              <button
                type="button"
                onMouseDown={() => onEdit(article)}
                className="block w-full px-3 py-1.5 text-left text-sm hover:bg-slate-50"
              >
                Edit
              </button>
            </>
          ) : (
            <div className="px-3 py-1.5 text-xs text-muted-foreground">
              Static story — no editorial DB record
            </div>
          )}
          <button
            type="button"
            onMouseDown={() =>
              navigator.clipboard?.writeText(`${window.location.origin}${publicHref}`)
            }
            className="block w-full px-3 py-1.5 text-left text-sm hover:bg-slate-50"
          >
            Copy public link
          </button>
          {adminHref && (
            <>
              <div className="my-1 border-t border-border" />
              <button
                type="button"
                onMouseDown={() => onDelete(article)}
                className="block w-full px-3 py-1.5 text-left text-sm text-destructive-fg hover:bg-red-50"
              >
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface AnalyticsDashboardProps {
  stories: StoryRow[];
  onEditStory: (story: StoryRow) => void;
  onDeleteStory: (story: StoryRow) => void;
}

export function AnalyticsDashboard({
  stories,
  onEditStory,
  onDeleteStory,
}: AnalyticsDashboardProps) {
  const [range, setRange] = useState<DatePreset>("30d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [compare, setCompare] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [previousOverview, setPreviousOverview] = useState<OverviewData | null>(null);
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [traffic, setTraffic] = useState<TrafficRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [trendData, setTrendData] = useState<LinePoint[]>([]);
  const [trendMetric, setTrendMetric] = useState("views");
  const [dbAvailable, setDbAvailable] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [authorFilter, setAuthorFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("views");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showFilters, setShowFilters] = useState(false);

  const buildQuery = useCallback(
    (report: string, extra?: Record<string, string>) => {
      const params = new URLSearchParams({ report, range });
      if (range === "custom" && customStart && customEnd) {
        params.set("start", customStart);
        params.set("end", customEnd);
      }
      if (compare) params.set("compare", "1");
      for (const [key, value] of Object.entries(extra ?? {})) {
        params.set(key, value);
      }
      return `/api/admin/analytics?${params.toString()}`;
    },
    [range, customStart, customEnd, compare],
  );

  const fetchAll = useCallback(async () => {
    try {
      const [overviewResponse, articleResponse, trafficResponse, categoryResponse, trendResponse] =
        await Promise.all([
          fetch(buildQuery("overview")).then((response) => response.json()),
          fetch(buildQuery("articles")).then((response) => response.json()),
          fetch(buildQuery("traffic")).then((response) => response.json()),
          fetch(buildQuery("categories")).then((response) => response.json()),
          fetch(buildQuery("trend", { metric: trendMetric })).then((response) =>
            response.json(),
          ),
        ]);
      if (overviewResponse.error === "db") {
        setDbAvailable(false);
        return;
      }
      setDbAvailable(true);
      setOverview(overviewResponse.current ?? null);
      setPreviousOverview(overviewResponse.previous ?? null);
      setArticles(articleResponse.articles ?? []);
      setTraffic(trafficResponse.traffic ?? []);
      setCategories(categoryResponse.categories ?? []);
      setTrendData(
        (trendResponse.trend ?? []).map((point: { day: string; value: number }) => ({
          label: point.day,
          value: point.value,
        })),
      );
    } catch {
      setDbAvailable(false);
    } finally {
      setLoading(false);
    }
  }, [buildQuery, trendMetric]);

  useEffect(() => {
    if (range === "custom" && (!customStart || !customEnd)) return;
    let cancelled = false;
    Promise.resolve().then(async () => {
      if (cancelled) return;
      setLoading(true);
      await fetchAll();
    });
    return () => {
      cancelled = true;
    };
  }, [fetchAll, range, customStart, customEnd]);

  const categoriesList = useMemo(
    () => [...new Set(articles.map((article) => article.category))].sort(),
    [articles],
  );
  const authorsList = useMemo(
    () =>
      [...new Set(articles.map((article) => article.author).filter(Boolean))].sort() as string[],
    [articles],
  );

  const filteredArticles = useMemo(() => {
    let result = [...articles];
    if (search) {
      const query = search.toLowerCase();
      result = result.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.slug.toLowerCase().includes(query),
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((article) => article.status === statusFilter);
    }
    if (categoryFilter !== "all") {
      result = result.filter((article) => article.category === categoryFilter);
    }
    if (authorFilter !== "all") {
      result = result.filter((article) => article.author === authorFilter);
    }
    result.sort((left, right) => {
      const a = left[sortKey];
      const b = right[sortKey];
      if (typeof a === "string" && typeof b === "string") {
        return sortDir === "asc" ? a.localeCompare(b) : b.localeCompare(a);
      }
      return sortDir === "asc"
        ? Number(a) - Number(b)
        : Number(b) - Number(a);
    });
    return result;
  }, [articles, search, statusFilter, categoryFilter, authorFilter, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((direction) => (direction === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function resolveEditorialStory(article: ArticleRow): StoryRow | null {
    if (article.storyId == null) return null;
    return stories.find((story) => story.id === article.storyId) ?? null;
  }

  function handleEdit(article: ArticleRow) {
    const story = resolveEditorialStory(article);
    if (story) onEditStory(story);
  }

  function handleDelete(article: ArticleRow) {
    const story = resolveEditorialStory(article);
    if (story) onDeleteStory(story);
  }

  const donutData: DonutSlice[] = traffic.map((source) => ({
    label: SOURCE_LABELS[source.sourceGroup] ?? source.sourceGroup,
    value: source.readers,
  }));

  if (!dbAvailable) {
    return (
      <div className="mt-8">
        <EmptyState message="Analytics database tables are not available. Check the configured database and analytics migrations." />
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(PRESET_LABELS) as DatePreset[])
            .filter((preset) => preset !== "custom")
            .map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setRange(preset)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  range === preset
                    ? "bg-primary text-white"
                    : "border border-border bg-white hover:bg-slate-50"
                }`}
              >
                {PRESET_LABELS[preset]}
              </button>
            ))}
          <button
            type="button"
            onClick={() => setRange("custom")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              range === "custom"
                ? "bg-primary text-white"
                : "border border-border bg-white hover:bg-slate-50"
            }`}
          >
            Custom
          </button>
        </div>
        {range === "custom" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStart}
              onChange={(event) => setCustomStart(event.target.value)}
              className="rounded-lg border border-border px-2 py-1.5 text-sm"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(event) => setCustomEnd(event.target.value)}
              className="rounded-lg border border-border px-2 py-1.5 text-sm"
            />
          </div>
        )}
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={compare}
            onChange={(event) => setCompare(event.target.checked)}
          />
          Compare to previous period
        </label>
      </div>

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
            className={`border-b-2 px-4 py-2 text-sm font-semibold ${
              activeTab === key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading analytics…</p>}

      {!loading && activeTab === "overview" && overview && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-7">
            <KpiCard
              label="Article views"
              value={overview.totalViews}
              previousValue={previousOverview?.totalViews}
            />
            <KpiCard
              label="Unique readers"
              value={overview.uniqueReaders}
              previousValue={previousOverview?.uniqueReaders}
            />
            <KpiCard
              label="Avg. engagement"
              value={overview.avgEngagementSeconds}
              previousValue={previousOverview?.avgEngagementSeconds}
              format="duration"
            />
            <KpiCard
              label="Avg. completion"
              value={overview.avgCompletionRate}
              previousValue={previousOverview?.avgCompletionRate}
              format="percent"
            />
            <KpiCard
              label="Total shares"
              value={overview.totalShares}
              previousValue={previousOverview?.totalShares}
            />
            <KpiCard
              label="Google clicks"
              value={overview.organicClicks}
              unavailable={overview.searchConsoleConnected === false}
              note={
                overview.searchConsoleConnected === false
                  ? "Search Console not connected"
                  : "Current Search Console query window"
              }
            />
            <KpiCard
              label="CTA actions"
              value={overview.ctaActions}
              previousValue={previousOverview?.ctaActions}
            />
          </div>

          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold">Performance over time</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Daily rollup metrics for the selected period.
                </p>
              </div>
              <select
                value={trendMetric}
                onChange={(event) => setTrendMetric(event.target.value)}
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
            <div className="mt-4">
              {trendMetric === "google_clicks" ? (
                <EmptyState message="Daily Google-click trend is unavailable because Search Console is currently stored as a query-window cache, not daily data." />
              ) : trendData.length > 1 ? (
                <LineChart
                  data={trendData}
                  unit={trendMetric === "engagement" ? "s" : ""}
                />
              ) : (
                <EmptyState message="Not enough daily data yet for this trend." />
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold">Where readers come from</h3>
            <div className="mt-4 grid gap-6 lg:grid-cols-2">
              {donutData.length ? (
                <DonutChart data={donutData} />
              ) : (
                <EmptyState message="Traffic source data will appear once readers arrive." />
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
                      {traffic.map((source) => (
                        <tr key={source.sourceGroup} className="border-b border-border/50">
                          <td className="py-2 pr-4 font-medium">
                            {SOURCE_LABELS[source.sourceGroup] ?? source.sourceGroup}
                          </td>
                          <td className="py-2 pr-4 text-right">
                            {formatNumber(source.readers)}
                          </td>
                          <td className="py-2 pr-4 text-right text-muted-foreground">
                            {source.percentage}%
                          </td>
                          <td className="py-2 pr-4 text-right text-muted-foreground">
                            {formatDuration(source.engagementSeconds)}
                          </td>
                          <td className="py-2 text-right text-muted-foreground">
                            {formatPct(source.completionRate)}
                          </td>
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

      {!loading && activeTab === "performance" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="search"
              placeholder="Search by title…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full max-w-xs rounded-lg border border-border px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowFilters((value) => !value)}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Filters {showFilters ? "▲" : "▼"}
            </button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-3 rounded-lg border border-border bg-surface p-4">
              <FilterSelect
                label="Status"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  ["all", "All"],
                  ["published", "Published"],
                  ["inactive", "Inactive / historical"],
                ]}
              />
              <FilterSelect
                label="Category"
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[["all", "All"], ...categoriesList.map((value) => [value, value] as [string, string])]}
              />
              <FilterSelect
                label="Author"
                value={authorFilter}
                onChange={setAuthorFilter}
                options={[["all", "All"], ...authorsList.map((value) => [value, value] as [string, string])]}
              />
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {([
                    ["title", "Article"],
                    ["publishedDate", "Published"],
                    ["views", "Views"],
                    ["readers", "Readers"],
                    ["avgEngagementSeconds", "Engagement"],
                    ["completionRate", "Completion"],
                    ["shares", "Shares"],
                    ["googleClicks", "Google"],
                    ["ctaActions", "CTA"],
                    ["impactScore", "Impact"],
                  ] as [SortKey, string][]).map(([key, label]) => (
                    <th
                      key={key}
                      className="cursor-pointer whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      onClick={() => handleSort(key)}
                    >
                      {label} {sortKey === key && (sortDir === "asc" ? "↑" : "↓")}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredArticles.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center text-muted-foreground">
                      No articles match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredArticles.map((article) => {
                    const adminHref = adminStoryHref(article);
                    return (
                      <tr
                        key={article.analyticsArticleId}
                        className="hover:bg-slate-50/50"
                      >
                        <td className="px-4 py-3">
                          <a
                            href={adminHref ? `${adminHref}?tab=analytics` : publicStoryHref(article)}
                            className="font-medium text-primary hover:underline"
                          >
                            {article.title}
                          </a>
                          <div className="text-xs text-muted-foreground">
                            /stories/{article.slug}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                          {article.publishedDate}
                        </td>
                        <Metric value={formatNumber(article.views)} />
                        <Metric value={formatNumber(article.readers)} />
                        <Metric value={formatDuration(article.avgEngagementSeconds)} muted />
                        <Metric value={formatPct(article.completionRate)} muted />
                        <Metric value={formatNumber(article.shares)} />
                        <Metric value={formatNumber(article.googleClicks)} muted />
                        <Metric value={formatNumber(article.ctaActions)} />
                        <Metric value={String(article.impactScore)} />
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                              article.isActive
                                ? "bg-success-bg text-success-fg"
                                : "bg-slate-100 text-muted-foreground"
                            }`}
                          >
                            {article.isActive ? "Published" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <RowMenu
                            article={article}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && activeTab === "rankings" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {([
            ["Most viewed", "views"],
            ["Most read / completed", "readers"],
            ["Highest engagement", "avgEngagementSeconds"],
            ["Most shared", "shares"],
            ["Best Google performance", "googleClicks"],
            ["Highest conversion", "ctaActions"],
            ["Highest Impact Score", "impactScore"],
          ] as [string, keyof ArticleRow][]).map(([title, metric]) => (
            <RankingCard
              key={title}
              title={title}
              articles={articles}
              metric={metric}
            />
          ))}
        </div>
      )}

      {!loading && activeTab === "categories" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Aggregate analytics by content category. Search clicks reflect the
            current Search Console query window.
          </p>
          {categories.length === 0 ? (
            <EmptyState message="Category intelligence will appear once analytics data exists." />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {[
                      "Category",
                      "Articles",
                      "Total readers",
                      "Avg readers/article",
                      "Avg engagement",
                      "Completion",
                      "Search clicks",
                      "Shares",
                      "CTA conv.",
                    ].map((header) => (
                      <th
                        key={header}
                        className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {categories.map((category) => (
                    <tr key={category.category}>
                      <td className="px-4 py-3 font-medium">{category.category}</td>
                      <Metric value={String(category.articleCount)} />
                      <Metric value={formatNumber(category.totalReaders)} />
                      <Metric value={formatNumber(category.avgReadersPerArticle)} muted />
                      <Metric value={formatDuration(category.avgEngagementSeconds)} muted />
                      <Metric value={formatPct(category.completionRate)} muted />
                      <Metric value={formatNumber(category.searchClicks)} muted />
                      <Metric value={formatNumber(category.shares)} />
                      <Metric value={formatPct(category.ctaConversionRate)} muted />
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

function Metric({ value, muted = false }: { value: string; muted?: boolean }) {
  return (
    <td
      className={`px-4 py-3 text-right tabular-nums ${
        muted ? "text-muted-foreground" : ""
      }`}
    >
      {value}
    </td>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="text-sm">
      <span className="block text-xs text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 rounded-lg border border-border px-2 py-1.5 text-sm"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function RankingCard({
  title,
  articles,
  metric,
}: {
  title: string;
  articles: ArticleRow[];
  metric: keyof ArticleRow;
}) {
  const top = [...articles]
    .filter((article) => typeof article[metric] === "number")
    .sort((left, right) => Number(right[metric]) - Number(left[metric]))
    .slice(0, 5);

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-3 space-y-2">
        {top.length === 0 ? (
          <p className="text-sm text-muted-foreground">Not enough data yet.</p>
        ) : (
          top.map((article, index) => (
            <div
              key={article.analyticsArticleId}
              className="flex items-center gap-3"
            >
              <span className="w-5 text-xs font-bold text-muted-foreground">
                {index + 1}
              </span>
              <a
                href={publicStoryHref(article)}
                className="flex-1 truncate text-sm font-medium text-primary hover:underline"
                title={article.title}
              >
                {article.title}
              </a>
              <span className="text-sm tabular-nums text-muted-foreground">
                {metric === "avgEngagementSeconds"
                  ? formatDuration(Number(article[metric]))
                  : formatNumber(Number(article[metric]))}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

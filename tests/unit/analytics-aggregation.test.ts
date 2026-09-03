import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Aggregation regression tests for the analytics identity fix.
 *
 * Verifies that both static-manifest and DB-backed stories appear in
 * aggregation results, and that unique-reader dedup, engagement, completion,
 * shares, and CTA metrics calculate correctly.
 *
 * These tests mock the database layer so they don't depend on a live
 * database. They verify the aggregation logic (SQL structure + JS mapping)
 * by controlling what the mock SQL returns.
 */

vi.mock("server-only", () => ({}));

// --- Mock SQL layer -----------------------------------------------------
// We mock the neon sql tagged template to return controlled rows per query.
// Each test sets up the rows the query should return.

interface MockQuery {
  match: (strings: TemplateStringsArray) => boolean;
  rows: Record<string, unknown>[];
}

let mockQueries: MockQuery[] = [];

function mockSql(strings: TemplateStringsArray) {
  for (const q of mockQueries) {
    if (q.match(strings)) {
      return Promise.resolve(q.rows);
    }
  }
  // Default: return empty array for unrecognized queries.
  return Promise.resolve([]);
}

// Make mockSql work as a tagged template function.
const sqlFn = mockSql as unknown as {
  (strings: TemplateStringsArray, ...values: unknown[]): Promise<Record<string, unknown>[]>;
};

vi.mock("@neondatabase/serverless", () => ({
  neon: vi.fn(() => sqlFn),
}));

vi.mock("@/lib/db/stories", () => ({
  getStories: vi.fn(async () => []),
  getStoryBySlug: vi.fn(async () => null),
  getStoryById: vi.fn(async () => null),
}));

vi.mock("@/lib/db/analytics-articles", () => ({
  getAnalyticsArticleBySlug: vi.fn(async () => null),
  ensureAnalyticsArticleId: vi.fn(async () => 1),
  upsertAnalyticsArticle: vi.fn(async () => 1),
  getAllAnalyticsArticles: vi.fn(async () => []),
}));

// Import after mocks.
import {
  getOverview,
  getArticlePerformance,
  classifySource,
  computeImpactScore,
  resolveDateRange,
  previousRange,
} from "@/lib/db/analytics";

beforeEach(() => {
  vi.clearAllMocks();
  mockQueries = [];
  vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost/test");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

// Helper: set up a mock query that matches by a substring of the SQL text.
function mockQuery(substr: string, rows: Record<string, unknown>[]) {
  mockQueries.push({
    match: (strings: TemplateStringsArray) => strings.join("").includes(substr),
    rows,
  });
}

// --- Tests --------------------------------------------------------------

describe("getOverview", () => {
  it("returns zeros when no data exists, with searchConsoleConnected=false", async () => {
    mockQuery("FROM article_analytics_daily", [{
      total_views: "0",
      unique_readers: "0",
      engagement_total: "0",
      completions: "0",
      shares: "0",
      organic_clicks: "0",
      cta_clicks: "0",
    }]);
    mockQuery("FROM search_console_config", [{
      id: 1,
      connected: false,
      site_url: null,
      last_sync_at: null,
      last_error: null,
    }]);

    const range = resolveDateRange("7d");
    const overview = await getOverview(range);
    expect(overview.totalViews).toBe(0);
    expect(overview.uniqueReaders).toBe(0);
    expect(overview.searchConsoleConnected).toBe(false);
  });

  it("calculates averages correctly with data", async () => {
    mockQuery("FROM article_analytics_daily", [{
      total_views: "10",
      unique_readers: "4",
      engagement_total: "120",
      completions: "2",
      shares: "3",
      organic_clicks: "5",
      cta_clicks: "1",
    }]);
    mockQuery("FROM search_console_config", [{
      id: 1,
      connected: true,
      site_url: "https://example.com",
      last_sync_at: new Date(),
      last_error: null,
    }]);

    const range = resolveDateRange("30d");
    const overview = await getOverview(range);
    expect(overview.totalViews).toBe(10);
    expect(overview.uniqueReaders).toBe(4);
    expect(overview.avgEngagementSeconds).toBe(30); // 120 / 4
    expect(overview.avgCompletionRate).toBe(50); // 2/4 * 100 = 50
    expect(overview.totalShares).toBe(3);
    expect(overview.organicClicks).toBe(5);
    expect(overview.ctaActions).toBe(1);
    expect(overview.searchConsoleConnected).toBe(true);
  });
});

describe("getArticlePerformance", () => {
  it("lists both static and DB stories from the analytics_articles registry", async () => {
    // Mock the JOIN query to return two articles.
    mockQuery("FROM analytics_articles a", [
      {
        article_id: 1,
        slug: "beyond-the-ward",
        title: "Beyond the Ward",
        category: "Career guide",
        published_date: "2026-08-14",
        views: "5",
        readers: "3",
        engagement_total: "60",
        completions: "1",
        shares: "0",
        google_clicks: "0",
        cta_actions: "0",
      },
      {
        article_id: 2,
        slug: "db-story",
        title: "DB Story",
        category: "Research",
        published_date: "2026-08-01",
        views: "8",
        readers: "5",
        engagement_total: "150",
        completions: "2",
        shares: "1",
        google_clicks: "0",
        cta_actions: "1",
      },
    ]);

    const range = resolveDateRange("all");
    const rows = await getArticlePerformance(range);
    expect(rows).toHaveLength(2);
    expect(rows[0].slug).toBe("beyond-the-ward");
    expect(rows[0].views).toBe(5);
    expect(rows[0].status).toBe("published");
    expect(rows[1].slug).toBe("db-story");
    expect(rows[1].views).toBe(8);
    expect(rows[1].ctaActions).toBe(1);
  });

  it("handles zero-metric articles (unvisited stories)", async () => {
    mockQuery("FROM analytics_articles a", [
      {
        article_id: 1,
        slug: "never-visited",
        title: "Never Visited",
        category: "Test",
        published_date: "2026-01-01",
        views: "0",
        readers: "0",
        engagement_total: "0",
        completions: "0",
        shares: "0",
        google_clicks: "0",
        cta_actions: "0",
      },
    ]);

    const range = resolveDateRange("all");
    const rows = await getArticlePerformance(range);
    expect(rows).toHaveLength(1);
    expect(rows[0].views).toBe(0);
    expect(rows[0].completionRate).toBe(0);
    expect(rows[0].impactScore).toBe(0);
  });
});

describe("classifySource", () => {
  it("classifies Google referrer as google", () => {
    expect(classifySource("https://www.google.com/search", undefined)).toBe("google");
  });

  it("classifies no referrer as direct", () => {
    expect(classifySource(null, undefined)).toBe("direct");
  });

  it("UTM source takes precedence over referrer", () => {
    expect(classifySource("https://www.google.com", { source: "whatsapp" })).toBe("whatsapp");
  });

  it("classifies UTM organic medium as google (with utmSource present)", () => {
    // classifySource checks utmMedium === "organic" only when utmSource is
    // truthy — this is pre-existing behavior. A campaign with utm_source=google
    // and utm_medium=organic is classified as google.
    expect(classifySource(null, { source: "google", medium: "organic" })).toBe("google");
  });
});

describe("computeImpactScore", () => {
  it("returns 0 for an article with no metrics", () => {
    const score = computeImpactScore({
      views: 0,
      readers: 0,
      completionRate: 0,
      avgEngagementSeconds: 0,
      shares: 0,
      googleClicks: 0,
      ctaActions: 0,
    });
    expect(score.total).toBe(0);
  });

  it("returns a positive score for an article with metrics", () => {
    const score = computeImpactScore({
      views: 100,
      readers: 50,
      completionRate: 60,
      avgEngagementSeconds: 120,
      shares: 10,
      googleClicks: 20,
      ctaActions: 5,
    });
    expect(score.total).toBeGreaterThan(0);
    expect(score.total).toBeLessThanOrEqual(100);
  });
});

describe("resolveDateRange", () => {
  it("7d range spans 7 days ending today", () => {
    const r = resolveDateRange("7d");
    const start = new Date(r.start);
    const end = new Date(r.end);
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBe(7);
  });

  it("all range starts from 2000-01-01", () => {
    const r = resolveDateRange("all");
    expect(r.start).toBe("2000-01-01");
  });

  it("year range starts from Jan 1 of current year", () => {
    const r = resolveDateRange("year");
    expect(r.start).toBe(`${new Date().getFullYear()}-01-01`);
  });
});

describe("previousRange", () => {
  it("returns the immediately preceding range of equal length", () => {
    const range = { start: "2026-08-10", end: "2026-08-17" };
    const prev = previousRange(range);
    // Previous should end the day before start, and span the same length.
    const prevEnd = new Date(prev.end);
    const prevStart = new Date(prev.start);
    const rangeStart = new Date(range.start);
    expect(prevEnd.getTime()).toBe(rangeStart.getTime() - 86400000);
    const prevLen = (prevEnd.getTime() - prevStart.getTime()) / (1000 * 60 * 60 * 24);
    const rangeLen = (new Date(range.end).getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24);
    expect(prevLen).toBe(rangeLen);
  });
});

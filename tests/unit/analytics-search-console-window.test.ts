import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

let connected = true;
let cacheClicks = 12;

const sql = (async (strings: TemplateStringsArray) => {
  const query = strings.join("");
  if (query.includes("FROM article_analytics_daily")) {
    // Deliberately include stale/dangerous daily organic values. The foundation
    // overview must ignore them and source Google clicks from the cache.
    return [
      {
        total_views: "5",
        unique_readers: "3",
        engagement_total: "30",
        completions: "1",
        shares: "0",
        cta_clicks: "0",
        organic_clicks: "22",
      },
    ];
  }
  if (query.includes("FROM article_search_queries")) {
    return [{ clicks: String(cacheClicks) }];
  }
  return [];
}) as unknown as (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<Record<string, unknown>[]>;

vi.mock("@neondatabase/serverless", () => ({
  neon: vi.fn(() => sql),
}));

vi.mock("@/lib/db/analytics", () => ({
  getSearchConsoleStatus: vi.fn(async () => ({
    connected,
    siteUrl: connected ? "https://example.com" : null,
    lastSyncAt: null,
    lastError: null,
  })),
  computeImpactScore: vi.fn(() => ({
    total: 0,
    reach: 0,
    reachMax: 25,
    engagement: 0,
    engagementMax: 25,
    search: 0,
    searchMax: 20,
    amplification: 0,
    amplificationMax: 15,
    action: 0,
    actionMax: 15,
  })),
  getTrend: vi.fn(async () => []),
}));

import { getFoundationOverview } from "@/lib/db/analytics-foundation";

beforeEach(() => {
  connected = true;
  cacheClicks = 12;
  vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost/test");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Search Console query-window counting", () => {
  it("shows the latest cumulative total 12 rather than adding an earlier 10 to make 22", async () => {
    // This represents a repeated sync where an earlier cache value was 10 and
    // the current Search Console window now reports 12. The display query reads
    // the current cache snapshot, not multiple daily copies of cumulative data.
    cacheClicks = 12;
    const overview = await getFoundationOverview({
      start: "2026-08-01",
      end: "2026-08-21",
    });

    expect(overview.organicClicks).toBe(12);
    expect(overview.organicClicks).not.toBe(22);
    expect(overview.searchConsoleConnected).toBe(true);
  });

  it("distinguishes Search Console disconnected from connected with zero measured clicks", async () => {
    connected = false;
    cacheClicks = 0;
    const disconnected = await getFoundationOverview({
      start: "2026-08-01",
      end: "2026-08-21",
    });
    expect(disconnected.searchConsoleConnected).toBe(false);
    expect(disconnected.organicClicks).toBe(0);

    connected = true;
    const connectedZero = await getFoundationOverview({
      start: "2026-08-01",
      end: "2026-08-21",
    });
    expect(connectedZero.searchConsoleConnected).toBe(true);
    expect(connectedZero.organicClicks).toBe(0);
  });
});

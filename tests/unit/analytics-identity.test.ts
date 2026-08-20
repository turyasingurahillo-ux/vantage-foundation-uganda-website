import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Regression tests for the Stories analytics identity fix.
 *
 * These tests reproduce the bug discovered during investigation:
 *   - Static-manifest stories (no dbId) were not tracked because the
 *     ArticleAnalytics component was gated behind `story.dbId`.
 *   - The ingestion endpoint used a DB-only story lookup and rejected
 *     static-manifest stories even if the tracker did fire.
 *
 * After the fix:
 *   - The canonical resolver (resolvePublishedStoryBySlug) finds both
 *     static and DB stories.
 *   - The ingestion endpoint uses the canonical resolver + analytics
 *     registry, so both story types are tracked.
 *   - Unknown and unpublished stories are still rejected.
 */

// --- Mocks --------------------------------------------------------------

vi.mock("server-only", () => ({}));

// Track the mock DB state so tests can manipulate it.
let mockDbStories: Array<{
  id: number;
  slug: string;
  title: string;
  category: string;
  published: boolean;
  deleted_at: Date | null;
  published_date: string;
}> = [];

vi.mock("@/lib/db/stories", () => ({
  getStories: vi.fn(async (opts?: { published?: boolean }) => {
    let rows = mockDbStories.filter((s) => !s.deleted_at);
    if (opts?.published !== undefined) {
      rows = rows.filter((s) => s.published === opts.published);
    }
    return rows.map((r) => ({
      id: r.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: r.slug,
      title: r.title,
      excerpt: "",
      author: null,
      role: null,
      date: r.published_date,
      location: null,
      category: r.category,
      body: "",
      heroImageKey: null,
      heroImageAlt: null,
      heroImageCredit: null,
      relatedProjectSlugs: [],
      tags: [],
      consentClassification: "none" as const,
      seoTitle: null,
      seoDescription: null,
      seoOgImage: null,
      published: r.published,
      deletedAt: r.deleted_at,
    }));
  }),
  getStoryBySlug: vi.fn(async (slug: string) => {
    const row = mockDbStories.find(
      (s) => s.slug === slug && !s.deleted_at
    );
    if (!row) return null;
    return {
      id: row.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: row.slug,
      title: row.title,
      excerpt: "",
      author: null,
      role: null,
      date: row.published_date,
      location: null,
      category: row.category,
      body: "",
      heroImageKey: null,
      heroImageAlt: null,
      heroImageCredit: null,
      relatedProjectSlugs: [],
      tags: [],
      consentClassification: "none" as const,
      seoTitle: null,
      seoDescription: null,
      seoOgImage: null,
      published: row.published,
      deletedAt: row.deleted_at,
    };
  }),
}));

// Mock the analytics articles registry.
let mockRegistry: Map<string, { id: number; slug: string; title: string; category: string; source: string; publishedDate: string | null }> = new Map();
let nextRegistryId = 1;

vi.mock("@/lib/db/analytics-articles", () => ({
  getAnalyticsArticleBySlug: vi.fn(async (slug: string) => {
    return mockRegistry.get(slug) ?? null;
  }),
  ensureAnalyticsArticleId: vi.fn(async (ref: { slug: string; title: string; category: string; source: string; publishedDate?: string }) => {
    const existing = mockRegistry.get(ref.slug);
    if (existing) return existing.id;
    const id = nextRegistryId++;
    mockRegistry.set(ref.slug, {
      id,
      slug: ref.slug,
      title: ref.title,
      category: ref.category,
      source: ref.source,
      publishedDate: ref.publishedDate ?? null,
    });
    return id;
  }),
  upsertAnalyticsArticle: vi.fn(async (ref: { slug: string; title: string; category: string; source: string; publishedDate?: string }) => {
    const id = nextRegistryId++;
    mockRegistry.set(ref.slug, {
      id,
      slug: ref.slug,
      title: ref.title,
      category: ref.category,
      source: ref.source,
      publishedDate: ref.publishedDate ?? null,
    });
    return id;
  }),
  getAllAnalyticsArticles: vi.fn(async () => {
    return Array.from(mockRegistry.values());
  }),
}));

// Mock the analytics ingestion.
vi.mock("@/lib/db/analytics", () => ({
  ingestEvent: vi.fn(async () => {}),
  classifySource: vi.fn((referrer: string | null) => {
    if (!referrer) return "direct";
    if (referrer.includes("google.")) return "google";
    return "referral";
  }),
  getSearchConsoleStatus: vi.fn(async () => ({ connected: false, siteUrl: null, lastSyncAt: null, lastError: null })),
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(() => true),
  getClientIp: vi.fn(() => "127.0.0.1"),
}));

vi.mock("@/lib/logger", () => ({
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logError: vi.fn(),
}));

// Import after mocks.
import { resolvePublishedStoryBySlug } from "@/lib/stories-public";
import { POST } from "@/app/api/analytics/events/route";
import { ensureAnalyticsArticleId } from "@/lib/db/analytics-articles";
import { ingestEvent } from "@/lib/db/analytics";
import { getStoryBySlug, getStories } from "@/lib/db/stories";

const URL = "http://localhost/api/analytics/events";

function buildRequest(body: Record<string, unknown>): Request {
  return new Request(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  // Clear call history without resetting implementations (vi.clearAllMocks
  // in vitest 4 can reset implementations set via vi.fn(impl)).
  vi.mocked(ingestEvent).mockClear();
  vi.mocked(ensureAnalyticsArticleId).mockClear();
  vi.mocked(getStoryBySlug).mockClear();
  vi.mocked(getStories).mockClear();
  // Restore default implementations in case a previous test overrode them.
  vi.mocked(ensureAnalyticsArticleId).mockImplementation(async (ref: { slug: string; title: string; category: string; source: string; publishedDate?: string }) => {
    const existing = mockRegistry.get(ref.slug);
    if (existing) return existing.id;
    const id = nextRegistryId++;
    mockRegistry.set(ref.slug, {
      id,
      slug: ref.slug,
      title: ref.title,
      category: ref.category,
      source: ref.source,
      publishedDate: ref.publishedDate ?? null,
    });
    return id;
  });
  vi.mocked(getStoryBySlug).mockImplementation(async (slug: string) => {
    const row = mockDbStories.find(
      (s) => s.slug === slug && !s.deleted_at
    );
    if (!row) return null;
    return {
      id: row.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      slug: row.slug,
      title: row.title,
      excerpt: "",
      author: null,
      role: null,
      date: row.published_date,
      location: null,
      category: row.category,
      body: "",
      heroImageKey: null,
      heroImageAlt: null,
      heroImageCredit: null,
      relatedProjectSlugs: [],
      tags: [],
      consentClassification: "none" as const,
      seoTitle: null,
      seoDescription: null,
      seoOgImage: null,
      published: row.published,
      deletedAt: row.deleted_at,
    };
  });
  mockDbStories = [];
  mockRegistry = new Map();
  nextRegistryId = 1;
});

// --- Tests --------------------------------------------------------------

describe("resolvePublishedStoryBySlug", () => {
  it("resolves a static-manifest story with no DB row", async () => {
    const ref = await resolvePublishedStoryBySlug("beyond-the-ward");
    expect(ref).not.toBeNull();
    expect(ref!.slug).toBe("beyond-the-ward");
    expect(ref!.source).toBe("static");
    expect(ref!.dbId).toBeUndefined();
  });

  it("resolves a DB story when one exists and is published", async () => {
    mockDbStories = [
      {
        id: 42,
        slug: "beyond-the-ward",
        title: "Beyond the Ward (DB)",
        category: "Career guide",
        published: true,
        deleted_at: null,
        published_date: "2026-08-14",
      },
    ];
    const ref = await resolvePublishedStoryBySlug("beyond-the-ward");
    expect(ref).not.toBeNull();
    expect(ref!.source).toBe("db");
    expect(ref!.dbId).toBe(42);
    expect(ref!.title).toBe("Beyond the Ward (DB)");
  });

  it("returns null for an unknown slug", async () => {
    const ref = await resolvePublishedStoryBySlug("not-a-real-story");
    expect(ref).toBeNull();
  });

  it("returns null for an unpublished DB story (falls back to static, which also doesn't have it)", async () => {
    mockDbStories = [
      {
        id: 99,
        slug: "totally-unique-unpublished",
        title: "Draft",
        category: "Test",
        published: false,
        deleted_at: null,
        published_date: "2026-01-01",
      },
    ];
    const ref = await resolvePublishedStoryBySlug("totally-unique-unpublished");
    expect(ref).toBeNull();
  });

  it("falls back to static manifest when DB is unreachable", async () => {
    // Simulate DB error by making getStoryBySlug throw.
    const { getStoryBySlug } = await import("@/lib/db/stories");
    (getStoryBySlug as unknown as { mockImplementation: (fn: () => Promise<never>) => void }).mockImplementation(async () => {
      throw new Error("DB connection failed");
    });
    const ref = await resolvePublishedStoryBySlug("beyond-the-ward");
    expect(ref).not.toBeNull();
    expect(ref!.source).toBe("static");
  });
});

describe("POST /api/analytics/events — ingestion", () => {
  it("accepts a valid published static-manifest story (test A)", async () => {
    const res = await POST(
      buildRequest({
        articleSlug: "beyond-the-ward",
        eventType: "article_view",
      })
    );
    expect(res.status).toBe(204);
    expect(ensureAnalyticsArticleId).toHaveBeenCalledTimes(1);
    expect(ingestEvent).toHaveBeenCalledTimes(1);
    // Verify the registry was called with the correct ref.
    const refArg = (ensureAnalyticsArticleId as unknown as { mock: { calls: unknown[][] } }).mock.calls[0][0] as {
      slug: string;
      source: string;
    };
    expect(refArg.slug).toBe("beyond-the-ward");
    expect(refArg.source).toBe("static");
  });

  it("accepts a valid published DB story (test B)", async () => {
    mockDbStories = [
      {
        id: 10,
        slug: "db-published-story",
        title: "DB Story",
        category: "Research",
        published: true,
        deleted_at: null,
        published_date: "2026-08-01",
      },
    ];
    const res = await POST(
      buildRequest({
        articleSlug: "db-published-story",
        eventType: "article_view",
      })
    );
    expect(res.status).toBe(204);
    expect(ingestEvent).toHaveBeenCalledTimes(1);
    const refArg = (ensureAnalyticsArticleId as unknown as { mock: { calls: unknown[][] } }).mock.calls[0][0] as {
      slug: string;
      source: string;
    };
    expect(refArg.source).toBe("db");
  });

  it("rejects an unknown slug without persisting (test C)", async () => {
    const res = await POST(
      buildRequest({
        articleSlug: "not-a-real-story",
        eventType: "article_view",
      })
    );
    expect(res.status).toBe(204);
    expect(ensureAnalyticsArticleId).not.toHaveBeenCalled();
    expect(ingestEvent).not.toHaveBeenCalled();
  });

  it("rejects an unpublished DB story without persisting (test D)", async () => {
    mockDbStories = [
      {
        id: 50,
        slug: "unique-draft-slug",
        title: "Draft",
        category: "Test",
        published: false,
        deleted_at: null,
        published_date: "2026-01-01",
      },
    ];
    const res = await POST(
      buildRequest({
        articleSlug: "unique-draft-slug",
        eventType: "article_view",
      })
    );
    expect(res.status).toBe(204);
    expect(ensureAnalyticsArticleId).not.toHaveBeenCalled();
    expect(ingestEvent).not.toHaveBeenCalled();
  });

  it("handles scroll, engagement, share, and CTA events for static stories", async () => {
    // article_view
    await POST(buildRequest({ articleSlug: "beyond-the-ward", eventType: "article_view" }));
    // article_scroll at 50%
    await POST(buildRequest({ articleSlug: "beyond-the-ward", eventType: "article_scroll", percentage: 50 }));
    // article_complete
    await POST(buildRequest({ articleSlug: "beyond-the-ward", eventType: "article_complete" }));
    // article_engagement
    await POST(buildRequest({ articleSlug: "beyond-the-ward", eventType: "article_engagement", engagementSeconds: 45 }));
    // article_share
    await POST(buildRequest({ articleSlug: "beyond-the-ward", eventType: "article_share", platform: "whatsapp" }));
    // article_cta_click
    await POST(buildRequest({ articleSlug: "beyond-the-ward", eventType: "article_cta_click", ctaType: "donate" }));

    expect(ingestEvent).toHaveBeenCalledTimes(6);
  });

  it("returns 204 even on DB errors (analytics must never break the page)", async () => {
    // Make ensureAnalyticsArticleId throw.
    (ensureAnalyticsArticleId as unknown as { mockImplementation: (fn: () => Promise<never>) => void }).mockImplementation(async () => {
      throw new Error("DB down");
    });
    const res = await POST(
      buildRequest({
        articleSlug: "beyond-the-ward",
        eventType: "article_view",
      })
    );
    expect(res.status).toBe(204);
  });
});

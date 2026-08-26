import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import type { StoryRow } from "@/lib/db/stories";

/**
 * Regression test for the standalone AnalyticsDashboard row-menu bug.
 *
 * Before the fix, the dashboard always passed its locally-defined
 * handleEdit/handleDelete wrappers into every RowMenu. Those wrappers
 * were always-defined functions, so RowMenu's `if (onEdit)` / `if (onDelete)`
 * branches always took the callback path — rendering a no-op Edit button
 * (instead of a link) and a no-op Delete button on the standalone
 * /admin/analytics page where no callbacks are supplied.
 *
 * After the fix, when onEditStory/onDeleteStory are omitted, handleEdit
 * and handleDelete are `undefined`, so RowMenu falls back to a link-based
 * Edit action and hides Delete entirely.
 */

// --- Mock data ------------------------------------------------------------

const dbStory: StoryRow = {
  id: 7,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-08-01"),
  slug: "example-story",
  title: "Example Story",
  excerpt: "Excerpt",
  author: "Jane",
  role: null,
  date: "2026-08-01",
  location: "Uganda",
  category: "Research & Learning",
  body: "Body",
  heroImageKey: null,
  heroImageAlt: null,
  heroImageCredit: null,
  relatedProjectSlugs: [],
  tags: [],
  consentClassification: "none",
  seoTitle: null,
  seoDescription: null,
  seoOgImage: null,
  published: true,
  deletedAt: null,
};

const articleRow = {
  analyticsArticleId: 41,
  storyId: 7, // deliberately different from analyticsArticleId
  slug: "example-story",
  title: "Example Story",
  status: "published" as const,
  isActive: true,
  publishedDate: "2026-08-01",
  author: "Jane",
  category: "Research & Learning",
  views: 100,
  readers: 80,
  avgEngagementSeconds: 120,
  completionRate: 0.75,
  shares: 5,
  googleClicks: 0,
  ctaActions: 2,
  impactScore: 65,
};

// --- Fetch mock -----------------------------------------------------------

function mockFetch() {
  const responses: Record<string, unknown> = {
    overview: { current: { totalViews: 100, uniqueReaders: 80, avgEngagementSeconds: 120, avgCompletionRate: 0.75, totalShares: 5, organicClicks: 0, ctaActions: 2 }, previous: null },
    articles: { articles: [articleRow] },
    traffic: { traffic: [] },
    categories: { categories: [] },
    trend: { trend: [] },
  };
  return vi.fn(async (url: string) => {
    const u = new URL(url, "http://localhost");
    const report = u.searchParams.get("report") ?? "";
    return {
      ok: true,
      json: async () => responses[report] ?? {},
    } as Response;
  });
}

// --- Tests ----------------------------------------------------------------

describe("AnalyticsDashboard — standalone mode (no edit/delete callbacks)", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    globalThis.fetch = mockFetch() as unknown as typeof globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("renders an Edit link (not a no-op button) for DB-backed stories", async () => {
    render(<AnalyticsDashboard stories={[dbStory]} />);
    // Switch to the Performance table tab where article rows live
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Performance table" })).toBeTruthy();
    });
    fireEvent.click(screen.getByRole("button", { name: "Performance table" }));
    // Wait for the article row to appear
    await waitFor(() => {
      expect(screen.getByText("Example Story")).toBeTruthy();
    });
    // Open the row menu
    const menuButton = screen.getByLabelText("Actions for Example Story");
    fireEvent.click(menuButton);
    // The Edit action should be a link to /admin/stories/7?tab=edit,
    // not a no-op button.
    const editLink = screen.queryByText("Edit");
    expect(editLink).toBeTruthy();
    expect(editLink?.tagName).toBe("A");
    expect(editLink?.getAttribute("href")).toBe("/admin/stories/7?tab=edit");
  });

  it("hides the Delete action when no onDeleteStory callback is supplied", async () => {
    render(<AnalyticsDashboard stories={[dbStory]} />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Performance table" })).toBeTruthy();
    });
    fireEvent.click(screen.getByRole("button", { name: "Performance table" }));
    await waitFor(() => {
      expect(screen.getByText("Example Story")).toBeTruthy();
    });
    fireEvent.click(screen.getByLabelText("Actions for Example Story"));
    // Delete should NOT be rendered in standalone mode
    expect(screen.queryByText("Delete")).toBeNull();
  });
});

describe("AnalyticsDashboard — embedded mode (with edit/delete callbacks)", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    globalThis.fetch = mockFetch() as unknown as typeof globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("renders an Edit button (not a link) when onEditStory is supplied", async () => {
    const onEditStory = vi.fn();
    render(<AnalyticsDashboard stories={[dbStory]} onEditStory={onEditStory} />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Performance table" })).toBeTruthy();
    });
    fireEvent.click(screen.getByRole("button", { name: "Performance table" }));
    await waitFor(() => {
      expect(screen.getByText("Example Story")).toBeTruthy();
    });
    fireEvent.click(screen.getByLabelText("Actions for Example Story"));
    const editAction = screen.queryByText("Edit");
    expect(editAction).toBeTruthy();
    // In embedded mode, Edit is a <button>, not an <a>
    expect(editAction?.tagName).toBe("BUTTON");
  });

  it("renders the Delete button when onDeleteStory is supplied", async () => {
    const onDeleteStory = vi.fn();
    render(<AnalyticsDashboard stories={[dbStory]} onDeleteStory={onDeleteStory} />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Performance table" })).toBeTruthy();
    });
    fireEvent.click(screen.getByRole("button", { name: "Performance table" }));
    await waitFor(() => {
      expect(screen.getByText("Example Story")).toBeTruthy();
    });
    fireEvent.click(screen.getByLabelText("Actions for Example Story"));
    expect(screen.queryByText("Delete")).toBeTruthy();
  });
});

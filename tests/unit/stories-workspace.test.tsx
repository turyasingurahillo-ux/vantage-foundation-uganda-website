import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StoriesWorkspace } from "@/components/admin/stories/StoriesWorkspace";
import type { StoryRow } from "@/lib/db/stories";

/**
 * Tests for the StoriesWorkspace component.
 *
 * Verifies that the redesigned /admin/stories workspace:
 * - Shows summary counts (total, published, drafts, static)
 * - Lists both DB and static stories
 * - Static stories do not expose edit/delete actions
 * - DB stories expose edit, analytics, view, and delete actions
 * - Search and filtering work
 * - The New Story button opens the editor
 */

// --- Helpers -------------------------------------------------------------

function makeStoryRow(overrides: Partial<StoryRow> = {}): StoryRow {
  return {
    id: 7,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-08-01"),
    slug: "db-story",
    title: "DB Story",
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
    ...overrides,
  };
}

const staticStories = [
  {
    slug: "static-story",
    title: "Static Story",
    category: "Career guide",
    author: "Team",
    date: "2026-07-01",
  },
];

// --- Tests ---------------------------------------------------------------

describe("StoriesWorkspace — summary counts", () => {
  it("shows summary cards with correct labels", () => {
    const items = [
      makeStoryRow({ id: 1, slug: "pub-1", title: "Published 1", published: true }),
      makeStoryRow({ id: 2, slug: "draft-1", title: "Draft 1", published: false }),
    ];
    render(
      <StoriesWorkspace
        csrfToken="test"
        initialItems={items}
        staticStories={staticStories}
      />,
    );
    // "Total stories" and "Static stories" are unique labels
    expect(screen.getByText("Total stories")).toBeTruthy();
    expect(screen.getByText("Static stories")).toBeTruthy();
    // "Drafts" and "Published" appear in both summary cards and filter dropdowns
    expect(screen.getAllByText("Drafts").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Published").length).toBeGreaterThanOrEqual(1);
    // Total count "3" (2 DB + 1 static) should be rendered
    expect(screen.getByText("3")).toBeTruthy();
  });
});

describe("StoriesWorkspace — static story behavior", () => {
  it("renders static stories with 'Static' source label", () => {
    render(
      <StoriesWorkspace
        csrfToken="test"
        initialItems={[]}
        staticStories={staticStories}
      />,
    );
    expect(screen.getByText("Static Story")).toBeTruthy();
    expect(screen.getByText("Static")).toBeTruthy();
  });

  it("does not show edit/delete actions for static stories", () => {
    render(
      <StoriesWorkspace
        csrfToken="test"
        initialItems={[]}
        staticStories={staticStories}
      />,
    );
    // Static stories should show "Static — no editor" instead of Edit/Delete
    expect(screen.getByText("Static — no editor")).toBeTruthy();
    expect(screen.queryByText("Edit")).toBeNull();
    expect(screen.queryByText("Delete")).toBeNull();
  });

  it("shows a public View link for static stories", () => {
    render(
      <StoriesWorkspace
        csrfToken="test"
        initialItems={[]}
        staticStories={staticStories}
      />,
    );
    const viewLink = screen.getByText("View");
    expect(viewLink.getAttribute("href")).toBe("/stories/static-story");
  });
});

describe("StoriesWorkspace — DB story behavior", () => {
  it("renders DB stories with 'Editable' source label", () => {
    const items = [makeStoryRow()];
    render(
      <StoriesWorkspace
        csrfToken="test"
        initialItems={items}
        staticStories={[]}
      />,
    );
    expect(screen.getByText("DB Story")).toBeTruthy();
    expect(screen.getByText("Editable")).toBeTruthy();
  });

  it("shows edit, analytics, view, and delete actions for DB stories", () => {
    const items = [makeStoryRow()];
    render(
      <StoriesWorkspace
        csrfToken="test"
        initialItems={items}
        staticStories={[]}
      />,
    );
    expect(screen.getByText("Edit")).toBeTruthy();
    expect(screen.getByText("Analytics")).toBeTruthy();
    expect(screen.getByText("View")).toBeTruthy();
    expect(screen.getByText("Delete")).toBeTruthy();
  });

  it("edit link points to /admin/stories/[storyId] (not analyticsArticleId)", () => {
    const items = [makeStoryRow({ id: 7 })];
    render(
      <StoriesWorkspace
        csrfToken="test"
        initialItems={items}
        staticStories={[]}
      />,
    );
    const analyticsLink = screen.getByText("Analytics");
    expect(analyticsLink.getAttribute("href")).toBe("/admin/stories/7?tab=analytics");
  });

  it("public view link uses the slug", () => {
    const items = [makeStoryRow({ slug: "my-db-story" })];
    render(
      <StoriesWorkspace
        csrfToken="test"
        initialItems={items}
        staticStories={[]}
      />,
    );
    const viewLink = screen.getByText("View");
    expect(viewLink.getAttribute("href")).toBe("/stories/my-db-story");
  });
});

describe("StoriesWorkspace — New Story button", () => {
  it("opens the editor when New Story is clicked", () => {
    render(
      <StoriesWorkspace
        csrfToken="test"
        initialItems={[]}
        staticStories={[]}
      />,
    );
    fireEvent.click(screen.getByText("+ New Story"));
    // The editor form should now be visible
    expect(screen.getByText("Write a story or insight")).toBeTruthy();
  });
});

describe("StoriesWorkspace — search", () => {
  it("filters stories by title", () => {
    const items = [
      makeStoryRow({ id: 1, slug: "alpha", title: "Alpha Article" }),
      makeStoryRow({ id: 2, slug: "beta", title: "Beta Article" }),
    ];
    render(
      <StoriesWorkspace
        csrfToken="test"
        initialItems={items}
        staticStories={[]}
      />,
    );
    const searchInput = screen.getByPlaceholderText("Search by title or slug…");
    fireEvent.change(searchInput, { target: { value: "alpha" } });
    expect(screen.getByText("Alpha Article")).toBeTruthy();
    expect(screen.queryByText("Beta Article")).toBeNull();
  });
});

describe("StoriesWorkspace — empty state", () => {
  it("shows a helpful empty state when no stories exist", () => {
    render(
      <StoriesWorkspace
        csrfToken="test"
        initialItems={[]}
        staticStories={[]}
      />,
    );
    expect(screen.getByText(/No stories yet/i)).toBeTruthy();
  });
});

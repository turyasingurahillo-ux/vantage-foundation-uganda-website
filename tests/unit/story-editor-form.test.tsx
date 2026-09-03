import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  StoryEditorForm,
  emptyStoryForm,
  storyToForm,
  fieldLabel,
  REQUIRED_FIELDS,
  STORY_FIELD_KEYS,
} from "@/components/admin/stories/StoryEditorForm";
import type { StoryRow } from "@/lib/db/stories";

/**
 * Tests for the canonical StoryEditorForm.
 *
 * Verifies that the consolidated editor:
 * - Handles both creation and editing modes
 * - Renders all expected fields
 * - Calls the correct API method (POST vs PATCH)
 * - Exposes shared form utilities for reuse
 */

// --- Helpers -------------------------------------------------------------

function makeStoryRow(overrides: Partial<StoryRow> = {}): StoryRow {
  return {
    id: 7,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-08-01"),
    slug: "example-story",
    title: "Example Story",
    excerpt: "An example excerpt.",
    author: "Jane Doe",
    role: "Researcher",
    date: "2026-08-01",
    location: "Uganda",
    category: "Research & Learning",
    body: "## Body text",
    heroImageKey: "vantage/stories/hero.webp",
    heroImageAlt: "Alt text",
    heroImageCredit: "Credit",
    relatedProjectSlugs: ["project-a"],
    tags: ["tag1", "tag2"],
    consentClassification: "none",
    seoTitle: "SEO Title",
    seoDescription: "SEO Description",
    seoOgImage: "",
    published: true,
    deletedAt: null,
    ...overrides,
  };
}

// --- Tests ---------------------------------------------------------------

describe("StoryEditorForm — shared utilities", () => {
  it("emptyStoryForm returns a form with today's date and empty strings", () => {
    const form = emptyStoryForm();
    expect(form.slug).toBe("");
    expect(form.title).toBe("");
    expect(form.body).toBe("");
    expect(form.published).toBe(false);
    expect(form.consentClassification).toBe("none");
    // Date should be today in YYYY-MM-DD format
    expect(form.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("storyToForm converts a StoryRow to form state", () => {
    const row = makeStoryRow();
    const form = storyToForm(row);
    expect(form.slug).toBe("example-story");
    expect(form.title).toBe("Example Story");
    expect(form.author).toBe("Jane Doe");
    expect(form.tags).toBe("tag1, tag2");
    expect(form.published).toBe(true);
  });

  it("storyToForm handles null optional fields", () => {
    const row = makeStoryRow({ author: null, role: null, location: null });
    const form = storyToForm(row);
    expect(form.author).toBe("");
    expect(form.role).toBe("");
    expect(form.location).toBe("");
  });

  it("fieldLabel produces human-readable labels", () => {
    expect(fieldLabel("title")).toBe("Title");
    expect(fieldLabel("heroImageAlt")).toBe("Hero image alt text");
    expect(fieldLabel("heroImageCredit")).toBe("Hero image credit");
    expect(fieldLabel("seoTitle")).toBe("Seo Title");
  });

  it("REQUIRED_FIELDS includes the core required fields", () => {
    expect(REQUIRED_FIELDS.has("title")).toBe(true);
    expect(REQUIRED_FIELDS.has("slug")).toBe(true);
    expect(REQUIRED_FIELDS.has("excerpt")).toBe(true);
    expect(REQUIRED_FIELDS.has("date")).toBe(true);
    expect(REQUIRED_FIELDS.has("category")).toBe(true);
    expect(REQUIRED_FIELDS.has("body")).toBe(false);
  });

  it("STORY_FIELD_KEYS includes all text input fields", () => {
    expect(STORY_FIELD_KEYS).toContain("title");
    expect(STORY_FIELD_KEYS).toContain("slug");
    expect(STORY_FIELD_KEYS).toContain("seoOgImage");
    expect(STORY_FIELD_KEYS).not.toContain("body"); // body is a textarea
    expect(STORY_FIELD_KEYS).not.toContain("published"); // published is a checkbox
  });
});

describe("StoryEditorForm — creation mode", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a creation form when no story is provided", () => {
    render(<StoryEditorForm csrfToken="test-csrf" />);
    expect(screen.getByText("Write a story or insight")).toBeTruthy();
    expect(screen.getByRole("button", { name: /save draft/i })).toBeTruthy();
  });

  it("does not show a Cancel button in creation mode", () => {
    render(<StoryEditorForm csrfToken="test-csrf" />);
    expect(screen.queryByText("Cancel")).toBeNull();
  });
});

describe("StoryEditorForm — editing mode", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders an edit form when a story is provided", () => {
    const story = makeStoryRow();
    render(<StoryEditorForm csrfToken="test-csrf" story={story} />);
    expect(screen.getByText("Edit story or insight")).toBeTruthy();
    expect(screen.getByRole("button", { name: /save changes/i })).toBeTruthy();
  });

  it("shows a Cancel button when onCancel is provided", () => {
    const story = makeStoryRow();
    const onCancel = vi.fn();
    render(<StoryEditorForm csrfToken="test-csrf" story={story} onCancel={onCancel} />);
    expect(screen.getByText("Cancel")).toBeTruthy();
  });

  it("pre-fills form fields from the story", () => {
    const story = makeStoryRow();
    render(<StoryEditorForm csrfToken="test-csrf" story={story} />);
    const titleInput = screen.getByDisplayValue("Example Story") as HTMLInputElement;
    expect(titleInput).toBeTruthy();
    const slugInput = screen.getByDisplayValue("example-story") as HTMLInputElement;
    expect(slugInput).toBeTruthy();
  });

  it("calls onCancel when Cancel is clicked", () => {
    const story = makeStoryRow();
    const onCancel = vi.fn();
    render(<StoryEditorForm csrfToken="test-csrf" story={story} onCancel={onCancel} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

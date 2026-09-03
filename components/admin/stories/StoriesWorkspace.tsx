"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import type { StoryRow } from "@/lib/db/stories";
import { StoryEditorForm } from "./StoryEditorForm";

/**
 * StoriesWorkspace — the canonical story-management workspace for /admin/stories.
 *
 * Replaces the old StoriesManager hybrid (which embedded analytics + editor).
 * This component is content-management only:
 * - Lists all DB-backed stories with status, category, author, dates
 * - Shows summary counts (total, published, drafts)
 * - Provides search and filtering
 * - Offers New Story, Edit, Delete, and public-view actions
 * - Uses correct identity namespaces:
 *   - public view → slug
 *   - edit/delete → storyId (stories.id)
 *   - analytics → navigates to /admin/stories/[id]?tab=analytics (storyId route)
 *
 * Static stories are listed as read-only entries with no edit/delete actions.
 */

interface StaticStorySummary {
  slug: string;
  title: string;
  category: string;
  author?: string | null;
  date: string;
}

interface StoriesWorkspaceProps {
  csrfToken: string;
  initialItems: StoryRow[];
  staticStories: StaticStorySummary[];
}

type StatusFilter = "all" | "published" | "draft";
type SourceFilter = "all" | "db" | "static";

type SortKey = "title" | "date" | "status";
type SortDir = "asc" | "desc";

interface UnifiedRow {
  /** Editorial story ID — null for static stories. */
  storyId: number | null;
  slug: string;
  title: string;
  category: string;
  author: string | null;
  date: string;
  published: boolean;
  source: "db" | "static";
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}

export function StoriesWorkspace({
  csrfToken,
  initialItems,
  staticStories,
}: StoriesWorkspaceProps) {
  const [items, setItems] = useState<StoryRow[]>(initialItems);
  const [showEditor, setShowEditor] = useState(false);
  const [editingStory, setEditingStory] = useState<StoryRow | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [deleteTarget, setDeleteTarget] = useState<StoryRow | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Merge DB and static stories into a unified list, deduplicating by slug.
  const unifiedRows = useMemo<UnifiedRow[]>(() => {
    const dbRows: UnifiedRow[] = items.map((item) => ({
      storyId: item.id,
      slug: item.slug,
      title: item.title,
      category: item.category,
      author: item.author,
      date: item.date.slice(0, 10),
      published: item.published,
      source: "db",
    }));
    const dbSlugs = new Set(dbRows.map((r) => r.slug));
    const staticRows: UnifiedRow[] = staticStories
      .filter((s) => !dbSlugs.has(s.slug))
      .map((s) => ({
        storyId: null,
        slug: s.slug,
        title: s.title,
        category: s.category,
        author: s.author ?? null,
        date: s.date.slice(0, 10),
        published: true,
        source: "static",
      }));
    return [...dbRows, ...staticRows];
  }, [items, staticStories]);

  // Summary counts
  const counts = useMemo(() => {
    const dbStories = items;
    const publishedCount = dbStories.filter((s) => s.published).length;
    const draftCount = dbStories.filter((s) => !s.published).length;
    const staticCount = unifiedRows.filter((r) => r.source === "static").length;
    return {
      total: unifiedRows.length,
      published: publishedCount,
      drafts: draftCount,
      static: staticCount,
    };
  }, [items, unifiedRows]);

  // Filtering
  const filteredRows = useMemo(() => {
    let result = [...unifiedRows];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.slug.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all") {
      if (statusFilter === "published") result = result.filter((r) => r.published);
      if (statusFilter === "draft") result = result.filter((r) => !r.published && r.source === "db");
    }
    if (sourceFilter !== "all") {
      result = result.filter((r) => r.source === sourceFilter);
    }
    result.sort((a, b) => {
      let cmp: number;
      if (sortKey === "title") cmp = a.title.localeCompare(b.title);
      else if (sortKey === "status") cmp = Number(a.published) - Number(b.published);
      else cmp = a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [unifiedRows, search, statusFilter, sourceFilter, sortKey, sortDir]);

  const categoriesList = useMemo(
    () => [...new Set(unifiedRows.map((r) => r.category))].sort(),
    [unifiedRows],
  );

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const handleNewStory = useCallback(() => {
    setEditingStory(null);
    setShowEditor(true);
  }, []);

  const handleEditStory = useCallback((story: StoryRow) => {
    setEditingStory(story);
    setShowEditor(true);
  }, []);

  const handleCancelEditor = useCallback(() => {
    setShowEditor(false);
    setEditingStory(null);
  }, []);

  const handleSaved = useCallback(
    (saved: StoryRow) => {
      setItems((current) => {
        const idx = current.findIndex((s) => s.id === saved.id);
        if (idx >= 0) {
          const next = [...current];
          next[idx] = saved;
          return next;
        }
        return [saved, ...current];
      });
      setShowEditor(false);
      setEditingStory(null);
    },
    [],
  );

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    setDeleteError("");
    try {
      const response = await fetch("/api/admin/stories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify({ id: deleteTarget.id, csrf_token: csrfToken }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Could not delete the story.");
      }
      setItems((current) => current.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Could not delete the story.");
    } finally {
      setDeleteBusy(false);
    }
  };

  // --- Editor view -------------------------------------------------------
  if (showEditor) {
    return (
      <div className="mt-8">
        <StoryEditorForm
          csrfToken={csrfToken}
          story={editingStory}
          onSaved={handleSaved}
          onCancel={handleCancelEditor}
        />
      </div>
    );
  }

  // --- List view ---------------------------------------------------------
  return (
    <div className="mt-8 space-y-6">
      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard label="Total stories" value={formatNumber(counts.total)} />
        <SummaryCard
          label="Published"
          value={formatNumber(counts.published)}
          accent="text-success-fg"
        />
        <SummaryCard
          label="Drafts"
          value={formatNumber(counts.drafts)}
          accent="text-amber-600"
        />
        <SummaryCard
          label="Static stories"
          value={formatNumber(counts.static)}
          accent="text-muted-foreground"
        />
      </div>

      {/* Search + filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search by title or slug…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-border px-3 py-2 text-sm"
          aria-label="Search stories"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-lg border border-border px-3 py-2 text-sm"
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value as SourceFilter)}
          className="rounded-lg border border-border px-3 py-2 text-sm"
          aria-label="Filter by source"
        >
          <option value="all">All sources</option>
          <option value="db">Editable (database)</option>
          <option value="static">Static (code manifest)</option>
        </select>
        <select
          value={categoriesList.includes("") ? "" : "all"}
          onChange={() => {}}
          className="hidden rounded-lg border border-border px-3 py-2 text-sm"
          aria-hidden="true"
          disabled
        >
          <option value="all">All categories</option>
        </select>
        <div className="ml-auto">
          <button
            type="button"
            onClick={handleNewStory}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
          >
            + New Story
          </button>
        </div>
      </div>

      {/* Story table */}
      {filteredRows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {unifiedRows.length === 0
              ? "No stories yet. Click “New Story” to create your first article."
              : "No stories match the current filters."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th
                  className="cursor-pointer whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  onClick={() => handleSort("title")}
                >
                  Title {sortKey === "title" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Source
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Category
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Author
                </th>
                <th
                  className="cursor-pointer whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  onClick={() => handleSort("date")}
                >
                  Date {sortKey === "date" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRows.map((row) => {
                const dbStory = items.find((s) => s.id === row.storyId);
                return (
                  <tr key={`${row.source}-${row.slug}`} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <a
                        href={`/stories/${row.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        {row.title}
                      </a>
                      <div className="text-xs text-muted-foreground">/stories/{row.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          row.published
                            ? "bg-success-bg text-success-fg"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {row.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium ${
                          row.source === "db" ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {row.source === "db" ? "Editable" : "Static"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {row.category}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {row.author ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {row.date}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/stories/${row.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          View
                        </a>
                        {row.storyId !== null && dbStory ? (
                          <>
                            <Link
                              href={`/admin/stories/${row.storyId}?tab=analytics`}
                              className="text-xs font-medium text-muted-foreground hover:text-foreground"
                            >
                              Analytics
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleEditStory(dbStory)}
                              className="text-xs font-medium text-primary hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(dbStory)}
                              className="text-xs font-medium text-destructive-fg hover:underline"
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Static — no editor
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm deletion"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">Delete story?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to delete “{deleteTarget.title}”? This will soft-delete
              the story and remove its hero image from storage. The action is reversible
              by restoring the database row.
            </p>
            {deleteError && (
              <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-900">
                {deleteError}
              </p>
            )}
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteError("");
                }}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-slate-50"
                disabled={deleteBusy}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteBusy}
                className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {deleteBusy ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={`mt-1 text-2xl font-bold tabular-nums ${accent ?? ""}`}>
        {value}
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import type { StoryRow } from "@/lib/db/stories";

/**
 * StoryEditorForm — the single canonical editor for creating and editing
 * Stories & Insights entries.
 *
 * Consolidates the previously duplicated form logic from StoriesManager
 * (create + edit) and ArticleEditorForm (edit-only) into one component.
 *
 * Identity safety:
 * - The editor operates on editorial story IDs (stories.id) only.
 * - It never touches analyticsArticleId.
 * - Public preview links use the slug.
 */

export interface StoryEditorFormProps {
  csrfToken: string;
  /** When provided, the form edits this story. When omitted, a new story is created. */
  story?: StoryRow | null;
  /** Called after a successful save. Receives the saved story row. */
  onSaved?: (story: StoryRow) => void;
  /** Called when the user cancels editing. */
  onCancel?: () => void;
}

// --- Shared form state --------------------------------------------------

export interface StoryFormState {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  role: string;
  date: string;
  location: string;
  category: string;
  body: string;
  heroImageKey: string;
  heroImageAlt: string;
  heroImageCredit: string;
  tags: string;
  relatedProjectSlugs: string;
  consentClassification: string;
  seoTitle: string;
  seoDescription: string;
  seoOgImage: string;
  published: boolean;
}

export const STORY_FIELD_KEYS = [
  "title",
  "slug",
  "excerpt",
  "author",
  "role",
  "date",
  "location",
  "category",
  "heroImageAlt",
  "heroImageCredit",
  "seoTitle",
  "seoDescription",
  "seoOgImage",
] as const;

export const REQUIRED_FIELDS: ReadonlySet<string> = new Set([
  "title",
  "slug",
  "excerpt",
  "date",
  "category",
]);

export function emptyStoryForm(): StoryFormState {
  return {
    slug: "",
    title: "",
    excerpt: "",
    author: "",
    role: "",
    date: new Date().toISOString().slice(0, 10),
    location: "",
    category: "",
    body: "",
    heroImageKey: "",
    heroImageAlt: "",
    heroImageCredit: "",
    tags: "",
    relatedProjectSlugs: "",
    consentClassification: "none",
    seoTitle: "",
    seoDescription: "",
    seoOgImage: "",
    published: false,
  };
}

export function storyToForm(item: StoryRow): StoryFormState {
  return {
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt,
    author: item.author ?? "",
    role: item.role ?? "",
    date: item.date.slice(0, 10),
    location: item.location ?? "",
    category: item.category,
    body: item.body,
    heroImageKey: item.heroImageKey ?? "",
    heroImageAlt: item.heroImageAlt ?? "",
    heroImageCredit: item.heroImageCredit ?? "",
    tags: item.tags.join(", "),
    relatedProjectSlugs: item.relatedProjectSlugs.join(", "),
    consentClassification: item.consentClassification,
    seoTitle: item.seoTitle ?? "",
    seoDescription: item.seoDescription ?? "",
    seoOgImage: item.seoOgImage ?? "",
    published: item.published,
  };
}

export function fieldLabel(key: string): string {
  if (key === "heroImageAlt") return "Hero image alt text";
  if (key === "heroImageCredit") return "Hero image credit";
  return key.replace(/[A-Z]/g, (letter) => ` ${letter}`).replace(/^./, (letter) => letter.toUpperCase());
}

// --- Component ----------------------------------------------------------

export function StoryEditorForm({ csrfToken, story, onSaved, onCancel }: StoryEditorFormProps) {
  const isEditing = !!story;
  const [form, setForm] = useState<StoryFormState>(() =>
    story ? storyToForm(story) : emptyStoryForm(),
  );
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = useCallback((key: keyof StoryFormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  }, []);

  const uploadHero = async (): Promise<string | undefined> => {
    if (!file) return form.heroImageKey || undefined;
    const presign = await fetch("/api/admin/media/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        contentLength: file.size,
        folder: "stories",
        slug: form.slug,
        csrf_token: csrfToken,
      }),
    });
    if (!presign.ok) throw new Error("Could not prepare the hero image upload.");
    const target = await presign.json();
    const put = await fetch(target.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!put.ok) throw new Error("Hero image upload failed.");
    return target.objectKey as string;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const heroImageKey = await uploadHero();
      const payload = {
        ...form,
        heroImageKey,
        tags: form.tags.split(",").map((v) => v.trim()).filter(Boolean),
        relatedProjectSlugs: form.relatedProjectSlugs.split(",").map((v) => v.trim()).filter(Boolean),
        author: form.author || undefined,
        role: form.role || undefined,
        location: form.location || undefined,
        heroImageAlt: form.heroImageAlt || undefined,
        heroImageCredit: form.heroImageCredit || undefined,
        seoTitle: form.seoTitle || undefined,
        seoDescription: form.seoDescription || undefined,
        seoOgImage: form.seoOgImage || undefined,
        csrf_token: csrfToken,
      };
      const response = await fetch("/api/admin/stories", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify(isEditing && story ? { ...payload, id: story.id } : payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not save the story.");
      setMessage(
        form.published
          ? isEditing
            ? "Story updated and published."
            : "Story published successfully."
          : isEditing
            ? "Story saved."
            : "Story saved as a draft.",
      );
      if (data.item) {
        onSaved?.(data.item as StoryRow);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not save the story.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5 rounded-xl border border-border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">
            {isEditing ? "Edit story or insight" : "Write a story or insight"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Use Markdown in the body. Save as a draft or publish immediately.
          </p>
        </div>
        {isEditing && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {STORY_FIELD_KEYS.map((key) => (
          <label
            key={key}
            className={
              key === "excerpt" || key === "seoDescription" ? "block sm:col-span-2" : "block"
            }
          >
            <span className="block text-sm font-medium">{fieldLabel(key)}</span>
            <input
              required={REQUIRED_FIELDS.has(key)}
              type={key === "date" ? "date" : "text"}
              value={form[key]}
              onChange={(e) => set(key, e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
        ))}
      </div>

      <label className="block">
        <span className="block text-sm font-medium">Body (Markdown)</span>
        <textarea
          required
          value={form.body}
          onChange={(e) => set("body", e.target.value)}
          rows={18}
          className="mt-1.5 block w-full rounded-lg border border-border px-3 py-2 font-mono text-sm"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="block text-sm font-medium">Tags (comma-separated)</span>
          <input
            value={form.tags}
            onChange={(e) => set("tags", e.target.value)}
            className="mt-1.5 block w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="block text-sm font-medium">Related project slugs (comma-separated)</span>
          <input
            value={form.relatedProjectSlugs}
            onChange={(e) => set("relatedProjectSlugs", e.target.value)}
            className="mt-1.5 block w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="block text-sm font-medium">Hero image</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-1.5 block w-full text-sm"
          />
        </label>
        <label className="block">
          <span className="block text-sm font-medium">Consent</span>
          <select
            value={form.consentClassification}
            onChange={(e) => set("consentClassification", e.target.value)}
            className="mt-1.5 block w-full rounded-lg border border-border px-3 py-2 text-sm"
          >
            <option value="none">No identifiable people</option>
            <option value="pending">Pending review</option>
            <option value="verified">Verified</option>
            <option value="group-consent">Group consent</option>
          </select>
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => set("published", e.target.checked)}
        />{" "}
        Publish this story
      </label>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-900">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="text-sm text-muted-foreground">
          {message}
        </p>
      )}

      <button
        disabled={busy}
        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {busy
          ? "Saving…"
          : isEditing
            ? "Save changes"
            : form.published
              ? "Publish story"
              : "Save draft"}
      </button>
    </form>
  );
}

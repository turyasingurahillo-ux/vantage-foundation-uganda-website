"use client";

import { useState } from "react";
import type { StoryRow } from "@/lib/db/stories";

/**
 * ArticleEditorForm — the edit form for a single article, shown on the
 * /admin/stories/[id]?tab=edit page. Extracted from StoriesManager so the
 * individual article page can reuse the same editing UX.
 */
interface ArticleEditorFormProps {
  csrfToken: string;
  story: StoryRow;
}

const fieldKeys = ["title", "slug", "excerpt", "author", "role", "date", "location", "category", "heroImageAlt", "heroImageCredit", "seoTitle", "seoDescription", "seoOgImage"] as const;

function toForm(item: StoryRow) {
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

export function ArticleEditorForm({ csrfToken, story }: ArticleEditorFormProps) {
  const [form, setForm] = useState(toForm(story));
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));

  const uploadHero = async () => {
    if (!file) return form.heroImageKey || undefined;
    const presign = await fetch("/api/admin/media/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
      body: JSON.stringify({
        filename: file.name, contentType: file.type, contentLength: file.size,
        folder: "stories", slug: form.slug, csrf_token: csrfToken,
      }),
    });
    if (!presign.ok) throw new Error("Could not prepare the hero image upload.");
    const target = await presign.json();
    const put = await fetch(target.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
    if (!put.ok) throw new Error("Hero image upload failed.");
    return target.objectKey as string;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const heroImageKey = await uploadHero();
      const payload = {
        ...form,
        id: story.id,
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
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not save the story.");
      setMessage(form.published ? "Story updated and published." : "Story saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save the story.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5 rounded-xl border border-border bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Edit story or insight</h2>
        <p className="text-sm text-muted-foreground">Use Markdown in the body. Save as a draft or publish immediately.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {fieldKeys.map((key) => (
          <label key={key} className={key === "excerpt" || key === "seoDescription" ? "block sm:col-span-2" : "block"}>
            <span className="block text-sm font-medium">
              {key === "heroImageAlt" ? "Hero image alt text" : key === "heroImageCredit" ? "Hero image credit" : key.replace(/[A-Z]/g, (l) => ` ${l}`).replace(/^./, (l) => l.toUpperCase())}
            </span>
            <input
              required={key === "title" || key === "slug" || key === "excerpt" || key === "date" || key === "category"}
              type={key === "date" ? "date" : "text"}
              value={form[key] as string}
              onChange={(e) => set(key, e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
        ))}
      </div>
      <label className="block">
        <span className="block text-sm font-medium">Body (Markdown)</span>
        <textarea required value={form.body} onChange={(e) => set("body", e.target.value)} rows={18}
          className="mt-1.5 block w-full rounded-lg border border-border px-3 py-2 font-mono text-sm" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="block text-sm font-medium">Tags (comma-separated)</span>
          <input value={form.tags} onChange={(e) => set("tags", e.target.value)} className="mt-1.5 block w-full rounded-lg border border-border px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="block text-sm font-medium">Related project slugs (comma-separated)</span>
          <input value={form.relatedProjectSlugs} onChange={(e) => set("relatedProjectSlugs", e.target.value)} className="mt-1.5 block w-full rounded-lg border border-border px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="block text-sm font-medium">Hero image</span>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="mt-1.5 block w-full text-sm" />
        </label>
        <label className="block">
          <span className="block text-sm font-medium">Consent</span>
          <select value={form.consentClassification} onChange={(e) => set("consentClassification", e.target.value)} className="mt-1.5 block w-full rounded-lg border border-border px-3 py-2 text-sm">
            <option value="none">No identifiable people</option>
            <option value="pending">Pending review</option>
            <option value="verified">Verified</option>
            <option value="group-consent">Group consent</option>
          </select>
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} /> Publish this story
      </label>
      <button disabled={busy} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
        {busy ? "Saving…" : "Save changes"}
      </button>
      {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
    </form>
  );
}

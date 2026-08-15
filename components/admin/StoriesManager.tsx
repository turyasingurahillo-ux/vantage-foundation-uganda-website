"use client";

import { useState } from "react";
import type { StoryRow } from "@/lib/db/stories";
import { AnalyticsDashboard } from "./AnalyticsDashboard";

interface StoriesManagerProps {
  csrfToken: string;
  initialItems: StoryRow[];
}

const emptyForm = {
  slug: "",
  title: "",
  excerpt: "",
  author: "",
  role: "",
  date: new Date().toISOString().slice(0, 10),
  location: "Uganda",
  category: "Research & Learning",
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

type FormState = typeof emptyForm;

function toForm(item: StoryRow): FormState {
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

export function StoriesManager({ csrfToken, initialItems }: StoriesManagerProps) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<"analytics" | "editor">("analytics");

  const set = (key: keyof FormState, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));

  const uploadHero = async () => {
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
    const put = await fetch(target.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
    if (!put.ok) throw new Error("Hero image upload failed.");
    return target.objectKey as string;
  };

  const reset = () => {
    setForm({ ...emptyForm, date: new Date().toISOString().slice(0, 10) });
    setEditingId(null);
    setFile(null);
    setView("analytics");
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const heroImageKey = await uploadHero();
      const payload = {
        ...form,
        heroImageKey,
        tags: form.tags.split(",").map((value) => value.trim()).filter(Boolean),
        relatedProjectSlugs: form.relatedProjectSlugs.split(",").map((value) => value.trim()).filter(Boolean),
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
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify(editingId ? { ...payload, id: editingId } : payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not save the story.");
      setItems((current) => editingId ? current.map((item) => item.id === editingId ? data.item : item) : [data.item, ...current]);
      setMessage(form.published ? "Story published successfully." : "Story saved as a draft.");
      reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save the story.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item: StoryRow) => {
    if (!window.confirm(`Delete “${item.title}”?`)) return;
    setBusy(true);
    try {
      const response = await fetch("/api/admin/stories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify({ id: item.id, csrf_token: csrfToken }),
      });
      if (!response.ok) throw new Error("Could not delete the story.");
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      if (editingId === item.id) reset();
      setMessage("Story deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not delete the story.");
    } finally {
      setBusy(false);
    }
  };

  const editStory = (item: StoryRow) => {
    setForm(toForm(item));
    setEditingId(item.id);
    setView("editor");
  };

  return (
    <div className="mt-8 space-y-6">
      {/* View toggle: Analytics / Editor */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setView("analytics")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${view === "analytics" ? "bg-primary text-white" : "border border-border bg-white hover:bg-slate-50"}`}
        >
          Analytics
        </button>
        <button
          type="button"
          onClick={() => setView("editor")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${view === "editor" ? "bg-primary text-white" : "border border-border bg-white hover:bg-slate-50"}`}
        >
          {editingId ? "Edit story" : "Write new story"}
        </button>
      </div>

      {view === "analytics" && (
        <AnalyticsDashboard
          stories={items}
          onEditStory={editStory}
          onDeleteStory={remove}
        />
      )}

      {view === "editor" && (
        <form onSubmit={submit} className="space-y-5 rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">{editingId ? "Edit story or insight" : "Write a story or insight"}</h2>
              <p className="text-sm text-muted-foreground">Use Markdown in the body. Save as a draft or publish immediately.</p>
            </div>
            {editingId && <button type="button" onClick={reset} className="text-sm font-semibold text-primary">Cancel edit</button>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {(["title", "slug", "excerpt", "author", "role", "date", "location", "category", "heroImageAlt", "heroImageCredit", "seoTitle", "seoDescription", "seoOgImage"] as const).map((key) => (
              <label key={key} className={key === "excerpt" || key === "seoDescription" ? "block sm:col-span-2" : "block"}>
                <span className="block text-sm font-medium">{key === "heroImageAlt" ? "Hero image alt text" : key === "heroImageCredit" ? "Hero image credit" : key.replace(/[A-Z]/g, (letter) => ` ${letter}`).replace(/^./, (letter) => letter.toUpperCase())}</span>
                <input required={key === "title" || key === "slug" || key === "excerpt" || key === "date" || key === "category"} type={key === "date" ? "date" : "text"} value={form[key]} onChange={(event) => set(key, event.target.value)} className="mt-1.5 block w-full rounded-lg border border-border px-3 py-2 text-sm" />
              </label>
            ))}
          </div>
          <label className="block"><span className="block text-sm font-medium">Body (Markdown)</span><textarea required value={form.body} onChange={(event) => set("body", event.target.value)} rows={18} className="mt-1.5 block w-full rounded-lg border border-border px-3 py-2 font-mono text-sm" /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block"><span className="block text-sm font-medium">Tags (comma-separated)</span><input value={form.tags} onChange={(event) => set("tags", event.target.value)} className="mt-1.5 block w-full rounded-lg border border-border px-3 py-2 text-sm" /></label>
            <label className="block"><span className="block text-sm font-medium">Related project slugs (comma-separated)</span><input value={form.relatedProjectSlugs} onChange={(event) => set("relatedProjectSlugs", event.target.value)} className="mt-1.5 block w-full rounded-lg border border-border px-3 py-2 text-sm" /></label>
            <label className="block"><span className="block text-sm font-medium">Hero image</span><input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="mt-1.5 block w-full text-sm" /></label>
            <label className="block"><span className="block text-sm font-medium">Consent</span><select value={form.consentClassification} onChange={(event) => set("consentClassification", event.target.value)} className="mt-1.5 block w-full rounded-lg border border-border px-3 py-2 text-sm"><option value="none">No identifiable people</option><option value="pending">Pending review</option><option value="verified">Verified</option><option value="group-consent">Group consent</option></select></label>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.published} onChange={(event) => set("published", event.target.checked)} /> Publish this story</label>
          <button disabled={busy} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : editingId ? "Save changes" : form.published ? "Publish story" : "Save draft"}</button>
          {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
        </form>
      )}
    </div>
  );
}

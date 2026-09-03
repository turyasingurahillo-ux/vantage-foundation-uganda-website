import "server-only";

import { createPresignedGetUrl } from "@/lib/storage/r2-client";
import { getStories, getStoryBySlug as getDbRowBySlug, type StoryRow } from "@/lib/db/stories";
import { getPublishedStories, getStoryBySlug, getStorySlugs } from "@/content/stories";
import type { Story } from "@/types";

const PUBLIC_URL_TTL_SECONDS = 24 * 60 * 60;

async function toStory(row: StoryRow): Promise<Story> {
  const heroImage = row.heroImageKey
    ? await createPresignedGetUrl({ objectKey: row.heroImageKey, ttlSeconds: PUBLIC_URL_TTL_SECONDS })
    : undefined;
  return {
    id: `db-${row.id}`,
    dbId: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    author: row.author ?? undefined,
    role: row.role ?? undefined,
    date: row.date,
    location: row.location ?? undefined,
    category: row.category,
    body: row.body,
    heroImage,
    heroImageAlt: row.heroImageAlt ?? undefined,
    heroImageCredit: row.heroImageCredit ?? undefined,
    relatedProjectSlugs: row.relatedProjectSlugs,
    tags: row.tags,
    consentClassification: row.consentClassification,
    seo: row.seoTitle || row.seoDescription || row.seoOgImage
      ? {
          title: row.seoTitle ?? undefined,
          description: row.seoDescription ?? undefined,
          ogImage: row.seoOgImage ?? undefined,
        }
      : undefined,
    published: row.published,
  };
}

export async function getPublishedDbStories(): Promise<Story[]> {
  try {
    const rows = await getStories({ published: true });
    return await Promise.all(rows.map(toStory));
  } catch {
    return [];
  }
}

export async function getDbStoryBySlug(slug: string): Promise<Story | null> {
  try {
    const row = await getDbRowBySlug(slug);
    if (!row || !row.published) return null;
    return await toStory(row);
  } catch {
    return null;
  }
}

export async function getDbStorySlugs(): Promise<string[]> {
  try {
    const rows = await getStories({ published: true });
    return rows.map((row) => row.slug);
  } catch {
    return [];
  }
}

export async function getPublishedStoriesWithDb(): Promise<Story[]> {
  const dbStories = await getPublishedDbStories();
  const dbSlugs = new Set(dbStories.map((story) => story.slug));
  return [...dbStories, ...getPublishedStories().filter((story) => !dbSlugs.has(story.slug))]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export async function getStoryWithDb(slug: string): Promise<Story | undefined> {
  return (await getDbStoryBySlug(slug)) ?? getStoryBySlug(slug);
}

export async function getAllStorySlugsWithDb(): Promise<string[]> {
  const dbSlugs = await getDbStorySlugs();
  return [...new Set([...dbSlugs, ...getStorySlugs()])];
}

/**
 * Lightweight published-story reference — just enough metadata for analytics
 * identity resolution without the cost of presigning R2 hero URLs.
 */
export interface PublishedStoryRef {
  slug: string;
  title: string;
  category: string;
  source: "static" | "db";
  dbId?: number;
  publishedDate?: string;
}

/**
 * Canonical published-story resolver used by both the public story page and
 * the analytics ingestion endpoint. Resolves a slug to a published story,
 * checking the database first (published rows only) and falling back to the
 * static manifest. Returns null for unknown, unpublished, or soft-deleted
 * stories so analytics can never track drafts or non-existent content.
 *
 * This is the single source of truth for "is this slug publicly trackable?"
 * — the public page and the analytics endpoint must agree, and this function
 * is the shared contract that ensures they do.
 */
export async function resolvePublishedStoryBySlug(
  slug: string
): Promise<PublishedStoryRef | null> {
  // Try DB first (published rows only).
  try {
    const row = await getDbRowBySlug(slug);
    if (row && row.published) {
      return {
        slug: row.slug,
        title: row.title,
        category: row.category,
        source: "db",
        dbId: row.id,
        publishedDate: row.date,
      };
    }
  } catch {
    // DB not configured or error — fall through to static manifest.
  }
  // Fall back to static manifest. In production, only published stories are
  // trackable (published !== false; default is true when omitted).
  const staticStory = getStoryBySlug(slug);
  if (staticStory && staticStory.published !== false) {
    return {
      slug: staticStory.slug,
      title: staticStory.title,
      category: staticStory.category,
      source: "static",
      publishedDate: staticStory.date,
    };
  }
  return null;
}

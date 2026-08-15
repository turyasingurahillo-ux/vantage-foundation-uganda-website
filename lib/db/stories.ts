import { neon } from "@neondatabase/serverless";

export type StoryConsent = "none" | "verified" | "pending" | "group-consent";

export interface StoryInput {
  slug: string;
  title: string;
  excerpt: string;
  author?: string;
  role?: string;
  date?: string;
  location?: string;
  category: string;
  body: string;
  heroImageKey?: string;
  heroImageAlt?: string;
  heroImageCredit?: string;
  relatedProjectSlugs?: string[];
  tags?: string[];
  consentClassification?: StoryConsent;
  seoTitle?: string;
  seoDescription?: string;
  seoOgImage?: string;
  published?: boolean;
}

export interface StoryRow {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  slug: string;
  title: string;
  excerpt: string;
  author: string | null;
  role: string | null;
  date: string;
  location: string | null;
  category: string;
  body: string;
  heroImageKey: string | null;
  heroImageAlt: string | null;
  heroImageCredit: string | null;
  relatedProjectSlugs: string[];
  tags: string[];
  consentClassification: StoryConsent;
  seoTitle: string | null;
  seoDescription: string | null;
  seoOgImage: string | null;
  published: boolean;
  deletedAt: Date | null;
}

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  return neon(url);
}

export async function createStory(input: StoryInput): Promise<StoryRow> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO stories (
      slug, title, excerpt, author, role, published_date, location, category, body,
      hero_image_key, hero_image_alt, hero_image_credit, related_project_slugs, tags,
      consent_classification, seo_title, seo_description, seo_og_image, published
    ) VALUES (
      ${input.slug}, ${input.title}, ${input.excerpt}, ${input.author ?? null},
      ${input.role ?? null}, ${input.date ?? new Date().toISOString().slice(0, 10)},
      ${input.location ?? null}, ${input.category}, ${input.body},
      ${input.heroImageKey ?? null}, ${input.heroImageAlt ?? null},
      ${input.heroImageCredit ?? null}, ${input.relatedProjectSlugs ?? []}, ${input.tags ?? []},
      ${input.consentClassification ?? "none"}, ${input.seoTitle ?? null},
      ${input.seoDescription ?? null}, ${input.seoOgImage ?? null}, ${input.published ?? false}
    )
    RETURNING *
  `;
  return mapRow(rows[0]);
}

export async function getStories(options?: {
  category?: string;
  published?: boolean;
}): Promise<StoryRow[]> {
  const sql = getSql();
  const category = options?.category;
  const published = options?.published;
  if (published !== undefined && category) {
    const rows = await sql`
      SELECT * FROM stories
      WHERE deleted_at IS NULL AND published = ${published} AND category = ${category}
      ORDER BY published_date DESC
    `;
    return rows.map(mapRow);
  }
  if (published !== undefined) {
    const rows = await sql`
      SELECT * FROM stories
      WHERE deleted_at IS NULL AND published = ${published}
      ORDER BY published_date DESC
    `;
    return rows.map(mapRow);
  }
  if (category) {
    const rows = await sql`
      SELECT * FROM stories
      WHERE deleted_at IS NULL AND category = ${category}
      ORDER BY published_date DESC
    `;
    return rows.map(mapRow);
  }
  const rows = await sql`
    SELECT * FROM stories
    WHERE deleted_at IS NULL
    ORDER BY published_date DESC
  `;
  return rows.map(mapRow);
}

export async function getStoryById(id: number): Promise<StoryRow | null> {
  const sql = getSql();
  const rows = await sql`SELECT * FROM stories WHERE id = ${id} AND deleted_at IS NULL`;
  return rows.length ? mapRow(rows[0]) : null;
}

export async function getStoryBySlug(slug: string): Promise<StoryRow | null> {
  const sql = getSql();
  const rows = await sql`SELECT * FROM stories WHERE slug = ${slug} AND deleted_at IS NULL`;
  return rows.length ? mapRow(rows[0]) : null;
}

export interface StoryUpdate extends Partial<Omit<StoryInput, "slug" | "author" | "role" | "location" | "heroImageKey" | "heroImageAlt" | "heroImageCredit" | "seoTitle" | "seoDescription" | "seoOgImage">> {
  date?: string;
  author?: string | null;
  role?: string | null;
  location?: string | null;
  heroImageKey?: string | null;
  heroImageAlt?: string | null;
  heroImageCredit?: string | null;
  relatedProjectSlugs?: string[];
  tags?: string[];
  consentClassification?: StoryConsent;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoOgImage?: string | null;
  published?: boolean;
}

export async function updateStory(id: number, update: StoryUpdate): Promise<StoryRow | null> {
  const current = await getStoryById(id);
  if (!current) return null;
  const sql = getSql();
  const next = {
    title: update.title ?? current.title,
    excerpt: update.excerpt ?? current.excerpt,
    author: update.author === undefined ? current.author : update.author,
    role: update.role === undefined ? current.role : update.role,
    date: update.date ?? current.date,
    location: update.location === undefined ? current.location : update.location,
    category: update.category ?? current.category,
    body: update.body ?? current.body,
    heroImageKey: update.heroImageKey === undefined ? current.heroImageKey : update.heroImageKey,
    heroImageAlt: update.heroImageAlt === undefined ? current.heroImageAlt : update.heroImageAlt,
    heroImageCredit: update.heroImageCredit === undefined ? current.heroImageCredit : update.heroImageCredit,
    relatedProjectSlugs: update.relatedProjectSlugs ?? current.relatedProjectSlugs,
    tags: update.tags ?? current.tags,
    consentClassification: update.consentClassification ?? current.consentClassification,
    seoTitle: update.seoTitle === undefined ? current.seoTitle : update.seoTitle,
    seoDescription: update.seoDescription === undefined ? current.seoDescription : update.seoDescription,
    seoOgImage: update.seoOgImage === undefined ? current.seoOgImage : update.seoOgImage,
    published: update.published ?? current.published,
  };
  const rows = await sql`
    UPDATE stories SET
      title = ${next.title}, excerpt = ${next.excerpt}, author = ${next.author}, role = ${next.role},
      published_date = ${next.date}, location = ${next.location}, category = ${next.category}, body = ${next.body},
      hero_image_key = ${next.heroImageKey}, hero_image_alt = ${next.heroImageAlt},
      hero_image_credit = ${next.heroImageCredit}, related_project_slugs = ${next.relatedProjectSlugs},
      tags = ${next.tags}, consent_classification = ${next.consentClassification},
      seo_title = ${next.seoTitle}, seo_description = ${next.seoDescription}, seo_og_image = ${next.seoOgImage},
      published = ${next.published}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id} AND deleted_at IS NULL
    RETURNING *
  `;
  return rows.length ? mapRow(rows[0]) : null;
}

export async function softDeleteStory(id: number): Promise<void> {
  const sql = getSql();
  await sql`UPDATE stories SET deleted_at = CURRENT_TIMESTAMP WHERE id = ${id} AND deleted_at IS NULL`;
}

function mapRow(row: Record<string, unknown>): StoryRow {
  return {
    id: row.id as number,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
    slug: row.slug as string,
    title: row.title as string,
    excerpt: row.excerpt as string,
    author: row.author as string | null,
    role: row.role as string | null,
    date: String(row.published_date),
    location: row.location as string | null,
    category: row.category as string,
    body: row.body as string,
    heroImageKey: row.hero_image_key as string | null,
    heroImageAlt: row.hero_image_alt as string | null,
    heroImageCredit: row.hero_image_credit as string | null,
    relatedProjectSlugs: (row.related_project_slugs as string[] | null) ?? [],
    tags: (row.tags as string[] | null) ?? [],
    consentClassification: row.consent_classification as StoryConsent,
    seoTitle: row.seo_title as string | null,
    seoDescription: row.seo_description as string | null,
    seoOgImage: row.seo_og_image as string | null,
    published: row.published as boolean,
    deletedAt: row.deleted_at as Date | null,
  };
}

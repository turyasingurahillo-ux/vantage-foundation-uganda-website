import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifySessionToken, sessionCookieName, BOOTSTRAP_ACTOR_ID } from "@/lib/session";
import { validateCsrfHeader, CSRF_HEADER_NAME } from "@/lib/csrf";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { logError, logInfo, logWarn } from "@/lib/logger";
import { appendAuditLog } from "@/lib/db/audit";
import {
  createStory,
  getStories,
  getStoryById,
  getStoryBySlug,
  softDeleteStory,
  updateStory,
  type StoryConsent,
} from "@/lib/db/stories";
import { deleteR2Object, headR2Object } from "@/lib/storage/r2-client";

const CONSENT_VALUES = ["none", "verified", "pending", "group-consent"] as const;
const storyFields = {
  slug: z.string().min(1).max(150).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1).max(200),
  excerpt: z.string().min(1).max(500),
  author: z.string().max(150).optional(),
  role: z.string().max(150).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  location: z.string().max(150).optional(),
  category: z.string().min(1).max(100),
  body: z.string().min(1),
  heroImageKey: z.string().max(500).optional(),
  heroImageAlt: z.string().max(500).optional(),
  heroImageCredit: z.string().max(500).optional(),
  relatedProjectSlugs: z.array(z.string().max(150)).optional(),
  tags: z.array(z.string().max(100)).optional(),
  consentClassification: z.enum(CONSENT_VALUES).optional().default("none"),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(300).optional(),
  seoOgImage: z.string().max(500).optional(),
  published: z.coerce.boolean().optional().default(false),
};
const createSchema = z.object(storyFields);
const updateSchema = z.object(storyFields).partial().extend({
  id: z.coerce.number().int().positive(),
});

async function guard(request: Request) {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(sessionCookieName)?.value);
  if (!session) {
    logWarn("stories_api_unauthorized", {});
    return { ok: false as const, response: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }
  const ip = getClientIp(request.headers);
  if (!rateLimit({ key: `stories-api:${ip}`, limit: 60, windowMs: 60_000 })) {
    return { ok: false as const, response: NextResponse.json({ error: "rate-limited" }, { status: 429 }) };
  }
  return { ok: true as const, ip, actorId: session.actorId, cookieStore };
}

async function parseBody(request: Request, cookieStore: Awaited<ReturnType<typeof cookies>>) {
  if (!validateCsrfHeader(cookieStore, request.headers.get(CSRF_HEADER_NAME))) {
    return { csrfOk: false, body: null };
  }
  try {
    return { csrfOk: true, body: await request.json() };
  } catch {
    return { csrfOk: true, body: null };
  }
}

export async function GET(request: Request) {
  const guarded = await guard(request);
  if (!guarded.ok) return guarded.response;
  const url = new URL(request.url);
  const publishedParam = url.searchParams.get("published");
  const published = publishedParam === "true" ? true : publishedParam === "false" ? false : undefined;
  try {
    return NextResponse.json({ items: await getStories({ category: url.searchParams.get("category") ?? undefined, published }) });
  } catch (error) {
    logError("stories_list_failed", { error: String(error).slice(0, 200) });
    return NextResponse.json({ error: "db" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const guarded = await guard(request);
  if (!guarded.ok) return guarded.response;
  const { csrfOk, body } = await parseBody(request, guarded.cookieStore);
  if (!csrfOk) return NextResponse.json({ error: "csrf" }, { status: 403 });
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const input = parsed.data;
  if (await getStoryBySlug(input.slug)) return NextResponse.json({ error: "duplicate" }, { status: 409 });
  if (input.heroImageKey && !(await headR2Object(input.heroImageKey))) {
    return NextResponse.json({ error: "object-not-found" }, { status: 404 });
  }
  try {
    const row = await createStory({ ...input, consentClassification: input.consentClassification as StoryConsent });
    await appendAuditLog({
      actorId: guarded.actorId,
      actorKind: guarded.actorId === BOOTSTRAP_ACTOR_ID ? "bootstrap" : "admin",
      action: "story.created",
      resourceType: "story",
      resourceId: row.id,
      after: { slug: row.slug, title: row.title, published: row.published },
      ip: guarded.ip,
    });
    logInfo("story_created", { id: row.id, slug: row.slug });
    return NextResponse.json({ item: row }, { status: 201 });
  } catch (error) {
    logError("story_create_failed", { error: String(error).slice(0, 200) });
    return NextResponse.json({ error: "db" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const guarded = await guard(request);
  if (!guarded.ok) return guarded.response;
  const { csrfOk, body } = await parseBody(request, guarded.cookieStore);
  if (!csrfOk) return NextResponse.json({ error: "csrf" }, { status: 403 });
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const { id, ...update } = parsed.data;
  const before = await getStoryById(id);
  if (!before) return NextResponse.json({ error: "not-found" }, { status: 404 });
  if (update.heroImageKey && update.heroImageKey !== before.heroImageKey && !(await headR2Object(update.heroImageKey))) {
    return NextResponse.json({ error: "object-not-found" }, { status: 404 });
  }
  try {
    const row = await updateStory(id, { ...update, consentClassification: update.consentClassification as StoryConsent | undefined });
    if (!row) return NextResponse.json({ error: "not-found" }, { status: 404 });
    await appendAuditLog({
      actorId: guarded.actorId,
      actorKind: guarded.actorId === BOOTSTRAP_ACTOR_ID ? "bootstrap" : "admin",
      action: "story.updated",
      resourceType: "story",
      resourceId: row.id,
      before: { slug: before.slug, title: before.title, published: before.published },
      after: { slug: row.slug, title: row.title, published: row.published },
      ip: guarded.ip,
    });
    return NextResponse.json({ item: row });
  } catch (error) {
    logError("story_update_failed", { error: String(error).slice(0, 200) });
    return NextResponse.json({ error: "db" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const guarded = await guard(request);
  if (!guarded.ok) return guarded.response;
  const { csrfOk, body } = await parseBody(request, guarded.cookieStore);
  if (!csrfOk) return NextResponse.json({ error: "csrf" }, { status: 403 });
  const parsed = z.object({ id: z.coerce.number().int().positive() }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const row = await getStoryById(parsed.data.id);
  if (!row) return NextResponse.json({ error: "not-found" }, { status: 404 });
  try {
    if (row.heroImageKey) await deleteR2Object(row.heroImageKey);
    await softDeleteStory(row.id);
    await appendAuditLog({
      actorId: guarded.actorId,
      actorKind: guarded.actorId === BOOTSTRAP_ACTOR_ID ? "bootstrap" : "admin",
      action: "story.deleted",
      resourceType: "story",
      resourceId: row.id,
      before: { slug: row.slug, title: row.title, published: row.published },
      ip: guarded.ip,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    logError("story_delete_failed", { error: String(error).slice(0, 200) });
    return NextResponse.json({ error: "db" }, { status: 500 });
  }
}

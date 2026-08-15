import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifySessionToken, sessionCookieName, BOOTSTRAP_ACTOR_ID } from "@/lib/session";
import { validateCsrf, validateCsrfHeader, CSRF_HEADER_NAME } from "@/lib/csrf";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { logWarn, logInfo, logError } from "@/lib/logger";
import { appendAuditLog } from "@/lib/db/audit";
import {
  createMediaObject,
  getMediaObjects,
  getMediaObjectById,
  getMediaObjectByKey,
  updateMediaObject,
  softDeleteMediaObject,
  MediaConsent,
} from "@/lib/db/media";
import {
  headR2Object,
  deleteR2Object,
  getPublicSrc,
  ALLOWED_UPLOAD_TYPES,
  MAX_UPLOAD_BYTES,
} from "@/lib/storage/r2-client";

// ---------------------------------------------------------------------------
// Shared auth + CSRF + rate-limit guard.
// ---------------------------------------------------------------------------

async function guard(request: Request): Promise<{ ok: true; ip: string; actorId: string } | { ok: false; response: NextResponse }> {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(sessionCookieName)?.value);
  if (!session) {
    logWarn("media_api_unauthorized", {});
    return { ok: false, response: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }
  const ip = getClientIp(request.headers);
  if (!rateLimit({ key: `media-api:${ip}`, limit: 60, windowMs: 60_000 })) {
    logWarn("media_api_rate_limited", { ip });
    return { ok: false, response: NextResponse.json({ error: "rate-limited" }, { status: 429 }) };
  }
  return { ok: true, ip, actorId: session.actorId };
}

// ---------------------------------------------------------------------------
// GET /api/admin/media — list media objects (optionally filtered).
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  const guardResult = await guard(request);
  if (!guardResult.ok) return guardResult.response;
  const { ip } = guardResult;

  const url = new URL(request.url);
  const programme = url.searchParams.get("programme") ?? undefined;
  const projectSlug = url.searchParams.get("projectSlug") ?? undefined;
  const publishedParam = url.searchParams.get("published");
  const published = publishedParam === "true" ? true : publishedParam === "false" ? false : undefined;

  try {
    const rows = await getMediaObjects({ programme, projectSlug, published });
    logInfo("media_list_ok", { count: rows.length, ip });
    return NextResponse.json({ items: rows });
  } catch (err) {
    logError("media_list_failed", {
      error: (err instanceof Error ? err.message : String(err)).substring(0, 200),
    });
    return NextResponse.json({ error: "db" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/media — confirm an upload and create the DB record.
//
// Flow: browser receives a presigned PUT URL from /presign, uploads the file
// directly to R2, then calls this endpoint with the objectKey so the server
// can HEAD the object (confirm it landed + get the real size/type) and insert
// the media_objects row.
// ---------------------------------------------------------------------------

const createSchema = z.object({
  objectKey: z.string().min(1).max(500),
  originalFilename: z.string().min(1).max(255),
  contentType: z.string().min(1),
  altText: z.string().max(500).optional().default(""),
  caption: z.string().max(1000).optional(),
  consent: z.enum(["none", "verified", "pending", "group-consent"]).optional().default("pending"),
  consentNotes: z.string().max(1000).optional(),
  programme: z.string().max(100).optional(),
  projectSlug: z.string().max(150).optional(),
  published: z.boolean().optional().default(false),
  csrf_token: z.string().optional(),
});

export async function POST(request: Request) {
  const guardResult = await guard(request);
  if (!guardResult.ok) return guardResult.response;
  const { ip, actorId } = guardResult;

  const cookieStore = await cookies();
  const contentType = request.headers.get("content-type") ?? "";
  let body: unknown;
  if (contentType.includes("application/json")) {
    if (!validateCsrfHeader(cookieStore, request.headers.get(CSRF_HEADER_NAME))) {
      logWarn("media_create_csrf_failed", { ip });
      return NextResponse.json({ error: "csrf" }, { status: 403 });
    }
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "invalid-json" }, { status: 400 });
    }
  } else {
    const formData = await request.formData();
    if (!validateCsrf(cookieStore, formData)) {
      logWarn("media_create_csrf_failed", { ip });
      return NextResponse.json({ error: "csrf" }, { status: 403 });
    }
    body = {
      objectKey: formData.get("objectKey"),
      originalFilename: formData.get("originalFilename"),
      contentType: formData.get("contentType"),
      altText: formData.get("altText") || "",
      caption: formData.get("caption") || undefined,
      consent: formData.get("consent") || "pending",
      consentNotes: formData.get("consentNotes") || undefined,
      programme: formData.get("programme") || undefined,
      projectSlug: formData.get("projectSlug") || undefined,
      published: formData.get("published") === "true",
      csrf_token: formData.get("csrf_token"),
    };
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    logWarn("media_create_validation_failed", {
      issues: parsed.error.issues.length,
    });
    return NextResponse.json(
      { error: "invalid", issues: parsed.error.issues.map((i) => i.message) },
      { status: 400 }
    );
  }

  const input = parsed.data;

  if (!ALLOWED_UPLOAD_TYPES[input.contentType]) {
    return NextResponse.json({ error: "unsupported-type" }, { status: 400 });
  }

  // Reject duplicate inserts for the same object key.
  const existing = await getMediaObjectByKey(input.objectKey);
  if (existing) {
    return NextResponse.json({ error: "duplicate", id: existing.id }, { status: 409 });
  }

  // Confirm the object actually landed in R2 and get its real size/type.
  const head = await headR2Object(input.objectKey);
  if (!head) {
    logWarn("media_create_object_missing", { objectKey: input.objectKey });
    return NextResponse.json({ error: "object-not-found" }, { status: 404 });
  }
  if (head.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "too-large" }, { status: 413 });
  }

  try {
    const row = await createMediaObject({
      objectKey: input.objectKey,
      originalFilename: input.originalFilename,
      contentType: head.contentType,
      byteSize: head.size,
      altText: input.altText,
      caption: input.caption,
      consent: input.consent as MediaConsent,
      consentNotes: input.consentNotes,
      programme: input.programme,
      projectSlug: input.projectSlug,
      published: input.published,
    });
    logInfo("media_created", { id: row.id, objectKey: row.objectKey, ip });
    await appendAuditLog({
      actorId,
      actorKind: actorId === BOOTSTRAP_ACTOR_ID ? "bootstrap" : "admin",
      action: "media.created",
      resourceType: "media",
      resourceId: row.id,
      after: { objectKey: row.objectKey, originalFilename: row.originalFilename, contentType: row.contentType },
      ip,
    });
    return NextResponse.json({ item: row, src: getPublicSrc(row.objectKey) }, { status: 201 });
  } catch (err) {
    logError("media_create_failed", {
      error: (err instanceof Error ? err.message : String(err)).substring(0, 200),
    });
    return NextResponse.json({ error: "db" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/admin/media — update editable fields on a media object.
// ---------------------------------------------------------------------------

const updateSchema = z.object({
  id: z.coerce.number().int().positive(),
  altText: z.string().max(500).optional(),
  caption: z.string().max(1000).nullable().optional(),
  consent: z.enum(["none", "verified", "pending", "group-consent"]).optional(),
  consentNotes: z.string().max(1000).nullable().optional(),
  programme: z.string().max(100).nullable().optional(),
  projectSlug: z.string().max(150).nullable().optional(),
  published: z.boolean().optional(),
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
  csrf_token: z.string().optional(),
});

export async function PATCH(request: Request) {
  const guardResult = await guard(request);
  if (!guardResult.ok) return guardResult.response;
  const { ip, actorId } = guardResult;

  const cookieStore = await cookies();
  const contentType = request.headers.get("content-type") ?? "";
  let body: unknown;
  if (contentType.includes("application/json")) {
    if (!validateCsrfHeader(cookieStore, request.headers.get(CSRF_HEADER_NAME))) {
      logWarn("media_update_csrf_failed", { ip });
      return NextResponse.json({ error: "csrf" }, { status: 403 });
    }
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "invalid-json" }, { status: 400 });
    }
  } else {
    const formData = await request.formData();
    if (!validateCsrf(cookieStore, formData)) {
      logWarn("media_update_csrf_failed", { ip });
      return NextResponse.json({ error: "csrf" }, { status: 403 });
    }
    body = formDataToPatchBody(formData);
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid", issues: parsed.error.issues.map((i) => i.message) },
      { status: 400 }
    );
  }

  const { id, ...update } = parsed.data;
  try {
    const before = await getMediaObjectById(id);
    const row = await updateMediaObject(id, update);
    if (!row) {
      return NextResponse.json({ error: "not-found" }, { status: 404 });
    }
    logInfo("media_updated", { id, ip });
    await appendAuditLog({
      actorId,
      actorKind: actorId === BOOTSTRAP_ACTOR_ID ? "bootstrap" : "admin",
      action: "media.updated",
      resourceType: "media",
      resourceId: id,
      before: before ? { altText: before.altText, published: before.published, consent: before.consent } : null,
      after: { altText: row.altText, published: row.published, consent: row.consent },
      ip,
    });
    return NextResponse.json({ item: row });
  } catch (err) {
    logError("media_update_failed", {
      id,
      error: (err instanceof Error ? err.message : String(err)).substring(0, 200),
    });
    return NextResponse.json({ error: "db" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/admin/media — soft-delete the DB row and delete the R2 object.
// ---------------------------------------------------------------------------

const deleteSchema = z.object({
  id: z.coerce.number().int().positive(),
  csrf_token: z.string().optional(),
});

export async function DELETE(request: Request) {
  const guardResult = await guard(request);
  if (!guardResult.ok) return guardResult.response;
  const { ip, actorId } = guardResult;

  const cookieStore = await cookies();
  const contentType = request.headers.get("content-type") ?? "";
  let body: unknown;
  if (contentType.includes("application/json")) {
    if (!validateCsrfHeader(cookieStore, request.headers.get(CSRF_HEADER_NAME))) {
      logWarn("media_delete_csrf_failed", { ip });
      return NextResponse.json({ error: "csrf" }, { status: 403 });
    }
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "invalid-json" }, { status: 400 });
    }
  } else {
    const formData = await request.formData();
    if (!validateCsrf(cookieStore, formData)) {
      logWarn("media_delete_csrf_failed", { ip });
      return NextResponse.json({ error: "csrf" }, { status: 403 });
    }
    body = {
      id: formData.get("id"),
      csrf_token: formData.get("csrf_token"),
    };
  }

  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid", issues: parsed.error.issues.map((i) => i.message) },
      { status: 400 }
    );
  }

  const { id } = parsed.data;
  const row = await getMediaObjectById(id);
  if (!row) {
    return NextResponse.json({ error: "not-found" }, { status: 404 });
  }

  // Delete the R2 object first; if that fails we still soft-delete the DB
  // row (the bytes become orphaned but the admin can't see the record).
  const deleted = await deleteR2Object(row.objectKey);
  if (!deleted) {
    logWarn("media_delete_r2_failed", { id, objectKey: row.objectKey });
  }
  await softDeleteMediaObject(id);
  logInfo("media_deleted", { id, objectKey: row.objectKey, r2_deleted: deleted, ip });
  await appendAuditLog({
    actorId,
    actorKind: actorId === BOOTSTRAP_ACTOR_ID ? "bootstrap" : "admin",
    action: "media.deleted",
    resourceType: "media",
    resourceId: id,
    before: { objectKey: row.objectKey, originalFilename: row.originalFilename },
    ip,
  });
  return NextResponse.json({ ok: true });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formDataToPatchBody(formData: FormData): Record<string, unknown> {
  const out: Record<string, unknown> = {
    id: formData.get("id"),
    csrf_token: formData.get("csrf_token"),
  };
  const nullableStringFields = ["caption", "consentNotes", "programme", "projectSlug"] as const;
  const optionalStringFields = ["altText"] as const;
  const optionalEnumFields = ["consent"] as const;
  const optionalBoolFields = ["published"] as const;
  const optionalNumberFields = ["width", "height"] as const;

  for (const f of optionalStringFields) {
    const v = formData.get(f);
    if (v !== null) out[f] = v as string;
  }
  for (const f of nullableStringFields) {
    const v = formData.get(f);
    if (v === null) continue; // field not present in the form
    const s = (v as string).trim();
    out[f] = s === "" ? null : s;
  }
  for (const f of optionalEnumFields) {
    const v = formData.get(f);
    if (v !== null && (v as string) !== "") out[f] = v as string;
  }
  for (const f of optionalBoolFields) {
    const v = formData.get(f);
    if (v !== null) out[f] = v === "true" || v === "1";
  }
  for (const f of optionalNumberFields) {
    const v = formData.get(f);
    if (v !== null && (v as string) !== "") {
      const n = Number(v);
      if (!Number.isNaN(n)) out[f] = n;
    }
  }
  return out;
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { validateCsrf, validateCsrfHeader, CSRF_HEADER_NAME } from "@/lib/csrf";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { logWarn, logInfo, logError } from "@/lib/logger";
import {
  createPresignedPutUrl,
  ALLOWED_UPLOAD_TYPES,
  MAX_UPLOAD_BYTES,
} from "@/lib/storage/r2-client";
import { buildObjectKey, MediaFolder } from "@/lib/storage/vantage-objects";

// Allow JSON or form-data for this endpoint. We accept JSON because the
// admin UI will fetch() this route with a JSON body (not a form submit).
const presignSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1),
  contentLength: z.number().int().positive().max(MAX_UPLOAD_BYTES),
  folder: z.enum([
    "programmes",
    "team",
    "gallery",
    "documents",
    "logos",
    "resources",
    "stories",
  ]),
  slug: z.string().max(100).optional(),
  csrf_token: z.string().optional(),
});

export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (!verifySessionToken(cookieStore.get(sessionCookieName)?.value)) {
    logWarn("media_presign_unauthorized", {});
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const ip = getClientIp(request.headers);
  if (!rateLimit({ key: `media-presign:${ip}`, limit: 20, windowMs: 60_000 })) {
    logWarn("media_presign_rate_limited", { ip });
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }

  let body: unknown;
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    if (!validateCsrfHeader(cookieStore, request.headers.get(CSRF_HEADER_NAME))) {
      logWarn("media_presign_csrf_failed", { ip });
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
      logWarn("media_presign_csrf_failed", { ip });
      return NextResponse.json({ error: "csrf" }, { status: 403 });
    }
    body = {
      filename: formData.get("filename"),
      contentType: formData.get("contentType"),
      contentLength: formData.get("contentLength"),
      folder: formData.get("folder"),
      slug: formData.get("slug") || undefined,
      csrf_token: formData.get("csrf_token"),
    };
  }

  const parsed = presignSchema.safeParse(body);
  if (!parsed.success) {
    logWarn("media_presign_validation_failed", {
      issues: parsed.error.issues.length,
    });
    return NextResponse.json(
      { error: "invalid", issues: parsed.error.issues.map((i) => i.message) },
      { status: 400 }
    );
  }

  const { filename, contentType: ct, contentLength, folder, slug } = parsed.data;

  if (!ALLOWED_UPLOAD_TYPES[ct]) {
    logWarn("media_presign_bad_content_type", { contentType: ct });
    return NextResponse.json({ error: "unsupported-type" }, { status: 400 });
  }

  const objectKey = buildObjectKey({
    folder: folder as MediaFolder,
    filename,
    slug,
  });

  try {
    const uploadUrl = await createPresignedPutUrl({
      objectKey,
      contentType: ct,
      contentLength,
    });
    logInfo("media_presign_issued", { folder, objectKey, ip });
    return NextResponse.json({
      uploadUrl,
      objectKey,
      method: "PUT",
      headers: {
        "Content-Type": ct,
      },
    });
  } catch (err) {
    logError("media_presign_failed", {
      error: (err instanceof Error ? err.message : String(err)).substring(0, 200),
    });
    return NextResponse.json({ error: "presign-failed" }, { status: 500 });
  }
}

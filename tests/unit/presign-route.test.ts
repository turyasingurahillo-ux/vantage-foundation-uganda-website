import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

/**
 * Phase 9A regression tests for the media presign endpoint.
 *
 * The presign endpoint issues fresh R2 presigned upload URLs, so it is
 * upload capability. Authorization must use Layer B (active session
 * verification) — not Layer A (cryptographic-only) — so that disabled
 * admins and retired bootstrap sessions cannot retain upload ability
 * until token expiry.
 *
 * For every rejected authorization case, we explicitly assert that
 * `createPresignedPutUrl()` was NOT called — authorization failure must
 * occur before any upload capability is minted.
 */

const mockCookieStore = () => ({
  get: vi.fn().mockReturnValue({ value: "csrf-token" }),
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
  vi.restoreAllMocks();
});

async function setupPresignMocks(opts?: {
  verifyActiveAdminSession?: ReturnType<typeof vi.fn>;
  createPresignedPutUrl?: ReturnType<typeof vi.fn>;
}) {
  const verifyActiveAdminSessionMock =
    opts?.verifyActiveAdminSession ??
    vi.fn(async () => ({ actorId: "1" }));
  const createPresignedPutUrlMock =
    opts?.createPresignedPutUrl ??
    vi.fn(async () => "https://example.r2.cloudflarestorage.com/vantage/test");

  vi.doMock("@/lib/auth", () => ({
    verifyActiveAdminSession: verifyActiveAdminSessionMock,
    guard: vi.fn(),
  }));
  vi.doMock("next/headers", () => ({
    cookies: vi.fn().mockResolvedValue(mockCookieStore()),
  }));
  vi.doMock("@/lib/session", () => ({
    sessionCookieName: "vantage_admin",
    verifySessionToken: vi.fn(),
    BOOTSTRAP_ACTOR_ID: "bootstrap",
  }));
  vi.doMock("@/lib/csrf", () => ({
    validateCsrf: vi.fn().mockReturnValue(true),
    validateCsrfHeader: vi.fn().mockReturnValue(true),
    CSRF_HEADER_NAME: "x-csrf-token",
    getCsrfTokenFromRequest: vi.fn().mockReturnValue("csrf-token"),
  }));
  vi.doMock("@/lib/rate-limit", () => ({
    rateLimit: vi.fn().mockReturnValue(true),
    getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
  }));
  vi.doMock("@/lib/logger", () => ({
    logWarn: vi.fn(),
    logInfo: vi.fn(),
    logError: vi.fn(),
  }));
  vi.doMock("@/lib/storage/r2-client", () => ({
    createPresignedPutUrl: createPresignedPutUrlMock,
    ALLOWED_UPLOAD_TYPES: {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/avif": "avif",
      "image/gif": "gif",
      "application/pdf": "pdf",
    },
    MAX_UPLOAD_BYTES: 10 * 1024 * 1024,
  }));
  vi.doMock("@/lib/storage/vantage-objects", () => ({
    buildObjectKey: vi.fn().mockReturnValue("vantage/test/test-image.jpg"),
    MediaFolder: {},
  }));

  return { verifyActiveAdminSessionMock, createPresignedPutUrlMock };
}

function buildJsonRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/admin/media/presign", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-csrf-token": "csrf-token",
    },
    body: JSON.stringify(body),
  });
}

const validBody = {
  filename: "test.jpg",
  contentType: "image/jpeg",
  contentLength: 1000,
  folder: "gallery",
};

describe("POST /api/admin/media/presign — authorization (Layer B)", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_SECRET", "test-secret");
  });

  it("proceeds to presigning for an active named-admin session", async () => {
    const { createPresignedPutUrlMock } = await setupPresignMocks();

    const { POST } = await import("@/app/api/admin/media/presign/route");
    const response = await POST(buildJsonRequest(validBody));

    expect(response.status).toBe(200);
    expect(createPresignedPutUrlMock).toHaveBeenCalledTimes(1);
  });

  it("rejects a disabled admin with 401 and does NOT call createPresignedPutUrl", async () => {
    const { createPresignedPutUrlMock } = await setupPresignMocks({
      verifyActiveAdminSession: vi.fn(async () => null),
    });

    const { POST } = await import("@/app/api/admin/media/presign/route");
    const response = await POST(buildJsonRequest(validBody));

    expect(response.status).toBe(401);
    expect(createPresignedPutUrlMock).not.toHaveBeenCalled();
  });

  it("rejects a nonexistent admin with 401 and does NOT call createPresignedPutUrl", async () => {
    const { createPresignedPutUrlMock } = await setupPresignMocks({
      verifyActiveAdminSession: vi.fn(async () => null),
    });

    const { POST } = await import("@/app/api/admin/media/presign/route");
    const response = await POST(buildJsonRequest(validBody));

    expect(response.status).toBe(401);
    expect(createPresignedPutUrlMock).not.toHaveBeenCalled();
  });

  it("rejects a retired bootstrap session with 401 and does NOT call createPresignedPutUrl", async () => {
    // verifyActiveAdminSession returns null when bootstrap is no longer valid
    const { createPresignedPutUrlMock } = await setupPresignMocks({
      verifyActiveAdminSession: vi.fn(async () => null),
    });

    const { POST } = await import("@/app/api/admin/media/presign/route");
    const response = await POST(buildJsonRequest(validBody));

    expect(response.status).toBe(401);
    expect(createPresignedPutUrlMock).not.toHaveBeenCalled();
  });

  it("proceeds for a bootstrap session when zero active named admins exist", async () => {
    const { createPresignedPutUrlMock } = await setupPresignMocks({
      verifyActiveAdminSession: vi.fn(async () => ({ actorId: "bootstrap" })),
    });

    const { POST } = await import("@/app/api/admin/media/presign/route");
    const response = await POST(buildJsonRequest(validBody));

    expect(response.status).toBe(200);
    expect(createPresignedPutUrlMock).toHaveBeenCalledTimes(1);
  });

  it("rejects with 401 on authorization DB error (fail closed) and does NOT call createPresignedPutUrl", async () => {
    // verifyActiveAdminSession fails closed — it returns null on DB errors
    const { createPresignedPutUrlMock } = await setupPresignMocks({
      verifyActiveAdminSession: vi.fn(async () => null),
    });

    const { POST } = await import("@/app/api/admin/media/presign/route");
    const response = await POST(buildJsonRequest(validBody));

    expect(response.status).toBe(401);
    expect(createPresignedPutUrlMock).not.toHaveBeenCalled();
  });

  it("rejects an invalid token with 401 and does NOT call createPresignedPutUrl", async () => {
    const { createPresignedPutUrlMock } = await setupPresignMocks({
      verifyActiveAdminSession: vi.fn(async () => null),
    });

    const { POST } = await import("@/app/api/admin/media/presign/route");
    const response = await POST(buildJsonRequest(validBody));

    expect(response.status).toBe(401);
    expect(createPresignedPutUrlMock).not.toHaveBeenCalled();
  });

  it("rejects an expired token with 401 and does NOT call createPresignedPutUrl", async () => {
    const { createPresignedPutUrlMock } = await setupPresignMocks({
      verifyActiveAdminSession: vi.fn(async () => null),
    });

    const { POST } = await import("@/app/api/admin/media/presign/route");
    const response = await POST(buildJsonRequest(validBody));

    expect(response.status).toBe(401);
    expect(createPresignedPutUrlMock).not.toHaveBeenCalled();
  });
});

describe("POST /api/admin/media/presign — existing protections preserved", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_SECRET", "test-secret");
  });

  it("rejects a valid active session with invalid CSRF as 403", async () => {
    const { createPresignedPutUrlMock } = await setupPresignMocks();

    // Override CSRF to fail
    vi.doMock("@/lib/csrf", () => ({
      validateCsrf: vi.fn().mockReturnValue(false),
      validateCsrfHeader: vi.fn().mockReturnValue(false),
      CSRF_HEADER_NAME: "x-csrf-token",
      getCsrfTokenFromRequest: vi.fn().mockReturnValue("csrf-token"),
    }));

    const { POST } = await import("@/app/api/admin/media/presign/route");
    const response = await POST(buildJsonRequest(validBody));

    expect(response.status).toBe(403);
    expect(createPresignedPutUrlMock).not.toHaveBeenCalled();
  });

  it("rejects an unsupported MIME type", async () => {
    const { createPresignedPutUrlMock } = await setupPresignMocks();

    const { POST } = await import("@/app/api/admin/media/presign/route");
    const response = await POST(
      buildJsonRequest({
        ...validBody,
        contentType: "text/html",
      })
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("unsupported-type");
    expect(createPresignedPutUrlMock).not.toHaveBeenCalled();
  });

  it("rejects an excessive file size", async () => {
    const { createPresignedPutUrlMock } = await setupPresignMocks();

    const { POST } = await import("@/app/api/admin/media/presign/route");
    const response = await POST(
      buildJsonRequest({
        ...validBody,
        contentLength: 100 * 1024 * 1024, // 100 MB, exceeds 10 MB limit
      })
    );

    expect(response.status).toBe(400);
    expect(createPresignedPutUrlMock).not.toHaveBeenCalled();
  });

  it("calls createPresignedPutUrl once with the server-generated object key on a valid request", async () => {
    const { createPresignedPutUrlMock } = await setupPresignMocks();

    const { POST } = await import("@/app/api/admin/media/presign/route");
    const response = await POST(buildJsonRequest(validBody));

    expect(response.status).toBe(200);
    expect(createPresignedPutUrlMock).toHaveBeenCalledTimes(1);

    // Verify the response includes the presigned URL and object key
    const body = await response.json();
    expect(body.uploadUrl).toBeDefined();
    expect(body.objectKey).toBeDefined();
    expect(body.method).toBe("PUT");
  });
});

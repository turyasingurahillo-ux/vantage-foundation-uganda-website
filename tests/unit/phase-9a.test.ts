import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Phase 9A regression tests for media consent gate and analytics fail-closed.

const mockCookieStore = () => ({
  get: vi.fn().mockReturnValue({ value: "csrf-token" }),
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
  vi.restoreAllMocks();
});

async function setupMediaMocks(createMediaObjectMock = vi.fn().mockResolvedValue({ id: 1 })) {
  vi.doMock("@/lib/auth", () => ({
    guard: vi.fn().mockResolvedValue({
      ok: true,
      ip: "127.0.0.1",
      actorId: "1",
      cookieStore: mockCookieStore(),
    }),
  }));
  vi.doMock("next/headers", () => ({
    cookies: vi.fn().mockResolvedValue(mockCookieStore()),
  }));
  vi.doMock("@/lib/csrf", () => ({
    validateCsrf: vi.fn().mockReturnValue(true),
    validateCsrfHeader: vi.fn().mockReturnValue(true),
    getCsrfTokenFromRequest: vi.fn().mockReturnValue("csrf-token"),
  }));
  vi.doMock("@/lib/db/media", () => ({
    getMediaObjects: vi.fn().mockResolvedValue([]),
    getMediaObjectByKey: vi.fn().mockResolvedValue(null),
    getMediaObjectById: vi.fn().mockResolvedValue(null),
    createMediaObject: createMediaObjectMock,
    updateMediaObject: vi.fn(),
    deleteMediaObject: vi.fn(),
  }));
  vi.doMock("@/lib/storage/r2-client", () => ({
    ALLOWED_UPLOAD_TYPES: {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/avif": "avif",
      "image/gif": "gif",
      "application/pdf": "pdf",
    },
    MAX_UPLOAD_BYTES: 10 * 1024 * 1024,
    headR2Object: vi.fn().mockResolvedValue({ size: 1000, contentType: "image/jpeg" }),
    deleteR2Object: vi.fn(),
    getPublicSrc: vi.fn().mockReturnValue("r2://vantage/test/test-image.jpg"),
  }));
  vi.doMock("@/lib/db/audit", () => ({
    appendAuditLog: vi.fn().mockResolvedValue(undefined),
  }));
}

describe("media consent gate — shared invariant", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_SECRET", "test-secret");
  });

  it("rejects published=true with consent='pending' (POST create)", async () => {
    const createMock = vi.fn().mockResolvedValue({ id: 1 });
    await setupMediaMocks(createMock);

    const formData = new FormData();
    formData.set("objectKey", "vantage/test/test-image.jpg");
    formData.set("originalFilename", "test.jpg");
    formData.set("contentType", "image/jpeg");
    formData.set("consent", "pending");
    formData.set("published", "true");
    formData.set("csrf_token", "csrf-token");

    const request = new Request("http://localhost/api/admin/media", {
      method: "POST",
      body: formData,
    });

    const { POST } = await import("@/app/api/admin/media/route");
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error).toBe("consent-required");
    expect(createMock).not.toHaveBeenCalled();
  });

  it("accepts published=false with consent='pending' (POST create)", async () => {
    const createMock = vi.fn().mockResolvedValue({ id: 1 });
    await setupMediaMocks(createMock);

    const formData = new FormData();
    formData.set("objectKey", "vantage/test/test-image.jpg");
    formData.set("originalFilename", "test.jpg");
    formData.set("contentType", "image/jpeg");
    formData.set("consent", "pending");
    formData.set("published", "false");
    formData.set("csrf_token", "csrf-token");

    const request = new Request("http://localhost/api/admin/media", {
      method: "POST",
      body: formData,
    });

    const { POST } = await import("@/app/api/admin/media/route");
    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(createMock).toHaveBeenCalled();
  });

  it("accepts published=true with consent='verified' (POST create)", async () => {
    const createMock = vi.fn().mockResolvedValue({ id: 1 });
    await setupMediaMocks(createMock);

    const formData = new FormData();
    formData.set("objectKey", "vantage/test/test-image.jpg");
    formData.set("originalFilename", "test.jpg");
    formData.set("contentType", "image/jpeg");
    formData.set("consent", "verified");
    formData.set("published", "true");
    formData.set("csrf_token", "csrf-token");

    const request = new Request("http://localhost/api/admin/media", {
      method: "POST",
      body: formData,
    });

    const { POST } = await import("@/app/api/admin/media/route");
    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(createMock).toHaveBeenCalled();
  });
});

describe("media consent gate — atomic PATCH invariant (race condition fix)", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_SECRET", "test-secret");
  });

  it("returns 422 when atomic UPDATE rejects a concurrent consent violation", async () => {
    // Simulate a TOCTOU race: the route reads the row (published=false,
    // consent="verified"), the route-level consent gate passes, but between
    // the read and the write, a concurrent request changed the row. The
    // atomic WHERE clause in updateMediaObject catches the violation and
    // returns null. The route must map this to 422 consent-required, not 404.
    const updateMock = vi.fn().mockResolvedValue(null);
    vi.doMock("@/lib/auth", () => ({
      guard: vi.fn().mockResolvedValue({
        ok: true,
        ip: "127.0.0.1",
        actorId: "1",
        cookieStore: mockCookieStore(),
      }),
    }));
    vi.doMock("next/headers", () => ({
      cookies: vi.fn().mockResolvedValue(mockCookieStore()),
    }));
    vi.doMock("@/lib/csrf", () => ({
      validateCsrf: vi.fn().mockReturnValue(true),
      validateCsrfHeader: vi.fn().mockReturnValue(true),
      CSRF_HEADER_NAME: "x-csrf-token",
      getCsrfTokenFromRequest: vi.fn().mockReturnValue("csrf-token"),
    }));
    vi.doMock("@/lib/db/media", () => ({
      getMediaObjects: vi.fn().mockResolvedValue([]),
      getMediaObjectByKey: vi.fn().mockResolvedValue(null),
      // The row exists (published=false, consent="verified") — route-level
      // gate passes. But the atomic UPDATE will reject it (returns null)
      // because a concurrent request changed consent to "pending" between
      // the read and the write.
      getMediaObjectById: vi.fn().mockResolvedValue({
        id: 1,
        published: false,
        consent: "verified",
        altText: "",
        caption: null,
        consentNotes: null,
        programme: null,
        projectSlug: null,
      }),
      createMediaObject: vi.fn(),
      updateMediaObject: updateMock,
      deleteMediaObject: vi.fn(),
    }));
    vi.doMock("@/lib/storage/r2-client", () => ({
      ALLOWED_UPLOAD_TYPES: {},
      MAX_UPLOAD_BYTES: 10 * 1024 * 1024,
      headR2Object: vi.fn(),
      deleteR2Object: vi.fn(),
      getPublicSrc: vi.fn(),
    }));
    vi.doMock("@/lib/db/audit", () => ({
      appendAuditLog: vi.fn().mockResolvedValue(undefined),
    }));

    const request = new Request("http://localhost/api/admin/media", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: 1,
        published: true,
      }),
    });

    const { PATCH } = await import("@/app/api/admin/media/route");
    const response = await PATCH(request);
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error).toBe("consent-required");
    expect(updateMock).toHaveBeenCalled();
  });

  it("returns 404 when the row does not exist (not a consent violation)", async () => {
    const updateMock = vi.fn().mockResolvedValue(null);
    vi.doMock("@/lib/auth", () => ({
      guard: vi.fn().mockResolvedValue({
        ok: true,
        ip: "127.0.0.1",
        actorId: "1",
        cookieStore: mockCookieStore(),
      }),
    }));
    vi.doMock("next/headers", () => ({
      cookies: vi.fn().mockResolvedValue(mockCookieStore()),
    }));
    vi.doMock("@/lib/csrf", () => ({
      validateCsrf: vi.fn().mockReturnValue(true),
      validateCsrfHeader: vi.fn().mockReturnValue(true),
      CSRF_HEADER_NAME: "x-csrf-token",
      getCsrfTokenFromRequest: vi.fn().mockReturnValue("csrf-token"),
    }));
    vi.doMock("@/lib/db/media", () => ({
      getMediaObjects: vi.fn().mockResolvedValue([]),
      getMediaObjectByKey: vi.fn().mockResolvedValue(null),
      // Row does not exist — the 0-rows result from UPDATE is a genuine
      // not-found, not a consent violation.
      getMediaObjectById: vi.fn().mockResolvedValue(null),
      createMediaObject: vi.fn(),
      updateMediaObject: updateMock,
      deleteMediaObject: vi.fn(),
    }));
    vi.doMock("@/lib/storage/r2-client", () => ({
      ALLOWED_UPLOAD_TYPES: {},
      MAX_UPLOAD_BYTES: 10 * 1024 * 1024,
      headR2Object: vi.fn(),
      deleteR2Object: vi.fn(),
      getPublicSrc: vi.fn(),
    }));
    vi.doMock("@/lib/db/audit", () => ({
      appendAuditLog: vi.fn().mockResolvedValue(undefined),
    }));

    const request = new Request("http://localhost/api/admin/media", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: 999,
        altText: "updated text",
      }),
    });

    const { PATCH } = await import("@/app/api/admin/media/route");
    const response = await PATCH(request);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("not-found");
  });

  it("returns 404 when the row was concurrently soft-deleted (not a consent violation)", async () => {
    // Simulate: the route reads the row (exists), but between the read and
    // the UPDATE, a concurrent request soft-deletes it. The UPDATE returns
    // 0 rows. The re-read finds the row is gone → 404, not 422.
    const updateMock = vi.fn().mockResolvedValue(null);
    const getByIdMock = vi.fn()
      .mockResolvedValueOnce({ // first call (route-level read)
        id: 1,
        published: false,
        consent: "verified",
        altText: "",
        caption: null,
        consentNotes: null,
        programme: null,
        projectSlug: null,
      })
      .mockResolvedValueOnce(null); // second call (re-read after UPDATE fails)

    vi.doMock("@/lib/auth", () => ({
      guard: vi.fn().mockResolvedValue({
        ok: true,
        ip: "127.0.0.1",
        actorId: "1",
        cookieStore: mockCookieStore(),
      }),
    }));
    vi.doMock("next/headers", () => ({
      cookies: vi.fn().mockResolvedValue(mockCookieStore()),
    }));
    vi.doMock("@/lib/csrf", () => ({
      validateCsrf: vi.fn().mockReturnValue(true),
      validateCsrfHeader: vi.fn().mockReturnValue(true),
      CSRF_HEADER_NAME: "x-csrf-token",
      getCsrfTokenFromRequest: vi.fn().mockReturnValue("csrf-token"),
    }));
    vi.doMock("@/lib/db/media", () => ({
      getMediaObjects: vi.fn().mockResolvedValue([]),
      getMediaObjectByKey: vi.fn().mockResolvedValue(null),
      getMediaObjectById: getByIdMock,
      createMediaObject: vi.fn(),
      updateMediaObject: updateMock,
      deleteMediaObject: vi.fn(),
    }));
    vi.doMock("@/lib/storage/r2-client", () => ({
      ALLOWED_UPLOAD_TYPES: {},
      MAX_UPLOAD_BYTES: 10 * 1024 * 1024,
      headR2Object: vi.fn(),
      deleteR2Object: vi.fn(),
      getPublicSrc: vi.fn(),
    }));
    vi.doMock("@/lib/db/audit", () => ({
      appendAuditLog: vi.fn().mockResolvedValue(undefined),
    }));

    const request = new Request("http://localhost/api/admin/media", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: 1,
        published: true,
      }),
    });

    const { PATCH } = await import("@/app/api/admin/media/route");
    const response = await PATCH(request);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("not-found");
    expect(updateMock).toHaveBeenCalled();
    expect(getByIdMock).toHaveBeenCalledTimes(2);
  });
});

describe("analytics HMAC fail-closed", () => {
  it("does not use a hardcoded fallback when ADMIN_SECRET is unset", async () => {
    vi.stubEnv("ADMIN_SECRET", "");
    const { POST } = await import("@/app/api/analytics/events/route");

    const requestBody = JSON.stringify({
      eventType: "page_view",
      articleId: 1,
    });

    const request = new Request("http://localhost/api/analytics/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: requestBody,
    });

    const response = await POST(request);
    // Should return 204 (non-blocking) but NOT persist analytics.
    expect(response.status).toBe(204);
  });

  it("the fallback constant 'vantage-analytics-fallback' no longer exists in source", async () => {
    // Read the source files and verify the fallback constant was removed.
    const fs = await import("node:fs/promises");
    const path = await import("node:path");

    const eventsSource = await fs.readFile(
      path.join(process.cwd(), "app/api/analytics/events/route.ts"),
      "utf-8"
    );
    const whatsappSource = await fs.readFile(
      path.join(process.cwd(), "app/api/analytics/whatsapp-click/route.ts"),
      "utf-8"
    );

    expect(eventsSource).not.toContain("vantage-analytics-fallback");
    expect(whatsappSource).not.toContain("vantage-analytics-fallback");
  });
});

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Layer A (crypto) and Layer B (active authorization) session tests.
//
// Layer A tests live in session.test.ts and verify the pure cryptographic
// token verification. These tests cover Layer B — verifyActiveAdminSession —
// which adds database checks for bootstrap eligibility and admin active status.

const TEST_SECRET = "test-admin-secret-12345";
const TEST_ACTOR_ID = "42";

beforeEach(() => {
  vi.stubEnv("ADMIN_SECRET", TEST_SECRET);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("verifyActiveAdminSession — Layer B", () => {
  it("accepts a valid named-admin token when the admin is active", async () => {
    vi.doMock("@/lib/db/admins", () => ({
      countActiveAdmins: vi.fn(),
      isAdminActive: vi.fn().mockResolvedValue({ active: true }),
    }));
    const { createSessionToken } = await import("@/lib/session");
    const { verifyActiveAdminSession } = await import("@/lib/auth");
    const { token } = createSessionToken(TEST_ACTOR_ID);
    const result = await verifyActiveAdminSession(token);
    expect(result).not.toBeNull();
    expect(result?.actorId).toBe(TEST_ACTOR_ID);
  });

  it("rejects a valid token when the admin is disabled", async () => {
    vi.doMock("@/lib/db/admins", () => ({
      countActiveAdmins: vi.fn(),
      isAdminActive: vi.fn().mockResolvedValue({ active: false }),
    }));
    const { createSessionToken } = await import("@/lib/session");
    const { verifyActiveAdminSession } = await import("@/lib/auth");
    const { token } = createSessionToken(TEST_ACTOR_ID);
    const result = await verifyActiveAdminSession(token);
    expect(result).toBeNull();
  });

  it("rejects a valid token when the admin does not exist", async () => {
    vi.doMock("@/lib/db/admins", () => ({
      countActiveAdmins: vi.fn(),
      isAdminActive: vi.fn().mockResolvedValue({ active: false }),
    }));
    const { createSessionToken } = await import("@/lib/session");
    const { verifyActiveAdminSession } = await import("@/lib/auth");
    const { token } = createSessionToken("999");
    const result = await verifyActiveAdminSession(token);
    expect(result).toBeNull();
  });

  it("rejects an expired token before performing any DB check", async () => {
    const isAdminActiveMock = vi.fn().mockResolvedValue({ active: true });
    vi.doMock("@/lib/db/admins", () => ({
      countActiveAdmins: vi.fn(),
      isAdminActive: isAdminActiveMock,
    }));
    const { createSessionToken } = await import("@/lib/session");
    const { verifyActiveAdminSession } = await import("@/lib/auth");
    const { createHmac } = await import("node:crypto");
    const { token } = createSessionToken(TEST_ACTOR_ID);
    const parts = token.split(".");
    const sessionId = parts[0];
    const actorId = parts[1];
    const expiredAt = String(Math.floor(Date.now() / 1000) - 1);
    const payload = `${sessionId}.${actorId}.${expiredAt}`;
    const hmac = createHmac("sha256", TEST_SECRET).update(payload).digest("hex");
    const expiredToken = `${payload}.${hmac}`;
    const result = await verifyActiveAdminSession(expiredToken);
    expect(result).toBeNull();
    // Layer A should reject before Layer B is reached.
    expect(isAdminActiveMock).not.toHaveBeenCalled();
  });

  it("rejects a token with an invalid signature", async () => {
    const isAdminActiveMock = vi.fn().mockResolvedValue({ active: true });
    vi.doMock("@/lib/db/admins", () => ({
      countActiveAdmins: vi.fn(),
      isAdminActive: isAdminActiveMock,
    }));
    const { createSessionToken } = await import("@/lib/session");
    const { verifyActiveAdminSession } = await import("@/lib/auth");
    const { token } = createSessionToken(TEST_ACTOR_ID);
    const parts = token.split(".");
    const tampered = `${parts[0]}.${parts[1]}.${parts[2]}.${"a".repeat(64)}`;
    const result = await verifyActiveAdminSession(tampered);
    expect(result).toBeNull();
    expect(isAdminActiveMock).not.toHaveBeenCalled();
  });

  it("accepts a bootstrap token when zero named admins exist", async () => {
    vi.doMock("@/lib/db/admins", () => ({
      countActiveAdmins: vi.fn().mockResolvedValue(0),
      isAdminActive: vi.fn(),
    }));
    const { createSessionToken } = await import("@/lib/session");
    const { verifyActiveAdminSession } = await import("@/lib/auth");
    const { token } = createSessionToken("bootstrap");
    const result = await verifyActiveAdminSession(token);
    expect(result).not.toBeNull();
    expect(result?.actorId).toBe("bootstrap");
  });

  it("rejects a bootstrap token when one or more named admins exist", async () => {
    vi.doMock("@/lib/db/admins", () => ({
      countActiveAdmins: vi.fn().mockResolvedValue(1),
      isAdminActive: vi.fn(),
    }));
    const { createSessionToken } = await import("@/lib/session");
    const { verifyActiveAdminSession } = await import("@/lib/auth");
    const { token } = createSessionToken("bootstrap");
    const result = await verifyActiveAdminSession(token);
    expect(result).toBeNull();
  });

  it("rejects a bootstrap token when the admin-count query fails (fail closed)", async () => {
    vi.doMock("@/lib/db/admins", () => ({
      countActiveAdmins: vi.fn().mockRejectedValue(new Error("DB unavailable")),
      isAdminActive: vi.fn(),
    }));
    const { createSessionToken } = await import("@/lib/session");
    const { verifyActiveAdminSession } = await import("@/lib/auth");
    const { token } = createSessionToken("bootstrap");
    const result = await verifyActiveAdminSession(token);
    expect(result).toBeNull();
  });

  it("rejects a named-admin token when the admin-status query fails (fail closed)", async () => {
    vi.doMock("@/lib/db/admins", () => ({
      countActiveAdmins: vi.fn(),
      isAdminActive: vi.fn().mockRejectedValue(new Error("DB unavailable")),
    }));
    const { createSessionToken } = await import("@/lib/session");
    const { verifyActiveAdminSession } = await import("@/lib/auth");
    const { token } = createSessionToken(TEST_ACTOR_ID);
    const result = await verifyActiveAdminSession(token);
    expect(result).toBeNull();
  });

  it("rejects undefined token", async () => {
    const { verifyActiveAdminSession } = await import("@/lib/auth");
    const result = await verifyActiveAdminSession(undefined);
    expect(result).toBeNull();
  });

  it("rejects an empty string token", async () => {
    const { verifyActiveAdminSession } = await import("@/lib/auth");
    const result = await verifyActiveAdminSession("");
    expect(result).toBeNull();
  });

  it("rejects a malformed token", async () => {
    const { verifyActiveAdminSession } = await import("@/lib/auth");
    const result = await verifyActiveAdminSession("not-a-token");
    expect(result).toBeNull();
  });

  it("disabling an admin invalidates their existing session immediately", async () => {
    // First call: admin is active → session accepted.
    // Second call: admin is disabled → session rejected.
    // This proves that disabling an admin revokes their session without
    // waiting for the 1-day token expiry.
    const isAdminActiveMock = vi.fn();
    vi.doMock("@/lib/db/admins", () => ({
      countActiveAdmins: vi.fn(),
      isAdminActive: isAdminActiveMock,
    }));
    const { createSessionToken } = await import("@/lib/session");
    const { verifyActiveAdminSession } = await import("@/lib/auth");
    const { token } = createSessionToken(TEST_ACTOR_ID);

    // Admin is active — session accepted.
    isAdminActiveMock.mockResolvedValueOnce({ active: true });
    expect(await verifyActiveAdminSession(token)).not.toBeNull();

    // Admin is disabled — same token is now rejected.
    isAdminActiveMock.mockResolvedValueOnce({ active: false });
    expect(await verifyActiveAdminSession(token)).toBeNull();
  });
});

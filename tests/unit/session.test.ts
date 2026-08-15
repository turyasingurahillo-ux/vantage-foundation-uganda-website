import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Stub process.env.ADMIN_SECRET for tests
const TEST_SECRET = "test-admin-secret-12345";
const TEST_ACTOR_ID = "42";

beforeEach(() => {
  vi.stubEnv("ADMIN_SECRET", TEST_SECRET);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("session tokens", () => {
  it("createSessionToken returns a token with four parts (sessionId.actorId.expiresAt.hmac)", async () => {
    const { createSessionToken } = await import("@/lib/session");
    const { token } = createSessionToken(TEST_ACTOR_ID);
    const parts = token.split(".");
    expect(parts.length).toBe(4);
    expect(parts[0]).toMatch(/^[a-f0-9]{64}$/); // sessionId
    expect(parts[1]).toBe(TEST_ACTOR_ID); // actorId
    expect(parts[2]).toMatch(/^\d+$/); // expiresAt
    expect(parts[3]).toMatch(/^[a-f0-9]{64}$/); // hmac
  });

  it("createSessionToken accepts 'bootstrap' as an actorId", async () => {
    const { createSessionToken } = await import("@/lib/session");
    const { token } = createSessionToken("bootstrap");
    const parts = token.split(".");
    expect(parts[1]).toBe("bootstrap");
  });

  it("verifySessionToken accepts a valid token and returns the actorId", async () => {
    const { createSessionToken, verifySessionToken } = await import("@/lib/session");
    const { token } = createSessionToken(TEST_ACTOR_ID);
    const result = verifySessionToken(token);
    expect(result).not.toBeNull();
    expect(result?.actorId).toBe(TEST_ACTOR_ID);
  });

  it("verifySessionToken rejects undefined", async () => {
    const { verifySessionToken } = await import("@/lib/session");
    expect(verifySessionToken(undefined)).toBeNull();
  });

  it("verifySessionToken rejects an empty string", async () => {
    const { verifySessionToken } = await import("@/lib/session");
    expect(verifySessionToken("")).toBeNull();
  });

  it("verifySessionToken rejects a malformed token", async () => {
    const { verifySessionToken } = await import("@/lib/session");
    expect(verifySessionToken("not-a-token")).toBeNull();
  });

  it("verifySessionToken rejects a token with wrong signature", async () => {
    const { createSessionToken, verifySessionToken } = await import("@/lib/session");
    const { token } = createSessionToken(TEST_ACTOR_ID);
    // Tamper with the signature part (fourth part)
    const parts = token.split(".");
    const tampered = `${parts[0]}.${parts[1]}.${parts[2]}.${"a".repeat(64)}`;
    expect(verifySessionToken(tampered)).toBeNull();
  });

  it("verifySessionToken rejects a token with a tampered actorId", async () => {
    const { createSessionToken, verifySessionToken } = await import("@/lib/session");
    const { token } = createSessionToken(TEST_ACTOR_ID);
    // Replace the actorId with a different one — the HMAC will no longer match.
    const parts = token.split(".");
    const tampered = `${parts[0]}.99.${parts[2]}.${parts[3]}`;
    expect(verifySessionToken(tampered)).toBeNull();
  });

  it("verifySessionToken rejects an expired token", async () => {
    const { createSessionToken, verifySessionToken } = await import("@/lib/session");
    const { token } = createSessionToken(TEST_ACTOR_ID);
    // Replace the expiresAt with a timestamp in the past, keeping the
    // original sessionId and actorId and re-signing so the HMAC matches.
    const { createHmac } = await import("node:crypto");
    const parts = token.split(".");
    const sessionId = parts[0];
    const actorId = parts[1];
    const expiredAt = String(Math.floor(Date.now() / 1000) - 1);
    const payload = `${sessionId}.${actorId}.${expiredAt}`;
    const hmac = createHmac("sha256", TEST_SECRET).update(payload).digest("hex");
    const expiredToken = `${payload}.${hmac}`;
    expect(verifySessionToken(expiredToken)).toBeNull();
  });

  it("verifySessionToken rejects a token signed with a different secret", async () => {
    const { createSessionToken, verifySessionToken } = await import("@/lib/session");
    const { token } = createSessionToken(TEST_ACTOR_ID);
    // Change the secret and verify — should fail
    vi.stubEnv("ADMIN_SECRET", "different-secret");
    expect(verifySessionToken(token)).toBeNull();
  });

  it("sessionCookieName is vantage_admin", async () => {
    const { sessionCookieName } = await import("@/lib/session");
    expect(sessionCookieName).toBe("vantage_admin");
  });

  it("sessionMaxAge is 1 day in seconds", async () => {
    const { sessionMaxAge } = await import("@/lib/session");
    expect(sessionMaxAge).toBe(60 * 60 * 24);
  });

  it("BOOTSTRAP_ACTOR_ID is 'bootstrap'", async () => {
    const { BOOTSTRAP_ACTOR_ID } = await import("@/lib/session");
    expect(BOOTSTRAP_ACTOR_ID).toBe("bootstrap");
  });
});

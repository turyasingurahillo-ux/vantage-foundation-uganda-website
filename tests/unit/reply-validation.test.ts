import { describe, it, expect } from "vitest";

/**
 * Regression tests for the admin reply form validation helper.
 *
 * The production bug: a disabled textarea was omitted from FormData, so the
 * server received `null` for `body` and Zod's default "Expected string,
 * received null" message leaked into the redirect URL. These tests pin the
 * contract that every malformed input maps onto a fixed application error
 * code — never raw validation-library text.
 */
import { parseReplyForm } from "@/lib/reply-validation";
import { REPLY_MAX_LENGTH } from "@/lib/contact-reply";

const VALID = {
  id: "27",
  body: "Thanks for getting in touch.",
  idempotencyKey: "27-1700000000000-abc123def",
} as const;

describe("parseReplyForm — valid input", () => {
  it("accepts a normal reply and returns the trimmed body", () => {
    const result = parseReplyForm({
      ...VALID,
      body: "  Hello there  ",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.id).toBe(27);
      expect(result.data.body).toBe("Hello there");
      expect(result.data.idempotencyKey).toBe(VALID.idempotencyKey);
    }
  });
});

describe("parseReplyForm — empty body", () => {
  it("rejects a whitespace-only body with the `empty` code", () => {
    const result = parseReplyForm({ ...VALID, body: "   \n  " });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("empty");
  });

  it("rejects an empty string with the `empty` code", () => {
    const result = parseReplyForm({ ...VALID, body: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("empty");
  });
});

describe("parseReplyForm — over-limit body", () => {
  it("rejects a body longer than REPLY_MAX_LENGTH with the `too-long` code", () => {
    const result = parseReplyForm({
      ...VALID,
      body: "x".repeat(REPLY_MAX_LENGTH + 1),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("too-long");
  });

  it("accepts a body exactly at REPLY_MAX_LENGTH", () => {
    const result = parseReplyForm({
      ...VALID,
      body: "x".repeat(REPLY_MAX_LENGTH),
    });
    expect(result.ok).toBe(true);
  });
});

describe("parseReplyForm — missing / non-string body (production bug)", () => {
  it("rejects a null body with the `invalid` code, never raw Zod text", () => {
    const result = parseReplyForm({ ...VALID, body: null });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("invalid");
      // The raw Zod message must never surface here.
      expect(result.code).not.toContain("Expected string");
      expect(result.code).not.toContain("received null");
    }
  });

  it("rejects an undefined body with the `invalid` code", () => {
    const result = parseReplyForm({
      id: VALID.id,
      body: undefined as unknown as null,
      idempotencyKey: VALID.idempotencyKey,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("invalid");
  });

  it("rejects a non-string body (number) with the `invalid` code", () => {
    const result = parseReplyForm({
      ...VALID,
      body: 12345 as unknown as string,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("invalid");
  });
});

describe("parseReplyForm — malformed id / idempotency key", () => {
  it("rejects a non-numeric id with the `invalid` code", () => {
    const result = parseReplyForm({ ...VALID, id: "not-a-number" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("invalid");
  });

  it("rejects a missing id with the `invalid` code", () => {
    const result = parseReplyForm({ ...VALID, id: null });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("invalid");
  });

  it("rejects a too-short idempotency key with the `invalid` code", () => {
    const result = parseReplyForm({ ...VALID, idempotencyKey: "short" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("invalid");
  });

  it("rejects a missing idempotency key with the `invalid` code", () => {
    const result = parseReplyForm({ ...VALID, idempotencyKey: null });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("invalid");
  });
});

describe("parseReplyForm — error codes are a fixed, safe set", () => {
  // Sweep the kinds of malformed input a hostile or buggy client can produce
  // and assert the resulting code is always one of the three public codes,
  // never a raw Zod diagnostic string.
  const cases: Array<{ name: string; input: Parameters<typeof parseReplyForm>[0] }> = [
    { name: "null body", input: { ...VALID, body: null } },
    { name: "empty body", input: { ...VALID, body: "" } },
    { name: "whitespace body", input: { ...VALID, body: "  \n\t " } },
    { name: "oversize body", input: { ...VALID, body: "x".repeat(REPLY_MAX_LENGTH + 5) } },
    { name: "non-numeric id", input: { ...VALID, id: "abc" } },
    { name: "null id", input: { ...VALID, id: null } },
    { name: "short idempotency", input: { ...VALID, idempotencyKey: "x" } },
    { name: "null idempotency", input: { ...VALID, idempotencyKey: null } },
  ];

  for (const { name, input } of cases) {
    it(`returns a controlled code for ${name}`, () => {
      const result = parseReplyForm(input);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(["empty", "too-long", "invalid"]).toContain(result.code);
        expect(result.code).not.toMatch(/expected|received|zod/i);
      }
    });
  }
});

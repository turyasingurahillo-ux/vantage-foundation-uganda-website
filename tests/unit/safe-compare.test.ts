import { describe, it, expect } from "vitest";
import { safeSecretEqual, parseBearerToken } from "@/lib/safe-compare";

describe("safeSecretEqual", () => {
  it("returns true for exact match", () => {
    expect(safeSecretEqual("my-secret-token", "my-secret-token")).toBe(true);
  });

  it("returns false for incorrect same-length secret", () => {
    expect(safeSecretEqual("my-secret-token", "my-secret-tokem")).toBe(false);
    expect(safeSecretEqual("abc123", "abc124")).toBe(false);
  });

  it("returns false for incorrect shorter secret", () => {
    expect(safeSecretEqual("short", "my-secret-token")).toBe(false);
  });

  it("returns false for incorrect longer secret", () => {
    expect(safeSecretEqual("my-secret-token-with-extra", "my-secret-token")).toBe(false);
  });

  it("returns false for empty provided", () => {
    expect(safeSecretEqual("", "my-secret-token")).toBe(false);
  });

  it("returns false for empty expected", () => {
    expect(safeSecretEqual("my-secret-token", "")).toBe(false);
  });

  it("returns false for both empty", () => {
    expect(safeSecretEqual("", "")).toBe(false);
  });

  it("handles unicode characters correctly", () => {
    expect(safeSecretEqual("tökën", "tökën")).toBe(true);
    expect(safeSecretEqual("tökën", "token")).toBe(false);
  });
});

describe("parseBearerToken", () => {
  it("extracts token from valid Bearer header", () => {
    expect(parseBearerToken("Bearer my-secret-token")).toBe("my-secret-token");
  });

  it("extracts token with extra whitespace", () => {
    expect(parseBearerToken("Bearer   my-secret-token")).toBe("my-secret-token");
  });

  it("is case-insensitive for Bearer scheme", () => {
    expect(parseBearerToken("bearer my-secret-token")).toBe("my-secret-token");
    expect(parseBearerToken("BEARER my-secret-token")).toBe("my-secret-token");
  });

  it("returns null for missing header", () => {
    expect(parseBearerToken(null)).toBeNull();
  });

  it("returns null for empty header", () => {
    expect(parseBearerToken("")).toBeNull();
  });

  it("returns null for non-Bearer scheme", () => {
    expect(parseBearerToken("Basic dXNlcjpwYXNz")).toBeNull();
  });

  it("returns null for Bearer with no token", () => {
    expect(parseBearerToken("Bearer ")).toBeNull();
    expect(parseBearerToken("Bearer")).toBeNull();
  });
});

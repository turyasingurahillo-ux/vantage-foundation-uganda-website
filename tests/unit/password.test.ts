import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/password";

describe("password hashing", () => {
  it("hashes a password and verifies it", () => {
    const hash = hashPassword("my-secret-password-123");
    expect(hash).toMatch(/^scrypt:\d+:\d+:\d+:[a-f0-9]+:[a-f0-9]+$/);
    expect(verifyPassword("my-secret-password-123", hash)).toBe(true);
  });

  it("rejects a wrong password", () => {
    const hash = hashPassword("correct-password-123");
    expect(verifyPassword("wrong-password-123", hash)).toBe(false);
  });

  it("rejects an empty password", () => {
    const hash = hashPassword("some-password-123");
    expect(verifyPassword("", hash)).toBe(false);
  });

  it("produces different hashes for the same password (random salt)", () => {
    const hash1 = hashPassword("same-password-123");
    const hash2 = hashPassword("same-password-123");
    expect(hash1).not.toBe(hash2);
    // Both should verify the same password.
    expect(verifyPassword("same-password-123", hash1)).toBe(true);
    expect(verifyPassword("same-password-123", hash2)).toBe(true);
  });

  it("rejects a malformed hash", () => {
    expect(verifyPassword("anything", "not-a-hash")).toBe(false);
  });

  it("rejects a hash with wrong algorithm prefix", () => {
    expect(verifyPassword("anything", "bcrypt:16384:8:1:abcd:efgh")).toBe(false);
  });

  it("rejects a hash with non-numeric parameters", () => {
    const hash = "scrypt:abc:8:1:abcd:efgh";
    expect(verifyPassword("anything", hash)).toBe(false);
  });

  it("handles long passwords", () => {
    const longPassword = "a".repeat(200);
    const hash = hashPassword(longPassword);
    expect(verifyPassword(longPassword, hash)).toBe(true);
    expect(verifyPassword("a".repeat(199), hash)).toBe(false);
  });

  it("handles unicode passwords", () => {
    const unicode = "pässwörd-123-🔑";
    const hash = hashPassword(unicode);
    expect(verifyPassword(unicode, hash)).toBe(true);
    expect(verifyPassword("passwörd-123-🔑", hash)).toBe(false);
  });
});

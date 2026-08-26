import { describe, it, expect } from "vitest";
import { hashInboundEmail } from "@/lib/db/inbound-email";

/**
 * Tests for inbound email replay protection.
 *
 * The hash function must:
 *   - Be deterministic (same input → same hash)
 *   - Differ when any component changes (Message-ID, sender, date)
 *   - Be truncated to 32 hex chars
 */
describe("Inbound email hashing", () => {
  it("produces a deterministic hash for the same input", () => {
    const hash1 = hashInboundEmail(
      "msg-123@example.com",
      "sender@example.com",
      "2024-01-15T10:00:00Z",
    );
    const hash2 = hashInboundEmail(
      "msg-123@example.com",
      "sender@example.com",
      "2024-01-15T10:00:00Z",
    );
    expect(hash1).toBe(hash2);
  });

  it("produces different hashes when Message-ID differs", () => {
    const hash1 = hashInboundEmail(
      "msg-123@example.com",
      "sender@example.com",
      "2024-01-15T10:00:00Z",
    );
    const hash2 = hashInboundEmail(
      "msg-456@example.com",
      "sender@example.com",
      "2024-01-15T10:00:00Z",
    );
    expect(hash1).not.toBe(hash2);
  });

  it("produces different hashes when sender differs", () => {
    const hash1 = hashInboundEmail(
      "msg-123@example.com",
      "sender-a@example.com",
      "2024-01-15T10:00:00Z",
    );
    const hash2 = hashInboundEmail(
      "msg-123@example.com",
      "sender-b@example.com",
      "2024-01-15T10:00:00Z",
    );
    expect(hash1).not.toBe(hash2);
  });

  it("produces different hashes when date differs", () => {
    const hash1 = hashInboundEmail(
      "msg-123@example.com",
      "sender@example.com",
      "2024-01-15T10:00:00Z",
    );
    const hash2 = hashInboundEmail(
      "msg-123@example.com",
      "sender@example.com",
      "2024-01-16T10:00:00Z",
    );
    expect(hash1).not.toBe(hash2);
  });

  it("produces a 32-character hex string", () => {
    const hash = hashInboundEmail("test", "test", "test");
    expect(hash).toHaveLength(32);
    expect(hash).toMatch(/^[0-9a-f]{32}$/);
  });
});

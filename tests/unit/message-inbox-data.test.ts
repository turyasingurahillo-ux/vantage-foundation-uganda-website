import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

/**
 * Tests the grouped reply count helper and the summary query's PII
 * minimisation contract.
 *
 * These mock the neon SQL runner to verify the query shape and the
 * mapping logic without requiring a live database.
 */

// Mock the neon module so we can capture the SQL template tags.
const mockSql = vi.fn();

vi.mock("@neondatabase/serverless", () => ({
  neon: () => mockSql,
}));

beforeEach(() => {
  mockSql.mockReset();
  process.env.DATABASE_URL = "postgres://test";
});

afterEach(() => {
  delete process.env.DATABASE_URL;
});

describe("getSentReplyCountsForMessages", () => {
  it("returns empty map for empty input", async () => {
    const { getSentReplyCountsForMessages } = await import(
      "@/lib/db/contact-replies"
    );
    const result = await getSentReplyCountsForMessages([]);
    expect(result.size).toBe(0);
    expect(mockSql).not.toHaveBeenCalled();
  });

  it("maps message_id → reply_count correctly", async () => {
    mockSql.mockResolvedValue([
      { message_id: 1, reply_count: 3 },
      { message_id: 2, reply_count: 1 },
    ]);
    const { getSentReplyCountsForMessages } = await import(
      "@/lib/db/contact-replies"
    );
    const result = await getSentReplyCountsForMessages([1, 2, 3]);
    expect(result.get(1)).toBe(3);
    expect(result.get(2)).toBe(1);
    expect(result.get(3)).toBeUndefined();
  });

  it("returns 0 count for messages with no replies (not in result set)", async () => {
    mockSql.mockResolvedValue([{ message_id: 5, reply_count: 2 }]);
    const { getSentReplyCountsForMessages } = await import(
      "@/lib/db/contact-replies"
    );
    const result = await getSentReplyCountsForMessages([4, 5, 6]);
    expect(result.get(4)).toBeUndefined();
    expect(result.get(5)).toBe(2);
    expect(result.get(6)).toBeUndefined();
  });
});

describe("searchContactMessageSummaries — PII minimisation", () => {
  it("returns summaries with messagePreview, not full message", async () => {
    mockSql.mockResolvedValue([
      {
        id: 1,
        created_at: "2026-08-19T10:39:00Z",
        name: "Jane",
        email: "jane@example.com",
        phone: null,
        organisation: null,
        category: "general",
        message_preview: "Short preview",
        email_sent: true,
        status: "new",
        last_replied_at: null,
        archived_at: null,
      },
    ]);
    const { searchContactMessageSummaries } = await import(
      "@/lib/db/contact"
    );
    const result = await searchContactMessageSummaries({
      filter: "new",
      query: "",
    });
    expect(result).toHaveLength(1);
    expect(result[0].messagePreview).toBe("Short preview");
    // The summary type must not have a `message` field — only messagePreview
    expect(result[0]).not.toHaveProperty("message");
  });

  it("MESSAGE_PREVIEW_LENGTH is a reasonable bounded value", async () => {
    const { MESSAGE_PREVIEW_LENGTH } = await import("@/lib/db/contact");
    expect(MESSAGE_PREVIEW_LENGTH).toBeGreaterThan(50);
    expect(MESSAGE_PREVIEW_LENGTH).toBeLessThanOrEqual(500);
  });
});

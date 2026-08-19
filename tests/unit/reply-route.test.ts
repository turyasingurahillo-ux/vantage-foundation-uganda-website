import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Route-level integration tests for the admin reply endpoint.
 *
 * These exercise the full POST handler with every external dependency mocked,
 * so they assert the orchestration contract: validation → recipient lookup →
 * idempotent pending row → provider send → status bookkeeping → redirect.
 *
 * They exist because a production bug let a disabled textarea drop `body` from
 * the form, the server then received null, and Zod's raw "Expected string,
 * received null" leaked into the redirect URL. The handler must now emit only
 * fixed application error codes and never raw validation-library text.
 */

// --- Mocks --------------------------------------------------------------

vi.mock("server-only", () => ({}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn((name: string) =>
      name === "vantage_admin" ? { value: "session-token" } : undefined,
    ),
  })),
}));

vi.mock("@/lib/session", () => ({
  sessionCookieName: "vantage_admin",
  verifySessionToken: vi.fn(() => ({ actorId: "1" })),
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(() => true),
  getClientIp: vi.fn(() => "127.0.0.1"),
}));

vi.mock("@/lib/csrf", () => ({
  validateCsrf: vi.fn(() => true),
}));

vi.mock("@/lib/logger", () => ({
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logError: vi.fn(),
}));

vi.mock("@/lib/db/audit", () => ({
  appendAuditLog: vi.fn(async () => {}),
}));

vi.mock("@/lib/db/contact", () => ({
  getContactMessageById: vi.fn(async () => ({
    id: 27,
    email: "jane@example.com",
    name: "Jane Doe",
    category: "general",
    message: "Original message body.",
    status: "new",
    createdAt: new Date("2026-08-19T10:00:00Z"),
  })),
  markContactMessageReplied: vi.fn(async () => {}),
  setContactMessageStatus: vi.fn(async () => {}),
}));

vi.mock("@/lib/db/contact-replies", () => ({
  createPendingReply: vi.fn(async () => ({
    reply: {
      id: 101,
      messageId: 27,
      sendStatus: "pending",
    },
    alreadyExisted: false,
  })),
  getLastSentReply: vi.fn(async () => null),
  markReplyFailed: vi.fn(async () => {}),
  markReplySent: vi.fn(async () => {}),
}));

vi.mock("@/lib/contact-reply", () => ({
  REPLY_MAX_LENGTH: 5000,
  sendContactReply: vi.fn(async () => ({ ok: true, messageId: "<sent@vantage>" })),
}));

// Import after mocks are registered.
import { POST } from "@/app/api/admin/messages/reply/route";
import { sendContactReply } from "@/lib/contact-reply";
import {
  createPendingReply,
  markReplyFailed,
  markReplySent,
} from "@/lib/db/contact-replies";
import {
  getContactMessageById,
  markContactMessageReplied,
  setContactMessageStatus,
} from "@/lib/db/contact";
import { appendAuditLog } from "@/lib/db/audit";

const URL = "http://localhost/api/admin/messages/reply";

function buildRequest(form: Record<string, string | null>): Request {
  const formData = new FormData();
  for (const [k, v] of Object.entries(form)) {
    if (v !== null) formData.append(k, v);
  }
  const req = new Request(URL, { method: "POST", body: formData });
  return req;
}

function locationOf(res: Response): string {
  return res.headers.get("location") ?? "";
}

beforeEach(() => {
  vi.clearAllMocks();
});

// --- Tests --------------------------------------------------------------

describe("POST /api/admin/messages/reply — validation error codes", () => {
  it("returns the `invalid` code (never raw Zod text) when body is missing", async () => {
    // This is the production bug: a disabled textarea submits no `body`.
    const req = buildRequest({
      id: "27",
      body: null,
      idempotencyKey: "27-1700000000000-abc123def",
      csrf_token: "csrf-token",
    });
    const res = await POST(req);
    expect(res.status).toBe(303);
    const loc = locationOf(res);
    expect(loc).toContain("error=invalid");
    expect(loc).not.toContain("Expected");
    expect(loc).not.toContain("received");
    expect(loc).not.toContain("zod");
  });

  it("returns the `empty` code for a whitespace-only body", async () => {
    const res = await POST(
      buildRequest({
        id: "27",
        body: "   \n  ",
        idempotencyKey: "27-1700000000000-abc123def",
        csrf_token: "csrf-token",
      }),
    );
    expect(res.status).toBe(303);
    expect(locationOf(res)).toContain("error=empty");
  });

  it("returns the `too-long` code for an oversized body", async () => {
    const res = await POST(
      buildRequest({
        id: "27",
        body: "x".repeat(5001),
        idempotencyKey: "27-1700000000000-abc123def",
        csrf_token: "csrf-token",
      }),
    );
    expect(res.status).toBe(303);
    expect(locationOf(res)).toContain("error=too-long");
  });

  it("returns the `invalid` code for a non-numeric id", async () => {
    const res = await POST(
      buildRequest({
        id: "not-a-number",
        body: "Hello.",
        idempotencyKey: "27-1700000000000-abc123def",
        csrf_token: "csrf-token",
      }),
    );
    expect(res.status).toBe(303);
    expect(locationOf(res)).toContain("error=invalid");
  });
});

describe("POST /api/admin/messages/reply — successful send", () => {
  it("hands the submitted body to the mail-send layer", async () => {
    await POST(
      buildRequest({
        id: "27",
        body: "Thanks for your enquiry.",
        idempotencyKey: "27-1700000000000-abc123def",
        csrf_token: "csrf-token",
      }),
    );

    expect(sendContactReply).toHaveBeenCalledTimes(1);
    const args = (sendContactReply as unknown as { mock: { calls: unknown[][] } })
      .mock.calls[0][0] as { replyBody: string; recipientEmail: string };
    expect(args.replyBody).toBe("Thanks for your enquiry.");
    // Recipient is read from the stored row, never the request.
    expect(args.recipientEmail).toBe("jane@example.com");
  });

  it("marks the reply sent and the conversation replied on a successful send", async () => {
    const res = await POST(
      buildRequest({
        id: "27",
        body: "Thanks for your enquiry.",
        idempotencyKey: "27-1700000000000-abc123def",
        csrf_token: "csrf-token",
      }),
    );

    expect(markReplySent).toHaveBeenCalledWith(
      101,
      "<sent@vantage>",
      null,
    );
    expect(markContactMessageReplied).toHaveBeenCalledWith(27);
    expect(appendAuditLog).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(303);
    expect(locationOf(res)).toContain("replied=1");
  });

  it("does not mark the conversation replied when the provider fails", async () => {
    vi.mocked(sendContactReply).mockResolvedValueOnce({
      ok: false,
      error: "SMTP connection refused",
    });

    const res = await POST(
      buildRequest({
        id: "27",
        body: "Thanks for your enquiry.",
        idempotencyKey: "27-1700000000000-abc123def",
        csrf_token: "csrf-token",
      }),
    );

    expect(markReplyFailed).toHaveBeenCalledWith(101, "SMTP connection refused");
    expect(markReplySent).not.toHaveBeenCalled();
    expect(markContactMessageReplied).not.toHaveBeenCalled();
    // The conversation owes a response, so it is moved to awaiting_response.
    expect(setContactMessageStatus).toHaveBeenCalledWith(27, "awaiting_response");
    expect(res.status).toBe(303);
    expect(locationOf(res)).toContain("error=send");
  });

  it("does not call the provider when the message does not exist", async () => {
    vi.mocked(getContactMessageById).mockResolvedValueOnce(null);

    const res = await POST(
      buildRequest({
        id: "999",
        body: "Hello.",
        idempotencyKey: "999-1700000000000-abc123def",
        csrf_token: "csrf-token",
      }),
    );

    expect(sendContactReply).not.toHaveBeenCalled();
    expect(createPendingReply).not.toHaveBeenCalled();
    expect(locationOf(res)).toContain("error=notfound");
  });
});

describe("POST /api/admin/messages/reply — idempotency / double-submit", () => {
  it("does not send a second email when the same idempotency key is replayed", async () => {
    vi.mocked(createPendingReply).mockResolvedValueOnce({
      // A previous submission already created the row.
      reply: {
        id: 101,
        messageId: 27,
        createdAt: new Date("2026-08-19T11:00:00Z"),
        direction: "outbound",
        body: "Thanks for your enquiry.",
        recipientEmail: "jane@example.com",
        sendStatus: "sent",
      },
      alreadyExisted: true,
    });

    const res = await POST(
      buildRequest({
        id: "27",
        body: "Thanks for your enquiry.",
        idempotencyKey: "27-1700000000000-abc123def",
        csrf_token: "csrf-token",
      }),
    );

    expect(sendContactReply).not.toHaveBeenCalled();
    expect(markReplySent).not.toHaveBeenCalled();
    // A previously-sent duplicate is reported as replied, not as an error.
    expect(locationOf(res)).toContain("replied=1");
  });

  it("reports a failed duplicate as a send error, without re-sending", async () => {
    vi.mocked(createPendingReply).mockResolvedValueOnce({
      reply: {
        id: 101,
        messageId: 27,
        createdAt: new Date("2026-08-19T11:00:00Z"),
        direction: "outbound",
        body: "Thanks for your enquiry.",
        recipientEmail: "jane@example.com",
        sendStatus: "failed",
      },
      alreadyExisted: true,
    });

    const res = await POST(
      buildRequest({
        id: "27",
        body: "Thanks for your enquiry.",
        idempotencyKey: "27-1700000000000-abc123def",
        csrf_token: "csrf-token",
      }),
    );

    expect(sendContactReply).not.toHaveBeenCalled();
    expect(locationOf(res)).toContain("error=send");
  });
});

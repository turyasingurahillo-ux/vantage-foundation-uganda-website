import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Reply-composition and status-model behaviour.
 *
 * The reply endpoint itself is exercised end-to-end in
 * tests/e2e/admin-message-replies.spec.ts; these cover the pure pieces that
 * are cheap to assert and easy to regress.
 */

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("reply subject", () => {
  it("reads as a normal mail-client reply, not an internal tag", async () => {
    const { buildReplySubject } = await import("@/lib/contact-reply");
    const subject = buildReplySubject("grants");

    expect(subject.startsWith("Re: ")).toBe(true);
    expect(subject).toContain("Vantage Foundation Uganda");
    // The internal notification prefix must never leak to an enquirer.
    expect(subject).not.toContain("[VANTAGE CONTACT");
  });

  it("reflects the category the visitor chose", async () => {
    const { buildReplySubject } = await import("@/lib/contact-reply");
    expect(buildReplySubject("partnerships").toLowerCase()).toContain(
      "partnerships",
    );
    expect(buildReplySubject("media").toLowerCase()).toContain("media");
  });
});

describe("reply length limit", () => {
  it("is bounded so a single reply cannot be unbounded", async () => {
    const { REPLY_MAX_LENGTH } = await import("@/lib/contact-reply");
    expect(REPLY_MAX_LENGTH).toBeGreaterThan(500);
    expect(REPLY_MAX_LENGTH).toBeLessThanOrEqual(10000);
  });
});

describe("sendEmailDetailed", () => {
  it("reports failure rather than throwing when SMTP is unconfigured", async () => {
    delete process.env.SMTP_HOST;
    const { sendEmailDetailed } = await import("@/lib/email");

    const result = await sendEmailDetailed({
      to: "someone@example.invalid",
      subject: "Test",
      body: "Test",
    });

    expect(result.ok).toBe(false);
    expect(result.messageId).toBeUndefined();
  });

  it("keeps sendEmail() boolean-compatible for the notification paths", async () => {
    delete process.env.SMTP_HOST;
    const { sendEmail } = await import("@/lib/email");
    await expect(
      sendEmail("s", "b", undefined, "someone@example.invalid"),
    ).resolves.toBe(false);
  });
});

describe("reply email content", () => {
  /**
   * Captures what would be handed to the transport, without sending, by
   * stubbing the email module.
   */
  async function capture(replyBody: string, originalMessage = "Original text") {
    const sent: Record<string, unknown>[] = [];
    vi.doMock("@/lib/email", () => ({
      sendEmailDetailed: async (opts: Record<string, unknown>) => {
        sent.push(opts);
        return { ok: true, messageId: "<generated@vantage>" };
      },
    }));
    const { sendContactReply } = await import("@/lib/contact-reply");
    await sendContactReply({
      recipientEmail: "enquirer@example.invalid",
      recipientName: "Test Person",
      category: "general",
      replyBody,
      originalMessage,
      originalSentAt: new Date("2026-01-01T00:00:00Z"),
    });
    return sent[0];
  }

  it("sends to the address it was given and nothing else", async () => {
    const mail = await capture("Thanks for getting in touch.");
    expect(mail.to).toBe("enquirer@example.invalid");
  });

  it("escapes HTML so a reply cannot inject markup", async () => {
    const mail = await capture("<script>alert(1)</script> hello");
    expect(String(mail.html)).not.toContain("<script>alert(1)</script>");
    expect(String(mail.html)).toContain("&lt;script&gt;");
  });

  it("escapes the quoted original message too", async () => {
    const mail = await capture("Thanks.", "<img src=x onerror=alert(1)>");
    expect(String(mail.html)).not.toContain("<img src=x");
    expect(String(mail.html)).toContain("&lt;img src=x");
  });

  it("quotes the original message for context", async () => {
    const mail = await capture("Thanks.", "I would like to volunteer.");
    expect(String(mail.body)).toContain("> I would like to volunteer.");
  });

  it("carries no internal routing metadata to the enquirer", async () => {
    const mail = await capture("Thanks for getting in touch.");
    const all = `${mail.subject} ${mail.body} ${mail.html}`;
    expect(all).not.toContain("[VANTAGE CONTACT");
    expect(all).not.toMatch(/foundationvantage@gmail\.com/);
  });

  it("threads onto the previous message when one exists", async () => {
    const sent: Record<string, unknown>[] = [];
    vi.doMock("@/lib/email", () => ({
      sendEmailDetailed: async (opts: Record<string, unknown>) => {
        sent.push(opts);
        return { ok: true };
      },
    }));
    const { sendContactReply } = await import("@/lib/contact-reply");
    await sendContactReply({
      recipientEmail: "enquirer@example.invalid",
      recipientName: "Test Person",
      category: "general",
      replyBody: "Second reply",
      originalMessage: "Original",
      originalSentAt: new Date("2026-01-01T00:00:00Z"),
      inReplyTo: "<first@vantage>",
    });

    expect(sent[0].inReplyTo).toBe("<first@vantage>");
    expect(sent[0].references).toEqual(["<first@vantage>"]);
  });

  it("omits threading headers on the first reply", async () => {
    const mail = await capture("First reply");
    expect(mail.inReplyTo).toBeUndefined();
    expect(mail.references).toBeUndefined();
  });
});

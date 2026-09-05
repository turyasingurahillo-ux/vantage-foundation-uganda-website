import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Phase 5A — Forms and email safety regression tests.
 *
 * Verifies that:
 * - The From address is never derived from the recipient.
 * - A missing authorised sender fails the send cleanly.
 * - User input cannot inject email headers.
 * - HTML values remain escaped.
 * - Donation and newsletter schemas enforce max field lengths.
 * - Failed email does not incorrectly mark the workflow as sent.
 */

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("Phase 5A: sender-identity safety in sendEmailDetailed", () => {
  it("uses SMTP_FROM as From address when configured", async () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_USER = "user@example.com";
    process.env.SMTP_PASS = "pass";
    process.env.SMTP_FROM = "noreply@vantagefoundationuganda.com";

    const sentMail: Record<string, unknown>[] = [];
    vi.doMock("nodemailer", () => ({
      default: {
        createTransport: () => ({
          sendMail: (opts: Record<string, unknown>) => {
            sentMail.push(opts);
            return Promise.resolve({ messageId: "<test@vantage>", response: "250 OK" });
          },
        }),
      },
    }));

    const { sendEmailDetailed } = await import("@/lib/email");
    const result = await sendEmailDetailed({
      to: "enquirer@example.com",
      subject: "Test subject",
      body: "Test body",
    });

    expect(result.ok).toBe(true);
    expect(sentMail).toHaveLength(1);
    expect(sentMail[0].from).toBe("noreply@vantagefoundationuganda.com");
    expect(sentMail[0].to).toBe("enquirer@example.com");
  });

  it("falls back to SMTP_USER as From when SMTP_FROM is not set", async () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_USER = "noreply@vantagefoundationuganda.com";
    process.env.SMTP_PASS = "pass";
    delete process.env.SMTP_FROM;

    const sentMail: Record<string, unknown>[] = [];
    vi.doMock("nodemailer", () => ({
      default: {
        createTransport: () => ({
          sendMail: (opts: Record<string, unknown>) => {
            sentMail.push(opts);
            return Promise.resolve({ messageId: "<test@vantage>", response: "250 OK" });
          },
        }),
      },
    }));

    const { sendEmailDetailed } = await import("@/lib/email");
    const result = await sendEmailDetailed({
      to: "enquirer@example.com",
      subject: "Test subject",
      body: "Test body",
    });

    expect(result.ok).toBe(true);
    expect(sentMail[0].from).toBe("noreply@vantagefoundationuganda.com");
  });

  it("does NOT use the recipient as From when no authorised sender is configured", async () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_PASS = "pass";
    // Delete SMTP_FROM and make SMTP_USER invalid so getFromAddress() returns null
    delete process.env.SMTP_FROM;
    // Set SMTP_USER to an invalid address so readAddressEnv rejects it
    process.env.SMTP_USER = "not an email";

    const sentMail: Record<string, unknown>[] = [];
    vi.doMock("nodemailer", () => ({
      default: {
        createTransport: () => ({
          sendMail: (opts: Record<string, unknown>) => {
            sentMail.push(opts);
            return Promise.resolve({ messageId: "<test@vantage>", response: "250 OK" });
          },
        }),
      },
    }));

    const { sendEmailDetailed } = await import("@/lib/email");
    const result = await sendEmailDetailed({
      to: "enquirer@example.com",
      subject: "Test subject",
      body: "Test body",
    });

    // The send must fail cleanly rather than using the recipient as From.
    expect(result.ok).toBe(false);
    expect(result.error).toContain("No authorised sender");
    expect(sentMail).toHaveLength(0);
  });

  it("fails safely when both SMTP_FROM and SMTP_USER are unset", async () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_PORT = "587";
    delete process.env.SMTP_USER;
    delete process.env.SMTP_FROM;
    process.env.SMTP_PASS = "pass";

    const sentMail: Record<string, unknown>[] = [];
    vi.doMock("nodemailer", () => ({
      default: {
        createTransport: () => ({
          sendMail: (opts: Record<string, unknown>) => {
            sentMail.push(opts);
            return Promise.resolve({ messageId: "<test@vantage>", response: "250 OK" });
          },
        }),
      },
    }));

    const { sendEmailDetailed } = await import("@/lib/email");
    const result = await sendEmailDetailed({
      to: "enquirer@example.com",
      subject: "Test subject",
      body: "Test body",
    });

    expect(result.ok).toBe(false);
    expect(result.error).toContain("No authorised sender");
    expect(sentMail).toHaveLength(0);
  });

  it("ignores invalid SMTP_FROM and uses SMTP_USER instead", async () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_USER = "user@example.com";
    process.env.SMTP_PASS = "pass";
    // Set SMTP_FROM to an invalid address with spaces (rejected by readAddressEnv)
    process.env.SMTP_FROM = "not valid@example.com";

    const sentMail: Record<string, unknown>[] = [];
    vi.doMock("nodemailer", () => ({
      default: {
        createTransport: () => ({
          sendMail: (opts: Record<string, unknown>) => {
            sentMail.push(opts);
            return Promise.resolve({ messageId: "<test@vantage>", response: "250 OK" });
          },
        }),
      },
    }));

    const { sendEmailDetailed } = await import("@/lib/email");
    const result = await sendEmailDetailed({
      to: "enquirer@example.com",
      subject: "Test subject",
      body: "Test body",
    });

    // SMTP_FROM is invalid, but SMTP_USER is valid, so it should use SMTP_USER
    expect(result.ok).toBe(true);
    expect(sentMail[0].from).toBe("user@example.com");
  });

  it("recipient cannot influence the From address", async () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_USER = "noreply@vantagefoundationuganda.com";
    process.env.SMTP_PASS = "pass";
    delete process.env.SMTP_FROM;

    const sentMail: Record<string, unknown>[] = [];
    vi.doMock("nodemailer", () => ({
      default: {
        createTransport: () => ({
          sendMail: (opts: Record<string, unknown>) => {
            sentMail.push(opts);
            return Promise.resolve({ messageId: "<test@vantage>", response: "250 OK" });
          },
        }),
      },
    }));

    const { sendEmailDetailed } = await import("@/lib/email");
    const attackerEmail = "attacker@evil.com";
    const result = await sendEmailDetailed({
      to: attackerEmail,
      subject: "Test subject",
      body: "Test body",
    });

    expect(result.ok).toBe(true);
    // From must be the authorised sender, not the recipient
    expect(sentMail[0].from).toBe("noreply@vantagefoundationuganda.com");
    expect(sentMail[0].from).not.toBe(attackerEmail);
  });
});

describe("Phase 5A: email header injection prevention", () => {
  it("strips newlines from subject to prevent header injection", async () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_USER = "noreply@vantagefoundationuganda.com";
    process.env.SMTP_PASS = "pass";
    delete process.env.SMTP_FROM;

    const sentMail: Record<string, unknown>[] = [];
    vi.doMock("nodemailer", () => ({
      default: {
        createTransport: () => ({
          sendMail: (opts: Record<string, unknown>) => {
            sentMail.push(opts);
            return Promise.resolve({ messageId: "<test@vantage>", response: "250 OK" });
          },
        }),
      },
    }));

    const { sendEmailDetailed } = await import("@/lib/email");
    const result = await sendEmailDetailed({
      to: "recipient@example.com",
      subject: "Test\r\nBcc: evil@example.com\r\n",
      body: "Test body",
    });

    expect(result.ok).toBe(true);
    const subject = sentMail[0].subject as string;
    // sanitiseValue strips CR/LF so the "Bcc:" text is harmless — it stays
    // in the subject line as text rather than being interpreted as a header.
    // The key assertion is that no newlines remain to enable header injection.
    expect(subject).not.toContain("\r");
    expect(subject).not.toContain("\n");
  });
});

describe("Phase 5A: HTML email escaping", () => {
  it("escapes HTML special characters in email template values", async () => {
    const { emailTemplate } = await import("@/lib/email");
    const html = emailTemplate(
      "Test Title",
      [{ label: "Name", value: "<script>alert('xss')</script>" }],
      "Intro with <b>bold</b>",
    );

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&lt;b&gt;bold&lt;/b&gt;");
  });
});

describe("Phase 5A: donation schema max lengths", () => {
  it("rejects name longer than 100 characters", async () => {
    const { donorSchema } = await import("@/lib/form-schemas");
    const longName = "a".repeat(101);
    const result = donorSchema.safeParse({
      name: longName,
      email: "test@example.com",
      amount: 100,
      frequency: "one-time",
      campaign: "general",
    });
    expect(result.success).toBe(false);
  });

  it("rejects email longer than 254 characters", async () => {
    const { donorSchema } = await import("@/lib/form-schemas");
    const longEmail = "a".repeat(250) + "@b.co";
    const result = donorSchema.safeParse({
      name: "Test",
      email: longEmail,
      amount: 100,
      frequency: "one-time",
      campaign: "general",
    });
    expect(result.success).toBe(false);
  });

  it("rejects message longer than 5000 characters", async () => {
    const { donorSchema } = await import("@/lib/form-schemas");
    const longMessage = "a".repeat(5001);
    const result = donorSchema.safeParse({
      name: "Test",
      email: "test@example.com",
      amount: 100,
      frequency: "one-time",
      campaign: "general",
      message: longMessage,
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid donation data within limits", async () => {
    const { donorSchema } = await import("@/lib/form-schemas");
    const result = donorSchema.safeParse({
      name: "Test Donor",
      email: "test@example.com",
      amount: 100,
      frequency: "one-time",
      campaign: "general",
      message: "This is a valid message within limits.",
    });
    expect(result.success).toBe(true);
  });
});

describe("Phase 5A: newsletter schema max lengths", () => {
  it("rejects email longer than 254 characters", async () => {
    const { newsletterSchema } = await import("@/lib/form-schemas");
    const longEmail = "a".repeat(250) + "@b.co";
    const result = newsletterSchema.safeParse({
      email: longEmail,
      consent: "on",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid newsletter email within limits", async () => {
    const { newsletterSchema } = await import("@/lib/form-schemas");
    const result = newsletterSchema.safeParse({
      email: "test@example.com",
      consent: "on",
    });
    expect(result.success).toBe(true);
  });
});

describe("Phase 5A: failed email does not mark workflow as sent", () => {
  it("sendEmailDetailed returns ok:false when sender is missing, not ok:true", async () => {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_PORT = "587";
    delete process.env.SMTP_USER;
    delete process.env.SMTP_FROM;
    process.env.SMTP_PASS = "pass";

    vi.doMock("nodemailer", () => ({
      default: {
        createTransport: () => ({
          sendMail: () => Promise.resolve({ messageId: "<test>", response: "250 OK" }),
        }),
      },
    }));

    const { sendEmailDetailed } = await import("@/lib/email");
    const result = await sendEmailDetailed({
      to: "someone@example.com",
      subject: "Test",
      body: "Test",
    });

    // The caller (reply route) checks result.ok and marks the reply as
    // failed + sets the message back to awaiting_response when ok is false.
    // If this incorrectly returned ok:true, the workflow would be marked
    // as sent despite the email never being delivered.
    expect(result.ok).toBe(false);
  });
});

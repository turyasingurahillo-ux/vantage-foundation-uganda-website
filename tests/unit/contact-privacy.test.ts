import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

/**
 * Guards the email-privacy contract:
 *
 *  1. Vantage's protected operational mailbox is never resolvable as a public,
 *     client-side value.
 *  2. The contact endpoint's destination is derived only from server env plus a
 *     fixed category enum — never from request data — so it cannot be used as
 *     an open relay.
 */

const PROTECTED_MAILBOX = "foundationvantage@gmail.com";

describe("resolvePublicContactEmail", () => {
  it("returns undefined when no public alias is configured", async () => {
    const { resolvePublicContactEmail } = await import("@/lib/public-contact");
    expect(resolvePublicContactEmail(undefined)).toBeUndefined();
    expect(resolvePublicContactEmail("")).toBeUndefined();
  });

  it("refuses to publish the protected Gmail mailbox", async () => {
    const { resolvePublicContactEmail } = await import("@/lib/public-contact");
    expect(resolvePublicContactEmail(PROTECTED_MAILBOX)).toBeUndefined();
  });

  it("refuses any consumer mailbox provider", async () => {
    const { resolvePublicContactEmail } = await import("@/lib/public-contact");
    for (const address of [
      "team@gmail.com",
      "team@googlemail.com",
      "team@outlook.com",
      "team@yahoo.com",
      "team@icloud.com",
    ]) {
      expect(resolvePublicContactEmail(address)).toBeUndefined();
    }
  });

  it("accepts a verified domain alias and normalises it", async () => {
    const { resolvePublicContactEmail } = await import("@/lib/public-contact");
    expect(
      resolvePublicContactEmail("  Contact@VantageFoundationUganda.com "),
    ).toBe("contact@vantagefoundationuganda.com");
  });

  it("rejects malformed or oversized values", async () => {
    const { resolvePublicContactEmail } = await import("@/lib/public-contact");
    expect(resolvePublicContactEmail("not-an-email")).toBeUndefined();
    expect(resolvePublicContactEmail("a@b")).toBeUndefined();
    expect(
      resolvePublicContactEmail("a@b.com\r\nBcc: attacker@evil.com"),
    ).toBeUndefined();
    expect(
      resolvePublicContactEmail(`${"a".repeat(250)}@example.com`),
    ).toBeUndefined();
  });
});

describe("site config", () => {
  it("does not carry the protected mailbox in any field", async () => {
    const { site } = await import("@/content/site");
    expect(JSON.stringify(site)).not.toContain(PROTECTED_MAILBOX);
    expect(JSON.stringify(site)).not.toContain("gmail.com");
  });

  it("leaves publicEmail undefined when NEXT_PUBLIC_CONTACT_EMAIL is unset", async () => {
    const { site } = await import("@/content/site");
    expect(site.contact.publicEmail).toBeUndefined();
  });
});

describe("contact categories", () => {
  it("covers every category the brief requires", async () => {
    const { CONTACT_CATEGORY_VALUES } = await import("@/lib/contact-categories");
    for (const required of [
      "general",
      "partnerships",
      "grants",
      "programmes",
      "volunteering",
      "media",
      "research",
      "other",
    ]) {
      expect(CONTACT_CATEGORY_VALUES).toContain(required);
    }
  });

  it("tags each category with a routing prefix for Gmail filters", async () => {
    const { buildSubjectPrefix } = await import("@/lib/contact-categories");
    expect(buildSubjectPrefix("partnerships")).toBe(
      "[VANTAGE CONTACT — PARTNERSHIP]",
    );
    expect(buildSubjectPrefix("grants")).toBe("[VANTAGE CONTACT — GRANTS]");
    expect(buildSubjectPrefix("media")).toBe("[VANTAGE CONTACT — MEDIA]");
  });

  it("maps legacy ?subject= deep links to current categories", async () => {
    const { resolveCategoryFromQuery } = await import(
      "@/lib/contact-categories"
    );
    expect(resolveCategoryFromQuery("partner")).toBe("partnerships");
    expect(resolveCategoryFromQuery("sponsor")).toBe("partnerships");
    expect(resolveCategoryFromQuery("volunteer")).toBe("volunteering");
    expect(resolveCategoryFromQuery("media")).toBe("media");
    // Unknown values fall back to no preselection rather than being trusted.
    expect(resolveCategoryFromQuery("<script>")).toBe("");
    expect(resolveCategoryFromQuery(undefined)).toBe("");
  });
});

describe("contact inbox routing (server-only)", () => {
  const ORIGINAL = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    delete process.env.CONTACT_INBOX;
    delete process.env.CONTACT_INBOX_PARTNERSHIPS;
    delete process.env.CONTACT_INBOX_GRANTS;
    delete process.env.SMTP_FROM;
    delete process.env.SMTP_USER;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL };
  });

  it("falls back to the protected mailbox so delivery never breaks", async () => {
    const { getDefaultInbox } = await import("@/lib/contact-inbox");
    expect(getDefaultInbox()).toBe(PROTECTED_MAILBOX);
  });

  it("prefers CONTACT_INBOX when configured", async () => {
    process.env.CONTACT_INBOX = "contact@vantagefoundationuganda.com";
    const { getDefaultInbox } = await import("@/lib/contact-inbox");
    expect(getDefaultInbox()).toBe("contact@vantagefoundationuganda.com");
  });

  it("routes categories to their own alias when configured", async () => {
    process.env.CONTACT_INBOX = "contact@vantagefoundationuganda.com";
    process.env.CONTACT_INBOX_PARTNERSHIPS =
      "partnerships@vantagefoundationuganda.com";
    const { resolveInboxFor } = await import("@/lib/contact-inbox");
    expect(resolveInboxFor("partnerships")).toBe(
      "partnerships@vantagefoundationuganda.com",
    );
    // Unconfigured categories fall back, so partial setup is safe.
    expect(resolveInboxFor("research")).toBe(
      "contact@vantagefoundationuganda.com",
    );
  });

  it("ignores an env value that tries to fan out to extra recipients", async () => {
    process.env.CONTACT_INBOX = "contact@example.com, attacker@evil.com";
    const { getDefaultInbox } = await import("@/lib/contact-inbox");
    expect(getDefaultInbox()).toBe(PROTECTED_MAILBOX);
  });

  it("ignores an env value carrying a header-injection payload", async () => {
    process.env.CONTACT_INBOX = "contact@example.com\r\nBcc: attacker@evil.com";
    const { getDefaultInbox } = await import("@/lib/contact-inbox");
    expect(getDefaultInbox()).toBe(PROTECTED_MAILBOX);
  });

  it("never derives the From address from the protected mailbox", async () => {
    const { getFromAddress } = await import("@/lib/contact-inbox");
    expect(getFromAddress()).toBeNull();

    process.env.SMTP_USER = "notifications@vantagefoundationuganda.com";
    vi.resetModules();
    const { getFromAddress: reload } = await import("@/lib/contact-inbox");
    expect(reload()).toBe("notifications@vantagefoundationuganda.com");
  });
});

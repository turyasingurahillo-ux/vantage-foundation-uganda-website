import { describe, it, expect } from "vitest";
import {
  normaliseWhatsAppNumber,
  buildWhatsAppUrl,
  buildWhatsAppAriaLabel,
  getWhatsAppDisplayNumber,
  DEFAULT_WHATSAPP_MESSAGE,
} from "@/lib/whatsapp";

describe("normaliseWhatsAppNumber", () => {
  it("strips spaces, hyphens and parentheses from a display number", () => {
    expect(normaliseWhatsAppNumber("+256 786 585 216")).toBe("256786585216");
    expect(normaliseWhatsAppNumber("+256-786-585-216")).toBe("256786585216");
    expect(normaliseWhatsAppNumber("+256 (786) 585-216")).toBe("256786585216");
  });

  it("strips the leading + sign", () => {
    expect(normaliseWhatsAppNumber("+256786585216")).toBe("256786585216");
  });

  it("converts local Ugandan format starting with 0 to country code 256", () => {
    expect(normaliseWhatsAppNumber("0786 585 216")).toBe("256786585216");
    expect(normaliseWhatsAppNumber("0786585216")).toBe("256786585216");
  });

  it("converts international prefix 00 to country code", () => {
    expect(normaliseWhatsAppNumber("00256 786 585 216")).toBe("256786585216");
  });

  it("preserves numbers that already start with 256", () => {
    expect(normaliseWhatsAppNumber("256786585216")).toBe("256786585216");
  });

  it("preserves numbers with other country codes", () => {
    expect(normaliseWhatsAppNumber("+44 7700 900123")).toBe("447700900123");
    expect(normaliseWhatsAppNumber("+1 555 123 4567")).toBe("15551234567");
  });

  it("returns empty string for empty input", () => {
    expect(normaliseWhatsAppNumber("")).toBe("");
    expect(normaliseWhatsAppNumber("   ")).toBe("");
  });

  it("returns empty string for non-digit input", () => {
    expect(normaliseWhatsAppNumber("abc")).toBe("");
    expect(normaliseWhatsAppNumber("+++")).toBe("");
  });

  it("handles whitespace-only input", () => {
    expect(normaliseWhatsAppNumber("   ")).toBe("");
  });
});

describe("buildWhatsAppUrl", () => {
  it("builds a wa.me URL with digits-only number", () => {
    const url = buildWhatsAppUrl("+256 786 585 216");
    expect(url).toBe("https://wa.me/256786585216?text=" + encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE));
  });

  it("includes a custom message URL-encoded", () => {
    const url = buildWhatsAppUrl("+256 786 585 216", "Hello world!");
    expect(url).toBe("https://wa.me/256786585216?text=Hello%20world!");
  });

  it("URL-encodes special characters in the message", () => {
    const url = buildWhatsAppUrl("+256 786 585 216", "Hello & welcome?");
    expect(url).toContain("text=Hello%20%26%20welcome%3F");
  });

  it("returns empty string for invalid number", () => {
    expect(buildWhatsAppUrl("")).toBe("");
    expect(buildWhatsAppUrl("abc")).toBe("");
  });

  it("uses the default message when no message is provided", () => {
    const url = buildWhatsAppUrl("+256 786 585 216");
    expect(url).toContain("text=");
    expect(url).toContain(encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE));
  });
});

describe("buildWhatsAppAriaLabel", () => {
  it("includes the display number", () => {
    expect(buildWhatsAppAriaLabel("+256 786 585 216")).toBe(
      "Chat on WhatsApp: +256 786 585 216",
    );
  });

  it("includes context when provided", () => {
    expect(buildWhatsAppAriaLabel("+256 786 585 216", "footer")).toBe(
      "Chat on WhatsApp: +256 786 585 216 (footer)",
    );
  });
});

describe("getWhatsAppDisplayNumber", () => {
  it("returns the trimmed display number", () => {
    expect(getWhatsAppDisplayNumber("+256 786 585 216")).toBe("+256 786 585 216");
  });

  it("trims whitespace", () => {
    expect(getWhatsAppDisplayNumber("  +256 786 585 216  ")).toBe("+256 786 585 216");
  });

  it("uses the default number when none is provided", () => {
    const result = getWhatsAppDisplayNumber();
    expect(result).toMatch(/256/);
  });
});

describe("DEFAULT_WHATSAPP_MESSAGE", () => {
  it("is a non-empty string", () => {
    expect(DEFAULT_WHATSAPP_MESSAGE.length).toBeGreaterThan(0);
  });

  it("mentions Vantage Foundation Uganda", () => {
    expect(DEFAULT_WHATSAPP_MESSAGE).toContain("Vantage Foundation Uganda");
  });

  it("does not contain the protected Gmail mailbox", () => {
    expect(DEFAULT_WHATSAPP_MESSAGE).not.toContain("foundationvantage@gmail.com");
    expect(DEFAULT_WHATSAPP_MESSAGE).not.toContain("gmail.com");
  });
});

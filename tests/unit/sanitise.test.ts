import { describe, it, expect } from "vitest";
import { sanitiseValue, escapeHtml } from "@/lib/sanitise";

describe("sanitiseValue", () => {
  it("returns empty string for null", () => {
    expect(sanitiseValue(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(sanitiseValue(undefined)).toBe("");
  });

  it("passes through plain text", () => {
    expect(sanitiseValue("Hello world")).toBe("Hello world");
  });

  it("strips carriage returns", () => {
    expect(sanitiseValue("line1\rline2")).toBe("line1 line2");
  });

  it("strips line feeds", () => {
    expect(sanitiseValue("line1\nline2")).toBe("line1 line2");
  });

  it("strips tabs", () => {
    expect(sanitiseValue("col1\tcol2")).toBe("col1 col2");
  });

  it("strips vertical tab (0x0b)", () => {
    expect(sanitiseValue("a\x0bb")).toBe("a b");
  });

  it("strips form feed (0x0c)", () => {
    expect(sanitiseValue("a\x0cb")).toBe("a b");
  });

  it("strips unit separator (0x1f)", () => {
    expect(sanitiseValue("a\x1fb")).toBe("a b");
  });

  it("strips null byte (0x00)", () => {
    expect(sanitiseValue("a\x00b")).toBe("a b");
  });

  it("strips all control chars in the 0x00-0x1f range", () => {
    let input = "";
    let expected = "";
    for (let i = 0; i <= 0x1f; i++) {
      input += `a${String.fromCharCode(i)}b`;
      expected += "a b";
    }
    expect(sanitiseValue(input)).toBe(expected);
  });

  it("strips CRLF header injection attempt", () => {
    expect(sanitiseValue("user@example.com\r\nBcc: attacker@evil.com")).toBe(
      "user@example.com  Bcc: attacker@evil.com",
    );
  });

  it("limits length to 1000 characters", () => {
    const long = "x".repeat(2000);
    expect(sanitiseValue(long).length).toBe(1000);
  });

  it("converts non-string input to string", () => {
    expect(sanitiseValue(42)).toBe("42");
    expect(sanitiseValue(true)).toBe("true");
  });
});

describe("escapeHtml", () => {
  it("passes through plain text", () => {
    expect(escapeHtml("Hello world")).toBe("Hello world");
  });

  it("escapes ampersand", () => {
    expect(escapeHtml("a & b")).toBe("a &amp; b");
  });

  it("escapes less-than", () => {
    expect(escapeHtml("a < b")).toBe("a &lt; b");
  });

  it("escapes greater-than", () => {
    expect(escapeHtml("a > b")).toBe("a &gt; b");
  });

  it("escapes double quotes", () => {
    expect(escapeHtml('say "hi"')).toBe("say &quot;hi&quot;");
  });

  it("escapes single quotes", () => {
    expect(escapeHtml("it's")).toBe("it&#39;s");
  });

  it("escapes a full HTML injection attempt", () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;",
    );
  });

  it("escapes ampersand first (order matters)", () => {
    expect(escapeHtml("<&>")).toBe("&lt;&amp;&gt;");
  });

  it("converts non-string input to string", () => {
    expect(escapeHtml(42)).toBe("42");
    expect(escapeHtml(true)).toBe("true");
  });
});

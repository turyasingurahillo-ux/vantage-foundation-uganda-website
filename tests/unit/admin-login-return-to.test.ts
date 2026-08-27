import { describe, it, expect } from "vitest";
import { safeReturnTo } from "@/app/api/admin/login/route";

describe("safeReturnTo", () => {
  it("returns the default when value is null or empty", () => {
    expect(safeReturnTo(null)).toBe("/admin/donations");
    expect(safeReturnTo(undefined)).toBe("/admin/donations");
    expect(safeReturnTo("")).toBe("/admin/donations");
  });

  it("allows relative paths under /admin/", () => {
    expect(safeReturnTo("/admin/messages")).toBe("/admin/messages");
    expect(safeReturnTo("/admin/donations")).toBe("/admin/donations");
    expect(safeReturnTo("/admin/organisations/42")).toBe("/admin/organisations/42");
    expect(safeReturnTo("/admin/stories?view=editor")).toBe("/admin/stories?view=editor");
  });

  it("rejects /admin/login to avoid redirect loops", () => {
    expect(safeReturnTo("/admin/login")).toBe("/admin/donations");
    expect(safeReturnTo("/admin/login?error=1")).toBe("/admin/donations");
  });

  it("rejects paths outside /admin/", () => {
    expect(safeReturnTo("/")).toBe("/admin/donations");
    expect(safeReturnTo("/contact")).toBe("/admin/donations");
    expect(safeReturnTo("/stories")).toBe("/admin/donations");
  });

  it("rejects protocol-relative URLs", () => {
    expect(safeReturnTo("//evil.invalid/admin/messages")).toBe("/admin/donations");
    expect(safeReturnTo("//evil.invalid")).toBe("/admin/donations");
  });

  it("rejects absolute URLs with a scheme", () => {
    expect(safeReturnTo("https://evil.invalid/admin/messages")).toBe("/admin/donations");
    expect(safeReturnTo("http://evil.invalid/admin/donations")).toBe("/admin/donations");
    expect(safeReturnTo("javascript:alert(1)")).toBe("/admin/donations");
    expect(safeReturnTo("data:text/html,<script>")).toBe("/admin/donations");
  });

  it("rejects paths that don't start with a slash", () => {
    expect(safeReturnTo("admin/messages")).toBe("/admin/donations");
    expect(safeReturnTo("relative/path")).toBe("/admin/donations");
  });
});

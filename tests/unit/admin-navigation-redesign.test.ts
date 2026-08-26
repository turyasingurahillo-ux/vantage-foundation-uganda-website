import { describe, it, expect } from "vitest";
import { adminNavGroups } from "@/lib/admin-navigation";

/**
 * Tests for the admin navigation redesign.
 *
 * The redesign adds Analytics as a first-class navigation destination,
 * separate from Stories.
 */

describe("Admin navigation — product redesign", () => {
  it("includes a Stories link pointing to /admin/stories", () => {
    const allItems = adminNavGroups.flatMap((g) => g.items);
    const storiesItem = allItems.find((i) => i.href === "/admin/stories");
    expect(storiesItem).toBeDefined();
    expect(storiesItem?.label).toBe("Stories");
  });

  it("includes an Analytics link pointing to /admin/analytics", () => {
    const allItems = adminNavGroups.flatMap((g) => g.items);
    const analyticsItem = allItems.find((i) => i.href === "/admin/analytics");
    expect(analyticsItem).toBeDefined();
    expect(analyticsItem?.label).toBe("Analytics");
  });

  it("Stories and Analytics are distinct routes", () => {
    const allItems = adminNavGroups.flatMap((g) => g.items);
    const storiesHref = allItems.find((i) => i.label === "Stories")?.href;
    const analyticsHref = allItems.find((i) => i.label === "Analytics")?.href;
    expect(storiesHref).not.toBe(analyticsHref);
  });

  it("does not have duplicate links to the same route", () => {
    const allHrefs = adminNavGroups.flatMap((g) => g.items).map((i) => i.href);
    const uniqueHrefs = new Set(allHrefs);
    expect(allHrefs.length).toBe(uniqueHrefs.size);
  });

  it("preserves existing navigation items (Dashboard, Messages, Donations, Media, Admins, Audit)", () => {
    const allHrefs = adminNavGroups.flatMap((g) => g.items).map((i) => i.href);
    expect(allHrefs).toContain("/admin");
    expect(allHrefs).toContain("/admin/messages");
    expect(allHrefs).toContain("/admin/donations");
    expect(allHrefs).toContain("/admin/media");
    expect(allHrefs).toContain("/admin/admins");
    expect(allHrefs).toContain("/admin/audit");
  });
});

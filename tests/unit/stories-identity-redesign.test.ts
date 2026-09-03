import { describe, it, expect } from "vitest";
import {
  publicStoryHref,
  adminStoryHref,
  type AnalyticsStoryIdentity,
} from "@/lib/analytics-identity";

/**
 * Tests for the identity namespace separation in the product redesign.
 *
 * The redesign must not regress the Phase 2C foundation identity model:
 * - analyticsArticleId → analytics tables
 * - storyId → editorial routes (null for static)
 * - slug → public URLs
 */

describe("Story identity namespaces (product redesign)", () => {
  describe("DB-backed story with deliberately different IDs", () => {
    const identity: AnalyticsStoryIdentity = {
      analyticsArticleId: 41,
      storyId: 7,
      slug: "example-story",
    };

    it("publicStoryHref uses the slug, not any numeric ID", () => {
      expect(publicStoryHref(identity)).toBe("/stories/example-story");
    });

    it("adminStoryHref uses the storyId, not the analyticsArticleId", () => {
      expect(adminStoryHref(identity)).toBe("/admin/stories/7");
    });

    it("adminStoryHref does not contain the analyticsArticleId", () => {
      const href = adminStoryHref(identity);
      expect(href).not.toContain("41");
    });

    it("publicStoryHref does not contain either numeric ID", () => {
      const href = publicStoryHref(identity);
      expect(href).not.toContain("41");
      expect(href).not.toContain("7");
    });
  });

  describe("Static story with storyId = null", () => {
    const identity: AnalyticsStoryIdentity = {
      analyticsArticleId: 52,
      storyId: null,
      slug: "static-story",
    };

    it("publicStoryHref still works with a slug", () => {
      expect(publicStoryHref(identity)).toBe("/stories/static-story");
    });

    it("adminStoryHref returns null — no editorial route", () => {
      expect(adminStoryHref(identity)).toBeNull();
    });

    it("publicStoryHref does not contain the analyticsArticleId", () => {
      const href = publicStoryHref(identity);
      expect(href).not.toContain("52");
    });
  });

  describe("publicStoryHref works with only a slug", () => {
    it("accepts a minimal slug-only object", () => {
      expect(publicStoryHref({ slug: "test-slug" })).toBe("/stories/test-slug");
    });
  });
});

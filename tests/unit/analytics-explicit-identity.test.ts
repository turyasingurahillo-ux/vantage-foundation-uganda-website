import { describe, expect, it } from "vitest";
import { adminStoryHref, publicStoryHref } from "@/lib/analytics-identity";

describe("analytics/editorial/public identity separation", () => {
  it("uses analytics id 41 for analytics, story id 7 for editorial, and slug for public", () => {
    const identity = {
      analyticsArticleId: 41,
      storyId: 7,
      slug: "example-story",
    };

    expect(identity.analyticsArticleId).toBe(41);
    expect(adminStoryHref(identity)).toBe("/admin/stories/7");
    expect(publicStoryHref(identity)).toBe("/stories/example-story");
    expect(adminStoryHref(identity)).not.toContain("41");
    expect(publicStoryHref(identity)).not.toContain("41");
    expect(publicStoryHref(identity)).not.toContain("7");
  });

  it("keeps static content analytics-capable without inventing an editorial id", () => {
    const identity = {
      analyticsArticleId: 52,
      storyId: null,
      slug: "static-story",
    };

    expect(identity.analyticsArticleId).toBe(52);
    expect(adminStoryHref(identity)).toBeNull();
    expect(publicStoryHref(identity)).toBe("/stories/static-story");
    expect(publicStoryHref(identity)).not.toContain("52");
  });
});

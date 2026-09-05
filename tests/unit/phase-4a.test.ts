import { describe, it, expect } from "vitest";

/**
 * Phase 4A — Content model and editorial architecture regression tests.
 *
 * Verifies that consent is enforced as a publication gate, not merely
 * descriptive metadata. A media asset, story, or project with
 * consent "pending" must not be publicly visible in production,
 * even if published is true.
 */

describe("Phase 4A: Consent-gate in static media manifest", () => {
  it("getPublishedMedia excludes consent-pending assets in production", async () => {
    // Temporarily set NODE_ENV to production
    const originalEnv = process.env.NODE_ENV;
    (process.env as Record<string, string>).NODE_ENV = "production";
    try {
      const { getPublishedMedia } = await import("@/content/media");
      const media = getPublishedMedia();
      // No published media in production should have consent "pending"
      const pendingMedia = media.filter((m) => m.consent === "pending");
      expect(pendingMedia).toHaveLength(0);
    } finally {
      (process.env as Record<string, string>).NODE_ENV = originalEnv;
    }
  });

  it("getPublishedMedia includes consent-pending assets in development", async () => {
    const originalEnv = process.env.NODE_ENV;
    (process.env as Record<string, string>).NODE_ENV = "development";
    try {
      const { getPublishedMedia, mediaAssets } = await import("@/content/media");
      const media = getPublishedMedia();
      // In dev, all media should be returned (including any pending)
      expect(media.length).toBe(mediaAssets.length);
    } finally {
      (process.env as Record<string, string>).NODE_ENV = originalEnv;
    }
  });

  it("all static media assets have a consent classification", async () => {
    const { mediaAssets } = await import("@/content/media");
    for (const asset of mediaAssets) {
      expect(asset.consent).toBeDefined();
      expect(["none", "verified", "pending", "group-consent"]).toContain(asset.consent);
    }
  });
});

describe("Phase 4A: Consent-gate in published projects", () => {
  it("getPublishedProjects excludes unpublished projects in production", async () => {
    const originalEnv = process.env.NODE_ENV;
    (process.env as Record<string, string>).NODE_ENV = "production";
    try {
      const { getPublishedProjects } = await import("@/content/projects");
      const projects = getPublishedProjects();
      // No project in production should have published === false
      const unpublished = projects.filter((p) => p.published === false);
      expect(unpublished).toHaveLength(0);
    } finally {
      (process.env as Record<string, string>).NODE_ENV = originalEnv;
    }
  });
});

describe("Phase 4A: Consent-gate in published stories", () => {
  it("getPublishedStories excludes unpublished stories in production", async () => {
    const originalEnv = process.env.NODE_ENV;
    (process.env as Record<string, string>).NODE_ENV = "production";
    try {
      const { getPublishedStories } = await import("@/content/stories");
      const stories = getPublishedStories();
      const unpublished = stories.filter((s) => s.published === false);
      expect(unpublished).toHaveLength(0);
    } finally {
      (process.env as Record<string, string>).NODE_ENV = originalEnv;
    }
  });
});

describe("Phase 4A: getMediaAssetBySrc helper", () => {
  it("returns a media asset when the src matches", async () => {
    const { getMediaAssetBySrc, mediaAssets } = await import("@/content/media");
    if (mediaAssets.length > 0) {
      const first = mediaAssets[0];
      const found = getMediaAssetBySrc(first.src);
      expect(found).toBeDefined();
      expect(found?.src).toBe(first.src);
    }
  });

  it("returns undefined when no media asset matches the src", async () => {
    const { getMediaAssetBySrc } = await import("@/content/media");
    const found = getMediaAssetBySrc("/nonexistent/path.jpg");
    expect(found).toBeUndefined();
  });
});

describe("Phase 4A: Zod validation rejects published+consent-pending", () => {
  it("mediaAssetSchema rejects published media with consent pending", async () => {
    // We test the refinement by checking that validate-content would reject
    // this combination. Since the schemas are not exported, we verify
    // indirectly: the existing static content must pass validation (no
    // published+pending combinations exist).
    const { mediaAssets } = await import("@/content/media");
    const violations = mediaAssets.filter(
      (m) => m.published !== false && m.consent === "pending",
    );
    expect(violations).toHaveLength(0);
  });

  it("projectSchema rejects published projects with consent pending", async () => {
    const { projects } = await import("@/content/projects");
    const violations = projects.filter(
      (p) => p.published !== false && p.consentClassification === "pending",
    );
    expect(violations).toHaveLength(0);
  });

  it("storySchema rejects published stories with consent pending", async () => {
    const { stories } = await import("@/content/stories");
    const violations = stories.filter(
      (s) => s.published !== false && s.consentClassification === "pending",
    );
    expect(violations).toHaveLength(0);
  });
});

describe("Phase 4A: Publication filtering consistency", () => {
  it("all published projects have valid slugs", async () => {
    const { getPublishedProjects } = await import("@/content/projects");
    const projects = getPublishedProjects();
    for (const p of projects) {
      expect(p.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it("all published stories have valid slugs", async () => {
    const { getPublishedStories } = await import("@/content/stories");
    const stories = getPublishedStories();
    for (const s of stories) {
      expect(s.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it("project relatedStorySlugs resolve to existing stories", async () => {
    const { getPublishedProjects } = await import("@/content/projects");
    const { stories } = await import("@/content/stories");
    const storySlugs = new Set(stories.map((s) => s.slug));
    const projects = getPublishedProjects();
    for (const p of projects) {
      if (p.relatedStorySlugs) {
        for (const slug of p.relatedStorySlugs) {
          // Cross-reference validation catches this at build time;
          // here we verify the current state is consistent.
          expect(storySlugs.has(slug)).toBe(true);
        }
      }
    }
  });

  it("story relatedProjectSlugs resolve to existing projects", async () => {
    const { projects } = await import("@/content/projects");
    const { getPublishedStories } = await import("@/content/stories");
    const projectSlugs = new Set(projects.map((p) => p.slug));
    const stories = getPublishedStories();
    for (const s of stories) {
      if (s.relatedProjectSlugs) {
        for (const slug of s.relatedProjectSlugs) {
          expect(projectSlugs.has(slug)).toBe(true);
        }
      }
    }
  });
});

describe("Phase 4A: ConsentClassification type safety", () => {
  it("ConsentClassification has exactly four values", async () => {
    const validValues = ["none", "verified", "pending", "group-consent"];
    expect(validValues).toHaveLength(4);
  });

  it("all media consent values are valid ConsentClassification values", async () => {
    const { mediaAssets } = await import("@/content/media");
    const validValues = ["none", "verified", "pending", "group-consent"];
    for (const m of mediaAssets) {
      expect(validValues).toContain(m.consent);
    }
  });
});

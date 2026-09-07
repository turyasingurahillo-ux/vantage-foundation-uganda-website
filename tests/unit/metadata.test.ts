import { describe, expect, it } from "vitest";
import { createPublicMetadata } from "@/lib/metadata";

describe("createPublicMetadata", () => {
  describe("og:url matches canonical for editorial detail pages", () => {
    it("uses the English canonical path for contentLocalized: false", () => {
      const meta = createPublicMetadata({
        title: "Test Story",
        description: "A test story description.",
        path: "/stories/test-story",
        locale: "de",
        contentLocalized: false,
      });

      const canonical = meta.alternates?.canonical;
      const ogUrl = meta.openGraph?.url;

      expect(canonical).toBe("/stories/test-story");
      expect(ogUrl).toBe("/stories/test-story");
      expect(ogUrl).toBe(canonical);
    });

    it("uses the localized canonical path for contentLocalized: true", () => {
      const meta = createPublicMetadata({
        title: "Stories",
        description: "Stories from Vantage Foundation.",
        path: "/stories",
        locale: "de",
        contentLocalized: true,
      });

      const canonical = meta.alternates?.canonical;
      const ogUrl = meta.openGraph?.url;

      expect(canonical).toBe("/de/stories");
      expect(ogUrl).toBe("/de/stories");
      expect(ogUrl).toBe(canonical);
    });

    it("uses unprefixed English path for contentLocalized: false on English locale", () => {
      const meta = createPublicMetadata({
        title: "Test Project",
        description: "A test project description.",
        path: "/projects/test-project",
        locale: "en",
        contentLocalized: false,
      });

      const canonical = meta.alternates?.canonical;
      const ogUrl = meta.openGraph?.url;

      expect(canonical).toBe("/projects/test-project");
      expect(ogUrl).toBe("/projects/test-project");
    });
  });

  describe("hreflang alternates", () => {
    it("emits language alternates for contentLocalized: true", () => {
      const meta = createPublicMetadata({
        title: "About",
        description: "About Vantage.",
        path: "/about-us",
        locale: "en",
        contentLocalized: true,
      });

      expect(meta.alternates?.languages).toBeDefined();
      const languages = meta.alternates?.languages as Record<string, string>;
      expect(languages.en).toBe("/about-us");
      expect(languages.de).toBe("/de/about-us");
      expect(languages.fr).toBe("/fr/about-us");
      expect(languages.es).toBe("/es/about-us");
      expect(languages.ar).toBe("/ar/about-us");
      expect(languages["x-default"]).toBe("/about-us");
    });

    it("does not emit language alternates for contentLocalized: false", () => {
      const meta = createPublicMetadata({
        title: "Test Story",
        description: "A test story.",
        path: "/stories/test-story",
        locale: "en",
        contentLocalized: false,
      });

      expect(meta.alternates?.languages).toBeUndefined();
    });
  });
});

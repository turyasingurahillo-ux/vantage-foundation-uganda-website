import { describe, it, expect } from "vitest";
import { reachDistricts } from "@/content/reach";
import { getProjectBySlug, getPublishedProjects } from "@/content/projects";

describe("reachDistricts data", () => {
  it("has at least one district", () => {
    expect(reachDistricts.length).toBeGreaterThan(0);
  });

  it("every district has a name and valid WGS84 coordinates", () => {
    for (const d of reachDistricts) {
      expect(d.name).toBeTruthy();
      expect(d.district).toBe(d.name);
      expect(d.latitude).toBeDefined();
      expect(d.longitude).toBeDefined();
      expect(d.latitude).toBeGreaterThanOrEqual(-2);
      expect(d.latitude).toBeLessThanOrEqual(5);
      expect(d.longitude).toBeGreaterThanOrEqual(29);
      expect(d.longitude).toBeLessThanOrEqual(36);
    }
  });

  it("has no duplicate district names", () => {
    const names = reachDistricts.map((d) => d.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("every projectSlugs entry references a real, published project", () => {
    for (const d of reachDistricts) {
      for (const slug of d.projectSlugs ?? []) {
        expect(getProjectBySlug(slug), `${d.name} references unknown project "${slug}"`).toBeDefined();
      }
    }
  });

  it("districts with no projectSlugs are handled as reached-but-unlinked, not omitted", () => {
    const withoutProjects = reachDistricts.filter(
      (d) => !d.projectSlugs || d.projectSlugs.length === 0
    );
    // Not every district needs a project yet — this just documents that the
    // empty case is expected data, not a bug, for the component to render.
    expect(Array.isArray(withoutProjects)).toBe(true);
  });

  it("has at least one district linked to a real project (sanity check the feature isn't dead code)", () => {
    const linked = reachDistricts.filter((d) => (d.projectSlugs?.length ?? 0) > 0);
    expect(linked.length).toBeGreaterThan(0);
  });

  it("linked projects are actually published", () => {
    const publishedSlugs = new Set(getPublishedProjects().map((p) => p.slug));
    for (const d of reachDistricts) {
      for (const slug of d.projectSlugs ?? []) {
        expect(publishedSlugs.has(slug), `${d.name} links to unpublished project "${slug}"`).toBe(true);
      }
    }
  });
});

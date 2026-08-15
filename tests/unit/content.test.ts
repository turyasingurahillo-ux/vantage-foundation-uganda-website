import { describe, it, expect, vi } from "vitest";
import { areasOfWork, projectCategoriesByAreaId } from "@/content/areas";
import {
  getPublishedProjects,
  getProjectSlugs,
  getProjectsByCategory,
  getProjectsByProgramme,
  getProjectsByTheme,
  getFlagshipProject,
  getAllThemes,
} from "@/content/projects";
import { getPublishedStories, getStorySlugs } from "@/content/stories";
import { getPublishedTeam } from "@/content/team";
import { getPublishedPartners } from "@/content/partners";
import { getPublishedReports } from "@/content/reports";
import { getPublishedImpactStats } from "@/content/impact";

describe("areasOfWork", () => {
  it("has 4 core programme areas", () => {
    expect(areasOfWork).toHaveLength(4);
  });

  it("does not include youth-leadership as a standalone area", () => {
    expect(areasOfWork.find((a) => a.id === "youth-leadership")).toBeUndefined();
  });

  it("each area has id, title, programmeName, summary, description, items, and icon", () => {
    for (const area of areasOfWork) {
      expect(area.id).toBeTruthy();
      expect(area.title).toBeTruthy();
      expect(area.programmeName).toBeTruthy();
      expect(area.summary).toBeTruthy();
      expect(area.description).toBeTruthy();
      expect(area.items.length).toBeGreaterThan(0);
      expect(area.icon).toBeTruthy();
    }
  });

  it("has a category mapping for every area", () => {
    for (const area of areasOfWork) {
      expect(projectCategoriesByAreaId[area.id]).toBeDefined();
      expect(projectCategoriesByAreaId[area.id].length).toBeGreaterThan(0);
    }
  });
});

describe("getPublishedProjects", () => {
  it("returns projects", () => {
    const projects = getPublishedProjects();
    expect(projects.length).toBeGreaterThan(0);
  });

  it("each project has slug, title, summary, category, and status", () => {
    for (const project of getPublishedProjects()) {
      expect(project.slug).toBeTruthy();
      expect(project.title).toBeTruthy();
      expect(project.summary).toBeTruthy();
      expect(project.category).toBeTruthy();
      expect(project.status).toBeTruthy();
    }
  });
});

describe("getProjectSlugs", () => {
  it("returns slug strings", () => {
    const slugs = getProjectSlugs();
    expect(slugs.length).toBeGreaterThan(0);
    for (const slug of slugs) {
      expect(typeof slug).toBe("string");
    }
  });
});

describe("getProjectsByCategory", () => {
  it("filters projects by category", () => {
    const healthProjects = getProjectsByCategory("Health");
    for (const p of healthProjects) {
      expect(p.category).toBe("Health");
    }
  });
});

describe("getProjectsByProgramme (taxonomy-aware)", () => {
  it("returns projects for a primary programme", () => {
    const waterProjects = getProjectsByProgramme("water");
    expect(waterProjects.length).toBeGreaterThan(0);
    for (const p of waterProjects) {
      const primary = p.primaryProgramme ?? "health";
      const all = [primary, ...(p.secondaryProgrammes ?? [])];
      expect(all).toContain("water");
    }
  });

  it("includes projects via secondaryProgrammes, not just primaryProgramme", () => {
    // SaveGirl Uganda is primaryProgramme=education, secondaryProgrammes=[health],
    // so it must surface under BOTH education and health.
    const healthProjects = getProjectsByProgramme("health");
    const educationProjects = getProjectsByProgramme("education");
    const savegirl = getPublishedProjects().find((p) => p.slug === "savegirl-uganda");
    expect(savegirl).toBeDefined();
    expect(healthProjects.map((p) => p.slug)).toContain("savegirl-uganda");
    expect(educationProjects.map((p) => p.slug)).toContain("savegirl-uganda");
  });
});

describe("getProjectsByTheme", () => {
  it("returns projects addressing a given theme", () => {
    const menstrualHealthProjects = getProjectsByTheme("Menstrual Health");
    expect(menstrualHealthProjects.length).toBeGreaterThan(0);
    for (const p of menstrualHealthProjects) {
      expect(p.themes).toContain("Menstrual Health");
    }
  });
});

describe("getFlagshipProject", () => {
  it("returns a project flagged as flagship", () => {
    const flagship = getFlagshipProject();
    expect(flagship).toBeDefined();
    expect(flagship?.flagship).toBe(true);
  });
});

describe("getAllThemes", () => {
  it("returns a sorted, de-duplicated list of themes", () => {
    const themes = getAllThemes();
    expect(themes.length).toBeGreaterThan(0);
    // Sorted alphabetically
    const sorted = [...themes].sort();
    expect(themes).toEqual(sorted);
    // No duplicates
    expect(new Set(themes).size).toBe(themes.length);
  });
});

describe("getPublishedStories", () => {
  it("returns stories", () => {
    const stories = getPublishedStories();
    expect(stories.length).toBeGreaterThan(0);
  });

  it("each story has slug, title, excerpt, and category", () => {
    for (const story of getPublishedStories()) {
      expect(story.slug).toBeTruthy();
      expect(story.title).toBeTruthy();
      expect(story.excerpt).toBeTruthy();
      expect(story.category).toBeTruthy();
    }
  });
});

describe("getStorySlugs", () => {
  it("returns slug strings", () => {
    const slugs = getStorySlugs();
    expect(slugs.length).toBeGreaterThan(0);
  });
});

describe("getPublishedTeam", () => {
  it("returns an array", () => {
    const team = getPublishedTeam();
    expect(Array.isArray(team)).toBe(true);
  });

  it("each member has id, slug, fullName, role, category, bios and image", () => {
    for (const member of getPublishedTeam()) {
      expect(member.id).toBeTruthy();
      expect(member.slug).toBeTruthy();
      expect(member.fullName).toBeTruthy();
      expect(member.role).toBeTruthy();
      expect(["leadership", "volunteer"]).toContain(member.category);
      expect(member.shortBio).toBeTruthy();
      expect(member.fullBio).toBeTruthy();
      expect(member.image).toBeTruthy();
    }
  });

  it("is sorted by displayOrder", () => {
    const team = getPublishedTeam();
    const orders = team.map((m) => m.displayOrder);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  it("in production, filters out unpublished members", () => {
    vi.stubEnv("NODE_ENV", "production");
    const team = getPublishedTeam();
    for (const member of team) {
      expect(member.published).toBe(true);
    }
    vi.unstubAllEnvs();
  });
});

describe("getPublishedPartners", () => {
  it("returns an array", () => {
    const partners = getPublishedPartners();
    expect(Array.isArray(partners)).toBe(true);
  });
});

describe("getPublishedReports", () => {
  it("does not manufacture report records before approval", () => {
    expect(getPublishedReports()).toEqual([]);
  });
});

describe("getPublishedImpactStats", () => {
  it("returns an array", () => {
    const stats = getPublishedImpactStats();
    expect(Array.isArray(stats)).toBe(true);
  });

  it("includes traceability for every published figure", () => {
    const stats = getPublishedImpactStats();
    for (const stat of stats) {
      expect(stat.value).not.toContain("[");
      expect(stat.programme).toBeTruthy();
      expect(stat.location).toBeTruthy();
      expect(stat.period).toBeTruthy();
      expect(stat.methodology).toBeTruthy();
      expect(stat.href).toMatch(/^\/projects\//);
    }
  });
});

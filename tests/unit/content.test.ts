import { describe, it, expect, vi } from "vitest";
import {
  programmes,
  getPublishedProgrammes,
  getProgrammeBySlug,
  getProgrammeProjects,
  getAllProgrammeLearning,
  legacyProgrammeSlugs,
} from "@/content/programmes";
import { theoryOfChange } from "@/content/theory-of-change";
import {
  getEvidenceItems,
  getEvidenceItemsByProgramme,
  getEvidenceItemsByProject,
} from "@/content/evidence";
import { vantagePoint } from "@/content/vantage-point";
import {
  getPublishedProjects,
  getProjectSlugs,
  getProjectsByCategory,
  getProjectsByProgramme,
  getProjectsByTheme,
  getFlagshipProject,
  getFlagshipProjects,
  getAllThemes,
} from "@/content/projects";
import { getPublishedStories, getStorySlugs } from "@/content/stories";
import { getPublishedTeam } from "@/content/team";
import { getPublishedPartners } from "@/content/partners";
import { getPublishedReports } from "@/content/reports";
import { getPublishedImpactStats } from "@/content/impact";

describe("programmes (six-portfolio architecture)", () => {
  it("has exactly six public portfolios", () => {
    expect(programmes).toHaveLength(6);
  });

  it("has unique slugs", () => {
    const slugs = programmes.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("includes the six canonical portfolio slugs", () => {
    const slugs = programmes.map((p) => p.slug);
    expect(slugs).toContain("health-wellbeing");
    expect(slugs).toContain("education-learning");
    expect(slugs).toContain("financial-capability-economic-opportunity");
    expect(slugs).toContain("food-basic-needs");
    expect(slugs).toContain("humanitarian-vulnerability-protection");
    expect(slugs).toContain("youth-leadership-participation");
  });

  it("KikumiKyo Academy sits under Financial Capability & Economic Opportunity, not Education", () => {
    const fc = getProgrammeBySlug("financial-capability-economic-opportunity");
    expect(fc).toBeDefined();
    expect(fc?.programmeName).toBe("KikumiKyo Academy");
    expect(fc?.legacySlugs).toContain("education");
    // No portfolio may present KikumiKyo under an education id.
    const ed = getProgrammeBySlug("education-learning");
    expect(ed?.programmeName).not.toBe("KikumiKyo Academy");
  });

  it("Vantage Point is not counted as a seventh portfolio", () => {
    expect(programmes.map((p) => p.slug)).not.toContain("vantage-point");
    expect(vantagePoint.slug).toBe("vantage-point");
    expect(programmes).toHaveLength(6);
  });

  it("every portfolio has required public framing", () => {
    for (const programme of programmes) {
      expect(programme.title).toBeTruthy();
      expect(programme.summary).toBeTruthy();
      expect(programme.outcomeHeadline).toBeTruthy();
      expect(programme.status).toBeTruthy();
      expect(programme.whyThisMatters.body.length).toBeGreaterThan(0);
      expect(programme.approach.body).toBeTruthy();
    }
  });

  it("published results always carry an evidence status", () => {
    for (const programme of programmes) {
      for (const result of programme.results ?? []) {
        expect(result.evidenceStatus).toBeTruthy();
        expect(result.value).toBeTruthy();
        expect(result.label).toBeTruthy();
      }
    }
  });

  it("youth-leadership-participation is published as a developing portfolio", () => {
    const ylp = getProgrammeBySlug("youth-leadership-participation");
    expect(ylp).toBeDefined();
    expect(ylp?.status).toBe("developing");
    expect(ylp?.published).not.toBe(false);
  });

  it("getPublishedProgrammes returns all six (all published)", () => {
    expect(getPublishedProgrammes()).toHaveLength(6);
  });

  it("legacy slugs map to the correct new portfolios", () => {
    expect(legacyProgrammeSlugs["health"]).toBe("health-wellbeing");
    expect(legacyProgrammeSlugs["education"]).toBe(
      "financial-capability-economic-opportunity",
    );
    expect(legacyProgrammeSlugs["humanitarian"]).toBe(
      "humanitarian-vulnerability-protection",
    );
    expect(legacyProgrammeSlugs["water"]).toBe("food-basic-needs");
    expect(legacyProgrammeSlugs["youth-leadership"]).toBe(
      "youth-leadership-participation",
    );
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
    const waterProjects = getProjectsByProgramme("food-basic-needs");
    expect(waterProjects.length).toBeGreaterThan(0);
    for (const p of waterProjects) {
      const primary = p.primaryProgramme ?? "health-wellbeing";
      const all = [primary, ...(p.relatedProgrammes ?? [])];
      expect(all).toContain("food-basic-needs");
    }
  });

  it("includes projects via relatedProgrammes, not just primaryProgramme", () => {
    // SaveGirl Uganda is primaryProgramme=health-wellbeing with
    // relatedProgrammes=[education-learning], so it surfaces under BOTH.
    const healthProjects = getProjectsByProgramme("health-wellbeing");
    const educationProjects = getProjectsByProgramme("education-learning");
    const savegirl = getPublishedProjects().find((p) => p.slug === "savegirl-uganda");
    expect(savegirl).toBeDefined();
    expect(healthProjects.map((p) => p.slug)).toContain("savegirl-uganda");
    expect(educationProjects.map((p) => p.slug)).toContain("savegirl-uganda");
  });

  it("KikumiKyo's financial-literacy project surfaces under financial-capability", () => {
    const fcProjects = getProjectsByProgramme(
      "financial-capability-economic-opportunity",
    );
    expect(fcProjects.map((p) => p.slug)).toContain(
      "mental-health-financial-literacy-workshops",
    );
  });

  it("getProgrammeProjects matches getProjectsByProgramme", () => {
    for (const programme of programmes) {
      const viaHelper = getProgrammeProjects(programme.slug).map((p) => p.slug);
      const viaProjects = getProjectsByProgramme(programme.slug).map((p) => p.slug);
      expect(viaHelper.sort()).toEqual(viaProjects.sort());
    }
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

describe("getFlagshipProjects", () => {
  it("returns two or more flagship projects for the homepage feature", () => {
    const flagships = getFlagshipProjects();
    expect(flagships.length).toBeGreaterThanOrEqual(2);
  });

  it("returns only projects flagged as flagship, in manifest order", () => {
    const flagships = getFlagshipProjects();
    for (const p of flagships) {
      expect(p.flagship).toBe(true);
    }
    const manifestFlagships = getPublishedProjects()
      .filter((p) => p.flagship)
      .map((p) => p.slug);
    expect(flagships.map((p) => p.slug)).toEqual(manifestFlagships);
  });

  it("every flagship has a real status — never implied delivered results", () => {
    for (const p of getFlagshipProjects()) {
      expect(["Active", "Completed", "Planned"]).toContain(p.status);
    }
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

  it("assigns a valid evidence status to every published figure", () => {
    const validStatuses = new Set([
      "verified",
      "programme-team-figure",
      "estimated-catchment",
      "pilot",
      "planned",
      "external-evidence",
    ]);
    for (const stat of getPublishedImpactStats()) {
      expect(validStatuses.has(stat.evidenceStatus)).toBe(true);
    }
  });

  it("presents the Kasaale figure as an estimated catchment, not a beneficiary count", () => {
    const kasaale = getPublishedImpactStats().find((s) =>
      s.href.includes("kasaale")
    );
    expect(kasaale).toBeDefined();
    expect(kasaale?.evidenceStatus).toBe("estimated-catchment");
    expect(kasaale?.label.toLowerCase()).toContain("catchment");
    expect(kasaale?.value).not.toContain("+");
  });
});

describe("theoryOfChange (PR-4)", () => {
  it("has exactly four causal layers in the correct order", () => {
    expect(theoryOfChange.layers).toHaveLength(4);
    expect(theoryOfChange.layers.map((l) => l.kind)).toEqual([
      "context",
      "interventions",
      "intermediate",
      "longTerm",
    ]);
  });

  it("exposes assumptions, external actors, measurement and a learning loop", () => {
    expect(theoryOfChange.assumptions.length).toBeGreaterThan(0);
    expect(theoryOfChange.externalActors.length).toBeGreaterThan(0);
    expect(theoryOfChange.learningLoop.length).toBeGreaterThanOrEqual(4);
    expect(theoryOfChange.statement.length).toBeGreaterThan(0);
  });

  it("distinguishes all five measurement concepts", () => {
    expect(theoryOfChange.measurement.map((c) => c.kind)).toEqual([
      "output",
      "reach",
      "outcome",
      "catchment",
      "target",
    ]);
  });

  it("treats catchment as context, never as reach", () => {
    const catchment = theoryOfChange.measurement.find(
      (c) => c.kind === "catchment"
    );
    expect(catchment?.body.toLowerCase()).toContain("never");
  });

  it("uses positioning language, not proven-causality claims", () => {
    const all = [
      ...theoryOfChange.statement,
      ...theoryOfChange.layers.flatMap((l) => [
        l.title,
        l.description,
        ...l.items,
      ]),
    ].join(" ");
    expect(all).not.toMatch(/we have proven|guarantee|this causes/i);
  });

  it("marks only documented relationships as partners", () => {
    const partners = theoryOfChange.externalActors.filter(
      (a) => a.kind === "partner"
    );
    // One aggregate entry, naming only partners documented in the repo.
    expect(partners).toHaveLength(1);
    expect(partners[0].note).toContain("KikumiKyo");
  });
});

describe("evidence library (PR-4)", () => {
  it("is a valid empty collection — no fabricated publications", () => {
    expect(getEvidenceItems()).toEqual([]);
    expect(getEvidenceItemsByProgramme("health-wellbeing")).toEqual([]);
    expect(getEvidenceItemsByProject("savegirl-uganda")).toEqual([]);
  });
});

describe("getAllProgrammeLearning (PR-4)", () => {
  it("aggregates programme learnings with portfolio attribution", () => {
    const all = getAllProgrammeLearning();
    expect(all.length).toBeGreaterThan(0);
    for (const { programme, learning } of all) {
      expect(programmes.map((p) => p.slug)).toContain(programme.slug);
      expect(learning.title).toBeTruthy();
      expect(learning.body).toBeTruthy();
    }
  });
});

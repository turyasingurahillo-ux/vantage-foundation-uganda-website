import { describe, it, expect } from "vitest";
import { site } from "@/content/site";

describe("Navigation structure", () => {
  it("has exactly 6 nav entries", () => {
    expect(site.nav).toHaveLength(6);
  });

  it("includes the blueprint top-level: About, Programmes, Impact, Stories & Insights, Partner, Donate", () => {
    const labels = site.nav.map((n) => n.label);
    expect(labels).toContain("About");
    expect(labels).toContain("Programmes");
    expect(labels).toContain("Impact");
    expect(labels).toContain("Stories & Insights");
    expect(labels).toContain("Partner");
    expect(labels).toContain("Donate");
    // PR-6: Get Involved is no longer a top-level destination
    expect(labels).not.toContain("Get Involved");
  });

  it("About dropdown includes Our Story, Leadership, Governance, Where We Work", () => {
    const about = site.nav.find((n) => n.label === "About");
    expect(about?.children).toBeDefined();
    const childLabels = about!.children!.map((c) => c.label);
    expect(childLabels).toContain("Our Story");
    expect(childLabels).toContain("Leadership");
    expect(childLabels).toContain("Governance");
    expect(childLabels).toContain("Where We Work");
    const childHrefs = about!.children!.map((c) => c.href);
    expect(childHrefs).toContain("/where-we-work");
  });

  it("Programmes dropdown includes overview, the six portfolios plus Vantage Point", () => {
    const programmes = site.nav.find((n) => n.label === "Programmes");
    expect(programmes?.children).toBeDefined();
    expect(programmes!.children).toHaveLength(8);
    const childLabels = programmes!.children!.map((c) => c.label);
    expect(childLabels).toContain("Health & Wellbeing");
    expect(childLabels).toContain("Education & Learning");
    expect(childLabels).toContain("Financial Capability");
    expect(childLabels).toContain("Food & Basic Needs");
    expect(childLabels).toContain("Vulnerability & Protection");
    expect(childLabels).toContain("Youth Leadership");
    expect(childLabels).toContain("Vantage Point");
    const childHrefs = programmes!.children!.map((c) => c.href);
    expect(childHrefs).toContain(
      "/programmes/financial-capability-economic-opportunity",
    );
    expect(childHrefs).toContain("/programmes/vantage-point");
  });

  it("Stories dropdown exposes the canonical taxonomy", () => {
    const stories = site.nav.find((n) => n.label === "Stories & Insights");
    expect(stories?.children).toBeDefined();
    const childHrefs = stories!.children!.map((c) => c.href);
    expect(childHrefs).toContain("/stories");
    expect(childHrefs).toContain("/stories?category=field-story");
    expect(childHrefs).toContain("/stories?category=research");
    expect(childHrefs).toContain("/stories?category=news");
  });

  it("Impact dropdown includes ToC, Projects, Reports and no stale map anchor", () => {
    const impact = site.nav.find((n) => n.label === "Impact");
    const childHrefs = impact!.children!.map((c) => c.href);
    expect(childHrefs).toContain("/theory-of-change");
    expect(childHrefs).toContain("/projects");
    expect(childHrefs).toContain("/reports-and-accountability");
    expect(childHrefs).not.toContain("/impact#where-we-work");
  });

  it("Partner and Donate have no dropdown children", () => {
    const partner = site.nav.find((n) => n.label === "Partner");
    const donate = site.nav.find((n) => n.label === "Donate");
    expect(partner?.children).toBeUndefined();
    expect(donate?.children).toBeUndefined();
  });

  it("Donate is the last nav entry", () => {
    expect(site.nav[site.nav.length - 1].label).toBe("Donate");
  });

  it("does not include old nav items (Home, Gallery, Donors & Sponsors)", () => {
    const labels = site.nav.map((n) => n.label);
    expect(labels).not.toContain("Home");
    expect(labels).not.toContain("Gallery");
    expect(labels).not.toContain("Donors & Sponsors");
  });
});

describe("Site config", () => {
  it("uses the exact canonical production origin", () => {
    expect(site.url).toBe("https://www.vantagefoundationuganda.com");
  });

  it("has YouTube in socials", () => {
    expect(site.socials.youtube).toBeTruthy();
    expect(site.socials.youtube).toContain("youtube.com");
  });

  it("has consistent organisation name", () => {
    expect(site.name).toBe("Vantage Foundation Uganda");
    expect(site.legalName).toBe("Vantage Foundation Uganda Limited");
  });
});

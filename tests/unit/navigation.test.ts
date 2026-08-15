import { describe, it, expect } from "vitest";
import { site } from "@/content/site";

describe("Navigation structure", () => {
  it("has exactly 6 nav entries", () => {
    expect(site.nav).toHaveLength(6);
  });

  it("includes About, Programmes, Impact, Stories & Insights, Get Involved, and Donate", () => {
    const labels = site.nav.map((n) => n.label);
    expect(labels).toContain("About");
    expect(labels).toContain("Programmes");
    expect(labels).toContain("Impact");
    expect(labels).toContain("Stories & Insights");
    expect(labels).toContain("Get Involved");
    expect(labels).toContain("Donate");
  });

  it("About dropdown includes Our Story, Team, Governance, Reports, Contact", () => {
    const about = site.nav.find((n) => n.label === "About");
    expect(about?.children).toBeDefined();
    const childLabels = about!.children!.map((c) => c.label);
    expect(childLabels).toContain("Our Story");
    expect(childLabels).toContain("Team");
    expect(childLabels).toContain("Governance");
    expect(childLabels).toContain("Reports and Accountability");
    expect(childLabels).toContain("Contact");
  });

  it("Programmes dropdown includes 4 core programmes", () => {
    const programmes = site.nav.find((n) => n.label === "Programmes");
    expect(programmes?.children).toBeDefined();
    expect(programmes!.children).toHaveLength(4);
    const childLabels = programmes!.children!.map((c) => c.label);
    expect(childLabels).toContain("Vantage Care");
    expect(childLabels).toContain("KikumiKyo Academy");
    expect(childLabels).toContain("Humanitarian Assistance");
    expect(childLabels).toContain("Water, Sanitation and Hygiene");
  });

  it("Get Involved dropdown includes Donate, Volunteer, Partner, Sponsor, CSR", () => {
    const getInvolved = site.nav.find((n) => n.label === "Get Involved");
    expect(getInvolved?.children).toBeDefined();
    const childLabels = getInvolved!.children!.map((c) => c.label);
    expect(childLabels).toContain("Donate");
    expect(childLabels).toContain("Volunteer");
    expect(childLabels).toContain("Partner");
    expect(childLabels).toContain("Sponsor");
    expect(childLabels).toContain("Corporate Social Responsibility");
  });

  it("Stories and Donate have no dropdown children", () => {
    const stories = site.nav.find((n) => n.label === "Stories");
    const donate = site.nav.find((n) => n.label === "Donate");
    expect(stories?.children).toBeUndefined();
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

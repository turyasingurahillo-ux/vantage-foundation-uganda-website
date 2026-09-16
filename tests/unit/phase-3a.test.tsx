import { describe, it, expect, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  programmes,
  getPublishedProgrammes,
  getAllProgrammes,
  getProgrammeBySlug,
} from "@/content/programmes";

describe("Six-portfolio architecture: Youth Leadership & Participation", () => {
  it("programmes includes exactly six portfolios", () => {
    expect(programmes).toHaveLength(6);
  });

  it("includes youth-leadership-participation as a developing portfolio", () => {
    const programme = getProgrammeBySlug("youth-leadership-participation");
    expect(programme).toBeDefined();
    expect(programme?.title).toBe("Youth Leadership & Participation");
    expect(programme?.status).toBe("developing");
    expect(programme?.published).not.toBe(false);
    expect(programme?.summary).toBeTruthy();
    expect(programme?.whyThisMatters.body.length).toBeGreaterThan(0);
    expect(programme?.approach.body).toBeTruthy();
  });

  it("youth-leadership legacy slug maps to the new portfolio", () => {
    const programme = getProgrammeBySlug("youth-leadership-participation");
    expect(programme?.legacySlugs).toContain("youth-leadership");
  });

  it("does not publish a photo without consent clearance", () => {
    const programme = getProgrammeBySlug("youth-leadership-participation");
    expect(programme?.image).toBeUndefined();
  });

  it("does not claim fabricated results or learning", () => {
    const programme = getProgrammeBySlug("youth-leadership-participation");
    expect(programme?.results ?? []).toHaveLength(0);
    expect(programme?.learning ?? []).toHaveLength(0);
  });
});

describe("getPublishedProgrammes filtering", () => {
  const originalEnv = process.env.NODE_ENV;
  const env = process.env as Record<string, string | undefined>;

  afterEach(() => {
    env.NODE_ENV = originalEnv;
  });

  it("returns all six portfolios in production (all published)", () => {
    env.NODE_ENV = "production";
    const published = getPublishedProgrammes();
    expect(published).toHaveLength(6);
    expect(
      published.find((p) => p.slug === "youth-leadership-participation")
    ).toBeDefined();
  });

  it("returns all six in development", () => {
    env.NODE_ENV = "development";
    expect(getPublishedProgrammes()).toHaveLength(6);
  });

  it("published portfolios all have published !== false", () => {
    env.NODE_ENV = "production";
    for (const programme of getPublishedProgrammes()) {
      expect(programme.published).not.toBe(false);
    }
  });
});

describe("getAllProgrammes", () => {
  it("returns all portfolios regardless of published flag", () => {
    const all = getAllProgrammes();
    expect(all).toHaveLength(6);
    expect(
      all.find((p) => p.slug === "youth-leadership-participation")
    ).toBeDefined();
  });
});

describe("Phase 3A: global-not-found page", () => {
  it("renders a branded 404 with link home", async () => {
    // Dynamic import to avoid any module-level side effects
    const mod = await import("@/app/global-not-found");
    const { default: GlobalNotFound } = mod;

    const { container } = render(<GlobalNotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Page not found")).toBeInTheDocument();
    expect(
      screen.getByText(/The page you are looking for could not be found/)
    ).toBeInTheDocument();

    // Should have a link to home
    const link = container.querySelector("a");
    expect(link).not.toBeNull();
    expect(link?.getAttribute("href")).toBe("/");
  });

  it("exports noindex metadata", async () => {
    const mod = await import("@/app/global-not-found");
    expect(mod.metadata).toBeDefined();
    expect(mod.metadata.robots).toEqual({ index: false, follow: true });
  });
});

describe("Phase 3A: BreadcrumbList JSON-LD on listing pages", () => {
  it("buildBreadcrumbJsonLd produces correct structure for listing pages", async () => {
    const { buildBreadcrumbJsonLd } = await import("@/components/shared/JsonLd");
    const result = buildBreadcrumbJsonLd(
      [
        { label: "Home", url: "/" },
        { label: "Our Work", url: "/our-work" },
      ],
      "https://www.vantagefoundationuganda.com"
    );
    expect(result["@type"]).toBe("BreadcrumbList");
    expect(result.itemListElement).toHaveLength(2);
    expect(result.itemListElement[0].position).toBe(1);
    expect(result.itemListElement[0].name).toBe("Home");
    expect(result.itemListElement[0].item).toBe(
      "https://www.vantagefoundationuganda.com/"
    );
    expect(result.itemListElement[1].position).toBe(2);
    expect(result.itemListElement[1].name).toBe("Our Work");
    expect(result.itemListElement[1].item).toBe(
      "https://www.vantagefoundationuganda.com/our-work"
    );
  });
});

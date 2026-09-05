import { describe, it, expect, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  areasOfWork,
  getPublishedAreas,
  getAllAreas,
  projectCategoriesByAreaId,
} from "@/content/areas";

describe("Phase 3A: 5th programme pillar — Youth Leadership & Community Empowerment", () => {
  it("areasOfWork includes 5 areas (4 published + 1 draft)", () => {
    expect(areasOfWork).toHaveLength(5);
  });

  it("includes youth-leadership area with published: false", () => {
    const area = areasOfWork.find((a) => a.id === "youth-leadership");
    expect(area).toBeDefined();
    expect(area?.published).toBe(false);
    expect(area?.title).toBe("Youth Leadership & Community Empowerment");
    expect(area?.programmeName).toBe("Youth Leadership and Community Empowerment");
    expect(area?.summary).toBeTruthy();
    expect(area?.description).toBeTruthy();
    expect(area?.items.length).toBeGreaterThan(0);
    expect(area?.icon).toBeTruthy();
  });

  it("has a category mapping for youth-leadership", () => {
    expect(projectCategoriesByAreaId["youth-leadership"]).toBeDefined();
    expect(projectCategoriesByAreaId["youth-leadership"].length).toBeGreaterThan(0);
  });

  it("youth-leadership does not have an image (no consent-cleared photo yet)", () => {
    const area = areasOfWork.find((a) => a.id === "youth-leadership");
    expect(area?.image).toBeUndefined();
  });
});

describe("Phase 3A: getPublishedAreas filtering", () => {
  const originalEnv = process.env.NODE_ENV;
  const env = process.env as Record<string, string | undefined>;

  afterEach(() => {
    env.NODE_ENV = originalEnv;
  });

  it("excludes unpublished areas in production", () => {
    env.NODE_ENV = "production";
    const published = getPublishedAreas();
    expect(published).toHaveLength(4);
    expect(published.find((a) => a.id === "youth-leadership")).toBeUndefined();
  });

  it("includes all areas in development", () => {
    env.NODE_ENV = "development";
    const published = getPublishedAreas();
    expect(published).toHaveLength(5);
    expect(published.find((a) => a.id === "youth-leadership")).toBeDefined();
  });

  it("includes all areas when NODE_ENV is not production", () => {
    env.NODE_ENV = "test";
    const published = getPublishedAreas();
    expect(published).toHaveLength(5);
  });

  it("published areas all have published !== false", () => {
    env.NODE_ENV = "production";
    const published = getPublishedAreas();
    for (const area of published) {
      expect(area.published).not.toBe(false);
    }
  });
});

describe("Phase 3A: getAllAreas", () => {
  it("returns all areas regardless of published flag", () => {
    const all = getAllAreas();
    expect(all).toHaveLength(5);
    expect(all.find((a) => a.id === "youth-leadership")).toBeDefined();
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

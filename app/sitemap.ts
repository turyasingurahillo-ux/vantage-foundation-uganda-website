import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getProjectSlugs } from "@/content/projects";
import { getStorySlugs } from "@/content/stories";
import { getDbStorySlugs } from "@/lib/stories-public";
import { areasOfWork } from "@/content/areas";
import { getTeamSlugs } from "@/content/team";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = site.url;

  const staticRoutes = [
    "/",
    "/about-us",
    "/about-us/team",
    "/our-work",
    "/projects",
    "/impact",
    "/stories",
    "/gallery",
    "/get-involved",
    "/donors-and-sponsors",
    "/donate",
    "/contact",
    "/reports-and-accountability",
    "/faq",
    "/privacy",
    "/terms",
    "/safeguarding",
    "/accessibility",
  ];

  const routes: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "/" ? 1 : 0.8,
  }));

  const programmeRoutes = areasOfWork.map((area) => ({
    url: `${baseUrl}/programmes/${area.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const projectRoutes = getProjectSlugs().map((slug) => ({
    url: `${baseUrl}/projects/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const storySlugs = [...new Set([...getStorySlugs(), ...(await getDbStorySlugs())])];
  const storyRoutes = storySlugs.map((slug) => ({
    url: `${baseUrl}/stories/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const teamRoutes = getTeamSlugs().map((slug) => ({
    url: `${baseUrl}/about-us/team/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...routes,
    ...programmeRoutes,
    ...projectRoutes,
    ...storyRoutes,
    ...teamRoutes,
  ];
}

import { site } from "@/content/site";
import {
  getPublishedProjects,
  getProjectBySlug,
  getProjectSlugs,
} from "@/content/projects";
import {
  getPublishedStories,
  getStoryBySlug,
  getStorySlugs,
} from "@/content/stories";
import { programmes, getPublishedProgrammes } from "@/content/programmes";
import { vantagePoint } from "@/content/vantage-point";
import { getPublishedTeam } from "@/content/team";
import { getPublishedPartners } from "@/content/partners";
import {
  getPublishedImpactStats,
  outputs,
  outcomes,
  longTermGoals,
  regions,
  sdgs,
} from "@/content/impact";
import { getPublishedReports } from "@/content/reports";
import { faq } from "@/content/faq";

export const content = {
  site,
  programmes,
  getPublishedProgrammes,
  vantagePoint,
  projects: getPublishedProjects(),
  getProjectBySlug,
  getProjectSlugs,
  stories: getPublishedStories(),
  getStoryBySlug,
  getStorySlugs,
  team: getPublishedTeam(),
  partners: getPublishedPartners(),
  impact: {
    stats: getPublishedImpactStats(),
    outputs,
    outcomes,
    longTermGoals,
    regions,
    sdgs,
  },
  reports: getPublishedReports(),
  faq,
};

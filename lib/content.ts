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
import { areasOfWork } from "@/content/areas";
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
  areasOfWork,
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

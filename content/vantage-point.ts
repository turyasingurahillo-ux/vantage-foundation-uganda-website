import type { VantagePoint } from "@/types";

/**
 * Vantage Point — the cross-programme learning and dialogue platform.
 *
 * Structurally separate from the six programme portfolios: portfolios
 * answer "where does Vantage seek outcomes?", Vantage Point answers
 * "how does Vantage connect learning, dialogue, evidence and community
 * voice across them?". It lives at /programmes/vantage-point for IA
 * reasons but is never counted as a seventh portfolio.
 *
 * Status is honest: the platform is planned, and this page must not
 * pretend published research, completed dialogue series or measured
 * outcomes exist.
 */
export const vantagePoint: VantagePoint = {
  slug: "vantage-point",
  title: "Vantage Point",
  status: "planned",
  summary:
    "A cross-programme platform where learning, dialogue, evidence and community voice connect across everything Vantage does.",
  purpose:
    "Programmes produce knowledge in isolation: a medical camp learns something about trust, a book club learns something about motivation, a borehole learns something about ownership. Vantage Point exists to connect that learning — and the voices behind it — across the whole of Vantage's work, so insight in one portfolio changes practice in the others.",
  functions: [
    "Structured dialogue with communities and young people about what is working and what is not",
    "Community and youth voice as an input to programme design, not only an output of it",
    "Cross-programme reflection — what one portfolio learns informs the others",
    "Evidence generation and use: making claims, methods and limitations visible",
    "Knowledge exchange with the people and organisations in each portfolio's ecosystem",
  ],
  relationship:
    "Vantage Point is not a seventh portfolio. It runs across all six — Health & Wellbeing, Education & Learning, Financial Capability & Economic Opportunity, Food & Basic Needs, Humanitarian Vulnerability & Protection, and Youth Leadership & Participation — connecting what each one learns.",
  surfacing:
    "As the platform develops, learning and reflection generated through it will be published through Vantage's Stories & Insights and the reports and accountability pages — labelled so that observations, programme-team findings and verified evidence remain distinguishable.",
  cta: {
    label: "Partner with us",
    href: "/partner",
  },
};

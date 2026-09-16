import type { PartnershipOption, PartnershipType } from "@/types";

/**
 * The six partnership mechanisms defined by the Blueprint 2026 — ways an
 * institution, funder, researcher or professional can work with Vantage.
 * These are mechanisms, not programmes, not funding tiers and not
 * sponsorship packages.
 *
 * Only canonical, non-translated structure lives here (ids, programme
 * relationships, links). Visitor-facing titles, summaries and form prompts
 * are localized in `getPageContent().partner.mechanisms`.
 *
 * Honesty rules:
 * - `relevantProgrammeIds` signals natural fit, not that the portfolio is
 *   actively fundraising — the page copy says so.
 * - Vantage Point remains a cross-programme platform (planned), never a
 *   seventh portfolio.
 * - No mechanism implies an existing partnership, budget, equipment list,
 *   funding gap or research pipeline.
 */
export const partnershipOptions: PartnershipOption[] = [
  {
    id: "programme-funding",
    relevantProgrammeIds: [
      "health-wellbeing",
      "education-learning",
      "financial-capability-economic-opportunity",
      "food-basic-needs",
      "humanitarian-vulnerability-protection",
      "youth-leadership-participation",
    ],
    links: [
      { labelKey: "ourWork", href: "/our-work" },
      { labelKey: "impact", href: "/impact" },
    ],
  },
  {
    id: "evidence-learning",
    relevantProgrammeIds: [
      "health-wellbeing",
      "education-learning",
      "financial-capability-economic-opportunity",
      "food-basic-needs",
      "humanitarian-vulnerability-protection",
      "youth-leadership-participation",
    ],
    vantagePointRelevant: true,
    impactLearningRelevant: true,
    links: [
      { labelKey: "impact", href: "/impact" },
      { labelKey: "theoryOfChange", href: "/theory-of-change" },
    ],
  },
  {
    id: "technology-equipment",
    relevantProgrammeIds: [
      "education-learning",
      "financial-capability-economic-opportunity",
      "health-wellbeing",
    ],
    links: [{ labelKey: "ourWork", href: "/our-work" }],
  },
  {
    id: "research",
    vantagePointRelevant: true,
    impactLearningRelevant: true,
    links: [
      { labelKey: "impact", href: "/impact" },
      { labelKey: "vantagePoint", href: "/programmes/vantage-point" },
      { labelKey: "privacy", href: "/privacy" },
    ],
  },
  {
    id: "pro-bono",
    impactLearningRelevant: true,
    links: [{ labelKey: "ourWork", href: "/our-work" }],
  },
  {
    id: "referral-ecosystem",
    relevantProgrammeIds: [
      "health-wellbeing",
      "humanitarian-vulnerability-protection",
      "education-learning",
      "food-basic-needs",
    ],
    links: [
      { labelKey: "ourWork", href: "/our-work" },
      { labelKey: "safeguarding", href: "/safeguarding" },
    ],
  },
];

/** All six mechanism ids in blueprint order — used for validation. */
export const PARTNERSHIP_TYPE_VALUES = partnershipOptions.map(
  (o) => o.id,
) as [PartnershipType, ...PartnershipType[]];

export function getPartnershipOption(
  id: string,
): PartnershipOption | undefined {
  return partnershipOptions.find((o) => o.id === id);
}

export function isPartnershipType(value: unknown): value is PartnershipType {
  return (
    typeof value === "string" &&
    (PARTNERSHIP_TYPE_VALUES as string[]).includes(value)
  );
}

/**
 * Resolves a `?type=` query value to a valid mechanism id for deep-linking
 * the enquiry form, e.g. `/partner?type=research`.
 */
export function resolvePartnershipTypeFromQuery(
  value: string | undefined,
): PartnershipType | "" {
  if (!value) return "";
  return isPartnershipType(value) ? value : "";
}

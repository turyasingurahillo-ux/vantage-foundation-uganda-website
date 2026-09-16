import type {
  Programme,
  ProgrammeId,
  ProgrammeLearning,
  Project,
} from "@/types";
import { getPublishedProjects } from "@/content/projects";

/**
 * The six public programme portfolios (2026 blueprint architecture).
 * These replace the legacy `content/areas.ts` five-area structure.
 *
 * Honesty rules for this file:
 * - `results` may only contain figures with a declared `evidenceStatus` —
 *   never convert a target, estimate or anecdote into a "result".
 * - `learning` records what Vantage has actually observed in its own work —
 *   not generic sector principles.
 * - `actors` distinguish documented partners from broader ecosystem actors.
 * - `nextPriorities` are forward-looking and rendered as such.
 * - Absence is allowed: an omitted optional section renders as an honest
 *   empty/developing state on the programme page, not as invented maturity.
 *
 * Project relationships are canonical on the PROJECT (primaryProgramme /
 * relatedProgrammes) — they are derived here, never duplicated.
 */

export const programmes: Programme[] = [
  {
    slug: "health-wellbeing",
    title: "Health & Wellbeing",
    programmeName: "Vantage Care",
    status: "active",
    summary:
      "Our holistic health and wellbeing portfolio — medical camps, outreach, education and preventive care for underserved communities.",
    outcomeHeadline:
      "Young people and their communities can reach the healthcare and wellbeing support they need.",
    whyThisMatters: {
      body: [
        "Financial, geographic and social barriers keep essential health services out of reach for many of the communities Vantage works with. A health problem is rarely only a health problem: it interrupts schooling, drains household income, and — when it involves stigma around menstruation, mental health or reproductive health — can quietly exclude young people from education and public life altogether.",
        "Vantage treats health and wellbeing as foundational to every other outcome area, which is why this portfolio carries the Foundation's largest body of active work.",
      ],
    },
    approach: {
      body: "Vantage Care is the Foundation's holistic health and general wellbeing programme. It brings essential health services and information closer to communities — particularly those that face financial, geographical or social barriers to accessing care — through community-based outreach rather than expecting people to come to distant services.",
      items: [
        "Medical camps",
        "Community health outreach",
        "Health education",
        "Preventive healthcare activities",
        "Basic screening services",
        "Referrals to professional care",
      ],
    },
    results: [
      {
        value: "~500",
        label:
          "Young women and men reached through SaveGirl Uganda mentorship",
        evidenceStatus: "programme-team-figure",
        methodology:
          "Programme-team records of participants engaged through mentorship, distribution and follow-up contact since 2021.",
        sourceHref: "/projects/savegirl-uganda",
      },
      {
        value: ">80%",
        label: "Acceptability reported among menstrual-cup users",
        evidenceStatus: "programme-team-figure",
        methodology:
          "Follow-up tracking by the project team after hands-on training and distribution.",
        sourceHref: "/projects/menstrual-cups-project",
      },
    ],
    learning: [
      {
        title: "Follow-up matters more than the first distribution",
        body: "SaveGirl Uganda began as a one-off sanitary-pad distribution and was restructured into a mentorship programme because follow-up contact proved to be where lasting change happened. That observation now shapes how we design health outreach across the portfolio.",
        href: "/projects/savegirl-uganda",
      },
    ],
    actors: [
      {
        name: "The Cup Foundation",
        kind: "partner",
        note: "Donated UN-recommended Lunette menstrual cups and supported menstrual health training.",
      },
      {
        name: "Girl Power USA",
        kind: "partner",
        note: "US-based 501(c)(3) supporting the SaveGirl Uganda initiative since 2021.",
      },
      {
        name: "Local health workers and volunteer clinicians",
        kind: "ecosystem",
        note: "Medical camps run alongside the people communities already trust.",
      },
      {
        name: "Local health facilities",
        kind: "ecosystem",
        note: "Referral destinations for conditions requiring professional care.",
      },
    ],
    nextPriorities: [
      "Deepen preventive-health education alongside service delivery",
      "Strengthen referral pathways with local health facilities",
      "Continue menstrual-health work through mentorship rather than one-off distribution",
    ],
    cta: { label: "Partner with us", href: "/get-involved#partner" },
    icon: "heart-pulse",
    image: "/images/photos/community-health-camp-checkup.webp",
    imageAlt: "A community health camp checkup in Uganda.",
    legacySlugs: ["health"],
  },
  {
    slug: "education-learning",
    title: "Education & Learning",
    status: "active",
    summary:
      "Learning beyond the classroom — literacy, mentorship, self-development and the confidence to keep growing.",
    outcomeHeadline:
      "Young people build the knowledge and confidence to shape their own futures.",
    whyThisMatters: {
      body: [
        "Where formal education is interrupted or thin, young people do not only miss content — they miss the habits of learning, the exposure to ideas, and the mentorship that turns schooling into opportunity. An education gap quickly becomes an economic gap, and it narrows the choices young people believe are open to them.",
        "Vantage's learning work deliberately sits outside the classroom: reading circles, mentorship and practical life-skills sessions that meet young people where formal provision stops.",
      ],
    },
    approach: {
      body: "This portfolio centres on self-directed and peer learning. The Advantage Book Club gives young people access to influential self-development books rarely found in formal curricula, while mentorship sessions and workshops build the habits of reflection, discussion and goal-setting that make learning stick.",
      items: [
        "Reading circles and curated book access",
        "Mentorship and peer discussion",
        "Life-skills and career guidance",
        "Reflection and goal-setting practice",
      ],
    },
    learning: [
      {
        title: "Access matters as much as content",
        body: "The Advantage Book Club exists because young people's appetite for self-development material exceeds what their schools can provide — the constraint was access to the right books, not motivation.",
        href: "/projects/advantage-book-club",
      },
    ],
    actors: [
      {
        name: "Schools",
        kind: "ecosystem",
        note: "Host and refer participants for mentorship and reading sessions.",
      },
      {
        name: "Volunteer facilitators and book donors",
        kind: "ecosystem",
        note: "Sustain reading circles and mentorship sessions.",
      },
    ],
    nextPriorities: [
      "Broaden access to reading circles and mentorship",
      "Connect learning activities more deliberately to livelihood skills",
    ],
    cta: { label: "Partner with us", href: "/get-involved#partner" },
    icon: "graduation-cap",
    image: "/images/projects/advantage-book-club-mentorship-01.webp",
    imageAlt:
      "Young people sit together with books and notebooks during an Advantage Book Club reading and discussion session.",
    legacySlugs: [],
  },
  {
    slug: "financial-capability-economic-opportunity",
    title: "Financial Capability & Economic Opportunity",
    programmeName: "KikumiKyo Academy",
    status: "active",
    summary:
      "Financial literacy and economic empowerment for young people — run in partnership with the fintech company KikumiKyo.",
    outcomeHeadline:
      "Young people understand money well enough to make informed decisions about it.",
    whyThisMatters: {
      body: [
        "Many young people reach adulthood without ever being taught how money works — how to save, budget, borrow responsibly or read a financial product. That gap does not stay contained: it shows up as vulnerability to exploitative lending, missed opportunity to invest early, and households that stay one emergency away from crisis.",
        "Financial capability is also where Vantage's other portfolios meet economic reality: a health intervention lands differently when a family can plan for the cost of care.",
      ],
    },
    approach: {
      body: "KikumiKyo Academy is the Foundation's financial literacy and economic empowerment programme, implemented in partnership with the fintech company KikumiKyo. It builds practical understanding of money — saving, budgeting, investing, record-keeping, managing financial groups and responsible borrowing — and challenges the myths that keep young people from starting early and starting small. Learning and mentorship continue through the KikumiKyo digital platform and related financial-learning communities.",
      items: [
        "Saving and budgeting",
        "Investing fundamentals",
        "Financial record-keeping",
        "Financial group management",
        "Responsible borrowing",
        "Ongoing mentorship via the KikumiKyo platform",
      ],
    },
    actors: [
      {
        name: "KikumiKyo",
        kind: "partner",
        note: "Fintech company partnering on KikumiKyo Academy and its online learning platform.",
      },
    ],
    nextPriorities: [
      "Deepen mentorship through the KikumiKyo digital platform",
      "Connect financial literacy more closely to young people's livelihood pathways",
    ],
    cta: { label: "Partner with us", href: "/get-involved#partner" },
    externalPlatformLink: {
      label: "Explore the KikumiKyo Academy online",
      href: "https://kikumikyo.com/learn",
      description:
        "Browse free, Uganda-relevant financial education articles on saving, budgeting, SACCOs, loans and digital money safety — the online learning companion to this programme.",
    },
    icon: "graduation-cap",
    image: "/images/photos/photo-011.webp",
    imageAlt:
      "A young woman in a yellow t-shirt and headscarf speaks into a microphone at an indoor conference, with a \"Financial Literacy & Career Education\" banner in the background.",
    legacySlugs: ["education"],
  },
  {
    slug: "food-basic-needs",
    title: "Food & Basic Needs",
    status: "active",
    summary:
      "The material essentials communities depend on — safe water infrastructure, food and household essentials.",
    outcomeHeadline:
      "Households can rely on the essentials: safe water, food and daily needs.",
    whyThisMatters: {
      body: [
        "Nothing else in Vantage's model works when the basics are missing. Unsafe water carries illness into health outcomes, pulls children — especially girls — out of school for collection, and consumes household time and money that could go to livelihoods.",
        "This portfolio covers the material side of a decent life: the water infrastructure and essential-supplies work that every other outcome quietly depends on.",
      ],
    },
    approach: {
      body: "Vantage works with communities on lasting water, sanitation and hygiene infrastructure and on the essential-supplies support that stabilises households. The emphasis is on interventions built with — and maintained by — the communities that use them, not infrastructure that arrives and is abandoned.",
      items: [
        "Deep water well construction",
        "Community boreholes",
        "Hygiene education",
        "Sanitation support",
        "WASH in schools",
        "Essential household supplies",
      ],
    },
    results: [
      {
        value: "Up to 10,000",
        label:
          "Estimated catchment of the Kasaale deep borehole — not a beneficiary count",
        evidenceStatus: "estimated-catchment",
        methodology:
          "Engineering and community catchment estimate for the borehole constructed in Kasaale, Magada Sub-county, Namutumba District (completed May 2025).",
        sourceHref: "/projects/kasaale-deep-borehole",
        asOf: "2025-05",
      },
    ],
    learning: [
      {
        title: "Community ownership decides whether infrastructure lasts",
        body: "The Kasaale borehole was constructed in partnership with the local community rather than for it — because infrastructure only serves its catchment while the community that depends on it maintains it.",
        href: "/projects/kasaale-deep-borehole",
      },
    ],
    actors: [
      {
        name: "Local government and district water authorities",
        kind: "ecosystem",
        note: "Public systems that water infrastructure must connect to and outlast within.",
      },
      {
        name: "Host communities",
        kind: "ecosystem",
        note: "Co-build and maintain water infrastructure.",
      },
    ],
    nextPriorities: [
      "Maintain and follow up completed water infrastructure",
      "Continue hygiene education alongside infrastructure work",
    ],
    cta: { label: "Partner with us", href: "/get-involved#partner" },
    icon: "droplets",
    image: "/images/photos/photo-012.webp",
    imageAlt:
      "A group of men and boys gather around a newly installed hand-pump borehole with a concrete apron and drainage channel in a rural setting.",
    legacySlugs: ["water"],
  },
  {
    slug: "humanitarian-vulnerability-protection",
    title: "Humanitarian Vulnerability & Protection",
    programmeName: "Humanitarian Assistance",
    status: "active",
    summary:
      "Emergency and household support, food, essential supplies and care for vulnerable children and families.",
    outcomeHeadline:
      "The most vulnerable children and families are not left without support.",
    whyThisMatters: {
      body: [
        "Orphaned and street-connected children, isolated communities and households in crisis sit outside most systems of support — and vulnerability compounds. A child without reliable food or shelter faces every other barrier at once: health, schooling, safety and dignity.",
        "Protection work is also where safeguarding matters most. Vantage treats the safety and dignity of the people it supports as part of the intervention itself, not an administrative afterthought.",
      ],
    },
    approach: {
      body: "The Foundation provides essential nutrition, clothing, household support and relief to orphans, women and communities in crisis. The work is disability-inclusive, centred on dignity, and — critically — shaped by needs assessments and the actual needs communities express rather than assumptions made from a distance.",
      items: [
        "Emergency and household support",
        "Food and essential supplies",
        "Support for vulnerable children",
        "Disability-inclusive assistance",
        "Community relief initiatives",
        "Needs assessments and follow-up visits",
      ],
    },
    results: [
      {
        value: "4",
        label: "Orphanages supported with food and essential supplies",
        evidenceStatus: "programme-team-figure",
        methodology:
          "Programme-team records of orphanages receiving donations and follow-up visits.",
        sourceHref: "/projects/orphanage-relief",
      },
    ],
    learning: [
      {
        title: "Expressed needs beat assumed needs",
        body: "Relief work is led by what communities actually ask for. Needs assessments and follow-up visits — not the donation itself — are what keep the support relevant.",
        href: "/projects/orphanage-relief",
      },
    ],
    actors: [
      {
        name: "S.A.L.V.E. International",
        kind: "partner",
        note: "Jinja-based charity supporting street-connected children; Vantage has donated food and essential supplies to children in their care.",
      },
      {
        name: "Local orphanages and care homes",
        kind: "ecosystem",
        note: "Care settings where donations are directed.",
      },
      {
        name: "Community volunteers",
        kind: "ecosystem",
        note: "Mobilise and carry out distribution.",
      },
    ],
    nextPriorities: [
      "Complete and publish the safeguarding framework that governs this work",
      "Strengthen needs assessment and follow-up across relief interventions",
    ],
    cta: { label: "Partner with us", href: "/get-involved#partner" },
    icon: "hand-heart",
    image: "/images/photos/photo-003.webp",
    imageAlt:
      "Volunteers and community members unload supplies from a pickup truck loaded with boxes of food and hygiene products outside two houses.",
    legacySlugs: ["humanitarian"],
  },
  {
    slug: "youth-leadership-participation",
    title: "Youth Leadership & Participation",
    status: "developing",
    summary:
      "Developing young leaders through mentorship, civic engagement and community-driven initiatives that build agency.",
    outcomeHeadline:
      "Young people lead the change their communities need — not just receive it.",
    whyThisMatters: {
      body: [
        "Vantage is a youth-led organisation working with young people — leadership and participation are not a theme bolted onto the work; they are how the organisation itself came to exist. When young people shape the interventions aimed at them, programmes land differently.",
        "This portfolio is still developing. Vantage's mentorship, youth conference and community-service activities sit here conceptually, and the portfolio will grow as that work is formalised — we are publishing the direction honestly rather than inventing a track record.",
      ],
    },
    approach: {
      body: "The portfolio brings together the leadership-development thread that runs through Vantage's other work — mentorship, youth conferences, community service and civic engagement — and gives it a home of its own. It is designed to complement the other five portfolios by ensuring that every intervention also invests in the agency of the young people it reaches.",
      items: [
        "Youth mentorship",
        "Conferences and workshops",
        "Community service initiatives",
        "Civic engagement",
      ],
    },
    actors: [
      {
        name: "Schools and youth groups",
        kind: "ecosystem",
        note: "Where leadership and participation activities take place.",
      },
      {
        name: "Community leaders",
        kind: "ecosystem",
        note: "Connect youth initiatives to community priorities.",
      },
    ],
    nextPriorities: [
      "Formalise the portfolio's activities and partnerships",
      "Connect youth voice into programme design through Vantage Point",
    ],
    cta: { label: "Partner with us", href: "/get-involved#partner" },
    icon: "users",
    // No consent-cleared photo yet — deliberately no image until one passes
    // safeguarding review (docs/safeguarding-and-consent.md).
    legacySlugs: ["youth-leadership"],
  },
];

/** The six portfolio ids in display order — single source for "exactly six". */
export const PROGRAMME_IDS = programmes.map((p) => p.slug) as ProgrammeId[];

/** Published portfolios — in production, `published: false` entries are hidden. */
export function getPublishedProgrammes(): Programme[] {
  if (process.env.NODE_ENV === "production") {
    return programmes.filter((p) => p.published !== false);
  }
  return programmes;
}

export function getAllProgrammes(): Programme[] {
  return programmes;
}

export function getProgrammeBySlug(slug: string): Programme | undefined {
  return programmes.find((p) => p.slug === slug);
}

/**
 * Every published project that belongs to a portfolio — primary plus
 * related — without duplicating the relationship on the programme.
 */
export function getProgrammeProjects(slug: ProgrammeId): Project[] {
  return getPublishedProjects().filter(
    (p) =>
      p.primaryProgramme === slug || (p.relatedProgrammes ?? []).includes(slug),
  );
}

/**
 * All published programme learnings, flattened with their source
 * portfolio for attribution — the org-level "what we are learning" view
 * consumed by the Impact & Learning hub.
 */
export function getAllProgrammeLearning(): {
  programme: Programme;
  learning: ProgrammeLearning;
}[] {
  return getPublishedProgrammes().flatMap((programme) =>
    (programme.learning ?? []).map((learning) => ({ programme, learning })),
  );
}

/**
 * Legacy `/programmes/{id}` slugs that redirect to a current portfolio.
 * Kept for media-tag lookups and documentation; the HTTP redirects
 * themselves live in next.config.ts.
 */
export const legacyProgrammeSlugs: Record<string, ProgrammeId> =
  Object.fromEntries(
    programmes.flatMap((p) =>
      (p.legacySlugs ?? []).map((legacy) => [legacy, p.slug] as const),
    ),
  );

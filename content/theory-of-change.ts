import type { TheoryOfChange } from "@/types";

/**
 * Vantage Foundation Uganda — public organizational Theory of Change.
 *
 * Honesty rules for this file:
 * - This is organizational logic, not measured evidence. Layers describe
 *   what Vantage seeks and expects — "we expect", "we work toward" —
 *   never "we have proven" or "this causes".
 * - Assumptions are exposed as assumptions. They are not evidence and
 *   must not be softened into claims.
 * - External actors are ecosystem dependencies unless content/partners.ts
 *   documents a relationship — only those use kind: "partner".
 * - The learning loop describes intended discipline, not an existing
 *   formal evaluation system.
 */
export const theoryOfChange: TheoryOfChange = {
  statement: [
    "Young people's outcomes are interconnected. A health barrier is also an education barrier; a missing essential like safe water undermines schooling, health and livelihoods at once; and vulnerability compounds across every domain at the same time.",
    "Vantage's theory of change is that connected problems need connected interventions. We work across six programme portfolios — health and wellbeing, education and learning, financial capability and economic opportunity, food and basic needs, humanitarian vulnerability and protection, and youth leadership and participation — so that progress in one area is not undone by absence in another.",
    "We seek outcomes we can observe and describe honestly: what was delivered, who was reached, what changed, and where the limits of our evidence lie. Vantage Point, our cross-programme learning platform, exists to connect what each portfolio learns to the others.",
  ],
  layers: [
    {
      kind: "context",
      title: "Context & problems",
      description:
        "The starting conditions Vantage works within — the interconnected barriers young people and their communities face in the places we serve.",
      items: [
        "Essential health services are out of reach for many communities — financially, geographically and socially",
        "Interrupted or thin formal education leaves young people without habits of learning, exposure to ideas, or mentorship",
        "Young people reach adulthood without practical financial capability — saving, budgeting, borrowing responsibly",
        "Missing material essentials — safe water, food, household supplies — quietly undermines every other outcome",
        "Orphaned, street-connected and crisis-affected children and families sit outside most systems of support",
        "Young people are rarely positioned to shape the interventions aimed at them",
      ],
    },
    {
      kind: "interventions",
      title: "What Vantage does",
      description:
        "The approaches Vantage takes across its six programme portfolios — community-based, shaped by expressed need, and connected rather than isolated.",
      items: [
        "Medical camps, community health outreach, health education and referrals (Health & Wellbeing)",
        "Reading circles, mentorship and life-skills development (Education & Learning)",
        "Financial literacy and economic empowerment through KikumiKyo Academy (Financial Capability)",
        "Water, sanitation and essential-supplies work built with communities (Food & Basic Needs)",
        "Needs-assessed relief and support for vulnerable children and families (Humanitarian Vulnerability & Protection)",
        "Youth mentorship, conferences and community-service leadership (Youth Leadership & Participation)",
        "Vantage Point connects learning, dialogue and community voice across all six portfolios",
      ],
    },
    {
      kind: "intermediate",
      title: "Intermediate outcomes we seek",
      description:
        "The nearer-term changes we expect our interventions to contribute to — observable shifts that sit between activity and lasting change.",
      items: [
        "Communities reach health services and information they could not previously access",
        "Young people build habits of reading, reflection and goal-setting",
        "Young people understand money well enough to make informed decisions about it",
        "Households can rely on essentials — safe water, food, daily needs",
        "Vulnerable children and families are not left without support",
        "Young people participate in — and begin to lead — change in their communities",
      ],
    },
    {
      kind: "longTerm",
      title: "Longer-term outcomes we work toward",
      description:
        "The durable change Vantage exists to contribute to — held as organizational intent, not claimed as achieved results.",
      items: [
        "Young people and communities enjoy better health and wellbeing",
        "Sustained learning widens the choices young people believe are open to them",
        "Economic opportunity becomes reachable, not abstract",
        "Stable households can invest in the futures of their young people",
        "Protection systems — community and institutional — reach the most vulnerable",
        "Communities are shaped by the agency of their young people, not only for them",
      ],
    },
  ],
  assumptions: [
    {
      title: "Communities participate and co-own",
      body: "Our approach assumes communities want, shape and help sustain the interventions aimed at them. The Kasaale borehole's community co-construction is why we hold this assumption explicitly: infrastructure and programmes only outlast the moment of delivery when ownership is shared.",
    },
    {
      title: "Referral destinations exist",
      body: "Medical camps and screening only translate into care when local health facilities and professionals can receive referrals. We assume — and depend on — functioning public health systems that we do not control.",
    },
    {
      title: "Institutions cooperate",
      body: "Schools host reading circles and mentorship; district authorities connect and maintain water infrastructure; care homes receive and use donations appropriately. Our interventions assume this cooperation continues.",
    },
    {
      title: "Young people engage voluntarily",
      body: "Mentorship, book clubs and leadership activities assume sustained, voluntary youth participation — which depends on the activities remaining relevant and accessible to them.",
    },
    {
      title: "A small organization has real limits",
      body: "Vantage is a youth-led organization with limited implementation capacity. Our theory of change assumes we can grow capacity and partnerships faster than needs grow — an assumption we watch rather than take for granted.",
    },
    {
      title: "Wider conditions remain navigable",
      body: "Economic conditions, public health infrastructure, education provision and community stability are outside our control. We assume they remain sufficiently stable for community-level interventions to matter — and adapt when they do not.",
    },
  ],
  externalActors: [
    {
      name: "Communities and young people",
      kind: "ecosystem",
      note: "The participants and co-owners every intervention depends on.",
    },
    {
      name: "Families and caregivers",
      kind: "ecosystem",
      note: "Shape whether participation and learning persist beyond our sessions.",
    },
    {
      name: "Schools",
      kind: "ecosystem",
      note: "Host sessions and refer participants for mentorship and reading circles.",
    },
    {
      name: "Health facilities and local health workers",
      kind: "ecosystem",
      note: "Referral destinations that turn screening and outreach into care.",
    },
    {
      name: "Local government and district authorities",
      kind: "ecosystem",
      note: "Public systems water and community infrastructure must connect to and outlast within.",
    },
    {
      name: "Orphanages and care homes",
      kind: "ecosystem",
      note: "Care settings where relief and essential-supplies support is directed.",
    },
    {
      name: "Civil society and community volunteers",
      kind: "ecosystem",
      note: "Mobilise, carry out and sustain distribution, facilitation and follow-up.",
    },
    {
      name: "Documented partners",
      kind: "partner",
      note: "KikumiKyo, The Cup Foundation, Girl Power USA and S.A.L.V.E. International — relationships documented in our published partner register.",
    },
    {
      name: "Funders and institutional partners",
      kind: "ecosystem",
      note: "The resourcing on which implementation capacity depends.",
    },
  ],
  measurement: [
    {
      kind: "output",
      title: "Outputs",
      body: "What was delivered: camps held, mentorship sessions run, supplies distributed, infrastructure constructed. Outputs describe activity, not change.",
      example: "Medical camps and outreach sessions delivered under Vantage Care.",
    },
    {
      kind: "reach",
      title: "Reach",
      body: "Who or what was reached through a programme-team-recorded activity. Reach figures are only published with their evidence status and methodology — and are not the same as people whose lives changed.",
      example: "About 500 young women and men engaged through SaveGirl Uganda mentorship (programme-team figure).",
    },
    {
      kind: "outcome",
      title: "Outcomes",
      body: "What actually changed for the people an intervention served. Outcomes are the hardest thing to measure honestly — where we have only output or reach data, we say so.",
      example: "Over 80% acceptability among menstrual-cup users after hands-on training (programme-team figure).",
    },
    {
      kind: "catchment",
      title: "Context & catchment",
      body: "The population that could potentially benefit — the people living within an intervention's service area. A catchment estimate is never presented as a count of people served.",
      example: "The Kasaale deep borehole sits within an estimated catchment of up to 10,000 people (estimated catchment).",
    },
    {
      kind: "target",
      title: "Targets",
      body: "What Vantage intends to achieve. Targets are forward-looking — they appear labelled as planned and are never rendered as results.",
      example: "Portfolio next priorities published on each programme page.",
    },
  ],
  learningLoop: [
    "Implement — deliver the intervention with the community it serves.",
    "Observe and record — keep programme-team records of what was delivered and who was reached, labelled with honest evidence status.",
    "Learn — notice what worked, what did not, and what surprised us; record it where it can be inspected.",
    "Adapt — let evidence and learning change how programmes are designed next, rather than repeating what is comfortable.",
  ],
};

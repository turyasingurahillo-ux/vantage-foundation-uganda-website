import { Locale } from "@/lib/i18n/config";
import type { EvidenceStatus } from "@/types";
import { UiContent, uiContent } from "./ui";

export interface BrandGuideContent {
  title: string;
  description: string;
  eyebrow: string;
  heroTitle: string;
  heroDescription: string;
  navAriaLabel: string;
  nav: {
    foundations: string;
    logo: string;
    colour: string;
    typography: string;
    components: string;
    programme: string;
    icons: string;
    photography: string;
    accessibility: string;
    downloads: string;
  };
  sections: {
    foundations: {
      eyebrow: string;
      title: string;
      mission: string;
      vision: string;
      personality: string;
      coreValues: string;
    };
    logo: {
      eyebrow: string;
      title: string;
      lede: string;
      primary: string;
      horizontal: string;
      symbol: string;
      clearSpace: string;
      minSizes: string;
      digital: string;
      print: string;
      favicon: string;
      misuse: string;
      primaryAlt: string;
      horizontalAlt: string;
      symbolAlt: string;
    };
    colour: {
      eyebrow: string;
      title: string;
      lede: string;
      primaryPalette: string;
      accessiblePairings: string;
      warning: string;
    };
    typography: {
      eyebrow: string;
      title: string;
      lede: string;
    };
    components: {
      eyebrow: string;
      title: string;
      buttons: string;
      badges: string;
      cards: string;
      onDark: string;
    };
    programme: {
      eyebrow: string;
      title: string;
      lede: string;
    };
    iconography: {
      eyebrow: string;
      title: string;
      lede: string;
    };
    photography: {
      eyebrow: string;
      title: string;
      lede: string;
      cropPresets: string;
    };
    accessibility: {
      eyebrow: string;
      title: string;
      lede: string;
    };
    downloads: {
      eyebrow: string;
      title: string;
      lede: string;
      fullDocs: string;
    };
  };
}

export interface PageContent {
  common: {
    viewProject: string;
    readFullBio: string;
    readStory: string;
    viewStory: string;
    viewTeamMember: string;
    seeDetails: string;
    viewGallery: string;
    downloadReport: string;
    minRead: string;
    viewEvidence: string;
    programme: string;
    placeAndPeriod: string;
    howCounted: string;
    evidenceStatus: Record<EvidenceStatus, string>;
    search: string;
    searchProjectsPlaceholder: string;
    searchStoriesPlaceholder: string;
    all: string;
    filterByCategory: string;
    filterByStatus: string;
    noProjectsMatch: string;
    noStoriesMatch: string;
    about: string;
    aboutUs: string;
    donate: string;
    volunteer: string;
    partnerWithUs: string;
    contactVantage: string;
    visitProgrammes: string;
    donateNow: string;
    updated: string;
    published: string;
    readTime: string;
    takeAction: string;
    browseAllStories: string;
    browseAllProjects: string;
    moreStories: string;
    filter: string;
    openInNew: string;
    share: string;
    copyLink: string;
    copied: string;
    backTo: string;
    close: string;
    breadcrumb: string;
    viewAllProgrammes: string;
    status: string;
    flagship: string;
    sources: string;
    email: string;
    linkedIn: string;
    home: string;
    shareOn: string;
  };
  ourWork: {
    title: string;
    description: string;
    programmeSuffix: string;
    relatedProjects: string;
    projectCount: string;
    developingNote: string;
  };
  projects: {
    eyebrow: string;
    title: string;
    description: string;
    viewAll: string;
    searchPlaceholder: string;
    filterCategoryLabel: string;
    filterStatusLabel: string;
    noResults: string;
    statusActive: string;
    statusCompleted: string;
    statusPlanned: string;
  };
  programme: {
    aboutTitle: string;
    whatWeDo: string;
    getInvolved: string;
    donateToProgramme: string;
    volunteerWithUs: string;
    visitPlatform: string;
    projectsIn: string;
    storiesFrom: string;
    photosFrom: string;
    exploreOther: string;
    workAcross: string;
    viewAllProgrammes: string;
    portfolioEyebrow: string;
    whyThisMatters: string;
    ourApproach: string;
    resultsTitle: string;
    resultsEmpty: string;
    learningTitle: string;
    partnersTitle: string;
    partnersLabel: string;
    ecosystemLabel: string;
    nextPrioritiesTitle: string;
    nextPrioritiesNote: string;
    statusActive: string;
    statusDeveloping: string;
    statusPilot: string;
    statusPlanned: string;
    asOf: string;
    readEvidenceCta: string;
  };
  vantagePoint: {
    platformEyebrow: string;
    purposeTitle: string;
    functionsTitle: string;
    relationshipTitle: string;
    learnMore: string;
    ctaNote: string;
  };
  project: {
    whyItMatters: string;
    whatWeDid: string;
    impact: string;
    gallery: string;
    partners: string;
    atAGlance: string;
    location: string;
    timeline: string;
    beneficiaries: string;
    funding: string;
    programmes: string;
    themes: string;
    whoBenefits: string;
    sdgs: string;
    supportProject: string;
    relatedProjects: string;
    backToProjects: string;
    status: string;
    statusActive: string;
    statusCompleted: string;
    statusPlanned: string;
  };
  impact: {
    title: string;
    description: string;
    fromOutputs: string;
    outputsToLongTerm: string;
    geographicReach: string;
    geographicDescription: string;
    sdgsTitle: string;
    sdgDescription: string;
    monitoring: string;
    quantitative: string;
    qualitative: string;
    projectsBehind: string;
    viewAllProjects: string;
    disclaimer: string;
    outputBadge: string;
    outputDescription: string;
    outcomeBadge: string;
    outcomeDescription: string;
    longTermBadge: string;
    longTermDescription: string;
    // Impact & Learning hub (PR-4)
    frameworkTitle: string;
    frameworkDescription: string;
    readEvidenceTitle: string;
    readEvidenceDescription: string;
    evidenceDefinitions: Record<EvidenceStatus, string>;
    tocFeatureTitle: string;
    tocFeatureDescription: string;
    tocFeatureCta: string;
    learningTitle: string;
    learningDescription: string;
    learningFrom: string;
    evidenceLibraryTitle: string;
    evidenceLibraryDescription: string;
    evidenceLibraryEmpty: string;
    reportsTitle: string;
    reportsDescription: string;
    reportsCta: string;
    policiesTitle: string;
    policiesDescription: string;
    vantagePointTitle: string;
    vantagePointDescription: string;
    vantagePointCta: string;
    ctaTitle: string;
    ctaDescription: string;
  };
  toc: {
    title: string;
    description: string;
    statementHeading: string;
    assumptionsTitle: string;
    assumptionsDescription: string;
    actorsTitle: string;
    actorsDescription: string;
    measurementTitle: string;
    measurementDescription: string;
    learningLoopTitle: string;
    learningLoopDescription: string;
    limitationsTitle: string;
    limitationsBody: string;
    inPracticeTitle: string;
    viewProgrammes: string;
    viewImpact: string;
    viewVantagePoint: string;
  };
  stories: {
    title: string;
    description: string;
    featured: string;
    searchPlaceholder: string;
    filterCategoryLabel: string;
    noResults: string;
  };
  story: {
    updated: string;
    readTime: string;
    takeAction: string;
    ctaDescription: string;
    moreStories: string;
    relatedProjects: string;
    share: string;
    copyLink: string;
    copied: string;
    aboutTheAuthor: string;
    originalLanguageNotice: string;
  };
  team: {
    title: string;
    description: string;
    executive: string;
    executiveDescription: string;
    volunteers: string;
    volunteersDescription: string;
    joinTitle: string;
    joinDescription: string;
    volunteerCta: string;
    partnerCta: string;
    donateCta: string;
    meetRest: string;
    supportWork: string;
  };
  teamMember: {
    backToTeam: string;
    role: string;
    email: string;
    linkedIn: string;
    support: string;
    volunteer: string;
    donate: string;
  };
  gallery: {
    title: string;
    description: string;
  };
  reports: {
    title: string;
    description: string;
    approvedReports: string;
    approvedDescription: string;
    publicationStatus: string;
    publicationDescription: string;
    policies: string;
    policiesDescription: string;
    requestInfo: string;
    requestDescription: string;
    contactUs: string;
    download: string;
    emptyStatus: string;
    annualReports: string;
    annualReportsDescription: string;
    financialReports: string;
    financialReportsDescription: string;
    projectReports: string;
    projectReportsDescription: string;
    safeguarding: string;
    safeguardingDescription: string;
    governance: string;
    governanceDescription: string;
    monitoring: string;
    monitoringDescription: string;
    projectReportsStatus: string;
    monitoringStatus: string;
  };
  legal: {
    privacy: string;
    terms: string;
    safeguarding: string;
    accessibility: string;
    notTranslatedNotice: string;
  };
  brand: {
    title: string;
    description: string;
    logo: string;
    colours: string;
    typography: string;
    imagery: string;
    usage: string;
    contact: string;
  };
  brandGuide: BrandGuideContent;
  ui: UiContent;
  footer: {
    vantageCare: string;
    kikumiKyoAcademy: string;
  };
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

function mergeWithEnglish(
  partial: DeepPartial<PageContent>,
  english: PageContent,
): PageContent {
  return {
    common: {
      ...english.common,
      ...partial.common,
      evidenceStatus: {
        ...english.common.evidenceStatus,
        ...partial.common?.evidenceStatus,
      },
    },
    ourWork: { ...english.ourWork, ...partial.ourWork },
    projects: { ...english.projects, ...partial.projects },
    programme: { ...english.programme, ...partial.programme },
    vantagePoint: { ...english.vantagePoint, ...partial.vantagePoint },
    project: { ...english.project, ...partial.project },
    impact: {
      ...english.impact,
      ...partial.impact,
      evidenceDefinitions: {
        ...english.impact.evidenceDefinitions,
        ...partial.impact?.evidenceDefinitions,
      },
    },
    toc: { ...english.toc, ...partial.toc },
    stories: { ...english.stories, ...partial.stories },
    story: { ...english.story, ...partial.story },
    team: { ...english.team, ...partial.team },
    teamMember: { ...english.teamMember, ...partial.teamMember },
    gallery: { ...english.gallery, ...partial.gallery },
    reports: { ...english.reports, ...partial.reports },
    legal: { ...english.legal, ...partial.legal },
    brand: { ...english.brand, ...partial.brand },
    brandGuide: { ...english.brandGuide, ...partial.brandGuide } as BrandGuideContent,
    ui: { ...english.ui, ...partial.ui } as UiContent,
    footer: { ...english.footer, ...partial.footer },
  };
}

const englishPageContent: PageContent = {
  common: {
    viewProject: "View the project",
    readFullBio: "Read full bio",
    readStory: "Read the story",
    viewStory: "Read the story",
    viewTeamMember: "View profile",
    seeDetails: "See details",
    viewGallery: "View gallery",
    downloadReport: "Download",
    minRead: "{minutes} min read",
    viewEvidence: "View project evidence",
    programme: "Programme",
    placeAndPeriod: "Place and period",
    howCounted: "How it was counted",
    evidenceStatus: {
      "verified": "Verified",
      "programme-team-figure": "Programme-team figure",
      "estimated-catchment": "Estimated catchment",
      "pilot": "Pilot / early finding",
      "planned": "Planned / target",
      "external-evidence": "External evidence",
    },
    search: "Search",
    searchProjectsPlaceholder: "Search projects...",
    searchStoriesPlaceholder: "Search stories and insights...",
    all: "All",
    filterByCategory: "Filter by category",
    filterByStatus: "Filter by status",
    noProjectsMatch: "No projects match your filters.",
    noStoriesMatch: "No stories match your filters.",
    about: "about",
    aboutUs: "About us",
    donate: "Donate",
    volunteer: "Volunteer",
    partnerWithUs: "Partner with us",
    contactVantage: "Contact Vantage",
    visitProgrammes: "Visit programmes",
    donateNow: "Donate now",
    updated: "Updated {date}",
    published: "Published {date}",
    readTime: "Read time",
    takeAction: "Take action",
    browseAllStories: "Browse all stories",
    browseAllProjects: "Browse all projects",
    moreStories: "More stories & insights",
    filter: "Filter:",
    openInNew: "Opens in a new tab",
    share: "Share",
    copyLink: "Copy link",
    copied: "Copied",
    backTo: "Back to",
    close: "Close",
    breadcrumb: "Breadcrumb",
    viewAllProgrammes: "View all programmes",
    status: "Status",
    flagship: "Flagship",
    sources: "Sources",
    email: "Email",
    linkedIn: "LinkedIn",
    home: "Home",
    shareOn: "Share on",
  },
  ourWork: {
    title: "Our work",
    description:
      "Six connected programme portfolios, designed around the realities communities face — plus Vantage Point, the platform that connects learning across all of them.",
    programmeSuffix: "Programme",
    relatedProjects: "Related projects",
    projectCount: "{count} projects",
    developingNote: "Developing portfolio — direction published, work formalising",
  },
  projects: {
    eyebrow: "Projects",
    title: "Featured projects",
    description:
      "A snapshot of our work in clean water, menstrual health, mentorship and education.",
    viewAll: "View All Projects",
    searchPlaceholder: "Search projects...",
    filterCategoryLabel: "Filter by category",
    filterStatusLabel: "Filter by status",
    noResults: "No projects match your filters.",
    statusActive: "Active",
    statusCompleted: "Completed",
    statusPlanned: "Planned",
  },
  programme: {
    aboutTitle: "About this programme",
    whatWeDo: "What we do",
    getInvolved: "Get involved",
    donateToProgramme: "Donate to this programme",
    volunteerWithUs: "Volunteer with us",
    visitPlatform: "Visit the learning platform",
    projectsIn: "Projects in {programme}",
    storiesFrom: "Stories from this programme",
    photosFrom: "Photos from {programme}",
    exploreOther: "Explore our other programmes",
    workAcross:
      "We work across six connected programme portfolios, with youth leadership and participation running through all of them.",
    viewAllProgrammes: "View all programmes",
    portfolioEyebrow: "Programme portfolio",
    whyThisMatters: "Why this matters",
    ourApproach: "Our approach",
    resultsTitle: "Results & evidence",
    resultsEmpty:
      "No programme-level results are published yet for this portfolio. We publish results only when there is evidence behind them — planned work is presented as planned.",
    learningTitle: "What we're learning",
    partnersTitle: "Partners & ecosystem",
    partnersLabel: "Partners",
    ecosystemLabel: "The wider ecosystem",
    nextPrioritiesTitle: "Next priorities",
    nextPrioritiesNote: "Forward-looking priorities — not achieved outcomes.",
    statusActive: "Active",
    statusDeveloping: "Developing",
    statusPilot: "Pilot",
    statusPlanned: "Planned",
    asOf: "As of {date}",
    readEvidenceCta: "How to read this evidence →",
  },
  vantagePoint: {
    platformEyebrow: "Cross-programme platform",
    purposeTitle: "What it's for",
    functionsTitle: "What it will do",
    relationshipTitle: "How it relates to the portfolios",
    learnMore: "Explore Vantage Point",
    ctaNote:
      "Interested in building the learning and dialogue layer of this work? Talk to us about Vantage Point.",
  },
  project: {
    whyItMatters: "Why it matters",
    whatWeDid: "What we did",
    impact: "Impact",
    gallery: "Gallery",
    partners: "Partners",
    atAGlance: "At a glance",
    location: "Location",
    timeline: "Timeline",
    beneficiaries: "Beneficiaries",
    funding: "Funding",
    programmes: "Programmes",
    themes: "Themes",
    whoBenefits: "Who benefits",
    sdgs: "SDGs",
    supportProject: "Support this project",
    relatedProjects: "Related projects",
    backToProjects: "Back to projects",
    status: "Status",
    statusActive: "Active",
    statusCompleted: "Completed",
    statusPlanned: "Planned",
  },
  impact: {
    title: "Impact & Learning",
    description:
      "What we have measured, what evidence supports it, what we are learning — and what remains uncertain.",
    fromOutputs: "From outputs to long-term change",
    outputsToLongTerm:
      "Our work is measured across three levels: what we deliver (outputs), the changes we see (outcomes), and the future we are building (long-term impact).",
    geographicReach: "Geographic reach",
    geographicDescription:
      "We identify districts and communities that are often overlooked by larger international NGOs and magnify the reach of existing social safety nets.",
    sdgsTitle: "Sustainable Development Goals",
    sdgDescription: "Our programmes contribute to the following global goals.",
    monitoring: "Monitoring and evaluation",
    quantitative: "Quantitative",
    qualitative: "Qualitative",
    projectsBehind: "Projects behind the numbers",
    viewAllProjects: "View All Projects",
    disclaimer:
      "Figures shown above are programme-team records, not independently audited results. Each card explains the reporting period and counting method and links to the relevant project.",
    outputBadge: "Output",
    outputDescription: "What we delivered",
    outcomeBadge: "Outcome",
    outcomeDescription: "The change we saw",
    longTermBadge: "Long-term impact",
    longTermDescription: "The future we are building",
    frameworkTitle: "How Vantage thinks about impact",
    frameworkDescription:
      "We separate what was delivered from who was reached, what changed, who could potentially benefit, and what we intend — so a target is never mistaken for a result.",
    readEvidenceTitle: "How to read our evidence",
    readEvidenceDescription:
      "Every published figure carries a label describing what kind of claim it is. These labels are deliberate: they make the strength — and the limits — of each claim visible rather than hiding them.",
    evidenceDefinitions: {
      "verified":
        "A figure checked against an underlying record or source available to Vantage. Verified does not mean independently audited.",
      "programme-team-figure":
        "A figure supplied through programme implementation records — real internal records, not represented as independently audited.",
      "estimated-catchment":
        "An estimate of the population within an intervention's potential service area — not a count of unique people directly served.",
      "pilot":
        "Evidence or learning from an early-stage or test implementation — directionally useful, not yet conclusive.",
      "planned":
        "A target, intended activity or future state — not an achieved result.",
      "external-evidence":
        "Evidence originating outside Vantage, cited to explain context or programme rationale — not a Vantage result.",
    },
    tocFeatureTitle: "Our theory of change",
    tocFeatureDescription:
      "The logic connecting what Vantage does to the change it seeks — including the assumptions and external actors that logic depends on.",
    tocFeatureCta: "Read the theory of change",
    learningTitle: "What Vantage is learning",
    learningDescription:
      "Observations recorded from implementation — what worked, what did not, and what we are changing next. Learning is attributed to the programme it came from.",
    learningFrom: "From",
    evidenceLibraryTitle: "Evidence library",
    evidenceLibraryDescription:
      "Where approved evidence and learning outputs — results briefs, learning notes, research and evaluations — will be published for inspection.",
    evidenceLibraryEmpty:
      "No approved evidence publications yet. When evidence and learning outputs are approved, they will appear here with their status, methodology and source — not before.",
    reportsTitle: "Reports & accountability",
    reportsDescription:
      "Formal organizational reporting — annual, financial, programme and governance publications — is published only once approved. No approved reports are public yet.",
    reportsCta: "See reports & accountability",
    policiesTitle: "Policies & institutional accountability",
    policiesDescription:
      "The policies and mechanisms that govern how Vantage works — safeguarding, privacy, accessibility and terms — each on its own canonical page.",
    vantagePointTitle: "Vantage Point",
    vantagePointDescription:
      "The cross-programme platform where learning, dialogue, evidence and community voice connect across all six portfolios. Currently planned — its status is stated honestly, not inflated.",
    vantagePointCta: "About Vantage Point",
    ctaTitle: "Ask us about our evidence",
    ctaDescription:
      "Questions about a figure, a method or what we have not yet measured are welcome — that scrutiny is the point of publishing this.",
  },
  toc: {
    title: "Theory of Change",
    description:
      "The logic Vantage believes leads to change — with the assumptions it rests on and the actors it depends on made visible.",
    statementHeading: "What we believe leads to change",
    assumptionsTitle: "Assumptions we depend on",
    assumptionsDescription:
      "Every theory of change rests on things its authors do not control. These are ours — exposed so you can see where our logic could break.",
    actorsTitle: "External actors we depend on",
    actorsDescription:
      "Vantage cannot produce these outcomes alone. These are the people and systems the change pathway depends on — most are ecosystem actors, not contracted partners.",
    measurementTitle: "How we measure",
    measurementDescription:
      "Five distinct things Vantage talks about when it reports — kept separate so a delivery figure is never mistaken for change.",
    learningLoopTitle: "How learning feeds back",
    learningLoopDescription:
      "The discipline we are building: implement, observe, learn, adapt — so evidence and experience change what programmes do next.",
    limitationsTitle: "Where our evidence is limited",
    limitationsBody:
      "Our evidence base varies across programmes. Some figures are directly recorded, some are programme-team reports, some are estimates, and some work is still planned rather than delivered. We would rather show you the seams than paper over them — where a claim is uncertain, its label says so.",
    inPracticeTitle: "See it in practice",
    viewProgrammes: "Explore the six portfolios",
    viewImpact: "See results & evidence",
    viewVantagePoint: "How Vantage Point connects it",
  },
  stories: {
    title: "Stories & Insights",
    description:
      "Community voices, programme updates, research and reflections from our work.",
    featured: "Featured",
    searchPlaceholder: "Search stories and insights...",
    filterCategoryLabel: "Filter by category",
    noResults: "No stories match your filters.",
  },
  story: {
    updated: "Updated",
    readTime: "Read time",
    takeAction: "Take action",
    ctaDescription: "Inspired by this story? Here are ways you can help Vantage Foundation Uganda create more impact.",
    moreStories: "More stories & insights",
    relatedProjects: "Related projects",
    share: "Share",
    copyLink: "Copy link",
    copied: "Copied!",
    aboutTheAuthor: "About the author",
    originalLanguageNotice:
      "This content is currently available in English only.",
  },
  team: {
    title: "Our Team",
    description:
      "A youth-led, community-rooted team working across health, education and humanitarian action in Uganda.",
    executive: "Executive leadership",
    executiveDescription: "Strategic direction and day-to-day operations.",
    volunteers: "Volunteers and technical contributors",
    volunteersDescription:
      "Clinical, technical and field expertise, contributed voluntarily.",
    joinTitle: "Join our team",
    joinDescription:
      "We're always glad to hear from volunteers, professionals and partners who want to contribute their time or expertise.",
    volunteerCta: "Volunteer or partner with us",
    partnerCta: "Partner with us",
    donateCta: "Donate",
    meetRest: "Meet the rest of the team",
    supportWork: "Support this work",
  },
  teamMember: {
    backToTeam: "Back to team",
    role: "Role",
    email: "Email",
    linkedIn: "LinkedIn",
    support: "Support this work",
    volunteer: "Volunteer",
    donate: "Donate",
  },
  gallery: {
    title: "Gallery",
    description:
      "Moments from our boreholes, schools and community programmes across Uganda.",
  },
  reports: {
    title: "Reports & Accountability",
    description:
      "Transparency is how we build trust with communities, donors and partners.",
    approvedReports: "Approved reports",
    approvedDescription:
      "Documents cleared for public release, with their reporting period and type.",
    publicationStatus: "Publication status by category",
    publicationDescription:
      "We do not present unfinished documents as published evidence. Each section below shows its current status and what will appear there when approved.",
    policies: "Policies",
    policiesDescription:
      "Our public policy commitments are available now. Formal policy documents will be linked as they are approved.",
    requestInfo: "Request information",
    requestDescription:
      "We welcome requests for information from donors, partners, journalists and community members. Reach out and we will respond as soon as possible.",
    contactUs: "Contact us",
    download: "Download",
    emptyStatus: "Pending approval",
    annualReports: "Annual reports",
    annualReportsDescription:
      "Yearly summaries of our programmes, reach and organisational development. The first annual report will be published here once approved for public release.",
    financialReports: "Financial reports",
    financialReportsDescription:
      "Income and expenditure statements showing how donations are used. Financial statements will be added after formal approval.",
    projectReports: "Project reports",
    projectReportsDescription:
      "Detailed reports from individual projects — including activities, outcomes and lessons learned. Project-level documentation is linked from each project page as it becomes available.",
    safeguarding: "Safeguarding",
    safeguardingDescription:
      "Our safeguarding policy sets out how we protect children, young people and vulnerable adults across all programmes. The policy is being finalised for publication.",
    governance: "Governance",
    governanceDescription:
      "Vantage Foundation Uganda is led by a published leadership team and is working towards a formal board structure. Governance documents will be added here only after approval.",
    monitoring: "Monitoring & evaluation",
    monitoringDescription:
      "Our approach to measuring impact combines quantitative counts (patients treated, litres of water provided, workshop attendance) with qualitative case studies and community feedback.",
    projectReportsStatus: "Linked from project pages",
    monitoringStatus: "Framework in place",
  },
  legal: {
    privacy: "Privacy Policy",
    terms: "Terms of Use",
    safeguarding: "Safeguarding Policy",
    accessibility: "Accessibility Statement",
    notTranslatedNotice:
      "This page is currently available in English only.",
  },
  brand: {
    title: "Brand Guide",
    description:
      "The complete visual identity system — logos, colours, typography, components, and usage rules. Use this guide to keep every communication recognisable, credible, and consistent.",
    logo: "Logo",
    colours: "Colour",
    typography: "Typography",
    imagery: "Photography",
    usage: "Usage",
    contact: "Contact",
  },
  brandGuide: {
    title: "Brand Guide",
    description:
      "Visual identity system for Vantage Foundation Uganda — logos, colours, typography, components, and usage rules.",
    eyebrow: "Visual Identity System",
    heroTitle: "Vantage Foundation Uganda Brand Guide",
    heroDescription:
      "The complete visual identity system — logos, colours, typography, components, and usage rules. Use this guide to keep every communication recognisable, credible, and consistent.",
    navAriaLabel: "Brand guide sections",
    nav: {
      foundations: "Foundations",
      logo: "Logo",
      colour: "Colour",
      typography: "Typography",
      components: "Components",
      programme: "Programme Colours",
      icons: "Iconography",
      photography: "Photography",
      accessibility: "Accessibility",
      downloads: "Downloads",
    },
    sections: {
      foundations: {
        eyebrow: "Foundations",
        title: "Brand foundations",
        mission: "Mission",
        vision: "Vision",
        personality: "Personality",
        coreValues: "Core values",
      },
      logo: {
        eyebrow: "Logo",
        title: "Logo system",
        lede:
          "The Vantage Foundation Uganda logo has three lockup variants. Use the horizontal lockup for headers and signatures, the primary stacked lockup for formal documents and covers, and the symbol-only mark for favicons, social profiles, and small applications.",
        primary: "Primary / stacked",
        horizontal: "Horizontal",
        symbol: "Symbol only",
        clearSpace: "Clear space",
        minSizes: "Minimum sizes",
        digital: "Digital",
        print: "Print",
        favicon: "Favicon",
        misuse: "Logo misuse — never do this",
        primaryAlt: "Vantage Foundation Uganda primary logo",
        horizontalAlt: "Vantage Foundation Uganda horizontal logo",
        symbolAlt: "Vantage Foundation Uganda symbol",
      },
      colour: {
        eyebrow: "Colour",
        title: "Colour system",
        lede:
          "Exactly three dominant colours, roughly a third each: teal, white, and black/dark charcoal for text and dark sections. Target ratio: ~33% white/neutral, ~33% teal, ~33% black/charcoal.",
        primaryPalette: "Primary palette",
        accessiblePairings: "Accessible pairings",
        warning: "Warning:",
      },
      typography: {
        eyebrow: "Typography",
        title: "Typography",
        lede:
          "Inter is the primary typeface, loaded via next/font/google with a robust system-font fallback. Avoid excessive uppercase — reserve it for short labels and eyebrows.",
      },
      components: {
        eyebrow: "Components",
        title: "UI components",
        buttons: "Buttons",
        badges: "Badges",
        cards: "Cards",
        onDark: "On dark background",
      },
      programme: {
        eyebrow: "Programme colours",
        title: "Programme accent colours",
        lede:
          "Each programme area has a recognisable accent colour, always paired with an icon and text label. Colour is never the sole means of conveying category (WCAG 2.2 §1.4.1).",
      },
      iconography: {
        eyebrow: "Iconography",
        title: "Iconography",
        lede:
          "Icons are outlined, rounded, and consistent in stroke weight (Lucide). They support programme categorisation and wayfinding. Use at 1.25rem default, 1.5rem for feature contexts.",
      },
      photography: {
        eyebrow: "Photography",
        title: "Photography direction",
        lede:
          "Authentic Vantage Foundation photography is the primary visual asset. Prioritise real communities, volunteers in action, field implementation, and visible results. Avoid pity-based imagery and dehumanising close-ups.",
        cropPresets: "Crop presets",
      },
      accessibility: {
        eyebrow: "Accessibility",
        title: "Accessibility",
        lede:
          "The brand system targets WCAG 2.2 AA. Colour contrast, keyboard focus, semantic structure, and reduced-motion support are built in.",
      },
      downloads: {
        eyebrow: "Downloads",
        title: "Approved assets",
        lede:
          "All logo files are true vector SVG (under 15 KB each, scalable to any size). Files live in public/brand/logos/. Do not redistribute proprietary fonts.",
        fullDocs: "Full documentation:",
      },
    },
  },
  footer: {
    vantageCare: "Vantage Care",
    kikumiKyoAcademy: "KikumiKyo Academy",
  },
  ui: uiContent.en,
};

const germanPageContent: DeepPartial<PageContent> = {
  common: {
    viewProject: "Projekt ansehen",
    readFullBio: "Ganze Biografie lesen",
    readStory: "Geschichte lesen",
    viewStory: "Geschichte lesen",
    viewTeamMember: "Profil ansehen",
    seeDetails: "Details ansehen",
    viewGallery: "Galerie ansehen",
    downloadReport: "Herunterladen",
    minRead: "{minutes} Min. Lesezeit",
    viewEvidence: "Projektbelege ansehen",
    programme: "Programm",
    placeAndPeriod: "Ort und Zeitraum",
    howCounted: "Wie ermittelt wurde",
    evidenceStatus: {
      "verified": "Verifiziert",
      "programme-team-figure": "Angabe des Programmteams",
      "estimated-catchment": "Geschätztes Einzugsgebiet",
      "pilot": "Pilotprojekt / frühe Erkenntnis",
      "planned": "Geplant / Zielwert",
      "external-evidence": "Externe Evidenz",
    },
    search: "Suchen",
    searchProjectsPlaceholder: "Projekte suchen...",
    searchStoriesPlaceholder: "Geschichten und Einblicke suchen...",
    all: "Alle",
    filterByCategory: "Nach Kategorie filtern",
    filterByStatus: "Nach Status filtern",
    noProjectsMatch: "Keine Projekte entsprechen Ihren Filtern.",
    noStoriesMatch: "Keine Geschichten entsprechen Ihren Filtern.",
    about: "über",
    aboutUs: "Über uns",
    donate: "Spenden",
    volunteer: "Freiwillig",
    partnerWithUs: "Mit uns partnerschaften",
    contactVantage: "Vantage kontaktieren",
    visitProgrammes: "Programme ansehen",
    donateNow: "Jetzt spenden",
    updated: "Aktualisiert am {date}",
    published: "Veröffentlicht am {date}",
    readTime: "Lesezeit",
    takeAction: "Handeln",
    browseAllStories: "Alle Geschichten durchsuchen",
    browseAllProjects: "Alle Projekte durchsuchen",
    moreStories: "Weitere Geschichten & Einblicke",
    filter: "Filter:",
    openInNew: "Öffnet in einem neuen Tab",
    share: "Teilen",
    copyLink: "Link kopieren",
    copied: "Kopiert",
    backTo: "Zurück zu",
    close: "Schließen",
    breadcrumb: "Brotkrümelnavigation",
    viewAllProgrammes: "Alle Programme ansehen",
    status: "Status",
    flagship: "Flaggschiff",
    sources: "Quellen",
    email: "E-Mail",
    linkedIn: "LinkedIn",
    home: "Startseite",
    shareOn: "Teilen auf",
  },
  ourWork: {
    title: "Unsere Arbeit",
    description:
      "Sechs miteinander verbundene Programmportfolios, ausgerichtet auf die Realitäten vor Ort — plus Vantage Point, die Plattform, die das Lernen zwischen ihnen verbindet.",
    programmeSuffix: "Programm",
    relatedProjects: "Verwandte Projekte",
    projectCount: "{count} Projekte",
    developingNote: "Portfolio im Aufbau — Ausrichtung veröffentlicht, Arbeit wird formalisiert",
  },
  projects: {
    eyebrow: "Projekte",
    title: "Ausgewählte Projekte",
    description:
      "Ein Einblick in unsere Arbeit zu sauberem Wasser, Menstruationshygiene, Mentoring und Bildung.",
    viewAll: "Alle Projekte ansehen",
    searchPlaceholder: "Projekte suchen...",
    filterCategoryLabel: "Nach Kategorie filtern",
    filterStatusLabel: "Nach Status filtern",
    noResults: "Keine Projekte entsprechen Ihren Filtern.",
    statusActive: "Aktiv",
    statusCompleted: "Abgeschlossen",
    statusPlanned: "Geplant",
  },
  programme: {
    aboutTitle: "Über dieses Programm",
    whatWeDo: "Was wir tun",
    getInvolved: "Mitmachen",
    donateToProgramme: "Für dieses Programm spenden",
    volunteerWithUs: "Freiwillig bei uns mitmachen",
    visitPlatform: "Lernplattform besuchen",
    projectsIn: "Projekte in {programme}",
    storiesFrom: "Geschichten aus diesem Programm",
    photosFrom: "Fotos aus {programme}",
    exploreOther: "Entdecken Sie unsere anderen Programme",
    workAcross:
      "Wir arbeiten in sechs miteinander verbundenen Programmportfolios, mit Jugendführung und Partizipation in allen.",
    viewAllProgrammes: "Alle Programme ansehen",
    portfolioEyebrow: "Programmportfolio",
    whyThisMatters: "Warum es wichtig ist",
    ourApproach: "Unser Ansatz",
    resultsTitle: "Ergebnisse & Belege",
    resultsEmpty:
      "Für dieses Portfolio wurden noch keine Ergebnisse auf Programmebene veröffentlicht. Wir veröffentlichen Ergebnisse nur, wenn Belege dahinterstehen — geplante Arbeit wird als geplant dargestellt.",
    learningTitle: "Was wir lernen",
    partnersTitle: "Partner & Umfeld",
    partnersLabel: "Partner",
    ecosystemLabel: "Das breitere Umfeld",
    nextPrioritiesTitle: "Nächste Prioritäten",
    nextPrioritiesNote: "Zukunftsgerichtete Prioritäten — keine erreichten Ergebnisse.",
    statusActive: "Aktiv",
    statusDeveloping: "Im Aufbau",
    statusPilot: "Pilot",
    statusPlanned: "Geplant",
    asOf: "Stand {date}",
    readEvidenceCta: "Wie man diese Evidenz liest →",
  },
  vantagePoint: {
    platformEyebrow: "Programmübergreifende Plattform",
    purposeTitle: "Wofür sie da ist",
    functionsTitle: "Was sie tun wird",
    relationshipTitle: "Wie sie sich zu den Portfolios verhält",
    learnMore: "Vantage Point entdecken",
    ctaNote:
      "Interesse daran, die Lern- und Dialogebene dieser Arbeit mitzugestalten? Sprechen Sie uns zu Vantage Point an.",
  },
  project: {
    whyItMatters: "Warum es wichtig ist",
    whatWeDid: "Was wir getan haben",
    impact: "Wirkung",
    gallery: "Galerie",
    partners: "Partner",
    atAGlance: "Auf einen Blick",
    location: "Ort",
    timeline: "Zeitraum",
    beneficiaries: "Begünstigte",
    funding: "Finanzierung",
    programmes: "Programme",
    themes: "Themen",
    whoBenefits: "Wer profitiert",
    sdgs: "SDGs",
    supportProject: "Dieses Projekt unterstützen",
    relatedProjects: "Verwandte Projekte",
    backToProjects: "Zurück zu den Projekten",
    status: "Status",
    statusActive: "Aktiv",
    statusCompleted: "Abgeschlossen",
    statusPlanned: "Geplant",
  },
  impact: {
    title: "Wirkung & Lernen",
    description:
      "Was wir gemessen haben, welche Evidenz es stützt, was wir lernen — und was unsicher bleibt.",
    fromOutputs: "Von Outputs zu langfristigem Wandel",
    outputsToLongTerm:
      "Unsere Arbeit wird auf drei Ebenen gemessen: was wir liefern (Outputs), die Veränderungen, die wir sehen (Outcomes), und die Zukunft, die wir aufbauen (langfristige Wirkung).",
    geographicReach: "Geografische Reichweite",
    geographicDescription:
      "Wir identifizieren Bezirke und Gemeinschaften, die von größeren internationalen NGOs oft übersehen werden, und verstärken die Reichweite bestehender sozialer Sicherheitsnetze.",
    sdgsTitle: "Nachhaltige Entwicklungsziele",
    sdgDescription:
      "Unsere Programme tragen zu folgenden globalen Zielen bei.",
    monitoring: "Monitoring und Evaluation",
    quantitative: "Quantitativ",
    qualitative: "Qualitativ",
    projectsBehind: "Projekte hinter den Zahlen",
    viewAllProjects: "Alle Projekte ansehen",
    disclaimer:
      "Die oben gezeigten Zahlen sind Programmteam-Aufzeichnungen, keine unabhängig geprüften Ergebnisse. Jede Karte erklärt Berichtszeitraum und Zählmethode und verweist auf das relevante Projekt.",
    outputBadge: "Output",
    outputDescription: "Was wir geliefert haben",
    outcomeBadge: "Outcome",
    outcomeDescription: "Die Veränderung, die wir sahen",
    longTermBadge: "Langfristige Wirkung",
    longTermDescription: "Die Zukunft, die wir aufbauen",
    frameworkTitle: "Wie Vantage über Wirkung denkt",
    frameworkDescription:
      "Wir trennen, was geliefert wurde, davon, wen wir erreicht haben, was sich verändert hat, wer potenziell profitieren könnte und was wir beabsichtigen — damit ein Ziel nie mit einem Ergebnis verwechselt wird.",
    readEvidenceTitle: "Wie man unsere Evidenz liest",
    readEvidenceDescription:
      "Jede veröffentlichte Zahl trägt ein Label, das beschreibt, welche Art von Aussage sie ist. Diese Labels sind Absicht: Sie machen die Stärke — und die Grenzen — jeder Aussage sichtbar, statt sie zu verstecken.",
    evidenceDefinitions: {
      "verified":
        "Eine Zahl, die gegen einen zugrundeliegenden Datensatz oder eine Quelle geprüft wurde, die Vantage vorliegt. Verifiziert bedeutet nicht unabhängig geprüft.",
      "programme-team-figure":
        "Eine Zahl aus Programm-Implementierungsaufzeichnungen — echte interne Aufzeichnungen, nicht als unabhängig auditiert dargestellt.",
      "estimated-catchment":
        "Eine Schätzung der Bevölkerung im potenziellen Einzugsgebiet einer Intervention — keine Zählung direkt bedienter Personen.",
      "pilot":
        "Evidenz oder Erkenntnisse aus einer frühen oder Testimplementierung — richtungsweisend, noch nicht abschließend.",
      "planned":
        "Ein Ziel, eine beabsichtigte Aktivität oder ein Zukunftszustand — kein erreichtes Ergebnis.",
      "external-evidence":
        "Evidenz von außerhalb Vantage, zitiert zur Erläuterung von Kontext oder Programmbegründung — kein Vantage-Ergebnis.",
    },
    tocFeatureTitle: "Unsere Theory of Change",
    tocFeatureDescription:
      "Die Logik, die verbindet, was Vantage tut, mit der Veränderung, die es anstrebt — einschließlich der Annahmen und externen Akteure, von denen diese Logik abhängt.",
    tocFeatureCta: "Theory of Change lesen",
    learningTitle: "Was Vantage lernt",
    learningDescription:
      "Beobachtungen aus der Implementierung — was funktioniert hat, was nicht und was wir als Nächstes ändern. Erkenntnisse werden dem Programm zugeordnet, aus dem sie stammen.",
    learningFrom: "Aus",
    evidenceLibraryTitle: "Evidenzbibliothek",
    evidenceLibraryDescription:
      "Hier werden freigegebene Evidenz- und Lernergebnisse — Ergebnisberichte, Lernnotizen, Forschung und Evaluationen — zur Einsicht veröffentlicht.",
    evidenceLibraryEmpty:
      "Noch keine freigegebenen Evidenzpublikationen. Wenn Evidenz- und Lernergebnisse freigegeben werden, erscheinen sie hier mit Status, Methodik und Quelle — nicht früher.",
    reportsTitle: "Berichte & Rechenschaft",
    reportsDescription:
      "Formale Organisationsberichte — jährliche, finanzielle, Programm- und Governance-Publikationen — werden nur nach Freigabe veröffentlicht. Derzeit sind keine freigegebenen Berichte öffentlich.",
    reportsCta: "Berichte & Rechenschaft ansehen",
    policiesTitle: "Richtlinien & institutionelle Rechenschaft",
    policiesDescription:
      "Die Richtlinien und Mechanismen, die die Arbeit von Vantage regeln — Schutz, Datenschutz, Barrierefreiheit und Bedingungen — jeweils auf ihrer eigenen kanonischen Seite.",
    vantagePointTitle: "Vantage Point",
    vantagePointDescription:
      "Die programmübergreifende Plattform, auf der Lernen, Dialog, Evidenz und Community-Stimmen über alle sechs Portfolios verbunden werden. Derzeit geplant — ihr Status wird ehrlich angegeben, nicht aufgebläht.",
    vantagePointCta: "Über Vantage Point",
    ctaTitle: "Fragen Sie uns nach unserer Evidenz",
    ctaDescription:
      "Fragen zu einer Zahl, einer Methode oder dazu, was wir noch nicht gemessen haben, sind willkommen — diese Prüfung ist der Sinn der Veröffentlichung.",
  },
  toc: {
    title: "Theory of Change",
    description:
      "Die Logik, von der Vantage glaubt, dass sie zu Veränderung führt — mit den Annahmen, auf denen sie ruht, und den Akteuren, von denen sie abhängt, sichtbar gemacht.",
    statementHeading: "Was unserer Überzeugung nach zu Veränderung führt",
    assumptionsTitle: "Annahmen, von denen wir abhängen",
    assumptionsDescription:
      "Jede Theory of Change ruht auf Dingen, die ihre Autoren nicht kontrollieren. Das sind unsere — offengelegt, damit Sie sehen können, wo unsere Logik brechen könnte.",
    actorsTitle: "Externe Akteure, von denen wir abhängen",
    actorsDescription:
      "Vantage kann diese Ergebnisse nicht allein erzielen. Das sind die Menschen und Systeme, von denen der Veränderungspfad abhängt — die meisten sind Ökosystem-Akteure, keine Vertragspartner.",
    measurementTitle: "Wie wir messen",
    measurementDescription:
      "Fünf verschiedene Dinge, über die Vantage berichtet — getrennt gehalten, damit eine Lieferziffer nie mit Veränderung verwechselt wird.",
    learningLoopTitle: "Wie Lernen zurückfließt",
    learningLoopDescription:
      "Die Disziplin, die wir aufbauen: implementieren, beobachten, lernen, anpassen — damit Evidenz und Erfahrung verändern, was Programme als Nächstes tun.",
    limitationsTitle: "Wo unsere Evidenz begrenzt ist",
    limitationsBody:
      "Unsere Evidenzbasis variiert zwischen den Programmen. Manche Zahlen sind direkt erfasst, manche sind Programmteam-Berichte, manche sind Schätzungen, und manche Arbeit ist eher geplant als umgesetzt. Wir zeigen Ihnen lieber die Nähte, als sie zu übertünchen — wo eine Aussage unsicher ist, sagt es ihr Label.",
    inPracticeTitle: "In der Praxis sehen",
    viewProgrammes: "Die sechs Portfolios erkunden",
    viewImpact: "Ergebnisse & Evidenz ansehen",
    viewVantagePoint: "Wie Vantage Point es verbindet",
  },
  stories: {
    title: "Geschichten & Einblicke",
    description:
      "Stimmen aus der Gemeinschaft, Programmupdates, Forschung und Reflexionen aus unserer Arbeit.",
    featured: "Empfohlen",
    searchPlaceholder: "Geschichten und Einblicke suchen...",
    filterCategoryLabel: "Nach Kategorie filtern",
    noResults: "Keine Geschichten entsprechen Ihren Filtern.",
  },
  story: {
    updated: "Aktualisiert",
    readTime: "Lesezeit",
    takeAction: "Handeln",
    ctaDescription: "Hat Ihnen diese Geschichte gefallen? Hier erfahren Sie, wie Sie Vantage Foundation Uganda dabei helfen können, mehr Wirkung zu erzielen.",
    moreStories: "Weitere Geschichten & Einblicke",
    relatedProjects: "Verwandte Projekte",
    share: "Teilen",
    copyLink: "Link kopieren",
    copied: "Kopiert!",
    aboutTheAuthor: "Über den Autor",
    originalLanguageNotice:
      "Dieser Inhalt ist derzeit nur auf Englisch verfügbar.",
  },
  team: {
    title: "Unser Team",
    description:
      "Ein jugendgeführtes, in den Gemeinschaften verwurzeltes Team, das in den Bereichen Gesundheit, Bildung und humanitäre Hilfe in Uganda arbeitet.",
    executive: "Geschäftsführung",
    executiveDescription: "Strategische Ausrichtung und Tagesgeschäft.",
    volunteers: "Freiwillige und technische Mitwirkende",
    volunteersDescription:
      "Klinische, technische und Feldexpertise, ehrenamtlich eingebracht.",
    joinTitle: "Werden Sie Teil unseres Teams",
    joinDescription:
      "Wir freuen uns immer über Freiwillige, Fachleute und Partner, die ihre Zeit oder Expertise beitragen möchten.",
    volunteerCta: "Freiwillig mitmachen oder partnerschaften",
    partnerCta: "Mit uns partnerschaften",
    donateCta: "Spenden",
    meetRest: "Rest des Teams kennenlernen",
    supportWork: "Diese Arbeit unterstützen",
  },
  teamMember: {
    backToTeam: "Zurück zum Team",
    role: "Rolle",
    email: "E-Mail",
    linkedIn: "LinkedIn",
    support: "Diese Arbeit unterstützen",
    volunteer: "Freiwillig",
    donate: "Spenden",
  },
  gallery: {
    title: "Galerie",
    description:
      "Momente aus unseren Bohrlöchern, Schulen und Gemeinschaftsprogrammen in Uganda.",
  },
  reports: {
    title: "Berichte & Verantwortung",
    description:
      "Transparenz ist, wie wir Vertrauen bei Gemeinschaften, Spendern und Partnern aufbauen.",
    approvedReports: "Genehmigte Berichte",
    approvedDescription:
      "Dokumente zur Veröffentlichung freigegeben, mit Berichtszeitraum und Typ.",
    publicationStatus: "Veröffentlichungsstatus nach Kategorie",
    publicationDescription:
      "Wir stellen keine unfertigen Dokumente als veröffentlichte Beweise dar. Jeder Abschnitt zeigt seinen aktuellen Status und was erscheint, sobald genehmigt.",
    policies: "Richtlinien",
    policiesDescription:
      "Unsere öffentlichen Richtlinienverpflichtungen sind jetzt verfügbar. Formelle Richtliniendokumente werden verlinkt, sobald sie genehmigt sind.",
    requestInfo: "Informationen anfragen",
    requestDescription:
      "Wir begrüßen Informationsanfragen von Spendern, Partnern, Journalisten und Gemeinschaftsmitgliedern. Melden Sie sich und wir antworten so schnell wie möglich.",
    contactUs: "Kontaktieren Sie uns",
    download: "Herunterladen",
    emptyStatus: "Genehmigung ausstehend",
    annualReports: "Jahresberichte",
    annualReportsDescription:
      "Jährliche Zusammenfassungen unserer Programme, Reichweite und Organisationsentwicklung. Der erste Jahresbericht wird hier veröffentlicht, sobald er für die Veröffentlichung freigegeben ist.",
    financialReports: "Finanzberichte",
    financialReportsDescription:
      "Einnahmen- und Ausgabenaufstellungen, die zeigen, wie Spenden verwendet werden. Finanzberichte werden nach förmlicher Genehmigung hinzugefügt.",
    projectReports: "Projektberichte",
    projectReportsDescription:
      "Detaillierte Berichte einzelner Projekte — einschließlich Aktivitäten, Ergebnissen und Erkenntnissen. Dokumentation auf Projektebene wird von jeder Projektseite verlinkt, sobald verfügbar.",
    safeguarding: "Schutz",
    safeguardingDescription:
      "Unsere Schutzrichtlinie legt fest, wie wir Kinder, Jugendliche und vulnerable Erwachsene in allen Programmen schützen. Die Richtlinie wird zur Veröffentlichung finalisiert.",
    governance: "Governance",
    governanceDescription:
      "Vantage Foundation Uganda wird von einem veröffentlichten Führungsteam geleitet und arbeitet an einer formellen Vorstandsstruktur. Governance-Dokumente werden hier nur nach Genehmigung hinzugefügt.",
    monitoring: "Monitoring & Evaluation",
    monitoringDescription:
      "Unser Ansatz zur Wirkungsmessung kombiniert quantitative Zahlen (behandelte Patienten, Liter sauberen Wassers, Workshop-Teilnahme) mit qualitativen Fallstudien und Feedback der Gemeinschaft.",
    projectReportsStatus: "Verlinkt von Projektseiten",
    monitoringStatus: "Rahmenwerk eingerichtet",
  },
  legal: {
    privacy: "Datenschutzerklärung",
    terms: "Nutzungsbedingungen",
    safeguarding: "Schutzrichtlinie",
    accessibility: "Barrierefreiheitserklärung",
    notTranslatedNotice:
      "Diese Seite ist derzeit nur auf Englisch verfügbar.",
  },
  brand: {
    title: "Markenhandbuch",
    description:
      "Das vollständige visuelle Identitätssystem — Logos, Farben, Typografie, Komponenten und Nutzungsregeln. Nutzen Sie diesen Leitfaden, damit jede Kommunikation erkennbar, glaubwürdig und konsistent bleibt.",
    logo: "Logo",
    colours: "Farbe",
    typography: "Typografie",
    imagery: "Fotografie",
    usage: "Verwendung",
    contact: "Kontakt",
  },
  brandGuide: {
    title: "Markenhandbuch",
    description:
      "Visuelles Identitätssystem der Vantage Foundation Uganda — Logos, Farben, Typografie, Komponenten und Nutzungsregeln.",
    eyebrow: "Visuelles Identitätssystem",
    heroTitle: "Markenhandbuch der Vantage Foundation Uganda",
    heroDescription:
      "Das vollständige visuelle Identitätssystem — Logos, Farben, Typografie, Komponenten und Nutzungsregeln. Nutzen Sie diesen Leitfaden, damit jede Kommunikation erkennbar, glaubwürdig und konsistent bleibt.",
    navAriaLabel: "Abschnitte des Markenhandbuchs",
    nav: {
      foundations: "Grundlagen",
      logo: "Logo",
      colour: "Farbe",
      typography: "Typografie",
      components: "Komponenten",
      programme: "Programmfarben",
      icons: "Ikonografie",
      photography: "Fotografie",
      accessibility: "Barrierefreiheit",
      downloads: "Downloads",
    },
    sections: {
      foundations: {
        eyebrow: "Grundlagen",
        title: "Markengrundlagen",
        mission: "Mission",
        vision: "Vision",
        personality: "Persönlichkeit",
        coreValues: "Kernwerte",
      },
      logo: {
        eyebrow: "Logo",
        title: "Logosystem",
        lede:
          "Das Logo der Vantage Foundation Uganda gibt es in drei Zusammenstellungen. Verwenden Sie die horizontale Variante für Kopfzeilen und Signaturen, die gestapelte Primärvariante für formelle Dokumente und Deckblätter sowie das reine Symbol für Favicons, Social-Media-Profile und kleine Anwendungen.",
        primary: "Primär / gestapelt",
        horizontal: "Horizontal",
        symbol: "Nur Symbol",
        clearSpace: "Freiraum",
        minSizes: "Mindestgrößen",
        digital: "Digital",
        print: "Druck",
        favicon: "Favicon",
        misuse: "Falsche Logo-Verwendung — niemals so",
        primaryAlt: "Vantage Foundation Uganda Primärlogo",
        horizontalAlt: "Vantage Foundation Uganda horizontales Logo",
        symbolAlt: "Vantage Foundation Uganda Symbol",
      },
      colour: {
        eyebrow: "Farbe",
        title: "Farbsystem",
        lede:
          "Genau drei dominante Farben, etwa je ein Drittel: Teal, Weiß und Schwarz/dunkles Anthrazit für Text und dunkle Abschnitte. Zielverhältnis: ~33 % Weiß/Neutral, ~33 % Teal, ~33 % Schwarz/Anthrazit.",
        primaryPalette: "Primärpalette",
        accessiblePairings: "Barrierefreie Kombinationen",
        warning: "Warnung:",
      },
      typography: {
        eyebrow: "Typografie",
        title: "Typografie",
        lede:
          "Inter ist die Hauptschriftart, geladen über next/font/google mit einem robusten System-Font-Fallback. Vermeiden Sie übermäßige Großschreibung — verwenden Sie sie nur für kurze Labels und Überschriften.",
      },
      components: {
        eyebrow: "Komponenten",
        title: "UI-Komponenten",
        buttons: "Schaltflächen",
        badges: "Abzeichen",
        cards: "Karten",
        onDark: "Auf dunklem Hintergrund",
      },
      programme: {
        eyebrow: "Programmfarben",
        title: "Programm-Akzentfarben",
        lede:
          "Jeder Programmbereich hat eine erkennbare Akzentfarbe, immer kombiniert mit einem Icon und Textlabel. Farbe ist niemals das einzige Mittel zur Kategorisierung (WCAG 2.2 §1.4.1).",
      },
      iconography: {
        eyebrow: "Ikonografie",
        title: "Ikonografie",
        lede:
          "Icons sind konturiert, abgerundet und einheitlich in der Strichstärke (Lucide). Sie unterstützen die Kategorisierung von Programmen und die Orientierung. Standardgröße 1,25rem, 1,5rem für Funktionskontexte.",
      },
      photography: {
        eyebrow: "Fotografie",
        title: "Fotografie-Richtlinie",
        lede:
          "Authentische Vantage Foundation-Fotografie ist das primäre visuelle Asset. Priorisieren Sie echte Gemeinschaften, ehrenamtliche Helfer im Einsatz, Feldumsetzung und sichtbare Ergebnisse. Vermeiden Sie mitleidheischende Bilder und entmenschlichende Nahaufnahmen.",
        cropPresets: "Schnittvorlagen",
      },
      accessibility: {
        eyebrow: "Barrierefreiheit",
        title: "Barrierefreiheit",
        lede:
          "Das Markensystem zielt auf WCAG 2.2 AA ab. Farbkontrast, Tastaturfokus, semantische Struktur und Unterstützung für reduzierte Bewegung sind integriert.",
      },
      downloads: {
        eyebrow: "Downloads",
        title: "Freigegebene Assets",
        lede:
          "Alle Logos sind echte Vektor-SVGs (unter 15 KB, beliebig skalierbar). Die Dateien befinden sich in public/brand/logos/. Proprietäre Schriftarten dürfen nicht weitergegeben werden.",
        fullDocs: "Vollständige Dokumentation:",
      },
    },
  },
  footer: {
    vantageCare: "Vantage Care",
    kikumiKyoAcademy: "KikumiKyo Akademie",
  },
  ui: uiContent.de,
};

const frenchPageContent: DeepPartial<PageContent> = {
  common: {
    viewProject: "Voir le projet",
    readFullBio: "Lire la biographie complète",
    readStory: "Lire le récit",
    viewStory: "Lire le récit",
    viewTeamMember: "Voir le profil",
    seeDetails: "Voir les détails",
    viewGallery: "Voir la galerie",
    downloadReport: "Télécharger",
    minRead: "{minutes} min de lecture",
    viewEvidence: "Voir les preuves du projet",
    programme: "Programme",
    placeAndPeriod: "Lieu et période",
    howCounted: "Méthode de comptage",
    evidenceStatus: {
      "verified": "Vérifié",
      "programme-team-figure": "Donnée de l'équipe programme",
      "estimated-catchment": "Zone de desserte estimée",
      "pilot": "Pilote / résultat préliminaire",
      "planned": "Planifié / objectif",
      "external-evidence": "Données externes",
    },
    search: "Rechercher",
    searchProjectsPlaceholder: "Rechercher des projets...",
    searchStoriesPlaceholder: "Rechercher des récits et analyses...",
    all: "Tous",
    filterByCategory: "Filtrer par catégorie",
    filterByStatus: "Filtrer par statut",
    noProjectsMatch: "Aucun projet ne correspond à vos filtres.",
    noStoriesMatch: "Aucun récit ne correspond à vos filtres.",
    about: "sur",
    aboutUs: "À propos de nous",
    donate: "Faire un don",
    volunteer: "Bénévole",
    partnerWithUs: "Devenir partenaire",
    contactVantage: "Contacter Vantage",
    visitProgrammes: "Voir les programmes",
    donateNow: "Faire un don maintenant",
    updated: "Mis à jour le {date}",
    published: "Publié le {date}",
    readTime: "Temps de lecture",
    takeAction: "Agir",
    browseAllStories: "Parcourir tous les récits",
    browseAllProjects: "Parcourir tous les projets",
    moreStories: "Plus de récits et analyses",
    filter: "Filtrer :",
    openInNew: "Ouvre dans un nouvel onglet",
    share: "Partager",
    copyLink: "Copier le lien",
    copied: "Copié",
    backTo: "Retour à",
    close: "Fermer",
    breadcrumb: "Fil d'Ariane",
    viewAllProgrammes: "Voir tous les programmes",
    status: "Statut",
    flagship: "Projet phare",
    sources: "Sources",
    email: "Courriel",
    linkedIn: "LinkedIn",
    home: "Accueil",
    shareOn: "Partager sur",
  },
  ourWork: {
    title: "Notre action",
    description:
      "Six portefeuilles de programmes interconnectés, conçus en fonction des réalités locales — plus Vantage Point, la plateforme qui relie l'apprentissage entre eux.",
    programmeSuffix: "Programme",
    relatedProjects: "Projets connexes",
    projectCount: "{count} projets",
    developingNote: "Portefeuille en développement — cap publié, travail en cours de formalisation",
  },
  projects: {
    eyebrow: "Projets",
    title: "Projets en vedette",
    description:
      "Un aperçu de notre travail sur l'eau potable, la santé menstruelle, le mentorat et l'éducation.",
    viewAll: "Voir tous les projets",
    searchPlaceholder: "Rechercher des projets...",
    filterCategoryLabel: "Filtrer par catégorie",
    filterStatusLabel: "Filtrer par statut",
    noResults: "Aucun projet ne correspond à vos filtres.",
    statusActive: "Actif",
    statusCompleted: "Terminé",
    statusPlanned: "Planifié",
  },
  programme: {
    aboutTitle: "À propos de ce programme",
    whatWeDo: "Ce que nous faisons",
    getInvolved: "S'engager",
    donateToProgramme: "Donner à ce programme",
    volunteerWithUs: "Bénévole avec nous",
    visitPlatform: "Visiter la plateforme d'apprentissage",
    projectsIn: "Projets dans {programme}",
    storiesFrom: "Récits de ce programme",
    photosFrom: "Photos de {programme}",
    exploreOther: "Explorer nos autres programmes",
    workAcross:
      "Nous travaillons à travers six portefeuilles de programmes interconnectés, avec le leadership et la participation des jeunes au cœur de chacun.",
    viewAllProgrammes: "Voir tous les programmes",
    portfolioEyebrow: "Portefeuille de programme",
    whyThisMatters: "Pourquoi c'est important",
    ourApproach: "Notre approche",
    resultsTitle: "Résultats & preuves",
    resultsEmpty:
      "Aucun résultat au niveau du programme n'a encore été publié pour ce portefeuille. Nous ne publions des résultats que lorsqu'ils reposent sur des preuves — le travail planifié est présenté comme tel.",
    learningTitle: "Ce que nous apprenons",
    partnersTitle: "Partenaires & écosystème",
    partnersLabel: "Partenaires",
    ecosystemLabel: "L'écosystème au sens large",
    nextPrioritiesTitle: "Prochaines priorités",
    nextPrioritiesNote: "Priorités d'avenir — pas des résultats déjà obtenus.",
    statusActive: "Actif",
    statusDeveloping: "En développement",
    statusPilot: "Pilote",
    statusPlanned: "Planifié",
    asOf: "Au {date}",
    readEvidenceCta: "Comment lire ces preuves →",
  },
  vantagePoint: {
    platformEyebrow: "Plateforme transprogrammes",
    purposeTitle: "À quoi elle sert",
    functionsTitle: "Ce qu'elle fera",
    relationshipTitle: "Son lien avec les portefeuilles",
    learnMore: "Découvrir Vantage Point",
    ctaNote:
      "Envie de construire la couche d'apprentissage et de dialogue de ce travail ? Parlez-nous de Vantage Point.",
  },
  project: {
    whyItMatters: "Pourquoi c'est important",
    whatWeDid: "Ce que nous avons fait",
    impact: "Impact",
    gallery: "Galerie",
    partners: "Partenaires",
    atAGlance: "En un coup d'œil",
    location: "Lieu",
    timeline: "Chronologie",
    beneficiaries: "Bénéficiaires",
    funding: "Financement",
    programmes: "Programmes",
    themes: "Thèmes",
    whoBenefits: "Qui bénéficie",
    sdgs: "ODD",
    supportProject: "Soutenir ce projet",
    relatedProjects: "Projets connexes",
    backToProjects: "Retour aux projets",
    status: "Statut",
    statusActive: "Actif",
    statusCompleted: "Terminé",
    statusPlanned: "Planifié",
  },
  impact: {
    title: "Impact & apprentissage",
    description:
      "Ce que nous avons mesuré, quelles preuves l'appuient, ce que nous apprenons — et ce qui reste incertain.",
    fromOutputs: "Des résultats au changement durable",
    outputsToLongTerm:
      "Notre travail est mesuré sur trois niveaux : ce que nous délivrons (résultats), les changements observés (effets), et l'avenir que nous construisons (impact à long terme).",
    geographicReach: "Portée géographique",
    geographicDescription:
      "Nous identifions les districts et communautés souvent négligés par les grandes ONG internationales et amplifions la portée des filets de sécurité sociale existants.",
    sdgsTitle: "Objectifs de développement durable",
    sdgDescription:
      "Nos programmes contribuent aux objectifs mondiaux suivants.",
    monitoring: "Suivi et évaluation",
    quantitative: "Quantitatif",
    qualitative: "Qualitatif",
    projectsBehind: "Projets derrière les chiffres",
    viewAllProjects: "Voir tous les projets",
    disclaimer:
      "Les chiffres présentés sont des enregistrements de l'équipe programme, non des résultats audités indépendamment. Chaque carte explique la période de rapport et la méthode de comptage, et renvoie au projet concerné.",
    outputBadge: "Résultat",
    outputDescription: "Ce que nous avons livré",
    outcomeBadge: "Effet",
    outcomeDescription: "Le changement observé",
    longTermBadge: "Impact à long terme",
    longTermDescription: "L'avenir que nous construisons",
    frameworkTitle: "Comment Vantage conçoit l'impact",
    frameworkDescription:
      "Nous distinguons ce qui a été livré de qui a été atteint, de ce qui a changé, de qui pourrait potentiellement en bénéficier et de ce que nous visons — pour qu'un objectif ne soit jamais confondu avec un résultat.",
    readEvidenceTitle: "Comment lire nos preuves",
    readEvidenceDescription:
      "Chaque chiffre publié porte un label décrivant le type d'affirmation qu'il constitue. Ces labels sont délibérés : ils rendent visible la force — et les limites — de chaque affirmation au lieu de les cacher.",
    evidenceDefinitions: {
      "verified":
        "Un chiffre vérifié contre un registre ou une source sous-jacente dont dispose Vantage. Vérifié ne signifie pas audité de manière indépendante.",
      "programme-team-figure":
        "Un chiffre issu des registres de mise en œuvre du programme — de vrais registres internes, non présentés comme audités de manière indépendante.",
      "estimated-catchment":
        "Une estimation de la population dans la zone de service potentielle d'une intervention — pas un décompte des personnes uniques directement servies.",
      "pilot":
        "Preuves ou enseignements issus d'une mise en œuvre précoce ou pilote — indicatifs, pas encore concluants.",
      "planned":
        "Un objectif, une activité prévue ou un état futur — pas un résultat obtenu.",
      "external-evidence":
        "Preuves provenant de l'extérieur de Vantage, citées pour expliquer le contexte ou la justification du programme — pas un résultat de Vantage.",
    },
    tocFeatureTitle: "Notre théorie du changement",
    tocFeatureDescription:
      "La logique reliant ce que Vantage fait au changement qu'elle recherche — y compris les hypothèses et les acteurs externes dont cette logique dépend.",
    tocFeatureCta: "Lire la théorie du changement",
    learningTitle: "Ce que Vantage apprend",
    learningDescription:
      "Observations issues de la mise en œuvre — ce qui a fonctionné, ce qui n'a pas fonctionné et ce que nous changeons ensuite. Les apprentissages sont attribués au programme dont ils proviennent.",
    learningFrom: "Depuis",
    evidenceLibraryTitle: "Bibliothèque de preuves",
    evidenceLibraryDescription:
      "Là où les résultats de preuves et d'apprentissage approuvés — notes de résultats, notes d'apprentissage, recherches et évaluations — seront publiés pour examen.",
    evidenceLibraryEmpty:
      "Aucune publication de preuves approuvée pour l'instant. Lorsque des résultats de preuves et d'apprentissage seront approuvés, ils apparaîtront ici avec leur statut, leur méthodologie et leur source — pas avant.",
    reportsTitle: "Rapports & redevabilité",
    reportsDescription:
      "Les rapports organisationnels formels — publications annuelles, financières, de programmes et de gouvernance — ne sont publiés qu'après approbation. Aucun rapport approuvé n'est encore public.",
    reportsCta: "Voir rapports & redevabilité",
    policiesTitle: "Politiques & redevabilité institutionnelle",
    policiesDescription:
      "Les politiques et mécanismes qui encadrent le travail de Vantage — sauvegarde, confidentialité, accessibilité et conditions — chacun sur sa propre page canonique.",
    vantagePointTitle: "Vantage Point",
    vantagePointDescription:
      "La plateforme transversale où apprentissage, dialogue, preuves et voix communautaires se connectent à travers les six portefeuilles. Actuellement planifiée — son statut est indiqué honnêtement, sans exagération.",
    vantagePointCta: "À propos de Vantage Point",
    ctaTitle: "Interrogez-nous sur nos preuves",
    ctaDescription:
      "Les questions sur un chiffre, une méthode ou ce que nous n'avons pas encore mesuré sont les bienvenues — cet examen est précisément le but de cette publication.",
  },
  toc: {
    title: "Théorie du changement",
    description:
      "La logique que Vantage croit mener au changement — avec les hypothèses sur lesquelles elle repose et les acteurs dont elle dépend rendus visibles.",
    statementHeading: "Ce que nous croyons mener au changement",
    assumptionsTitle: "Hypothèses dont nous dépendons",
    assumptionsDescription:
      "Toute théorie du changement repose sur des choses que ses auteurs ne contrôlent pas. Voici les nôtres — exposées pour que vous puissiez voir où notre logique pourrait se briser.",
    actorsTitle: "Acteurs externes dont nous dépendons",
    actorsDescription:
      "Vantage ne peut produire ces résultats seule. Voici les personnes et systèmes dont dépend le chemin du changement — la plupart sont des acteurs de l'écosystème, pas des partenaires contractuels.",
    measurementTitle: "Comment nous mesurons",
    measurementDescription:
      "Cinq choses distinctes dont Vantage parle dans ses rapports — tenues séparées pour qu'un chiffre de livraison ne soit jamais confondu avec un changement.",
    learningLoopTitle: "Comment l'apprentissage se réinjecte",
    learningLoopDescription:
      "La discipline que nous construisons : mettre en œuvre, observer, apprendre, adapter — pour que preuves et expérience changent ce que les programmes font ensuite.",
    limitationsTitle: "Là où nos preuves sont limitées",
    limitationsBody:
      "Notre base de preuves varie selon les programmes. Certains chiffres sont directement enregistrés, d'autres sont des rapports d'équipes de programme, d'autres des estimations, et certaines activités sont encore planifiées plutôt que réalisées. Nous préférons vous montrer les coutures plutôt que les masquer — quand une affirmation est incertaine, son label le dit.",
    inPracticeTitle: "Voir en pratique",
    viewProgrammes: "Explorer les six portefeuilles",
    viewImpact: "Voir résultats & preuves",
    viewVantagePoint: "Comment Vantage Point relie le tout",
  },
  stories: {
    title: "Récits et analyses",
    description:
      "Voix communautaires, mises à jour de programmes, recherches et réflexions de notre travail.",
    featured: "En vedette",
    searchPlaceholder: "Rechercher des récits et analyses...",
    filterCategoryLabel: "Filtrer par catégorie",
    noResults: "Aucun récit ne correspond à vos filtres.",
  },
  story: {
    updated: "Mis à jour",
    readTime: "Temps de lecture",
    takeAction: "Agir",
    ctaDescription: "Inspiré par ce récit ? Voici comment vous pouvez aider Vantage Foundation Uganda à créer plus d'impact.",
    moreStories: "Plus de récits et analyses",
    relatedProjects: "Projets connexes",
    share: "Partager",
    copyLink: "Copier le lien",
    copied: "Copié !",
    aboutTheAuthor: "À propos de l'auteur",
    originalLanguageNotice:
      "Ce contenu n'est actuellement disponible qu'en anglais.",
  },
  team: {
    title: "Notre équipe",
    description:
      "Une équipe jeune et ancrée dans les communautés, travaillant dans la santé, l'éducation et l'action humanitaire en Ouganda.",
    executive: "Direction exécutive",
    executiveDescription: "Orientation stratégique et opérations quotidiennes.",
    volunteers: "Bénévoles et contributeurs techniques",
    volunteersDescription:
      "Expertise clinique, technique et terrain, apportée bénévolement.",
    joinTitle: "Rejoignez notre équipe",
    joinDescription:
      "Nous sommes toujours heureux d'entendre des bénévoles, professionnels et partenaires souhaitant contribuer leur temps ou leur expertise.",
    volunteerCta: "Bénévolat ou partenariat avec nous",
    partnerCta: "Devenir partenaire",
    donateCta: "Faire un don",
    meetRest: "Rencontrer le reste de l'équipe",
    supportWork: "Soutenir ce travail",
  },
  teamMember: {
    backToTeam: "Retour à l'équipe",
    role: "Rôle",
    email: "Courriel",
    linkedIn: "LinkedIn",
    support: "Soutenir ce travail",
    volunteer: "Bénévole",
    donate: "Faire un don",
  },
  gallery: {
    title: "Galerie",
    description:
      "Moments capturés autour de nos forages, écoles et programmes communautaires en Ouganda.",
  },
  reports: {
    title: "Rapports et redevabilité",
    description:
      "La transparence est la clé de la confiance avec les communautés, les donateurs et les partenaires.",
    approvedReports: "Rapports approuvés",
    approvedDescription:
      "Documents approuvés pour publication, avec leur période et type de rapport.",
    publicationStatus: "État de publication par catégorie",
    publicationDescription:
      "Nous ne présentons pas de documents inachevés comme preuves publiées. Chaque section ci-dessous indique son statut actuel et ce qui y sera publié une fois approuvé.",
    policies: "Politiques",
    policiesDescription:
      "Nos engagements politiques publics sont disponibles. Les documents officiels seront liés dès leur approbation.",
    requestInfo: "Demander des informations",
    requestDescription:
      "Nous accueillons les demandes d'information des donateurs, partenaires, journalistes et membres de la communauté. Contactez-nous et nous répondrons dès que possible.",
    contactUs: "Contactez-nous",
    download: "Télécharger",
    emptyStatus: "En attente d'approbation",
    annualReports: "Rapports annuels",
    annualReportsDescription:
      "Résumés annuels de nos programmes, portée et développement organisationnel. Le premier rapport annuel sera publié ici dès son approbation.",
    financialReports: "Rapports financiers",
    financialReportsDescription:
      "États de revenus et de dépenses montrant comment les dons sont utilisés. Les états financiers seront ajoutés après approbation formelle.",
    projectReports: "Rapports de projets",
    projectReportsDescription:
      "Rapports détaillés de projets individuels — activités, résultats et leçons apprises. La documentation au niveau du projet est liée depuis chaque page de projet dès qu'elle est disponible.",
    safeguarding: "Protection",
    safeguardingDescription:
      "Notre politique de sauvegarde définit comment nous protégeons les enfants, les jeunes et les adultes vulnérables dans tous les programmes. La politique est en cours de finalisation.",
    governance: "Gouvernance",
    governanceDescription:
      "Vantage Foundation Uganda est dirigée par une équipe de direction publiée et travaille vers une structure formelle de conseil. Les documents de gouvernance seront ajoutés ici uniquement après approbation.",
    monitoring: "Suivi et évaluation",
    monitoringDescription:
      "Notre approche de mesure de l'impact combine des décomptes quantitatifs (patients traités, litres d'eau propre, participation aux ateliers) avec des études de cas qualitatives et les retours de la communauté.",
    projectReportsStatus: "Lié depuis les pages de projet",
    monitoringStatus: "Cadre en place",
  },
  legal: {
    privacy: "Politique de confidentialité",
    terms: "Conditions d'utilisation",
    safeguarding: "Politique de sauvegarde",
    accessibility: "Déclaration d'accessibilité",
    notTranslatedNotice:
      "Cette page n'est actuellement disponible qu'en anglais.",
  },
  brand: {
    title: "Guide de la marque",
    description:
      "Le système d'identité visuelle complet — logos, couleurs, typographie, composants et règles d'utilisation. Utilisez ce guide pour que chaque communication soit reconnaissable, crédible et cohérente.",
    logo: "Logo",
    colours: "Couleur",
    typography: "Typographie",
    imagery: "Photographie",
    usage: "Utilisation",
    contact: "Contact",
  },
  brandGuide: {
    title: "Guide de la marque",
    description:
      "Système d'identité visuelle de la Vantage Foundation Uganda — logos, couleurs, typographie, composants et règles d'utilisation.",
    eyebrow: "Système d'identité visuelle",
    heroTitle: "Guide de la marque de la Vantage Foundation Uganda",
    heroDescription:
      "Le système d'identité visuelle complet — logos, couleurs, typographie, composants et règles d'utilisation. Utilisez ce guide pour que chaque communication soit reconnaissable, crédible et cohérente.",
    navAriaLabel: "Sections du guide de la marque",
    nav: {
      foundations: "Fondements",
      logo: "Logo",
      colour: "Couleur",
      typography: "Typographie",
      components: "Composants",
      programme: "Couleurs des programmes",
      icons: "Iconographie",
      photography: "Photographie",
      accessibility: "Accessibilité",
      downloads: "Téléchargements",
    },
    sections: {
      foundations: {
        eyebrow: "Fondements",
        title: "Fondements de la marque",
        mission: "Mission",
        vision: "Vision",
        personality: "Personnalité",
        coreValues: "Valeurs fondamentales",
      },
      logo: {
        eyebrow: "Logo",
        title: "Système de logo",
        lede:
          "Le logo de la Vantage Foundation Uganda existe en trois versions. Utilisez la version horizontale pour les en-têtes et signatures, la version primaire empilée pour les documents officiels et couvertures, et le symbole seul pour les favicons, profils sociaux et petites applications.",
        primary: "Primaire / empilé",
        horizontal: "Horizontal",
        symbol: "Symbole seul",
        clearSpace: "Zone de protection",
        minSizes: "Tailles minimales",
        digital: "Numérique",
        print: "Impression",
        favicon: "Favicon",
        misuse: "Mauvaise utilisation du logo — ne jamais faire cela",
        primaryAlt: "Logo principal de la Vantage Foundation Uganda",
        horizontalAlt: "Logo horizontal de la Vantage Foundation Uganda",
        symbolAlt: "Symbole de la Vantage Foundation Uganda",
      },
      colour: {
        eyebrow: "Couleur",
        title: "Système de couleurs",
        lede:
          "Trois couleurs dominantes, environ un tiers chacune : le teal, le blanc et le noir/anthracite foncé pour le texte et les sections sombres. Ratio cible : ~33 % blanc/neutre, ~33 % teal, ~33 % noir/anthracite.",
        primaryPalette: "Palette principale",
        accessiblePairings: "Associations accessibles",
        warning: "Avertissement :",
      },
      typography: {
        eyebrow: "Typographie",
        title: "Typographie",
        lede:
          "Inter est la police principale, chargée via next/font/google avec une police système robuste en secours. Évitez les majuscules excessives — réservez-les aux courtes étiquettes et sous-titres.",
      },
      components: {
        eyebrow: "Composants",
        title: "Composants d'interface",
        buttons: "Boutons",
        badges: "Badges",
        cards: "Cartes",
        onDark: "Sur fond sombre",
      },
      programme: {
        eyebrow: "Couleurs des programmes",
        title: "Couleurs d'accent par programme",
        lede:
          "Chaque domaine de programme a une couleur d'accent reconnaissable, toujours associée à une icône et à un label textuel. La couleur n'est jamais le seul moyen de transmettre une catégorie (WCAG 2.2 §1.4.1).",
      },
      iconography: {
        eyebrow: "Iconographie",
        title: "Iconographie",
        lede:
          "Les icônes sont contours, arrondies et d'épaisseur de trait constante (Lucide). Elles servent la catégorisation des programmes et l'orientation. Taille par défaut 1,25rem, 1,5rem pour les contextes fonctionnels.",
      },
      photography: {
        eyebrow: "Photographie",
        title: "Direction photographique",
        lede:
          "La photographie authentique de Vantage Foundation est l'actif visuel principal. Privilégiez les vraies communautés, les bénévoles en action, la mise en œuvre sur le terrain et les résultats visibles. Évitez les images compassionnelles et les gros plans déshumanisants.",
        cropPresets: "Préréglages de recadrage",
      },
      accessibility: {
        eyebrow: "Accessibilité",
        title: "Accessibilité",
        lede:
          "Le système de marque vise WCAG 2.2 AA. Le contraste des couleurs, le focus clavier, la structure sémantique et la prise en charge des mouvements réduits sont intégrés.",
      },
      downloads: {
        eyebrow: "Téléchargements",
        title: "Ressources approuvées",
        lede:
          "Tous les fichiers logo sont de vrais SVG vectoriels (moins de 15 Ko chacun, redimensionnables à toutes tailles). Les fichiers se trouvent dans public/brand/logos/. Ne redistribuez pas les polices propriétaires.",
        fullDocs: "Documentation complète :",
      },
    },
  },
  footer: {
    vantageCare: "Vantage Care",
    kikumiKyoAcademy: "Académie KikumiKyo",
  },
  ui: uiContent.fr,
};

const spanishPageContent: DeepPartial<PageContent> = {
  common: {
    viewProject: "Ver el proyecto",
    readFullBio: "Leer biografía completa",
    readStory: "Leer la historia",
    viewStory: "Leer la historia",
    viewTeamMember: "Ver perfil",
    seeDetails: "Ver detalles",
    viewGallery: "Ver galería",
    downloadReport: "Descargar",
    minRead: "{minutes} min de lectura",
    viewEvidence: "Ver evidencia del proyecto",
    programme: "Programa",
    placeAndPeriod: "Lugar y período",
    howCounted: "Cómo se contó",
    evidenceStatus: {
      "verified": "Verificado",
      "programme-team-figure": "Dato del equipo del programa",
      "estimated-catchment": "Área de influencia estimada",
      "pilot": "Piloto / hallazgo preliminar",
      "planned": "Planificado / objetivo",
      "external-evidence": "Evidencia externa",
    },
    search: "Buscar",
    searchProjectsPlaceholder: "Buscar proyectos...",
    searchStoriesPlaceholder: "Buscar historias y reflexiones...",
    all: "Todos",
    filterByCategory: "Filtrar por categoría",
    filterByStatus: "Filtrar por estado",
    noProjectsMatch: "Ningún proyecto coincide con tus filtros.",
    noStoriesMatch: "Ninguna historia coincide con tus filtros.",
    about: "sobre",
    aboutUs: "Sobre nosotros",
    donate: "Donar",
    volunteer: "Ser voluntario",
    partnerWithUs: "Asociarse con nosotros",
    contactVantage: "Contactar a Vantage",
    visitProgrammes: "Visitar programas",
    donateNow: "Donar ahora",
    updated: "Actualizado el {date}",
    published: "Publicado el {date}",
    readTime: "Tiempo de lectura",
    takeAction: "Actuar",
    browseAllStories: "Ver todas las historias",
    browseAllProjects: "Ver todos los proyectos",
    moreStories: "Más historias y reflexiones",
    filter: "Filtro:",
    openInNew: "Se abre en una pestaña nueva",
    share: "Compartir",
    copyLink: "Copiar enlace",
    copied: "Copiado",
    backTo: "Volver a",
    close: "Cerrar",
    breadcrumb: "Ruta de navegación",
    viewAllProgrammes: "Ver todos los programas",
    status: "Estado",
    flagship: "Insignia",
    sources: "Fuentes",
    email: "Correo electrónico",
    linkedIn: "LinkedIn",
    home: "Inicio",
    shareOn: "Compartir en",
  },
  ourWork: {
    title: "Nuestro trabajo",
    description:
      "Seis carteras de programas interconectadas, diseñadas en torno a las realidades que enfrentan las comunidades — más Vantage Point, la plataforma que conecta el aprendizaje entre todas.",
    programmeSuffix: "Programa",
    relatedProjects: "Proyectos relacionados",
    projectCount: "{count} proyectos",
    developingNote: "Cartera en desarrollo — dirección publicada, trabajo en formalización",
  },
  projects: {
    eyebrow: "Proyectos",
    title: "Proyectos destacados",
    description:
      "Una muestra de nuestro trabajo en agua limpia, salud menstrual, mentoría y educación.",
    viewAll: "Ver todos los proyectos",
    searchPlaceholder: "Buscar proyectos...",
    filterCategoryLabel: "Filtrar por categoría",
    filterStatusLabel: "Filtrar por estado",
    noResults: "Ningún proyecto coincide con tus filtros.",
    statusActive: "Activo",
    statusCompleted: "Completado",
    statusPlanned: "Planificado",
  },
  programme: {
    aboutTitle: "Sobre este programa",
    whatWeDo: "Qué hacemos",
    getInvolved: "Participar",
    donateToProgramme: "Donar a este programa",
    volunteerWithUs: "Ser voluntario con nosotros",
    visitPlatform: "Visitar la plataforma de aprendizaje",
    projectsIn: "Proyectos en {programme}",
    storiesFrom: "Historias de este programa",
    photosFrom: "Fotos de {programme}",
    exploreOther: "Explora nuestros otros programas",
    workAcross:
      "Trabajamos a través de seis carteras de programas interconectadas, con el liderazgo y la participación juvenil en todas ellas.",
    viewAllProgrammes: "Ver todos los programas",
    portfolioEyebrow: "Cartera de programa",
    whyThisMatters: "Por qué es importante",
    ourApproach: "Nuestro enfoque",
    resultsTitle: "Resultados y evidencia",
    resultsEmpty:
      "Aún no se han publicado resultados a nivel de programa para esta cartera. Solo publicamos resultados cuando hay evidencia que los respalde — el trabajo planificado se presenta como planificado.",
    learningTitle: "Lo que estamos aprendiendo",
    partnersTitle: "Socios y ecosistema",
    partnersLabel: "Socios",
    ecosystemLabel: "El ecosistema más amplio",
    nextPrioritiesTitle: "Próximas prioridades",
    nextPrioritiesNote: "Prioridades de futuro — no resultados ya logrados.",
    statusActive: "Activo",
    statusDeveloping: "En desarrollo",
    statusPilot: "Piloto",
    statusPlanned: "Planificado",
    asOf: "A fecha de {date}",
    readEvidenceCta: "Cómo leer esta evidencia →",
  },
  vantagePoint: {
    platformEyebrow: "Plataforma interprogramas",
    purposeTitle: "Para qué sirve",
    functionsTitle: "Qué hará",
    relationshipTitle: "Cómo se relaciona con las carteras",
    learnMore: "Explorar Vantage Point",
    ctaNote:
      "¿Te interesa construir la capa de aprendizaje y diálogo de este trabajo? Hablemos de Vantage Point.",
  },
  project: {
    whyItMatters: "Por qué importa",
    whatWeDid: "Qué hicimos",
    impact: "Impacto",
    gallery: "Galería",
    partners: "Socios",
    atAGlance: "De un vistazo",
    location: "Ubicación",
    timeline: "Cronología",
    beneficiaries: "Beneficiarios",
    funding: "Financiamiento",
    programmes: "Programas",
    themes: "Temas",
    whoBenefits: "Quiénes se benefician",
    sdgs: "ODS",
    supportProject: "Apoyar este proyecto",
    relatedProjects: "Proyectos relacionados",
    backToProjects: "Volver a proyectos",
    status: "Estado",
    statusActive: "Activo",
    statusCompleted: "Completado",
    statusPlanned: "Planificado",
  },
  impact: {
    title: "Impacto y aprendizaje",
    description:
      "Lo que hemos medido, qué evidencia lo respalda, lo que estamos aprendiendo — y lo que sigue incierto.",
    fromOutputs: "De los resultados al cambio a largo plazo",
    outputsToLongTerm:
      "Nuestro trabajo se mide en tres niveles: lo que entregamos (resultados), los cambios que vemos (efectos) y el futuro que estamos construyendo (impacto a largo plazo).",
    geographicReach: "Alcance geográfico",
    geographicDescription:
      "Identificamos distritos y comunidades que a menudo son pasados por alto por ONG internacionales más grandes y ampliamos el alcance de las redes de seguridad social existentes.",
    sdgsTitle: "Objetivos de Desarrollo Sostenible",
    sdgDescription: "Nuestros programas contribuyen a los siguientes objetivos globales.",
    monitoring: "Monitoreo y evaluación",
    quantitative: "Cuantitativo",
    qualitative: "Cualitativo",
    projectsBehind: "Proyectos detrás de los números",
    viewAllProjects: "Ver todos los proyectos",
    disclaimer:
      "Las cifras mostradas arriba son registros del equipo de programa, no resultados auditados de forma independiente. Cada tarjeta explica el período de reporte y el método de conteo, y enlaza al proyecto relevante.",
    outputBadge: "Resultado",
    outputDescription: "Lo que entregamos",
    outcomeBadge: "Efecto",
    outcomeDescription: "El cambio que vimos",
    longTermBadge: "Impacto a largo plazo",
    longTermDescription: "El futuro que estamos construyendo",
    frameworkTitle: "Cómo concibe Vantage el impacto",
    frameworkDescription:
      "Separamos lo que se entregó de a quién se alcanzó, qué cambió, quién podría beneficiarse potencialmente y qué pretendemos — para que una meta nunca se confunda con un resultado.",
    readEvidenceTitle: "Cómo leer nuestra evidencia",
    readEvidenceDescription:
      "Cada cifra publicada lleva una etiqueta que describe qué tipo de afirmación es. Estas etiquetas son deliberadas: hacen visible la fuerza — y los límites — de cada afirmación en lugar de ocultarlos.",
    evidenceDefinitions: {
      "verified":
        "Una cifra comprobada contra un registro o fuente subyacente disponible para Vantage. Verificada no significa auditada de forma independiente.",
      "programme-team-figure":
        "Una cifra procedente de los registros de implementación del programa — registros internos reales, no presentados como auditados independientemente.",
      "estimated-catchment":
        "Una estimación de la población dentro del área de servicio potencial de una intervención — no un recuento de personas únicas atendidas directamente.",
      "pilot":
        "Evidencia o aprendizaje de una implementación temprana o piloto — indicativa, aún no concluyente.",
      "planned":
        "Una meta, una actividad prevista o un estado futuro — no un resultado logrado.",
      "external-evidence":
        "Evidencia originada fuera de Vantage, citada para explicar el contexto o la justificación del programa — no un resultado de Vantage.",
    },
    tocFeatureTitle: "Nuestra teoría del cambio",
    tocFeatureDescription:
      "La lógica que conecta lo que Vantage hace con el cambio que busca — incluidos los supuestos y actores externos de los que depende esa lógica.",
    tocFeatureCta: "Leer la teoría del cambio",
    learningTitle: "Lo que Vantage está aprendiendo",
    learningDescription:
      "Observaciones registradas de la implementación — qué funcionó, qué no y qué cambiamos a continuación. El aprendizaje se atribuye al programa del que procede.",
    learningFrom: "De",
    evidenceLibraryTitle: "Biblioteca de evidencia",
    evidenceLibraryDescription:
      "Donde se publicarán para inspección los resultados de evidencia y aprendizaje aprobados — informes de resultados, notas de aprendizaje, investigación y evaluaciones.",
    evidenceLibraryEmpty:
      "Aún no hay publicaciones de evidencia aprobadas. Cuando se aprueben resultados de evidencia y aprendizaje, aparecerán aquí con su estado, metodología y fuente — no antes.",
    reportsTitle: "Informes y rendición de cuentas",
    reportsDescription:
      "Los informes organizativos formales — publicaciones anuales, financieras, de programas y de gobernanza — solo se publican una vez aprobados. Aún no hay informes aprobados públicos.",
    reportsCta: "Ver informes y rendición de cuentas",
    policiesTitle: "Políticas y rendición de cuentas institucional",
    policiesDescription:
      "Las políticas y mecanismos que rigen el trabajo de Vantage — salvaguarda, privacidad, accesibilidad y términos — cada uno en su propia página canónica.",
    vantagePointTitle: "Vantage Point",
    vantagePointDescription:
      "La plataforma transversal donde el aprendizaje, el diálogo, la evidencia y las voces de la comunidad conectan los seis portafolios. Actualmente planificada — su estado se indica honestamente, sin inflarse.",
    vantagePointCta: "Sobre Vantage Point",
    ctaTitle: "Pregúntenos sobre nuestra evidencia",
    ctaDescription:
      "Las preguntas sobre una cifra, un método o lo que aún no hemos medido son bienvenidas — ese escrutinio es precisamente el objetivo de publicar esto.",
  },
  toc: {
    title: "Teoría del cambio",
    description:
      "La lógica que Vantage cree que conduce al cambio — con los supuestos sobre los que se apoya y los actores de los que depende hechos visibles.",
    statementHeading: "Lo que creemos que conduce al cambio",
    assumptionsTitle: "Supuestos de los que dependemos",
    assumptionsDescription:
      "Toda teoría del cambio se apoya en cosas que sus autores no controlan. Estos son los nuestros — expuestos para que pueda ver dónde podría romperse nuestra lógica.",
    actorsTitle: "Actores externos de los que dependemos",
    actorsDescription:
      "Vantage no puede producir estos resultados por sí sola. Estas son las personas y los sistemas de los que depende el camino del cambio — la mayoría son actores del ecosistema, no socios contractuales.",
    measurementTitle: "Cómo medimos",
    measurementDescription:
      "Cinco cosas distintas de las que habla Vantage al informar — mantenidas separadas para que una cifra de entrega nunca se confunda con un cambio.",
    learningLoopTitle: "Cómo el aprendizaje se realimenta",
    learningLoopDescription:
      "La disciplina que estamos construyendo: implementar, observar, aprender, adaptar — para que la evidencia y la experiencia cambien lo que los programas hacen después.",
    limitationsTitle: "Dónde es limitada nuestra evidencia",
    limitationsBody:
      "Nuestra base de evidencia varía entre programas. Algunas cifras se registran directamente, otras son informes de equipos de programa, otras son estimaciones, y parte del trabajo está aún planificado en lugar de realizado. Preferimos mostrarle las costuras antes que taparlas — cuando una afirmación es incierta, su etiqueta lo dice.",
    inPracticeTitle: "Verlo en la práctica",
    viewProgrammes: "Explorar los seis portafolios",
    viewImpact: "Ver resultados y evidencia",
    viewVantagePoint: "Cómo Vantage Point lo conecta",
  },
  stories: {
    title: "Historias y reflexiones",
    description:
      "Voces comunitarias, actualizaciones de programas, investigaciones y reflexiones de nuestro trabajo.",
    featured: "Destacado",
    searchPlaceholder: "Buscar historias y reflexiones...",
    filterCategoryLabel: "Filtrar por categoría",
    noResults: "Ninguna historia coincide con tus filtros.",
  },
  story: {
    updated: "Actualizado",
    readTime: "Tiempo de lectura",
    takeAction: "Actuar",
    ctaDescription:
      "¿Te inspiró esta historia? Aquí tienes formas en las que puedes ayudar a Vantage Foundation Uganda a crear más impacto.",
    moreStories: "Más historias y reflexiones",
    relatedProjects: "Proyectos relacionados",
    share: "Compartir",
    copyLink: "Copiar enlace",
    copied: "¡Copiado!",
    aboutTheAuthor: "Sobre el autor",
    originalLanguageNotice:
      "Este contenido está disponible actualmente solo en inglés.",
  },
  team: {
    title: "Nuestro equipo",
    description:
      "Un equipo dirigido por jóvenes y arraigado en las comunidades, que trabaja en salud, educación y acción humanitaria en Uganda.",
    executive: "Dirección ejecutiva",
    executiveDescription: "Dirección estratégica y operaciones diarias.",
    volunteers: "Voluntarios y colaboradores técnicos",
    volunteersDescription:
      "Experiencia clínica, técnica y de campo, aportada de forma voluntaria.",
    joinTitle: "Únete a nuestro equipo",
    joinDescription:
      "Siempre nos complace conocer voluntarios, profesionales y socios que desean contribuir con su tiempo o experiencia.",
    volunteerCta: "Ser voluntario o asociarse con nosotros",
    partnerCta: "Asociarse con nosotros",
    donateCta: "Donar",
    meetRest: "Conocer al resto del equipo",
    supportWork: "Apoyar este trabajo",
  },
  teamMember: {
    backToTeam: "Volver al equipo",
    role: "Rol",
    email: "Correo electrónico",
    linkedIn: "LinkedIn",
    support: "Apoyar este trabajo",
    volunteer: "Ser voluntario",
    donate: "Donar",
  },
  gallery: {
    title: "Galería",
    description:
      "Momentos de nuestros pozos, escuelas y programas comunitarios en Uganda.",
  },
  reports: {
    title: "Informes y rendición de cuentas",
    description:
      "La transparencia es cómo construimos confianza con las comunidades, donantes y socios.",
    approvedReports: "Informes aprobados",
    approvedDescription:
      "Documentos autorizados para su publicación, con su período de reporte y tipo.",
    publicationStatus: "Estado de publicación por categoría",
    publicationDescription:
      "No presentamos documentos incompletos como evidencia publicada. Cada sección muestra su estado actual y lo que aparecerá en ella cuando sea aprobado.",
    policies: "Políticas",
    policiesDescription:
      "Nuestros compromisos de políticas públicas están disponibles ahora. Los documentos formales de políticas se vincularán a medida que sean aprobados.",
    requestInfo: "Solicitar información",
    requestDescription:
      "Recibimos con agrado las solicitudes de información de donantes, socios, periodistas y miembros de la comunidad. Escríbenos y responderemos lo antes posible.",
    contactUs: "Contáctanos",
    download: "Descargar",
    emptyStatus: "Pendiente de aprobación",
    annualReports: "Informes anuales",
    annualReportsDescription:
      "Resúmenes anuales de nuestros programas, alcance y desarrollo organizacional. El primer informe anual se publicará aquí una vez aprobado para su publicación.",
    financialReports: "Informes financieros",
    financialReportsDescription:
      "Estados de ingresos y gastos que muestran cómo se usan las donaciones. Los estados financieros se agregarán tras su aprobación formal.",
    projectReports: "Informes de proyectos",
    projectReportsDescription:
      "Informes detallados de proyectos individuales, incluidas actividades, resultados y lecciones aprendidas. La documentación a nivel de proyecto se vincula desde cada página de proyecto a medida que esté disponible.",
    safeguarding: "Protección",
    safeguardingDescription:
      "Nuestra política de protección establece cómo protegemos a niñas, niños, adolescentes y adultos vulnerables en todos los programas. La política se está finalizando para su publicación.",
    governance: "Gobernanza",
    governanceDescription:
      "Vantage Foundation Uganda está dirigida por un equipo de liderazgo publicado y trabaja hacia una estructura formal de junta directiva. Los documentos de gobernanza se agregarán aquí solo después de su aprobación.",
    monitoring: "Monitoreo y evaluación",
    monitoringDescription:
      "Nuestro enfoque para medir el impacto combina recuentos cuantitativos (pacientes atendidos, litros de agua proporcionados, asistencia a talleres) con estudios de caso cualitativos y retroalimentación de la comunidad.",
    projectReportsStatus: "Vinculados desde las páginas de proyecto",
    monitoringStatus: "Marco en vigor",
  },
  legal: {
    privacy: "Política de privacidad",
    terms: "Términos de uso",
    safeguarding: "Política de protección",
    accessibility: "Declaración de accesibilidad",
    notTranslatedNotice:
      "Esta página está disponible actualmente solo en inglés.",
  },
  brand: {
    title: "Guía de marca",
    description:
      "El sistema completo de identidad visual — logotipos, colores, tipografía, componentes y reglas de uso. Usa esta guía para que cada comunicación sea reconocible, creíble y coherente.",
    logo: "Logotipo",
    colours: "Color",
    typography: "Tipografía",
    imagery: "Fotografía",
    usage: "Uso",
    contact: "Contacto",
  },
  brandGuide: {
    title: "Guía de marca",
    description:
      "Sistema de identidad visual de Vantage Foundation Uganda — logotipos, colores, tipografía, componentes y reglas de uso.",
    eyebrow: "Sistema de identidad visual",
    heroTitle: "Guía de marca de Vantage Foundation Uganda",
    heroDescription:
      "El sistema completo de identidad visual — logotipos, colores, tipografía, componentes y reglas de uso. Usa esta guía para que cada comunicación sea reconocible, creíble y coherente.",
    navAriaLabel: "Secciones de la guía de marca",
    nav: {
      foundations: "Fundamentos",
      logo: "Logotipo",
      colour: "Color",
      typography: "Tipografía",
      components: "Componentes",
      programme: "Colores del programa",
      icons: "Iconografía",
      photography: "Fotografía",
      accessibility: "Accesibilidad",
      downloads: "Descargas",
    },
    sections: {
      foundations: {
        eyebrow: "Fundamentos",
        title: "Fundamentos de la marca",
        mission: "Misión",
        vision: "Visión",
        personality: "Personalidad",
        coreValues: "Valores fundamentales",
      },
      logo: {
        eyebrow: "Logotipo",
        title: "Sistema de logotipo",
        lede:
          "El logotipo de Vantage Foundation Uganda tiene tres variantes de composición. Usa la versión horizontal para encabezados y firmas, la versión primaria apilada para documentos formales y portadas, y solo el símbolo para favicons, perfiles sociales y aplicaciones pequeñas.",
        primary: "Primaria / apilada",
        horizontal: "Horizontal",
        symbol: "Solo símbolo",
        clearSpace: "Espacio de protección",
        minSizes: "Tamaños mínimos",
        digital: "Digital",
        print: "Impresión",
        favicon: "Favicon",
        misuse: "Uso incorrecto del logotipo: nunca hagas esto",
        primaryAlt: "Logotipo primario de Vantage Foundation Uganda",
        horizontalAlt: "Logotipo horizontal de Vantage Foundation Uganda",
        symbolAlt: "Símbolo de Vantage Foundation Uganda",
      },
      colour: {
        eyebrow: "Color",
        title: "Sistema de color",
        lede:
          "Exactamente tres colores dominantes, aproximadamente un tercio cada uno: verde azulado, blanco y negro/carbón oscuro para texto y secciones oscuras. Relación objetivo: ~33% blanco/neutro, ~33% verde azulado, ~33% negro/carbón.",
        primaryPalette: "Paleta principal",
        accessiblePairings: "Combinaciones accesibles",
        warning: "Advertencia:",
      },
      typography: {
        eyebrow: "Tipografía",
        title: "Tipografía",
        lede:
          "Inter es la tipografía principal, cargada a través de next/font/google con una fuente del sistema robusta como respaldo. Evita el uso excesivo de mayúsculas; resérvalo para etiquetas cortas y subtítulos.",
      },
      components: {
        eyebrow: "Componentes",
        title: "Componentes de interfaz",
        buttons: "Botones",
        badges: "Insignias",
        cards: "Tarjetas",
        onDark: "Sobre fondo oscuro",
      },
      programme: {
        eyebrow: "Colores del programa",
        title: "Colores de acento del programa",
        lede:
          "Cada área de programa tiene un color de acento reconocible, siempre combinado con un icono y una etiqueta de texto. El color nunca es el único medio para transmitir una categoría (WCAG 2.2 §1.4.1).",
      },
      iconography: {
        eyebrow: "Iconografía",
        title: "Iconografía",
        lede:
          "Los iconos son de línea, redondeados y de grosor de trazo uniforme (Lucide). Apoyan la categorización de programas y la orientación. Usa 1,25rem por defecto y 1,5rem en contextos de funciones.",
      },
      photography: {
        eyebrow: "Fotografía",
        title: "Dirección fotográfica",
        lede:
          "La fotografía auténtica de Vantage Foundation es el activo visual principal. Prioriza comunidades reales, voluntarios en acción, implementación en el campo y resultados visibles. Evita imágenes que busquen lástima y primeros planos deshumanizantes.",
        cropPresets: "Ajustes preestablecidos de recorte",
      },
      accessibility: {
        eyebrow: "Accesibilidad",
        title: "Accesibilidad",
        lede:
          "El sistema de marca apunta a WCAG 2.2 AA. El contraste de color, el foco del teclado, la estructura semántica y el soporte de movimiento reducido están integrados.",
      },
      downloads: {
        eyebrow: "Descargas",
        title: "Recursos aprobados",
        lede:
          "Todos los archivos de logotipo son SVG vectoriales reales (menos de 15 KB cada uno, escalables a cualquier tamaño). Los archivos se encuentran en public/brand/logos/. No redistribuyas fuentes propietarias.",
        fullDocs: "Documentación completa:",
      },
    },
  },
  footer: {
    vantageCare: "Vantage Care",
    kikumiKyoAcademy: "KikumiKyo Academy",
  },
  ui: uiContent.es,
};

const arabicPageContent: DeepPartial<PageContent> = {
  common: {
    viewProject: "عرض المشروع",
    readFullBio: "قراءة السيرة الذاتية الكاملة",
    readStory: "قراءة القصة",
    viewStory: "قراءة القصة",
    viewTeamMember: "عرض الملف الشخصي",
    seeDetails: "عرض التفاصيل",
    viewGallery: "عرض المعرض",
    downloadReport: "تحميل",
    minRead: "{minutes} دقيقة للقراءة",
    viewEvidence: "عرض أدلة المشروع",
    programme: "البرنامج",
    placeAndPeriod: "المكان والفترة",
    howCounted: "كيف تم العد",
    evidenceStatus: {
      "verified": "موثَّق",
      "programme-team-figure": "رقم من فريق البرنامج",
      "estimated-catchment": "نطاق خدمة تقديري",
      "pilot": "تجريبي / نتيجة أولية",
      "planned": "مخطط / مستهدف",
      "external-evidence": "دليل خارجي",
    },
    search: "بحث",
    searchProjectsPlaceholder: "البحث في المشاريع...",
    searchStoriesPlaceholder: "البحث في القصص والرؤى...",
    all: "الكل",
    filterByCategory: "تصفية حسب الفئة",
    filterByStatus: "تصفية حسب الحالة",
    noProjectsMatch: "لا توجد مشاريع تطابق عوامل التصفية.",
    noStoriesMatch: "لا توجد قصص تطابق عوامل التصفية.",
    about: "حول",
    aboutUs: "من نحن",
    donate: "تبرع",
    volunteer: "تطوع",
    partnerWithUs: "شاركنا الشراكة",
    contactVantage: "التواصل مع Vantage",
    visitProgrammes: "زيارة البرامج",
    donateNow: "تبرع الآن",
    updated: "تم التحديث بتاريخ {date}",
    published: "تم النشر بتاريخ {date}",
    readTime: "وقت القراءة",
    takeAction: "تحرك",
    browseAllStories: "استعراض جميع القصص",
    browseAllProjects: "استعراض جميع المشاريع",
    moreStories: "المزيد من القصص والرؤى",
    filter: "عامل التصفية:",
    openInNew: "يفتح في علامة تبويب جديدة",
    share: "مشاركة",
    copyLink: "نسخ الرابط",
    copied: "تم النسخ",
    backTo: "العودة إلى",
    close: "إغلاق",
    breadcrumb: "مسار التنقل",
    viewAllProgrammes: "عرض جميع البرامج",
    status: "الحالة",
    flagship: "البرنامج الرائد",
    sources: "المصادر",
    email: "البريد الإلكتروني",
    linkedIn: "LinkedIn",
    home: "الرئيسية",
    shareOn: "المشاركة على",
  },
  ourWork: {
    title: "عملنا",
    description:
      "ست محافظ برامج مترابطة، صُممت بناءً على واقع المجتمعات — بالإضافة إلى Vantage Point، المنصة التي تربط التعلم بينها جميعًا.",
    programmeSuffix: "البرنامج",
    relatedProjects: "المشاريع ذات الصلة",
    projectCount: "{count} مشاريع",
    developingNote: "محفظة قيد التطوير — الاتجاه منشور والعمل قيد الترسيخ",
  },
  projects: {
    eyebrow: "المشاريع",
    title: "المشاريع المميزة",
    description:
      "لمحة عن عملنا في المياه النقية والصحة الحيضية والتوجيه والتعليم.",
    viewAll: "عرض جميع المشاريع",
    searchPlaceholder: "البحث في المشاريع...",
    filterCategoryLabel: "تصفية حسب الفئة",
    filterStatusLabel: "تصفية حسب الحالة",
    noResults: "لا توجد مشاريع تطابق عوامل التصفية.",
    statusActive: "نشط",
    statusCompleted: "مكتمل",
    statusPlanned: "مخطط",
  },
  programme: {
    aboutTitle: "حول هذا البرنامج",
    whatWeDo: "ما نقوم به",
    getInvolved: "المشاركة",
    donateToProgramme: "تبرع لهذا البرنامج",
    volunteerWithUs: "تطوع معنا",
    visitPlatform: "زيارة منصة التعلم",
    projectsIn: "مشاريع في {programme}",
    storiesFrom: "قصص من هذا البرنامج",
    photosFrom: "صور من {programme}",
    exploreOther: "استكشف برامجنا الأخرى",
    workAcross:
      "نعمل عبر ست محافظ برامج مترابطة، مع قيادة الشباب ومشاركتهم تخترقها جميعًا.",
    portfolioEyebrow: "محفظة برنامج",
    whyThisMatters: "لماذا هذا مهم",
    ourApproach: "نهجنا",
    resultsTitle: "النتائج والأدلة",
    resultsEmpty:
      "لم تُنشر بعد نتائج على مستوى البرنامج لهذه المحفظة. ننشر النتائج فقط عندما تكون مدعومة بالأدلة — ويُعرض العمل المخطط بوصفه مخططًا.",
    learningTitle: "ما نتعلمه",
    partnersTitle: "الشركاء والمنظومة",
    partnersLabel: "الشركاء",
    ecosystemLabel: "المنظومة الأوسع",
    nextPrioritiesTitle: "الأولويات القادمة",
    nextPrioritiesNote: "أولويات مستقبلية — وليست نتائج محققة.",
    statusActive: "نشط",
    statusDeveloping: "قيد التطوير",
    statusPilot: "تجريبي",
    statusPlanned: "مخطط",
    asOf: "حتى {date}",
    readEvidenceCta: "كيف تقرأ هذه الأدلة ←",
    viewAllProgrammes: "عرض جميع البرامج",
  },
  vantagePoint: {
    platformEyebrow: "منصة عبر البرامج",
    purposeTitle: "ما الغاية منها",
    functionsTitle: "ماذا ستفعل",
    relationshipTitle: "علاقتها بالمحافظ",
    learnMore: "استكشف Vantage Point",
    ctaNote:
      "مهتم ببناء طبقة التعلم والحوار في هذا العمل؟ تحدث معنا عن Vantage Point.",
  },
  project: {
    whyItMatters: "لماذا يهم",
    whatWeDid: "ما قمنا به",
    impact: "الأثر",
    gallery: "المعرض",
    partners: "الشركاء",
    atAGlance: "لمحة سريعة",
    location: "الموقع",
    timeline: "الجدول الزمني",
    beneficiaries: "المستفيدون",
    funding: "التمويل",
    programmes: "البرامج",
    themes: "المواضيع",
    whoBenefits: "من يستفيد",
    sdgs: "SDGs",
    supportProject: "دعم هذا المشروع",
    relatedProjects: "المشاريع ذات الصلة",
    backToProjects: "العودة إلى المشاريع",
    status: "الحالة",
    statusActive: "نشط",
    statusCompleted: "مكتمل",
    statusPlanned: "مخطط",
  },
  impact: {
    title: "الأثر والتعلم",
    description: "أدلة على التغيير، تقاس بالصدق والأمل.",
    fromOutputs: "من المخرجات إلى التغيير طويل المدى",
    outputsToLongTerm:
      "يتم قياس عملنا على ثلاثة مستويات: ما نقدمه (المخرجات)، والتغييرات التي نراها (النتائج)، والمستقبل الذي نبنيه (الأثر طويل المدى).",
    geographicReach: "الانتشار الجغرافي",
    geographicDescription:
      "نحدد الأحياء والمجتمعات التي غالبًا ما تغفل عنها المنظمات غير الحكومية الدولية الكبرى، ونكبر من نطاق شبكات الأمان الاجتماعي القائمة.",
    sdgsTitle: "أهداف التنمية المستدامة",
    sdgDescription: "مساهمة برامجنا في الأهداف العالمية التالية.",
    monitoring: "المراقبة والتقييم",
    quantitative: "كمي",
    qualitative: "نوعي",
    projectsBehind: "المشاريع وراء الأرقام",
    viewAllProjects: "عرض جميع المشاريع",
    disclaimer:
      "الأرقام الموضحة أعلاه هي سجلات فريق البرنامج، وليست نتائج مدققة بشكل مستقل. توضح كل بطاقة فترة التقرير وطريقة العد، وترتبط بالمشروع المعني.",
    outputBadge: "المخرج",
    outputDescription: "ما قدمناه",
    outcomeBadge: "النتيجة",
    outcomeDescription: "التغيير الذي رأيناه",
    longTermBadge: "الأثر طويل المدى",
    longTermDescription: "المستقبل الذي نبنيه",
    frameworkTitle: "كيف تفهم Vantage الأثر",
    frameworkDescription:
      "نفصل ما تم تقديمه عمّن تم الوصول إليهم، وعمّا تغيّر، وعمّن قد يستفيدون محتملاً، وعمّا نعتزم تحقيقه — حتى لا يُخلَط هدف بنتيجة أبداً.",
    readEvidenceTitle: "كيف تقرأ أدلتنا",
    readEvidenceDescription:
      "كل رقم منشور يحمل تصنيفاً يصف نوع الادعاء الذي يمثله. هذه التصنيفات مقصودة: فهي تجعل قوة — وحدود — كل ادعاء مرئية بدلاً من إخفائها.",
    evidenceDefinitions: {
      "verified":
        "رقم تم التحقق منه مقابل سجل أو مصدر أساسي متوفر لدى Vantage. التحقق لا يعني تدقيقاً مستقلاً.",
      "programme-team-figure":
        "رقم مأخوذ من سجلات تنفيذ البرنامج — سجلات داخلية حقيقية، لا تُقدَّم على أنها مدققة بشكل مستقل.",
      "estimated-catchment":
        "تقدير لعدد السكان ضمن منطقة الخدمة المحتملة لتدخل ما — وليس إحصاءً لأشخاص محددين تمت خدمتهم مباشرة.",
      "pilot":
        "دليل أو تعلم من تطبيق مبكر أو تجريبي — مؤشر اتجاهي، وليس قاطعاً بعد.",
      "planned":
        "هدف أو نشاط مقصود أو حالة مستقبلية — وليس نتيجة محققة.",
      "external-evidence":
        "دليل صادر من خارج Vantage، يُستشهد به لشرح السياق أو مبرر البرنامج — وليس نتيجة لـVantage.",
    },
    tocFeatureTitle: "نظرية التغيير لدينا",
    tocFeatureDescription:
      "المنطق الذي يربط ما تفعله Vantage بالتغيير الذي تسعى إليه — بما في ذلك الافتراضات والجهات الخارجية التي يعتمد عليها هذا المنطق.",
    tocFeatureCta: "اقرأ نظرية التغيير",
    learningTitle: "ما تتعلمه Vantage",
    learningDescription:
      "ملاحظات مسجلة من التنفيذ — ما نجح، وما لم ينجح، وما سنغيره تالياً. يُنسب التعلم إلى البرنامج الذي صدر عنه.",
    learningFrom: "من",
    evidenceLibraryTitle: "مكتبة الأدلة",
    evidenceLibraryDescription:
      "حيث ستُنشر مخرجات الأدلة والتعلم المعتمدة — ملخصات النتائج وملاحظات التعلم والبحوث والتقييمات — للاطلاع عليها.",
    evidenceLibraryEmpty:
      "لا توجد منشورات أدلة معتمدة بعد. عندما تُعتمد مخرجات الأدلة والتعلم، ستظهر هنا مع حالتها ومنهجيتها ومصدرها — وليس قبل ذلك.",
    reportsTitle: "التقارير والمساءلة",
    reportsDescription:
      "التقارير التنظيمية الرسمية — المنشورات السنوية والمالية والبرامجية والحوكمة — لا تُنشر إلا بعد اعتمادها. لا توجد تقارير معتمدة منشورة حالياً.",
    reportsCta: "عرض التقارير والمساءلة",
    policiesTitle: "السياسات والمساءلة المؤسسية",
    policiesDescription:
      "السياسات والآليات التي تحكم عمل Vantage — الحماية والخصوصية وإمكانية الوصول والشروط — كل منها في صفحته القانونية الخاصة.",
    vantagePointTitle: "Vantage Point",
    vantagePointDescription:
      "المنصة المشتركة بين البرامج التي تربط التعلم والحوار والأدلة وأصوات المجتمع عبر المحافظ الست. مخططة حالياً — تُذكر حالتها بصدق دون مبالغة.",
    vantagePointCta: "عن Vantage Point",
    ctaTitle: "اسألنا عن أدلتنا",
    ctaDescription:
      "الأسئلة حول رقم أو منهجية أو ما لم نقيسه بعد مرحب بها — فهذا التدقيق هو بالضبط الغرض من نشر هذا.",
  },
  toc: {
    title: "نظرية التغيير",
    description:
      "المنطق الذي تعتقد Vantage أنه يؤدي إلى التغيير — مع إظهار الافتراضات التي يقوم عليها والجهات التي يعتمد عليها.",
    statementHeading: "ما نعتقد أنه يؤدي إلى التغيير",
    assumptionsTitle: "افتراضات نعتمد عليها",
    assumptionsDescription:
      "كل نظرية تغيير تقوم على أشياء لا يتحكم فيها واضعوها. هذه افتراضاتنا — معروضة لكي ترى أين يمكن أن ينكسر منطقنا.",
    actorsTitle: "جهات خارجية نعتمد عليها",
    actorsDescription:
      "لا تستطيع Vantage تحقيق هذه النتائج بمفردها. هؤلاء هم الأشخاص والأنظمة التي يعتمد عليها مسار التغيير — معظمهم جهات في المنظومة، وليسوا شركاء متعاقدين.",
    measurementTitle: "كيف نقيس",
    measurementDescription:
      "خمسة أشياء مختلفة تتحدث عنها Vantage عند إعداد التقارير — تُبقى منفصلة حتى لا يُخلَط رقم التسليم بالتغيير أبداً.",
    learningLoopTitle: "كيف يعود التعلم",
    learningLoopDescription:
      "الانضباط الذي نبنيه: ننفذ، نلاحظ، نتعلم، نكيّف — حتى تغيّر الأدلة والخبرة ما تفعله البرامج تالياً.",
    limitationsTitle: "أين تكون أدلتنا محدودة",
    limitationsBody:
      "قاعدة أدلتنا تختلف بين البرامج. بعض الأرقام مسجلة مباشرة، وبعضها تقارير فرق البرامج، وبعضها تقديرات، وبعض الأعمال لا تزال مخططة لا منفذة. نفضل أن نريك الخيوط بدلاً من تغطيتها — فحين يكون ادعاء غير مؤكد، يقول تصنيفه ذلك.",
    inPracticeTitle: "شاهد ذلك عملياً",
    viewProgrammes: "استكشف المحافظ الست",
    viewImpact: "عرض النتائج والأدلة",
    viewVantagePoint: "كيف يربطها Vantage Point",
  },
  stories: {
    title: "قصص ورؤى",
    description:
      "أصوات المجتمع، وتحديثات البرامج، والأبحاث والتأملات من عملنا.",
    featured: "مميز",
    searchPlaceholder: "البحث في القصص والرؤى...",
    filterCategoryLabel: "تصفية حسب الفئة",
    noResults: "لا توجد قصص تطابق عوامل التصفية.",
  },
  story: {
    updated: "تم التحديث",
    readTime: "وقت القراءة",
    takeAction: "تحرك",
    ctaDescription:
      "هل ألهمتك هذه القصة؟ إليك طرق يمكنك من خلالها مساعدة Vantage Foundation Uganda على خلق مزيد من الأثر.",
    moreStories: "المزيد من القصص والرؤى",
    relatedProjects: "المشاريع ذات الصلة",
    share: "مشاركة",
    copyLink: "نسخ الرابط",
    copied: "تم النسخ!",
    aboutTheAuthor: "عن الكاتب",
    originalLanguageNotice:
      "هذا المحتوى متاح حاليًا بالإنجليزية فقط.",
  },
  team: {
    title: "فريقنا",
    description:
      "فريق يقوده الشباب ومتجذر في المجتمعات، يعمل في مجالات الصحة والتعليم والعمل الإنساني في أوغندا.",
    executive: "القيادة التنفيذية",
    executiveDescription: "التوجيه الاستراتيجي والعمليات اليومية.",
    volunteers: "المتطوعون والمساهمون التقنيون",
    volunteersDescription:
      "خبرة سريرية وتقنية وميدانية، تُقدّم على أساس تطوعي.",
    joinTitle: "انضم إلى فريقنا",
    joinDescription:
      "يسرنا دائمًا التواصل مع المتطوعين والمهنيين والشركاء الراغبين في المساهمة بوقتهم أو خبراتهم.",
    volunteerCta: "تطوع أو شاركنا الشراكة",
    partnerCta: "شاركنا الشراكة",
    donateCta: "تبرع",
    meetRest: "تعرف على بقية الفريق",
    supportWork: "دعم هذا العمل",
  },
  teamMember: {
    backToTeam: "العودة إلى الفريق",
    role: "الدور",
    email: "البريد الإلكتروني",
    linkedIn: "LinkedIn",
    support: "دعم هذا العمل",
    volunteer: "تطوع",
    donate: "تبرع",
  },
  gallery: {
    title: "المعرض",
    description:
      "لحظات من آبارنا ومدارسنا وبرامجنا المجتمعية في أوغندا.",
  },
  reports: {
    title: "التقارير والمساءلة",
    description:
      "الشفافية هي كيف نبني الثقة مع المجتمعات والمانحين والشركاء.",
    approvedReports: "التقارير المعتمدة",
    approvedDescription:
      "مستندات تمت الموافقة عليها للنشر، مع فترة التقرير ونوعه.",
    publicationStatus: "حالة النشر حسب الفئة",
    publicationDescription:
      "لا نقدم مستندات غير مكتملة كأدلة منشورة. يوضح كل قسم أدناه حالته الحالية وما سيظهر فيه بعد الموافقة.",
    policies: "السياسات",
    policiesDescription:
      "التزامات السياسات العامة متاحة الآن. سيتم ربط وثائق السياسات الرسمية فور اعتمادها.",
    requestInfo: "طلب معلومات",
    requestDescription:
      "نرحب بطلبات المعلومات من المانحين والشركاء والصحفيين وأعضاء المجتمع. تواصل معنا وسنرد في أقرب وقت ممكن.",
    contactUs: "اتصل بنا",
    download: "تحميل",
    emptyStatus: "بانتظار الموافقة",
    annualReports: "التقارير السنوية",
    annualReportsDescription:
      "ملخصات سنوية لبرامجنا وانتشارنا وتطورنا المؤسسي. سينشر التقرير السنوي الأول هنا بمجرد اعتماده للنشر.",
    financialReports: "التقارير المالية",
    financialReportsDescription:
      "بيانات الدخل والمصروفات توضح كيفية استخدام التبرعات. ستُضاف البيانات المالية بعد الموافقة الرسمية.",
    projectReports: "تقارير المشاريع",
    projectReportsDescription:
      "تقارير مفصلة لمشاريع فردية — تشمل الأنشطة والنتائج والدروس المستفادة. تُربط وثائق المشروع من صفحة كل مشروع فور توفرها.",
    safeguarding: "الحماية",
    safeguardingDescription:
      "تحدد سياسة الحماية لدينا كيف نحمي الأطفال والشباب والبالغين الضعفاء في جميع البرامج. السياسة قيد الإعداد للنشر.",
    governance: "الحوكمة",
    governanceDescription:
      "Vantage Foundation Uganda يقودها فريق قيادة معلن، وتعمل نحو هيكل مجلس إدارة رسمي. ستُضاف وثائق الحوكمة هنا فقط بعد الموافقة عليها.",
    monitoring: "المراقبة والتقييم",
    monitoringDescription:
      "يجمع نهجنا لقياس الأثر بين الأعداد الكمية (المرضى المعالجين، لترات المياه النقية المقدمة، حضور ورش العمل) ودراسات الحالة النوعية وملاحظات المجتمع.",
    projectReportsStatus: "مُرتبط من صفحات المشاريع",
    monitoringStatus: "الإطار مُطبّق",
  },
  legal: {
    privacy: "سياسة الخصوصية",
    terms: "شروط الاستخدام",
    safeguarding: "سياسة الحماية",
    accessibility: "إشعار إمكانية الوصول",
    notTranslatedNotice:
      "هذه الصفحة متاحة حاليًا بالإنجليزية فقط.",
  },
  brand: {
    title: "دليل الهوية البصرية",
    description:
      "النظام الكامل للهوية البصرية — الشعارات والألوان والطباعة والمكونات وقواعد الاستخدام. استخدم هذا الدليل للحفاظ على وضوح ومصداقية واتساق كل تواصل.",
    logo: "الشعار",
    colours: "اللون",
    typography: "الطباعة",
    imagery: "التصوير",
    usage: "الاستخدام",
    contact: "التواصل",
  },
  brandGuide: {
    title: "دليل الهوية البصرية",
    description:
      "نظام الهوية البصرية لـ Vantage Foundation Uganda — الشعارات والألوان والطباعة والمكونات وقواعد الاستخدام.",
    eyebrow: "نظام الهوية البصرية",
    heroTitle: "دليل هوية Vantage Foundation Uganda",
    heroDescription:
      "النظام الكامل للهوية البصرية — الشعارات والألوان والطباعة والمكونات وقواعد الاستخدام. استخدم هذا الدليل للحفاظ على وضوح ومصداقية واتساق كل تواصل.",
    navAriaLabel: "أقسام دليل الهوية البصرية",
    nav: {
      foundations: "الأسس",
      logo: "الشعار",
      colour: "اللون",
      typography: "الطباعة",
      components: "المكونات",
      programme: "ألوان البرنامج",
      icons: "الأيقونات",
      photography: "التصوير",
      accessibility: "إمكانية الوصول",
      downloads: "التنزيلات",
    },
    sections: {
      foundations: {
        eyebrow: "الأسس",
        title: "أسس الهوية",
        mission: "المهمة",
        vision: "الرؤية",
        personality: "الشخصية",
        coreValues: "القيم الأساسية",
      },
      logo: {
        eyebrow: "الشعار",
        title: "نظام الشعار",
        lede:
          "يتوفر شعار Vantage Foundation Uganda بثلاثة تنسيقات. استخدم النسخة الأفقية للرؤوس والتوقيعات، والنسخة الرئيسية المكدسة للمستندات الرسمية والأغلفة، والرمز فقط للأيقونات المصغرة وملفات التعريف الاجتماعية والتطبيقات الصغيرة.",
        primary: "رئيسي / مكدس",
        horizontal: "أفقي",
        symbol: "الرمز فقط",
        clearSpace: "المساحة المحمية",
        minSizes: "الأحجام الدنيا",
        digital: "رقمي",
        print: "طباعة",
        favicon: "Favicon",
        misuse: "استخدام خاطئ للشعار — لا تفعل هذا",
        primaryAlt: "الشعار الرئيسي لـ Vantage Foundation Uganda",
        horizontalAlt: "الشعار الأفقي لـ Vantage Foundation Uganda",
        symbolAlt: "رمز Vantage Foundation Uganda",
      },
      colour: {
        eyebrow: "اللون",
        title: "نظام الألوان",
        lede:
          "ثلاثة ألوان مهيمنة بالضبط، تقريبًا ثلث لكل منها: الأزرق المخضر (teal) والأبيض والأسود/الفحم الداكن للنصوص والأقسام الداكنة. النسبة المستهدفة: ~33% أبيض/محايد، ~33% أزرق مخضر، ~33% أسود/فحم.",
        primaryPalette: "اللوحة الأساسية",
        accessiblePairings: "التوليفات المتاحة",
        warning: "تحذير:",
      },
      typography: {
        eyebrow: "الطباعة",
        title: "الطباعة",
        lede:
          "Inter هو الخط الأساسي، مُحمّل عبر next/font/google مع خط نظام قوي احتياطي. تجنب الاستخدام المفرط للأحرف الكبيرة — احتفظ بها للتسميات القصيرة والعناوين الثانوية.",
      },
      components: {
        eyebrow: "المكونات",
        title: "مكونات الواجهة",
        buttons: "الأزرار",
        badges: "الشارات",
        cards: "البطاقات",
        onDark: "على خلفية داكنة",
      },
      programme: {
        eyebrow: "ألوان البرنامج",
        title: "ألوان التمييز للبرامج",
        lede:
          "لكل مجال برنامج لون تمييز مميز، يُقترن دائمًا بأيقونة وتسمية نصية. اللون ليس أبدًا الوسيلة الوحيدة لنقل الفئة (WCAG 2.2 §1.4.1).",
      },
      iconography: {
        eyebrow: "الأيقونات",
        title: "الأيقونات",
        lede:
          "الأيقونات مرسومة بخطوط مستديرة وسمك ثابت (Lucide). تدعم تصنيف البرامج وتحديد المسار. الحجم الافتراضي 1,25rem، و1,5rem في سياقات الوظائف.",
      },
      photography: {
        eyebrow: "التصوير",
        title: "توجيه التصوير",
        lede:
          "التصوير الفوتوغرافي الأصيل لـ Vantage Foundation هو الأصل المرئي الأساسي. أعطِ الأولوية للمجتمعات الحقيقية، والمتطوعين أثناء العمل، والتنفيذ الميداني، والنتائج المرئية. تجنب صور الاستعطاف واللقطات المقربة المهينة.",
        cropPresets: "إعدادات الاقتصاص",
      },
      accessibility: {
        eyebrow: "إمكانية الوصول",
        title: "إمكانية الوصول",
        lede:
          "يستهدف نظام الهوية WCAG 2.2 AA. تباين الألوان، تركيز لوحة المفاتيح، البنية الدلالية، ودعم الحركة المخفضة مدمجة.",
      },
      downloads: {
        eyebrow: "التنزيلات",
        title: "الأصول المعتمدة",
        lede:
          "جميع ملفات الشعار عبارة عن SVG متجهة حقيقية (أقل من 15 كيلوبايت لكل منها، وقابلة للتحجيم لأي حجم). الملفات موجودة في public/brand/logos/. لا تُعِد توزيع الخطوط المملوكة.",
        fullDocs: "التوثيق الكامل:",
      },
    },
  },
  footer: {
    vantageCare: "Vantage Care",
    kikumiKyoAcademy: "KikumiKyo Academy",
  },
  ui: uiContent.ar,
};

export const pageContent: Record<Locale, PageContent> = {
  en: englishPageContent,
  de: mergeWithEnglish(germanPageContent, englishPageContent),
  fr: mergeWithEnglish(frenchPageContent, englishPageContent),
  es: mergeWithEnglish(spanishPageContent, englishPageContent),
  ar: mergeWithEnglish(arabicPageContent, englishPageContent),
};

export function getPageContent(locale: Locale): PageContent {
  return pageContent[locale] ?? englishPageContent;
}

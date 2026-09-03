import { Locale } from "@/lib/i18n/config";
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
    common: { ...english.common, ...partial.common },
    ourWork: { ...english.ourWork, ...partial.ourWork },
    projects: { ...english.projects, ...partial.projects },
    programme: { ...english.programme, ...partial.programme },
    project: { ...english.project, ...partial.project },
    impact: { ...english.impact, ...partial.impact },
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
    title: "Our areas of work",
    description:
      "Four connected programmes designed around the realities communities face.",
    programmeSuffix: "Programme",
    relatedProjects: "Related projects",
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
      "We work across four interconnected programmes, with youth leadership running through all of them.",
    viewAllProgrammes: "View all programmes",
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
    title: "Impact",
    description: "Evidence of change, measured with honesty and hope.",
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
      "A youth-led, volunteer-driven team working across health, education and humanitarian action in Uganda.",
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
      "Income and expenditure statements showing how donations are used. As a 100% volunteer-run organisation, funds go directly to programmes. Financial statements will be added after formal approval.",
    projectReports: "Project reports",
    projectReportsDescription:
      "Detailed reports from individual projects — including activities, outcomes and lessons learned. Project-level documentation is linked from each project page as it becomes available.",
    safeguarding: "Safeguarding",
    safeguardingDescription:
      "Our safeguarding policy sets out how we protect children, young people and vulnerable adults across all programmes. The policy is being finalised for publication.",
    governance: "Governance",
    governanceDescription:
      "Vantage Foundation Uganda is led by a published volunteer leadership team and is working towards a formal board structure. Governance documents will be added here only after approval.",
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
    title: "Unsere Arbeitsbereiche",
    description:
      "Vier miteinander verbundene Programme, die auf die Realitäten vor Ort ausgerichtet sind.",
    programmeSuffix: "Programm",
    relatedProjects: "Verwandte Projekte",
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
      "Wir arbeiten in vier miteinander verbundenen Programmen, mit Jugendführung in allen.",
    viewAllProgrammes: "Alle Programme ansehen",
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
    title: "Wirkung",
    description: "Beweise für Veränderung, ehrlich und hoffnungsvoll gemessen.",
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
      "Ein jugendgeführtes, ehrenamtliches Team, das in den Bereichen Gesundheit, Bildung und humanitäre Hilfe in Uganda arbeitet.",
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
      "Einnahmen- und Ausgabenaufstellungen, die zeigen, wie Spenden verwendet werden. Als 100% ehrenamtlich geführte Organisation fließen Gelder direkt in Programme. Finanzberichte werden nach förmlicher Genehmigung hinzugefügt.",
    projectReports: "Projektberichte",
    projectReportsDescription:
      "Detaillierte Berichte einzelner Projekte — einschließlich Aktivitäten, Ergebnissen und Erkenntnissen. Dokumentation auf Projektebene wird von jeder Projektseite verlinkt, sobald verfügbar.",
    safeguarding: "Schutz",
    safeguardingDescription:
      "Unsere Schutzrichtlinie legt fest, wie wir Kinder, Jugendliche und vulnerable Erwachsene in allen Programmen schützen. Die Richtlinie wird zur Veröffentlichung finalisiert.",
    governance: "Governance",
    governanceDescription:
      "Vantage Foundation Uganda wird von einem veröffentlichten ehrenamtlichen Führungsteam geleitet und arbeitet an einer formellen Vorstandsstruktur. Governance-Dokumente werden hier nur nach Genehmigung hinzugefügt.",
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
    title: "Nos domaines d'action",
    description:
      "Quatre programmes interconnectés conçus en fonction des réalités locales.",
    programmeSuffix: "Programme",
    relatedProjects: "Projets connexes",
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
      "Nous travaillons à travers quatre programmes interconnectés, avec le leadership des jeunes au cœur de chacun.",
    viewAllProgrammes: "Voir tous les programmes",
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
    title: "Impact",
    description: "Preuves du changement, mesurées avec honnêteté et espoir.",
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
      "Une équipe jeune et bénévole travaillant dans la santé, l'éducation et l'action humanitaire en Ouganda.",
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
      "États de revenus et de dépenses montrant comment les dons sont utilisés. En tant qu'organisation 100% bénévole, les fonds vont directement aux programmes. Les états financiers seront ajoutés après approbation formelle.",
    projectReports: "Rapports de projets",
    projectReportsDescription:
      "Rapports détaillés de projets individuels — activités, résultats et leçons apprises. La documentation au niveau du projet est liée depuis chaque page de projet dès qu'elle est disponible.",
    safeguarding: "Protection",
    safeguardingDescription:
      "Notre politique de sauvegarde définit comment nous protégeons les enfants, les jeunes et les adultes vulnérables dans tous les programmes. La politique est en cours de finalisation.",
    governance: "Gouvernance",
    governanceDescription:
      "Vantage Foundation Uganda est dirigée par une équipe de direction bénévole publiée et travaille vers une structure formelle de conseil. Les documents de gouvernance seront ajoutés ici uniquement après approbation.",
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
    title: "Nuestros ámbitos de trabajo",
    description:
      "Cuatro programas interconectados diseñados en torno a las realidades que enfrentan las comunidades.",
    programmeSuffix: "Programa",
    relatedProjects: "Proyectos relacionados",
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
      "Trabajamos a través de cuatro programas interconectados, con el liderazgo juvenil atravesando todos ellos.",
    viewAllProgrammes: "Ver todos los programas",
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
    title: "Impacto",
    description: "Evidencia del cambio, medida con honestidad y esperanza.",
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
      "Un equipo dirigido por jóvenes e impulsado por voluntarios, que trabaja en salud, educación y acción humanitaria en Uganda.",
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
      "Estados de ingresos y gastos que muestran cómo se usan las donaciones. Como organización 100% voluntaria, los fondos van directamente a los programas. Los estados financieros se agregarán tras su aprobación formal.",
    projectReports: "Informes de proyectos",
    projectReportsDescription:
      "Informes detallados de proyectos individuales, incluidas actividades, resultados y lecciones aprendidas. La documentación a nivel de proyecto se vincula desde cada página de proyecto a medida que esté disponible.",
    safeguarding: "Protección",
    safeguardingDescription:
      "Nuestra política de protección establece cómo protegemos a niñas, niños, adolescentes y adultos vulnerables en todos los programas. La política se está finalizando para su publicación.",
    governance: "Gobernanza",
    governanceDescription:
      "Vantage Foundation Uganda está dirigida por un equipo de liderazgo voluntario publicado y trabaja hacia una estructura formal de junta directiva. Los documentos de gobernanza se agregarán aquí solo después de su aprobación.",
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
    title: "مجالات عملنا",
    description:
      "أربعة برامج مترابطة صُممت بناءً على واقع المجتمعات.",
    programmeSuffix: "البرنامج",
    relatedProjects: "المشاريع ذات الصلة",
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
      "نعمل عبر أربعة برامج مترابطة، مع قيادة الشباب تخترقها جميعًا.",
    viewAllProgrammes: "عرض جميع البرامج",
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
    title: "الأثر",
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
      "فريق يقوده الشباب ويدفعه المتطوعون، يعمل في مجالات الصحة والتعليم والعمل الإنساني في أوغندا.",
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
      "بيانات الدخل والمصروفات توضح كيفية استخدام التبرعات. باعتبارنا منظمة 100% تطوعية، تذهب الأموال مباشرة إلى البرامج. ستُضاف البيانات المالية بعد الموافقة الرسمية.",
    projectReports: "تقارير المشاريع",
    projectReportsDescription:
      "تقارير مفصلة لمشاريع فردية — تشمل الأنشطة والنتائج والدروس المستفادة. تُربط وثائق المشروع من صفحة كل مشروع فور توفرها.",
    safeguarding: "الحماية",
    safeguardingDescription:
      "تحدد سياسة الحماية لدينا كيف نحمي الأطفال والشباب والبالغين الضعفاء في جميع البرامج. السياسة قيد الإعداد للنشر.",
    governance: "الحوكمة",
    governanceDescription:
      "Vantage Foundation Uganda يقودها فريق قيادة تطوعي معلن، وتعمل نحو هيكل مجلس إدارة رسمي. ستُضاف وثائق الحوكمة هنا فقط بعد الموافقة عليها.",
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

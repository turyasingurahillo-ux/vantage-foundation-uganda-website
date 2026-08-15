import { AreaOfWork, ProjectCategory } from "@/types";

export const areasOfWork: AreaOfWork[] = [
  {
    id: "health",
    title: "Health",
    programmeName: "Vantage Care",
    summary: "Our holistic health and wellbeing programme — medical camps, outreach, education and preventive care for underserved communities.",
    description:
      "Vantage Care is the Foundation's holistic health and general wellbeing programme. It brings together initiatives designed to improve access to healthcare, promote healthy living and support the overall physical, mental and social wellbeing of individuals and communities. The programme includes medical camps, community health outreaches, health education, preventive healthcare activities, basic screening services and connections to appropriate professional care where further assessment or treatment is required. Through Vantage Care, the Foundation seeks to take essential health services and information closer to communities, particularly those that experience financial, geographical or social barriers to accessing healthcare.",
    items: [
      "Medical camps",
      "Community health outreach",
      "Health education",
      "Preventive healthcare activities",
      "Basic screening services",
      "Referrals to professional care",
    ],
    icon: "heart-pulse",
    image: "/images/photos/community-health-camp-checkup.webp",
    imageAlt:
      "A community health camp checkup in Uganda.",
  },
  {
    id: "education",
    title: "Education",
    programmeName: "KikumiKyo Academy",
    summary: "Our financial literacy and economic empowerment programme, run in partnership with the fintech company KikumiKyo.",
    description:
      "KikumiKyo Academy is the Foundation's financial literacy and economic empowerment programme, implemented in partnership with the fintech company KikumiKyo. The programme is designed to strengthen young people's knowledge, skills and practical understanding of money — how to save, budget, invest, keep financial records, manage financial groups, understand responsible borrowing and make informed financial decisions. KikumiKyo Academy also challenges common myths surrounding money, saving and investment, encouraging young people to understand the value of starting early and starting small, and demonstrating how discipline, consistency and the power of compounding can contribute to long-term financial security. Learning and mentorship may continue through the KikumiKyo digital platform and related financial-learning communities, enabling participants to apply what they have learned beyond the initial training sessions.",
    items: [
      "Saving and budgeting",
      "Investing fundamentals",
      "Financial record-keeping",
      "Financial group management",
      "Responsible borrowing",
      "Ongoing mentorship via the KikumiKyo platform",
    ],
    icon: "graduation-cap",
    image: "/images/photos/photo-011.webp",
    imageAlt:
      "A young woman in a yellow t-shirt and headscarf speaks into a microphone at an indoor conference, with a \"Financial Literacy & Career Education\" banner in the background.",
    externalPlatformLink: {
      label: "Explore the KikumiKyo Academy online",
      href: "https://kikumikyo.com/learn",
      description:
        "Browse free, Uganda-relevant financial education articles on saving, budgeting, SACCOs, loans and digital money safety — the online learning companion to this programme.",
    },
  },
  {
    id: "humanitarian",
    title: "Humanitarian Aid",
    programmeName: "Humanitarian Assistance",
    summary: "Emergency and household support, food, essential supplies and care for vulnerable children and families.",
    description:
      "We provide essential nutrition, clothing, household support and relief to orphans, women and communities in crisis. Our aid is disability-inclusive and centred on dignity.",
    items: [
      "Emergency and household support",
      "Food and essential supplies",
      "Support for vulnerable children",
      "Disability-inclusive assistance",
      "Community relief initiatives",
    ],
    icon: "hand-heart",
    image: "/images/photos/photo-003.webp",
    imageAlt:
      "Volunteers and community members unload supplies from a pickup truck loaded with boxes of food and hygiene products outside two houses.",
  },
  {
    id: "water",
    title: "Water, Sanitation & Hygiene",
    programmeName: "Water, Sanitation and Hygiene",
    summary: "Sustainable water, sanitation and hygiene infrastructure for rural and underserved communities.",
    description:
      "Clean water and dignified sanitation are foundational to health and education. We build wells, promote hygiene education and support WASH interventions that last.",
    items: [
      "Deep water well construction",
      "Community boreholes",
      "Hygiene education",
      "Sanitation support",
      "WASH in schools",
    ],
    icon: "droplets",
    image: "/images/photos/photo-012.webp",
    imageAlt:
      "A group of men and boys gather around a newly installed hand-pump borehole with a concrete apron and drainage channel in a rural setting.",
  },
];

// Maps an area id to the ProjectCategory label(s) used in content/projects.ts.
// Area display titles (e.g. "Water, Sanitation & Hygiene") intentionally differ
// from project category labels (e.g. "Water & Sanitation"), so matching by
// title string equality would silently hide the flagship Kasaale borehole from
// the WASH section. This explicit mapping keeps display wording and matching
// logic decoupled.
export const projectCategoriesByAreaId: Record<string, ProjectCategory[]> = {
  health: ["Health"],
  education: ["Education"],
  humanitarian: ["Humanitarian Aid"],
  water: ["Water & Sanitation"],
  "youth-leadership": ["Youth Leadership"],
};

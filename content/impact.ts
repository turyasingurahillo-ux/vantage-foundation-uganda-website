import { ImpactStat } from "@/types";

export const impactStats: ImpactStat[] = [
  {
    value: "10,000+",
    label: "People with access to the Kasaale water point",
    programme: "Water, Sanitation and Hygiene",
    location: "Kasaale, Magada Sub-county, Namutumba District, Uganda",
    period: "Borehole completed 16 May 2025; continuation phase underway",
    methodology:
      "Community catchment estimate recorded by the project team for the completed borehole.",
    href: "/projects/kasaale-deep-borehole",
  },
  {
    value: "About 500",
    label: "Young women and men reached through mentorship",
    programme: "SaveGirl Uganda",
    location: "Communities across Uganda",
    period: "Cumulative reach since 2021",
    methodology:
      "Cumulative participant count reported by the programme team across mentorship activities.",
    href: "/projects/savegirl-uganda",
  },
  {
    value: "4",
    label: "Orphanages receiving food, clothing or essentials",
    programme: "Humanitarian Assistance",
    location: "Uganda",
    period: "Programme activity since 2022",
    methodology:
      "Count of institutions recorded as receiving at least one relief delivery.",
    href: "/projects/orphanage-relief",
  },
];

export function getPublishedImpactStats(): ImpactStat[] {
  return impactStats;
}

export const outputs = [
  "Deep water well constructed and serving over 10,000 people.",
  "Multiple medical camps conducted in rural Uganda.",
  "Semi-annual workshops on mental health, sexual/reproductive health and financial literacy since 2021.",
  "Direct mentorship and book-club activities for youth.",
  "Food and clothing donated to four orphanages.",
  "Support provided to young women on Kalangala Island.",
];

export const outcomes = [
  "Improved access to clean water, health information and menstrual hygiene resources.",
  "Increased confidence, financial literacy and life skills among SaveGirl participants.",
  "Stronger community awareness of mental health, reproductive health and preventive care.",
  "A growing network of young people committed to learning and leadership.",
];

export const longTermGoals = [
  "Minimise infectious diseases and water-borne illness in partner communities.",
  "Make rural education and skills development a sustained community and government priority.",
  "Equip young people with the awareness to lead healthy, productive lives.",
  "Build a self-sustaining, scalable model through agricultural social enterprise and diversified income.",
];

export const regions = [
  "Bushenyi District",
  "Kampala",
  "Kalangala Island",
  "Jinja",
  "Rural districts across Uganda",
];

export const sdgs = [3, 4, 6, 10, 17];

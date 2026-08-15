import { Partner } from "@/types";

export const partners: Partner[] = [
  {
    name: "The Cup Foundation",
    relationshipType: "In-kind programme contributor",
    description:
      "Donated UN-recommended Lunette menstrual cups and supported menstrual health training for the SaveGirl Uganda programme.",
    url: "https://www.thecup.org/",
    logo: "/images/partners/the-cup-foundation.webp",
    logoAlt: "The Cup Foundation / Lunette logo",
  },
  {
    name: "Girl Power USA",
    relationshipType: "Programme collaborator",
    description:
      "US-based 501(c)(3) nonprofit collaborating with Vantage Foundation on joint branding and youth programmes — including co-sponsoring the 2022 Bushenyi youth conference and supporting the SaveGirl Uganda initiative since 2021.",
    url: "https://girlpowerusa.org/",
    logo: "/images/partners/girl-power-usa.png",
    logoAlt: "Girl Power USA logo",
  },
  {
    name: "S.A.L.V.E. International",
    relationshipType: "In-kind programme contributor",
    description:
      "UK- and Uganda-registered charity (\"Support And Love Via Education\") based in Jinja, supporting street-connected children through outreach, halfway homes and family resettlement. Vantage Foundation has donated food and essential supplies to children in their care.",
    url: "https://salveinternational.org/",
    logo: "/images/partners/salve-international.png",
    logoAlt: "S.A.L.V.E. International logo",
  },
  {
    name: "KikumiKyo",
    relationshipType: "Programme and technology partner",
    description:
      "Fintech company partnering with Vantage Foundation on KikumiKyo Academy, a financial literacy and economic empowerment programme for young people.",
    url: "https://kikumikyo.com/",
    logo: "/images/partners/kikumi-kyo.png",
    logoAlt: "Kikumi Kyo logo",
  },
];

export function getPublishedPartners(): Partner[] {
  return partners;
}

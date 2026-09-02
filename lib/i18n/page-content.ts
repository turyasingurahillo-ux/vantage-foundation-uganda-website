import type { Locale } from "./config";

type AboutContent = {
  intro: [string, string];
  mission: string;
  vision: string;
  values: string[];
  beneficiaries: string[];
  approach: string;
  governance: [string, string];
  imageAlt: string;
};

export const aboutContent: Record<Locale, AboutContent> = {
  en: {
    intro: [
      "Vantage Foundation Uganda is a youth-led nonprofit established in December 2020. Our story is like that of many young people: our lives started small, yet one spark can ignite lasting change. We are a work in progress that holds a light for those younger than us because we can relate — and through this we have become changemakers.",
      "We envision improved livelihoods in communities across Uganda and Africa. Today, we help young people in Uganda achieve their full potential through health, education, humanitarian aid, and water, sanitation and hygiene.",
    ],
    mission: "To change the world, one advantage at a time.",
    vision: "Improved livelihoods in Ugandan and East African communities.",
    values: ["Growth", "Sustainability", "Safety", "Inclusivity"],
    beneficiaries: ["Young people in rural areas", "Women and girls", "Children and orphans", "People in remote districts and urban informal settlements"],
    approach: "We identify districts and communities that larger international NGOs often overlook and strengthen the reach of existing social safety nets. We recognise that development is sequential: without health and nutrition, education cannot be absorbed; without education, poverty cannot be escaped.",
    governance: [
      "Vantage Foundation Uganda operates entirely through volunteers, with no salary overhead. As we grow, we are formalising governance structures, safeguarding policies and financial reporting so that every donor, partner and community can trust how resources are used.",
      "Annual reports, financial statements and project reports will be published on our Reports and Accountability page.",
    ],
    imageAlt: "Vantage Foundation Uganda working with a community",
  },
  de: {
    intro: [
      "Vantage Foundation Uganda ist eine von jungen Menschen geführte gemeinnützige Organisation, die im Dezember 2020 gegründet wurde. Unsere Geschichte ähnelt der vieler junger Menschen: Wir haben klein angefangen, doch ein einziger Funke kann dauerhafte Veränderung entfachen. Wir entwickeln uns stetig weiter und geben Jüngeren Orientierung, weil wir ihre Erfahrungen verstehen — so sind wir selbst zu Gestalterinnen und Gestaltern des Wandels geworden.",
      "Unsere Vision sind bessere Lebensbedingungen in Uganda und Afrika. Heute unterstützen wir junge Menschen in Uganda dabei, ihr Potenzial auszuschöpfen — durch Gesundheit, Bildung, humanitäre Hilfe sowie Wasser, Sanitärversorgung und Hygiene.",
    ],
    mission: "Die Welt verändern — eine Chance nach der anderen.",
    vision: "Bessere Lebensbedingungen in Gemeinschaften in Uganda und Ostafrika.",
    values: ["Wachstum", "Nachhaltigkeit", "Sicherheit", "Inklusion"],
    beneficiaries: ["Junge Menschen in ländlichen Gebieten", "Frauen und Mädchen", "Kinder und Waisen", "Menschen in abgelegenen Distrikten und informellen städtischen Siedlungen"],
    approach: "Wir arbeiten in Distrikten und Gemeinschaften, die von größeren internationalen NGOs häufig übersehen werden, und stärken die Reichweite bestehender sozialer Sicherungssysteme. Entwicklung baut aufeinander auf: Ohne Gesundheit und Ernährung kann Bildung nicht greifen; ohne Bildung lässt sich Armut nur schwer überwinden.",
    governance: [
      "Vantage Foundation Uganda arbeitet vollständig ehrenamtlich und ohne Gehaltskosten. Mit unserem Wachstum bauen wir Leitungsstrukturen, Schutzrichtlinien und die Finanzberichterstattung weiter aus, damit Spendende, Partner und Gemeinschaften nachvollziehen können, wie Mittel eingesetzt werden.",
      "Jahresberichte, Finanzabschlüsse und Projektberichte veröffentlichen wir auf der Seite Berichte und Rechenschaft.",
    ],
    imageAlt: "Vantage Foundation Uganda bei der Zusammenarbeit mit einer Gemeinschaft",
  },
  fr: {
    intro: [
      "Vantage Foundation Uganda est une organisation à but non lucratif dirigée par des jeunes et fondée en décembre 2020. Notre histoire ressemble à celle de nombreux jeunes : nous avons commencé modestement, mais une seule étincelle peut susciter un changement durable. Nous continuons d’apprendre tout en éclairant la voie des plus jeunes, car nous comprenons leur vécu — c’est ainsi que nous sommes devenus des acteurs du changement.",
      "Nous aspirons à de meilleures conditions de vie en Ouganda et en Afrique. Aujourd’hui, nous aidons les jeunes Ougandais à réaliser leur potentiel grâce à la santé, à l’éducation, à l’aide humanitaire ainsi qu’à l’eau, l’assainissement et l’hygiène.",
    ],
    mission: "Changer le monde, une possibilité à la fois.",
    vision: "De meilleures conditions de vie dans les communautés ougandaises et est-africaines.",
    values: ["Développement", "Durabilité", "Sécurité", "Inclusion"],
    beneficiaries: ["Jeunes des zones rurales", "Femmes et filles", "Enfants et orphelins", "Personnes vivant dans des districts isolés et des quartiers urbains informels"],
    approach: "Nous intervenons dans des districts et des communautés souvent délaissés par les grandes ONG internationales et renforçons la portée des dispositifs de protection sociale existants. Le développement se construit par étapes : sans santé ni nutrition, l’éducation ne peut porter ses fruits ; sans éducation, il est difficile d’échapper à la pauvreté.",
    governance: [
      "Vantage Foundation Uganda fonctionne entièrement grâce à des bénévoles, sans charges salariales. À mesure que nous grandissons, nous renforçons nos structures de gouvernance, nos politiques de protection et nos rapports financiers afin que chaque donateur, partenaire et communauté puisse suivre l’utilisation des ressources.",
      "Les rapports annuels, états financiers et rapports de projet seront publiés sur notre page Rapports et redevabilité.",
    ],
    imageAlt: "Vantage Foundation Uganda travaillant avec une communauté",
  },
};

export type HomepageSectionContent = {
  trust: string[];
  impact: { eyebrow: string; title: string; description: string; note: string; cta: string };
  about: { eyebrow: string; title: string; paragraphs: [string, string]; cta: string; imageAlt: string };
  stories: { eyebrow: string; title: string; description: string; cta: string; read: string; support: string };
  instagram: { title: string; description: string; follow: string; postsLabel: string };
  partners: { eyebrow: string; title: string; description: string };
  involved: { eyebrow: string; title: string; description: string; cards: Array<{ title: string; description: string; cta: string }> };
  flagship: { eyebrow: string; location: string; timeline: string; beneficiaries: string; funding: string; read: string; support: string };
};

export const homepageSectionContent: Record<Locale, HomepageSectionContent> = {
  en: {
    trust: ["Youth-led since December 2020", "Based in Uganda", "100% volunteer-run", "Community-centred"],
    impact: { eyebrow: "Impact", title: "Evidence with context", description: "Each headline figure is tied to the programme, place, reporting period and counting method behind it.", note: "These are programme-team figures and are not presented as independently audited results. Supporting public reports will be linked as they are approved for publication.", cta: "Explore our impact" },
    about: { eyebrow: "About Vantage", title: "Local leadership. Practical advantages. Lasting change.", paragraphs: ["Founded in December 2020, Vantage Foundation Uganda is a youth-led nonprofit responding to barriers that keep people from essential healthcare, practical financial knowledge, clean water and dignified household support.", "We work with young people, families and vulnerable communities in rural districts and urban informal settlements. Community participation and youth leadership shape how every programme is designed and delivered."], cta: "Read our story", imageAlt: "Young Ugandans taking part in a Vantage Foundation community learning activity" },
    stories: { eyebrow: "Stories & Insights", title: "Voices and ideas from our community", description: "Reflections, research and programme updates from the young people, volunteers and leaders shaping our work.", cta: "Read Stories & Insights", read: "Read the story", support: "Support this work" },
    instagram: { title: "Popular on Instagram", description: "See the stories, programmes and community moments reaching the most people.", follow: "Follow Vantage Foundation Uganda on Instagram", postsLabel: "Popular Instagram posts" },
    partners: { eyebrow: "Partners", title: "Verified relationships", description: "Each relationship is described precisely so a banking service, in-kind contribution or programme collaboration is never overstated." },
    involved: { eyebrow: "Get Involved", title: "Join the movement", description: "There are many ways to help create one more advantage for a young person, family or community.", cards: [
      { title: "Donate", description: "Fund a project, campaign or our general operations.", cta: "Give now" }, { title: "Volunteer", description: "Share your time as a mentor, health worker, educator or logistics helper.", cta: "Become a volunteer" }, { title: "Partner", description: "Collaborate on programmes, funding or technical expertise.", cta: "Partner with us" }, { title: "Sponsor", description: "Sponsor a specific project, event or community need.", cta: "Sponsor a project" }, { title: "Collaborate", description: "Join a campaign, workshop or community mobilisation.", cta: "Get in touch" }, { title: "Corporate social responsibility", description: "Align your organisation’s CSR with youth and community impact.", cta: "Discuss CSR" },
    ] },
    flagship: { eyebrow: "Flagship project", location: "Location", timeline: "Timeline", beneficiaries: "Beneficiaries", funding: "Funding", read: "Read the full story", support: "Support this project" },
  },
  de: {
    trust: ["Seit Dezember 2020 von jungen Menschen geführt", "In Uganda ansässig", "100 % ehrenamtlich", "Gemeinschaftsnah"],
    impact: { eyebrow: "Wirkung", title: "Zahlen mit Kontext", description: "Jede Kennzahl ist mit dem zugehörigen Programm, Ort, Berichtszeitraum und der Zählmethode verknüpft.", note: "Diese Zahlen stammen von unseren Programmteams und sind keine unabhängig geprüften Ergebnisse. Öffentliche Belege werden verlinkt, sobald sie zur Veröffentlichung freigegeben sind.", cta: "Unsere Wirkung entdecken" },
    about: { eyebrow: "Über Vantage", title: "Lokale Führung. Praktische Chancen. Dauerhafte Veränderung.", paragraphs: ["Vantage Foundation Uganda wurde im Dezember 2020 gegründet. Die von jungen Menschen geführte Organisation geht Hürden an, die Menschen den Zugang zu grundlegender Gesundheitsversorgung, praktischem Finanzwissen, sauberem Wasser und würdevoller Unterstützung im Alltag erschweren.", "Wir arbeiten mit jungen Menschen, Familien und besonders gefährdeten Gemeinschaften in ländlichen Distrikten und informellen städtischen Siedlungen. Beteiligung der Gemeinschaft und Führung durch junge Menschen prägen jedes Programm."], cta: "Unsere Geschichte lesen", imageAlt: "Junge Menschen in Uganda bei einer Lernaktivität von Vantage Foundation" },
    stories: { eyebrow: "Geschichten & Einblicke", title: "Stimmen und Ideen aus unserer Gemeinschaft", description: "Reflexionen, Forschung und Programmneuigkeiten von jungen Menschen, Freiwilligen und Führungskräften, die unsere Arbeit gestalten.", cta: "Geschichten & Einblicke lesen", read: "Geschichte lesen", support: "Diese Arbeit unterstützen" },
    instagram: { title: "Beliebt auf Instagram", description: "Entdecken Sie Geschichten, Programme und Momente aus den Gemeinschaften, die besonders viele Menschen erreichen.", follow: "Vantage Foundation Uganda auf Instagram folgen", postsLabel: "Beliebte Instagram-Beiträge" },
    partners: { eyebrow: "Partner", title: "Nachvollziehbare Partnerschaften", description: "Jede Beziehung wird genau beschrieben, damit Bankdienstleistungen, Sachleistungen und Programmkooperationen korrekt eingeordnet werden." },
    involved: { eyebrow: "Mitmachen", title: "Teil der Bewegung werden", description: "Es gibt viele Wege, jungen Menschen, Familien und Gemeinschaften eine weitere Chance zu ermöglichen.", cards: [
      { title: "Spenden", description: "Finanzieren Sie ein Projekt, eine Kampagne oder unsere allgemeine Arbeit.", cta: "Jetzt spenden" }, { title: "Freiwillig engagieren", description: "Bringen Sie Ihre Zeit als Mentor, Gesundheitsfachkraft, Lehrkraft oder Logistikhelfer ein.", cta: "Freiwillig mitarbeiten" }, { title: "Partner werden", description: "Arbeiten Sie bei Programmen, Finanzierung oder Fachwissen mit uns zusammen.", cta: "Partnerschaft beginnen" }, { title: "Fördern", description: "Unterstützen Sie ein bestimmtes Projekt, eine Veranstaltung oder einen Bedarf vor Ort.", cta: "Projekt fördern" }, { title: "Zusammenarbeiten", description: "Beteiligen Sie sich an einer Kampagne, einem Workshop oder einer Mobilisierung.", cta: "Kontakt aufnehmen" }, { title: "Unternehmerische Verantwortung", description: "Verbinden Sie Ihre CSR-Aktivitäten mit Wirkung für Jugend und Gemeinschaften.", cta: "CSR besprechen" },
    ] },
    flagship: { eyebrow: "Leitprojekt", location: "Ort", timeline: "Zeitraum", beneficiaries: "Begünstigte", funding: "Finanzierung", read: "Die ganze Geschichte lesen", support: "Dieses Projekt unterstützen" },
  },
  fr: {
    trust: ["Dirigée par des jeunes depuis décembre 2020", "Basée en Ouganda", "100 % bénévole", "Centrée sur les communautés"],
    impact: { eyebrow: "Impact", title: "Des données mises en contexte", description: "Chaque chiffre clé est relié au programme, au lieu, à la période de référence et à la méthode de comptage correspondants.", note: "Ces chiffres proviennent de nos équipes de programme et ne sont pas présentés comme des résultats audités de façon indépendante. Les rapports publics seront ajoutés dès leur validation.", cta: "Découvrir notre impact" },
    about: { eyebrow: "À propos de Vantage", title: "Leadership local. Possibilités concrètes. Changement durable.", paragraphs: ["Fondée en décembre 2020, Vantage Foundation Uganda est une organisation dirigée par des jeunes qui s’attaque aux obstacles limitant l’accès aux soins essentiels, aux connaissances financières pratiques, à l’eau potable et à un soutien digne des ménages.", "Nous travaillons avec des jeunes, des familles et des communautés vulnérables dans les districts ruraux et les quartiers urbains informels. La participation communautaire et le leadership des jeunes orientent chaque programme."], cta: "Lire notre histoire", imageAlt: "De jeunes Ougandais participant à une activité d’apprentissage communautaire de Vantage Foundation" },
    stories: { eyebrow: "Récits et perspectives", title: "Voix et idées de notre communauté", description: "Réflexions, recherches et nouvelles des programmes portées par les jeunes, bénévoles et responsables qui façonnent notre action.", cta: "Lire nos récits et perspectives", read: "Lire le récit", support: "Soutenir cette action" },
    instagram: { title: "Populaire sur Instagram", description: "Découvrez les récits, programmes et moments communautaires qui touchent le plus de personnes.", follow: "Suivre Vantage Foundation Uganda sur Instagram", postsLabel: "Publications Instagram populaires" },
    partners: { eyebrow: "Partenaires", title: "Des relations vérifiées", description: "Chaque relation est décrite avec précision afin de distinguer clairement service bancaire, contribution en nature et collaboration de programme." },
    involved: { eyebrow: "S’engager", title: "Rejoignez le mouvement", description: "Il existe de nombreuses façons de créer une possibilité de plus pour un jeune, une famille ou une communauté.", cards: [
      { title: "Faire un don", description: "Financez un projet, une campagne ou notre fonctionnement général.", cta: "Donner maintenant" }, { title: "Devenir bénévole", description: "Donnez de votre temps comme mentor, soignant, éducateur ou soutien logistique.", cta: "Devenir bénévole" }, { title: "Devenir partenaire", description: "Collaborez avec nous sur les programmes, le financement ou l’expertise technique.", cta: "Devenir partenaire" }, { title: "Parrainer", description: "Soutenez un projet, un événement ou un besoin communautaire précis.", cta: "Parrainer un projet" }, { title: "Collaborer", description: "Participez à une campagne, un atelier ou une mobilisation communautaire.", cta: "Nous contacter" }, { title: "Responsabilité sociétale", description: "Alignez votre démarche RSE sur l’impact auprès des jeunes et des communautés.", cta: "Échanger sur la RSE" },
    ] },
    flagship: { eyebrow: "Projet phare", location: "Lieu", timeline: "Calendrier", beneficiaries: "Bénéficiaires", funding: "Financement", read: "Lire le récit complet", support: "Soutenir ce projet" },
  },
};

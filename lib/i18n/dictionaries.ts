import "server-only";

import type { Locale } from "./config";

export const englishDictionary = {
  meta: {
    siteTitle: "Vantage Foundation Uganda | Community-led impact",
    siteDescription:
      "Vantage Foundation Uganda is a youth-led nonprofit improving access to health, education, clean water and humanitarian support in underserved Ugandan communities.",
    // Search keywords are matched against what people actually type, so the
    // German and French lists are researched terms rather than translations
    // of the English ones. The organisation name stays untranslated.
    keywords: [
      "Vantage Foundation Uganda",
      "Uganda nonprofit",
      "community health Uganda",
      "financial literacy Uganda",
      "humanitarian assistance Uganda",
      "WASH Uganda",
      "youth-led nonprofit",
    ] as readonly string[],
  },
  language: {
    label: "Language",
    change: "Change language",
    changing: "Changing language…",
  },
  navigation: {
    main: "Main navigation",
    mobile: "Mobile navigation",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    about: "About",
    ourStory: "Our Story",
    team: "Team",
    governance: "Governance",
    reportsAccountability: "Reports and Accountability",
    contact: "Contact",
    programmes: "Programmes",
    humanitarian: "Humanitarian Assistance",
    wash: "Water, Sanitation and Hygiene",
    impact: "Impact",
    projects: "Projects",
    whereWeWork: "Where We Work",
    impactResults: "Impact Results",
    reports: "Reports",
    stories: "Stories & Insights",
    getInvolved: "Get Involved",
    donate: "Donate",
    volunteer: "Volunteer",
    partner: "Partner",
    sponsor: "Sponsor",
    csr: "Corporate Social Responsibility",
  },
  common: {
    learnMore: "Learn more",
    readMore: "Read more",
    viewAll: "View all",
    required: "required",
    optional: "optional",
    privacy: "Privacy",
    terms: "Terms",
    safeguarding: "Safeguarding",
    accessibility: "Accessibility",
    allRightsReserved: "All rights reserved.",
    skipToContent: "Skip to main content",
    breadcrumb: "Breadcrumb",
    home: "Home",
    backTo: "Back to",
    programmeSuffix: "Programme",
    lastUpdated: "Last updated",
    reviewedAnnually: "This page is reviewed annually.",
    loading: "Loading…",
    // Shown on pages whose interface is localized but whose editorial body
    // has no approved translation yet. Honest beats machine-translated.
    originalLanguageNotice:
      "This article is currently available in English only. The rest of the site is available in your language.",
  },
  errors: {
    notFoundTitle: "Page not found",
    notFoundDescription:
      "The page you are looking for may have moved, been renamed, or is no longer available.",
    returnHome: "Return Home",
    contactUs: "Contact Us",
    popularPages: "Popular pages",
    errorEyebrow: "Something went wrong",
    errorTitle: "An error occurred",
    errorDescription:
      "We are sorry — something went wrong while loading this page. Please try again, or contact us if the problem persists.",
    tryAgain: "Try again",
    errorId: "Error ID",
  },
  footer: {
    summary: "Vantage Foundation Uganda Limited is a youth-led nonprofit improving access to health, education, clean water and humanitarian support in underserved Ugandan communities.",
    impactAccountability: "Impact & Accountability",
    contactVantage: "Contact Vantage",
    newsletter: "Newsletter",
    newsletterDescription: "Get updates on our work, stories and ways to support.",
    jinjaOffice: "Jinja Office",
    ishakaOffice: "Ishaka Office",
    easternRegion: "Eastern Region",
    bushenyiDistrict: "Bushenyi District",
  },
  home: {
    heroEyebrow: "Youth-led. Community-rooted.",
    heroTitle: "Changing the world, one advantage at a time.",
    heroDescription: "Vantage Foundation Uganda is a youth-led nonprofit improving access to health, education, clean water and humanitarian support in underserved Ugandan communities.",
    exploreWork: "Explore our work",
    whoWeAre: "Who we are",
    ourImpact: "Our impact",
    areasTitle: "Our areas of work",
    areasDescription: "Four connected programmes designed around the realities communities face.",
    joinUs: "Join Us",
    finalTitle: "Help us create one more advantage",
    finalDescription: "Your support expands access to healthcare, education, clean water and humanitarian support for communities that need it most.",
    donateNow: "Donate Now",
    stayInLoop: "Stay in the loop",
    stayDescription: "Subscribe for project updates, stories and opportunities to support our work.",
  },
  about: {
    title: "About Vantage Foundation Uganda",
    description: "Youth-led, community-centred and committed to one more advantage at a time.",
    mission: "Mission",
    vision: "Vision",
    values: "Values",
    whoWeServe: "Who we serve",
    whoWeServeDescription: "We focus on the people and places often left out of mainstream development.",
    targetBeneficiaries: "Target beneficiaries",
    approach: "Our approach",
    meetTeam: "Meet the team",
    teamDescription: "Youth-led and volunteer-driven.",
    fullTeam: "Meet the full team",
    governanceTitle: "Governance and accountability",
    governanceDescription: "We are working towards the highest standards of transparency and safeguarding.",
  },
  contact: {
    title: "Contact us",
    description: "We would love to hear from you. Reach out for donations, volunteering, partnerships or general inquiries.",
    email: "Email",
    phone: "Phone",
    location: "Location",
    privateEmailHelp: "Use the form on this page — choose a category and your message goes straight to the right team.",
    sendTitle: "Send us a message",
    sendDescription: "Fill out the form below and we will respond as soon as possible.",
  },
  forms: {
    fullName: "Full name",
    email: "Email",
    emailAddress: "Email address",
    organisation: "Organisation",
    phone: "Phone",
    subject: "What is your message about?",
    selectCategory: "Select a category",
    categoryHint: "Choosing a category helps us route your message to the right team.",
    message: "Message",
    sending: "Sending…",
    sendMessage: "Send message",
    messageReceived: "Message received",
    replyTime: "We aim to reply within five working days.",
    enterEmail: "Enter your email",
    newsletterConsent: "I agree to receive updates from Vantage Foundation Uganda.",
    subscribe: "Subscribe",
    subscribing: "Subscribing…",
    unsubscribePrivacy: "You can unsubscribe at any time. See our",
    contactPrivacy: "We will only use your details to respond to your enquiry. See our",
    categories: { general: "General inquiry", partnerships: "Partnerships", grants: "Grants & funding", programmes: "Programmes", volunteering: "Volunteering", media: "Media / press", research: "Research", donation: "Donation support", safeguarding: "Safeguarding concern", other: "Other" },
  },
} as const;

type WidenStrings<T> = {
  [K in keyof T]: T[K] extends string ? string : WidenStrings<T[K]>;
};

type Dictionary = WidenStrings<typeof englishDictionary>;
type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

const de: DeepPartial<Dictionary> = {
  meta: {
    siteTitle: "Vantage Foundation Uganda | Wirkung aus der Gemeinschaft",
    siteDescription:
      "Vantage Foundation Uganda ist eine von jungen Menschen geführte gemeinnützige Organisation, die benachteiligten Gemeinschaften in Uganda besseren Zugang zu Gesundheit, Bildung, sauberem Wasser und humanitärer Hilfe ermöglicht.",
    keywords: [
      "Vantage Foundation Uganda",
      "Hilfsorganisation Uganda",
      "Spenden Uganda",
      "Gesundheitsversorgung Uganda",
      "Bildung Uganda",
      "sauberes Wasser Uganda",
      "humanitäre Hilfe Uganda",
    ],
  },
  language: { label: "Sprache", change: "Sprache ändern", changing: "Sprache wird geändert…" },
  navigation: {
    main: "Hauptnavigation", mobile: "Mobile Navigation", openMenu: "Menü öffnen", closeMenu: "Menü schließen",
    about: "Über uns", ourStory: "Unsere Geschichte", team: "Team", governance: "Leitung und Aufsicht",
    reportsAccountability: "Berichte und Rechenschaft", contact: "Kontakt", programmes: "Programme",
    humanitarian: "Humanitäre Hilfe", wash: "Wasser, Sanitärversorgung und Hygiene", impact: "Wirkung",
    projects: "Projekte", whereWeWork: "Wo wir tätig sind", impactResults: "Wirkungsergebnisse", reports: "Berichte",
    stories: "Geschichten & Einblicke", getInvolved: "Mitmachen", donate: "Spenden", volunteer: "Freiwillig engagieren",
    partner: "Partner werden", sponsor: "Fördern", csr: "Gesellschaftliche Unternehmensverantwortung",
  },
  common: {
    learnMore: "Mehr erfahren", readMore: "Weiterlesen", viewAll: "Alle anzeigen", required: "Pflichtfeld", optional: "optional",
    privacy: "Datenschutz", terms: "Nutzungsbedingungen", safeguarding: "Schutzkonzept", accessibility: "Barrierefreiheit",
    allRightsReserved: "Alle Rechte vorbehalten.", skipToContent: "Zum Hauptinhalt springen",
    breadcrumb: "Navigationspfad", home: "Startseite", backTo: "Zurück zu", lastUpdated: "Zuletzt aktualisiert", programmeSuffix: "Programm",
    reviewedAnnually: "Diese Seite wird jährlich überprüft.", loading: "Wird geladen…",
    originalLanguageNotice: "Dieser Beitrag liegt derzeit nur auf Englisch vor. Die übrige Website steht in Ihrer Sprache zur Verfügung.",
  },
  errors: {
    notFoundTitle: "Seite nicht gefunden",
    notFoundDescription: "Die gesuchte Seite wurde möglicherweise verschoben, umbenannt oder ist nicht mehr verfügbar.",
    returnHome: "Zur Startseite", contactUs: "Kontakt aufnehmen", popularPages: "Beliebte Seiten",
    errorEyebrow: "Es ist ein Problem aufgetreten", errorTitle: "Ein Fehler ist aufgetreten",
    errorDescription: "Beim Laden dieser Seite ist etwas schiefgelaufen. Bitte versuchen Sie es erneut oder kontaktieren Sie uns, falls das Problem weiterhin besteht.",
    tryAgain: "Erneut versuchen", errorId: "Fehler-ID",
  },
  footer: {
    summary: "Vantage Foundation Uganda Limited ist eine von jungen Menschen geführte gemeinnützige Organisation, die benachteiligten Gemeinschaften in Uganda besseren Zugang zu Gesundheit, Bildung, sauberem Wasser und humanitärer Hilfe ermöglicht.",
    impactAccountability: "Wirkung & Rechenschaft", contactVantage: "Vantage kontaktieren", newsletter: "Newsletter",
    newsletterDescription: "Erhalten Sie Neuigkeiten über unsere Arbeit, Geschichten und Unterstützungsmöglichkeiten.",
    jinjaOffice: "Büro Jinja", ishakaOffice: "Büro Ishaka", easternRegion: "Ostregion", bushenyiDistrict: "Distrikt Bushenyi",
  },
  home: {
    heroEyebrow: "Von jungen Menschen geführt. In der Gemeinschaft verwurzelt.", heroTitle: "Chancen schaffen, die Leben verändern",
    heroDescription: "Gemeinsam mit benachteiligten Gemeinschaften in Uganda verbessern wir den Zugang zu Gesundheit, Bildung, sauberem Wasser und humanitärer Hilfe.",
    exploreWork: "Unsere Arbeit entdecken", whoWeAre: "Wer wir sind", ourImpact: "Unsere Wirkung", areasTitle: "Unsere Arbeitsbereiche",
    areasDescription: "Vier miteinander verbundene Programme, die an den Lebensrealitäten der Gemeinschaften ansetzen.", joinUs: "Machen Sie mit",
    finalTitle: "Helfen Sie uns, eine weitere Chance zu schaffen", finalDescription: "Ihre Unterstützung erweitert den Zugang zu Gesundheitsversorgung, Bildung, sauberem Wasser und humanitärer Hilfe für Gemeinschaften, die sie am dringendsten benötigen.",
    donateNow: "Jetzt spenden", stayInLoop: "Bleiben Sie auf dem Laufenden", stayDescription: "Abonnieren Sie Neuigkeiten zu Projekten, Geschichten und Möglichkeiten, unsere Arbeit zu unterstützen.",
  },
  about: {
    title: "Über Vantage Foundation Uganda", description: "Von jungen Menschen geführt, gemeinschaftsnah und jeder neuen Chance verpflichtet.", mission: "Mission", vision: "Vision", values: "Werte",
    whoWeServe: "Für wen wir arbeiten", whoWeServeDescription: "Wir konzentrieren uns auf Menschen und Orte, die in der Entwicklungsarbeit häufig übersehen werden.",
    targetBeneficiaries: "Zielgruppen", approach: "Unser Ansatz", meetTeam: "Unser Team", teamDescription: "Von jungen Menschen geführt und von Freiwilligen getragen.",
    fullTeam: "Das ganze Team kennenlernen", governanceTitle: "Leitung und Rechenschaft", governanceDescription: "Wir arbeiten auf höchste Standards bei Transparenz und Schutz hin.",
  },
  contact: {
    title: "Kontakt", description: "Wir freuen uns, von Ihnen zu hören. Kontaktieren Sie uns zu Spenden, freiwilligem Engagement, Partnerschaften oder allgemeinen Anliegen.",
    email: "E-Mail", phone: "Telefon", location: "Standort", privateEmailHelp: "Nutzen Sie das Formular auf dieser Seite – wählen Sie eine Kategorie, damit Ihre Nachricht direkt das zuständige Team erreicht.",
    sendTitle: "Nachricht senden", sendDescription: "Füllen Sie das Formular aus. Wir antworten so bald wie möglich.",
  },
  forms: {
    fullName: "Vollständiger Name", email: "E-Mail", emailAddress: "E-Mail-Adresse", organisation: "Organisation", phone: "Telefon",
    subject: "Worum geht es in Ihrer Nachricht?", selectCategory: "Kategorie auswählen", categoryHint: "Mit einer Kategorie gelangt Ihre Nachricht zum richtigen Team.",
    message: "Nachricht", sending: "Wird gesendet…", sendMessage: "Nachricht senden", messageReceived: "Nachricht eingegangen", replyTime: "Wir bemühen uns, innerhalb von fünf Werktagen zu antworten.",
    enterEmail: "E-Mail-Adresse eingeben", newsletterConsent: "Ich möchte Neuigkeiten von Vantage Foundation Uganda erhalten.", subscribe: "Abonnieren", subscribing: "Wird abonniert…",
    unsubscribePrivacy: "Sie können sich jederzeit abmelden. Siehe unsere", contactPrivacy: "Wir verwenden Ihre Angaben nur zur Beantwortung Ihrer Anfrage. Siehe unsere",
    categories: { general: "Allgemeine Anfrage", partnerships: "Partnerschaften", grants: "Fördermittel & Finanzierung", programmes: "Programme", volunteering: "Freiwilliges Engagement", media: "Medien / Presse", research: "Forschung", donation: "Unterstützung bei Spenden", safeguarding: "Schutzanliegen", other: "Sonstiges" },
  },
};

const fr: DeepPartial<Dictionary> = {
  meta: {
    siteTitle: "Vantage Foundation Uganda | Un impact porté par les communautés",
    siteDescription:
      "Vantage Foundation Uganda est une organisation à but non lucratif dirigée par des jeunes qui améliore l’accès à la santé, à l’éducation, à l’eau potable et à l’aide humanitaire dans les communautés ougandaises mal desservies.",
    keywords: [
      "Vantage Foundation Uganda",
      "ONG Ouganda",
      "faire un don Ouganda",
      "accès aux soins Ouganda",
      "éducation Ouganda",
      "eau potable Ouganda",
      "aide humanitaire Ouganda",
    ],
  },
  language: { label: "Langue", change: "Changer de langue", changing: "Changement de langue…" },
  navigation: {
    main: "Navigation principale", mobile: "Navigation mobile", openMenu: "Ouvrir le menu", closeMenu: "Fermer le menu",
    about: "À propos", ourStory: "Notre histoire", team: "Équipe", governance: "Gouvernance",
    reportsAccountability: "Rapports et redevabilité", contact: "Contact", programmes: "Programmes",
    humanitarian: "Aide humanitaire", wash: "Eau, assainissement et hygiène", impact: "Impact",
    projects: "Projets", whereWeWork: "Où nous intervenons", impactResults: "Résultats d’impact", reports: "Rapports",
    stories: "Récits et perspectives", getInvolved: "S’engager", donate: "Faire un don", volunteer: "Devenir bénévole",
    partner: "Devenir partenaire", sponsor: "Parrainer", csr: "Responsabilité sociétale des entreprises",
  },
  common: {
    learnMore: "En savoir plus", readMore: "Lire la suite", viewAll: "Tout voir", required: "obligatoire", optional: "facultatif",
    privacy: "Confidentialité", terms: "Conditions d’utilisation", safeguarding: "Protection", accessibility: "Accessibilité",
    allRightsReserved: "Tous droits réservés.", skipToContent: "Aller au contenu principal",
    breadcrumb: "Fil d’Ariane", home: "Accueil", backTo: "Retour à", lastUpdated: "Dernière mise à jour", programmeSuffix: "Programme",
    reviewedAnnually: "Cette page est révisée chaque année.", loading: "Chargement…",
    originalLanguageNotice: "Cet article n’est actuellement disponible qu’en anglais. Le reste du site est disponible dans votre langue.",
  },
  errors: {
    notFoundTitle: "Page introuvable",
    notFoundDescription: "La page que vous cherchez a peut-être été déplacée, renommée ou n’est plus disponible.",
    returnHome: "Retour à l’accueil", contactUs: "Nous contacter", popularPages: "Pages populaires",
    errorEyebrow: "Un problème est survenu", errorTitle: "Une erreur s’est produite",
    errorDescription: "Une erreur s’est produite lors du chargement de cette page. Veuillez réessayer ou nous contacter si le problème persiste.",
    tryAgain: "Réessayer", errorId: "Identifiant de l’erreur",
  },
  footer: {
    summary: "Vantage Foundation Uganda Limited est une organisation à but non lucratif dirigée par des jeunes. Elle améliore l’accès à la santé, à l’éducation, à l’eau potable et à l’aide humanitaire dans les communautés ougandaises mal desservies.",
    impactAccountability: "Impact et redevabilité", contactVantage: "Contacter Vantage", newsletter: "Infolettre",
    newsletterDescription: "Recevez des nouvelles de notre action, des récits et des façons de nous soutenir.",
    jinjaOffice: "Bureau de Jinja", ishakaOffice: "Bureau d’Ishaka", easternRegion: "Région de l’Est", bushenyiDistrict: "District de Bushenyi",
  },
  home: {
    heroEyebrow: "Portés par la jeunesse. Ancrés dans les communautés.", heroTitle: "Créer des possibilités qui transforment des vies",
    heroDescription: "Aux côtés des communautés mal desservies d’Ouganda, nous améliorons l’accès à la santé, à l’éducation, à l’eau potable et à l’aide humanitaire.",
    exploreWork: "Découvrir notre action", whoWeAre: "Qui sommes-nous", ourImpact: "Notre impact", areasTitle: "Nos domaines d’action",
    areasDescription: "Quatre programmes complémentaires conçus autour des réalités vécues par les communautés.", joinUs: "Rejoignez-nous",
    finalTitle: "Aidez-nous à créer une possibilité de plus", finalDescription: "Votre soutien améliore l’accès aux soins, à l’éducation, à l’eau potable et à l’aide humanitaire pour les communautés qui en ont le plus besoin.",
    donateNow: "Faire un don", stayInLoop: "Restez informé·e", stayDescription: "Abonnez-vous pour recevoir nos actualités, nos récits et les possibilités de soutenir notre action.",
  },
  about: {
    title: "À propos de Vantage Foundation Uganda", description: "Dirigée par des jeunes, centrée sur les communautés et engagée à créer une possibilité de plus.", mission: "Mission", vision: "Vision", values: "Valeurs",
    whoWeServe: "Les personnes que nous accompagnons", whoWeServeDescription: "Nous nous concentrons sur les personnes et les lieux souvent laissés de côté par les programmes de développement.",
    targetBeneficiaries: "Bénéficiaires prioritaires", approach: "Notre approche", meetTeam: "Rencontrez l’équipe", teamDescription: "Une organisation dirigée par des jeunes et portée par des bénévoles.",
    fullTeam: "Découvrir toute l’équipe", governanceTitle: "Gouvernance et redevabilité", governanceDescription: "Nous visons les normes les plus élevées en matière de transparence et de protection.",
  },
  contact: {
    title: "Nous contacter", description: "Nous serons heureux de vous lire. Contactez-nous au sujet des dons, du bénévolat, des partenariats ou pour toute question générale.",
    email: "E-mail", phone: "Téléphone", location: "Adresse", privateEmailHelp: "Utilisez le formulaire de cette page et choisissez une catégorie : votre message sera transmis directement à l’équipe concernée.",
    sendTitle: "Envoyez-nous un message", sendDescription: "Remplissez le formulaire ci-dessous. Nous vous répondrons dès que possible.",
  },
  forms: {
    fullName: "Nom complet", email: "E-mail", emailAddress: "Adresse e-mail", organisation: "Organisation", phone: "Téléphone",
    subject: "Quel est l’objet de votre message ?", selectCategory: "Choisir une catégorie", categoryHint: "La catégorie nous aide à transmettre votre message à la bonne équipe.",
    message: "Message", sending: "Envoi…", sendMessage: "Envoyer le message", messageReceived: "Message reçu", replyTime: "Nous nous efforçons de répondre sous cinq jours ouvrés.",
    enterEmail: "Saisissez votre e-mail", newsletterConsent: "J’accepte de recevoir des nouvelles de Vantage Foundation Uganda.", subscribe: "S’abonner", subscribing: "Abonnement…",
    unsubscribePrivacy: "Vous pouvez vous désabonner à tout moment. Consultez notre", contactPrivacy: "Nous utiliserons vos coordonnées uniquement pour répondre à votre demande. Consultez notre",
    categories: { general: "Question générale", partnerships: "Partenariats", grants: "Subventions et financement", programmes: "Programmes", volunteering: "Bénévolat", media: "Médias / presse", research: "Recherche", donation: "Aide concernant un don", safeguarding: "Question de protection", other: "Autre" },
  },
};

function mergeWithEnglish<T extends Record<string, unknown>>(base: T, localized: DeepPartial<T>): T {
  const result = { ...base };
  for (const key of Object.keys(base) as Array<keyof T>) {
    const baseValue = base[key];
    const localizedValue = localized[key];
    if (localizedValue === undefined) continue;
    // Arrays (keyword lists, option lists) are replaced wholesale rather than
    // merged index by index: spreading an array into an object literal would
    // turn it into `{0: …, 1: …}` and a localized list is rarely the same
    // length as the English one anyway.
    const mergeable =
      baseValue !== null &&
      localizedValue !== null &&
      typeof baseValue === "object" &&
      typeof localizedValue === "object" &&
      !Array.isArray(baseValue) &&
      !Array.isArray(localizedValue);
    result[key] = (
      mergeable
        ? mergeWithEnglish(baseValue as Record<string, unknown>, localizedValue as DeepPartial<Record<string, unknown>>)
        : localizedValue
    ) as T[keyof T];
  }
  return result;
}

const dictionaries: Record<Locale, Dictionary> = {
  en: englishDictionary,
  de: mergeWithEnglish(englishDictionary as unknown as Dictionary, de),
  fr: mergeWithEnglish(englishDictionary as unknown as Dictionary, fr),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale] ?? englishDictionary;
}

export type I18nDictionary = Dictionary;

export function getByKey(locale: Locale, key: string): string {
  const read = (object: unknown): unknown => key.split(".").reduce<unknown>((value, part) => {
    return value && typeof value === "object" ? (value as Record<string, unknown>)[part] : undefined;
  }, object);
  const localized = read(dictionaries[locale]);
  const fallback = read(englishDictionary);
  return typeof localized === "string" ? localized : typeof fallback === "string" ? fallback : "";
}

export function resolveTranslation(localized: unknown, key: string): string {
  const read = (object: unknown): unknown => key.split(".").reduce<unknown>((value, part) => {
    return value && typeof value === "object" ? (value as Record<string, unknown>)[part] : undefined;
  }, object);
  const value = read(localized);
  const fallback = read(englishDictionary);
  return typeof value === "string" ? value : typeof fallback === "string" ? fallback : "";
}

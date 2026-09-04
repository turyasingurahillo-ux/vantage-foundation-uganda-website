import type { Locale } from "../config";

/**
 * Copy for the supporter/engagement pages: /donate, /get-involved,
 * /donors-and-sponsors and /faq.
 *
 * Repeated structures (FAQ entries, involvement pathways, donation steps,
 * bank-detail labels) are modelled as arrays of typed objects so a page can
 * iterate one shape rather than reaching for a numbered key per item, and so
 * a translator adding a locale is told by the compiler exactly what is
 * missing.
 *
 * Stable identifiers never change between locales. `FaqEntry.id` and
 * `InvolvementPathway.id` are what the pages key React lists, DOM ids and
 * icons off, and `FaqEntry.donationRelated` is what the donate page filters
 * its FAQ excerpt by — matching on translated question text would silently
 * empty that section in German and French.
 */

export type FaqEntry = {
  id: string;
  question: string;
  answer: string;
  /** Included in the donation FAQ excerpt on /donate. */
  donationRelated?: boolean;
};

export type InvolvementPathway = {
  /** Also the card's DOM id (deep links such as /get-involved#volunteer). */
  id: "donate" | "volunteer" | "partner" | "sponsor" | "collaborate" | "csr";
  title: string;
  description: string;
  ctaLabel: string;
  /** Unlocalized path; the page runs it through `localePath`. */
  ctaHref: string;
};

export type DonationCampaign = {
  /** Value submitted to the server action — never translated. */
  id: string;
  label: string;
};

export type DonationStep = {
  step: string;
  title: string;
  description: string;
};

export type TransparencyStat = {
  value: string;
  label: string;
};

export type BankDetailsCopy = {
  heading: string;
  bank: string;
  accountName: string;
  accountNumber: string;
  swift: string;
  copy: string;
  copied: string;
};

export type DonationFormCopy = {
  amountLegend: string;
  customAmountLabel: string;
  customAmountPlaceholder: string;
  frequencyLegend: string;
  oneTime: string;
  monthly: string;
  frequencyNote: string;
  campaignLabel: string;
  nameLabel: string;
  emailLabel: string;
  phoneLabel: string;
  transactionLabel: string;
  transactionPlaceholder: string;
  messageLabel: string;
  submitLabel: string;
  submitPending: string;
  privacyNotice: string;
};

export type RecognitionCategory = {
  name: string;
  description: string;
};

export type DonateContent = {
  /** Metadata title and description. */
  title: string;
  description: string;
  heroTitle: string;
  heroDescription: string;
  whyTitle: string;
  whyReasons: string[];
  allocationTitle: string;
  allocationDescription: string;
  campaigns: DonationCampaign[];
  bank: BankDetailsCopy;
  transparencyNote: string;
  formTitle: string;
  formDescription: string;
  /** Split so "pending" can stay emphasised without embedding markup. */
  pendingNoticeLead: string;
  pendingNoticeStrong: string;
  pendingNoticeTail: string;
  form: DonationFormCopy;
  stepsEyebrow: string;
  stepsTitle: string;
  stepsDescription: string;
  steps: DonationStep[];
  transparencyEyebrow: string;
  transparencyTitle: string;
  transparencyDescription: string;
  transparencyStats: TransparencyStat[];
  reportsCta: string;
  faqTitle: string;
  faqDescription: string;
  contactTitle: string;
  contactDescription: string;
  contactCta: string;
};

export type GetInvolvedContent = {
  title: string;
  description: string;
  heroTitle: string;
  heroDescription: string;
  pathways: InvolvementPathway[];
  reachOutTitle: string;
  reachOutDescription: string;
};

export type DonorsAndSponsorsContent = {
  title: string;
  /** `{name}` is replaced with the organisation name at render time. */
  description: string;
  heroTitle: string;
  heroDescription: string;
  intro: string;
  categories: RecognitionCategory[];
  recognisedTitle: string;
  recognisedDescription: string;
  /** Group headings, keyed by the English `relationshipType` in the data. */
  relationshipTypeLabels: Record<string, string>;
  otherRelationshipType: string;
  visitWebsite: string;
  emptyState: string;
  policyTitle: string;
  policyBody: string;
  sponsorTitle: string;
  sponsorBody: string;
  donateCta: string;
  contactTitle: string;
  contactDescription: string;
  /** Used for `${partner.name} logo` alt text when no explicit alt exists. */
  logoAltSuffix: string;
};

export type FaqContent = {
  title: string;
  description: string;
  heroTitle: string;
  heroDescription: string;
  items: FaqEntry[];
};

export type EngagementContent = {
  donate: DonateContent;
  getInvolved: GetInvolvedContent;
  donorsAndSponsors: DonorsAndSponsorsContent;
  faq: FaqContent;
};

export const engagementContent: Record<Locale, EngagementContent> = {
  en: {
    donate: {
      title: "Donate",
      description:
        "Support Vantage Foundation Uganda by transferring to its official bank account and recording your donation for verification.",
      heroTitle: "Support our work",
      heroDescription:
        "Your donation becomes one more advantage for a young person, family or community.",
      whyTitle: "Why donate?",
      whyReasons: [
        "Your donation goes directly to programmes — we are 100% volunteer-run.",
        "You can support a specific project, such as the Kasaale Deep Borehole, SaveGirl Uganda or the Advantage Book Club.",
        "You will receive a confirmation and, where possible, an update on how your gift was used.",
        "Every contribution, large or small, is one more advantage for a young person, family or community.",
      ],
      allocationTitle: "Where your donation goes",
      allocationDescription:
        "Choose a specific project or let us direct it to where it is needed most.",
      campaigns: [
        { id: "general", label: "Where it is needed most" },
        { id: "savegirl", label: "SaveGirl Uganda" },
        { id: "abc", label: "Advantage Book Club" },
        { id: "borehole", label: "Kasaale Deep Borehole" },
        { id: "relief", label: "Orphanage & Island Relief" },
      ],
      bank: {
        heading: "Bank transfer",
        bank: "Bank",
        accountName: "Account name",
        accountNumber: "Account number",
        swift: "SWIFT/BIC",
        copy: "Copy bank details",
        copied: "Copied",
      },
      transparencyNote:
        "We are 100% volunteer-run and committed to financial transparency. Your details will only be used to process your donation and send a receipt.",
      formTitle: "Make a donation",
      formDescription:
        "Fill in your details, make the transfer, and include the transaction reference if you have one.",
      pendingNoticeLead: "All donations are recorded as ",
      pendingNoticeStrong: "pending",
      pendingNoticeTail:
        " until a Vantage administrator verifies the transfer against our official bank statement.",
      form: {
        amountLegend: "Choose an amount (UGX)",
        customAmountLabel: "Or enter a custom amount",
        customAmountPlaceholder: "Enter amount in UGX",
        frequencyLegend: "Frequency",
        oneTime: "One-time",
        monthly: "Monthly pledge",
        frequencyNote:
          "A monthly pledge is a manual commitment, not an automatic recurring payment.",
        campaignLabel: "Support a specific project",
        nameLabel: "Name",
        emailLabel: "Email",
        phoneLabel: "Phone (optional)",
        transactionLabel: "Transaction reference (optional)",
        transactionPlaceholder: "Bank transfer reference",
        messageLabel: "Message (optional)",
        submitLabel: "Confirm donation intent",
        submitPending: "Submitting...",
        privacyNotice:
          "We will only use your details to process your donation and send a receipt. See our",
      },
      stepsEyebrow: "How it works",
      stepsTitle: "Three simple steps",
      stepsDescription:
        "From transfer to impact, here is what happens when you donate.",
      steps: [
        {
          step: "1",
          title: "Transfer",
          description:
            "Make a bank transfer to our official account using the details above. Include a reference if you have one.",
        },
        {
          step: "2",
          title: "Record",
          description:
            "Fill in the donation form so we can match your transfer and send you a confirmation. Your details stay private.",
        },
        {
          step: "3",
          title: "Verify",
          description:
            "A Vantage administrator verifies your transfer against our bank statement. You receive a confirmation and, where possible, an update on how your gift was used.",
        },
      ],
      transparencyEyebrow: "Transparency",
      transparencyTitle: "Where every shilling goes",
      transparencyDescription:
        "As a 100% volunteer-run organisation, donations go directly to programmes — not salaries or overhead.",
      transparencyStats: [
        { value: "100%", label: "Volunteer-run — no paid staff" },
        { value: "Direct", label: "Funds go to programmes, not intermediaries" },
        { value: "Verified", label: "Every donation checked against bank statements" },
      ],
      reportsCta: "See our accountability commitments",
      faqTitle: "Donation FAQ",
      faqDescription: "Common questions about giving to Vantage Foundation Uganda.",
      contactTitle: "Questions about donating?",
      contactDescription:
        "We are happy to discuss specific projects, tax-deductibility or partnership opportunities.",
      contactCta: "Contact us",
    },
    getInvolved: {
      title: "Get Involved",
      description:
        "Donate, volunteer, partner, sponsor or collaborate with Vantage Foundation Uganda.",
      heroTitle: "Get Involved",
      heroDescription: "There are many ways to help create one more advantage.",
      pathways: [
        {
          id: "donate",
          title: "Donate",
          description:
            "Fund a project, a campaign or our general operations. Every contribution is one more advantage.",
          ctaLabel: "Donate now",
          ctaHref: "/donate",
        },
        {
          id: "volunteer",
          title: "Volunteer",
          description:
            "Share your time as a mentor, health worker, educator, communications volunteer or logistics helper.",
          ctaLabel: "Become a volunteer",
          ctaHref: "/contact?subject=volunteer",
        },
        {
          id: "partner",
          title: "Partner",
          description:
            "Collaborate on programmes, funding, technical expertise or joint community initiatives.",
          ctaLabel: "Partner with us",
          ctaHref: "/contact?subject=partner",
        },
        {
          id: "sponsor",
          title: "Sponsor",
          description:
            "Sponsor a specific project, event or community need and receive updates on outcomes.",
          ctaLabel: "Sponsor a project",
          ctaHref: "/contact?subject=sponsor",
        },
        {
          id: "collaborate",
          title: "Collaborate",
          description:
            "Join a campaign, workshop or community mobilisation aligned with your skills.",
          ctaLabel: "Get in touch",
          ctaHref: "/contact?subject=general",
        },
        {
          id: "csr",
          title: "Corporate social responsibility",
          description:
            "Align your organisation's CSR with youth empowerment, health, education and WASH impact.",
          ctaLabel: "Discuss CSR",
          ctaHref: "/contact?subject=partner",
        },
      ],
      reachOutTitle: "Reach out",
      reachOutDescription:
        "Tell us how you would like to be involved and we will follow up.",
    },
    donorsAndSponsors: {
      title: "Partners, Donors & Sponsors",
      description:
        "Recognizing the individuals, companies and organizations who support {name}, with their consent.",
      heroTitle: "Partners, Donors & Sponsors",
      heroDescription:
        "Verified relationships and consent-based recognition of organisations and people supporting our work.",
      intro:
        "{name} is grateful to every donor, sponsor and partner who supports our health, education and humanitarian work. This page recognises contributors who have given their documented consent to be publicly named.",
      categories: [
        {
          name: "Strategic Partners",
          description: "Long-term organisational partnerships shaping our direction.",
        },
        {
          name: "Programme Sponsors",
          description:
            "Sustained support for a specific health, education or humanitarian programme.",
        },
        {
          name: "Project Donors",
          description: "Funding for a single project, such as a borehole or medical camp.",
        },
        {
          name: "In-Kind Supporters",
          description: "Goods, services or expertise donated in place of cash.",
        },
        {
          name: "Community Partners",
          description:
            "Local leaders, organisations and volunteers who make our work possible.",
        },
        {
          name: "Anonymous Contributors",
          description: "Donors who choose to support us without public recognition.",
        },
      ],
      recognisedTitle: "Recognised contributors",
      recognisedDescription:
        "Featured with the documented consent of each contributor, grouped by relationship type.",
      relationshipTypeLabels: {
        "In-kind programme contributor": "In-kind programme contributor",
        "Programme collaborator": "Programme collaborator",
        "Programme and technology partner": "Programme and technology partner",
      },
      otherRelationshipType: "Other",
      visitWebsite: "Visit official website",
      emptyState:
        "Partner and donor recognitions will appear here with their consent.",
      policyTitle: "Recognition policy",
      policyBody:
        "We only publish a donor or sponsor’s name, logo, or description with their documented, written consent. We never publish donation amounts or personal financial details. Donors may request removal from this page at any time, and may choose to give anonymously and remain unnamed.",
      sponsorTitle: "Become a sponsor",
      sponsorBody:
        "If you or your organisation would like to sponsor a programme, support a project, or nominate a contributor for recognition, use the form or donate directly below.",
      donateCta: "Donate",
      contactTitle: "Contact us about sponsorship",
      contactDescription:
        "Tell us about your organisation and how you’d like to support our work.",
      logoAltSuffix: "logo",
    },
    faq: {
      title: "FAQ",
      description:
        "Frequently asked questions about Vantage Foundation Uganda, our work, donations and partnerships.",
      heroTitle: "Frequently Asked Questions",
      heroDescription:
        "Answers to common questions about our work and how to get involved.",
      items: [
        {
          id: "what-we-do",
          question: "What does Vantage Foundation Uganda do?",
          answer:
            "Vantage Foundation Uganda is a youth-led nonprofit that improves livelihoods in Ugandan communities through health, education, humanitarian aid and water, sanitation and hygiene (WASH) projects. We focus on underserved rural districts and urban informal settlements.",
        },
        {
          id: "where-we-work",
          question: "Where does Vantage Foundation Uganda work?",
          answer:
            "Our current work reaches communities in Bushenyi District, Kampala, Kalangala Island, Jinja and other rural districts across Uganda. We identify areas often overlooked by larger international NGOs.",
        },
        {
          id: "project-selection",
          question: "How are projects selected?",
          answer:
            "We work with local leaders and community members to identify needs, existing efforts and realistic solutions. Projects are chosen based on impact potential, community readiness and available resources.",
        },
        {
          id: "donations-used",
          donationRelated: true,
          question: "How are donations used?",
          answer:
            "Donations support programme costs such as medication, books, well construction, logistics, menstrual products and direct support for orphanages. We operate on a 100% volunteer basis, so funds go directly to programmes. Detailed annual and financial reports will be published when available.",
        },
        {
          id: "volunteer",
          question: "How can I volunteer?",
          answer:
            "We welcome mentors, health workers, educators, communications volunteers and logistics helpers. Visit the Get Involved page and fill out the volunteer form, or contact us directly.",
        },
        {
          id: "partner",
          question: "How can I partner with Vantage?",
          answer:
            "Partnerships can take the form of funding, in-kind donations, technical expertise, CSR collaborations or joint programme implementation. Reach out through the Contact or Get Involved page.",
        },
        {
          id: "tax-deductible",
          donationRelated: true,
          question: "Are donations tax-deductible?",
          answer:
            "Tax-deductibility depends on your country and local regulations. Please contact us for our registration status and any available documentation. We are working towards formal tax-exempt status where applicable.",
        },
        {
          id: "safeguarding",
          question: "What safeguarding measures do you have in place?",
          answer:
            "We prioritise the safety, dignity and consent of the people we serve. We conduct follow-up, maintain regular contact with participants, and follow safeguarding principles for children and vulnerable adults. A formal safeguarding policy is being finalised.",
        },
        {
          id: "contact",
          question: "How do I contact Vantage Foundation Uganda?",
          answer:
            "Use the contact form at vantagefoundationuganda.com/contact, or call or WhatsApp +256 786 585 216. The form lets you pick the right team — partnerships, grants, programmes, volunteering, media or research — so your message reaches the people who can answer it.",
        },
      ],
    },
  },

  de: {
    donate: {
      title: "Spenden",
      description:
        "Unterstützen Sie Vantage Foundation Uganda mit einer Überweisung auf das offizielle Bankkonto und erfassen Sie Ihre Spende zur Bestätigung.",
      heroTitle: "Unsere Arbeit unterstützen",
      heroDescription:
        "Ihre Spende wird zu einer weiteren Chance für einen jungen Menschen, eine Familie oder eine Gemeinschaft.",
      whyTitle: "Warum spenden?",
      whyReasons: [
        "Ihre Spende fließt direkt in die Programme – wir arbeiten zu 100 % ehrenamtlich.",
        "Sie können ein bestimmtes Projekt unterstützen, etwa den Kasaale Deep Borehole, SaveGirl Uganda oder den Advantage Book Club.",
        "Sie erhalten eine Bestätigung und, wo möglich, eine Rückmeldung zur Verwendung Ihrer Spende.",
        "Jeder Beitrag – ob groß oder klein – schafft eine weitere Chance für einen jungen Menschen, eine Familie oder eine Gemeinschaft.",
      ],
      allocationTitle: "Wofür Ihre Spende eingesetzt wird",
      allocationDescription:
        "Wählen Sie ein bestimmtes Projekt oder überlassen Sie uns den Einsatz dort, wo er am dringendsten gebraucht wird.",
      campaigns: [
        { id: "general", label: "Dort, wo es am dringendsten gebraucht wird" },
        { id: "savegirl", label: "SaveGirl Uganda" },
        { id: "abc", label: "Advantage Book Club" },
        { id: "borehole", label: "Kasaale Deep Borehole" },
        { id: "relief", label: "Hilfe für Waisenhäuser und Inselgemeinden" },
      ],
      bank: {
        heading: "Banküberweisung",
        bank: "Bank",
        accountName: "Kontoinhaber",
        accountNumber: "Kontonummer",
        swift: "SWIFT/BIC",
        copy: "Bankdaten kopieren",
        copied: "Kopiert",
      },
      transparencyNote:
        "Wir arbeiten zu 100 % ehrenamtlich und stehen für finanzielle Transparenz. Ihre Angaben verwenden wir ausschließlich, um Ihre Spende zu bearbeiten und eine Bestätigung zu senden.",
      formTitle: "Jetzt spenden",
      formDescription:
        "Tragen Sie Ihre Angaben ein, führen Sie die Überweisung durch und geben Sie – falls vorhanden – die Transaktionsreferenz an.",
      pendingNoticeLead: "Alle Spenden gelten zunächst als ",
      pendingNoticeStrong: "ausstehend",
      pendingNoticeTail:
        ", bis ein Vantage-Administrator die Überweisung anhand unseres offiziellen Kontoauszugs bestätigt hat.",
      form: {
        amountLegend: "Betrag wählen (UGX)",
        customAmountLabel: "Oder einen eigenen Betrag eingeben",
        customAmountPlaceholder: "Betrag in UGX eingeben",
        frequencyLegend: "Häufigkeit",
        oneTime: "Einmalig",
        monthly: "Monatlich",
        frequencyNote:
          "Eine monatliche Zusage ist eine freiwillige Selbstverpflichtung und keine automatische Daueranweisung.",
        campaignLabel: "Ein bestimmtes Projekt unterstützen",
        nameLabel: "Name",
        emailLabel: "E-Mail",
        phoneLabel: "Telefon (optional)",
        transactionLabel: "Transaktionsreferenz (optional)",
        transactionPlaceholder: "Referenz der Banküberweisung",
        messageLabel: "Nachricht (optional)",
        submitLabel: "Spende bestätigen",
        submitPending: "Wird gesendet…",
        privacyNotice:
          "Wir verwenden Ihre Angaben ausschließlich zur Bearbeitung Ihrer Spende und zum Versand einer Bestätigung. Siehe unsere",
      },
      stepsEyebrow: "So funktioniert es",
      stepsTitle: "Drei einfache Schritte",
      stepsDescription:
        "Von der Überweisung bis zur Wirkung: So läuft Ihre Spende ab.",
      steps: [
        {
          step: "1",
          title: "Überweisen",
          description:
            "Überweisen Sie den Betrag mit den oben genannten Angaben auf unser offizielles Konto. Geben Sie nach Möglichkeit einen Verwendungszweck an.",
        },
        {
          step: "2",
          title: "Erfassen",
          description:
            "Füllen Sie das Spendenformular aus, damit wir Ihre Überweisung zuordnen und Ihnen eine Bestätigung senden können. Ihre Angaben bleiben vertraulich.",
        },
        {
          step: "3",
          title: "Bestätigen",
          description:
            "Ein Vantage-Administrator gleicht Ihre Überweisung mit unserem Kontoauszug ab. Sie erhalten eine Bestätigung und, wo möglich, eine Rückmeldung zur Verwendung Ihrer Spende.",
        },
      ],
      transparencyEyebrow: "Transparenz",
      transparencyTitle: "Wohin jeder Schilling fließt",
      transparencyDescription:
        "Da wir vollständig ehrenamtlich arbeiten, fließen Spenden direkt in die Programme – nicht in Gehälter oder Verwaltung.",
      transparencyStats: [
        { value: "100 %", label: "Ehrenamtlich – keine bezahlten Kräfte" },
        { value: "Direkt", label: "Mittel fließen in Programme, nicht an Zwischenstellen" },
        { value: "Geprüft", label: "Jede Spende wird mit dem Kontoauszug abgeglichen" },
      ],
      reportsCta: "Unsere Rechenschaftsgrundsätze ansehen",
      faqTitle: "Häufige Fragen zu Spenden",
      faqDescription: "Häufige Fragen zum Spenden an Vantage Foundation Uganda.",
      contactTitle: "Fragen zum Spenden?",
      contactDescription:
        "Gerne sprechen wir mit Ihnen über einzelne Projekte, steuerliche Absetzbarkeit oder Partnerschaften.",
      contactCta: "Kontakt aufnehmen",
    },
    getInvolved: {
      title: "Mitmachen",
      description:
        "Spenden, freiwillig mitarbeiten, Partner werden, fördern oder mit Vantage Foundation Uganda zusammenarbeiten.",
      heroTitle: "Mitmachen",
      heroDescription: "Es gibt viele Wege, eine weitere Chance zu schaffen.",
      pathways: [
        {
          id: "donate",
          title: "Spenden",
          description:
            "Finanzieren Sie ein Projekt, eine Kampagne oder unsere allgemeine Arbeit. Jeder Beitrag schafft eine weitere Chance.",
          ctaLabel: "Jetzt spenden",
          ctaHref: "/donate",
        },
        {
          id: "volunteer",
          title: "Freiwillig engagieren",
          description:
            "Bringen Sie Ihre Zeit als Mentorin oder Mentor, Gesundheitsfachkraft, Lehrkraft, Kommunikationshelfer oder Logistikunterstützung ein.",
          ctaLabel: "Freiwillig mitarbeiten",
          ctaHref: "/contact?subject=volunteer",
        },
        {
          id: "partner",
          title: "Partner werden",
          description:
            "Arbeiten Sie mit uns an Programmen, Finanzierung, Fachwissen oder gemeinsamen Initiativen vor Ort.",
          ctaLabel: "Partnerschaft beginnen",
          ctaHref: "/contact?subject=partner",
        },
        {
          id: "sponsor",
          title: "Fördern",
          description:
            "Fördern Sie ein bestimmtes Projekt, eine Veranstaltung oder einen Bedarf vor Ort – und erfahren Sie, was daraus entsteht.",
          ctaLabel: "Projekt fördern",
          ctaHref: "/contact?subject=sponsor",
        },
        {
          id: "collaborate",
          title: "Zusammenarbeiten",
          description:
            "Beteiligen Sie sich an einer Kampagne, einem Workshop oder einer Mobilisierung, die zu Ihren Fähigkeiten passt.",
          ctaLabel: "Kontakt aufnehmen",
          ctaHref: "/contact?subject=general",
        },
        {
          id: "csr",
          title: "Unternehmerische Verantwortung",
          description:
            "Verbinden Sie die CSR-Strategie Ihrer Organisation mit Wirkung in den Bereichen Jugend, Gesundheit, Bildung und WASH.",
          ctaLabel: "CSR besprechen",
          ctaHref: "/contact?subject=partner",
        },
      ],
      reachOutTitle: "Kontakt aufnehmen",
      reachOutDescription:
        "Sagen Sie uns, wie Sie sich einbringen möchten – wir melden uns bei Ihnen.",
    },
    donorsAndSponsors: {
      title: "Partner, Spender & Förderer",
      description:
        "Wir würdigen die Menschen, Unternehmen und Organisationen, die {name} unterstützen – mit ihrer Zustimmung.",
      heroTitle: "Partner, Spender & Förderer",
      heroDescription:
        "Nachvollziehbare Partnerschaften und eine Würdigung, die stets auf der Zustimmung der Unterstützenden beruht.",
      intro:
        "{name} dankt allen Spendenden, Förderern und Partnern, die unsere Arbeit in den Bereichen Gesundheit, Bildung und humanitäre Hilfe unterstützen. Auf dieser Seite nennen wir jene Unterstützenden, die einer öffentlichen Nennung nachweislich zugestimmt haben.",
      categories: [
        {
          name: "Strategische Partner",
          description: "Langfristige Partnerschaften, die unsere Ausrichtung mitgestalten.",
        },
        {
          name: "Programmförderer",
          description:
            "Dauerhafte Unterstützung für ein bestimmtes Gesundheits-, Bildungs- oder Hilfsprogramm.",
        },
        {
          name: "Projektspender",
          description:
            "Finanzierung eines einzelnen Projekts, etwa eines Brunnens oder einer medizinischen Aktion.",
        },
        {
          name: "Sachspender",
          description: "Waren, Dienstleistungen oder Fachwissen anstelle von Geldspenden.",
        },
        {
          name: "Partner vor Ort",
          description:
            "Lokale Verantwortliche, Organisationen und Freiwillige, die unsere Arbeit möglich machen.",
        },
        {
          name: "Anonyme Unterstützende",
          description: "Spendende, die uns ohne öffentliche Nennung unterstützen möchten.",
        },
      ],
      recognisedTitle: "Gewürdigte Unterstützende",
      recognisedDescription:
        "Veröffentlicht mit der dokumentierten Zustimmung der jeweiligen Unterstützenden, gruppiert nach Art der Beziehung.",
      relationshipTypeLabels: {
        "In-kind programme contributor": "Sachbeitrag zu Programmen",
        "Programme collaborator": "Programmpartner",
        "Programme and technology partner": "Programm- und Technologiepartner",
      },
      otherRelationshipType: "Sonstige",
      visitWebsite: "Offizielle Website besuchen",
      emptyState:
        "Partner und Spendende erscheinen hier, sobald sie einer Nennung zugestimmt haben.",
      policyTitle: "Grundsätze der Nennung",
      policyBody:
        "Namen, Logos und Beschreibungen von Spendenden oder Förderern veröffentlichen wir ausschließlich mit deren dokumentierter schriftlicher Zustimmung. Spendenbeträge oder persönliche Finanzdaten machen wir nie öffentlich. Unterstützende können ihre Nennung jederzeit zurückziehen oder von vornherein anonym spenden.",
      sponsorTitle: "Förderer werden",
      sponsorBody:
        "Wenn Sie oder Ihre Organisation ein Programm fördern, ein Projekt unterstützen oder eine Nennung vorschlagen möchten, nutzen Sie das Formular oder spenden Sie direkt.",
      donateCta: "Jetzt spenden",
      contactTitle: "Kontakt zum Thema Förderung",
      contactDescription:
        "Erzählen Sie uns von Ihrer Organisation und davon, wie Sie unsere Arbeit unterstützen möchten.",
      logoAltSuffix: "Logo",
    },
    faq: {
      title: "FAQ",
      description:
        "Häufig gestellte Fragen zu Vantage Foundation Uganda, unserer Arbeit, Spenden und Partnerschaften.",
      heroTitle: "Häufig gestellte Fragen",
      heroDescription:
        "Antworten auf häufige Fragen zu unserer Arbeit und zu Möglichkeiten, sich einzubringen.",
      items: [
        {
          id: "what-we-do",
          question: "Was macht Vantage Foundation Uganda?",
          answer:
            "Vantage Foundation Uganda ist eine von jungen Menschen geführte gemeinnützige Organisation, die die Lebensbedingungen in ugandischen Gemeinschaften verbessert – durch Projekte in den Bereichen Gesundheit, Bildung, humanitäre Hilfe sowie Wasser, Sanitärversorgung und Hygiene (WASH). Unser Schwerpunkt liegt auf benachteiligten ländlichen Distrikten und informellen städtischen Siedlungen.",
        },
        {
          id: "where-we-work",
          question: "Wo ist Vantage Foundation Uganda tätig?",
          answer:
            "Derzeit erreichen wir Gemeinschaften im Distrikt Bushenyi, in Kampala, auf Kalangala Island, in Jinja und in weiteren ländlichen Distrikten Ugandas. Wir suchen gezielt Regionen auf, die von größeren internationalen NGOs häufig übersehen werden.",
        },
        {
          id: "project-selection",
          question: "Wie werden Projekte ausgewählt?",
          answer:
            "Gemeinsam mit lokalen Verantwortlichen und Gemeindemitgliedern ermitteln wir Bedarfe, bestehende Initiativen und realistische Lösungen. Ausschlaggebend für die Auswahl sind das Wirkungspotenzial, die Bereitschaft der Gemeinschaft und die verfügbaren Mittel.",
        },
        {
          id: "donations-used",
          donationRelated: true,
          question: "Wie werden Spenden verwendet?",
          answer:
            "Spenden decken Programmkosten wie Medikamente, Bücher, den Bau von Brunnen, Logistik, Menstruationsprodukte und die direkte Unterstützung von Waisenhäusern. Da wir zu 100 % ehrenamtlich arbeiten, fließen die Mittel unmittelbar in die Programme. Ausführliche Jahres- und Finanzberichte veröffentlichen wir, sobald sie vorliegen.",
        },
        {
          id: "volunteer",
          question: "Wie kann ich mich freiwillig engagieren?",
          answer:
            "Wir freuen uns über Mentorinnen und Mentoren, Gesundheitsfachkräfte, Lehrkräfte, Freiwillige für Kommunikation und Unterstützung in der Logistik. Besuchen Sie die Seite „Mitmachen“ und füllen Sie das Formular aus oder schreiben Sie uns direkt.",
        },
        {
          id: "partner",
          question: "Wie kann ich Partner von Vantage werden?",
          answer:
            "Partnerschaften können in Form von Finanzierung, Sachspenden, Fachwissen, CSR-Kooperationen oder der gemeinsamen Umsetzung von Programmen entstehen. Nehmen Sie über die Seite „Kontakt“ oder „Mitmachen“ Verbindung mit uns auf.",
        },
        {
          id: "tax-deductible",
          donationRelated: true,
          question: "Sind Spenden steuerlich absetzbar?",
          answer:
            "Die steuerliche Absetzbarkeit richtet sich nach den Vorschriften Ihres Landes. Bitte kontaktieren Sie uns – wir informieren Sie über unseren Registrierungsstatus und stellen verfügbare Unterlagen bereit. An einer formellen Anerkennung der Gemeinnützigkeit arbeiten wir, soweit dies möglich ist.",
        },
        {
          id: "safeguarding",
          question: "Welche Schutzmaßnahmen haben Sie getroffen?",
          answer:
            "Sicherheit, Würde und Einwilligung der Menschen, mit denen wir arbeiten, haben für uns Vorrang. Wir begleiten Teilnehmende nach, bleiben mit ihnen in regelmäßigem Kontakt und richten uns nach anerkannten Schutzgrundsätzen für Kinder und schutzbedürftige Erwachsene. Ein formelles Schutzkonzept wird derzeit fertiggestellt.",
        },
        {
          id: "contact",
          question: "Wie kann ich Vantage Foundation Uganda erreichen?",
          answer:
            "Nutzen Sie das Kontaktformular unter vantagefoundationuganda.com/contact oder rufen Sie uns an bzw. schreiben Sie uns per WhatsApp unter +256 786 585 216. Im Formular wählen Sie das zuständige Team – Partnerschaften, Fördermittel, Programme, freiwilliges Engagement, Medien oder Forschung –, damit Ihre Nachricht direkt bei den richtigen Ansprechpersonen ankommt.",
        },
      ],
    },
  },

  fr: {
    donate: {
      title: "Faire un don",
      description:
        "Soutenez Vantage Foundation Uganda par un virement sur son compte bancaire officiel, puis enregistrez votre don pour qu’il soit confirmé.",
      heroTitle: "Soutenir notre action",
      heroDescription:
        "Votre don devient une possibilité de plus pour un jeune, une famille ou une communauté.",
      whyTitle: "Pourquoi faire un don ?",
      whyReasons: [
        "Votre don finance directement les programmes : nous fonctionnons à 100 % grâce à des bénévoles.",
        "Vous pouvez soutenir un projet précis, comme le Kasaale Deep Borehole, SaveGirl Uganda ou l’Advantage Book Club.",
        "Vous recevrez une confirmation et, dans la mesure du possible, des nouvelles de l’utilisation de votre don.",
        "Chaque contribution, petite ou grande, crée une possibilité de plus pour un jeune, une famille ou une communauté.",
      ],
      allocationTitle: "À quoi sert votre don",
      allocationDescription:
        "Choisissez un projet précis ou laissez-nous l’affecter là où le besoin est le plus urgent.",
      campaigns: [
        { id: "general", label: "Là où le besoin est le plus urgent" },
        { id: "savegirl", label: "SaveGirl Uganda" },
        { id: "abc", label: "Advantage Book Club" },
        { id: "borehole", label: "Kasaale Deep Borehole" },
        { id: "relief", label: "Aide aux orphelinats et aux communautés insulaires" },
      ],
      bank: {
        heading: "Virement bancaire",
        bank: "Banque",
        accountName: "Titulaire du compte",
        accountNumber: "Numéro de compte",
        swift: "SWIFT/BIC",
        copy: "Copier les coordonnées",
        copied: "Copié",
      },
      transparencyNote:
        "Nous fonctionnons à 100 % grâce à des bénévoles et nous engageons à une transparence financière totale. Vos données servent uniquement à traiter votre don et à vous envoyer un reçu.",
      formTitle: "Faire un don",
      formDescription:
        "Renseignez vos coordonnées, effectuez le virement et indiquez la référence de la transaction si vous en avez une.",
      pendingNoticeLead: "Tous les dons sont enregistrés comme ",
      pendingNoticeStrong: "en attente",
      pendingNoticeTail:
        " jusqu’à ce qu’un administrateur de Vantage confirme le virement sur notre relevé bancaire officiel.",
      form: {
        amountLegend: "Choisir un montant (UGX)",
        customAmountLabel: "Ou saisir un autre montant",
        customAmountPlaceholder: "Saisir le montant en UGX",
        frequencyLegend: "Fréquence",
        oneTime: "Ponctuel",
        monthly: "Mensuel",
        frequencyNote:
          "Un engagement mensuel est une promesse volontaire, et non un prélèvement automatique.",
        campaignLabel: "Soutenir un projet précis",
        nameLabel: "Nom",
        emailLabel: "E-mail",
        phoneLabel: "Téléphone (facultatif)",
        transactionLabel: "Référence de la transaction (facultatif)",
        transactionPlaceholder: "Référence du virement bancaire",
        messageLabel: "Message (facultatif)",
        submitLabel: "Confirmer mon don",
        submitPending: "Envoi…",
        privacyNotice:
          "Nous utilisons vos coordonnées uniquement pour traiter votre don et vous envoyer un reçu. Consultez notre",
      },
      stepsEyebrow: "Comment ça marche",
      stepsTitle: "Trois étapes simples",
      stepsDescription:
        "Du virement à l’impact : voici ce qui se passe après votre don.",
      steps: [
        {
          step: "1",
          title: "Virement",
          description:
            "Effectuez un virement sur notre compte officiel à l’aide des coordonnées ci-dessus. Ajoutez une référence si vous en avez une.",
        },
        {
          step: "2",
          title: "Enregistrement",
          description:
            "Remplissez le formulaire de don afin que nous puissions rapprocher votre virement et vous envoyer une confirmation. Vos données restent confidentielles.",
        },
        {
          step: "3",
          title: "Vérification",
          description:
            "Un administrateur de Vantage vérifie votre virement sur notre relevé bancaire. Vous recevez une confirmation et, dans la mesure du possible, des nouvelles de l’utilisation de votre don.",
        },
      ],
      transparencyEyebrow: "Transparence",
      transparencyTitle: "Où va chaque shilling",
      transparencyDescription:
        "Comme notre organisation fonctionne entièrement grâce à des bénévoles, les dons financent directement les programmes, et non des salaires ou des frais administratifs.",
      transparencyStats: [
        { value: "100 %", label: "Bénévole — aucun salarié" },
        { value: "Direct", label: "Les fonds vont aux programmes, pas à des intermédiaires" },
        { value: "Vérifié", label: "Chaque don est vérifié sur les relevés bancaires" },
      ],
      reportsCta: "Voir nos engagements de redevabilité",
      faqTitle: "Questions fréquentes sur les dons",
      faqDescription:
        "Questions fréquentes sur les dons à Vantage Foundation Uganda.",
      contactTitle: "Des questions sur les dons ?",
      contactDescription:
        "Nous sommes à votre disposition pour échanger sur un projet précis, la déductibilité fiscale ou un partenariat.",
      contactCta: "Nous contacter",
    },
    getInvolved: {
      title: "S’engager",
      description:
        "Faire un don, devenir bénévole, nouer un partenariat, parrainer ou collaborer avec Vantage Foundation Uganda.",
      heroTitle: "S’engager",
      heroDescription:
        "Il existe de nombreuses façons de créer une possibilité de plus.",
      pathways: [
        {
          id: "donate",
          title: "Faire un don",
          description:
            "Financez un projet, une campagne ou notre fonctionnement général. Chaque contribution crée une possibilité de plus.",
          ctaLabel: "Faire un don",
          ctaHref: "/donate",
        },
        {
          id: "volunteer",
          title: "Devenir bénévole",
          description:
            "Donnez de votre temps comme mentor, soignant, éducateur, bénévole en communication ou soutien logistique.",
          ctaLabel: "Devenir bénévole",
          ctaHref: "/contact?subject=volunteer",
        },
        {
          id: "partner",
          title: "Devenir partenaire",
          description:
            "Collaborez sur les programmes, le financement, l’expertise technique ou des initiatives communautaires conjointes.",
          ctaLabel: "Devenir partenaire",
          ctaHref: "/contact?subject=partner",
        },
        {
          id: "sponsor",
          title: "Parrainer",
          description:
            "Parrainez un projet, un événement ou un besoin communautaire précis et suivez les résultats obtenus.",
          ctaLabel: "Parrainer un projet",
          ctaHref: "/contact?subject=sponsor",
        },
        {
          id: "collaborate",
          title: "Collaborer",
          description:
            "Participez à une campagne, un atelier ou une mobilisation communautaire en lien avec vos compétences.",
          ctaLabel: "Nous contacter",
          ctaHref: "/contact?subject=general",
        },
        {
          id: "csr",
          title: "Responsabilité sociétale",
          description:
            "Alignez la démarche RSE de votre organisation sur l’autonomisation des jeunes, la santé, l’éducation et l’impact WASH.",
          ctaLabel: "Échanger sur la RSE",
          ctaHref: "/contact?subject=partner",
        },
      ],
      reachOutTitle: "Écrivez-nous",
      reachOutDescription:
        "Dites-nous comment vous souhaitez vous engager et nous reviendrons vers vous.",
    },
    donorsAndSponsors: {
      title: "Partenaires, donateurs et parrains",
      description:
        "Nous rendons hommage aux personnes, entreprises et organisations qui soutiennent {name}, avec leur accord.",
      heroTitle: "Partenaires, donateurs et parrains",
      heroDescription:
        "Des relations vérifiées et une reconnaissance fondée sur le consentement des organisations et des personnes qui soutiennent notre action.",
      intro:
        "{name} remercie chaque donateur, parrain et partenaire qui soutient son action en matière de santé, d’éducation et d’aide humanitaire. Cette page présente les contributeurs ayant donné leur accord écrit pour être cités publiquement.",
      categories: [
        {
          name: "Partenaires stratégiques",
          description:
            "Partenariats institutionnels de long terme qui orientent notre action.",
        },
        {
          name: "Parrains de programme",
          description:
            "Soutien durable à un programme précis de santé, d’éducation ou d’aide humanitaire.",
        },
        {
          name: "Donateurs de projet",
          description:
            "Financement d’un projet unique, comme un forage ou une clinique mobile.",
        },
        {
          name: "Soutiens en nature",
          description:
            "Biens, services ou expertise offerts en lieu et place d’un don financier.",
        },
        {
          name: "Partenaires communautaires",
          description:
            "Responsables locaux, organisations et bénévoles qui rendent notre action possible.",
        },
        {
          name: "Contributeurs anonymes",
          description:
            "Donateurs qui préfèrent nous soutenir sans reconnaissance publique.",
        },
      ],
      recognisedTitle: "Contributeurs reconnus",
      recognisedDescription:
        "Publiés avec l’accord documenté de chaque contributeur et regroupés par type de relation.",
      relationshipTypeLabels: {
        "In-kind programme contributor": "Contributeur en nature",
        "Programme collaborator": "Partenaire de programme",
        "Programme and technology partner": "Partenaire programme et technologie",
      },
      otherRelationshipType: "Autre",
      visitWebsite: "Visiter le site officiel",
      emptyState:
        "Les partenaires et donateurs apparaîtront ici dès qu’ils auront donné leur accord.",
      policyTitle: "Politique de reconnaissance",
      policyBody:
        "Nous ne publions le nom, le logo ou la description d’un donateur ou d’un parrain qu’avec son accord écrit et documenté. Nous ne publions jamais les montants des dons ni de données financières personnelles. Les donateurs peuvent demander à tout moment leur retrait de cette page, ou choisir de donner de façon anonyme.",
      sponsorTitle: "Devenir parrain",
      sponsorBody:
        "Si vous ou votre organisation souhaitez parrainer un programme, soutenir un projet ou proposer un contributeur à la reconnaissance, utilisez le formulaire ou faites un don ci-dessous.",
      donateCta: "Faire un don",
      contactTitle: "Nous contacter au sujet du parrainage",
      contactDescription:
        "Parlez-nous de votre organisation et de la façon dont vous souhaitez soutenir notre action.",
      logoAltSuffix: "logo",
    },
    faq: {
      title: "FAQ",
      description:
        "Questions fréquentes sur Vantage Foundation Uganda, notre action, les dons et les partenariats.",
      heroTitle: "Questions fréquentes",
      heroDescription:
        "Réponses aux questions les plus courantes sur notre action et sur les façons de s’engager.",
      items: [
        {
          id: "what-we-do",
          question: "Que fait Vantage Foundation Uganda ?",
          answer:
            "Vantage Foundation Uganda est une organisation à but non lucratif dirigée par des jeunes qui améliore les conditions de vie des communautés ougandaises à travers des projets de santé, d’éducation, d’aide humanitaire et d’eau, assainissement et hygiène (WASH). Nous intervenons en priorité dans les districts ruraux mal desservis et les quartiers urbains informels.",
        },
        {
          id: "where-we-work",
          question: "Où Vantage Foundation Uganda intervient-elle ?",
          answer:
            "Nous intervenons actuellement auprès de communautés du district de Bushenyi, à Kampala, sur l’île de Kalangala, à Jinja et dans d’autres districts ruraux d’Ouganda. Nous ciblons les zones souvent délaissées par les grandes ONG internationales.",
        },
        {
          id: "project-selection",
          question: "Comment les projets sont-ils sélectionnés ?",
          answer:
            "Avec les responsables locaux et les membres des communautés, nous identifions les besoins, les initiatives existantes et les solutions réalistes. Les projets sont retenus selon leur potentiel d’impact, la mobilisation de la communauté et les ressources disponibles.",
        },
        {
          id: "donations-used",
          donationRelated: true,
          question: "Comment les dons sont-ils utilisés ?",
          answer:
            "Les dons couvrent les coûts des programmes : médicaments, livres, construction de puits, logistique, produits menstruels et soutien direct aux orphelinats. Comme nous fonctionnons à 100 % grâce à des bénévoles, les fonds financent directement les programmes. Des rapports annuels et financiers détaillés seront publiés dès qu’ils seront disponibles.",
        },
        {
          id: "volunteer",
          question: "Comment devenir bénévole ?",
          answer:
            "Nous accueillons des mentors, des soignants, des éducateurs, des bénévoles en communication et des personnes prêtes à aider sur la logistique. Rendez-vous sur la page « S’engager » et remplissez le formulaire, ou contactez-nous directement.",
        },
        {
          id: "partner",
          question: "Comment devenir partenaire de Vantage ?",
          answer:
            "Un partenariat peut prendre la forme d’un financement, de dons en nature, d’une expertise technique, d’une collaboration RSE ou de la mise en œuvre conjointe d’un programme. Écrivez-nous via la page « Contact » ou « S’engager ».",
        },
        {
          id: "tax-deductible",
          donationRelated: true,
          question: "Les dons sont-ils déductibles des impôts ?",
          answer:
            "La déductibilité fiscale dépend de votre pays et de la réglementation locale. Contactez-nous : nous vous indiquerons notre statut d’enregistrement et vous transmettrons les documents disponibles. Nous travaillons à l’obtention d’un statut d’exonération fiscale là où cela est possible.",
        },
        {
          id: "safeguarding",
          question: "Quelles mesures de protection avez-vous mises en place ?",
          answer:
            "La sécurité, la dignité et le consentement des personnes que nous accompagnons sont prioritaires. Nous assurons un suivi, restons en contact régulier avec les participants et appliquons les principes de protection des enfants et des adultes vulnérables. Une politique de protection formelle est en cours de finalisation.",
        },
        {
          id: "contact",
          question: "Comment contacter Vantage Foundation Uganda ?",
          answer:
            "Utilisez le formulaire de contact sur vantagefoundationuganda.com/contact, ou appelez-nous et écrivez-nous sur WhatsApp au +256 786 585 216. Le formulaire vous permet de choisir l’équipe concernée — partenariats, subventions, programmes, bénévolat, médias ou recherche — afin que votre message parvienne aux bonnes personnes.",
        },
      ],
    },
  },

  es: {
    donate: {
      title: 'Donar',
      description: 'Apoye a Vantage Foundation Uganda transfiriendo a su cuenta bancaria oficial y registrando su donación para su verificación.',
      heroTitle: 'Apoyar nuestra labor',
      heroDescription: 'Su donación se convierte en una oportunidad más para una persona joven, una familia o una comunidad.',
      whyTitle: '¿Por qué donar?',
      whyReasons: [
        'Su donación llega directamente a los programas: somos 100 % voluntarios.',
        'Puede apoyar un proyecto específico, como Kasaale Deep Borehole, SaveGirl Uganda o Advantage Book Club.',
        'Recibirá una confirmación y, cuando sea posible, una actualización sobre cómo se usó su donativo.',
        'Cada contribución, grande o pequeña, es una oportunidad más para una persona joven, una familia o una comunidad.',
      ],
      allocationTitle: 'A dónde va su donación',
      allocationDescription: 'Elija un proyecto específico o déjenos dirigirla hacia donde más se necesite.',
      campaigns: [
        { id: 'general', label: 'Donde más se necesita' },
        { id: 'savegirl', label: 'SaveGirl Uganda' },
        { id: 'abc', label: 'Advantage Book Club' },
        { id: 'borehole', label: 'Kasaale Deep Borehole' },
        { id: 'relief', label: 'Apoyo a orfanatos y comunidades insulares' },
      ],
      bank: {
        heading: 'Transferencia bancaria',
        bank: 'Banco',
        accountName: 'Titular de la cuenta',
        accountNumber: 'Número de cuenta',
        swift: 'SWIFT/BIC',
        copy: 'Copiar datos bancarios',
        copied: 'Copiado',
      },
      transparencyNote: 'Somos una organización 100 % voluntaria y estamos comprometidos con la transparencia financiera. Sus datos solo se usarán para procesar su donación y enviarle un recibo.',
      formTitle: 'Hacer una donación',
      formDescription: 'Complete sus datos, realice la transferencia e incluya la referencia de la transacción si la tiene.',
      pendingNoticeLead: 'Todas las donaciones se registran como ',
      pendingNoticeStrong: 'pendientes',
      pendingNoticeTail: ' hasta que un administrador de Vantage verifique la transferencia con nuestro extracto bancario oficial.',
      form: {
        amountLegend: 'Elija un monto (UGX)',
        customAmountLabel: 'O ingrese un monto personalizado',
        customAmountPlaceholder: 'Ingrese el monto en UGX',
        frequencyLegend: 'Frecuencia',
        oneTime: 'Única vez',
        monthly: 'Donación mensual',
        frequencyNote: 'Una donación mensual es un compromiso manual, no un pago recurrente automático.',
        campaignLabel: 'Apoye un proyecto específico',
        nameLabel: 'Nombre',
        emailLabel: 'Correo electrónico',
        phoneLabel: 'Teléfono (opcional)',
        transactionLabel: 'Referencia de la transacción (opcional)',
        transactionPlaceholder: 'Referencia de la transferencia bancaria',
        messageLabel: 'Mensaje (opcional)',
        submitLabel: 'Confirmar intención de donar',
        submitPending: 'Enviando...',
        privacyNotice: 'Solo usaremos sus datos para procesar su donación y enviarle un recibo. Consulte nuestra ',
      },
      stepsEyebrow: 'Cómo funciona',
      stepsTitle: 'Tres simples pasos',
      stepsDescription: 'Desde la transferencia hasta el impacto, así es lo que sucede cuando dona.',
      steps: [
        { step: '1', title: 'Transferir', description: 'Realice una transferencia bancaria a nuestra cuenta oficial usando los datos anteriores. Incluya una referencia si la tiene.' },
        { step: '2', title: 'Registrar', description: 'Complete el formulario de donación para que podamos emparejar su transferencia y enviarle una confirmación. Sus datos se mantienen privados.' },
        { step: '3', title: 'Verificar', description: 'Un administrador de Vantage verifica su transferencia con nuestro extracto bancario. Recibirá una confirmación y, cuando sea posible, una actualización sobre cómo se usó su donativo.' },
      ],
      transparencyEyebrow: 'Transparencia',
      transparencyTitle: 'A dónde va cada shilling',
      transparencyDescription: 'Como una organización 100 % voluntaria, las donaciones van directamente a los programas, no a salarios ni gastos administrativos.',
      transparencyStats: [
        { value: '100 %', label: 'Voluntarios: sin personal remunerado' },
        { value: 'Directo', label: 'Los fondos llegan a los programas, no a intermediarios' },
        { value: 'Verificado', label: 'Cada donación se contrasta con el extracto bancario' },
      ],
      reportsCta: 'Ver nuestros compromisos de rendición de cuentas',
      faqTitle: 'Preguntas frecuentes sobre donaciones',
      faqDescription: 'Preguntas comunes sobre cómo donar a Vantage Foundation Uganda.',
      contactTitle: '¿Tiene preguntas sobre donar?',
      contactDescription: 'Con gusto hablamos sobre proyectos específicos, deducibilidad fiscal u oportunidades de alianza.',
      contactCta: 'Contáctenos',
    },
    getInvolved: {
      title: 'Participar',
      description: 'Done, sea voluntario, asóciese, patrocine o colabore con Vantage Foundation Uganda.',
      heroTitle: 'Participar',
      heroDescription: 'Hay muchas formas de crear una oportunidad más.',
      pathways: [
        { id: 'donate', title: 'Donar', description: 'Financie un proyecto, una campaña o nuestras operaciones generales. Cada contribución es una oportunidad más.', ctaLabel: 'Donar ahora', ctaHref: '/donate' },
        { id: 'volunteer', title: 'Hacerse voluntario', description: 'Comparta su tiempo como mentor, trabajador de salud, educador, voluntario de comunicaciones o ayudante de logística.', ctaLabel: 'Hacerse voluntario', ctaHref: '/contact?subject=volunteer' },
        { id: 'partner', title: 'Asociarse', description: 'Colabore en programas, financiamiento, experiencia técnica o iniciativas comunitarias conjuntas.', ctaLabel: 'Asóciese con nosotros', ctaHref: '/contact?subject=partner' },
        { id: 'sponsor', title: 'Patrocinar', description: 'Patrocine un proyecto, evento o necesidad comunitaria específicos y reciba actualizaciones sobre los resultados.', ctaLabel: 'Patrocinar un proyecto', ctaHref: '/contact?subject=sponsor' },
        { id: 'collaborate', title: 'Colaborar', description: 'Únase a una campaña, taller o movilización comunitaria acorde con sus habilidades.', ctaLabel: 'Ponerse en contacto', ctaHref: '/contact?subject=general' },
        { id: 'csr', title: 'Responsabilidad social corporativa', description: 'Alinee la RSC de su organización con el empoderamiento juvenil, la salud, la educación y el impacto WASH.', ctaLabel: 'Hablar de RSC', ctaHref: '/contact?subject=partner' },
      ],
      reachOutTitle: 'Escríbanos',
      reachOutDescription: 'Cuéntenos cómo le gustaría participar y nos pondremos en contacto.',
    },
    donorsAndSponsors: {
      title: 'Aliados, donantes y patrocinadores',
      description: 'Reconocemos a las personas, empresas y organizaciones que apoyan a {name}, con su consentimiento.',
      heroTitle: 'Aliados, donantes y patrocinadores',
      heroDescription: 'Relaciones verificadas y reconocimiento basado en el consentimiento de las organizaciones y personas que apoyan nuestra labor.',
      intro: '{name} agradece a cada donante, patrocinador y aliado que apoya nuestra labor en salud, educación y ayuda humanitaria. Esta página reconoce a quienes han dado su consentimiento documentado para ser nombrados públicamente.',
      categories: [
        { name: 'Aliados estratégicos', description: 'Alianzas organizacionales a largo plazo que dan forma a nuestra dirección.' },
        { name: 'Patrocinadores de programas', description: 'Apoyo sostenido para un programa específico de salud, educación o ayuda humanitaria.' },
        { name: 'Donantes de proyectos', description: 'Financiamiento para un proyecto único, como un pozo o campamento médico.' },
        { name: 'Apoyos en especie', description: 'Bienes, servicios o experiencia donados en lugar de efectivo.' },
        { name: 'Aliados comunitarios', description: 'Líderes locales, organizaciones y voluntarios que hacen posible nuestra labor.' },
        { name: 'Contribuyentes anónimos', description: 'Donantes que eligen apoyarnos sin reconocimiento público.' },
      ],
      recognisedTitle: 'Colaboradores reconocidos',
      recognisedDescription: 'Presentados con el consentimiento documentado de cada colaborador, agrupados por tipo de relación.',
      relationshipTypeLabels: {
        'In-kind programme contributor': 'Contribuyente en especie del programa',
        'Programme collaborator': 'Colaborador del programa',
        'Programme and technology partner': 'Aliado de programa y tecnología',
      },
      otherRelationshipType: 'Otro',
      visitWebsite: 'Visitar sitio web oficial',
      emptyState: 'Los reconocimientos de aliados y donantes aparecerán aquí con su consentimiento.',
      policyTitle: 'Política de reconocimiento',
      policyBody: 'Solo publicamos el nombre, logotipo o descripción de un donante o patrocinador con su consentimiento documentado y por escrito. Nunca publicamos montos de donación ni datos financieros personales. Los donantes pueden solicitar ser eliminados de esta página en cualquier momento y pueden elegir donar anónimamente.',
      sponsorTitle: 'Conviértase en patrocinador',
      sponsorBody: 'Si desea patrocinar un programa, apoyar un proyecto o proponer a un colaborador para reconocimiento, use el formulario o done directamente a continuación.',
      donateCta: 'Donar',
      contactTitle: 'Contáctenos sobre patrocinio',
      contactDescription: 'Cuéntenos sobre su organización y cómo le gustaría apoyar nuestra labor.',
      logoAltSuffix: 'logo',
    },
    faq: {
      title: 'Preguntas frecuentes',
      description: 'Preguntas frecuentes sobre Vantage Foundation Uganda, nuestra labor, las donaciones y las alianzas.',
      heroTitle: 'Preguntas frecuentes',
      heroDescription: 'Respuestas a preguntas comunes sobre nuestra labor y cómo participar.',
      items: [
        { id: 'what-we-do', question: '¿Qué hace Vantage Foundation Uganda?', answer: 'Vantage Foundation Uganda es una organización sin fines de lucro dirigida por jóvenes que mejora los medios de vida de las comunidades ugandesas a través de proyectos de salud, educación, ayuda humanitaria y agua, saneamiento e higiene (WASH). Nos enfocamos en distritos rurales desatendidos y asentamientos urbanos informales.' },
        { id: 'where-we-work', question: '¿Dónde trabaja Vantage Foundation Uganda?', answer: 'Nuestro trabajo actual llega a comunidades en el distrito de Bushenyi, Kampala, Kalangala Island, Jinja y otros distritos rurales de Uganda. Identificamos áreas frecuentemente pasadas por alto por las grandes ONG internacionales.' },
        { id: 'project-selection', question: '¿Cómo se seleccionan los proyectos?', answer: 'Trabajamos con líderes locales y miembros de la comunidad para identificar necesidades, esfuerzos existentes y soluciones realistas. Los proyectos se eligen según su potencial de impacto, la disposición de la comunidad y los recursos disponibles.' },
        { id: 'donations-used', donationRelated: true, question: '¿Cómo se usan las donaciones?', answer: 'Las donaciones apoyan costos de programas como medicamentos, libros, construcción de pozos, logística, productos menstruales y apoyo directo a orfanatos. Operamos 100 % con voluntarios, por lo que los fondos van directamente a los programas. Se publicarán informes anuales y financieros detallados cuando estén disponibles.' },
        { id: 'volunteer', question: '¿Cómo puedo ser voluntario?', answer: 'Damos la bienvenida a mentores, trabajadores de salud, educadores, voluntarios de comunicaciones y ayudantes de logística. Visite la página Participar y complete el formulario de voluntario, o contáctenos directamente.' },
        { id: 'partner', question: '¿Cómo puedo ser socio de Vantage?', answer: 'Las alianzas pueden tomar la forma de financiamiento, donaciones en especie, experiencia técnica, colaboraciones de RSC o implementación conjunta de programas. Escríbanos a través de la página de Contacto o Participar.' },
        { id: 'tax-deductible', donationRelated: true, question: '¿Las donaciones son deducibles de impuestos?', answer: 'La deducibilidad fiscal depende de su país y de la normativa local. Contáctenos para conocer nuestro estado de registro y la documentación disponible. Estamos trabajando para obtener el estatus de exención fiscal donde corresponda.' },
        { id: 'safeguarding', question: '¿Qué medidas de protección tienen implementadas?', answer: 'Priorizamos la seguridad, dignidad y consentimiento de las personas a las que servimos. Realizamos seguimiento, mantenemos contacto regular con los participantes y seguimos principios de protección para niños y adultos vulnerables. Se está finalizando una política formal de protección.' },
        { id: 'contact', question: '¿Cómo contacto a Vantage Foundation Uganda?', answer: 'Use el formulario de contacto en vantagefoundationuganda.com/contact, o llámenos o escríbanos por WhatsApp al +256 786 585 216. El formulario le permite elegir al equipo adecuado — alianzas, subvenciones, programas, voluntariado, medios o investigación — para que su mensaje llegue a quienes puedan responderlo.' },
      ],
    },
  },

  ar: {
    donate: {
      title: 'تبرع',
      description: 'ادعم Vantage Foundation Uganda عبر التحويل إلى حسابها البنكي الرسمي وتسجيل تبرعك للتحقق منه.',
      heroTitle: 'ادعم عملنا',
      heroDescription: 'يصبح تبرعك ميزة إضافية لشاب، أو أسرة، أو مجتمع.',
      whyTitle: 'لماذا التبرع؟',
      whyReasons: [
        'تذهب تبرعاتك مباشرة إلى البرامج؛ فنحن منظمة تطوعية بنسبة 100%.',
        'يمكنك دعم مشروع محدد، مثل Kasaale Deep Borehole، أو SaveGirl Uganda، أو Advantage Book Club.',
        'ستتلقى تأكيدًا، وإن أمكن، تحديثًا حول كيفية استخدام هديتك.',
        'كل مساهمة، كبيرة كانت أم صغيرة، هي ميزة إضافية لشاب، أو أسرة، أو مجتمع.',
      ],
      allocationTitle: 'إلى أين يذهب تبرعك',
      allocationDescription: 'اختر مشروعًا محددًا أو دعنا نوجّهه إلى حيث الحاجة الأكبر.',
      campaigns: [
        { id: 'general', label: 'حيث الحاجة الأكبر' },
        { id: 'savegirl', label: 'SaveGirl Uganda' },
        { id: 'abc', label: 'Advantage Book Club' },
        { id: 'borehole', label: 'Kasaale Deep Borehole' },
        { id: 'relief', label: 'دعم دور الأيتام والإغاثة الجزرية' },
      ],
      bank: {
        heading: 'التحويل البنكي',
        bank: 'البنك',
        accountName: 'اسم الحساب',
        accountNumber: 'رقم الحساب',
        swift: 'SWIFT/BIC',
        copy: 'نسخ التفاصيل البنكية',
        copied: 'تم النسخ',
      },
      transparencyNote: 'نحن منظمة تطوعية بنسبة 100% وملتزمون بالشفافية المالية. ستُستخدم بياناتك فقط لمعالجة تبرعك وإرسال الإيصال.',
      formTitle: 'قدّم تبرعًا',
      formDescription: 'أدخل بياناتك، وأجرِ التحويل، وأضف رقم مرجع المعاملة إن توفّر.',
      pendingNoticeLead: 'تُسجَّل جميع التبرعات على أنها ',
      pendingNoticeStrong: 'معلّقة',
      pendingNoticeTail: ' حتى يتحقق أحد مسؤولي Vantage من التحويل مقابل كشف حسابنا البنكي الرسمي.',
      form: {
        amountLegend: 'اختر مبلغًا (UGX)',
        customAmountLabel: 'أو أدخل مبلغًا مخصصًا',
        customAmountPlaceholder: 'أدخل المبلغ بـ UGX',
        frequencyLegend: 'التواتر',
        oneTime: 'مرة واحدة',
        monthly: 'تعهّد شهري',
        frequencyNote: 'التعهّد الشهري هو التزام يدوي، وليس دفعًا متكررًا تلقائيًا.',
        campaignLabel: 'ادعم مشروعًا محددًا',
        nameLabel: 'الاسم',
        emailLabel: 'البريد الإلكتروني',
        phoneLabel: 'الهاتف (اختياري)',
        transactionLabel: 'رقم مرجع المعاملة (اختياري)',
        transactionPlaceholder: 'رقم مرجع التحويل البنكي',
        messageLabel: 'رسالة (اختياري)',
        submitLabel: 'تأكيد نية التبرع',
        submitPending: 'جارٍ الإرسال...',
        privacyNotice: 'سنستخدم بياناتك فقط لمعالجة تبرعك وإرسال الإيصال. اطّلع على ',
      },
      stepsEyebrow: 'كيف يعمل',
      stepsTitle: 'ثلاث خطوات بسيطة',
      stepsDescription: 'من التحويل إلى الأثر، إليك ما يحدث عندما تتبرع.',
      steps: [
        { step: '1', title: 'تحويل', description: 'أجرِ تحويلًا بنكيًا إلى حسابنا الرسمي باستخدام التفاصيل أعلاه. أضف رقم مرجع إن توفّر.' },
        { step: '2', title: 'تسجيل', description: 'املأ استمارة التبرع لنتمكن من مطابقة تحويلك وإرسال تأكيد. بياناتك تبقى خاصة.' },
        { step: '3', title: 'تحقق', description: 'يتحقق أحد مسؤولي Vantage من تحويلك مقابل كشف حسابنا البنكي. ستتلقى تأكيدًا، وإن أمكن، تحديثًا حول كيفية استخدام هديتك.' },
      ],
      transparencyEyebrow: 'الشفافية',
      transparencyTitle: 'إلى أين يذهب كل شلن',
      transparencyDescription: 'بما أننا منظمة تطوعية بنسبة 100%، تذهب التبرعات مباشرة إلى البرامج، لا إلى رواتب أو مصاريف إدارية.',
      transparencyStats: [
        { value: '100%', label: 'تطوعي بالكامل — لا موظفين مدفوعين' },
        { value: 'مباشر', label: 'تذهب الأموال إلى البرامج لا إلى وسطاء' },
        { value: 'موثّق', label: 'يُتحقق من كل تبرع مقابل كشوف الحسابات البنكية' },
      ],
      reportsCta: 'اطّلع على التزاماتنا بالمساءلة',
      faqTitle: 'الأسئلة الشائعة حول التبرع',
      faqDescription: 'أسئلة شائعة حول التبرع لـ Vantage Foundation Uganda.',
      contactTitle: 'هل لديك أسئلة حول التبرع؟',
      contactDescription: 'يسعدنا مناقشة مشاريع محددة، أو الإعفاء الضريبي، أو فرص الشراكة.',
      contactCta: 'تواصل معنا',
    },
    getInvolved: {
      title: 'شارك',
      description: 'تبرع، أو تطوع، أو كن شريكًا، أو راعيًا، أو متعاونًا مع Vantage Foundation Uganda.',
      heroTitle: 'شارك',
      heroDescription: 'هناك العديد من الطرق لخلق ميزة إضافية.',
      pathways: [
        { id: 'donate', title: 'تبرع', description: 'موّل مشروعًا أو حملة أو عملياتنا العامة. كل مساهمة هي ميزة إضافية.', ctaLabel: 'تبرع الآن', ctaHref: '/donate' },
        { id: 'volunteer', title: 'تطوع', description: 'شارك وقتك كمرشد أو عامل صحي أو معلم أو متطوع في الاتصالات أو مساعد في الخدمات اللوجستية.', ctaLabel: 'كن متطوعًا', ctaHref: '/contact?subject=volunteer' },
        { id: 'partner', title: 'كن شريكًا', description: 'تعاون في البرامج أو التمويل أو الخبرة الفنية أو المبادرات المجتمعية المشتركة.', ctaLabel: 'كن شريكًا', ctaHref: '/contact?subject=partner' },
        { id: 'sponsor', title: 'راعٍ', description: 'راعِ مشروعًا أو حدثًا أو حاجة مجتمعية محددة وتابع التقارير حول النتائج.', ctaLabel: 'راعِ مشروعًا', ctaHref: '/contact?subject=sponsor' },
        { id: 'collaborate', title: 'تعاون', description: 'انضم إلى حملة أو ورشة عمل أو حشد مجتمعي يتناسب مع مهاراتك.', ctaLabel: 'تواصل معنا', ctaHref: '/contact?subject=general' },
        { id: 'csr', title: 'المسؤولية الاجتماعية للشركات', description: 'اربط مسؤولية شركتك الاجتماعية بتمكين الشباب والصحة والتعليم والتأثير في مجال المياه والصرف الصحي والنظافة (WASH).', ctaLabel: 'ناقش المسؤولية الاجتماعية', ctaHref: '/contact?subject=partner' },
      ],
      reachOutTitle: 'تواصل معنا',
      reachOutDescription: 'أخبرنا كيف ترغب بالمشاركة وسنتواصل معك.',
    },
    donorsAndSponsors: {
      title: 'الشركاء والمانحون والرعاة',
      description: 'نُقدّر دعم الأفراد والشركات والمنظمات لـ {name}، بموافقتهم.',
      heroTitle: 'الشركاء والمانحون والرعاة',
      heroDescription: 'علاقات مُتحقَّق منها وتقدير يعتمد على موافقة المنظمات والأشخاص الذين يدعمون عملنا.',
      intro: 'تعرب {name} عن امتنانها لكل مانح وراعٍ وشريك يدعم عملنا في مجال الصحة والتعليم والإغاثة الإنسانية. تعرّف هذه الصفحة على المساهمين الذين قدّموا موافقتهم المكتوبة المُوثَّقة للإشارة إليهم علنًا.',
      categories: [
        { name: 'شركاء استراتيجيون', description: 'شراكات مؤسسية طويلة الأجل تشكّل توجّهنا.' },
        { name: 'رعاة البرامج', description: 'دعم مستمر لبرنامج محدد في الصحة أو التعليم أو الإغاثة الإنسانية.' },
        { name: 'مانحو المشاريع', description: 'تمويل لمشروع واحد، مثل بئر أو مخيم طبي.' },
        { name: 'داعمو العينية', description: 'سلع أو خدمات أو خبرة مُتبرّع بها بدلًا من النقد.' },
        { name: 'شركاء المجتمع', description: 'قادة محليون ومنظمات ومتطوعون يُمكنّنون عملنا.' },
        { name: 'مساهمون مجهولون', description: 'مانحون يختارون دعمنا دون الظهور علنًا.' },
      ],
      recognisedTitle: 'المساهمون المعترف بهم',
      recognisedDescription: 'يُعرضون بموافقة مُوثَّقة من كل مساهم، مرتّبون حسب نوع العلاقة.',
      relationshipTypeLabels: {
        'In-kind programme contributor': 'مساهم بالعينية في البرنامج',
        'Programme collaborator': 'متعاون في البرنامج',
        'Programme and technology partner': 'شريك البرنامج والتقنية',
      },
      otherRelationshipType: 'آخر',
      visitWebsite: 'زيارة الموقع الرسمي',
      emptyState: 'ستظهر اعترافات الشركاء والمانحين هنا بموافقتهم.',
      policyTitle: 'سياسة الاعتراف',
      policyBody: 'لا ننشر اسمًا أو شعارًا أو وصفًا لمانح أو راعٍ إلا بموافقته المكتوبة والمُوثَّقة. لا ننشر أبدًا مبالغ التبرعات أو البيانات المالية الشخصية. يمكن للمانحين طلب إزالة أسمائهم من هذه الصفحة في أي وقت، ويمكنهم اختيار التبرع مجهولًا.',
      sponsorTitle: 'كن راعيًا',
      sponsorBody: 'إذا كنت أو منظمتك ترغب في رعاية برنامج، أو دعم مشروع، أو ترشيح مساهم للاعتراف به، استخدم الاستمارة أو تبرع مباشرةً أدناه.',
      donateCta: 'تبرع',
      contactTitle: 'تواصل معنا بخصوص الرعاية',
      contactDescription: 'أخبرنا عن منظمتك وكيف ترغب في دعم عملنا.',
      logoAltSuffix: 'الشعار',
    },
    faq: {
      title: 'الأسئلة الشائعة',
      description: 'أسئلة شائعة حول Vantage Foundation Uganda، وعملنا، والتبرعات، والشراكات.',
      heroTitle: 'الأسئلة الشائعة',
      heroDescription: 'إجابات على أسئلة شائعة حول عملنا وكيفية المشاركة.',
      items: [
        { id: 'what-we-do', question: 'ماذا تفعل Vantage Foundation Uganda؟', answer: 'Vantage Foundation Uganda منظمة غير ربحية يقودها الشباب، تعمل على تحسين سبل العيش في المجتمعات الأوغندية من خلال مشاريع الصحة والتعليم والإغاثة الإنسانية والمياه والصرف الصحي والنظافة (WASH). نركز على المناطق الريفية المحرومة والمستوطنات الحضرية العشوائية.' },
        { id: 'where-we-work', question: 'أين تعمل Vantage Foundation Uganda؟', answer: 'يصل عملنا الحالي إلى مجتمعات في مقاطعة Bushenyi، وKampala، وKalangala Island، وJinja، ومقاطعات ريفية أخرى في أوغندا. نستهدف المناطق التي غالبًا ما تغفلها المنظمات غير الحكومية الدولية الكبرى.' },
        { id: 'project-selection', question: 'كيف تُختار المشاريع؟', answer: 'نعمل مع القادة المحليين وأعضاء المجتمع لتحديد الاحتياجات، والجهود القائمة، والحلول الواقعية. تُختار المشاريع بناءً على إمكانية التأثير، وجاهزية المجتمع، والموارد المتاحة.' },
        { id: 'donations-used', donationRelated: true, question: 'كيف تُستخدم التبرعات؟', answer: 'تدعم التبرعات تكاليف البرامج مثل الأدوية والكتب وبناء الآبار والخدمات اللوجستية والمنتجات الصحية الحيضية والدعم المباشر لدور الأيتام. نعمل بنسبة 100% تطوعيًا، لذا تذهب الأموال مباشرة إلى البرامج. ستُنشر تقارير سنوية ومالية مفصلة عند توفرها.' },
        { id: 'volunteer', question: 'كيف يمكنني التطوع؟', answer: 'نرحب بالمرشدين، والعاملين الصحيين، والمعلمين، ومتطوعي الاتصالات، ومساعدي الخدمات اللوجستية. قم بزيارة صفحة شارك واملأ استمارة المتطوعين، أو تواصل معنا مباشرة.' },
        { id: 'partner', question: 'كيف يمكنني أن أكون شريكًا لـ Vantage؟', answer: 'يمكن للشراكات أن تأخذ شكل التمويل، أو المساهمات العينية، أو الخبرة الفنية، أو تعاون المسؤولية الاجتماعية للشركات، أو تنفيذ البرامج المشترك. تواصل معنا عبر صفحة التواصل أو شارك.' },
        { id: 'tax-deductible', donationRelated: true, question: 'هل التبرعات معفاة من الضرائب؟', answer: 'يعتمد الإعفاء الضريبي على بلدك واللوائح المحلية. يُرجى التواصل معنا لمعرفة حالة تسجيلنا والوثائق المتاحة. نعمل على تحقيق حالة الإعفاء الضريبي الرسمية حيثما ينطبق.' },
        { id: 'safeguarding', question: 'ما تدابير الحماية التي لديكم؟', answer: 'نعطي الأولوية لأمان وكرامة وموافقة الأشخاص الذين نخدمهم. نتابع الحالات ونحافظ على تواصل دوري مع المشاركين، ونتبع مبادئ الحماية للأطفال والبالغين الضعفاء. يجري الانتهاء من سياسة حماية رسمية.' },
        { id: 'contact', question: 'كيف أتواصل مع Vantage Foundation Uganda؟', answer: 'استخدم استمارة التواصل على vantagefoundationuganda.com/contact، أو اتصل بنا أو راسلنا عبر واتساب على +256 786 585 216. تتيح لك الاستمارة اختيار الفريق المناسب — الشراكات، أو المنح، أو البرامج، أو التطوع، أو الإعلام، أو البحث — لتصل رسالتك إلى من يمكنه الرد.' },
      ],
    },
  },
};

import type { Locale } from "./config";

type AboutContent = {
  mission: string;
  vision: string;
  values: string[];
  governance: [string, string];
  /** Institutional descriptor used in the hero: "Youth-led. Community-rooted. Evidence-driven." */
  tagline: string;
  /** Hero paragraph — Uganda, youth/community orientation, six portfolios. */
  institutional: string;
  whyTitle: string;
  whyBody: [string, string];
  whyCta: string;
  storyTitle: string;
  storyLead: string;
  /** Only milestones supported by documented repository content. */
  milestones: { year: string; title: string; body: string }[];
  identityTitle: string;
  identityIntro: string;
  identity: { title: string; body: string }[];
  identityImpactCta: string;
  howTitle: string;
  howDescription: string;
  howSteps: { title: string; body: string }[];
  howCta: string;
  portfoliosTitle: string;
  portfoliosDescription: string;
  vpTitle: string;
  vpBody: string;
  vpStatusLabel: string;
  vpCta: string;
  geoTitle: string;
  geoBody: string;
  geoCta: string;
  buildingTitle: string;
  buildingBody: string;
  closingTitle: string;
  closingBody: string;
  partnerCta: string;
  donateCta: string;
};

export const aboutContent: Record<Locale, AboutContent> = {
  en: {
    mission: "To change the world, one advantage at a time.",
    vision: "Improved livelihoods in Ugandan and East African communities.",
    values: ["Growth", "Sustainability", "Safety", "Inclusivity"],
    governance: [
      "Vantage Foundation Uganda is a youth-led organisation formalising its governance structures, safeguarding policies and financial reporting so that every donor, partner and community can trust how resources are used.",
      "Annual reports, financial statements and project reports will be published on our Reports and Accountability page.",
    ],
    tagline: "Youth-led. Community-rooted. Evidence-driven.",
    institutional:
      "Vantage Foundation Uganda is a youth-led nonprofit working in Ugandan communities where health, education, income, basic needs, safety and voice are inseparable. It organises its work into six connected outcome portfolios — designed with communities, delivered close to them, and increasingly measured and published.",
    whyTitle: "Why Vantage exists",
    whyBody: [
      "People's lives do not arrive in separate categories. A health problem interrupts schooling; an interrupted education becomes an economic gap; economic vulnerability puts safety, dignity and basic needs at risk. Treating these as unrelated silos is how communities get served in fragments.",
      "Vantage was created to work the other way around — as one organisation responding to connected needs through six portfolios that reinforce each other. That is the institutional rationale behind everything from a borehole to a book club to a menstrual-health mentorship programme.",
    ],
    whyCta: "See the Theory of Change",
    storyTitle: "Our story",
    storyLead:
      "Vantage Foundation Uganda was founded in December 2020 by young Ugandans. It began with small, direct community work and has grown — deliberately and unevenly — into an organisation with a structured programme architecture and a deepening evidence discipline.",
    milestones: [
      {
        year: "December 2020",
        title: "Founded",
        body: "Vantage Foundation Uganda is established by young Ugandans as a youth-led nonprofit — built from the conviction that people who share a community's reality are well placed to change it.",
      },
      {
        year: "2021",
        title: "First programme work",
        body: "SaveGirl Uganda — the Foundation's first project — begins as a crowdfunding campaign for sanitary pads and grows into a mentorship and skills programme. Semi-annual workshops on mental health, sexual and reproductive health and financial literacy begin.",
      },
      {
        year: "2022",
        title: "Learning and literacy",
        body: "The Advantage Book Club launches in August, giving young people access to influential self-development books. In September, Vantage and Girl Power USA jointly host a youth conference on financial literacy and career education in Bushenyi.",
      },
      {
        year: "2023",
        title: "Programme development",
        body: "SaveGirl Uganda expands to include a menstrual-cup initiative, adding product access and hands-on training to its mentorship model.",
      },
      {
        year: "May 2025",
        title: "First flagship infrastructure",
        body: "The Kasaale Deep Borehole is completed in Magada Sub-county, Namutumba District — a WASH intervention serving an estimated catchment of up to 10,000 people.",
      },
      {
        year: "Today",
        title: "A connected architecture",
        body: "The work is organised into six outcome portfolios with explicit evidence statuses, an Impact & Learning framework, and Vantage Point — a planned cross-programme platform for dialogue and reflection.",
      },
    ],
    identityTitle: "What our identity means",
    identityIntro:
      "Three words describe how Vantage is built. Each is a commitment with a specific meaning — not a slogan.",
    identity: [
      {
        title: "Youth-led",
        body: "Vantage was founded and is led by young Ugandans, and young people shape its programmes, voices and direction. That does not mean everyone it works with is young — it means youth leadership is the organisation's centre of gravity, and younger people are treated as participants and leaders, not only recipients.",
      },
      {
        title: "Community-rooted",
        body: "Programme understanding comes from the communities where the work happens — their priorities, constraints and existing structures. Vantage works in districts and settlements that larger organisations often overlook, and designs with the people the work is for.",
      },
      {
        title: "Evidence-driven",
        body: "Vantage is building a discipline of measurement, honest claim-labelling and learning — distinguishing what it intends, what teams report, what is estimated and what is verified. This is an organisational direction and operating discipline, not a claim that every programme already carries mature evaluation evidence.",
      },
    ],
    identityImpactCta: "See how we measure and report",
    howTitle: "How Vantage works",
    howDescription:
      "The same operating logic runs through every portfolio — a discipline, not a slogan.",
    howSteps: [
      {
        title: "Understand context",
        body: "Start from the community's reality — the constraints, priorities and existing structures on the ground.",
      },
      {
        title: "Design and respond",
        body: "Shape the response with the people it serves, connecting needs rather than treating them separately.",
      },
      {
        title: "Implement and connect",
        body: "Deliver close to communities and link portfolios where needs overlap — health with education, income with protection.",
      },
      {
        title: "Observe and measure",
        body: "Track what is actually happening — and label every public figure with its evidence status.",
      },
      {
        title: "Learn and adapt",
        body: "Feed what is learned back into programme design and into what Vantage publishes.",
      },
    ],
    howCta: "Read the Theory of Change",
    portfoliosTitle: "Six connected portfolios",
    portfoliosDescription:
      "Each portfolio is distinct — with its own outcomes, approach and evidence — but they are designed to reinforce one another, because that is how the underlying needs actually behave.",
    vpTitle: "Vantage Point",
    vpBody:
      "Vantage Point is the planned cross-programme platform — a space for dialogue, youth and community voice, evidence and learning across the six portfolios. It is not a seventh portfolio, and it is still being built.",
    vpStatusLabel: "Planned",
    vpCta: "Learn about Vantage Point",
    geoTitle: "Where we work",
    geoBody:
      "Vantage's documented work spans a set of Ugandan districts — from Bushenyi and Jinja to Namutumba, Gulu, Kiryandongo and the Kalangala islands. Presence means documented programme and project activity, not permanent offices in every district.",
    geoCta: "Explore where we work",
    buildingTitle: "What we are building toward",
    buildingBody:
      "A Uganda where young people and their communities can reach healthcare, learning, economic capability, basic needs, safety and real participation — and where an organisation like Vantage can prove, publish and improve what it does. The Theory of Change sets out how the portfolios are expected to get there; Impact & Learning is where progress — and limits — get reported.",
    closingTitle: "Work with Vantage",
    closingBody:
      "Whether you are a funder, researcher, technical partner or individual supporter, there is a clear route in.",
    partnerCta: "Partner with us",
    donateCta: "Donate",
  },
  de: {
    mission: "Die Welt verändern — eine Chance nach der anderen.",
    vision: "Bessere Lebensbedingungen in Gemeinschaften in Uganda und Ostafrika.",
    values: ["Wachstum", "Nachhaltigkeit", "Sicherheit", "Inklusion"],
    governance: [
      "Vantage Foundation Uganda ist eine von jungen Menschen geführte Organisation, die ihre Leitungsstrukturen, Schutzrichtlinien und die Finanzberichterstattung weiter formalisiert, damit Spendende, Partner und Gemeinschaften nachvollziehen können, wie Mittel eingesetzt werden.",
      "Jahresberichte, Finanzabschlüsse und Projektberichte veröffentlichen wir auf der Seite Berichte und Rechenschaft.",
    ],
    tagline: "Von jungen Menschen geführt. In den Gemeinschaften verwurzelt. Evidenzorientiert.",
    institutional:
      "Vantage Foundation Uganda ist eine von jungen Menschen geführte gemeinnützige Organisation, die in ugandischen Gemeinschaften arbeitet, in denen Gesundheit, Bildung, Einkommen, Grundbedürfnisse, Sicherheit und Mitsprache untrennbar zusammenhängen. Sie gliedert ihre Arbeit in sechs verbundene Portfolios — mit Gemeinschaften gestaltet, in ihrer Nähe umgesetzt und zunehmend gemessen und veröffentlicht.",
    whyTitle: "Warum es Vantage gibt",
    whyBody: [
      "Das Leben der Menschen kommt nicht in getrennten Kategorien daher. Ein Gesundheitsproblem unterbricht die Schulbildung; eine unterbrochene Bildung wird zu einer wirtschaftlichen Lücke; wirtschaftliche Verletzlichkeit gefährdet Sicherheit, Würde und Grundbedürfnisse. Wer diese als unverbundene Silos behandelt, versorgt Gemeinschaften nur in Fragmenten.",
      "Vantage wurde gegründet, um anders zu arbeiten — als eine Organisation, die auf verbundene Bedürfnisse mit sechs Portfolios reagiert, die einander verstärken. Das ist die institutionelle Begründung hinter allem, von einem Brunnen über einen Lesekreis bis zu einem Mentoring-Programm für Menstruationsgesundheit.",
    ],
    whyCta: "Die Theory of Change ansehen",
    storyTitle: "Unsere Geschichte",
    storyLead:
      "Vantage Foundation Uganda wurde im Dezember 2020 von jungen Uganderinnen und Ugandern gegründet. Sie begann mit kleiner, direkter Gemeinschaftsarbeit und ist — bewusst und ungleichmäßig — zu einer Organisation mit strukturierter Programmarchitektur und vertiefter Evidenzdisziplin gewachsen.",
    milestones: [
      {
        year: "Dezember 2020",
        title: "Gründung",
        body: "Vantage Foundation Uganda wird von jungen Uganderinnen und Ugandern als von Jugend geführte gemeinnützige Organisation gegründet — aus der Überzeugung, dass Menschen, die die Realität einer Gemeinschaft teilen, gut positioniert sind, sie zu verändern.",
      },
      {
        year: "2021",
        title: "Erste Programmarbeit",
        body: "SaveGirl Uganda — das erste Projekt der Stiftung — beginnt als Crowdfunding-Kampagne für Damenbinden und wächst zu einem Mentoring- und Kompetenzprogramm. Halbjährliche Workshops zu psychischer Gesundheit, sexueller und reproduktiver Gesundheit und Finanzwissen beginnen.",
      },
      {
        year: "2022",
        title: "Lernen und Bildung",
        body: "Der Advantage Book Club startet im August und gibt jungen Menschen Zugang zu einflussreicher Selbstentwicklungsliteratur. Im September veranstalten Vantage und Girl Power USA gemeinsam eine Jugendkonferenz zu Finanzwissen und Berufsbildung in Bushenyi.",
      },
      {
        year: "2023",
        title: "Programmentwicklung",
        body: "SaveGirl Uganda erweitert sich um eine Menstruationstassen-Initiative, die dem Mentoring-Modell Produktzugang und praktische Schulung hinzufügt.",
      },
      {
        year: "Mai 2025",
        title: "Erste Flaggschiff-Infrastruktur",
        body: "Das Kasaale-Tiefenbohrloch wird in Magada Sub-county, Distrikt Namutumba, fertiggestellt — eine WASH-Maßnahme mit einem geschätzten Einzugsgebiet von bis zu 10.000 Menschen.",
      },
      {
        year: "Heute",
        title: "Eine verbundene Architektur",
        body: "Die Arbeit ist in sechs Ergebnisportfolios mit expliziten Evidenzstatus, einem Impact-&-Learning-Rahmen und Vantage Point gegliedert — einer geplanten programmübergreifenden Plattform für Dialog und Reflexion.",
      },
    ],
    identityTitle: "Was unsere Identität bedeutet",
    identityIntro:
      "Drei Worte beschreiben, wie Vantage aufgebaut ist. Jedes ist eine Verpflichtung mit einer bestimmten Bedeutung — kein Schlagwort.",
    identity: [
      {
        title: "Von jungen Menschen geführt",
        body: "Vantage wurde von jungen Uganderinnen und Ugandern gegründet und wird von ihnen geleitet; junge Menschen prägen Programme, Stimmen und Ausrichtung. Das heißt nicht, dass alle, mit denen es arbeitet, jung sind — es heißt, dass Führung durch junge Menschen der Schwerpunkt der Organisation ist und Jüngere als Teilnehmende und Gestaltende behandelt werden, nicht nur als Empfangende.",
      },
      {
        title: "In den Gemeinschaften verwurzelt",
        body: "Das Programmverständnis kommt aus den Gemeinschaften, in denen die Arbeit stattfindet — ihren Prioritäten, Zwängen und bestehenden Strukturen. Vantage arbeitet in Distrikten und Siedlungen, die größere Organisationen oft übersehen, und gestaltet mit den Menschen, für die die Arbeit gedacht ist.",
      },
      {
        title: "Evidenzorientiert",
        body: "Vantage baut eine Disziplin aus Messung, ehrlicher Kennzeichnung von Aussagen und Lernen auf — und unterscheidet, was es beabsichtigt, was Teams berichten, was geschätzt ist und was verifiziert wurde. Das ist eine organisatorische Richtung und Arbeitsdisziplin, nicht die Behauptung, jedes Programm verfüge bereits über reife Evaluationsbelege.",
      },
    ],
    identityImpactCta: "Wie wir messen und berichten",
    howTitle: "Wie Vantage arbeitet",
    howDescription:
      "Dieselbe Arbeitslogik durchzieht jedes Portfolio — eine Disziplin, kein Schlagwort.",
    howSteps: [
      {
        title: "Kontext verstehen",
        body: "Ausgehend von der Realität der Gemeinschaft — den Zwängen, Prioritäten und bestehenden Strukturen vor Ort.",
      },
      {
        title: "Gestalten und reagieren",
        body: "Die Antwort mit den Menschen formen, für die sie gedacht ist, und Bedürfnisse verbinden statt sie getrennt zu behandeln.",
      },
      {
        title: "Umsetzen und verbinden",
        body: "In der Nähe der Gemeinschaften umsetzen und Portfolios verknüpfen, wo sich Bedürfnisse überschneiden — Gesundheit mit Bildung, Einkommen mit Schutz.",
      },
      {
        title: "Beobachten und messen",
        body: "Verfolgen, was tatsächlich geschieht — und jede öffentliche Zahl mit ihrem Evidenzstatus kennzeichnen.",
      },
      {
        title: "Lernen und anpassen",
        body: "Das Gelernte in die Programmgestaltung und in das, was Vantage veröffentlicht, zurückführen.",
      },
    ],
    howCta: "Die Theory of Change lesen",
    portfoliosTitle: "Sechs verbundene Portfolios",
    portfoliosDescription:
      "Jedes Portfolio ist eigenständig — mit eigenen Ergebnissen, Ansätzen und Evidenz — doch sie sind so gestaltet, dass sie einander verstärken, denn genau so verhalten sich die zugrunde liegenden Bedürfnisse.",
    vpTitle: "Vantage Point",
    vpBody:
      "Vantage Point ist die geplante programmübergreifende Plattform — ein Raum für Dialog, die Stimmen von Jugend und Gemeinschaften, Evidenz und Lernen über die sechs Portfolios hinweg. Es ist kein siebtes Portfolio und befindet sich noch im Aufbau.",
    vpStatusLabel: "Geplant",
    vpCta: "Über Vantage Point",
    geoTitle: "Wo wir arbeiten",
    geoBody:
      "Die dokumentierte Arbeit von Vantage umfasst eine Reihe ugandischer Distrikte — von Bushenyi und Jinja bis Namutumba, Gulu, Kiryandongo und den Kalangala-Inseln. Präsenz bedeutet dokumentierte Programm- und Projekttätigkeit, nicht ständige Büros in jedem Distrikt.",
    geoCta: "Wo wir arbeiten erkunden",
    buildingTitle: "Woran wir bauen",
    buildingBody:
      "Ein Uganda, in dem junge Menschen und ihre Gemeinschaften Zugang zu Gesundheitsversorgung, Bildung, wirtschaftlicher Leistungsfähigkeit, Grundbedürfnissen, Sicherheit und echter Teilhabe erreichen — und in dem eine Organisation wie Vantage nachweisen, veröffentlichen und verbessern kann, was sie tut. Die Theory of Change beschreibt, wie die Portfolios dorthin gelangen sollen; Impact & Learning ist der Ort, an dem Fortschritt — und Grenzen — berichtet werden.",
    closingTitle: "Mit Vantage arbeiten",
    closingBody:
      "Ob Geldgeberin, Forscher, technischer Partner oder einzelne Unterstützerin — es gibt einen klaren Weg hinein.",
    partnerCta: "Partner werden",
    donateCta: "Spenden",
  },
  fr: {
    mission: "Changer le monde, une possibilité à la fois.",
    vision: "De meilleures conditions de vie dans les communautés ougandaises et est-africaines.",
    values: ["Développement", "Durabilité", "Sécurité", "Inclusion"],
    governance: [
      "Vantage Foundation Uganda est une organisation dirigée par des jeunes qui formalise ses structures de gouvernance, ses politiques de protection et ses rapports financiers afin que chaque donateur, partenaire et communauté puisse suivre l’utilisation des ressources.",
      "Les rapports annuels, états financiers et rapports de projet seront publiés sur notre page Rapports et redevabilité.",
    ],
    tagline: "Dirigée par des jeunes. Enracinée dans les communautés. Guidée par les preuves.",
    institutional:
      "Vantage Foundation Uganda est une organisation à but non lucratif dirigée par des jeunes, qui travaille dans des communautés ougandaises où la santé, l’éducation, le revenu, les besoins essentiels, la sécurité et la participation sont indissociables. Elle organise son travail en six portefeuilles de résultats connectés — conçus avec les communautés, mis en œuvre à leur proximité, et de plus en plus mesurés et publiés.",
    whyTitle: "Pourquoi Vantage existe",
    whyBody: [
      "La vie des gens ne se présente pas en catégories séparées. Un problème de santé interrompt la scolarité ; une scolarité interrompue devient un déficit économique ; la vulnérabilité économique compromet la sécurité, la dignité et les besoins essentiels. Traiter ces enjeux comme des silos sans lien, c’est servir les communautés par fragments.",
      "Vantage a été créée pour faire l’inverse — une seule organisation qui répond à des besoins connectés par six portefeuilles qui se renforcent mutuellement. C’est la logique institutionnelle derrière tout, du forage au club de lecture en passant par le mentorat en santé menstruelle.",
    ],
    whyCta: "Voir la théorie du changement",
    storyTitle: "Notre histoire",
    storyLead:
      "Vantage Foundation Uganda a été fondée en décembre 2020 par de jeunes Ougandais. Elle a commencé par un travail communautaire modeste et direct, puis a grandi — délibérément et de façon inégale — vers une organisation dotée d’une architecture de programmes structurée et d’une discipline de preuve grandissante.",
    milestones: [
      {
        year: "Décembre 2020",
        title: "Fondation",
        body: "Vantage Foundation Uganda est créée par de jeunes Ougandais comme une organisation à but non lucratif dirigée par des jeunes — née de la conviction que ceux qui partagent la réalité d’une communauté sont bien placés pour la transformer.",
      },
      {
        year: "2021",
        title: "Premier travail de programme",
        body: "SaveGirl Uganda — le premier projet de la Fondation — débute comme une campagne de financement participatif pour des serviettes hygiéniques et devient un programme de mentorat et de compétences. Des ateliers semestriels sur la santé mentale, la santé sexuelle et reproductive et l’éducation financière commencent.",
      },
      {
        year: "2022",
        title: "Apprentissage et littératie",
        body: "L’Advantage Book Club est lancé en août et donne aux jeunes accès à des livres de développement personnel influents. En septembre, Vantage et Girl Power USA coorganisent à Bushenyi une conférence de jeunes sur l’éducation financière et l’orientation.",
      },
      {
        year: "2023",
        title: "Développement des programmes",
        body: "SaveGirl Uganda s’enrichit d’une initiative de coupes menstruelles, ajoutant l’accès au produit et une formation pratique à son modèle de mentorat.",
      },
      {
        year: "Mai 2025",
        title: "Première infrastructure phare",
        body: "Le forage profond de Kasaale est achevé à Magada Sub-county, district de Namutumba — une intervention WASH desservant une zone estimée jusqu’à 10 000 personnes.",
      },
      {
        year: "Aujourd’hui",
        title: "Une architecture connectée",
        body: "Le travail est organisé en six portefeuilles de résultats avec des statuts de preuve explicites, un cadre Impact & Learning, et Vantage Point — une plateforme transversale prévue pour le dialogue et la réflexion.",
      },
    ],
    identityTitle: "Ce que signifie notre identité",
    identityIntro:
      "Trois mots décrivent comment Vantage est construite. Chacun est un engagement au sens précis — pas un slogan.",
    identity: [
      {
        title: "Dirigée par des jeunes",
        body: "Vantage a été fondée et est dirigée par de jeunes Ougandais, et les jeunes façonnent ses programmes, ses voix et son cap. Cela ne signifie pas que toutes les personnes avec qui elle travaille sont jeunes — cela signifie que le leadership des jeunes est le centre de gravité de l’organisation et que les plus jeunes sont traités comme des participants et des leaders, pas seulement des bénéficiaires.",
      },
      {
        title: "Enracinée dans les communautés",
        body: "La compréhension des programmes vient des communautés où le travail a lieu — leurs priorités, leurs contraintes et leurs structures existantes. Vantage travaille dans des districts et des quartiers que les grandes organisations négligent souvent, et conçoit avec les personnes pour qui le travail est fait.",
      },
      {
        title: "Guidée par les preuves",
        body: "Vantage construit une discipline de mesure, d’étiquetage honnête des affirmations et d’apprentissage — distinguant ce qu’elle vise, ce que les équipes rapportent, ce qui est estimé et ce qui est vérifié. C’est une direction organisationnelle et une discipline de travail, pas la prétention que chaque programme dispose déjà de preuves d’évaluation abouties.",
      },
    ],
    identityImpactCta: "Comment nous mesurons et rendons compte",
    howTitle: "Comment Vantage travaille",
    howDescription:
      "La même logique de travail traverse chaque portefeuille — une discipline, pas un slogan.",
    howSteps: [
      {
        title: "Comprendre le contexte",
        body: "Partir de la réalité de la communauté — les contraintes, priorités et structures existantes sur le terrain.",
      },
      {
        title: "Concevoir et répondre",
        body: "Façonner la réponse avec les personnes qu’elle sert, en reliant les besoins plutôt qu’en les traitant séparément.",
      },
      {
        title: "Mettre en œuvre et relier",
        body: "Agir au plus près des communautés et relier les portefeuilles là où les besoins se chevauchent — santé avec éducation, revenu avec protection.",
      },
      {
        title: "Observer et mesurer",
        body: "Suivre ce qui se passe réellement — et étiqueter chaque chiffre public de son statut de preuve.",
      },
      {
        title: "Apprendre et adapter",
        body: "Réinjecter les apprentissages dans la conception des programmes et dans ce que Vantage publie.",
      },
    ],
    howCta: "Lire la théorie du changement",
    portfoliosTitle: "Six portefeuilles connectés",
    portfoliosDescription:
      "Chaque portefeuille est distinct — avec ses résultats, son approche et ses preuves propres — mais ils sont conçus pour se renforcer mutuellement, car c’est ainsi que se comportent les besoins sous-jacents.",
    vpTitle: "Vantage Point",
    vpBody:
      "Vantage Point est la plateforme transversale prévue — un espace de dialogue, de voix des jeunes et des communautés, de preuves et d’apprentissage à travers les six portefeuilles. Ce n’est pas un septième portefeuille, et elle est encore en construction.",
    vpStatusLabel: "Prévue",
    vpCta: "Découvrir Vantage Point",
    geoTitle: "Où nous travaillons",
    geoBody:
      "Le travail documenté de Vantage couvre un ensemble de districts ougandais — de Bushenyi et Jinja à Namutumba, Gulu, Kiryandongo et les îles Kalangala. La présence signifie une activité de programme et de projet documentée, pas des bureaux permanents dans chaque district.",
    geoCta: "Explorer où nous travaillons",
    buildingTitle: "Ce vers quoi nous construisons",
    buildingBody:
      "Une Ouganda où les jeunes et leurs communautés peuvent accéder aux soins, à l’apprentissage, à la capacité économique, aux besoins essentiels, à la sécurité et à une vraie participation — et où une organisation comme Vantage peut prouver, publier et améliorer ce qu’elle fait. La théorie du changement décrit comment les portefeuilles sont censés y parvenir ; Impact & Learning est l’endroit où les progrès — et les limites — sont rapportés.",
    closingTitle: "Travailler avec Vantage",
    closingBody:
      "Que vous soyez bailleur de fonds, chercheuse, partenaire technique ou soutien individuel, il existe une voie claire.",
    partnerCta: "Devenir partenaire",
    donateCta: "Faire un don",
  },
  es: {
    mission: "Cambiar el mundo, una oportunidad a la vez.",
    vision: "Medios de vida mejorados en comunidades de Uganda y África Oriental.",
    values: ["Crecimiento", "Sostenibilidad", "Seguridad", "Inclusión"],
    governance: [
      "Vantage Foundation Uganda es una organización dirigida por jóvenes que está formalizando sus estructuras de gobernanza, políticas de protección e informes financieros para que cada donante, socio y comunidad pueda confiar en cómo se utilizan los recursos.",
      "Los informes anuales, estados financieros e informes de proyectos se publicarán en nuestra página de Informes y Rendición de Cuentas.",
    ],
    tagline: "Dirigida por jóvenes. Arraigada en las comunidades. Guiada por la evidencia.",
    institutional:
      "Vantage Foundation Uganda es una organización sin fines de lucro dirigida por jóvenes que trabaja en comunidades ugandesas donde la salud, la educación, los ingresos, las necesidades básicas, la seguridad y la participación son inseparables. Organiza su trabajo en seis portafolios de resultados conectados — diseñados con las comunidades, ejecutados cerca de ellas y cada vez más medidos y publicados.",
    whyTitle: "Por qué existe Vantage",
    whyBody: [
      "La vida de las personas no llega en categorías separadas. Un problema de salud interrumpe la escolaridad; una educación interrumpida se convierte en una brecha económica; la vulnerabilidad económica pone en riesgo la seguridad, la dignidad y las necesidades básicas. Tratar estos asuntos como silos inconexos es servir a las comunidades a fragmentos.",
      "Vantage se creó para trabajar al revés — como una sola organización que responde a necesidades conectadas mediante seis portafolios que se refuerzan entre sí. Esa es la lógica institucional detrás de todo, desde un pozo hasta un club de lectura o un programa de mentoría en salud menstrual.",
    ],
    whyCta: "Ver la teoría del cambio",
    storyTitle: "Nuestra historia",
    storyLead:
      "Vantage Foundation Uganda fue fundada en diciembre de 2020 por jóvenes ugandeses. Comenzó con trabajo comunitario pequeño y directo y ha crecido — deliberada y desigualmente — hasta convertirse en una organización con una arquitectura de programas estructurada y una disciplina de evidencia en profundización.",
    milestones: [
      {
        year: "Diciembre de 2020",
        title: "Fundación",
        body: "Vantage Foundation Uganda es establecida por jóvenes ugandeses como una organización sin fines de lucro dirigida por jóvenes — construida sobre la convicción de que quienes comparten la realidad de una comunidad están bien posicionados para cambiarla.",
      },
      {
        year: "2021",
        title: "Primer trabajo de programa",
        body: "SaveGirl Uganda — el primer proyecto de la Fundación — comienza como una campaña de micromecenazgo para toallas higiénicas y crece hasta convertirse en un programa de mentoría y habilidades. Comienzan los talleres semestrales sobre salud mental, salud sexual y reproductiva y educación financiera.",
      },
      {
        year: "2022",
        title: "Aprendizaje y alfabetización",
        body: "El Advantage Book Club se lanza en agosto, dando a los jóvenes acceso a libros influyentes de desarrollo personal. En septiembre, Vantage y Girl Power USA organizan conjuntamente en Bushenyi una conferencia juvenil sobre educación financiera y orientación profesional.",
      },
      {
        year: "2023",
        title: "Desarrollo de programas",
        body: "SaveGirl Uganda se amplía con una iniciativa de copas menstruales, añadiendo acceso al producto y formación práctica a su modelo de mentoría.",
      },
      {
        year: "Mayo de 2025",
        title: "Primera infraestructura insignia",
        body: "Se completa el pozo profundo de Kasaale en Magada Sub-county, distrito de Namutumba — una intervención WASH que sirve a un área estimada de hasta 10.000 personas.",
      },
      {
        year: "Hoy",
        title: "Una arquitectura conectada",
        body: "El trabajo se organiza en seis portafolios de resultados con estados de evidencia explícitos, un marco de Impacto y Aprendizaje, y Vantage Point — una plataforma transversal prevista para el diálogo y la reflexión.",
      },
    ],
    identityTitle: "Qué significa nuestra identidad",
    identityIntro:
      "Tres palabras describen cómo está construida Vantage. Cada una es un compromiso con un significado concreto — no un eslogan.",
    identity: [
      {
        title: "Dirigida por jóvenes",
        body: "Vantage fue fundada y es dirigida por jóvenes ugandeses, y los jóvenes dan forma a sus programas, voces y rumbo. Eso no significa que todos con quienes trabaja sean jóvenes — significa que el liderazgo juvenil es el centro de gravedad de la organización y que los más jóvenes son tratados como participantes y líderes, no solo como beneficiarios.",
      },
      {
        title: "Arraigada en las comunidades",
        body: "La comprensión de los programas proviene de las comunidades donde ocurre el trabajo — sus prioridades, limitaciones y estructuras existentes. Vantage trabaja en distritos y asentamientos que las grandes organizaciones suelen pasar por alto, y diseña con las personas para quienes se hace el trabajo.",
      },
      {
        title: "Guiada por la evidencia",
        body: "Vantage está construyendo una disciplina de medición, etiquetado honesto de afirmaciones y aprendizaje — distinguiendo lo que pretende, lo que los equipos reportan, lo que se estima y lo que se verifica. Es una dirección organizacional y una disciplina de trabajo, no la afirmación de que cada programa ya dispone de evidencia de evaluación madura.",
      },
    ],
    identityImpactCta: "Cómo medimos y rendimos cuentas",
    howTitle: "Cómo trabaja Vantage",
    howDescription:
      "La misma lógica de trabajo recorre cada portafolio — una disciplina, no un eslogan.",
    howSteps: [
      {
        title: "Comprender el contexto",
        body: "Partir de la realidad de la comunidad — las limitaciones, prioridades y estructuras existentes sobre el terreno.",
      },
      {
        title: "Diseñar y responder",
        body: "Dar forma a la respuesta con las personas a las que sirve, conectando las necesidades en lugar de tratarlas por separado.",
      },
      {
        title: "Implementar y conectar",
        body: "Ejecutar cerca de las comunidades y vincular los portafolios donde las necesidades se solapan — salud con educación, ingresos con protección.",
      },
      {
        title: "Observar y medir",
        body: "Seguir lo que realmente ocurre — y etiquetar cada cifra pública con su estado de evidencia.",
      },
      {
        title: "Aprender y adaptar",
        body: "Reincorporar lo aprendido al diseño de los programas y a lo que Vantage publica.",
      },
    ],
    howCta: "Leer la teoría del cambio",
    portfoliosTitle: "Seis portafolios conectados",
    portfoliosDescription:
      "Cada portafolio es distinto — con sus propios resultados, enfoque y evidencia — pero están diseñados para reforzarse mutuamente, porque así se comportan las necesidades subyacentes.",
    vpTitle: "Vantage Point",
    vpBody:
      "Vantage Point es la plataforma transversal prevista — un espacio de diálogo, voces de jóvenes y comunidades, evidencia y aprendizaje a través de los seis portafolios. No es un séptimo portafolio y aún está en construcción.",
    vpStatusLabel: "Prevista",
    vpCta: "Conocer Vantage Point",
    geoTitle: "Dónde trabajamos",
    geoBody:
      "El trabajo documentado de Vantage abarca un conjunto de distritos ugandeses — desde Bushenyi y Jinja hasta Namutumba, Gulu, Kiryandongo y las islas Kalangala. Presencia significa actividad documentada de programas y proyectos, no oficinas permanentes en cada distrito.",
    geoCta: "Explorar dónde trabajamos",
    buildingTitle: "Hacia qué construimos",
    buildingBody:
      "Una Uganda donde los jóvenes y sus comunidades puedan alcanzar atención sanitaria, aprendizaje, capacidad económica, necesidades básicas, seguridad y participación real — y donde una organización como Vantage pueda demostrar, publicar y mejorar lo que hace. La teoría del cambio establece cómo se espera que los portafolios lleguen allí; Impacto y Aprendizaje es donde se reportan los avances — y los límites.",
    closingTitle: "Trabajar con Vantage",
    closingBody:
      "Ya sea financiador, investigadora, socio técnico o simpatizante individual, existe una vía clara.",
    partnerCta: "Asóciese con Vantage",
    donateCta: "Donar",
  },
  ar: {
    mission: "تغيير العالم، ميزة واحدة في كل مرة.",
    vision: "تحسين سبل العيش في مجتمعات أوغندا وشرق أفريقيا.",
    values: ["النمو", "الاستدامة", "السلامة", "الشمول"],
    governance: [
      "Vantage Foundation Uganda منظمة يقودها الشباب تعمل على إضفاء الطابع الرسمي على هياكل الحوكمة وسياسات الحماية والإبلاغ المالي، بحيث يمكن لكل متبرع وشريك ومجتمع الوثوق بكيفية استخدام الموارد.",
      "سيتم نشر التقارير السنوية والبيانات المالية وتقارير المشاريع في صفحة التقارير والمساءلة الخاصة بنا.",
    ],
    tagline: "بقيادة الشباب. متجذرة في المجتمعات. مستندة إلى الأدلة.",
    institutional:
      "Vantage Foundation Uganda منظمة غير ربحية يقودها الشباب وتعمل في مجتمعات أوغندية حيث الصحة والتعليم والدخل والاحتياجات الأساسية والسلامة والمشاركة غير قابلة للانفصال. تنظم عملها في ست محافظ نتائج مترابطة — مصممة مع المجتمعات، ومنفذة بالقرب منها، وتُقاس وتُنشر على نحو متزايد.",
    whyTitle: "لماذا توجد Vantage",
    whyBody: [
      "حياة الناس لا تأتي في فئات منفصلة. مشكلة صحية تقطع الدراسة؛ وتعليم منقطع يتحول إلى فجوة اقتصادية؛ والضعف الاقتصادي يهدد السلامة والكرامة والاحتياجات الأساسية. معاملة هذه القضايا كصوامع غير مترابطة تعني خدمة المجتمعات بشكل مجزأ.",
      "أُنشئت Vantage لتعمل بالعكس — كمنظمة واحدة تستجيب لاحتياجات مترابطة عبر ست محافظ تعزز بعضها بعضًا. هذا هو المنطق المؤسسي وراء كل شيء، من بئر ماء إلى نادي قراءة إلى برنامج إرشاد في الصحة الإنجابية.",
    ],
    whyCta: "اطّلعوا على نظرية التغيير",
    storyTitle: "قصتنا",
    storyLead:
      "تأسست Vantage Foundation Uganda في ديسمبر 2020 على يد شباب أوغنديين. بدأت بعمل مجتمعي صغير ومباشر، ونمت — عن قصد وبشكل غير متساوٍ — إلى منظمة ذات بنية برامجية منظمة وانضباط أدلة متعمق.",
    milestones: [
      {
        year: "ديسمبر 2020",
        title: "التأسيس",
        body: "تأسست Vantage Foundation Uganda على يد شباب أوغنديين كمنظمة غير ربحية يقودها الشباب — انطلاقًا من قناعة بأن من يشاركون واقع مجتمعهم هم في أفضل موقع لتغييره.",
      },
      {
        year: "2021",
        title: "أول عمل برامجي",
        body: "بدأت SaveGirl Uganda — أول مشروع للمؤسسة — كحملة تمويل جماعي لشراء الفوط الصحية، ثم نمت إلى برنامج إرشاد ومهارات. وبدأت ورش العمل نصف السنوية حول الصحة النفسية والصحة الجنسية والإنجابية والثقافة المالية.",
      },
      {
        year: "2022",
        title: "التعلم ومحو الأمية",
        body: "انطلق Advantage Book Club في أغسطس مانحًا الشباب وصولًا إلى كتب التنمية الذاتية المؤثرة. وفي سبتمبر، نظمت Vantage وGirl Power USA مؤتمرًا شبابيًا حول الثقافة المالية والتوجيه المهني في بوشينيي.",
      },
      {
        year: "2023",
        title: "تطوير البرامج",
        body: "توسعت SaveGirl Uganda لتشمل مبادرة الأكواب الحيضية، مضيفةً الوصول إلى المنتج والتدريب العملي إلى نموذج الإرشاد.",
      },
      {
        year: "مايو 2025",
        title: "أول بنية تحتية رائدة",
        body: "اكتمل بئر كاسالي العميق في مقاطعة ماغادا الفرعية، منطقة ناموتومبا — تدخل في المياه والصرف الصحي والنظافة يخدم نطاقًا تقديريًا يصل إلى 10,000 شخص.",
      },
      {
        year: "اليوم",
        title: "بنية مترابطة",
        body: "يُنظَّم العمل في ست محافظ نتائج بحالات أدلة صريحة، وإطار للأثر والتعلم، وVantage Point — منصة مخططة عابرة للبرامج للحوار والتأمل.",
      },
    ],
    identityTitle: "ماذا تعني هويتنا",
    identityIntro:
      "ثلاث كلمات تصف كيف بُنيت Vantage. كل واحدة التزام له معنى محدد — وليست شعارًا.",
    identity: [
      {
        title: "بقيادة الشباب",
        body: "أسس شباب أوغنديون Vantage ويقودونها، والشباب يشكلون برامجها وأصواتها وتوجهها. لا يعني ذلك أن كل من تعمل معهم شباب — بل يعني أن قيادة الشباب هي مركز ثقل المنظمة، وأن الأصغر سنًا يُعامَلون كمشاركين وقادة، لا كمستفيدين فقط.",
      },
      {
        title: "متجذرة في المجتمعات",
        body: "يأتي فهم البرامج من المجتمعات التي يحدث فيها العمل — أولوياتها وقيودها وهياكلها القائمة. تعمل Vantage في مناطق وتجمعات تغفلها المنظمات الكبرى غالبًا، وتصمم مع الأشخاص الذين صُمم العمل لأجلهم.",
      },
      {
        title: "مستندة إلى الأدلة",
        body: "تبني Vantage انضباطًا في القياس ووسم الادعاءات بصدق والتعلم — مميزةً بين ما تنويه، وما تبلغ عنه الفرق، وما هو مقدَّر، وما هو موثق. هذا اتجاه تنظيمي وانضباط عمل، لا ادعاء بأن كل برنامج يمتلك بالفعل أدلة تقييم ناضجة.",
      },
    ],
    identityImpactCta: "كيف نقيس ونُبلغ",
    howTitle: "كيف تعمل Vantage",
    howDescription:
      "نفس منطق العمل يسري في كل محفظة — انضباط، لا شعار.",
    howSteps: [
      {
        title: "فهم السياق",
        body: "الانطلاق من واقع المجتمع — القيود والأولويات والهياكل القائمة على الأرض.",
      },
      {
        title: "التصميم والاستجابة",
        body: "تشكيل الاستجابة مع الأشخاص الذين تخدمهم، وربط الاحتياجات بدلًا من معالجتها منفصلة.",
      },
      {
        title: "التنفيذ والربط",
        body: "التنفيذ بالقرب من المجتمعات وربط المحافظ حيث تتداخل الاحتياجات — الصحة مع التعليم، والدخل مع الحماية.",
      },
      {
        title: "الرصد والقياس",
        body: "تتبع ما يحدث فعلًا — ووسم كل رقم منشور بحالة أدلته.",
      },
      {
        title: "التعلم والتكييف",
        body: "إعادة ما تُعلِّمه النتائج إلى تصميم البرامج وإلى ما تنشره Vantage.",
      },
    ],
    howCta: "اقرأوا نظرية التغيير",
    portfoliosTitle: "ست محافظ مترابطة",
    portfoliosDescription:
      "كل محفظة متميزة — بنتائجها ونهجها وأدلتها الخاصة — لكنها مصممة لتعزز بعضها بعضًا، لأن الاحتياجات الكامنة تتصرف بهذه الطريقة فعلًا.",
    vpTitle: "Vantage Point",
    vpBody:
      "Vantage Point هي المنصة المخططة العابرة للبرامج — مساحة للحوار وأصوات الشباب والمجتمعات والأدلة والتعلم عبر المحافظ الست. ليست محفظة سابعة، وما تزال قيد البناء.",
    vpStatusLabel: "مخططة",
    vpCta: "تعرفوا على Vantage Point",
    geoTitle: "أين نعمل",
    geoBody:
      "يمتد عمل Vantage الموثق عبر مجموعة من المناطق الأوغندية — من بوشينيي وجينجا إلى ناموتومبا وغولو وكيرياندونغو وجزر كالانغالا. الحضور يعني نشاطًا موثقًا للبرامج والمشاريع، لا مكاتب دائمة في كل منطقة.",
    geoCta: "استكشفوا أين نعمل",
    buildingTitle: "ما نبني نحوه",
    buildingBody:
      "أوغندا يستطيع فيها الشباب ومجتمعاتهم الوصول إلى الرعاية الصحية والتعلم والقدرة الاقتصادية والاحتياجات الأساسية والسلامة والمشاركة الحقيقية — وحيث يمكن لمنظمة مثل Vantage أن تثبت وتنشر وتحسّن ما تفعله. تحدد نظرية التغيير كيف يُتوقع أن تصل المحافظ إلى ذلك؛ والأثر والتعلم هو المكان الذي تُذكر فيه التقدمات — والحدود.",
    closingTitle: "اعملوا مع Vantage",
    closingBody:
      "سواء كنتم ممولًا أو باحثًا أو شريكًا تقنيًا أو داعمًا فرديًا، هناك طريق واضح للانضمام.",
    partnerCta: "شاركوا Vantage",
    donateCta: "تبرعوا",
  },
};

export type HomepageSectionContent = {
  trust: string[];
  impact: { eyebrow: string; title: string; description: string; note: string; cta: string };
  problem: { eyebrow: string; title: string; lead: string; chain: string[]; closing: string };
  pathway: { eyebrow: string; title: string; steps: Array<{ title: string; description: string }>; cta: string };
  vantagePoint: { eyebrow: string; title: string; paragraphs: [string, string]; learnMore?: string };
  about: { eyebrow: string; title: string; paragraphs: [string, string]; cta: string; imageAlt: string };
  stories: { eyebrow: string; title: string; description: string; cta: string; read: string; support: string; featuredEyebrow: string; moreStories: string };
  instagram: { title: string; description: string; follow: string; postsLabel: string };
  partners: { eyebrow: string; title: string; description: string };
  accountability: { eyebrow: string; title: string; description: string; items: Array<{ title: string; description: string; href: string }>; learnMore: string; closing: string; contactCta: string };

  flagship: { eyebrow: string; title: string; description: string; location: string; timeline: string; beneficiaries: string; funding: string; read: string; support: string; viewAll: string };
};

export const homepageSectionContent: Record<Locale, HomepageSectionContent> = {
  en: {
    trust: ["Youth-led since December 2020", "Based in Uganda", "Offices in Jinja & Ishaka", "Community-centred"],
    impact: { eyebrow: "Impact", title: "Evidence with context", description: "Each headline figure is tied to the programme, place, reporting period and counting method behind it.", note: "These are programme-team figures and are not presented as independently audited results. Supporting public reports will be linked as they are approved for publication.", cta: "Explore our impact" },
    problem: {
      eyebrow: "The challenge",
      title: "Barriers do not arrive one at a time",
      lead: "In the communities we serve, a young person's health, education, income, safety and access to essentials like clean water are not separate issues — each one shapes the others.",
      chain: [
        "A health problem can keep a child out of school.",
        "An interrupted education can become an economic gap.",
        "Economic vulnerability can put safety and dignity at risk.",
        "Weak access to essential services compounds all of it.",
      ],
      closing: "That is why Vantage works across connected determinants of wellbeing and opportunity — and why every programme is designed with the community it serves.",
    },
    pathway: {
      eyebrow: "How change happens",
      title: "From listening to lasting advantage",
      steps: [
        { title: "Listen and understand", description: "Every programme begins with what young people and communities tell us they need." },
        { title: "Act with communities", description: "Work is designed and delivered with the people it serves — not for them." },
        { title: "Strengthen access and capability", description: "Each project builds something durable: a water point, a skill, a network, a safer environment." },
        { title: "Learn and adapt", description: "We record what works, label the status of every figure we publish, and adjust." },
        { title: "Improve outcomes", description: "Advantages compound — clean water frees time for school, and mentorship builds the confidence to use it." },
      ],
      cta: "See how we measure impact",
    },
    vantagePoint: {
      eyebrow: "Vantage Point",
      title: "Where learning connects the work",
      paragraphs: [
        "Vantage Point is the platform we are building to carry insight across programmes — community voice, field experience and evidence — so that progress in one area strengthens the others.",
        "It is early, deliberately: a commitment to learning in the open, developed with the communities it serves rather than announced as a finished product.",
      ],
      learnMore: "Explore Vantage Point",
    },
    about: { eyebrow: "About Vantage", title: "Local leadership. Practical advantages. Lasting change.", paragraphs: ["Founded in December 2020, Vantage Foundation Uganda is a youth-led nonprofit responding to barriers that keep people from essential healthcare, practical financial knowledge, clean water and dignified household support.", "We work with young people, families and vulnerable communities in rural districts and urban informal settlements. Community participation and youth leadership shape how every programme is designed and delivered."], cta: "Read our story", imageAlt: "Young Ugandans taking part in a Vantage Foundation community learning activity" },
    stories: { eyebrow: "Stories & Insights", title: "Voices and ideas from our community", description: "Reflections, research and programme updates from the young people, volunteers and leaders shaping our work.", cta: "Read Stories & Insights", read: "Read the story", support: "Support this work", featuredEyebrow: "A voice from our community", moreStories: "More stories & insights" },
    accountability: {
      eyebrow: "Accountability",
      title: "Trust is built in the open",
      description: "What we publish, what we are still preparing, and how to reach us.",
      items: [
        { title: "Safeguarding", description: "How we work to keep children, young people and vulnerable adults safe across every programme — and how to raise a concern.", href: "/safeguarding" },
        { title: "Privacy and consent", description: "How personal data is handled, and how photographs and stories are used only with consent.", href: "/privacy" },
        { title: "Reporting status", description: "Annual and financial reports are published once approved — we do not present unfinished documents as evidence.", href: "/reports-and-accountability" },
        { title: "Governance", description: "Our published leadership and the accountability structures we are formalising as we grow.", href: "/about-us#governance" },
      ],
      learnMore: "Learn more",
      closing: "A question, concern or request for information?",
      contactCta: "Contact us",
    },
    instagram: { title: "Popular on Instagram", description: "See the stories, programmes and community moments reaching the most people.", follow: "Follow Vantage Foundation Uganda on Instagram", postsLabel: "Popular Instagram posts" },
    partners: { eyebrow: "Partners", title: "Verified relationships", description: "Each relationship is described precisely so a banking service, in-kind contribution or programme collaboration is never overstated." },
    flagship: { eyebrow: "Flagship work", title: "Where the model is furthest along", description: "The projects that best show what working across connected needs looks like in practice.", location: "Location", timeline: "Timeline", beneficiaries: "Beneficiaries", funding: "Funding", read: "Read the full story", support: "Support this project", viewAll: "View all projects" },
  },
  de: {
    trust: ["Seit Dezember 2020 von jungen Menschen geführt", "In Uganda ansässig", "Büros in Jinja & Ishaka", "Gemeinschaftsnah"],
    impact: { eyebrow: "Wirkung", title: "Zahlen mit Kontext", description: "Jede Kennzahl ist mit dem zugehörigen Programm, Ort, Berichtszeitraum und der Zählmethode verknüpft.", note: "Diese Zahlen stammen von unseren Programmteams und sind keine unabhängig geprüften Ergebnisse. Öffentliche Belege werden verlinkt, sobald sie zur Veröffentlichung freigegeben sind.", cta: "Unsere Wirkung entdecken" },
    problem: {
      eyebrow: "Die Herausforderung",
      title: "Hürden kommen selten einzeln",
      lead: "In den Gemeinschaften, in denen wir arbeiten, sind Gesundheit, Bildung, Einkommen, Sicherheit und der Zugang zu Notwendigem wie sauberem Wasser keine getrennten Themen — jedes bedingt die anderen.",
      chain: [
        "Ein Gesundheitsproblem kann ein Kind von der Schule fernhalten.",
        "Eine unterbrochene Bildung kann zu einer wirtschaftlichen Lücke werden.",
        "Wirtschaftliche Verletzlichkeit kann Sicherheit und Würde gefährden.",
        "Fehlender Zugang zu grundlegenden Diensten verstärkt all das.",
      ],
      closing: "Deshalb arbeitet Vantage über verbundene Einflussfaktoren von Wohlbefinden und Chancen hinweg — und deshalb wird jedes Programm gemeinsam mit der Gemeinschaft entworfen, der es dient.",
    },
    pathway: {
      eyebrow: "Wie Veränderung entsteht",
      title: "Vom Zuhören zum dauerhaften Vorteil",
      steps: [
        { title: "Zuhören und verstehen", description: "Jedes Programm beginnt mit dem, was junge Menschen und Gemeinschaften uns als ihren Bedarf nennen." },
        { title: "Gemeinsam handeln", description: "Die Arbeit wird mit den Menschen entworfen und umgesetzt, denen sie dient — nicht für sie." },
        { title: "Zugang und Fähigkeiten stärken", description: "Jedes Projekt schafft etwas Dauerhaftes: einen Wasseranschluss, eine Fähigkeit, ein Netzwerk, eine sicherere Umgebung." },
        { title: "Lernen und anpassen", description: "Wir halten fest, was funktioniert, kennzeichnen den Stand jeder veröffentlichten Zahl und passen an." },
        { title: "Ergebnisse verbessern", description: "Vorteile verstärken sich — sauberes Wasser schafft Zeit für die Schule, und Mentoring stärkt das Selbstvertrauen, diese Zeit zu nutzen." },
      ],
      cta: "So messen wir Wirkung",
    },
    vantagePoint: {
      eyebrow: "Vantage Point",
      title: "Wo Lernen die Arbeit verbindet",
      paragraphs: [
        "Vantage Point ist die Plattform, die wir aufbauen, um Erkenntnisse zwischen den Programmen zu tragen — Stimmen der Gemeinschaft, Erfahrungen aus der Praxis und Belege — damit Fortschritt in einem Bereich die anderen stärkt.",
        "Sie ist bewusst früh: ein Versprechen, offen zu lernen, entwickelt mit den Gemeinschaften, denen sie dient — nicht als fertiges Produkt angekündigt.",
      ],
      learnMore: "Vantage Point entdecken",
    },
    about: { eyebrow: "Über Vantage", title: "Lokale Führung. Praktische Chancen. Dauerhafte Veränderung.", paragraphs: ["Vantage Foundation Uganda wurde im Dezember 2020 gegründet. Die von jungen Menschen geführte Organisation geht Hürden an, die Menschen den Zugang zu grundlegender Gesundheitsversorgung, praktischem Finanzwissen, sauberem Wasser und würdevoller Unterstützung im Alltag erschweren.", "Wir arbeiten mit jungen Menschen, Familien und besonders gefährdeten Gemeinschaften in ländlichen Distrikten und informellen städtischen Siedlungen. Beteiligung der Gemeinschaft und Führung durch junge Menschen prägen jedes Programm."], cta: "Unsere Geschichte lesen", imageAlt: "Junge Menschen in Uganda bei einer Lernaktivität von Vantage Foundation" },
    stories: { eyebrow: "Geschichten & Einblicke", title: "Stimmen und Ideen aus unserer Gemeinschaft", description: "Reflexionen, Forschung und Programmneuigkeiten von jungen Menschen, Freiwilligen und Führungskräften, die unsere Arbeit gestalten.", cta: "Geschichten & Einblicke lesen", read: "Geschichte lesen", support: "Diese Arbeit unterstützen", featuredEyebrow: "Eine Stimme aus unserer Gemeinschaft", moreStories: "Weitere Geschichten & Einblicke" },
    accountability: {
      eyebrow: "Rechenschaft",
      title: "Vertrauen entsteht offen",
      description: "Was wir veröffentlichen, was noch vorbereitet wird und wie Sie uns erreichen.",
      items: [
        { title: "Schutzkonzept", description: "Wie wir Kinder, junge Menschen und gefährdete Erwachsene in allen Programmen schützen — und wie Sie ein Anliegen melden.", href: "/safeguarding" },
        { title: "Datenschutz und Einwilligung", description: "Wie personenbezogene Daten verarbeitet werden und wie Fotos und Geschichten nur mit Einwilligung genutzt werden.", href: "/privacy" },
        { title: "Berichtsstatus", description: "Jahres- und Finanzberichte werden nach Freigabe veröffentlicht — unfertige Dokumente stellen wir nicht als Belege dar.", href: "/reports-and-accountability" },
        { title: "Leitung und Aufsicht", description: "Unser veröffentlichtes Führungsteam und die Rechenschaftsstrukturen, die wir mit dem Wachstum formalisieren.", href: "/about-us#governance" },
      ],
      learnMore: "Mehr erfahren",
      closing: "Eine Frage, ein Anliegen oder eine Informationsanfrage?",
      contactCta: "Kontakt aufnehmen",
    },
    instagram: { title: "Beliebt auf Instagram", description: "Entdecken Sie Geschichten, Programme und Momente aus den Gemeinschaften, die besonders viele Menschen erreichen.", follow: "Vantage Foundation Uganda auf Instagram folgen", postsLabel: "Beliebte Instagram-Beiträge" },
    partners: { eyebrow: "Partner", title: "Nachvollziehbare Partnerschaften", description: "Jede Beziehung wird genau beschrieben, damit Bankdienstleistungen, Sachleistungen und Programmkooperationen korrekt eingeordnet werden." },
    flagship: { eyebrow: "Leitprojekte", title: "Wo das Modell am weitesten ist", description: "Die Projekte, die am besten zeigen, wie Arbeit über verbundene Bedürfnisse hinweg in der Praxis aussieht.", location: "Ort", timeline: "Zeitraum", beneficiaries: "Begünstigte", funding: "Finanzierung", read: "Die ganze Geschichte lesen", support: "Dieses Projekt unterstützen", viewAll: "Alle Projekte ansehen" },
  },
  fr: {
    trust: ["Dirigée par des jeunes depuis décembre 2020", "Basée en Ouganda", "Bureaux à Jinja et Ishaka", "Centrée sur les communautés"],
    impact: { eyebrow: "Impact", title: "Des données mises en contexte", description: "Chaque chiffre clé est relié au programme, au lieu, à la période de référence et à la méthode de comptage correspondants.", note: "Ces chiffres proviennent de nos équipes de programme et ne sont pas présentés comme des résultats audités de façon indépendante. Les rapports publics seront ajoutés dès leur validation.", cta: "Découvrir notre impact" },
    problem: {
      eyebrow: "Le défi",
      title: "Les obstacles n'arrivent jamais un à un",
      lead: "Dans les communautés que nous servons, la santé, l'éducation, les revenus, la sécurité et l'accès aux biens essentiels comme l'eau potable d'un jeune ne sont pas des questions séparées — chacune influence les autres.",
      chain: [
        "Un problème de santé peut tenir un enfant hors de l'école.",
        "Une scolarité interrompue peut devenir un écart économique.",
        "La vulnérabilité économique peut mettre la sécurité et la dignité en danger.",
        "Un accès insuffisant aux services essentiels aggrave l'ensemble.",
      ],
      closing: "C'est pourquoi Vantage agit sur les déterminants liés du bien-être et des opportunités — et pourquoi chaque programme est conçu avec la communauté qu'il sert.",
    },
    pathway: {
      eyebrow: "Comment le changement se produit",
      title: "De l'écoute à l'avantage durable",
      steps: [
        { title: "Écouter et comprendre", description: "Chaque programme part de ce que les jeunes et les communautés nous disent avoir besoin." },
        { title: "Agir avec les communautés", description: "Le travail est conçu et mené avec les personnes qu'il sert — pas pour elles." },
        { title: "Renforcer l'accès et les capacités", description: "Chaque projet construit quelque chose de durable : un point d'eau, une compétence, un réseau, un environnement plus sûr." },
        { title: "Apprendre et adapter", description: "Nous consignons ce qui fonctionne, indiquons le statut de chaque chiffre publié et ajustons." },
        { title: "Améliorer les résultats", description: "Les avantages se cumulent — l'eau potable libère du temps pour l'école, et le mentorat donne la confiance pour l'utiliser." },
      ],
      cta: "Voir comment nous mesurons l'impact",
    },
    vantagePoint: {
      eyebrow: "Vantage Point",
      title: "Là où l'apprentissage relie l'action",
      paragraphs: [
        "Vantage Point est la plateforme que nous construisons pour faire circuler les enseignements entre les programmes — voix des communautés, expérience de terrain et preuves — afin que les progrès dans un domaine renforcent les autres.",
        "Elle en est à ses débuts, volontairement : un engagement à apprendre ouvertement, développée avec les communautés qu'elle sert plutôt qu'annoncée comme un produit fini.",
      ],
      learnMore: "Découvrir Vantage Point",
    },
    about: { eyebrow: "À propos de Vantage", title: "Leadership local. Possibilités concrètes. Changement durable.", paragraphs: ["Fondée en décembre 2020, Vantage Foundation Uganda est une organisation dirigée par des jeunes qui s’attaque aux obstacles limitant l’accès aux soins essentiels, aux connaissances financières pratiques, à l’eau potable et à un soutien digne des ménages.", "Nous travaillons avec des jeunes, des familles et des communautés vulnérables dans les districts ruraux et les quartiers urbains informels. La participation communautaire et le leadership des jeunes orientent chaque programme."], cta: "Lire notre histoire", imageAlt: "De jeunes Ougandais participant à une activité d’apprentissage communautaire de Vantage Foundation" },
    stories: { eyebrow: "Récits et perspectives", title: "Voix et idées de notre communauté", description: "Réflexions, recherches et nouvelles des programmes portées par les jeunes, bénévoles et responsables qui façonnent notre action.", cta: "Lire nos récits et perspectives", read: "Lire le récit", support: "Soutenir cette action", featuredEyebrow: "Une voix de notre communauté", moreStories: "Plus de récits et perspectives" },
    accountability: {
      eyebrow: "Redevabilité",
      title: "La confiance se construit au grand jour",
      description: "Ce que nous publions, ce qui est encore en préparation et comment nous joindre.",
      items: [
        { title: "Protection", description: "Comment nous protégeons les enfants, les jeunes et les adultes vulnérables dans chaque programme — et comment signaler une préoccupation.", href: "/safeguarding" },
        { title: "Confidentialité et consentement", description: "Comment les données personnelles sont traitées, et comment photos et récits ne sont utilisés qu'avec consentement.", href: "/privacy" },
        { title: "État des publications", description: "Les rapports annuels et financiers sont publiés une fois approuvés — nous ne présentons pas de documents inachevés comme des preuves.", href: "/reports-and-accountability" },
        { title: "Gouvernance", description: "Notre équipe dirigeante publiée et les structures de redevabilité que nous formalisons en grandissant.", href: "/about-us#governance" },
      ],
      learnMore: "En savoir plus",
      closing: "Une question, une préoccupation ou une demande d'information ?",
      contactCta: "Nous contacter",
    },
    instagram: { title: "Populaire sur Instagram", description: "Découvrez les récits, programmes et moments communautaires qui touchent le plus de personnes.", follow: "Suivre Vantage Foundation Uganda sur Instagram", postsLabel: "Publications Instagram populaires" },
    partners: { eyebrow: "Partenaires", title: "Des relations vérifiées", description: "Chaque relation est décrite avec précision afin de distinguer clairement service bancaire, contribution en nature et collaboration de programme." },
    flagship: { eyebrow: "Projets phares", title: "Là où le modèle est le plus avancé", description: "Les projets qui montrent le mieux ce que signifie, concrètement, travailler sur des besoins liés.", location: "Lieu", timeline: "Calendrier", beneficiaries: "Bénéficiaires", funding: "Financement", read: "Lire le récit complet", support: "Soutenir ce projet", viewAll: "Voir tous les projets" },
  },
  es: {
    trust: ["Dirigida por jóvenes desde diciembre de 2020", "Con sede en Uganda", "Oficinas en Jinja e Ishaka", "Centrada en la comunidad"],
    impact: { eyebrow: "Impacto", title: "Evidencia con contexto", description: "Cada cifra principal está vinculada al programa, lugar, período de reporte y método de conteo que la respalda.", note: "Estas son cifras del equipo de programa y no se presentan como resultados auditados de forma independiente. Los informes públicos de respaldo se vincularán a medida que sean aprobados para su publicación.", cta: "Explora nuestro impacto" },
    problem: {
      eyebrow: "El reto",
      title: "Las barreras no llegan de una en una",
      lead: "En las comunidades donde trabajamos, la salud, la educación, los ingresos, la seguridad y el acceso a lo esencial —como el agua potable— de un joven no son temas separados: cada uno condiciona a los demás.",
      chain: [
        "Un problema de salud puede mantener a un niño fuera de la escuela.",
        "Una educación interrumpida puede convertirse en una brecha económica.",
        "La vulnerabilidad económica puede poner en riesgo la seguridad y la dignidad.",
        "Un acceso débil a los servicios esenciales lo agrava todo.",
      ],
      closing: "Por eso Vantage trabaja sobre los determinantes conectados del bienestar y las oportunidades — y por eso cada programa se diseña con la comunidad a la que sirve.",
    },
    pathway: {
      eyebrow: "Cómo ocurre el cambio",
      title: "De escuchar a una ventaja duradera",
      steps: [
        { title: "Escuchar y comprender", description: "Cada programa parte de lo que los jóvenes y las comunidades nos dicen que necesitan." },
        { title: "Actuar con las comunidades", description: "El trabajo se diseña y se realiza con las personas a las que sirve, no para ellas." },
        { title: "Fortalecer el acceso y las capacidades", description: "Cada proyecto construye algo duradero: un punto de agua, una habilidad, una red, un entorno más seguro." },
        { title: "Aprender y adaptar", description: "Registramos lo que funciona, indicamos el estado de cada cifra que publicamos y ajustamos." },
        { title: "Mejorar los resultados", description: "Las ventajas se acumulan: el agua limpia libera tiempo para la escuela y la mentoría da la confianza para aprovecharlo." },
      ],
      cta: "Mira cómo medimos el impacto",
    },
    vantagePoint: {
      eyebrow: "Vantage Point",
      title: "Donde el aprendizaje conecta el trabajo",
      paragraphs: [
        "Vantage Point es la plataforma que estamos construyendo para llevar el conocimiento entre programas — voz comunitaria, experiencia de campo y evidencia — para que el progreso en un área fortalezca a las demás.",
        "Está en una fase temprana, deliberadamente: un compromiso de aprender en abierto, desarrollada con las comunidades a las que sirve en lugar de anunciarse como un producto terminado.",
      ],
      learnMore: "Explorar Vantage Point",
    },
    about: { eyebrow: "Sobre Vantage", title: "Liderazgo local. Ventajas prácticas. Cambio duradero.", paragraphs: ["Fundada en diciembre de 2020, Vantage Foundation Uganda es una organización sin fines de lucro dirigida por jóvenes que responde a las barreras que impiden el acceso a la atención médica esencial, conocimientos financieros prácticos, agua limpia y apoyo digno para los hogares.", "Trabajamos con jóvenes, familias y comunidades vulnerables en distritos rurales y asentamientos urbanos informales. La participación comunitaria y el liderazgo juvenil dan forma a cómo se diseña y se entrega cada programa."], cta: "Lee nuestra historia", imageAlt: "Jóvenes ugandeses participando en una actividad de aprendizaje comunitario de Vantage Foundation" },
    stories: { eyebrow: "Historias y perspectivas", title: "Voces e ideas de nuestra comunidad", description: "Reflexiones, investigaciones y actualizaciones de programas de los jóvenes, voluntarios y líderes que dan forma a nuestro trabajo.", cta: "Leer Historias y perspectivas", read: "Leer la historia", support: "Apoyar este trabajo", featuredEyebrow: "Una voz de nuestra comunidad", moreStories: "Más historias y perspectivas" },
    accountability: {
      eyebrow: "Rendición de cuentas",
      title: "La confianza se construye a la vista",
      description: "Lo que publicamos, lo que aún se prepara y cómo contactarnos.",
      items: [
        { title: "Protección", description: "Cómo trabajamos para mantener seguros a los niños, jóvenes y adultos vulnerables en cada programa — y cómo plantear una inquietud.", href: "/safeguarding" },
        { title: "Privacidad y consentimiento", description: "Cómo se tratan los datos personales y cómo las fotografías y las historias solo se usan con consentimiento.", href: "/privacy" },
        { title: "Estado de los informes", description: "Los informes anuales y financieros se publican una vez aprobados: no presentamos documentos sin terminar como evidencia.", href: "/reports-and-accountability" },
        { title: "Gobernanza", description: "Nuestro liderazgo publicado y las estructuras de rendición de cuentas que estamos formalizando al crecer.", href: "/about-us#governance" },
      ],
      learnMore: "Más información",
      closing: "¿Una pregunta, una inquietud o una solicitud de información?",
      contactCta: "Contáctanos",
    },
    instagram: { title: "Popular en Instagram", description: "Descubre las historias, programas y momentos comunitarios que llegan a más personas.", follow: "Sigue a Vantage Foundation Uganda en Instagram", postsLabel: "Publicaciones populares de Instagram" },
    partners: { eyebrow: "Socios", title: "Relaciones verificadas", description: "Cada relación se describe con precisión para que un servicio bancario, contribución en especie o colaboración de programa nunca se exagere." },
    flagship: { eyebrow: "Proyectos insignia", title: "Donde el modelo está más avanzado", description: "Los proyectos que mejor muestran cómo es, en la práctica, trabajar sobre necesidades conectadas.", location: "Ubicación", timeline: "Cronograma", beneficiaries: "Beneficiarios", funding: "Financiamiento", read: "Leer la historia completa", support: "Apoyar este proyecto", viewAll: "Ver todos los proyectos" },
  },
  ar: {
    trust: ["تقودها الشباب منذ ديسمبر 2020", "مقرها في أوغندا", "مكاتب في جينجا وإيشاكا", "تركيزها على المجتمع"],
    impact: { eyebrow: "التأثير", title: "أدلة ضمن سياقها", description: "كل رقم رئيسي مرتبط بالبرنامج والمكان وفترة الإبلاغ وطريقة العد التي تقف وراءه.", note: "هذه أرقام فريق البرنامج ولا تُعرض على أنها نتائج مدققة بشكل مستقل. سيتم ربط التقارير العامة الداعمة بمجرد الموافقة على نشرها.", cta: "استكشف تأثيرنا" },
    problem: {
      eyebrow: "التحدي",
      title: "العوائق لا تأتي فرادى",
      lead: "في المجتمعات التي نخدمها، صحة الشاب وتعليمه ودخله وسلامته ووصوله إلى الأساسيات كالمياه النظيفة ليست قضايا منفصلة — بل يشكّل كل منها الآخر.",
      chain: [
        "مشكلة صحية قد تُبقي طفلًا خارج المدرسة.",
        "تعليم متقطع قد يتحول إلى فجوة اقتصادية.",
        "الهشاشة الاقتصادية قد تعرض السلامة والكرامة للخطر.",
        "ضعف الوصول إلى الخدمات الأساسية يفاقم كل ذلك.",
      ],
      closing: "لهذا تعمل Vantage عبر المحددات المترابطة للرفاه والفرص — ولهذا يُصمَّم كل برنامج مع المجتمع الذي يخدمه.",
    },
    pathway: {
      eyebrow: "كيف يحدث التغيير",
      title: "من الإصغاء إلى ميزة دائمة",
      steps: [
        { title: "نصغي ونفهم", description: "يبدأ كل برنامج مما يخبرنا به الشباب والمجتمعات عن احتياجاتهم." },
        { title: "نعمل مع المجتمعات", description: "يُصمَّم العمل ويُنفَّذ مع الأشخاص الذين يخدمهم — لا نيابةً عنهم." },
        { title: "نعزز الوصول والقدرات", description: "يبني كل مشروع شيئًا دائمًا: نقطة مياه، أو مهارة، أو شبكة، أو بيئة أكثر أمانًا." },
        { title: "نتعلم ونكيّف", description: "نسجل ما ينجح، ونوضح حالة كل رقم ننشره، ثم نعدّل." },
        { title: "نحسّن النتائج", description: "تتراكم المزايا — المياه النظيفة تحرر وقتًا للمدرسة، والإرشاد يبني الثقة لاستغلاله." },
      ],
      cta: "شاهد كيف نقيس التأثير",
    },
    vantagePoint: {
      eyebrow: "Vantage Point",
      title: "حيث يربط التعلم العمل ببعضه",
      paragraphs: [
        "Vantage Point هي المنصة التي نبنيها لنقل المعرفة بين البرامج — صوت المجتمع وخبرة الميدان والأدلة — بحيث يعزز التقدم في مجال ما المجالات الأخرى.",
        "وهي في بدايتها عن قصد: التزام بالتعلم بشفافية، تُطوَّر مع المجتمعات التي تخدمها بدل أن تُعلن كمنتج مكتمل.",
      ],
      learnMore: "استكشف Vantage Point",
    },
    about: { eyebrow: "حول Vantage", title: "قيادة محلية. مزايا عملية. تغيير دائم.", paragraphs: ["تأسست Vantage Foundation Uganda في ديسمبر 2020، وهي منظمة غير ربحية يقودها الشباب تستجيب للحواجز التي تحول دون حصول الناس على الرعاية الصحية الأساسية، والمعرفة المالية العملية، والمياه النظيفة، والدعم الكريم للأسر.", "نعمل مع الشباب والعائلات والمجتمعات الضعيفة في المناطق الريفية والتجمعات الحضرية العشوائية. تؤدي مشاركة المجتمع وقيادة الشباب إلى تحديد كيفية تصميم كل برنامج وتنفيذه."], cta: "اقرأ قصتنا", imageAlt: "شباب أوغندا يشاركون في نشاط تعلم مجتمعي من Vantage Foundation" },
    stories: { eyebrow: "القصص والرؤى", title: "أصوات وأفكار من مجتمعنا", description: "تأملات وأبحاث وتحديثات برامج من الشباب والمتطوعين والقادة الذين يشكلون عملنا.", cta: "اقرأ القصص والرؤى", read: "اقرأ القصة", support: "ادعم هذا العمل", featuredEyebrow: "صوت من مجتمعنا", moreStories: "المزيد من القصص والرؤى" },
    accountability: {
      eyebrow: "المساءلة",
      title: "الثقة تُبنى في العلن",
      description: "ما ننشره، وما لا يزال قيد الإعداد، وكيفية الوصول إلينا.",
      items: [
        { title: "الحماية", description: "كيف نعمل على حماية الأطفال والشباب والبالغين المستضعفين في كل برنامج — وكيفية الإبلاغ عن قلق.", href: "/safeguarding" },
        { title: "الخصوصية والموافقة", description: "كيف تُعالج البيانات الشخصية، وكيف تُستخدم الصور والقصص بموافقة فقط.", href: "/privacy" },
        { title: "حالة التقارير", description: "تُنشر التقارير السنوية والمالية بعد اعتمادها — فلا نقدم وثائق غير مكتملة على أنها أدلة.", href: "/reports-and-accountability" },
        { title: "الحوكمة", description: "قيادتنا المنشورة وهياكل المساءلة التي نعمل على إضفاء الطابع الرسمي عليها مع نمونا.", href: "/about-us#governance" },
      ],
      learnMore: "اعرف المزيد",
      closing: "سؤال أو قلق أو طلب معلومات؟",
      contactCta: "تواصل معنا",
    },
    instagram: { title: "الأكثر شيوعًا على Instagram", description: "شاهد القصص والبرامج واللحظات المجتمعية التي تصل إلى أكبر عدد من الناس.", follow: "تابع Vantage Foundation Uganda على Instagram", postsLabel: "منشورات Instagram الأكثر شيوعًا" },
    partners: { eyebrow: "الشركاء", title: "علاقات موثقة", description: "يتم وصف كل علاقة بدقة حتى لا يتم المبالغة في أي خدمة مصرفية أو مساهمة عينية أو تعاون برنامجي." },
    flagship: { eyebrow: "المشاريع الرائدة", title: "حيث بلغ النموذج أبعد نقطة", description: "المشاريع التي تُظهر بأفضل شكل ما يعنيه العمل عبر احتياجات مترابطة على أرض الواقع.", location: "الموقع", timeline: "الجدول الزمني", beneficiaries: "المستفيدون", funding: "التمويل", read: "اقرأ القصة كاملة", support: "ادعم هذا المشروع", viewAll: "عرض جميع المشاريع" },
  },
};

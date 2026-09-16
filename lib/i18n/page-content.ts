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
      "Vantage Foundation Uganda is a youth-led organisation formalising its governance structures, safeguarding policies and financial reporting so that every donor, partner and community can trust how resources are used.",
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
      "Vantage Foundation Uganda ist eine von jungen Menschen geführte Organisation, die ihre Leitungsstrukturen, Schutzrichtlinien und die Finanzberichterstattung weiter formalisiert, damit Spendende, Partner und Gemeinschaften nachvollziehen können, wie Mittel eingesetzt werden.",
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
      "Vantage Foundation Uganda est une organisation dirigée par des jeunes qui formalise ses structures de gouvernance, ses politiques de protection et ses rapports financiers afin que chaque donateur, partenaire et communauté puisse suivre l’utilisation des ressources.",
      "Les rapports annuels, états financiers et rapports de projet seront publiés sur notre page Rapports et redevabilité.",
    ],
    imageAlt: "Vantage Foundation Uganda travaillant avec une communauté",
  },
  es: {
    intro: [
      "Vantage Foundation Uganda es una organización sin fines de lucro dirigida por jóvenes, establecida en diciembre de 2020. Nuestra historia se parece a la de muchos jóvenes: nuestras vidas comenzaron a pequeña escala, pero una sola chispa puede encender un cambio duradero. Somos un trabajo en progreso que sostiene una luz para quienes son más jóvenes que nosotros, porque podemos identificarnos con ellos, y a través de esto nos hemos convertido en agentes de cambio.",
      "Imaginamos medios de vida mejorados en comunidades de Uganda y África. Hoy, ayudamos a los jóvenes de Uganda a alcanzar su máximo potencial a través de la salud, la educación, la ayuda humanitaria y el agua, saneamiento e higiene.",
    ],
    mission: "Cambiar el mundo, una oportunidad a la vez.",
    vision: "Medios de vida mejorados en comunidades de Uganda y África Oriental.",
    values: ["Crecimiento", "Sostenibilidad", "Seguridad", "Inclusión"],
    beneficiaries: ["Jóvenes en zonas rurales", "Mujeres y niñas", "Niños y huérfanos", "Personas en distritos remotos y asentamientos urbanos informales"],
    approach: "Identificamos distritos y comunidades que las ONG internacionales más grandes suelen pasar por alto y fortalecemos el alcance de las redes de seguridad social existentes. Reconocemos que el desarrollo es secuencial: sin salud y nutrición, la educación no puede ser asimilada; sin educación, no se puede escapar de la pobreza.",
    governance: [
      "Vantage Foundation Uganda es una organización dirigida por jóvenes que está formalizando sus estructuras de gobernanza, políticas de protección e informes financieros para que cada donante, socio y comunidad pueda confiar en cómo se utilizan los recursos.",
      "Los informes anuales, estados financieros e informes de proyectos se publicarán en nuestra página de Informes y Rendición de Cuentas.",
    ],
    imageAlt: "Vantage Foundation Uganda trabajando con una comunidad",
  },
  ar: {
    intro: [
      "Vantage Foundation Uganda هي منظمة غير ربحية يقودها الشباب، تأسست في ديسمبر 2020. قصتنا تشبه قصة كثير من الشباب: حياتنا بدأت بشكل متواضع، ومع ذلك يمكن للشرارة الواحدة أن تشعل تغييرًا دائمًا. نحن مشروع قيد التقدم يحمل ضوءًا لمن هم أصغر منا لأننا نستطيع التعاطف معهم — ومن خلال ذلك أصبحنا صانعي تغيير.",
      "نحن نتطلع إلى تحسين سبل العيش في مجتمعات أوغندا وأفريقيا. اليوم، نساعد الشباب في أوغندا على تحقيق إمكاناتهم الكاملة من خلال الصحة والتعليم والإغاثة الإنسانية والمياه والصرف الصحي والنظافة.",
    ],
    mission: "تغيير العالم، ميزة واحدة في كل مرة.",
    vision: "تحسين سبل العيش في مجتمعات أوغندا وشرق أفريقيا.",
    values: ["النمو", "الاستدامة", "السلامة", "الشمول"],
    beneficiaries: ["الشباب في المناطق الريفية", "النساء والفتيات", "الأطفال والأيتام", "الأشخاص في المناطق النائية والتجمعات الحضرية العشوائية"],
    approach: "نحدد المناطق والمجتمعات التي تغفلها المنظمات غير الحكومية الدولية الكبرى غالبًا، ونعزز وصول شبكات الأمان الاجتماعي القائمة. ندرك أن التنمية متسلسلة: بلا صحة وتغذية، لا يمكن استيعاب التعليم؛ وبلا تعليم، لا يمكن الفرار من الفقر.",
    governance: [
      "Vantage Foundation Uganda منظمة يقودها الشباب تعمل على إضفاء الطابع الرسمي على هياكل الحوكمة وسياسات الحماية والإبلاغ المالي، بحيث يمكن لكل متبرع وشريك ومجتمع الوثوق بكيفية استخدام الموارد.",
      "سيتم نشر التقارير السنوية والبيانات المالية وتقارير المشاريع في صفحة التقارير والمساءلة الخاصة بنا.",
    ],
    imageAlt: "Vantage Foundation Uganda تعمل مع مجتمع",
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

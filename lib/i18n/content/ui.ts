import type { Locale } from "@/lib/i18n/config";

export interface UiContent {
  map: {
    eyebrow: string;
    title: string;
    description: string;
    filter: string;
    all: string;
    health: string;
    education: string;
    humanitarian: string;
    wash: string;
    activeProject: string;
    plannedProject: string;
    completedProject: string;
    areaReached: string;
    emptyState: string;
    districtsHeading: string;
    attribution: string;
    markersNote: string;
    mapAriaLabel: string;
    districtListAriaLabel: string;
    noProjectPage: string;
    majorLakes: string;
  };
  turnstile: {
    noscript: string;
  };
  instagram: {
    featured: string;
    popular: string;
    viewOnInstagram: string;
    mediaTypes: {
      IMAGE: string;
      VIDEO: string;
      REEL: string;
      CAROUSEL_ALBUM: string;
    };
  };
  loading: {
    ellipsis: string;
  };
  programmeNotFound: {
    title: string;
    description: string;
    cta: string;
  };
  contentTypes: {
    story: string;
    insight: string;
    report: string;
    update: string;
    guide: string;
  };
  contactChannel: {
    formLabel: string;
    emailLabel: string;
    contactFormLabel: string;
  };
  markdown: {
    swipeToCompare: string;
    scrollableTable: string;
  };
  newsletter: {
    careerAlerts: string;
  };
  guide: {
    careerAlertsEyebrow: string;
    careerAlertsTitle: string;
    careerAlertsDescription: string;
    helpKeepThisGuide: string;
    reportOpportunity: string;
    reportCorrection: string;
    roadmapEyebrow: string;
    roadmapHeading: string;
    quickStartEyebrow: string;
    next30Days: string;
    scholarshipsToDelay: string;
    fundedScholarships: string;
    ugandaOpportunities: string;
    africaOpportunities: string;
    costOfStudyingAbroad: string;
    buildYourSkills: string;
    careerPaths: string;
    yourRoadmap: string;
    buildTowardLaterDoors: string;
    opportunityBoard: string;
    notWorthApplying: string;
    faq: string;
    vantagePosition: string;
    verificationCorrections: string;
    jumpToSection: string;
    startHere: string;
    onThisPage: string;
    careerGuideSections: string;
    guideIntroduction: string;
    guideShortcuts: string;
    author: string;
    location: string;
    published: string;
    readingTime: string;
    lastVerified: string;
  };
  gallery: {
    viewPhoto: string;
    photoViewer: string;
    closePhotoViewer: string;
    previousPhoto: string;
    nextPhoto: string;
    empty: string;
  };
}

const uiEnglish: UiContent = {
  map: {
    eyebrow: "Where We Work",
    title: "Our Reach Across Uganda",
    description:
      "From urban centres to rural communities, we work where need meets opportunity. Select a district for details.",
    filter: "Filter:",
    all: "All",
    health: "Health",
    education: "Education",
    humanitarian: "Humanitarian",
    wash: "WASH",
    activeProject: "Active project",
    plannedProject: "Planned project",
    completedProject: "Completed project",
    areaReached: "Area reached",
    emptyState:
      "No districts with linked projects in this programme yet. Select \"All\" to see everywhere we work.",
    districtsHeading: "Districts we've reached",
    attribution: "Map uses Natural Earth 50m public-domain data.",
    markersNote:
      "Markers show real district administrative centres (WGS84) as the approximate programme location.",
    mapAriaLabel: "Uganda programme map",
    districtListAriaLabel: "District list",
    noProjectPage:
      "Programme activity reaches this area; no dedicated project page yet.",
    majorLakes: "Major lakes",
  },
  turnstile: {
    noscript:
      "This form uses a bot check that needs JavaScript. If you cannot enable it, please call or WhatsApp us instead.",
  },
  instagram: {
    featured: "Featured",
    popular: "Popular",
    viewOnInstagram: "View on Instagram",
    mediaTypes: {
      IMAGE: "photo",
      VIDEO: "video",
      REEL: "reel",
      CAROUSEL_ALBUM: "carousel",
    },
  },
  loading: {
    ellipsis: "…",
  },
  programmeNotFound: {
    title: "Programme not found",
    description:
      "The programme you are looking for could not be found. Please choose another area of work.",
    cta: "View all programmes",
  },
  contentTypes: {
    story: "Story",
    insight: "Insight",
    report: "Report",
    update: "Update",
    guide: "Guide",
  },
  contactChannel: {
    formLabel: "our contact form",
    emailLabel: "Email:",
    contactFormLabel: "Contact form:",
  },
  markdown: {
    swipeToCompare: "Swipe to compare",
    scrollableTable: "Scrollable comparison table",
  },
  newsletter: {
    careerAlerts: "Get career alerts",
  },
  guide: {
    careerAlertsEyebrow: "Do not miss the next opportunity",
    careerAlertsTitle: "Get verified Vantage career alerts",
    careerAlertsDescription:
      "Scholarships, research roles, internships, training opportunities and major updates for Ugandan health professionals.",
    helpKeepThisGuide: "Help keep this guide useful",
    reportOpportunity: "Report an opportunity",
    reportCorrection: "Report a correction",
    roadmapEyebrow: "Six realistic routes",
    roadmapHeading: "9. Pick the roadmap that fits you",
    quickStartEyebrow: "Start here",
    next30Days: "Your next 30 days",
    scholarshipsToDelay:
      "Three famous scholarships that may be wrong for your stage",
    fundedScholarships:
      "Four funded routes fresh graduates should prepare for",
    ugandaOpportunities:
      "Research jobs, internships and entry-level health opportunities in Uganda",
    africaOpportunities: "Africa is not the consolation prize",
    costOfStudyingAbroad: "Do not let cheap tuition mislead you",
    buildYourSkills: "Build skills that change your CV",
    careerPaths: "Choose a career ladder",
    yourRoadmap: "Pick the roadmap that fits you",
    buildTowardLaterDoors: "Build toward the doors that are not open yet",
    opportunityBoard: "Opportunity board: 14 August 2026",
    notWorthApplying: "Remove these from your list",
    faq: "Frequently asked questions",
    vantagePosition: "The Vantage position",
    verificationCorrections: "Verification and corrections",
    jumpToSection: "Jump to section",
    startHere: "Start here",
    onThisPage: "On this page",
    careerGuideSections: "Career guide sections",
    guideIntroduction: "Guide introduction",
    guideShortcuts: "Guide shortcuts",
    author: "Author",
    location: "Location",
    published: "Published",
    readingTime: "Reading time",
    lastVerified: "Last verified",
  },
  gallery: {
    viewPhoto: "View photo: {alt}",
    photoViewer: "Photo viewer",
    closePhotoViewer: "Close photo viewer",
    previousPhoto: "Previous photo",
    nextPhoto: "Next photo",
    empty: "No photos are available yet.",
  },
};

const uiGerman: UiContent = {
  map: {
    eyebrow: "Wo wir arbeiten",
    title: "Unsere Reichweite in Uganda",
    description:
      "Von städtischen Zentren bis hin zu ländlichen Gemeinschaften arbeiten wir dort, wo Not auf Möglichkeit trifft. Wählen Sie einen Distrikt für Details aus.",
    filter: "Filter:",
    all: "Alle",
    health: "Gesundheit",
    education: "Bildung",
    humanitarian: "Humanitäre Hilfe",
    wash: "WASH",
    activeProject: "Aktives Projekt",
    plannedProject: "Geplantes Projekt",
    completedProject: "Abgeschlossenes Projekt",
    areaReached: "Erreichte Region",
    emptyState:
      "Für dieses Programm sind noch keine verlinkten Distrikte vorhanden. Wählen Sie \"Alle\", um alle Orte zu sehen, an denen wir arbeiten.",
    districtsHeading: "Von uns erreichte Distrikte",
    attribution: "Karte basierend auf öffentlichen Natural Earth 50m-Daten.",
    markersNote:
      "Markierungen zeigen reale Distriktverwaltungszentren (WGS84) als ungefähre Programmstandorte.",
    mapAriaLabel: "Uganda-Programmkarte",
    districtListAriaLabel: "Distriktliste",
    noProjectPage:
      "Programmaktivität erreicht dieses Gebiet; es gibt noch keine eigene Projektseite.",
    majorLakes: "Große Seen",
  },
  turnstile: {
    noscript:
      "Dieses Formular verwendet einen Bot-Check, der JavaScript benötigt. Falls Sie JavaScript nicht aktivieren können, rufen Sie uns bitte an oder schreiben Sie uns per WhatsApp.",
  },
  instagram: {
    featured: "Highlights",
    popular: "Beliebt",
    viewOnInstagram: "Auf Instagram ansehen",
    mediaTypes: {
      IMAGE: "Foto",
      VIDEO: "Video",
      REEL: "Reel",
      CAROUSEL_ALBUM: "Carousel",
    },
  },
  loading: {
    ellipsis: "…",
  },
  programmeNotFound: {
    title: "Programm nicht gefunden",
    description:
      "Das gesuchte Programm konnte nicht gefunden werden. Bitte wählen Sie einen anderen Arbeitsbereich.",
    cta: "Alle Programme ansehen",
  },
  contentTypes: {
    story: "Erlebnis",
    insight: "Einblick",
    report: "Bericht",
    update: "Update",
    guide: "Leitfaden",
  },
  contactChannel: {
    formLabel: "unser Kontaktformular",
    emailLabel: "E-Mail:",
    contactFormLabel: "Kontaktformular:",
  },
  markdown: {
    swipeToCompare: "Zum Vergleichen wischen",
    scrollableTable: "Vergleichstabelle mit horizontalem Scrollen",
  },
  newsletter: {
    careerAlerts: "Karriere-Alerts erhalten",
  },
  guide: {
    careerAlertsEyebrow: "Verpassen Sie die nächste Möglichkeit nicht",
    careerAlertsTitle: "Verifizierte Karriere-Alerts von Vantage erhalten",
    careerAlertsDescription:
      "Stipendien, Forschungsstellen, Praktika, Weiterbildungsmöglichkeiten und wichtige Neuigkeiten für ugandische Gesundheitsfachkräfte.",
    helpKeepThisGuide: "Helfen Sie, diesen Guide nützlich zu halten",
    reportOpportunity: "Eine Möglichkeit melden",
    reportCorrection: "Eine Korrektur melden",
    roadmapEyebrow: "Sechs realistische Wege",
    roadmapHeading: "9. Wählen Sie den passenden Karriereweg",
    quickStartEyebrow: "Hier beginnen",
    next30Days: "Ihre nächsten 30 Tage",
    scholarshipsToDelay:
      "Drei berühmte Stipendien, die für Ihren Moment vielleicht nicht geeignet sind",
    fundedScholarships:
      "Vier finanzierte Wege, auf die sich Absolventen vorbereiten sollten",
    ugandaOpportunities:
      "Forschungsjobs, Praktika und Einstiegsmöglichkeiten im Gesundheitswesen in Uganda",
    africaOpportunities: "Afrika ist nicht der Trostpreis",
    costOfStudyingAbroad: "Lassen Sie sich nicht von billigen Studiengebühren blenden",
    buildYourSkills: "Fähigkeiten aufbauen, die Ihren Lebenslauf verändern",
    careerPaths: "Wählen Sie eine Karriereleiter",
    yourRoadmap: "Wählen Sie den passenden Karriereweg",
    buildTowardLaterDoors:
      "Bauen Sie auf Türen, die noch nicht geöffnet sind",
    opportunityBoard: "Möglichkeiten-Übersicht: 14. August 2026",
    notWorthApplying: "Entfernen Sie diese von Ihrer Liste",
    faq: "Häufig gestellte Fragen",
    vantagePosition: "Die Position von Vantage",
    verificationCorrections: "Verifizierung und Korrekturen",
    jumpToSection: "Zum Abschnitt springen",
    startHere: "Hier beginnen",
    onThisPage: "Auf dieser Seite",
    careerGuideSections: "Karriereleitfaden-Abschnitte",
    guideIntroduction: "Einleitung",
    guideShortcuts: "Guide-Shortcuts",
    author: "Autor",
    location: "Ort",
    published: "Veröffentlicht",
    readingTime: "Lesezeit",
    lastVerified: "Zuletzt geprüft",
  },
  gallery: {
    viewPhoto: "Foto ansehen: {alt}",
    photoViewer: "Fotobetrachter",
    closePhotoViewer: "Fotobetrachter schließen",
    previousPhoto: "Vorheriges Foto",
    nextPhoto: "Nächstes Foto",
    empty: "Noch keine Fotos verfügbar.",
  },
};

const uiFrench: UiContent = {
  map: {
    eyebrow: "Où nous travaillons",
    title: "Notre portée en Ouganda",
    description:
      "Des centres urbains aux communautés rurales, nous intervenons là où le besoin rencontre l'opportunité. Sélectionnez un district pour plus de détails.",
    filter: "Filtrer :",
    all: "Tous",
    health: "Santé",
    education: "Éducation",
    humanitarian: "Aide humanitaire",
    wash: "WASH",
    activeProject: "Projet actif",
    plannedProject: "Projet prévu",
    completedProject: "Projet achevé",
    areaReached: "Zone atteinte",
    emptyState:
      "Aucun district lié à ce programme pour l'instant. Sélectionnez \"Tous\" pour voir partout où nous travaillons.",
    districtsHeading: "Districts atteints",
    attribution:
      "Carte utilisant les données du domaine public Natural Earth 50m.",
    markersNote:
      "Les marqueurs indiquent les véritables centres administratifs des districts (WGS84) comme localisation approximative du programme.",
    mapAriaLabel: "Carte des programmes en Ouganda",
    districtListAriaLabel: "Liste des districts",
    noProjectPage:
      "L'activité du programme atteint cette zone; aucune page de projet dédiée pour l'instant.",
    majorLakes: "Grands lacs",
  },
  turnstile: {
    noscript:
      "Ce formulaire utilise une vérification anti-robot qui nécessite JavaScript. Si vous ne pouvez pas l'activer, veuillez nous appeler ou nous contacter par WhatsApp.",
  },
  instagram: {
    featured: "En vedette",
    popular: "Populaire",
    viewOnInstagram: "Voir sur Instagram",
    mediaTypes: {
      IMAGE: "photo",
      VIDEO: "vidéo",
      REEL: "reel",
      CAROUSEL_ALBUM: "carrousel",
    },
  },
  loading: {
    ellipsis: "…",
  },
  programmeNotFound: {
    title: "Programme introuvable",
    description:
      "Le programme recherché n'a pas pu être trouvé. Veuillez choisir un autre domaine d'action.",
    cta: "Voir tous les programmes",
  },
  contentTypes: {
    story: "Récit",
    insight: "Perspective",
    report: "Rapport",
    update: "Actualité",
    guide: "Guide",
  },
  contactChannel: {
    formLabel: "notre formulaire de contact",
    emailLabel: "E-mail :",
    contactFormLabel: "Formulaire de contact :",
  },
  markdown: {
    swipeToCompare: "Faites glisser pour comparer",
    scrollableTable: "Tableau comparatif défilable",
  },
  newsletter: {
    careerAlerts: "Recevoir les alertes carrière",
  },
  guide: {
    careerAlertsEyebrow: "Ne manquez pas la prochaine opportunité",
    careerAlertsTitle: "Recevoir les alertes carrière vérifiées de Vantage",
    careerAlertsDescription:
      "Bourses, postes de recherche, stages, opportunités de formation et grandes nouvelles pour les professionnels de santé ougandais.",
    helpKeepThisGuide: "Aidez-nous à garder ce guide utile",
    reportOpportunity: "Signaler une opportunité",
    reportCorrection: "Signaler une correction",
    roadmapEyebrow: "Six parcours réalistes",
    roadmapHeading: "9. Choisissez la feuille de route qui vous convient",
    quickStartEyebrow: "Commencer ici",
    next30Days: "Vos 30 prochains jours",
    scholarshipsToDelay:
      "Trois bourses célèbres qui pourraient ne pas convenir à votre stade",
    fundedScholarships:
      "Quatre parcours financés pour lesquels les jeunes diplômés doivent se préparer",
    ugandaOpportunities:
      "Emplois de recherche, stages et opportunités d'entrée dans la santé en Ouganda",
    africaOpportunities: "L'Afrique n'est pas le prix de consolation",
    costOfStudyingAbroad:
      "Ne vous laissez pas abuser par les frais de scolarité peu élevés",
    buildYourSkills: "Développez des compétences qui transforment votre CV",
    careerPaths: "Choisissez une échelle de carrière",
    yourRoadmap: "Choisissez la feuille de route qui vous convient",
    buildTowardLaterDoors:
      "Préparez les portes qui ne sont pas encore ouvertes",
    opportunityBoard: "Tableau des opportunités : 14 août 2026",
    notWorthApplying: "Retirez celles-ci de votre liste",
    faq: "Questions fréquentes",
    vantagePosition: "La position de Vantage",
    verificationCorrections: "Vérification et corrections",
    jumpToSection: "Aller à la section",
    startHere: "Commencer ici",
    onThisPage: "Sur cette page",
    careerGuideSections: "Sections du guide de carrière",
    guideIntroduction: "Introduction du guide",
    guideShortcuts: "Raccourcis du guide",
    author: "Auteur",
    location: "Lieu",
    published: "Publié",
    readingTime: "Temps de lecture",
    lastVerified: "Dernière vérification",
  },
  gallery: {
    viewPhoto: "Voir la photo : {alt}",
    photoViewer: "Visionneuse de photos",
    closePhotoViewer: "Fermer la visionneuse",
    previousPhoto: "Photo précédente",
    nextPhoto: "Photo suivante",
    empty: "Aucune photo n'est disponible pour le moment.",
  },
};

const uiSpanish: UiContent = {
  map: {
    eyebrow: 'Dónde trabajamos',
    title: 'Nuestro alcance en Uganda',
    description: 'Desde centros urbanos hasta comunidades rurales, trabajamos donde la necesidad se encuentra con la oportunidad. Seleccione un distrito para más detalles.',
    filter: 'Filtrar:',
    all: 'Todos',
    health: 'Salud',
    education: 'Educación',
    humanitarian: 'Ayuda humanitaria',
    wash: 'WASH',
    activeProject: 'Proyecto activo',
    plannedProject: 'Proyecto planificado',
    completedProject: 'Proyecto completado',
    areaReached: 'Área alcanzada',
    emptyState: 'Todavía no hay distritos con proyectos vinculados a este programa. Seleccione Todos para ver todos los lugares donde trabajamos.',
    districtsHeading: 'Distritos que hemos alcanzado',
    attribution: 'El mapa utiliza datos de dominio público Natural Earth 50m.',
    markersNote: 'Los marcadores muestran los verdaderos centros administrativos de los distritos (WGS84) como ubicación aproximada del programa.',
    mapAriaLabel: 'Mapa de programas de Uganda',
    districtListAriaLabel: 'Lista de distritos',
    noProjectPage: 'La actividad del programa llega a esta zona; aún no hay una página de proyecto dedicada.',
    majorLakes: 'Lagos principales',
  },
  turnstile: {
    noscript: 'Este formulario utiliza una verificación contra bots que necesita JavaScript. Si no puede activarlo, llámenos o escríbanos por WhatsApp.',
  },
  instagram: {
    featured: 'Destacado',
    popular: 'Popular',
    viewOnInstagram: 'Ver en Instagram',
    mediaTypes: {
      IMAGE: 'foto',
      VIDEO: 'video',
      REEL: 'reel',
      CAROUSEL_ALBUM: 'carrusel',
    },
  },
  loading: {
    ellipsis: '…',
  },
  programmeNotFound: {
    title: 'Programa no encontrado',
    description: 'No se ha podido encontrar el programa que busca. Elija otra área de trabajo.',
    cta: 'Ver todos los programas',
  },
  contentTypes: {
    story: 'Historia',
    insight: 'Análisis',
    report: 'Informe',
    update: 'Actualización',
    guide: 'Guía',
  },
  contactChannel: {
    formLabel: 'nuestro formulario de contacto',
    emailLabel: 'Correo electrónico:',
    contactFormLabel: 'Formulario de contacto:',
  },
  markdown: {
    swipeToCompare: 'Deslizar para comparar',
    scrollableTable: 'Tabla de comparación desplazable',
  },
  newsletter: {
    careerAlerts: 'Recibir alertas de carrera',
  },
  guide: {
    careerAlertsEyebrow: 'No se pierda la próxima oportunidad',
    careerAlertsTitle: 'Reciba alertas profesionales verificadas de Vantage',
    careerAlertsDescription: 'Becas, puestos de investigación, prácticas, oportunidades de formación y noticias importantes para profesionales de la salud ugandeses.',
    helpKeepThisGuide: 'Ayude a mantener útil esta guía',
    reportOpportunity: 'Informar sobre una oportunidad',
    reportCorrection: 'Informar sobre una corrección',
    roadmapEyebrow: 'Seis rutas realistas',
    roadmapHeading: '9. Elija la hoja de ruta que más le convenga',
    quickStartEyebrow: 'Empiece aquí',
    next30Days: 'Sus próximos 30 días',
    scholarshipsToDelay: 'Tres becas famosas que pueden no ser adecuadas para su etapa',
    fundedScholarships: 'Cuatro rutas financiadas para las que los recién graduados deberían prepararse',
    ugandaOpportunities: 'Empleos de investigación, prácticas y oportunidades sanitarias de nivel de entrada en Uganda',
    africaOpportunities: 'África no es el premio de consolación',
    costOfStudyingAbroad: 'No deje que la matrícula barata le engañe',
    buildYourSkills: 'Desarrolle habilidades que transformen su CV',
    careerPaths: 'Elija una escalera profesional',
    yourRoadmap: 'Elija la hoja de ruta que más le convenga',
    buildTowardLaterDoors: 'Construya hacia las puertas que aún no están abiertas',
    opportunityBoard: 'Tablero de oportunidades: 14 de agosto de 2026',
    notWorthApplying: 'Elimine estas de su lista',
    faq: 'Preguntas frecuentes',
    vantagePosition: 'La posición de Vantage',
    verificationCorrections: 'Verificación y correcciones',
    jumpToSection: 'Saltar a la sección',
    startHere: 'Empiece aquí',
    onThisPage: 'En esta página',
    careerGuideSections: 'Secciones de la guía profesional',
    guideIntroduction: 'Introducción a la guía',
    guideShortcuts: 'Accesos directos de la guía',
    author: 'Autor',
    location: 'Ubicación',
    published: 'Publicado',
    readingTime: 'Tiempo de lectura',
    lastVerified: 'Última verificación',
  },
  gallery: {
    viewPhoto: 'Ver foto: {alt}',
    photoViewer: 'Visor de fotos',
    closePhotoViewer: 'Cerrar visor de fotos',
    previousPhoto: 'Foto anterior',
    nextPhoto: 'Foto siguiente',
    empty: 'Aún no hay fotos disponibles.',
  },
};

const uiArabic: UiContent = {
  map: {
    eyebrow: 'أين نعمل',
    title: 'مدى انتشارنا في أوغندا',
    description: 'من المراكز الحضرية إلى المجتمعات الريفية، نعمل حيث يلتقي الحاجة بالفرصة. اختر مقاطعة للاطلاع على التفاصيل.',
    filter: 'تصفية:',
    all: 'الكل',
    health: 'الصحة',
    education: 'التعليم',
    humanitarian: 'العمل الإنساني',
    wash: 'WASH',
    activeProject: 'مشروع نشط',
    plannedProject: 'مشروع مخطط له',
    completedProject: 'مشروع منجز',
    areaReached: 'المنطقة المستهدفة',
    emptyState: 'لا توجد مقاطعات مرتبطة بمشاريع في هذا البرنامج بعد. اختر الكل لرؤية كل مكان نعمل فيه.',
    districtsHeading: 'المقاطعات التي وصلنا إليها',
    attribution: 'تستخدم الخريطة بيانات Natural Earth 50m في المجال العام.',
    markersNote: 'تُظهر العلامات المراكز الإدارية الفعلية للمقاطعات (WGS84) كموقع تقريبي للبرنامج.',
    mapAriaLabel: 'خريطة برامج أوغندا',
    districtListAriaLabel: 'قائمة المقاطعات',
    noProjectPage: 'يصل نشاط البرنامج إلى هذه المنطقة؛ لا توجد صفحة مشروع مخصصة بعد.',
    majorLakes: 'البحيرات الرئيسية',
  },
  turnstile: {
    noscript: 'يستخدم هذا النموذج فحصًا آليًا لمكافحة الروبوتات يتطلب JavaScript. إذا لم تتمكن من تمكينه، فيرجى الاتصال بنا أو مراسلتنا عبر WhatsApp.',
  },
  instagram: {
    featured: 'مميز',
    popular: 'الأكثر شيوعاً',
    viewOnInstagram: 'عرض على Instagram',
    mediaTypes: {
      IMAGE: 'صورة',
      VIDEO: 'فيديو',
      REEL: 'ريل',
      CAROUSEL_ALBUM: 'كاروسيل',
    },
  },
  loading: {
    ellipsis: '…',
  },
  programmeNotFound: {
    title: 'البرنامج غير موجود',
    description: 'تعذر العثور على البرنامج الذي تبحث عنه. يرجى اختيار مجال عمل آخر.',
    cta: 'عرض جميع البرامج',
  },
  contentTypes: {
    story: 'قصة',
    insight: 'تحليل',
    report: 'تقرير',
    update: 'تحديث',
    guide: 'دليل',
  },
  contactChannel: {
    formLabel: 'نموذج الاتصال الخاص بنا',
    emailLabel: 'البريد الإلكتروني:',
    contactFormLabel: 'نموذج الاتصال:',
  },
  markdown: {
    swipeToCompare: 'اسحب للمقارنة',
    scrollableTable: 'جدول مقارنة قابل للتمرير',
  },
  newsletter: {
    careerAlerts: 'احصل على تنبيهات مهنية',
  },
  guide: {
    careerAlertsEyebrow: 'لا تفوّت الفرصة القادمة',
    careerAlertsTitle: 'احصل على تنبيهات مهنية موثوقة من Vantage',
    careerAlertsDescription: 'منح دراسية، ومناصب بحثية، وتدريبات مهنية، وفرص تدريب، وتحديثات مهمة لمهنيي الصحة في أوغندا.',
    helpKeepThisGuide: 'ساعد في الحفاظ على فائدة هذا الدليل',
    reportOpportunity: 'أبلغ عن فرصة',
    reportCorrection: 'أبلغ عن تصحيح',
    roadmapEyebrow: 'ست مسارات واقعية',
    roadmapHeading: '9. اختر خارطة الطريق التي تناسبك',
    quickStartEyebrow: 'ابدأ هنا',
    next30Days: 'الثلاثون يومًا القادمة',
    scholarshipsToDelay: 'ثلاث منح دراسية مشهورة قد لا تناسب مرحلتك',
    fundedScholarships: 'أربع مسارات ممولة يجب على الخريجين الجدد الاستعداد لها',
    ugandaOpportunities: 'وظائف بحثية، وتدريبات مهنية، وفرص صحية للمبتدئين في أوغندا',
    africaOpportunities: 'إفريقيا ليست جائزة عزاء',
    costOfStudyingAbroad: 'لا تدع الرسوم الدراسية الرخيصة تخدعك',
    buildYourSkills: 'ابنِ مهارات تُحدث فرقًا في سيرتك الذاتية',
    careerPaths: 'اختر سلم مهني',
    yourRoadmap: 'اختر خارطة الطريق التي تناسبك',
    buildTowardLaterDoors: 'ابنِ نفسك للأبواب التي لم تُفتح بعد',
    opportunityBoard: 'لوحة الفرص: 14 أغسطس 2026',
    notWorthApplying: 'احذف هذه من قائمتك',
    faq: 'الأسئلة الشائعة',
    vantagePosition: 'موقف Vantage',
    verificationCorrections: 'التحقق والتصحيحات',
    jumpToSection: 'انتقل إلى القسم',
    startHere: 'ابدأ من هنا',
    onThisPage: 'في هذه الصفحة',
    careerGuideSections: 'أقسام دليل المسار المهني',
    guideIntroduction: 'مقدمة الدليل',
    guideShortcuts: 'اختصارات الدليل',
    author: 'المؤلف',
    location: 'الموقع',
    published: 'تاريخ النشر',
    readingTime: 'مدة القراءة',
    lastVerified: 'آخر تحقق',
  },
  gallery: {
    viewPhoto: 'عرض الصورة: {alt}',
    photoViewer: 'عارض الصور',
    closePhotoViewer: 'إغلاق عارض الصور',
    previousPhoto: 'الصورة السابقة',
    nextPhoto: 'الصورة التالية',
    empty: 'لا توجد صور متاحة بعد.',
  },
};

export const uiContent: Record<Locale, UiContent> = {
  en: uiEnglish,
  de: uiGerman,
  fr: uiFrench,
  es: uiSpanish,
  ar: uiArabic,
};

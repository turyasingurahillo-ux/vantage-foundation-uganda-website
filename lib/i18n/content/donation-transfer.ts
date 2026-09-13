import type { Locale } from "@/lib/i18n/config";
import type { DonationTransferMethod } from "@/lib/donation-transfer";

type TransferMethodCopy = {
  label: string;
  description: string;
};

type DonationTransferCopy = {
  formLegend: string;
  formHelp: string;
  referenceLabel: string;
  referenceHelp: string;
  providerReferencePlaceholder: string;
  methods: Record<DonationTransferMethod, TransferMethodCopy>;
  sectionEyebrow: string;
  sectionTitle: string;
  sectionDescription: string;
  directTitle: string;
  directDescription: string;
  remitlyTitle: string;
  remitlyDescription: string;
  worldRemitTitle: string;
  worldRemitDescription: string;
  beneficiaryHeading: string;
  bankLabel: string;
  accountNameLabel: string;
  accountNumberLabel: string;
  swiftLabel: string;
  openProvider: string;
  availabilityNote: string;
  thirdPartyNote: string;
  successTitle: string;
  successReferenceIntro: string;
  successReferenceHelp: string;
};

export const donationTransferCopy: Record<Locale, DonationTransferCopy> = {
  en: {
    formLegend: "How will you send the funds?",
    formHelp:
      "All three routes settle to Vantage Foundation Uganda's official Housing Finance Bank account and remain pending until verified.",
    referenceLabel: "Vantage donation reference",
    referenceHelp:
      "Keep this reference. It helps us match your donation intent to the incoming transfer; it is not proof of payment.",
    providerReferencePlaceholder: "Remitly / WorldRemit transfer reference",
    methods: {
      bank: {
        label: "Direct bank transfer",
        description: "Send directly to our Housing Finance Bank account.",
      },
      remitly: {
        label: "Remitly",
        description:
          "Use Remitly bank deposit to Housing Finance Bank where available for your sender country.",
      },
      worldremit: {
        label: "WorldRemit",
        description:
          "Use WorldRemit bank transfer to Uganda where available for your sender country.",
      },
    },
    sectionEyebrow: "International giving",
    sectionTitle: "Send to Vantage from outside Uganda",
    sectionDescription:
      "Whichever route you choose, the beneficiary remains Vantage Foundation Uganda Limited at Housing Finance Bank. Select a route that is available and permitted in your sending country.",
    directTitle: "Direct international bank transfer",
    directDescription:
      "Use your bank's international transfer service and the SWIFT details below.",
    remitlyTitle: "Remitly bank deposit",
    remitlyDescription:
      "In Remitly, choose Uganda, select Bank deposit, then choose Housing Finance Bank (HFB) and enter the beneficiary details below. Availability, limits and permitted uses vary by sender country.",
    worldRemitTitle: "WorldRemit bank transfer",
    worldRemitDescription:
      "In WorldRemit, choose Uganda and Bank transfer. If Housing Finance Bank is offered for your sending route, enter the beneficiary details below; otherwise use direct bank transfer.",
    beneficiaryHeading: "Verified beneficiary details",
    bankLabel: "Bank",
    accountNameLabel: "Account name",
    accountNumberLabel: "Account number",
    swiftLabel: "SWIFT/BIC",
    openProvider: "Open official provider",
    availabilityNote:
      "Provider availability, exchange rates, fees, limits and transfer rules depend on the sender's country and are shown by the provider before sending.",
    thirdPartyNote:
      "Remitly and WorldRemit are third-party transfer services. Listing them here does not imply a sponsorship or partnership with Vantage Foundation Uganda.",
    successTitle: "Donation intent recorded",
    successReferenceIntro: "Your Vantage reference is",
    successReferenceHelp:
      "Keep it with your transfer details. Your donation remains pending until Vantage verifies receipt in the official bank account.",
  },
  de: {
    formLegend: "Wie werden Sie die Mittel senden?",
    formHelp:
      "Alle drei Wege führen auf das offizielle Konto der Vantage Foundation Uganda bei der Housing Finance Bank und bleiben bis zur Prüfung ausstehend.",
    referenceLabel: "Vantage-Spendenreferenz",
    referenceHelp:
      "Bewahren Sie diese Referenz auf. Sie hilft uns, Ihre Spendenabsicht dem eingehenden Transfer zuzuordnen; sie ist kein Zahlungsnachweis.",
    providerReferencePlaceholder: "Remitly-/WorldRemit-Transferreferenz",
    methods: {
      bank: {
        label: "Direkte Banküberweisung",
        description: "Direkt auf unser Konto bei der Housing Finance Bank senden.",
      },
      remitly: {
        label: "Remitly",
        description:
          "Soweit in Ihrem Sendeland verfügbar, per Remitly-Bankeinzahlung an die Housing Finance Bank senden.",
      },
      worldremit: {
        label: "WorldRemit",
        description:
          "Soweit in Ihrem Sendeland verfügbar, per WorldRemit-Banküberweisung nach Uganda senden.",
      },
    },
    sectionEyebrow: "International spenden",
    sectionTitle: "Vantage aus dem Ausland unterstützen",
    sectionDescription:
      "Unabhängig vom gewählten Weg bleibt der Empfänger Vantage Foundation Uganda Limited bei der Housing Finance Bank. Nutzen Sie einen in Ihrem Sendeland verfügbaren und zulässigen Weg.",
    directTitle: "Direkte internationale Banküberweisung",
    directDescription:
      "Nutzen Sie den internationalen Überweisungsdienst Ihrer Bank und die untenstehenden SWIFT-Daten.",
    remitlyTitle: "Remitly-Bankeinzahlung",
    remitlyDescription:
      "Wählen Sie in Remitly Uganda, dann Bank deposit und Housing Finance Bank (HFB), und geben Sie die untenstehenden Empfängerdaten ein. Verfügbarkeit, Limits und zulässige Zwecke unterscheiden sich je nach Sendeland.",
    worldRemitTitle: "WorldRemit-Banküberweisung",
    worldRemitDescription:
      "Wählen Sie in WorldRemit Uganda und Bank transfer. Wenn Housing Finance Bank für Ihre Senderoute angeboten wird, verwenden Sie die untenstehenden Empfängerdaten; andernfalls nutzen Sie die direkte Banküberweisung.",
    beneficiaryHeading: "Geprüfte Empfängerdaten",
    bankLabel: "Bank",
    accountNameLabel: "Kontoname",
    accountNumberLabel: "Kontonummer",
    swiftLabel: "SWIFT/BIC",
    openProvider: "Offiziellen Anbieter öffnen",
    availabilityNote:
      "Verfügbarkeit, Wechselkurse, Gebühren, Limits und Transferregeln hängen vom Sendeland ab und werden vom Anbieter vor dem Senden angezeigt.",
    thirdPartyNote:
      "Remitly und WorldRemit sind externe Transferdienste. Ihre Nennung bedeutet keine Förderung oder Partnerschaft mit Vantage Foundation Uganda.",
    successTitle: "Spendenabsicht erfasst",
    successReferenceIntro: "Ihre Vantage-Referenz lautet",
    successReferenceHelp:
      "Bewahren Sie sie zusammen mit Ihren Transferdaten auf. Die Spende bleibt ausstehend, bis Vantage den Eingang auf dem offiziellen Bankkonto bestätigt hat.",
  },
  fr: {
    formLegend: "Comment allez-vous envoyer les fonds ?",
    formHelp:
      "Les trois voies aboutissent au compte officiel de Vantage Foundation Uganda à Housing Finance Bank et restent en attente jusqu'à vérification.",
    referenceLabel: "Référence de don Vantage",
    referenceHelp:
      "Conservez cette référence. Elle nous aide à rapprocher votre intention de don du transfert reçu ; elle ne constitue pas une preuve de paiement.",
    providerReferencePlaceholder: "Référence du transfert Remitly / WorldRemit",
    methods: {
      bank: {
        label: "Virement bancaire direct",
        description: "Envoyez directement sur notre compte Housing Finance Bank.",
      },
      remitly: {
        label: "Remitly",
        description:
          "Utilisez le dépôt bancaire Remitly vers Housing Finance Bank lorsqu'il est disponible depuis votre pays d'envoi.",
      },
      worldremit: {
        label: "WorldRemit",
        description:
          "Utilisez le virement bancaire WorldRemit vers l'Ouganda lorsqu'il est disponible depuis votre pays d'envoi.",
      },
    },
    sectionEyebrow: "Dons internationaux",
    sectionTitle: "Soutenir Vantage depuis l'étranger",
    sectionDescription:
      "Quel que soit le moyen choisi, le bénéficiaire reste Vantage Foundation Uganda Limited auprès de Housing Finance Bank. Choisissez une voie disponible et autorisée dans votre pays d'envoi.",
    directTitle: "Virement bancaire international direct",
    directDescription:
      "Utilisez le service de virement international de votre banque avec les coordonnées SWIFT ci-dessous.",
    remitlyTitle: "Dépôt bancaire Remitly",
    remitlyDescription:
      "Dans Remitly, choisissez l'Ouganda, Bank deposit, puis Housing Finance Bank (HFB), et saisissez les coordonnées du bénéficiaire ci-dessous. La disponibilité, les limites et les usages autorisés varient selon le pays d'envoi.",
    worldRemitTitle: "Virement bancaire WorldRemit",
    worldRemitDescription:
      "Dans WorldRemit, choisissez l'Ouganda et Bank transfer. Si Housing Finance Bank est proposée pour votre trajet d'envoi, saisissez les coordonnées ci-dessous ; sinon, utilisez le virement bancaire direct.",
    beneficiaryHeading: "Coordonnées du bénéficiaire vérifiées",
    bankLabel: "Banque",
    accountNameLabel: "Nom du compte",
    accountNumberLabel: "Numéro de compte",
    swiftLabel: "SWIFT/BIC",
    openProvider: "Ouvrir le fournisseur officiel",
    availabilityNote:
      "La disponibilité, les taux de change, les frais, les plafonds et les règles de transfert dépendent du pays d'envoi et sont affichés par le fournisseur avant l'envoi.",
    thirdPartyNote:
      "Remitly et WorldRemit sont des services de transfert tiers. Leur mention ici n'implique ni parrainage ni partenariat avec Vantage Foundation Uganda.",
    successTitle: "Intention de don enregistrée",
    successReferenceIntro: "Votre référence Vantage est",
    successReferenceHelp:
      "Conservez-la avec les détails du transfert. Votre don reste en attente jusqu'à ce que Vantage confirme sa réception sur le compte bancaire officiel.",
  },
  es: {
    formLegend: "¿Cómo enviará los fondos?",
    formHelp:
      "Las tres vías llegan a la cuenta oficial de Vantage Foundation Uganda en Housing Finance Bank y permanecen pendientes hasta su verificación.",
    referenceLabel: "Referencia de donación de Vantage",
    referenceHelp:
      "Conserve esta referencia. Nos ayuda a relacionar su intención de donación con la transferencia recibida; no es una prueba de pago.",
    providerReferencePlaceholder: "Referencia de transferencia de Remitly / WorldRemit",
    methods: {
      bank: {
        label: "Transferencia bancaria directa",
        description: "Envíe directamente a nuestra cuenta de Housing Finance Bank.",
      },
      remitly: {
        label: "Remitly",
        description:
          "Use el depósito bancario de Remitly a Housing Finance Bank cuando esté disponible desde su país de envío.",
      },
      worldremit: {
        label: "WorldRemit",
        description:
          "Use la transferencia bancaria de WorldRemit a Uganda cuando esté disponible desde su país de envío.",
      },
    },
    sectionEyebrow: "Donaciones internacionales",
    sectionTitle: "Apoye a Vantage desde fuera de Uganda",
    sectionDescription:
      "Elija la vía que elija, el beneficiario sigue siendo Vantage Foundation Uganda Limited en Housing Finance Bank. Use una vía disponible y permitida en su país de envío.",
    directTitle: "Transferencia bancaria internacional directa",
    directDescription:
      "Use el servicio de transferencia internacional de su banco con los datos SWIFT que figuran abajo.",
    remitlyTitle: "Depósito bancario con Remitly",
    remitlyDescription:
      "En Remitly, elija Uganda, Bank deposit y luego Housing Finance Bank (HFB), e introduzca los datos del beneficiario que figuran abajo. La disponibilidad, los límites y los usos permitidos varían según el país de envío.",
    worldRemitTitle: "Transferencia bancaria con WorldRemit",
    worldRemitDescription:
      "En WorldRemit, elija Uganda y Bank transfer. Si Housing Finance Bank está disponible para su ruta de envío, introduzca los datos del beneficiario; de lo contrario, use la transferencia bancaria directa.",
    beneficiaryHeading: "Datos verificados del beneficiario",
    bankLabel: "Banco",
    accountNameLabel: "Nombre de la cuenta",
    accountNumberLabel: "Número de cuenta",
    swiftLabel: "SWIFT/BIC",
    openProvider: "Abrir proveedor oficial",
    availabilityNote:
      "La disponibilidad, los tipos de cambio, las comisiones, los límites y las reglas dependen del país de envío y el proveedor los muestra antes de enviar.",
    thirdPartyNote:
      "Remitly y WorldRemit son servicios de transferencia de terceros. Su inclusión aquí no implica patrocinio ni asociación con Vantage Foundation Uganda.",
    successTitle: "Intención de donación registrada",
    successReferenceIntro: "Su referencia de Vantage es",
    successReferenceHelp:
      "Consérvela junto con los datos de su transferencia. La donación seguirá pendiente hasta que Vantage confirme la recepción en la cuenta bancaria oficial.",
  },
  ar: {
    formLegend: "كيف سترسل الأموال؟",
    formHelp:
      "تصل الطرق الثلاثة إلى الحساب الرسمي لمؤسسة فانتج أوغندا في Housing Finance Bank وتظل معلقة حتى يتم التحقق منها.",
    referenceLabel: "مرجع تبرع فانتج",
    referenceHelp:
      "احتفظ بهذا المرجع. يساعدنا على مطابقة نية التبرع مع التحويل الوارد، لكنه ليس إثباتاً للدفع.",
    providerReferencePlaceholder: "مرجع تحويل Remitly / WorldRemit",
    methods: {
      bank: {
        label: "تحويل مصرفي مباشر",
        description: "أرسل مباشرة إلى حسابنا في Housing Finance Bank.",
      },
      remitly: {
        label: "Remitly",
        description:
          "استخدم الإيداع المصرفي عبر Remitly إلى Housing Finance Bank عندما يكون متاحاً من بلد الإرسال.",
      },
      worldremit: {
        label: "WorldRemit",
        description:
          "استخدم التحويل المصرفي عبر WorldRemit إلى أوغندا عندما يكون متاحاً من بلد الإرسال.",
      },
    },
    sectionEyebrow: "التبرع الدولي",
    sectionTitle: "ادعم فانتج من خارج أوغندا",
    sectionDescription:
      "مهما كانت الطريقة التي تختارها، يظل المستفيد Vantage Foundation Uganda Limited لدى Housing Finance Bank. اختر طريقة متاحة ومسموحاً بها في بلد الإرسال.",
    directTitle: "تحويل مصرفي دولي مباشر",
    directDescription:
      "استخدم خدمة التحويل الدولي لدى مصرفك وبيانات SWIFT أدناه.",
    remitlyTitle: "إيداع مصرفي عبر Remitly",
    remitlyDescription:
      "في Remitly اختر أوغندا، ثم Bank deposit، ثم Housing Finance Bank (HFB)، وأدخل بيانات المستفيد أدناه. تختلف الإتاحة والحدود والاستخدامات المسموح بها حسب بلد الإرسال.",
    worldRemitTitle: "تحويل مصرفي عبر WorldRemit",
    worldRemitDescription:
      "في WorldRemit اختر أوغندا وBank transfer. إذا كان Housing Finance Bank متاحاً لمسار الإرسال لديك فأدخل بيانات المستفيد أدناه؛ وإلا فاستخدم التحويل المصرفي المباشر.",
    beneficiaryHeading: "بيانات المستفيد الموثقة",
    bankLabel: "المصرف",
    accountNameLabel: "اسم الحساب",
    accountNumberLabel: "رقم الحساب",
    swiftLabel: "SWIFT/BIC",
    openProvider: "فتح الموقع الرسمي للخدمة",
    availabilityNote:
      "تعتمد الإتاحة وأسعار الصرف والرسوم والحدود وقواعد التحويل على بلد الإرسال، وتعرضها الخدمة قبل الإرسال.",
    thirdPartyNote:
      "Remitly وWorldRemit خدمتا تحويل مستقلتان. إدراجهما هنا لا يعني وجود رعاية أو شراكة مع Vantage Foundation Uganda.",
    successTitle: "تم تسجيل نية التبرع",
    successReferenceIntro: "مرجع فانتج الخاص بك هو",
    successReferenceHelp:
      "احتفظ به مع تفاصيل التحويل. يظل التبرع معلقاً حتى تتحقق فانتج من وصوله إلى الحساب المصرفي الرسمي.",
  },
};

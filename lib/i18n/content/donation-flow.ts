import type { Locale } from "@/lib/i18n/config";

export type DonationFlowCopy = {
  steps: [string, string, string];
  recommended: string;
  saveIntent: string;
  savingIntent: string;
  saveHelp: string;
  savedTitle: string;
  savedBody: string;
  transferTitle: string;
  transferBody: string;
  amountLabel: string;
  methodLabel: string;
  beneficiaryTitle: string;
  paymentReference: string;
  paymentReferenceHelp: string;
  copy: string;
  copied: string;
  copyAll: string;
  copiedAll: string;
  directInstruction: string;
  worldRemitInstruction: string;
  remitlyInstruction: string;
  worldRemitEligibility: string;
  remitlyEligibility: string;
  openWorldRemit: string;
  openRemitly: string;
  keepTabOpen: string;
  confirmTitle: string;
  confirmBody: string;
  transactionLabel: string;
  transactionPlaceholder: string;
  confirmButton: string;
  confirming: string;
  confirmedTitle: string;
  confirmedBody: string;
  confirmationError: string;
};

export const donationFlowCopy: Record<Locale, DonationFlowCopy> = {
  en: {
    steps: ["Gift details", "Send funds", "Confirm transfer"],
    recommended: "Recommended",
    saveIntent: "Save donation & show transfer details",
    savingIntent: "Saving donation…",
    saveHelp: "This does not move money. It records your donation and gives you the exact transfer details next.",
    savedTitle: "Donation saved",
    savedBody: "Your Vantage reference is ready. Complete the transfer using the verified details below.",
    transferTitle: "Complete your transfer",
    transferBody: "Use the exact beneficiary details below. Keep this page open while you transfer the funds.",
    amountLabel: "Donation amount",
    methodLabel: "Transfer route",
    beneficiaryTitle: "Verified beneficiary",
    paymentReference: "Payment reference",
    paymentReferenceHelp: "Use this Vantage reference in your bank or provider reference/notes field when possible.",
    copy: "Copy",
    copied: "Copied",
    copyAll: "Copy all transfer details",
    copiedAll: "All details copied",
    directInstruction: "Open your bank app or online banking and make an international transfer using these details.",
    worldRemitInstruction: "If WorldRemit permits the purpose of your transfer, choose Uganda and Bank transfer, then enter the verified beneficiary details shown here.",
    remitlyInstruction: "Only continue with Remitly if the terms shown for your sending country explicitly permit charitable transfers. Otherwise use direct bank transfer.",
    worldRemitEligibility: "WorldRemit asks senders to choose a transfer purpose. Proceed only if an available purpose accurately covers your donation.",
    remitlyEligibility: "Important: Remitly's UK consumer terms prohibit transfers to donate to a charitable organisation. Rules vary by sending country.",
    openWorldRemit: "Continue to WorldRemit",
    openRemitly: "Check Remitly eligibility",
    keepTabOpen: "The provider opens in a new tab. Keep this Vantage page open so you can confirm the transfer afterwards.",
    confirmTitle: "Transferred the funds?",
    confirmBody: "Paste the transaction/reference number shown by your bank or transfer provider. This helps Vantage match the incoming funds quickly.",
    transactionLabel: "Bank or provider transaction reference",
    transactionPlaceholder: "e.g. WR123456789 or bank reference",
    confirmButton: "I completed the transfer",
    confirming: "Saving transfer reference…",
    confirmedTitle: "Transfer details received",
    confirmedBody: "Thank you. Your donation remains pending until Vantage confirms the funds in the official Housing Finance Bank account.",
    confirmationError: "We could not save the transfer reference. Please try again.",
  },
  de: {
    steps: ["Spendendaten", "Geld senden", "Überweisung bestätigen"],
    recommended: "Empfohlen",
    saveIntent: "Spende speichern & Überweisungsdaten anzeigen",
    savingIntent: "Spende wird gespeichert…",
    saveHelp: "Dabei wird noch kein Geld bewegt. Ihre Spende wird erfasst und anschließend werden die genauen Überweisungsdaten angezeigt.",
    savedTitle: "Spende gespeichert",
    savedBody: "Ihre Vantage-Referenz ist bereit. Schließen Sie die Überweisung mit den geprüften Daten unten ab.",
    transferTitle: "Überweisung abschließen",
    transferBody: "Verwenden Sie genau die untenstehenden Empfängerdaten und lassen Sie diese Seite während der Überweisung geöffnet.",
    amountLabel: "Spendenbetrag",
    methodLabel: "Überweisungsweg",
    beneficiaryTitle: "Geprüfter Empfänger",
    paymentReference: "Zahlungsreferenz",
    paymentReferenceHelp: "Verwenden Sie diese Vantage-Referenz nach Möglichkeit im Referenz- oder Notizfeld Ihrer Bank bzw. des Anbieters.",
    copy: "Kopieren",
    copied: "Kopiert",
    copyAll: "Alle Überweisungsdaten kopieren",
    copiedAll: "Alle Daten kopiert",
    directInstruction: "Öffnen Sie Ihre Banking-App oder Ihr Online-Banking und führen Sie mit diesen Daten eine internationale Überweisung aus.",
    worldRemitInstruction: "Wenn WorldRemit den Zweck Ihrer Überweisung zulässt, wählen Sie Uganda und Bank transfer und tragen Sie die geprüften Empfängerdaten ein.",
    remitlyInstruction: "Nutzen Sie Remitly nur, wenn die Bedingungen für Ihr Sendeland Spenden ausdrücklich zulassen. Andernfalls nutzen Sie die direkte Banküberweisung.",
    worldRemitEligibility: "WorldRemit verlangt einen Überweisungszweck. Fahren Sie nur fort, wenn eine angebotene Option Ihre Spende korrekt beschreibt.",
    remitlyEligibility: "Wichtig: Die britischen Remitly-Verbraucherbedingungen untersagen Überweisungen als Spende an eine Wohltätigkeitsorganisation. Regeln unterscheiden sich je nach Sendeland.",
    openWorldRemit: "Zu WorldRemit",
    openRemitly: "Remitly-Berechtigung prüfen",
    keepTabOpen: "Der Anbieter öffnet sich in einem neuen Tab. Lassen Sie diese Vantage-Seite geöffnet, um die Überweisung danach zu bestätigen.",
    confirmTitle: "Geld bereits überwiesen?",
    confirmBody: "Fügen Sie die Transaktions-/Referenznummer Ihrer Bank oder des Transferanbieters ein. So kann Vantage den Eingang schneller zuordnen.",
    transactionLabel: "Transaktionsreferenz der Bank/des Anbieters",
    transactionPlaceholder: "z. B. WR123456789 oder Bankreferenz",
    confirmButton: "Ich habe die Überweisung abgeschlossen",
    confirming: "Überweisungsreferenz wird gespeichert…",
    confirmedTitle: "Überweisungsdaten erhalten",
    confirmedBody: "Vielen Dank. Die Spende bleibt ausstehend, bis Vantage den Eingang auf dem offiziellen Konto bei Housing Finance Bank bestätigt.",
    confirmationError: "Die Überweisungsreferenz konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.",
  },
  fr: {
    steps: ["Détails du don", "Envoyer les fonds", "Confirmer le transfert"],
    recommended: "Recommandé",
    saveIntent: "Enregistrer le don et afficher les coordonnées",
    savingIntent: "Enregistrement du don…",
    saveHelp: "Aucun argent n'est déplacé à cette étape. Votre don est enregistré puis les coordonnées exactes s'affichent.",
    savedTitle: "Don enregistré",
    savedBody: "Votre référence Vantage est prête. Effectuez le transfert avec les coordonnées vérifiées ci-dessous.",
    transferTitle: "Effectuer votre transfert",
    transferBody: "Utilisez exactement les coordonnées du bénéficiaire ci-dessous et gardez cette page ouverte pendant le transfert.",
    amountLabel: "Montant du don",
    methodLabel: "Mode de transfert",
    beneficiaryTitle: "Bénéficiaire vérifié",
    paymentReference: "Référence de paiement",
    paymentReferenceHelp: "Utilisez cette référence Vantage dans le champ référence ou note de votre banque/fournisseur lorsque cela est possible.",
    copy: "Copier",
    copied: "Copié",
    copyAll: "Copier toutes les coordonnées",
    copiedAll: "Toutes les coordonnées copiées",
    directInstruction: "Ouvrez votre application bancaire ou banque en ligne et effectuez un virement international avec ces coordonnées.",
    worldRemitInstruction: "Si WorldRemit autorise le motif de votre transfert, choisissez Ouganda puis Bank transfer et saisissez les coordonnées vérifiées affichées ici.",
    remitlyInstruction: "N'utilisez Remitly que si les conditions de votre pays d'envoi autorisent explicitement les dons caritatifs. Sinon, utilisez le virement bancaire direct.",
    worldRemitEligibility: "WorldRemit demande un motif de transfert. Continuez uniquement si une option disponible décrit correctement votre don.",
    remitlyEligibility: "Important : les conditions consommateurs de Remitly au Royaume-Uni interdisent les transferts destinés à faire un don à une organisation caritative. Les règles varient selon le pays d'envoi.",
    openWorldRemit: "Continuer vers WorldRemit",
    openRemitly: "Vérifier l'éligibilité Remitly",
    keepTabOpen: "Le fournisseur s'ouvre dans un nouvel onglet. Gardez cette page Vantage ouverte pour confirmer ensuite le transfert.",
    confirmTitle: "Fonds déjà transférés ?",
    confirmBody: "Collez le numéro de transaction/référence fourni par votre banque ou le service de transfert afin que Vantage rapproche rapidement les fonds.",
    transactionLabel: "Référence de transaction banque/fournisseur",
    transactionPlaceholder: "ex. WR123456789 ou référence bancaire",
    confirmButton: "J'ai effectué le transfert",
    confirming: "Enregistrement de la référence…",
    confirmedTitle: "Détails du transfert reçus",
    confirmedBody: "Merci. Votre don reste en attente jusqu'à la confirmation des fonds sur le compte officiel de Housing Finance Bank.",
    confirmationError: "Impossible d'enregistrer la référence du transfert. Veuillez réessayer.",
  },
  es: {
    steps: ["Datos de la donación", "Enviar fondos", "Confirmar transferencia"],
    recommended: "Recomendado",
    saveIntent: "Guardar donación y mostrar datos de transferencia",
    savingIntent: "Guardando donación…",
    saveHelp: "Este paso no mueve dinero. Registra su donación y a continuación muestra los datos exactos para transferir.",
    savedTitle: "Donación guardada",
    savedBody: "Su referencia de Vantage está lista. Complete la transferencia con los datos verificados que aparecen abajo.",
    transferTitle: "Complete su transferencia",
    transferBody: "Use exactamente los datos del beneficiario que aparecen abajo y mantenga esta página abierta mientras transfiere.",
    amountLabel: "Importe de la donación",
    methodLabel: "Ruta de transferencia",
    beneficiaryTitle: "Beneficiario verificado",
    paymentReference: "Referencia de pago",
    paymentReferenceHelp: "Use esta referencia de Vantage en el campo de referencia o notas de su banco/proveedor cuando sea posible.",
    copy: "Copiar",
    copied: "Copiado",
    copyAll: "Copiar todos los datos",
    copiedAll: "Todos los datos copiados",
    directInstruction: "Abra la app o banca en línea de su banco y realice una transferencia internacional con estos datos.",
    worldRemitInstruction: "Si WorldRemit permite el propósito de su transferencia, elija Uganda y Bank transfer e introduzca los datos verificados mostrados aquí.",
    remitlyInstruction: "Use Remitly solo si las condiciones de su país de envío permiten explícitamente donaciones benéficas. De lo contrario, use transferencia bancaria directa.",
    worldRemitEligibility: "WorldRemit pide elegir un motivo de transferencia. Continúe solo si una opción disponible describe correctamente su donación.",
    remitlyEligibility: "Importante: las condiciones de consumo de Remitly en el Reino Unido prohíben transferencias para donar a una organización benéfica. Las reglas varían según el país de envío.",
    openWorldRemit: "Continuar a WorldRemit",
    openRemitly: "Comprobar elegibilidad en Remitly",
    keepTabOpen: "El proveedor se abre en una pestaña nueva. Mantenga abierta esta página de Vantage para confirmar la transferencia después.",
    confirmTitle: "¿Ya transfirió los fondos?",
    confirmBody: "Pegue el número de transacción/referencia de su banco o proveedor para que Vantage pueda identificar rápidamente los fondos entrantes.",
    transactionLabel: "Referencia de transacción del banco/proveedor",
    transactionPlaceholder: "p. ej. WR123456789 o referencia bancaria",
    confirmButton: "He completado la transferencia",
    confirming: "Guardando referencia…",
    confirmedTitle: "Datos de transferencia recibidos",
    confirmedBody: "Gracias. La donación seguirá pendiente hasta que Vantage confirme los fondos en la cuenta oficial de Housing Finance Bank.",
    confirmationError: "No pudimos guardar la referencia de la transferencia. Inténtelo de nuevo.",
  },
  ar: {
    steps: ["تفاصيل التبرع", "إرسال الأموال", "تأكيد التحويل"],
    recommended: "موصى به",
    saveIntent: "حفظ التبرع وإظهار بيانات التحويل",
    savingIntent: "جارٍ حفظ التبرع…",
    saveHelp: "هذه الخطوة لا تنقل أي أموال. إنها تسجل تبرعك ثم تعرض بيانات التحويل الدقيقة.",
    savedTitle: "تم حفظ التبرع",
    savedBody: "مرجع فانتج جاهز. أكمل التحويل باستخدام البيانات الموثقة أدناه.",
    transferTitle: "أكمل التحويل",
    transferBody: "استخدم بيانات المستفيد أدناه كما هي، واترك هذه الصفحة مفتوحة أثناء التحويل.",
    amountLabel: "قيمة التبرع",
    methodLabel: "طريقة التحويل",
    beneficiaryTitle: "المستفيد الموثق",
    paymentReference: "مرجع الدفع",
    paymentReferenceHelp: "استخدم مرجع فانتج هذا في خانة المرجع أو الملاحظات لدى البنك أو مزود التحويل متى أمكن.",
    copy: "نسخ",
    copied: "تم النسخ",
    copyAll: "نسخ جميع بيانات التحويل",
    copiedAll: "تم نسخ جميع البيانات",
    directInstruction: "افتح تطبيق البنك أو الخدمات المصرفية عبر الإنترنت وأجرِ تحويلاً دولياً باستخدام هذه البيانات.",
    worldRemitInstruction: "إذا كان WorldRemit يسمح بغرض التحويل، اختر أوغندا ثم Bank transfer وأدخل بيانات المستفيد الموثقة المعروضة هنا.",
    remitlyInstruction: "استخدم Remitly فقط إذا كانت شروط بلد الإرسال تسمح صراحةً بالتبرعات الخيرية. وإلا فاستخدم التحويل المصرفي المباشر.",
    worldRemitEligibility: "يطلب WorldRemit تحديد غرض التحويل. تابع فقط إذا كان أحد الأغراض المتاحة يصف تبرعك بدقة.",
    remitlyEligibility: "مهم: تحظر شروط Remitly للمستهلكين في المملكة المتحدة التحويلات بقصد التبرع لمنظمة خيرية. تختلف القواعد حسب بلد الإرسال.",
    openWorldRemit: "المتابعة إلى WorldRemit",
    openRemitly: "التحقق من أهلية Remitly",
    keepTabOpen: "يفتح مزود التحويل في علامة تبويب جديدة. اترك صفحة فانتج هذه مفتوحة لتأكيد التحويل بعد ذلك.",
    confirmTitle: "هل أرسلت الأموال؟",
    confirmBody: "ألصق رقم المعاملة أو المرجع الذي يعرضه البنك أو مزود التحويل حتى تتمكن فانتج من مطابقة الأموال الواردة بسرعة.",
    transactionLabel: "مرجع معاملة البنك أو مزود التحويل",
    transactionPlaceholder: "مثال: WR123456789 أو مرجع البنك",
    confirmButton: "أكملت التحويل",
    confirming: "جارٍ حفظ مرجع التحويل…",
    confirmedTitle: "تم استلام بيانات التحويل",
    confirmedBody: "شكراً لك. سيظل التبرع معلقاً حتى تؤكد فانتج وصول الأموال إلى الحساب الرسمي في Housing Finance Bank.",
    confirmationError: "تعذر حفظ مرجع التحويل. يرجى المحاولة مرة أخرى.",
  },
};

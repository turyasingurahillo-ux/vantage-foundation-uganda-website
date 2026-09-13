"use client";

import { FormEvent, useState, useSyncExternalStore } from "react";
import { useActionState } from "react";
import { Check, Copy, ExternalLink, Landmark, ShieldCheck } from "lucide-react";
import { submitDonor, FormState } from "@/app/actions";
import { site } from "@/content/site";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { HoneypotFields } from "@/components/shared/HoneypotFields";
import { FieldError } from "@/components/shared/FieldError";
import { FormPrivacyNotice } from "@/components/shared/FormPrivacyNotice";
import {
  createDonationReference,
  OFFICIAL_TRANSFER_URLS,
  type DonationTransferMethod,
} from "@/lib/donation-transfer";
import { donationTransferCopy } from "@/lib/i18n/content/donation-transfer";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { DonationFormCopy, DonationCampaign } from "@/lib/i18n/content/engagement";

interface DonationFormProps {
  form: DonationFormCopy;
  campaigns: DonationCampaign[];
  suggestedAmounts: { value: number; label: string }[];
  privacyLabel: string;
  locale?: Locale;
}

const initialState: FormState = {
  success: false,
  message: "",
};

type FlowCopy = {
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
  branchLabel: string;
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

const FLOW_COPY: Record<Locale, FlowCopy> = {
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
    branchLabel: "Branch",
    paymentReference: "Payment reference",
    paymentReferenceHelp: "Use this Vantage reference in your bank/provider reference or notes field when possible.",
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
    saveHelp: "Dadurch wird noch kein Geld bewegt. Ihre Spende wird erfasst und anschließend werden die genauen Überweisungsdaten angezeigt.",
    savedTitle: "Spende gespeichert",
    savedBody: "Ihre Vantage-Referenz ist bereit. Schließen Sie die Überweisung mit den geprüften Daten unten ab.",
    transferTitle: "Überweisung abschließen",
    transferBody: "Verwenden Sie genau die untenstehenden Empfängerdaten und lassen Sie diese Seite während der Überweisung geöffnet.",
    amountLabel: "Spendenbetrag",
    methodLabel: "Überweisungsweg",
    beneficiaryTitle: "Geprüfter Empfänger",
    branchLabel: "Filiale",
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
    branchLabel: "Agence",
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
    branchLabel: "Sucursal",
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
    branchLabel: "الفرع",
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

function createReferenceStore() {
  let clientValue = "";
  let scheduled = false;
  const listeners = new Set<() => void>();

  function setClientValue() {
    if (clientValue) return;
    clientValue = createDonationReference();
    listeners.forEach((listener) => listener());
  }

  function schedule() {
    if (scheduled || typeof window === "undefined") return;
    scheduled = true;
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(setClientValue);
    } else {
      setTimeout(setClientValue, 0);
    }
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    if (!clientValue) schedule();
    return () => listeners.delete(listener);
  }

  return {
    subscribe,
    getSnapshot: () => clientValue,
    getServerSnapshot: () => "",
  };
}

function StepRail({ active, labels }: { active: 1 | 2 | 3; labels: [string, string, string] }) {
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Donation progress">
      {labels.map((label, index) => {
        const step = (index + 1) as 1 | 2 | 3;
        const complete = step < active;
        const current = step === active;
        return (
          <li key={label} className="min-w-0">
            <div
              className={`h-1.5 rounded-full ${complete || current ? "bg-primary" : "bg-border"}`}
              aria-hidden="true"
            />
            <div className="mt-2 flex items-start gap-2">
              <span
                className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  complete
                    ? "bg-primary text-white"
                    : current
                      ? "border-2 border-primary text-primary"
                      : "border border-border text-muted-foreground"
                }`}
              >
                {complete ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : step}
              </span>
              <span className={`hidden text-xs leading-5 sm:block ${current ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                {label}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function DonationForm({
  form,
  campaigns,
  suggestedAmounts,
  privacyLabel,
  locale = "en",
}: DonationFormProps) {
  const [amount, setAmount] = useState<string>("");
  const [frequency, setFrequency] = useState<"one-time" | "monthly">("one-time");
  const [custom, setCustom] = useState("");
  const [email, setEmail] = useState("");
  const [transferMethod, setTransferMethod] = useState<DonationTransferMethod>("bank");
  const [referenceStore] = useState(createReferenceStore);
  const donationReference = useSyncExternalStore(
    referenceStore.subscribe,
    referenceStore.getSnapshot,
    referenceStore.getServerSnapshot,
  );
  const [state, formAction, pending] = useActionState(submitDonor, initialState);
  const [copiedKey, setCopiedKey] = useState("");
  const [transactionReference, setTransactionReference] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [confirmationSuccess, setConfirmationSuccess] = useState(false);
  const transferCopy = donationTransferCopy[locale];
  const flow = FLOW_COPY[locale];

  const displayAmount = custom || amount || "";
  const selectedMethod = transferCopy.methods[transferMethod];

  async function copyValue(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey((current) => (current === key ? "" : current)), 1800);
    } catch {
      setCopiedKey("");
    }
  }

  const allTransferDetails = [
    `${transferCopy.bankLabel}: ${site.bankDetails.bankName}`,
    `${transferCopy.accountNameLabel}: ${site.bankDetails.accountName}`,
    `${transferCopy.accountNumberLabel}: ${site.bankDetails.accountNumber}`,
    `${flow.branchLabel}: ${site.bankDetails.branch}`,
    `${transferCopy.swiftLabel}: ${site.bankDetails.swiftCode}`,
    `${flow.paymentReference}: ${donationReference}`,
  ].join("\n");

  async function confirmTransfer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!transactionReference.trim() || confirming) return;

    setConfirming(true);
    setConfirmationMessage("");
    setConfirmationSuccess(false);

    try {
      const response = await fetch("/api/donations/confirm-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donationReference,
          email,
          transactionReference: transactionReference.trim(),
        }),
      });
      const data = (await response.json()) as { success?: boolean; message?: string };
      setConfirmationSuccess(Boolean(response.ok && data.success));
      setConfirmationMessage(data.message || flow.confirmationError);
    } catch {
      setConfirmationMessage(flow.confirmationError);
    } finally {
      setConfirming(false);
    }
  }

  if (state.success && donationReference) {
    const providerUrl =
      transferMethod === "worldremit"
        ? OFFICIAL_TRANSFER_URLS.worldremit
        : transferMethod === "remitly"
          ? OFFICIAL_TRANSFER_URLS.remitly
          : null;

    return (
      <div className="space-y-6">
        <StepRail active={confirmationSuccess ? 3 : 2} labels={flow.steps} />

        <div className="rounded-xl border border-success/30 bg-success/10 p-4">
          <p className="text-sm font-semibold text-foreground">{flow.savedTitle}</p>
          <p className="mt-1 text-sm text-muted-foreground">{flow.savedBody}</p>
        </div>

        <div>
          <h3 className="text-xl font-bold">{flow.transferTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{flow.transferBody}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{flow.amountLabel}</p>
            <p className="mt-1 text-lg font-bold text-foreground">
              UGX {Number(displayAmount || 0).toLocaleString("en-UG")}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{flow.methodLabel}</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{selectedMethod.label}</p>
          </div>
        </div>

        <div className="rounded-xl border border-primary/20 bg-primary-light p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{flow.paymentReference}</p>
              <p className="mt-1 break-all font-mono text-base font-bold text-foreground">{donationReference}</p>
            </div>
            <button
              type="button"
              onClick={() => copyValue("reference", donationReference)}
              className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-primary/30 bg-white px-3 py-2 text-xs font-semibold text-primary hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {copiedKey === "reference" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copiedKey === "reference" ? flow.copied : flow.copy}
            </button>
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">{flow.paymentReferenceHelp}</p>
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <div className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-primary" aria-hidden="true" />
            <h4 className="font-semibold">{flow.beneficiaryTitle}</h4>
          </div>
          <dl className="mt-4 divide-y divide-border text-sm">
            {[
              ["bank", transferCopy.bankLabel, site.bankDetails.bankName],
              ["name", transferCopy.accountNameLabel, site.bankDetails.accountName],
              ["account", transferCopy.accountNumberLabel, site.bankDetails.accountNumber],
              ["branch", flow.branchLabel, site.bankDetails.branch],
              ["swift", transferCopy.swiftLabel, site.bankDetails.swiftCode],
            ].map(([key, label, value]) => (
              <div key={key} className="grid grid-cols-[1fr_auto] gap-4 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className={`mt-0.5 break-words font-semibold ${key === "account" || key === "swift" ? "font-mono" : ""}`}>{value}</dd>
                </div>
                <button
                  type="button"
                  onClick={() => copyValue(key, value)}
                  aria-label={`${flow.copy}: ${label}`}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-surface hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {copiedKey === key ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            ))}
          </dl>
          <button
            type="button"
            onClick={() => copyValue("all", allTransferDetails)}
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-primary px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {copiedKey === "all" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copiedKey === "all" ? flow.copiedAll : flow.copyAll}
          </button>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-sm leading-6 text-foreground">
            {transferMethod === "bank"
              ? flow.directInstruction
              : transferMethod === "worldremit"
                ? flow.worldRemitInstruction
                : flow.remitlyInstruction}
          </p>

          {transferMethod !== "bank" && (
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4 text-xs leading-5 text-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>{transferMethod === "worldremit" ? flow.worldRemitEligibility : flow.remitlyEligibility}</p>
            </div>
          )}

          {providerUrl && (
            <>
              <a
                href={providerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {transferMethod === "worldremit" ? flow.openWorldRemit : flow.openRemitly}
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">{flow.keepTabOpen}</p>
            </>
          )}
        </div>

        <div className="rounded-xl border border-border p-5">
          <h4 className="font-semibold">{flow.confirmTitle}</h4>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{flow.confirmBody}</p>

          {confirmationSuccess ? (
            <div role="status" className="mt-4 rounded-lg border border-success/30 bg-success/10 p-4">
              <p className="text-sm font-semibold text-foreground">{flow.confirmedTitle}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{confirmationMessage || flow.confirmedBody}</p>
            </div>
          ) : (
            <form onSubmit={confirmTransfer} className="mt-4 space-y-3">
              <div>
                <Label htmlFor="transfer-confirmation-reference">{flow.transactionLabel}</Label>
                <Input
                  id="transfer-confirmation-reference"
                  value={transactionReference}
                  onChange={(event) => setTransactionReference(event.target.value)}
                  placeholder={flow.transactionPlaceholder}
                  maxLength={200}
                  required
                  className="mt-1.5"
                />
              </div>
              <Button type="submit" disabled={confirming || transactionReference.trim().length < 3} className="w-full">
                {confirming ? flow.confirming : flow.confirmButton}
              </Button>
              {confirmationMessage && !confirmationSuccess && (
                <p role="alert" className="text-sm text-destructive">{confirmationMessage}</p>
              )}
            </form>
          )}
        </div>

        <p className="text-xs leading-5 text-muted-foreground">{transferCopy.thirdPartyNote}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <HoneypotFields withIdempotency />
      <StepRail active={1} labels={flow.steps} />

      <fieldset>
        <legend>
          <Label>{form.amountLegend}</Label>
        </legend>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {suggestedAmounts.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                setAmount(item.value.toString());
                setCustom("");
              }}
              aria-pressed={amount === item.value.toString()}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                amount === item.value.toString()
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white hover:bg-surface"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <Label htmlFor="custom-amount">{form.customAmountLabel}</Label>
        <Input
          id="custom-amount"
          type="number"
          min={1}
          placeholder={form.customAmountPlaceholder}
          value={custom}
          onChange={(event) => {
            setCustom(event.target.value);
            setAmount("");
          }}
          className="mt-1.5"
          aria-invalid={state.fieldErrors?.amount ? true : undefined}
          aria-describedby={state.fieldErrors?.amount ? "amount-error" : undefined}
        />
        <FieldError id="amount-error" message={state.fieldErrors?.amount} />
      </div>

      <input type="hidden" name="amount" value={displayAmount} />

      <fieldset>
        <legend>
          <Label>{form.frequencyLegend}</Label>
        </legend>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => setFrequency("one-time")}
            aria-pressed={frequency === "one-time"}
            className={`rounded-lg border px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              frequency === "one-time"
                ? "border-primary bg-primary text-white"
                : "border-border bg-white hover:bg-surface"
            }`}
          >
            {form.oneTime}
          </button>
          <button
            type="button"
            onClick={() => setFrequency("monthly")}
            aria-pressed={frequency === "monthly"}
            className={`rounded-lg border px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              frequency === "monthly"
                ? "border-primary bg-primary text-white"
                : "border-border bg-white hover:bg-surface"
            }`}
          >
            {form.monthly}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{form.frequencyNote}</p>
      </fieldset>

      <input type="hidden" name="frequency" value={frequency} />

      <div>
        <Label htmlFor="campaign">{form.campaignLabel}</Label>
        <Select
          id="campaign"
          name="campaign"
          required
          className="mt-1.5"
          aria-invalid={state.fieldErrors?.campaign ? true : undefined}
          aria-describedby={state.fieldErrors?.campaign ? "campaign-error" : undefined}
        >
          {campaigns.map((campaign) => (
            <option key={campaign.id} value={campaign.id}>
              {campaign.label}
            </option>
          ))}
        </Select>
        <FieldError id="campaign-error" message={state.fieldErrors?.campaign} />
      </div>

      <fieldset>
        <legend>
          <Label>{transferCopy.formLegend}</Label>
        </legend>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{transferCopy.formHelp}</p>
        <div className="mt-3 grid gap-2">
          {(Object.keys(transferCopy.methods) as DonationTransferMethod[]).map((method) => {
            const selected = transferMethod === method;
            const option = transferCopy.methods[method];
            return (
              <button
                key={method}
                type="button"
                onClick={() => setTransferMethod(method)}
                aria-pressed={selected}
                className={`rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  selected ? "border-primary bg-primary-light" : "border-border bg-white hover:bg-surface"
                }`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-foreground">{option.label}</span>
                  {method === "bank" && (
                    <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-white">{flow.recommended}</span>
                  )}
                </span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">{option.description}</span>
              </button>
            );
          })}
        </div>
        <FieldError id="transfer-method-error" message={state.fieldErrors?.transferMethod} />
      </fieldset>

      {transferMethod !== "bank" && (
        <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4 text-xs leading-5 text-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{transferMethod === "worldremit" ? flow.worldRemitEligibility : flow.remitlyEligibility}</p>
        </div>
      )}

      <input type="hidden" name="transferMethod" value={transferMethod} />
      <input type="hidden" name="donationReference" value={donationReference} />

      <div className="rounded-lg border border-primary/20 bg-primary-light p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{transferCopy.referenceLabel}</p>
        <p className="mt-1 font-mono text-sm font-bold text-foreground">{donationReference || "…"}</p>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">{transferCopy.referenceHelp}</p>
        <FieldError id="donation-reference-error" message={state.fieldErrors?.donationReference} />
      </div>

      <div>
        <Label htmlFor="donor-name">{form.nameLabel}</Label>
        <Input
          id="donor-name"
          name="name"
          required
          className="mt-1.5"
          aria-invalid={state.fieldErrors?.name ? true : undefined}
          aria-describedby={state.fieldErrors?.name ? "donor-name-error" : undefined}
        />
        <FieldError id="donor-name-error" message={state.fieldErrors?.name} />
      </div>

      <div>
        <Label htmlFor="donor-email">{form.emailLabel}</Label>
        <Input
          id="donor-email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1.5"
          aria-invalid={state.fieldErrors?.email ? true : undefined}
          aria-describedby={state.fieldErrors?.email ? "donor-email-error" : undefined}
        />
        <FieldError id="donor-email-error" message={state.fieldErrors?.email} />
      </div>

      <div>
        <Label htmlFor="donor-phone">{form.phoneLabel}</Label>
        <Input
          id="donor-phone"
          name="phone"
          type="tel"
          className="mt-1.5"
          aria-invalid={state.fieldErrors?.phone ? true : undefined}
          aria-describedby={state.fieldErrors?.phone ? "donor-phone-error" : undefined}
        />
        <FieldError id="donor-phone-error" message={state.fieldErrors?.phone} />
      </div>

      <div>
        <Label htmlFor="donor-message">{form.messageLabel}</Label>
        <Input
          id="donor-message"
          name="message"
          className="mt-1.5"
          aria-invalid={state.fieldErrors?.message ? true : undefined}
          aria-describedby={state.fieldErrors?.message ? "donor-message-error" : undefined}
        />
        <FieldError id="donor-message-error" message={state.fieldErrors?.message} />
      </div>

      <div className="space-y-2">
        <Button
          type="submit"
          disabled={pending || !displayAmount || !donationReference || !email}
          className="w-full"
        >
          {pending ? flow.savingIntent : flow.saveIntent}
        </Button>
        <p className="text-center text-xs leading-5 text-muted-foreground">{flow.saveHelp}</p>
      </div>

      <FormPrivacyNotice
        text={form.privacyNotice}
        privacyLabel={privacyLabel}
        privacyHref={localePath("/privacy", locale)}
      />

      {state.message && !state.success && (
        <p role="alert" aria-live="polite" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
    </form>
  );
}

"use client";

import { useActionState, useState, useSyncExternalStore, type FormEvent } from "react";
import { Check, Copy, ExternalLink, Landmark, ShieldCheck } from "lucide-react";
import { submitDonor, type FormState } from "@/app/actions";
import { site } from "@/content/site";
import { FieldError } from "@/components/shared/FieldError";
import { FormPrivacyNotice } from "@/components/shared/FormPrivacyNotice";
import { HoneypotFields } from "@/components/shared/HoneypotFields";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import {
  createDonationReference,
  OFFICIAL_TRANSFER_URLS,
  type DonationTransferMethod,
} from "@/lib/donation-transfer";
import { donationFlowCopy } from "@/lib/i18n/content/donation-flow";
import { donationTransferCopy } from "@/lib/i18n/content/donation-transfer";
import { localePath, type Locale } from "@/lib/i18n/config";
import type {
  DonationCampaign,
  DonationFormCopy,
} from "@/lib/i18n/content/engagement";

interface DonationFormProps {
  form: DonationFormCopy;
  campaigns: DonationCampaign[];
  suggestedAmounts: { value: number; label: string }[];
  privacyLabel: string;
  locale?: Locale;
}

const initialState: FormState = { success: false, message: "" };

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

function StepRail({
  active,
  labels,
}: {
  active: 1 | 2 | 3;
  labels: [string, string, string];
}) {
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
                {complete ? (
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  step
                )}
              </span>
              <span
                className={`hidden text-xs leading-5 sm:block ${
                  current
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground"
                }`}
              >
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
  const [amount, setAmount] = useState("");
  const [custom, setCustom] = useState("");
  const [frequency, setFrequency] = useState<"one-time" | "monthly">(
    "one-time",
  );
  const [email, setEmail] = useState("");
  const [transferMethod, setTransferMethod] =
    useState<DonationTransferMethod>("bank");
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
  const flow = donationFlowCopy[locale];
  const displayAmount = custom || amount;
  const selectedMethod = transferCopy.methods[transferMethod];

  async function copyValue(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(
        () => setCopiedKey((current) => (current === key ? "" : current)),
        1800,
      );
    } catch {
      setCopiedKey("");
    }
  }

  const transferDetails = [
    `${transferCopy.bankLabel}: ${site.bankDetails.bankName}`,
    `${transferCopy.accountNameLabel}: ${site.bankDetails.accountName}`,
    `${transferCopy.accountNumberLabel}: ${site.bankDetails.accountNumber}`,
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
      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
      };
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

    const beneficiaryRows = [
      ["bank", transferCopy.bankLabel, site.bankDetails.bankName],
      ["name", transferCopy.accountNameLabel, site.bankDetails.accountName],
      [
        "account",
        transferCopy.accountNumberLabel,
        site.bankDetails.accountNumber,
      ],
      ["swift", transferCopy.swiftLabel, site.bankDetails.swiftCode],
    ] as const;

    return (
      <div className="space-y-6">
        <StepRail
          active={confirmationSuccess ? 3 : 2}
          labels={flow.steps}
        />

        <div className="rounded-xl border border-success/30 bg-success/10 p-4">
          <p className="text-sm font-semibold text-foreground">
            {flow.savedTitle}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {flow.savedBody}
          </p>
        </div>

        <div>
          <h3 className="text-xl font-bold">{flow.transferTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {flow.transferBody}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {flow.amountLabel}
            </p>
            <p className="mt-1 text-lg font-bold text-foreground">
              UGX {Number(displayAmount || 0).toLocaleString("en-UG")}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {flow.methodLabel}
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {selectedMethod.label}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-primary/20 bg-primary-light p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {flow.paymentReference}
              </p>
              <p className="mt-1 break-all font-mono text-base font-bold text-foreground">
                {donationReference}
              </p>
            </div>
            <button
              type="button"
              onClick={() => copyValue("reference", donationReference)}
              className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-primary/30 bg-white px-3 py-2 text-xs font-semibold text-primary hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {copiedKey === "reference" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copiedKey === "reference" ? flow.copied : flow.copy}
            </button>
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            {flow.paymentReferenceHelp}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <div className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-primary" aria-hidden="true" />
            <h4 className="font-semibold">{flow.beneficiaryTitle}</h4>
          </div>
          <dl className="mt-4 divide-y divide-border text-sm">
            {beneficiaryRows.map(([key, label, value]) => (
              <div
                key={key}
                className="grid grid-cols-[1fr_auto] gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd
                    className={`mt-0.5 break-words font-semibold ${
                      key === "account" || key === "swift" ? "font-mono" : ""
                    }`}
                  >
                    {value}
                  </dd>
                </div>
                <button
                  type="button"
                  onClick={() => copyValue(key, value)}
                  aria-label={`${flow.copy}: ${label}`}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-surface hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {copiedKey === key ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            ))}
          </dl>
          <button
            type="button"
            onClick={() => copyValue("all", transferDetails)}
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-primary px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {copiedKey === "all" ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
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
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-warning/30 bg-warning-bg p-4 text-xs leading-5 text-warning-fg">
              <ShieldCheck
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <p>
                {transferMethod === "worldremit"
                  ? flow.worldRemitEligibility
                  : flow.remitlyEligibility}
              </p>
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
                {transferMethod === "worldremit"
                  ? flow.openWorldRemit
                  : flow.openRemitly}
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                {flow.keepTabOpen}
              </p>
            </>
          )}
        </div>

        <div className="rounded-xl border border-border p-5">
          <h4 className="font-semibold">{flow.confirmTitle}</h4>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {flow.confirmBody}
          </p>

          {confirmationSuccess ? (
            <div
              role="status"
              className="mt-4 rounded-lg border border-success/30 bg-success/10 p-4"
            >
              <p className="text-sm font-semibold text-foreground">
                {flow.confirmedTitle}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {confirmationMessage || flow.confirmedBody}
              </p>
            </div>
          ) : (
            <form onSubmit={confirmTransfer} className="mt-4 space-y-3">
              <div>
                <Label htmlFor="transfer-confirmation-reference">
                  {flow.transactionLabel}
                </Label>
                <Input
                  id="transfer-confirmation-reference"
                  value={transactionReference}
                  onChange={(event) =>
                    setTransactionReference(event.target.value)
                  }
                  placeholder={flow.transactionPlaceholder}
                  maxLength={200}
                  required
                  className="mt-1.5"
                />
              </div>
              <Button
                type="submit"
                disabled={
                  confirming || transactionReference.trim().length < 3
                }
                className="w-full"
              >
                {confirming ? flow.confirming : flow.confirmButton}
              </Button>
              {confirmationMessage && !confirmationSuccess && (
                <p role="alert" className="text-sm text-destructive">
                  {confirmationMessage}
                </p>
              )}
            </form>
          )}
        </div>

        <p className="text-xs leading-5 text-muted-foreground">
          {transferCopy.thirdPartyNote}
        </p>
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
          {(["one-time", "monthly"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFrequency(value)}
              aria-pressed={frequency === value}
              className={`rounded-lg border px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                frequency === value
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white hover:bg-surface"
              }`}
            >
              {value === "one-time" ? form.oneTime : form.monthly}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {form.frequencyNote}
        </p>
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
          aria-describedby={
            state.fieldErrors?.campaign ? "campaign-error" : undefined
          }
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
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {transferCopy.formHelp}
        </p>
        <div className="mt-3 grid gap-2">
          {(Object.keys(transferCopy.methods) as DonationTransferMethod[]).map(
            (method) => {
              const selected = transferMethod === method;
              const option = transferCopy.methods[method];
              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => setTransferMethod(method)}
                  aria-pressed={selected}
                  className={`rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    selected
                      ? "border-primary bg-primary-light"
                      : "border-border bg-white hover:bg-surface"
                  }`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-foreground">
                      {option.label}
                    </span>
                    {method === "bank" && (
                      <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-white">
                        {flow.recommended}
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    {option.description}
                  </span>
                </button>
              );
            },
          )}
        </div>
        <FieldError
          id="transfer-method-error"
          message={state.fieldErrors?.transferMethod}
        />
      </fieldset>

      {transferMethod !== "bank" && (
        <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning-bg p-4 text-xs leading-5 text-warning-fg">
          <ShieldCheck
            className="mt-0.5 h-4 w-4 shrink-0"
            aria-hidden="true"
          />
          <p>
            {transferMethod === "worldremit"
              ? flow.worldRemitEligibility
              : flow.remitlyEligibility}
          </p>
        </div>
      )}

      <input type="hidden" name="transferMethod" value={transferMethod} />
      <input
        type="hidden"
        name="donationReference"
        value={donationReference}
      />

      <div className="rounded-lg border border-primary/20 bg-primary-light p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {transferCopy.referenceLabel}
        </p>
        <p className="mt-1 font-mono text-sm font-bold text-foreground">
          {donationReference || "…"}
        </p>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          {transferCopy.referenceHelp}
        </p>
        <FieldError
          id="donation-reference-error"
          message={state.fieldErrors?.donationReference}
        />
      </div>

      <div>
        <Label htmlFor="donor-name">{form.nameLabel}</Label>
        <Input
          id="donor-name"
          name="name"
          required
          className="mt-1.5"
          aria-invalid={state.fieldErrors?.name ? true : undefined}
          aria-describedby={
            state.fieldErrors?.name ? "donor-name-error" : undefined
          }
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
          aria-describedby={
            state.fieldErrors?.email ? "donor-email-error" : undefined
          }
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
          aria-describedby={
            state.fieldErrors?.phone ? "donor-phone-error" : undefined
          }
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
          aria-describedby={
            state.fieldErrors?.message ? "donor-message-error" : undefined
          }
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
        <p className="text-center text-xs leading-5 text-muted-foreground">
          {flow.saveHelp}
        </p>
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

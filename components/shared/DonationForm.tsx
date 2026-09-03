"use client";

import { useState } from "react";
import { useActionState } from "react";
import { submitDonor, FormState } from "@/app/actions";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { HoneypotFields } from "@/components/shared/HoneypotFields";
import { FieldError } from "@/components/shared/FieldError";
import { FormPrivacyNotice } from "@/components/shared/FormPrivacyNotice";
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
  const [state, formAction, pending] = useActionState(submitDonor, initialState);

  const displayAmount = custom || amount || "";

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <HoneypotFields withIdempotency />

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
          onChange={(e) => {
            setCustom(e.target.value);
            setAmount("");
          }}
          className="mt-1.5"
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
          className="mt-1.5"
          aria-invalid={state.fieldErrors?.email ? true : undefined}
          aria-describedby={state.fieldErrors?.email ? "donor-email-error" : undefined}
        />
        <FieldError id="donor-email-error" message={state.fieldErrors?.email} />
      </div>

      <div>
        <Label htmlFor="donor-phone">{form.phoneLabel}</Label>
        <Input id="donor-phone" name="phone" type="tel" className="mt-1.5" />
      </div>

      <div>
        <Label htmlFor="donor-transaction">
          {form.transactionLabel}
        </Label>
        <Input
          id="donor-transaction"
          name="transactionReference"
          placeholder={form.transactionPlaceholder}
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="donor-message">{form.messageLabel}</Label>
        <Input id="donor-message" name="message" className="mt-1.5" />
      </div>

      <Button type="submit" disabled={pending || !displayAmount} className="w-full">
        {pending ? form.submitPending : form.submitLabel}
      </Button>

      <FormPrivacyNotice
        text={form.privacyNotice}
        privacyLabel={privacyLabel}
        privacyHref={localePath("/privacy", locale)}
      />

      {state.message && (
        <p
          role="status"
          aria-live="polite"
          className={`text-sm ${state.success ? "text-success" : "text-destructive"}`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}

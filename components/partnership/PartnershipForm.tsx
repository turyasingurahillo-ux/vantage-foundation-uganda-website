"use client";

import { useActionState, useState } from "react";
import { usePathname } from "next/navigation";
import { submitContact, FormState } from "@/app/actions";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { HoneypotFields } from "@/components/shared/HoneypotFields";
import { FieldError } from "@/components/shared/FieldError";
import { FormPrivacyNotice } from "@/components/shared/FormPrivacyNotice";
import { TurnstileWidget } from "@/components/shared/TurnstileWidget";
import { CheckCircle2 } from "lucide-react";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { PartnershipType } from "@/types";

/**
 * The tailored partnership enquiry form on /partner.
 *
 * Submits through the same `submitContact` server action as the contact
 * form — same honeypot, time-trap, rate limit, Turnstile and server-side
 * validation — with `subject` fixed to "partnerships" and structured
 * mechanism/programme context validated as enums server-side.
 *
 * Selecting a mechanism tailors the message prompt; the form stays a
 * single underlying enquiry model, not six separate forms. Without JS,
 * the selects still post valid enum values — enhancement is additive.
 */
export type PartnershipFormCopy = {
  fullName: string;
  email: string;
  organisation: string;
  partnershipType: string;
  selectType: string;
  programme: string;
  selectProgramme: string;
  role: string;
  country: string;
  orgWebsite: string;
  timeline: string;
  message: string;
  sending: string;
  sendEnquiry: string;
  enquiryReceived: string;
  replyTime: string;
  contactPrivacy: string;
};

export interface MechanismChoice {
  id: PartnershipType;
  label: string;
  prompt: string;
}

const initialState: FormState = { success: false, message: "" };

export function PartnershipForm({
  defaultType = "",
  defaultProgramme = "",
  copy,
  mechanisms,
  programmes,
  locale = "en",
  privacyLabel = "Privacy Policy",
}: {
  defaultType?: PartnershipType | "";
  defaultProgramme?: string;
  copy: PartnershipFormCopy;
  mechanisms: MechanismChoice[];
  programmes: { id: string; label: string }[];
  locale?: Locale;
  privacyLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(
    submitContact,
    initialState,
  );
  const [selectedType, setSelectedType] = useState<PartnershipType | "">(
    defaultType,
  );
  const pathname = usePathname();

  if (state.success) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-lg border border-success/30 bg-success/5 p-6 text-center"
      >
        <CheckCircle2
          className="mx-auto h-10 w-10 text-success"
          aria-hidden="true"
        />
        <h3 className="mt-4 text-lg font-semibold">{copy.enquiryReceived}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{state.message}</p>
        <p className="mt-4 text-sm text-muted-foreground">{copy.replyTime}</p>
      </div>
    );
  }

  const messageLabel =
    mechanisms.find((m) => m.id === selectedType)?.prompt ?? copy.message;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <HoneypotFields />
      {/* Page of origin — informational, validated server-side. */}
      <input type="hidden" name="origin_page" value={pathname} />
      {/* Category fixed to the canonical partnership mailbox route; the
          visitor chooses a mechanism below, not a raw category. */}
      <input type="hidden" name="subject" value="partnerships" />

      <div>
        <Label htmlFor="partner-name">
          {copy.fullName} <span aria-hidden="true">*</span>
          <span className="sr-only">(required)</span>
        </Label>
        <Input
          id="partner-name"
          name="name"
          required
          autoComplete="name"
          maxLength={100}
          className="mt-1.5"
          aria-invalid={state.fieldErrors?.name ? true : undefined}
          aria-describedby={state.fieldErrors?.name ? "partner-name-error" : undefined}
        />
        <FieldError id="partner-name-error" message={state.fieldErrors?.name} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="partner-email">
            {copy.email} <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </Label>
          <Input
            id="partner-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            maxLength={254}
            className="mt-1.5"
            aria-invalid={state.fieldErrors?.email ? true : undefined}
            aria-describedby={
              state.fieldErrors?.email ? "partner-email-error" : undefined
            }
          />
          <FieldError
            id="partner-email-error"
            message={state.fieldErrors?.email}
          />
        </div>
        <div>
          <Label htmlFor="partner-role">{copy.role}</Label>
          <Input
            id="partner-role"
            name="role"
            autoComplete="organization-title"
            maxLength={150}
            className="mt-1.5"
            aria-invalid={state.fieldErrors?.role ? true : undefined}
            aria-describedby={
              state.fieldErrors?.role ? "partner-role-error" : undefined
            }
          />
          <FieldError id="partner-role-error" message={state.fieldErrors?.role} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="partner-org">
            {copy.organisation} <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </Label>
          <Input
            id="partner-org"
            name="organisation"
            required
            autoComplete="organization"
            maxLength={150}
            className="mt-1.5"
            aria-invalid={state.fieldErrors?.organisation ? true : undefined}
            aria-describedby={
              state.fieldErrors?.organisation ? "partner-org-error" : undefined
            }
          />
          <FieldError
            id="partner-org-error"
            message={state.fieldErrors?.organisation}
          />
        </div>
        <div>
          <Label htmlFor="partner-country">{copy.country}</Label>
          <Input
            id="partner-country"
            name="country"
            autoComplete="country-name"
            maxLength={100}
            className="mt-1.5"
            aria-invalid={state.fieldErrors?.country ? true : undefined}
            aria-describedby={
              state.fieldErrors?.country ? "partner-country-error" : undefined
            }
          />
          <FieldError
            id="partner-country-error"
            message={state.fieldErrors?.country}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="partner-type">
            {copy.partnershipType} <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </Label>
          <Select
            id="partner-type"
            name="partnership_type"
            required
            value={selectedType}
            onChange={(e) =>
              setSelectedType(e.target.value as PartnershipType | "")
            }
            className="mt-1.5"
            aria-invalid={
              state.fieldErrors?.partnership_type ? true : undefined
            }
            aria-describedby={
              state.fieldErrors?.partnership_type
                ? "partner-type-error"
                : undefined
            }
          >
            <option value="">{copy.selectType}</option>
            {mechanisms.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </Select>
          <FieldError
            id="partner-type-error"
            message={state.fieldErrors?.partnership_type}
          />
        </div>
        <div>
          <Label htmlFor="partner-programme">{copy.programme}</Label>
          <Select
            id="partner-programme"
            name="programme"
            defaultValue={defaultProgramme}
            className="mt-1.5"
            aria-invalid={state.fieldErrors?.programme ? true : undefined}
            aria-describedby={
              state.fieldErrors?.programme
                ? "partner-programme-error"
                : undefined
            }
          >
            <option value="">{copy.selectProgramme}</option>
            {programmes.map((prog) => (
              <option key={prog.id} value={prog.id}>
                {prog.label}
              </option>
            ))}
          </Select>
          <FieldError
            id="partner-programme-error"
            message={state.fieldErrors?.programme}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="partner-website">{copy.orgWebsite}</Label>
          <Input
            id="partner-website"
            name="org_website"
            type="url"
            inputMode="url"
            autoComplete="url"
            maxLength={200}
            className="mt-1.5"
            aria-invalid={state.fieldErrors?.org_website ? true : undefined}
            aria-describedby={
              state.fieldErrors?.org_website
                ? "partner-website-error"
                : undefined
            }
          />
          <FieldError
            id="partner-website-error"
            message={state.fieldErrors?.org_website}
          />
        </div>
        <div>
          <Label htmlFor="partner-timeline">{copy.timeline}</Label>
          <Input
            id="partner-timeline"
            name="timeline"
            maxLength={100}
            className="mt-1.5"
            aria-invalid={state.fieldErrors?.timeline ? true : undefined}
            aria-describedby={
              state.fieldErrors?.timeline ? "partner-timeline-error" : undefined
            }
          />
          <FieldError
            id="partner-timeline-error"
            message={state.fieldErrors?.timeline}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="partner-message">
          {messageLabel} <span aria-hidden="true">*</span>
          <span className="sr-only">(required)</span>
        </Label>
        <Textarea
          id="partner-message"
          name="message"
          required
          rows={5}
          maxLength={5000}
          className="mt-1.5"
          aria-invalid={state.fieldErrors?.message ? true : undefined}
          aria-describedby={
            state.fieldErrors?.message ? "partner-message-error" : undefined
          }
        />
        <FieldError
          id="partner-message-error"
          message={state.fieldErrors?.message}
        />
      </div>

      <TurnstileWidget locale={locale} />

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? copy.sending : copy.sendEnquiry}
      </Button>

      <FormPrivacyNotice
        text={copy.contactPrivacy}
        privacyLabel={privacyLabel}
        privacyHref={localePath("/privacy", locale)}
      />

      {state.message && (
        <p role="alert" aria-live="assertive" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
    </form>
  );
}

"use client";

import { useActionState } from "react";
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
import { CONTACT_CATEGORIES } from "@/lib/contact-categories";
import { CheckCircle2 } from "lucide-react";

const initialState: FormState = {
  success: false,
  message: "",
};

export function ContactForm({ defaultSubject = "" }: { defaultSubject?: string }) {
  const [state, formAction, pending] = useActionState(submitContact, initialState);

  // Success state: replace the form with a confirmation rather than leaving a
  // filled-in form on screen. Names no mailbox — internal routing stays internal.
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
        <h3 className="mt-4 text-lg font-semibold">Message received</h3>
        <p className="mt-2 text-sm text-muted-foreground">{state.message}</p>
        <p className="mt-4 text-sm text-muted-foreground">
          We aim to reply within five working days.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <HoneypotFields />

      <div>
        <Label htmlFor="name">
          Full name <span aria-hidden="true">*</span>
          <span className="sr-only">(required)</span>
        </Label>
        <Input
          id="name"
          name="name"
          required
          autoComplete="name"
          maxLength={100}
          className="mt-1.5"
          aria-invalid={state.fieldErrors?.name ? true : undefined}
          aria-describedby={state.fieldErrors?.name ? "name-error" : undefined}
        />
        <FieldError id="name-error" message={state.fieldErrors?.name} />
      </div>

      <div>
        <Label htmlFor="email">
          Email <span aria-hidden="true">*</span>
          <span className="sr-only">(required)</span>
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          maxLength={254}
          className="mt-1.5"
          aria-invalid={state.fieldErrors?.email ? true : undefined}
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
        />
        <FieldError id="email-error" message={state.fieldErrors?.email} />
      </div>

      <div>
        <Label htmlFor="organisation">Organisation (optional)</Label>
        <Input
          id="organisation"
          name="organisation"
          autoComplete="organization"
          maxLength={150}
          className="mt-1.5"
          aria-invalid={state.fieldErrors?.organisation ? true : undefined}
          aria-describedby={
            state.fieldErrors?.organisation ? "organisation-error" : undefined
          }
        />
        <FieldError
          id="organisation-error"
          message={state.fieldErrors?.organisation}
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          maxLength={40}
          className="mt-1.5"
          aria-invalid={state.fieldErrors?.phone ? true : undefined}
          aria-describedby={state.fieldErrors?.phone ? "phone-error" : undefined}
        />
        <FieldError id="phone-error" message={state.fieldErrors?.phone} />
      </div>

      <div>
        <Label htmlFor="subject">
          What is your message about? <span aria-hidden="true">*</span>
          <span className="sr-only">(required)</span>
        </Label>
        <Select
          id="subject"
          name="subject"
          required
          defaultValue={defaultSubject}
          className="mt-1.5"
          aria-invalid={state.fieldErrors?.subject ? true : undefined}
          aria-describedby={
            state.fieldErrors?.subject ? "subject-error" : "subject-hint"
          }
        >
          <option value="">Select a category</option>
          {CONTACT_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </Select>
        <p id="subject-hint" className="mt-1.5 text-xs text-muted-foreground">
          Choosing a category helps us route your message to the right team.
        </p>
        <FieldError id="subject-error" message={state.fieldErrors?.subject} />
      </div>

      <div>
        <Label htmlFor="message">
          Message <span aria-hidden="true">*</span>
          <span className="sr-only">(required)</span>
        </Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={6}
          maxLength={5000}
          className="mt-1.5"
          aria-invalid={state.fieldErrors?.message ? true : undefined}
          aria-describedby={state.fieldErrors?.message ? "message-error" : undefined}
        />
        <FieldError id="message-error" message={state.fieldErrors?.message} />
      </div>

      <TurnstileWidget />

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Sending..." : "Send message"}
      </Button>

      <FormPrivacyNotice text="We will only use your details to respond to your enquiry. See our" />

      {state.message && (
        <p
          role="alert"
          aria-live="assertive"
          className="text-sm text-destructive"
        >
          {state.message}
        </p>
      )}
    </form>
  );
}

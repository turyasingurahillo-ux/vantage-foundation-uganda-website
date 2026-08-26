"use client";

import { useState } from "react";
import {
  CASE_SOURCES,
  CASE_TYPES,
  CASE_PRIORITIES,
} from "@/lib/case-types";
import { CONTACT_CATEGORIES } from "@/lib/contact-categories";

interface ManualIntakeFormProps {
  csrfToken: string;
  csrfFieldName: string;
}

const MAX_NAME = 100;
const MAX_ORGANISATION = 150;
const MAX_PHONE = 40;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;

/**
 * Manual external enquiry intake form.
 *
 * Creates a case from a non-website source (WhatsApp, phone, social media,
 * referral, walk-in, direct email, other). Posts to
 * /api/admin/cases/intake as a normal form (works without JS).
 *
 * Progressive disclosure: the form is hidden behind a "Log enquiry" button
 * so it doesn't clutter the inbox. Email is optional for non-email sources.
 */
export function ManualIntakeForm({
  csrfToken,
  csrfFieldName,
}: ManualIntakeFormProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [source, setSource] = useState("whatsapp");

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {open ? "Close" : "Log enquiry"}
      </button>

      {open && (
        <form
          method="post"
          action="/api/admin/cases/intake"
          className="mt-4 space-y-4 rounded-xl border border-border bg-white p-6"
          onSubmit={(e) => {
            setPending(true);
            void e;
          }}
        >
          <input type="hidden" name={csrfFieldName} value={csrfToken} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="intake-name"
                className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Contact name *
              </label>
              <input
                id="intake-name"
                name="name"
                type="text"
                required
                maxLength={MAX_NAME}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div>
              <label
                htmlFor="intake-source"
                className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Source *
              </label>
              <select
                id="intake-source"
                name="source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {CASE_SOURCES.filter((s) => s.value !== "website_form").map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="intake-email"
                className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Email {source === "email" ? "*" : "(optional)"}
              </label>
              <input
                id="intake-email"
                name="email"
                type="email"
                maxLength={MAX_EMAIL}
                required={source === "email"}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div>
              <label
                htmlFor="intake-phone"
                className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Phone {source === "whatsapp" || source === "phone" ? "*" : "(optional)"}
              </label>
              <input
                id="intake-phone"
                name="phone"
                type="tel"
                maxLength={MAX_PHONE}
                required={source === "whatsapp" || source === "phone"}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div>
              <label
                htmlFor="intake-organisation"
                className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Organisation (optional)
              </label>
              <input
                id="intake-organisation"
                name="organisation"
                type="text"
                maxLength={MAX_ORGANISATION}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div>
              <label
                htmlFor="intake-category"
                className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Category *
              </label>
              <select
                id="intake-category"
                name="category"
                required
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {CONTACT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="intake-caseType"
                className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Case type (optional)
              </label>
              <select
                id="intake-caseType"
                name="caseType"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="">—</option>
                {CASE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="intake-priority"
                className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Priority
              </label>
              <select
                id="intake-priority"
                name="priority"
                defaultValue="normal"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {CASE_PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="intake-message"
              className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Enquiry details *
            </label>
            <textarea
              id="intake-message"
              name="message"
              required
              rows={4}
              maxLength={MAX_MESSAGE}
              placeholder="Summarise the enquiry or request…"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {pending ? "Creating…" : "Create case"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

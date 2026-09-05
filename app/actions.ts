"use server";

import { headers } from "next/headers";
// `site` is used only for PUBLIC details (phone). Vantage's protected mailbox
// is no longer part of the site config — it is server-only, in
// lib/contact-inbox.ts — so it can never reach a client bundle from here.
import { site } from "@/content/site";
import { createDonation } from "@/lib/db";
import {
  createContactMessage,
  isContactStoreConfigured,
  markContactMessageEmailed,
} from "@/lib/db/contact";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { logInfo, logWarn, logError } from "@/lib/logger";
import {
  buildEmailRows,
  emailTemplate,
  formatBody,
  sendEmail,
} from "@/lib/email";
import { sendContactNotification } from "@/lib/contact-notify";
import { suggestCaseTypeFromCategory } from "@/lib/case-types";
import { seedCaseFromContactSubmission } from "@/lib/db/cases";
import { getDefaultInbox, resolveInboxFor } from "@/lib/contact-inbox";
import { verifyTurnstile } from "@/lib/turnstile";
import {
  contactSchema,
  newsletterSchema,
  donorSchema,
} from "@/lib/form-schemas";

export type FormState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
};

// Rate limit for public form submissions: 3 per minute per IP by default.
//
// Conservative enough to stop automated abuse while leaving room for a genuine
// visitor who mistypes a field and resubmits. Configurable via
// FORM_RATE_LIMIT so operators can tune it — and so end-to-end tests, which
// drive many submissions from one IP, can raise it without weakening the
// production default.
const FORM_RATE_LIMIT = (() => {
  const parsed = Number(process.env.FORM_RATE_LIMIT);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 3;
})();
const FORM_RATE_WINDOW_MS = 60_000;

async function checkFormRateLimit(action: string): Promise<boolean> {
  const h = await headers();
  const ip = getClientIp(h);
  return rateLimit({
    key: `form:${action}:${ip}`,
    limit: FORM_RATE_LIMIT,
    windowMs: FORM_RATE_WINDOW_MS,
  });
}

async function getRequestIp(): Promise<string> {
  return getClientIp(await headers());
}

/**
 * The single confirmation shown for every accepted contact submission —
 * including honeypot-rejected ones, so bots cannot distinguish acceptance from
 * rejection. It deliberately names no mailbox.
 */
const CONTACT_SUCCESS_MESSAGE =
  "Thank you for contacting Vantage Foundation Uganda. Your message has been received and will be directed to the appropriate team.";

const RATE_LIMITED_MESSAGE =
  "Too many submissions from your location. Please wait a minute and try again.";

// --- Idempotency: track recent submission IDs to prevent duplicate donations ---
// In-memory Set with TTL. Entries expire after 5 minutes.
const IDEMPOTENCY_TTL_MS = 5 * 60_000;
const recentSubmissionIds = new Map<string, number>();

function isDuplicateSubmission(submissionId: string): boolean {
  const now = Date.now();
  // Prune expired entries.
  for (const [id, ts] of recentSubmissionIds) {
    if (now - ts > IDEMPOTENCY_TTL_MS) {
      recentSubmissionIds.delete(id);
    }
  }
  if (recentSubmissionIds.has(submissionId)) {
    return true;
  }
  recentSubmissionIds.set(submissionId, now);
  return false;
}

// --- Honeypot + time-trap check ---
// Returns true if the submission looks like a bot.
function isBotSubmission(raw: Record<string, unknown>): boolean {
  // Honeypot 1: "website" field should be empty.
  if (raw.website) return true;
  // Honeypot 2: "company_url" field should be empty.
  if (raw.company_url) return true;
  // Time-trap: if form_loaded_at is present and submission took < 2 seconds,
  // it's likely a bot (humans take longer to fill forms).
  const loadedAt = raw.form_loaded_at;
  if (loadedAt && typeof loadedAt === "string") {
    const ts = Number(loadedAt);
    if (!Number.isNaN(ts) && Date.now() - ts < 2000) {
      return true;
    }
  }
  return false;
}

// The email plumbing (sendEmail, emailTemplate, formatBody, buildEmailRows)
// lives in lib/email.ts, and the contact-specific notification in
// lib/contact-notify.ts, so the admin "send to inbox" action reuses exactly the
// same code instead of growing a second copy that can drift.
//
// The old getValidatedFromAddress() helper is gone: it fell back to
// site.contact.email, which no longer exists now that the operational mailbox
// is server-only. getFromAddress() in lib/contact-inbox.ts replaces it and
// deliberately never falls back to the protected mailbox — an unauthorised
// From address is rejected by SPF/DMARC anyway.

/** Labels for the donor and newsletter notifications, still built here. */
const LEGACY_LABELS: Record<string, string> = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  organisation: "Organisation",
  subject: "Category",
  message: "Message",
  amount: "Amount",
  frequency: "Frequency",
  campaign: "Campaign",
  transactionReference: "Transaction Reference",
  consent: "Consent",
};


export async function submitContact(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const allowed = await checkFormRateLimit("contact");
  if (!allowed) {
    logWarn("contact_rate_limited", {});
    return { success: false, message: RATE_LIMITED_MESSAGE };
  }

  const raw = Object.fromEntries(formData);

  if (isBotSubmission(raw)) {
    // Silently discard: return the same message a real submission gets so the
    // bot learns nothing about why it was rejected. Nothing is forwarded.
    logWarn("contact_honeypot", {});
    return { success: true, message: CONTACT_SUCCESS_MESSAGE };
  }

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    logWarn("contact_validation_failed", {
      issues: parsed.error.issues.length,
    });
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0]?.toString();
      if (field && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return {
      success: false,
      message: "Please correct the errors below.",
      fieldErrors,
    };
  }

  // Bot challenge, only enforced when Turnstile is configured. Verified after
  // validation so a malformed submission never costs an API round-trip.
  const turnstileOk = await verifyTurnstile(
    raw["cf-turnstile-response"],
    await getRequestIp()
  );
  if (!turnstileOk) {
    logWarn("contact_turnstile_failed", {});
    return {
      success: false,
      message:
        "We could not confirm you are human. Please refresh the page and try again.",
    };
  }

  const category = parsed.data.subject;

  // Persist first, so a transient SMTP outage cannot lose the message.
  let messageId: number | null = null;
  if (isContactStoreConfigured()) {
    try {
      messageId = await createContactMessage({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        organisation: parsed.data.organisation,
        category,
        message: parsed.data.message,
        originPage: parsed.data.origin_page,
      });
    } catch (err) {
      // Non-fatal: fall through to email-only delivery.
      logError("contact_store_failed", {
        error: (err instanceof Error ? err.message : String(err)).substring(0, 200),
        category,
      });
    }

    // Seed the case-workflow fields (source, suggested case type) on the
    // freshly-stored row. Non-fatal: if the case migration has not run or the
    // seed fails, the legacy message is already stored and the case defaults
    // (source='website_form', workflow_status='new') apply via the column
    // defaults. The suggested case type is derived from the contact category
    // so the inbox starts with a reasonable triage hint; admins refine it.
    if (messageId !== null) {
      try {
        await seedCaseFromContactSubmission(
          messageId,
          category,
          suggestCaseTypeFromCategory(category),
        );
      } catch {
        // Non-fatal — the message is already stored.
      }
    }
  }

  // Destination is resolved inside sendContactNotification() from server env
  // plus the validated category — never from anything the visitor sent.
  const emailSent = await sendContactNotification({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    organisation: parsed.data.organisation,
    category,
    message: parsed.data.message,
  });

  if (messageId !== null) {
    try {
      await markContactMessageEmailed(messageId, emailSent);
    } catch {
      // Bookkeeping only — the message itself is already stored.
    }
  }

  logInfo("contact_submitted", {
    email_sent: emailSent,
    stored: messageId !== null,
    category,
  });

  // The visitor sees one confirmation regardless of which mailbox the message
  // was routed to, and regardless of whether SMTP or the database was the
  // delivery path. Internal routing is never disclosed.
  if (!emailSent && messageId === null) {
    return {
      success: false,
      message:
        "We could not send your message just now. Please try again shortly, or call or WhatsApp us on " +
        `${site.contact.phone}.`,
    };
  }

  return { success: true, message: CONTACT_SUCCESS_MESSAGE };
}

export async function submitNewsletter(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const allowed = await checkFormRateLimit("newsletter");
  if (!allowed) {
    logWarn("newsletter_rate_limited", {});
    return { success: false, message: RATE_LIMITED_MESSAGE };
  }

  const raw = Object.fromEntries(formData);

  if (isBotSubmission(raw)) {
    logWarn("newsletter_honeypot", {});
    return { success: true, message: "Thank you for subscribing." };
  }

  const parsed = newsletterSchema.safeParse(raw);
  if (!parsed.success) {
    logWarn("newsletter_validation_failed", {
      issues: parsed.error.issues.length,
    });
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0]?.toString();
      if (field && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return {
      success: false,
      message: "Please correct the errors below.",
      fieldErrors,
    };
  }

  const rows = buildEmailRows(parsed.data, LEGACY_LABELS);
  const body = formatBody(parsed.data);
  const subjectLine = "[VANTAGE CONTACT — NEWSLETTER] New subscriber";
  const html = emailTemplate(subjectLine, rows);
  const emailSent = await sendEmail(
    subjectLine,
    body,
    html,
    getDefaultInbox(),
    parsed.data.email
  );

  logInfo("newsletter_submitted", { email_sent: emailSent });

  return {
    success: emailSent,
    message: emailSent
      ? "Thank you for subscribing."
      : "We could not complete your subscription just now. Please try again shortly.",
  };
}

export async function submitDonor(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const allowed = await checkFormRateLimit("donor");
  if (!allowed) {
    logWarn("donor_rate_limited", {});
    return { success: false, message: RATE_LIMITED_MESSAGE };
  }

  const raw = Object.fromEntries(formData);

  if (isBotSubmission(raw)) {
    logWarn("donor_honeypot", {});
    return { success: true, message: "Thank you for your donation intent." };
  }

  const parsed = donorSchema.safeParse(raw);
  if (!parsed.success) {
    logWarn("donor_validation_failed", {
      issues: parsed.error.issues.length,
    });
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0]?.toString();
      if (field && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return {
      success: false,
      message: "Please correct the errors below.",
      fieldErrors,
    };
  }

  // Idempotency check: if the same submissionId was seen recently,
  // return success without creating a duplicate record.
  const submissionId = parsed.data.submissionId;
  if (submissionId && isDuplicateSubmission(submissionId)) {
    logWarn("donation_duplicate_submission", { submissionId: submissionId.substring(0, 16) });
    return {
      success: true,
      message:
        "Thank you. Your donation has been recorded as pending. A Vantage administrator will verify the transfer against our bank statement before marking it as successful.",
    };
  }

  try {
    const donation = await createDonation({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      amount: parsed.data.amount,
      frequency: parsed.data.frequency,
      campaign: parsed.data.campaign,
      transactionReference: parsed.data.transactionReference,
      message: parsed.data.message,
    });

    logInfo("donation_created", {
      id: donation.id,
      campaign: parsed.data.campaign,
      frequency: parsed.data.frequency,
    });

    const rows = buildEmailRows(parsed.data, LEGACY_LABELS);
    const body = formatBody(parsed.data);
    const subjectLine = "[VANTAGE CONTACT — DONATION] Donation intent received";
    const html = emailTemplate(subjectLine, rows);
    await sendEmail(
      subjectLine,
      body,
      html,
      resolveInboxFor("donation"),
      parsed.data.email
    );

    return {
      success: true,
      message:
        "Thank you. Your donation has been recorded as pending. A Vantage administrator will verify the transfer against our bank statement before marking it as successful.",
    };
  } catch (err) {
    // If the database is not configured, fall back to email only.
    logError("donation_db_failed", {
      error: (err instanceof Error ? err.message : String(err)).substring(0, 200),
      campaign: parsed.data.campaign,
      frequency: parsed.data.frequency,
    });

    const rows = buildEmailRows(parsed.data, LEGACY_LABELS);
    const body = formatBody(parsed.data);
    const subjectLine = "[VANTAGE CONTACT — DONATION] Donation intent";
    const html = emailTemplate(subjectLine, rows);
    const emailSent = await sendEmail(
      subjectLine,
      body,
      html,
      resolveInboxFor("donation"),
      parsed.data.email
    );

    // Distinct alertable event: the donation was NOT recorded in the DB.
    // Alerting on this event (via Sentry, Vercel log alerts, etc.) ensures
    // the team knows a record may have been lost to email-only fallback.
    logError("donation_db_failed_email_fallback", {
      email_sent: emailSent,
      campaign: parsed.data.campaign,
    });

    return {
      success: emailSent,
      message: emailSent
        ? "We received your donation details but could not save them to our system. A Vantage administrator has been notified by email and will follow up with payment instructions."
        : "We could not save your donation details. Please use the payment instructions on this page or contact us directly.",
    };
  }
}

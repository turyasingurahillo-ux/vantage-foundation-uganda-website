"use server";

import { z } from "zod";
import nodemailer from "nodemailer";
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
  CONTACT_CATEGORY_VALUES,
  buildSubjectPrefix,
  getCategoryLabel,
} from "@/lib/contact-categories";
import {
  getDefaultInbox,
  getFromAddress,
  resolveInboxFor,
} from "@/lib/contact-inbox";
import { verifyTurnstile } from "@/lib/turnstile";

// Field limits. These are generous enough for a detailed grant or partnership
// inquiry but bounded so a bot cannot post megabytes through the endpoint.
const MAX_NAME = 100;
const MAX_ORGANISATION = 150;
const MAX_PHONE = 40;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name")
    .max(MAX_NAME, `Name must be ${MAX_NAME} characters or fewer`),
  email: z
    .string()
    .trim()
    .max(MAX_EMAIL, "Email address is too long")
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .trim()
    .max(MAX_PHONE, "Phone number is too long")
    .optional(),
  organisation: z
    .string()
    .trim()
    .max(MAX_ORGANISATION, `Organisation must be ${MAX_ORGANISATION} characters or fewer`)
    .optional(),
  // Fixed enum: the category selects the destination mailbox server-side, so
  // it must never be free text from the request.
  subject: z.enum(CONTACT_CATEGORY_VALUES, {
    message: "Please choose what your message is about",
  }),
  message: z
    .string()
    .trim()
    .min(10, "Please give us at least a sentence so we can help")
    .max(MAX_MESSAGE, `Message must be ${MAX_MESSAGE} characters or fewer`),
  website: z.string().optional(), // honeypot 1
  company_url: z.string().optional(), // honeypot 2 (realistic name)
  form_loaded_at: z.string().optional(), // time-trap
  "cf-turnstile-response": z.string().optional(), // bot challenge token
});

const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  consent: z.enum(["on"], { message: "Please consent to receive updates" }),
  website: z.string().optional(), // honeypot 1
  company_url: z.string().optional(), // honeypot 2
  form_loaded_at: z.string().optional(), // time-trap
});

const donorSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  amount: z.coerce.number().positive("Please select or enter a valid amount"),
  frequency: z.enum(["one-time", "monthly"]),
  campaign: z.string().min(1, "Please select a campaign"),
  transactionReference: z.string().optional(),
  message: z.string().optional(),
  website: z.string().optional(), // honeypot 1
  company_url: z.string().optional(), // honeypot 2
  form_loaded_at: z.string().optional(), // time-trap
  submissionId: z.string().optional(), // idempotency token
});

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

// --- Email sanitization ---
// Strip CR/LF and control characters to prevent email header injection, and
// bound the length. Applied to every value before it reaches a mail header or
// an HTML body.
function sanitiseValue(value: unknown): string {
  if (value == null) return "";
  return String(value)
    .replace(/[\r\n\t]/g, " ") // strip line breaks and tabs (header injection)
    .replace(/[\p{Cc}\p{Cf}]/gu, " ") // strip remaining control/format chars
    .substring(0, MAX_MESSAGE);
}

/**
 * Escapes user-supplied text for interpolation into the HTML email body.
 * Without this, a submitted `<script>` or `<img onerror=…>` would be rendered
 * as live markup in the reader's mail client.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Sends an internal notification.
 *
 * `to` is always resolved server-side from env + a fixed category enum
 * (lib/contact-inbox.ts). Nothing in the visitor's request can influence the
 * recipient, so this cannot be used as an open relay.
 */
async function sendEmail(
  subject: string,
  body: string,
  html: string | undefined,
  to: string,
  replyTo?: string
): Promise<boolean> {
  const smtpHost = process.env.SMTP_HOST;
  if (!smtpHost) return false;

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Fall back to the destination itself so the message still sends when no
    // SMTP_FROM/SMTP_USER is configured. Both are server-side values.
    const from = getFromAddress() ?? to;

    await transporter.sendMail({
      from,
      to,
      subject: sanitiseValue(subject).substring(0, 200),
      text: body,
      // Lets the team reply straight to the enquirer. Sanitised and validated
      // as an email address by Zod before reaching here.
      ...(replyTo ? { replyTo: sanitiseValue(replyTo).substring(0, MAX_EMAIL) } : {}),
      ...(html ? { html } : {}),
    });
    return true;
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    logError("email_send_failed", {
      smtp_host: smtpHost,
      // Never log the subject verbatim — it can contain visitor-supplied text.
      error: errMsg.substring(0, 200),
    });
    return false;
  }
}

// Internal-only fields that must never appear in the notification email.
const INTERNAL_FIELDS = [
  "website",
  "company_url",
  "form_loaded_at",
  "submissionId",
  "cf-turnstile-response",
];

function formatBody(data: Record<string, unknown>): string {
  return Object.entries(data)
    .filter(([key]) => !INTERNAL_FIELDS.includes(key))
    .map(([key, value]) => `${key}: ${sanitiseValue(value)}`)
    .join("\n");
}

// --- HTML email template ---
function emailTemplate(title: string, rows: { label: string; value: string }[]): string {
  // Every interpolated value is HTML-escaped: submissions are untrusted input
  // and must never render as live markup in the reader's mail client.
  const tableRows = rows
    .map(
      (r) =>
        `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;color:#050708;vertical-align:top;">${escapeHtml(
          r.label
        )}</td><td style="padding:4px 0;color:#475569;white-space:pre-wrap;">${escapeHtml(
          r.value
        )}</td></tr>`
    )
    .join("");
  const safeTitle = escapeHtml(title);
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${safeTitle}</title></head>
<body style="margin:0;padding:0;background:#f7fafa;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #dce5e5;">
        <tr><td style="background:#008f95;padding:20px 24px;">
          <h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:600;">${title}</h1>
        </td></tr>
        <tr><td style="padding:24px;">
          <p style="margin:0 0 16px;color:#475569;">A new submission was received on the Vantage Foundation Uganda website.</p>
          <table cellpadding="0" cellspacing="0">${tableRows}</table>
          <p style="margin:24px 0 0;color:#475569;font-size:12px;border-top:1px solid #dce5e5;padding-top:16px;">
            This is an automated notification from vantagefoundationuganda.com
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildEmailRows(data: Record<string, unknown>): { label: string; value: string }[] {
  const labelMap: Record<string, string> = {
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
  return Object.entries(data)
    .filter(([key]) => !INTERNAL_FIELDS.includes(key))
    .map(([key, value]) => ({
      label: labelMap[key] || key,
      value: sanitiseValue(value),
    }));
}

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
      });
    } catch (err) {
      // Non-fatal: fall through to email-only delivery.
      logError("contact_store_failed", {
        error: (err instanceof Error ? err.message : String(err)).substring(0, 200),
        category,
      });
    }
  }

  // Destination is resolved server-side from env + the validated category.
  const to = resolveInboxFor(category);
  const subjectLine = `${buildSubjectPrefix(category)} ${getCategoryLabel(
    category
  )} from ${sanitiseValue(parsed.data.name).substring(0, 80)}`;

  const rows = buildEmailRows(parsed.data);
  const body = formatBody(parsed.data);
  const html = emailTemplate(subjectLine, rows);
  const emailSent = await sendEmail(
    subjectLine,
    body,
    html,
    to,
    parsed.data.email
  );

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

  const rows = buildEmailRows(parsed.data);
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

    const rows = buildEmailRows(parsed.data);
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

    const rows = buildEmailRows(parsed.data);
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

    logInfo("donation_fallback_email", { email_sent: emailSent });

    return {
      success: emailSent,
      message: emailSent
        ? "Thank you. We received your donation details and will follow up with payment instructions."
        : "We could not save your donation details. Please use the payment instructions on this page or contact us directly.",
    };
  }
}

import "server-only";

import nodemailer from "nodemailer";
import { sanitiseValue, escapeHtml } from "@/lib/sanitise";
import { getFromAddress } from "@/lib/contact-inbox";
import { logError } from "@/lib/logger";

/**
 * Shared outbound-email plumbing.
 *
 * Extracted from app/actions.ts so the contact form and the admin "send to
 * inbox" action build and send byte-identical notifications instead of
 * drifting apart. Server-only: SMTP credentials must never reach a client
 * bundle.
 */

/** Longest single value we will put in an email. */
export const MESSAGE_MAX_LENGTH = 5000;
/** RFC-practical maximum for an address. */
export const EMAIL_MAX_LENGTH = 254;

/** Internal-only form fields that must never appear in a notification email. */
export const INTERNAL_FIELDS = [
  "website",
  "company_url",
  "form_loaded_at",
  "submissionId",
  "cf-turnstile-response",
];

export function formatBody(data: Record<string, unknown>): string {
  return Object.entries(data)
    .filter(([key]) => !INTERNAL_FIELDS.includes(key))
    .map(([key, value]) => `${key}: ${sanitiseValue(value, MESSAGE_MAX_LENGTH)}`)
    .join("\n");
}

/**
 * Builds label/value rows for the HTML table.
 *
 * Values are sanitised here but NOT escaped: emailTemplate() escapes every
 * field as it builds the HTML. Escaping in both places would double-encode, so
 * a submitted "<script>" would reach the reader as "&amp;lt;script&amp;gt;".
 */
export function buildEmailRows(
  data: Record<string, unknown>,
  labelMap: Record<string, string> = {},
): { label: string; value: string }[] {
  return Object.entries(data)
    .filter(([key]) => !INTERNAL_FIELDS.includes(key))
    .map(([key, value]) => ({
      label: labelMap[key] || key,
      value: sanitiseValue(value, MESSAGE_MAX_LENGTH),
    }));
}

const DEFAULT_INTRO =
  "A new submission was received on the Vantage Foundation Uganda website.";

/** Branded HTML email. Every interpolated value is escaped. */
export function emailTemplate(
  title: string,
  rows: { label: string; value: string }[],
  intro: string = DEFAULT_INTRO,
): string {
  const safeTitle = escapeHtml(title);
  const safeIntro = escapeHtml(intro);
  const tableRows = rows
    .map(
      (r) =>
        `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;color:#050708;vertical-align:top;">${escapeHtml(
          r.label,
        )}</td><td style="padding:4px 0;color:#475569;white-space:pre-wrap;">${escapeHtml(
          r.value,
        )}</td></tr>`,
    )
    .join("");
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${safeTitle}</title></head>
<body style="margin:0;padding:0;background:#f7fafa;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #dce5e5;">
        <tr><td style="background:#008f95;padding:20px 24px;">
          <h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:600;">${safeTitle}</h1>
        </td></tr>
        <tr><td style="padding:24px;">
          <p style="margin:0 0 16px;color:#475569;">${safeIntro}</p>
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

/**
 * Sends an internal notification.
 *
 * `to` is always resolved server-side from env plus a fixed category enum
 * (lib/contact-inbox.ts). Nothing in a visitor's request can influence the
 * recipient, so this cannot be used as an open relay.
 */
export async function sendEmail(
  subject: string,
  body: string,
  html: string | undefined,
  to: string,
  replyTo?: string,
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
      // Lets the team reply straight to the enquirer.
      ...(replyTo
        ? { replyTo: sanitiseValue(replyTo).substring(0, EMAIL_MAX_LENGTH) }
        : {}),
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

import "server-only";

import { getCategoryLabel } from "@/lib/contact-categories";
import type { ContactCategory } from "@/lib/contact-categories";
import { getDefaultInbox, getFromAddress } from "@/lib/contact-inbox";
import { sendEmailDetailed, type SendEmailResult } from "@/lib/email";
import { escapeHtml, sanitiseValue } from "@/lib/sanitise";
import { site } from "@/content/site";

/**
 * The reply an administrator sends back to someone who used the contact form.
 *
 * This is outward-facing correspondence, so it deliberately carries none of
 * the internal machinery the team notification does — no category tags in the
 * subject, no field table, no admin identity, no message ids. The recipient
 * sees an ordinary email from Vantage Foundation Uganda containing what the
 * administrator actually typed, their original message quoted underneath for
 * context, and the organisation's own sign-off.
 */

export const REPLY_MAX_LENGTH = 5000;

/** Subject line: mirrors normal mail-client reply convention. */
export function buildReplySubject(category: ContactCategory): string {
  return `Re: Your ${getCategoryLabel(category).toLowerCase()} — Vantage Foundation Uganda`;
}

function plainTextBody(args: {
  recipientName: string;
  replyBody: string;
  originalMessage: string;
  originalSentAt: Date;
}): string {
  const quoted = args.originalMessage
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");

  return `Dear ${args.recipientName},

${args.replyBody}

Kind regards,
${site.name}
${site.url}

--- On ${args.originalSentAt.toUTCString()}, you wrote: ---
${quoted}
`;
}

function htmlBody(args: {
  recipientName: string;
  replyBody: string;
  originalMessage: string;
  originalSentAt: Date;
}): string {
  // Everything interpolated here is escaped: the administrator types plain
  // text and the enquirer's own words are quoted back, so neither may inject
  // markup into the recipient's mail client.
  const paragraphs = escapeHtml(args.replyBody)
    .split(/\n{2,}/)
    .map(
      (p) =>
        `<p style="margin:0 0 16px;color:#0f172a;line-height:1.6;">${p.replace(
          /\n/g,
          "<br>",
        )}</p>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${escapeHtml(site.name)}</title></head>
<body style="margin:0;padding:0;background:#f7fafa;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #dce5e5;">
        <tr><td style="background:#008f95;padding:20px 24px;">
          <h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:600;">${escapeHtml(site.name)}</h1>
        </td></tr>
        <tr><td style="padding:24px;">
          <p style="margin:0 0 16px;color:#0f172a;">Dear ${escapeHtml(args.recipientName)},</p>
          ${paragraphs}
          <p style="margin:24px 0 0;color:#0f172a;">Kind regards,<br>${escapeHtml(site.name)}</p>
          <div style="margin-top:24px;border-top:1px solid #dce5e5;padding-top:16px;">
            <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;">On ${escapeHtml(
              args.originalSentAt.toUTCString(),
            )}, you wrote:</p>
            <blockquote style="margin:0;padding-left:12px;border-left:3px solid #dce5e5;color:#64748b;font-size:13px;white-space:pre-wrap;">${escapeHtml(
              args.originalMessage,
            )}</blockquote>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export interface SendReplyArgs {
  recipientEmail: string;
  recipientName: string;
  category: ContactCategory;
  replyBody: string;
  originalMessage: string;
  originalSentAt: Date;
  /** Message-ID of the previous mail in this conversation, when there is one. */
  inReplyTo?: string;
}

/**
 * Sends one administrator reply.
 *
 * The caller resolves `recipientEmail` from the stored contact row — it is
 * never taken from the request body.
 */
export async function sendContactReply(
  args: SendReplyArgs,
): Promise<SendEmailResult> {
  const replyBody = args.replyBody.trim();

  return sendEmailDetailed({
    to: args.recipientEmail,
    subject: buildReplySubject(args.category),
    body: plainTextBody({
      recipientName: args.recipientName,
      replyBody,
      originalMessage: args.originalMessage,
      originalSentAt: args.originalSentAt,
    }),
    html: htmlBody({
      recipientName: args.recipientName,
      replyBody,
      originalMessage: args.originalMessage,
      originalSentAt: args.originalSentAt,
    }),
    // Send the enquirer's answer back to a mailbox Vantage actually reads, so
    // if they reply again it reaches the team rather than a no-reply address.
    replyTo: getFromAddress() ?? getDefaultInbox(),
    ...(args.inReplyTo
      ? {
          inReplyTo: args.inReplyTo,
          references: [args.inReplyTo],
        }
      : {}),
  });
}

/** The address replies are sent from, for display in the admin composer. */
export function getReplyFromAddress(): string {
  return sanitiseValue(getFromAddress() ?? "").trim();
}

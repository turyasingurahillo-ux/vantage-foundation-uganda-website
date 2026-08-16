import "server-only";

import type { ContactCategory } from "@/lib/contact-categories";
import { buildSubjectPrefix, getCategoryLabel } from "@/lib/contact-categories";
import { resolveInboxFor } from "@/lib/contact-inbox";
import {
  buildEmailRows,
  emailTemplate,
  formatBody,
  sendEmail,
} from "@/lib/email";
import { sanitiseValue } from "@/lib/sanitise";

/**
 * Builds and sends the internal notification for one contact submission.
 *
 * Shared by the public form (app/actions.ts) and the admin "send to inbox"
 * action, so a re-sent notification is identical to the original apart from
 * its intro line. The destination comes from the validated category plus
 * server env — never from user input.
 */

const LABELS: Record<string, string> = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  organisation: "Organisation",
  subject: "Category",
  message: "Message",
};

export interface ContactNotification {
  name: string;
  email: string;
  phone?: string;
  organisation?: string;
  category: ContactCategory;
  message: string;
}

/**
 * @param resend  When true, the email says it is a copy re-sent from the admin
 *                dashboard, so the reader does not mistake it for a new enquiry.
 */
export async function sendContactNotification(
  input: ContactNotification,
  { resend = false }: { resend?: boolean } = {},
): Promise<boolean> {
  const category = input.category;

  // Same field order the public form produces, so both emails read alike.
  const data: Record<string, unknown> = {
    name: input.name,
    email: input.email,
    phone: input.phone ?? "",
    organisation: input.organisation ?? "",
    subject: category,
    message: input.message,
  };

  const subjectLine = `${buildSubjectPrefix(category)} ${getCategoryLabel(
    category,
  )} from ${sanitiseValue(input.name).substring(0, 80)}`;

  const intro = resend
    ? "This is a copy of an earlier website submission, re-sent from the admin dashboard. It is not a new enquiry."
    : undefined;

  return sendEmail(
    subjectLine,
    formatBody(data),
    emailTemplate(subjectLine, buildEmailRows(data, LABELS), intro),
    resolveInboxFor(category),
    input.email,
  );
}

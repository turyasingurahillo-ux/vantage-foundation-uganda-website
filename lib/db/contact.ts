import { neon } from "@neondatabase/serverless";
import type { ContactCategory } from "@/lib/contact-categories";

/**
 * Persistence for public contact-form submissions.
 *
 * Messages are written here BEFORE the notification email is attempted, so a
 * transient SMTP outage cannot silently lose an inquiry from a donor,
 * grantmaker, researcher or partner. If the database is unavailable the form
 * still works — the caller treats a failure here as non-fatal and falls back
 * to email-only delivery.
 */

export interface ContactMessageInput {
  name: string;
  email: string;
  phone?: string;
  organisation?: string;
  category: ContactCategory;
  message: string;
}

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }
  return neon(url);
}

/** True when a database is configured at all. */
export function isContactStoreConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** Stores a submission and returns its id. */
export async function createContactMessage(
  input: ContactMessageInput,
): Promise<number> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO contact_messages (
      name, email, phone, organisation, category, message
    ) VALUES (
      ${input.name}, ${input.email}, ${input.phone || null},
      ${input.organisation || null}, ${input.category}, ${input.message}
    )
    RETURNING id
  `;
  return Number(rows[0].id);
}

export interface ContactMessageRow extends ContactMessageInput {
  id: number;
  createdAt: Date;
  emailSent: boolean;
}

/**
 * Returns recent submissions, newest first.
 *
 * This is the safety net for the case where SMTP is misconfigured or down:
 * without it, messages would be written to the table and never read.
 */
export async function getContactMessages(
  limit = 200,
): Promise<ContactMessageRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, created_at, name, email, phone, organisation, category,
           message, email_sent
    FROM contact_messages
    WHERE deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows.map((row) => ({
    id: Number(row.id),
    createdAt: new Date(row.created_at as string),
    name: row.name as string,
    email: row.email as string,
    phone: (row.phone as string) ?? undefined,
    organisation: (row.organisation as string) ?? undefined,
    category: row.category as ContactCategory,
    message: row.message as string,
    emailSent: Boolean(row.email_sent),
  }));
}

/** Records whether the internal notification email was delivered. */
export async function markContactMessageEmailed(
  id: number,
  sent: boolean,
): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE contact_messages
    SET email_sent = ${sent}
    WHERE id = ${id}
  `;
}

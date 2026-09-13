import { neon } from "@neondatabase/serverless";

export interface DonationInput {
  name: string;
  email: string;
  phone?: string;
  amount: number;
  currency?: string;
  frequency: string;
  campaign: string;
  transactionReference?: string;
  message?: string;
}

export interface DonationRow extends DonationInput {
  id: number;
  createdAt: Date;
  status: "pending" | "verified" | "rejected";
  adminNotes?: string;
  verifiedAt?: Date;
  deletedAt?: Date | null;
}

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }
  return neon(url);
}

export async function createDonation(input: DonationInput): Promise<DonationRow> {
  const sql = getSql();
  const currency = input.currency || "UGX";

  const rows = await sql`
    INSERT INTO donations (
      name, email, phone, amount, currency, frequency, campaign,
      transaction_reference, message, status
    ) VALUES (
      ${input.name}, ${input.email}, ${input.phone || null},
      ${input.amount}, ${currency}, ${input.frequency},
      ${input.campaign}, ${input.transactionReference || null},
      ${input.message || null}, 'pending'
    )
    RETURNING *
  `;

  return mapRow(rows[0]);
}

/**
 * Attaches a bank/provider transaction reference after a donor has completed
 * the external transfer. Matching requires both the public Vantage reference
 * and the donor email, and only pending non-deleted records can be updated.
 *
 * The Vantage reference currently lives in the audited message metadata so
 * this remains backwards-compatible with donation records created before an
 * explicit reference column exists.
 */
export async function attachDonationTransferReference(input: {
  donationReference: string;
  email: string;
  transactionReference: string;
}): Promise<DonationRow | null> {
  const sql = getSql();
  const referenceMarker = `%Vantage donation reference: ${input.donationReference}%`;

  const rows = await sql`
    UPDATE donations
    SET transaction_reference = ${input.transactionReference}
    WHERE deleted_at IS NULL
      AND status = 'pending'
      AND LOWER(email) = LOWER(${input.email})
      AND message LIKE ${referenceMarker}
      AND (
        transaction_reference IS NULL
        OR transaction_reference = ${input.transactionReference}
      )
    RETURNING *
  `;

  if (rows.length === 0) return null;
  return mapRow(rows[0]);
}

/**
 * Returns all non-deleted donations, newest first.
 * Soft-deleted records (deleted_at IS NOT NULL) are excluded.
 */
export async function getDonations(): Promise<DonationRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM donations
    WHERE deleted_at IS NULL
    ORDER BY created_at DESC
  `;
  return rows.map(mapRow);
}

/**
 * Returns a single non-deleted donation by ID, or null if not found.
 */
export async function getDonationById(id: number): Promise<DonationRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM donations
    WHERE id = ${id} AND deleted_at IS NULL
  `;
  if (rows.length === 0) return null;
  return mapRow(rows[0]);
}

export async function updateDonationStatus(
  id: number,
  status: "pending" | "verified" | "rejected",
  adminNotes?: string
): Promise<DonationRow> {
  const sql = getSql();

  const rows = await sql`
    UPDATE donations
    SET
      status = ${status},
      admin_notes = ${adminNotes || null},
      verified_at = CASE WHEN ${status} = 'verified' THEN CURRENT_TIMESTAMP ELSE verified_at END
    WHERE id = ${id} AND deleted_at IS NULL
    RETURNING *
  `;

  return mapRow(rows[0]);
}

/**
 * Soft-deletes a donation by setting deleted_at to the current timestamp.
 * The record is retained for audit purposes but hidden from the admin list.
 */
export async function softDeleteDonation(id: number): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE donations
    SET deleted_at = CURRENT_TIMESTAMP
    WHERE id = ${id} AND deleted_at IS NULL
  `;
}

/**
 * Permanently deletes donations that were soft-deleted more than `retentionDays` ago.
 * Returns the number of records purged.
 *
 * Call this from a scheduled cleanup job (e.g. Vercel Cron or external scheduler).
 */
export async function purgeOldDeletedDonations(retentionDays: number = 365): Promise<number> {
  const sql = getSql();
  // Compute the cutoff date in JS to avoid SQL interval syntax issues.
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  const rows = await sql`
    DELETE FROM donations
    WHERE deleted_at IS NOT NULL
      AND deleted_at < ${cutoff}
    RETURNING id
  `;
  return rows.length;
}

function mapRow(row: Record<string, unknown>): DonationRow {
  return {
    id: row.id as number,
    createdAt: row.created_at as Date,
    name: row.name as string,
    email: row.email as string,
    phone: (row.phone as string) || undefined,
    amount: Number(row.amount),
    currency: (row.currency as string) || "UGX",
    frequency: row.frequency as string,
    campaign: row.campaign as string,
    transactionReference: (row.transaction_reference as string) || undefined,
    message: (row.message as string) || undefined,
    status: row.status as "pending" | "verified" | "rejected",
    adminNotes: (row.admin_notes as string) || undefined,
    verifiedAt: row.verified_at ? (row.verified_at as Date) : undefined,
    deletedAt: row.deleted_at ? (row.deleted_at as Date) : null,
  };
}

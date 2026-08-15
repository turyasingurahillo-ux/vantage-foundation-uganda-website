import { neon } from "@neondatabase/serverless";

/**
 * Database queries for the `admins` table.
 *
 * Named admin accounts replace the single shared ADMIN_SECRET model for daily
 * logins. Passwords are hashed with scrypt (see lib/password.ts) and never
 * stored in plaintext. A disabled admin (disabled_at IS NOT NULL) cannot log
 * in but the row is retained for audit history.
 */

export interface AdminRow {
  id: number;
  createdAt: Date;
  username: string;
  passwordHash: string;
  disabledAt: Date | null;
}

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }
  return neon(url);
}

function mapRow(row: Record<string, unknown>): AdminRow {
  return {
    id: row.id as number,
    createdAt: row.created_at as Date,
    username: row.username as string,
    passwordHash: row.password_hash as string,
    disabledAt: row.disabled_at ? (row.disabled_at as Date) : null,
  };
}

/**
 * Returns a single active (non-disabled) admin by username, or null if not
 * found. Used by the login route to look up the admin before verifying the
 * password.
 */
export async function getActiveAdminByUsername(
  username: string
): Promise<AdminRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM admins
    WHERE username = ${username} AND disabled_at IS NULL
  `;
  if (rows.length === 0) return null;
  return mapRow(rows[0]);
}

/**
 * Returns all admins (including disabled), newest first. Used by the admin
 * management UI.
 */
export async function getAdmins(): Promise<AdminRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM admins ORDER BY created_at DESC
  `;
  return rows.map(mapRow);
}

/**
 * Returns the count of active (non-disabled) admins. Used by the login route
 * to decide whether ADMIN_SECRET fallback is allowed (only when zero admins).
 */
export async function countActiveAdmins(): Promise<number> {
  const sql = getSql();
  const rows = await sql`
    SELECT COUNT(*)::int AS count FROM admins WHERE disabled_at IS NULL
  `;
  return rows[0]?.count ?? 0;
}

/**
 * Creates a new admin with the given username and hashed password.
 * Returns the created row. Throws if the username already exists (unique
 * constraint violation surfaces as a Postgres error).
 */
export async function createAdmin(
  username: string,
  passwordHash: string
): Promise<AdminRow> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO admins (username, password_hash)
    VALUES (${username}, ${passwordHash})
    RETURNING *
  `;
  return mapRow(rows[0]);
}

/**
 * Disables an admin by setting disabled_at to the current timestamp.
 * The admin can no longer log in but the row is retained for audit.
 * Returns true if the admin was disabled, false if not found or already disabled.
 */
export async function disableAdmin(id: number): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    UPDATE admins SET disabled_at = CURRENT_TIMESTAMP
    WHERE id = ${id} AND disabled_at IS NULL
    RETURNING id
  `;
  return rows.length > 0;
}

/**
 * Returns an admin by id, or null if not found. Used by the audit log viewer
 * to resolve actor_id to a username.
 */
export async function getAdminById(id: number): Promise<AdminRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM admins WHERE id = ${id}
  `;
  if (rows.length === 0) return null;
  return mapRow(rows[0]);
}

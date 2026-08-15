import { neon } from "@neondatabase/serverless";

/**
 * Database queries for the `audit_log` table.
 *
 * The audit log is append-only: every state-changing admin operation writes
 * exactly one row with a before/after JSON snapshot. There is no UPDATE or
 * DELETE path — the table is an immutable record of who did what and when.
 */

export type ActorKind = "admin" | "bootstrap" | "system";

export interface AuditLogEntry {
  id: number;
  createdAt: Date;
  actorId: string;
  actorKind: ActorKind;
  action: string;
  resourceType: string;
  resourceId: string | null;
  before: unknown;
  after: unknown;
  ip: string | null;
}

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }
  return neon(url);
}

function mapRow(row: Record<string, unknown>): AuditLogEntry {
  return {
    id: row.id as number,
    createdAt: row.created_at as Date,
    actorId: row.actor_id as string,
    actorKind: row.actor_kind as ActorKind,
    action: row.action as string,
    resourceType: row.resource_type as string,
    resourceId: (row.resource_id as string) ?? null,
    before: row.before ?? null,
    after: row.after ?? null,
    ip: (row.ip as string) ?? null,
  };
}

/**
 * Appends a single audit log entry. This is the only write path — the table
 * is append-only. The `before` and `after` parameters should be JSON-serialisable
 * snapshots of the affected resource.
 *
 * Errors are caught and logged but never thrown — an audit log failure must
 * not prevent the operation from completing (the operation itself is the
 * source of truth; the audit log is a record). Callers should still check the
 * return value if they need to know whether the audit row was written.
 */
export async function appendAuditLog(entry: {
  actorId: string;
  actorKind?: ActorKind;
  action: string;
  resourceType: string;
  resourceId?: string | number | null;
  before?: unknown;
  after?: unknown;
  ip?: string | null;
}): Promise<boolean> {
  try {
    const sql = getSql();
    await sql`
      INSERT INTO audit_log (actor_id, actor_kind, action, resource_type, resource_id, before, after, ip)
      VALUES (
        ${entry.actorId},
        ${entry.actorKind ?? "admin"},
        ${entry.action},
        ${entry.resourceType},
        ${entry.resourceId != null ? String(entry.resourceId) : null},
        ${entry.before != null ? JSON.stringify(entry.before) : null}::jsonb,
        ${entry.after != null ? JSON.stringify(entry.after) : null}::jsonb,
        ${entry.ip ?? null}
      )
    `;
    return true;
  } catch {
    // Audit log failures must not break the operation. The caller's own
    // logInfo/logError will surface the issue; the audit row is a record,
    // not a gate.
    return false;
  }
}

/**
 * Returns recent audit log entries, newest first. Optional filters by action
 * or resource type. Used by the /admin/audit read-only view.
 */
export async function getAuditLogs(options?: {
  action?: string;
  resourceType?: string;
  limit?: number;
}): Promise<AuditLogEntry[]> {
  const sql = getSql();
  const limit = Math.min(options?.limit ?? 200, 500);
  const action = options?.action;
  const resourceType = options?.resourceType;

  if (action && resourceType) {
    const rows = await sql`
      SELECT * FROM audit_log
      WHERE action = ${action} AND resource_type = ${resourceType}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return rows.map(mapRow);
  }
  if (action) {
    const rows = await sql`
      SELECT * FROM audit_log
      WHERE action = ${action}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return rows.map(mapRow);
  }
  if (resourceType) {
    const rows = await sql`
      SELECT * FROM audit_log
      WHERE resource_type = ${resourceType}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return rows.map(mapRow);
  }
  const rows = await sql`
    SELECT * FROM audit_log
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows.map(mapRow);
}

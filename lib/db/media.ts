import { neon } from "@neondatabase/serverless";

/**
 * Database queries for the `media_objects` table.
 *
 * Mirrors the conventions of lib/db/index.ts (donations): a single getSql()
 * helper, plain async functions, and a row mapper that converts snake_case
 * columns to camelCase fields. Soft-deleted rows (deleted_at IS NOT NULL) are
 * excluded from list/get queries but retained for audit.
 */

export type MediaConsent = "none" | "verified" | "pending" | "group-consent";

export interface MediaObjectInput {
  objectKey: string;
  originalFilename: string;
  contentType: string;
  byteSize: number;
  width?: number;
  height?: number;
  altText?: string;
  caption?: string;
  consent?: MediaConsent;
  consentNotes?: string;
  programme?: string;
  projectSlug?: string;
  published?: boolean;
}

export interface MediaObjectRow extends Required<Omit<MediaObjectInput, "width" | "height" | "caption" | "consentNotes" | "programme" | "projectSlug">> {
  id: number;
  createdAt: Date;
  width: number | null;
  height: number | null;
  caption: string | null;
  consentNotes: string | null;
  programme: string | null;
  projectSlug: string | null;
  deletedAt: Date | null;
}

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }
  return neon(url);
}

/**
 * Inserts a new media_objects row. Called after the browser has completed the
 * PUT to R2 and the server has confirmed the object via HEAD.
 */
export async function createMediaObject(
  input: MediaObjectInput
): Promise<MediaObjectRow> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO media_objects (
      object_key, original_filename, content_type, byte_size,
      width, height, alt_text, caption, consent, consent_notes,
      programme, project_slug, published
    ) VALUES (
      ${input.objectKey}, ${input.originalFilename}, ${input.contentType},
      ${input.byteSize}, ${input.width ?? null}, ${input.height ?? null},
      ${input.altText ?? ""}, ${input.caption ?? null},
      ${input.consent ?? "pending"}, ${input.consentNotes ?? null},
      ${input.programme ?? null}, ${input.projectSlug ?? null},
      ${input.published ?? false}
    )
    RETURNING *
  `;
  return mapRow(rows[0]);
}

/**
 * Returns all non-deleted media, newest first. Optional filters by programme,
 * project slug, or published state. Filters are combined with AND when more
 * than one is supplied.
 */
export async function getMediaObjects(options?: {
  programme?: string;
  projectSlug?: string;
  published?: boolean;
}): Promise<MediaObjectRow[]> {
  const sql = getSql();
  const programme = options?.programme;
  const projectSlug = options?.projectSlug;
  const published = options?.published;

  // Branch on the combination of filters to keep each query a single static
  // tagged template (neon's tagged templates don't reliably compose nested
  // empty fragments). Four branches cover all realistic combinations.
  if (published === true && programme && projectSlug) {
    const rows = await sql`
      SELECT * FROM media_objects
      WHERE deleted_at IS NULL AND published = true
        AND programme = ${programme} AND project_slug = ${projectSlug}
      ORDER BY created_at DESC
    `;
    return rows.map(mapRow);
  }
  if (published === true && programme) {
    const rows = await sql`
      SELECT * FROM media_objects
      WHERE deleted_at IS NULL AND published = true AND programme = ${programme}
      ORDER BY created_at DESC
    `;
    return rows.map(mapRow);
  }
  if (published === true && projectSlug) {
    const rows = await sql`
      SELECT * FROM media_objects
      WHERE deleted_at IS NULL AND published = true AND project_slug = ${projectSlug}
      ORDER BY created_at DESC
    `;
    return rows.map(mapRow);
  }
  if (published === true) {
    const rows = await sql`
      SELECT * FROM media_objects
      WHERE deleted_at IS NULL AND published = true
      ORDER BY created_at DESC
    `;
    return rows.map(mapRow);
  }
  if (programme && projectSlug) {
    const rows = await sql`
      SELECT * FROM media_objects
      WHERE deleted_at IS NULL AND programme = ${programme} AND project_slug = ${projectSlug}
      ORDER BY created_at DESC
    `;
    return rows.map(mapRow);
  }
  if (programme) {
    const rows = await sql`
      SELECT * FROM media_objects
      WHERE deleted_at IS NULL AND programme = ${programme}
      ORDER BY created_at DESC
    `;
    return rows.map(mapRow);
  }
  if (projectSlug) {
    const rows = await sql`
      SELECT * FROM media_objects
      WHERE deleted_at IS NULL AND project_slug = ${projectSlug}
      ORDER BY created_at DESC
    `;
    return rows.map(mapRow);
  }
  const rows = await sql`
    SELECT * FROM media_objects
    WHERE deleted_at IS NULL
    ORDER BY created_at DESC
  `;
  return rows.map(mapRow);
}

/**
 * Returns a single non-deleted media object by id, or null if not found.
 */
export async function getMediaObjectById(id: number): Promise<MediaObjectRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM media_objects WHERE id = ${id} AND deleted_at IS NULL
  `;
  if (rows.length === 0) return null;
  return mapRow(rows[0]);
}

/**
 * Returns a single non-deleted media object by its R2 object key, or null.
 * Used to detect duplicate inserts for the same key.
 */
export async function getMediaObjectByKey(
  objectKey: string
): Promise<MediaObjectRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM media_objects WHERE object_key = ${objectKey} AND deleted_at IS NULL
  `;
  if (rows.length === 0) return null;
  return mapRow(rows[0]);
}

export interface MediaObjectUpdate {
  altText?: string;
  caption?: string | null;
  consent?: MediaConsent;
  consentNotes?: string | null;
  programme?: string | null;
  projectSlug?: string | null;
  published?: boolean;
  width?: number | null;
  height?: number | null;
}

/**
 * Updates editable fields on a media object. Only the supplied fields are
 * written; omitted fields are left untouched. Returns the updated row, or
 * null if the id was not found or was soft-deleted.
 *
 * Implementation: fetch the current row, merge the supplied update fields,
 * then write all updatable fields back in a single UPDATE. This avoids
 * dynamic SQL construction and keeps the query a single static tagged
 * template (neon's tagged templates don't compose nested column-reference
 * fragments reliably).
 */
export async function updateMediaObject(
  id: number,
  update: MediaObjectUpdate
): Promise<MediaObjectRow | null> {
  const current = await getMediaObjectById(id);
  if (!current) return null;

  const sql = getSql();
  const next = {
    altText: update.altText ?? current.altText,
    caption: update.caption === undefined ? current.caption : update.caption,
    consent: update.consent ?? current.consent,
    consentNotes:
      update.consentNotes === undefined ? current.consentNotes : update.consentNotes,
    programme: update.programme === undefined ? current.programme : update.programme,
    projectSlug:
      update.projectSlug === undefined ? current.projectSlug : update.projectSlug,
    published: update.published ?? current.published,
    width: update.width === undefined ? current.width : update.width,
    height: update.height === undefined ? current.height : update.height,
  };

  // Atomic consent invariant: the UPDATE only succeeds if the resulting
  // state does NOT have published=true with consent='pending'. This closes
  // the TOCTOU race where concurrent PATCH requests each pass the route-level
  // consent gate against a stale snapshot but combine into a violation.
  // The route distinguishes "not found" from "consent violation" by checking
  // whether the row existed before calling this function.
  const rows = await sql`
    UPDATE media_objects SET
      alt_text = ${next.altText},
      caption = ${next.caption},
      consent = ${next.consent},
      consent_notes = ${next.consentNotes},
      programme = ${next.programme},
      project_slug = ${next.projectSlug},
      published = ${next.published},
      width = ${next.width},
      height = ${next.height}
    WHERE id = ${id} AND deleted_at IS NULL
      AND NOT (${next.published} = true AND ${next.consent} = 'pending')
    RETURNING *
  `;
  if (rows.length === 0) return null;
  return mapRow(rows[0]);
}

/**
 * Soft-deletes a media object by setting deleted_at. The R2 object should be
 * deleted separately (by the API route) before or after this call — we keep
 * the DB row for audit even after the bytes are gone.
 */
export async function softDeleteMediaObject(id: number): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE media_objects SET deleted_at = CURRENT_TIMESTAMP
    WHERE id = ${id} AND deleted_at IS NULL
  `;
}

function mapRow(row: Record<string, unknown>): MediaObjectRow {
  return {
    id: row.id as number,
    createdAt: row.created_at as Date,
    objectKey: row.object_key as string,
    originalFilename: row.original_filename as string,
    contentType: row.content_type as string,
    byteSize: row.byte_size as number,
    width: (row.width as number | null) ?? null,
    height: (row.height as number | null) ?? null,
    altText: (row.alt_text as string) ?? "",
    caption: (row.caption as string | null) ?? null,
    consent: row.consent as MediaConsent,
    consentNotes: (row.consent_notes as string | null) ?? null,
    programme: (row.programme as string | null) ?? null,
    projectSlug: (row.project_slug as string | null) ?? null,
    published: (row.published as boolean) ?? false,
    deletedAt: row.deleted_at ? (row.deleted_at as Date) : null,
  };
}

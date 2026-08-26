import { neon } from "@neondatabase/serverless";
import type {
  OrganisationRow,
  PersonRow,
  DueDiligenceCheckRow,
  OrganisationRelationshipStatus,
  OrganisationType,
  DueDiligenceLevel,
  DueDiligenceStatus,
} from "@/lib/organisation-types";
import type { CaseRow } from "@/lib/db/cases";

/**
 * Organisation + Person database queries.
 *
 * This module owns the relationship-layer CRUD: organisations, persons,
 * due-diligence checks, and the cross-references between cases and
 * organisations/persons.
 */

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }
  return neon(url);
}

// ---------------------------------------------------------------------------
// Mapping
// ---------------------------------------------------------------------------

function mapOrganisation(row: Record<string, unknown>): OrganisationRow {
  return {
    id: Number(row.id),
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
    name: row.name as string,
    organisationType: (row.organisation_type as string) ?? null,
    website: (row.website as string) ?? null,
    email: (row.email as string) ?? null,
    phone: (row.phone as string) ?? null,
    geographicArea: (row.geographic_area as string) ?? null,
    registrationNumber: (row.registration_number as string) ?? null,
    relationshipStatus:
      (row.relationship_status as OrganisationRelationshipStatus) ??
      "enquirer",
    primaryOwnerId: (row.primary_owner_id as string) ?? null,
    notes: (row.notes as string) ?? null,
  };
}

function mapPerson(row: Record<string, unknown>): PersonRow {
  return {
    id: Number(row.id),
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
    fullName: row.full_name as string,
    primaryEmail: (row.primary_email as string) ?? null,
    phone: (row.phone as string) ?? null,
    roleTitle: (row.role_title as string) ?? null,
    organisationId: row.organisation_id
      ? Number(row.organisation_id)
      : null,
    notes: (row.notes as string) ?? null,
  };
}

function mapDueDiligenceCheck(row: Record<string, unknown>): DueDiligenceCheckRow {
  return {
    id: Number(row.id),
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
    organisationId: Number(row.organisation_id),
    level: row.level as DueDiligenceLevel,
    checkKey: row.check_key as string,
    label: row.label as string,
    status: (row.status as DueDiligenceStatus) ?? "not_started",
    reviewerId: (row.reviewer_id as string) ?? null,
    reviewedAt: row.reviewed_at ? new Date(row.reviewed_at as string) : null,
    note: (row.note as string) ?? null,
    documentRef: (row.document_ref as string) ?? null,
  };
}

// ---------------------------------------------------------------------------
// Organisations
// ---------------------------------------------------------------------------

export interface OrganisationInput {
  name: string;
  organisationType?: OrganisationType;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  geographicArea?: string | null;
  registrationNumber?: string | null;
  relationshipStatus?: OrganisationRelationshipStatus;
  primaryOwnerId?: string | null;
  notes?: string | null;
}

export async function createOrganisation(
  input: OrganisationInput,
): Promise<OrganisationRow> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO organisations (
      name, organisation_type, website, email, phone,
      geographic_area, registration_number, relationship_status,
      primary_owner_id, notes
    ) VALUES (
      ${input.name},
      ${input.organisationType ?? null},
      ${input.website ?? null},
      ${input.email ?? null},
      ${input.phone ?? null},
      ${input.geographicArea ?? null},
      ${input.registrationNumber ?? null},
      ${input.relationshipStatus ?? "enquirer"},
      ${input.primaryOwnerId ?? null},
      ${input.notes ?? null}
    )
    RETURNING *
  `;
  return mapOrganisation(rows[0]);
}

export async function getOrganisationById(
  id: number,
): Promise<OrganisationRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM organisations
    WHERE id = ${id} AND deleted_at IS NULL
  `;
  return rows.length > 0 ? mapOrganisation(rows[0]) : null;
}

export async function searchOrganisations(options: {
  query?: string;
  relationshipStatus?: OrganisationRelationshipStatus;
  limit?: number;
}): Promise<OrganisationRow[]> {
  const sql = getSql();
  const limit = options.limit ?? 50;
  const query = `%${(options.query ?? "").trim()}%`;

  let rows: Record<string, unknown>[];
  if (options.relationshipStatus) {
    rows = await sql`
      SELECT * FROM organisations
      WHERE deleted_at IS NULL
        AND relationship_status = ${options.relationshipStatus}
        AND (${options.query ?? ""} = '' OR
          name ILIKE ${query} OR
          email ILIKE ${query} OR
          website ILIKE ${query} OR
          geographic_area ILIKE ${query}
        )
      ORDER BY name ASC
      LIMIT ${limit}
    `;
  } else {
    rows = await sql`
      SELECT * FROM organisations
      WHERE deleted_at IS NULL
        AND (${options.query ?? ""} = '' OR
          name ILIKE ${query} OR
          email ILIKE ${query} OR
          website ILIKE ${query} OR
          geographic_area ILIKE ${query}
        )
      ORDER BY name ASC
      LIMIT ${limit}
    `;
  }
  return rows.map(mapOrganisation);
}

export async function updateOrganisation(
  id: number,
  input: Partial<OrganisationInput>,
): Promise<OrganisationRow | null> {
  const sql = getSql();
  const existing = await getOrganisationById(id);
  if (!existing) return null;

  const rows = await sql`
    UPDATE organisations SET
      name = COALESCE(${input.name ?? null}, name),
      organisation_type = COALESCE(${input.organisationType ?? null}, organisation_type),
      website = COALESCE(${input.website ?? null}, website),
      email = COALESCE(${input.email ?? null}, email),
      phone = COALESCE(${input.phone ?? null}, phone),
      geographic_area = COALESCE(${input.geographicArea ?? null}, geographic_area),
      registration_number = COALESCE(${input.registrationNumber ?? null}, registration_number),
      relationship_status = COALESCE(${input.relationshipStatus ?? null}, relationship_status),
      primary_owner_id = COALESCE(${input.primaryOwnerId ?? null}, primary_owner_id),
      notes = COALESCE(${input.notes ?? null}, notes),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id} AND deleted_at IS NULL
    RETURNING *
  `;
  return rows.length > 0 ? mapOrganisation(rows[0]) : null;
}

export async function getOrganisationCases(
  organisationId: number,
): Promise<CaseRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM contact_messages
    WHERE organisation_id = ${organisationId}
      AND deleted_at IS NULL
    ORDER BY created_at DESC
  `;
  // Reuse the case mapper from cases.ts — but we can't import it because
  // it's not exported. We'll do a minimal mapping here.
  return rows.map((row) => ({
    id: Number(row.id),
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
    name: row.name as string,
    email: row.email as string,
    phone: (row.phone as string) ?? undefined,
    organisation: (row.organisation as string) ?? undefined,
    category: row.category as never,
    message: row.message as string,
    emailSent: Boolean(row.email_sent),
    status: (row.status as never) ?? "new",
    workflowStatus: (row.workflow_status as never) ?? "new",
    source: (row.source as never) ?? "website_form",
    caseType: (row.case_type as never) ?? undefined,
    programme: (row.programme as never) ?? undefined,
    priority: (row.priority as never) ?? "normal",
    riskLevel: (row.risk_level as never) ?? "unknown",
    strategicValue: (row.strategic_value as never) ?? "unknown",
    ownerId: (row.owner_id as string) ?? undefined,
    collaborators: Array.isArray(row.collaborators)
      ? (row.collaborators as string[])
      : [],
    nextAction: (row.next_action as string) ?? undefined,
    nextActionDueAt: row.next_action_due_at
      ? new Date(row.next_action_due_at as string)
      : undefined,
    outcome: (row.outcome as never) ?? undefined,
    declineReason: (row.decline_reason as never) ?? undefined,
    declineDetail: (row.decline_detail as string) ?? undefined,
    referralOrg: (row.referral_org as string) ?? undefined,
    referralDate: row.referral_date
      ? new Date(row.referral_date as string)
      : undefined,
    referralLink: (row.referral_link as string) ?? undefined,
    referralFollowupDate: row.referral_followup_date
      ? new Date(row.referral_followup_date as string)
      : undefined,
    referralOutcome: (row.referral_outcome as never) ?? undefined,
    referralDetail: (row.referral_detail as string) ?? undefined,
    firstResponseAt: row.first_response_at
      ? new Date(row.first_response_at as string)
      : undefined,
    closedAt: row.closed_at ? new Date(row.closed_at as string) : undefined,
    lastRepliedAt: row.last_replied_at
      ? new Date(row.last_replied_at as string)
      : undefined,
    archivedAt: row.archived_at
      ? new Date(row.archived_at as string)
      : undefined,
  }));
}

// ---------------------------------------------------------------------------
// Persons
// ---------------------------------------------------------------------------

export interface PersonInput {
  fullName: string;
  primaryEmail?: string | null;
  phone?: string | null;
  roleTitle?: string | null;
  organisationId?: number | null;
  notes?: string | null;
}

export async function createPerson(input: PersonInput): Promise<PersonRow> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO persons (
      full_name, primary_email, phone, role_title, organisation_id, notes
    ) VALUES (
      ${input.fullName},
      ${input.primaryEmail ?? null},
      ${input.phone ?? null},
      ${input.roleTitle ?? null},
      ${input.organisationId ?? null},
      ${input.notes ?? null}
    )
    RETURNING *
  `;
  return mapPerson(rows[0]);
}

export async function getPersonById(id: number): Promise<PersonRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM persons WHERE id = ${id} AND deleted_at IS NULL
  `;
  return rows.length > 0 ? mapPerson(rows[0]) : null;
}

export async function getOrganisationPersons(
  organisationId: number,
): Promise<PersonRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM persons
    WHERE organisation_id = ${organisationId} AND deleted_at IS NULL
    ORDER BY full_name ASC
  `;
  return rows.map(mapPerson);
}

export async function searchPersons(options: {
  query?: string;
  organisationId?: number;
  limit?: number;
}): Promise<PersonRow[]> {
  const sql = getSql();
  const limit = options.limit ?? 50;
  const query = `%${(options.query ?? "").trim()}%`;

  let rows: Record<string, unknown>[];
  if (options.organisationId) {
    rows = await sql`
      SELECT * FROM persons
      WHERE deleted_at IS NULL
        AND organisation_id = ${options.organisationId}
        AND (${options.query ?? ""} = '' OR
          full_name ILIKE ${query} OR
          primary_email ILIKE ${query} OR
          phone ILIKE ${query}
        )
      ORDER BY full_name ASC
      LIMIT ${limit}
    `;
  } else {
    rows = await sql`
      SELECT * FROM persons
      WHERE deleted_at IS NULL
        AND (${options.query ?? ""} = '' OR
          full_name ILIKE ${query} OR
          primary_email ILIKE ${query} OR
          phone ILIKE ${query}
        )
      ORDER BY full_name ASC
      LIMIT ${limit}
    `;
  }
  return rows.map(mapPerson);
}

export async function updatePerson(
  id: number,
  input: Partial<PersonInput>,
): Promise<PersonRow | null> {
  const sql = getSql();
  const rows = await sql`
    UPDATE persons SET
      full_name = COALESCE(${input.fullName ?? null}, full_name),
      primary_email = COALESCE(${input.primaryEmail ?? null}, primary_email),
      phone = COALESCE(${input.phone ?? null}, phone),
      role_title = COALESCE(${input.roleTitle ?? null}, role_title),
      organisation_id = COALESCE(${input.organisationId ?? null}, organisation_id),
      notes = COALESCE(${input.notes ?? null}, notes),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id} AND deleted_at IS NULL
    RETURNING *
  `;
  return rows.length > 0 ? mapPerson(rows[0]) : null;
}

/**
 * Suggest persons matching an email or phone. Does NOT auto-merge — returns
 * candidates for the admin to review and link manually.
 */
export async function suggestPersonsByEmailOrPhone(
  email?: string,
  phone?: string,
): Promise<PersonRow[]> {
  if (!email && !phone) return [];
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM persons
    WHERE deleted_at IS NULL
      AND (
        (${email ?? ""} <> '' AND primary_email = ${email ?? ""})
        OR
        (${phone ?? ""} <> '' AND phone = ${phone ?? ""})
      )
    ORDER BY full_name ASC
    LIMIT 5
  `;
  return rows.map(mapPerson);
}

// ---------------------------------------------------------------------------
// Case ↔ Organisation / Person linking
// ---------------------------------------------------------------------------

export async function linkCaseToOrganisation(
  caseId: number,
  organisationId: number | null,
): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    UPDATE contact_messages
    SET organisation_id = ${organisationId}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${caseId} AND deleted_at IS NULL
    RETURNING id
  `;
  return rows.length > 0;
}

export async function linkCaseToPerson(
  caseId: number,
  personId: number | null,
): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    UPDATE contact_messages
    SET person_id = ${personId}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${caseId} AND deleted_at IS NULL
    RETURNING id
  `;
  return rows.length > 0;
}

// ---------------------------------------------------------------------------
// Due-diligence checks
// ---------------------------------------------------------------------------

export interface DueDiligenceCheckInput {
  organisationId: number;
  level: DueDiligenceLevel;
  checkKey: string;
  label: string;
  status?: DueDiligenceStatus;
  reviewerId?: string | null;
  note?: string | null;
  documentRef?: string | null;
}

export async function upsertDueDiligenceCheck(
  input: DueDiligenceCheckInput,
): Promise<DueDiligenceCheckRow> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO due_diligence_checks (
      organisation_id, level, check_key, label, status,
      reviewer_id, note, document_ref
    ) VALUES (
      ${input.organisationId},
      ${input.level},
      ${input.checkKey},
      ${input.label},
      ${input.status ?? "not_started"},
      ${input.reviewerId ?? null},
      ${input.note ?? null},
      ${input.documentRef ?? null}
    )
    ON CONFLICT (organisation_id, check_key)
    DO UPDATE SET
      status = EXCLUDED.status,
      reviewer_id = EXCLUDED.reviewer_id,
      note = EXCLUDED.note,
      document_ref = EXCLUDED.document_ref,
      reviewed_at = CASE
        WHEN EXCLUDED.status IN ('verified', 'concern', 'failed')
        THEN COALESCE(due_diligence_checks.reviewed_at, CURRENT_TIMESTAMP)
        ELSE due_diligence_checks.reviewed_at
      END,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  return mapDueDiligenceCheck(rows[0]);
}

export async function getDueDiligenceChecks(
  organisationId: number,
): Promise<DueDiligenceCheckRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM due_diligence_checks
    WHERE organisation_id = ${organisationId}
    ORDER BY level ASC, check_key ASC
  `;
  return rows.map(mapDueDiligenceCheck);
}

export async function getDueDiligenceConcernCount(): Promise<number> {
  const sql = getSql();
  const rows = await sql`
    SELECT COUNT(DISTINCT organisation_id)::int AS count
    FROM due_diligence_checks
    WHERE status IN ('concern', 'failed')
  `;
  return (rows[0]?.count as number) ?? 0;
}

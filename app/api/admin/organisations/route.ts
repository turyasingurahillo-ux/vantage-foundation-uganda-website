import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import {
  ORGANISATION_RELATIONSHIP_STATUS_VALUES,
  ORGANISATION_TYPE_VALUES,
  type OrganisationRelationshipStatus,
  type OrganisationType,
} from "@/lib/organisation-types";
import {
  createOrganisation,
  searchOrganisations,
} from "@/lib/db/organisations";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { logWarn } from "@/lib/logger";
import { appendAuditLog } from "@/lib/db/audit";

const createSchema = z.object({
  name: z.string().min(1).max(200),
  organisationType: z.enum(ORGANISATION_TYPE_VALUES as [string, ...string[]]).nullable().optional(),
  website: z.string().max(500).nullable().optional(),
  email: z.string().max(200).nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  geographicArea: z.string().max(200).nullable().optional(),
  registrationNumber: z.string().max(100).nullable().optional(),
  relationshipStatus: z.enum(ORGANISATION_RELATIONSHIP_STATUS_VALUES).optional(),
  primaryOwnerId: z.string().max(100).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
});

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const session = verifySessionToken(
    cookieStore.get(sessionCookieName)?.value,
  );
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? undefined;
  const relationshipStatus = url.searchParams.get("relationshipStatus") as
    | OrganisationRelationshipStatus
    | null;

  const orgs = await searchOrganisations({
    query: query ?? "",
    relationshipStatus: relationshipStatus ?? undefined,
  });
  return NextResponse.json({ organisations: orgs });
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = verifySessionToken(
    cookieStore.get(sessionCookieName)?.value,
  );
  if (!session) {
    logWarn("org_create_unauthorized", {});
    return NextResponse.redirect(new URL("/admin/login", request.url), 302);
  }
  const { actorId } = session;

  const ip = getClientIp(request.headers);
  if (!rateLimit({ key: `admin-org-create:${ip}`, limit: 20, windowMs: 60_000 })) {
    logWarn("org_create_rate_limited", { ip });
    return NextResponse.redirect(
      new URL("/admin/organisations?error=rate-limited", request.url),
      303,
    );
  }

  const formData = await request.formData();
  if (!validateCsrf(cookieStore, formData)) {
    logWarn("org_create_csrf_failed", {});
    return NextResponse.redirect(
      new URL("/admin/organisations?error=csrf", request.url),
      303,
    );
  }

  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key === "csrf_token") continue;
    raw[key] = value === "" ? null : value;
  }

  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    logWarn("org_create_invalid", { issues: parsed.error.issues.length });
    return NextResponse.redirect(
      new URL("/admin/organisations?error=invalid", request.url),
      303,
    );
  }

  const data = parsed.data;
  try {
    const org = await createOrganisation({
      name: data.name,
      organisationType: data.organisationType as OrganisationType,
      website: data.website,
      email: data.email,
      phone: data.phone,
      geographicArea: data.geographicArea,
      registrationNumber: data.registrationNumber,
      relationshipStatus: data.relationshipStatus,
      primaryOwnerId: data.primaryOwnerId,
      notes: data.notes,
    });

    await appendAuditLog({
      action: "organisation.create",
      actorId,
      resourceType: "organisation",
      resourceId: String(org.id),
      before: null,
      after: { name: org.name, relationshipStatus: org.relationshipStatus },
      ip,
    });

    return NextResponse.redirect(
      new URL(`/admin/organisations/${org.id}?created=1`, request.url),
      303,
    );
  } catch (error) {
    logWarn("org_create_error", { error: String(error) });
    return NextResponse.redirect(
      new URL("/admin/organisations?error=server", request.url),
      303,
    );
  }
}

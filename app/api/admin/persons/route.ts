import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createPerson, suggestPersonsByEmailOrPhone } from "@/lib/db/organisations";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { validateCsrf } from "@/lib/csrf";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { logWarn } from "@/lib/logger";
import { appendAuditLog } from "@/lib/db/audit";

const createSchema = z.object({
  fullName: z.string().min(1).max(200),
  primaryEmail: z.string().max(200).nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  roleTitle: z.string().max(200).nullable().optional(),
  organisationId: z.coerce.number().int().positive().nullable().optional(),
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
  const email = url.searchParams.get("email") ?? undefined;
  const phone = url.searchParams.get("phone") ?? undefined;

  if (email || phone) {
    const suggestions = await suggestPersonsByEmailOrPhone(email, phone);
    return NextResponse.json({ suggestions });
  }

  return NextResponse.json({ error: "no query" }, { status: 400 });
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = verifySessionToken(
    cookieStore.get(sessionCookieName)?.value,
  );
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url), 302);
  }
  const { actorId } = session;

  const ip = getClientIp(request.headers);
  if (!rateLimit({ key: `admin-person-create:${ip}`, limit: 20, windowMs: 60_000 })) {
    logWarn("person_create_rate_limited", { ip });
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }

  const formData = await request.formData();
  if (!validateCsrf(cookieStore, formData)) {
    logWarn("person_create_csrf_failed", {});
    return NextResponse.json({ error: "csrf" }, { status: 403 });
  }

  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key === "csrf_token") continue;
    raw[key] = value === "" ? null : value;
  }

  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    logWarn("person_create_invalid", { issues: parsed.error.issues.length });
    return NextResponse.json({ error: "invalid", issues: parsed.error.issues }, { status: 400 });
  }

  const data = parsed.data;
  try {
    const person = await createPerson({
      fullName: data.fullName,
      primaryEmail: data.primaryEmail,
      phone: data.phone,
      roleTitle: data.roleTitle,
      organisationId: data.organisationId,
      notes: data.notes,
    });

    await appendAuditLog({
      action: "person.create",
      actorId,
      resourceType: "person",
      resourceId: String(person.id),
      before: null,
      after: { fullName: person.fullName },
      ip,
    });

    const redirectTo = data.organisationId
      ? `/admin/organisations/${data.organisationId}?person_created=${person.id}`
      : `/admin/organisations?person_created=${person.id}`;
    return NextResponse.redirect(new URL(redirectTo, request.url), 303);
  } catch (error) {
    logWarn("person_create_error", { error: String(error) });
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

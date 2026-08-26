import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Users, ShieldCheck, ClipboardList } from "lucide-react";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import {
  getOrganisationById,
  getOrganisationPersons,
  getOrganisationCases,
  getDueDiligenceChecks,
} from "@/lib/db/organisations";
import {
  getOrganisationTypeLabel,
  DUE_DILIGENCE_LEVELS,
  DUE_DILIGENCE_CHECKS,
  DUE_DILIGENCE_STATUSES,
  type OrganisationType,
} from "@/lib/organisation-types";
import { getCsrfTokenFromRequest, CSRF_FIELD_NAME } from "@/lib/csrf";
import { Container } from "@/components/shared/Container";
import { PageHeader } from "@/components/admin/hq/PageHeader";
import { CaseStatusBadge } from "@/components/admin/hq/CaseStatusBadge";

export const metadata: Metadata = {
  title: "Organisation",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function OrganisationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    updated?: string;
    dd?: string;
    person_created?: string;
    error?: string;
  }>;
}) {
  const cookieStore = await cookies();
  if (!verifySessionToken(cookieStore.get(sessionCookieName)?.value)) {
    redirect("/admin/login");
  }

  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) redirect("/admin/organisations");

  const sp = await searchParams;
  const csrfToken = await getCsrfTokenFromRequest();

  const org = await getOrganisationById(id).catch(() => null);
  if (!org) {
    return (
      <Container>
        <PageHeader title="Organisation not found" />
        <Link href="/admin/organisations" className="text-primary hover:underline">
          ← Back to organisations
        </Link>
      </Container>
    );
  }

  const [persons, cases, ddChecks] = await Promise.all([
    getOrganisationPersons(id).catch(() => []),
    getOrganisationCases(id).catch(() => []),
    getDueDiligenceChecks(id).catch(() => []),
  ]);

  return (
    <Container>
      <PageHeader
        title={org.name}
        description={getOrganisationTypeLabel(org.organisationType as OrganisationType) || undefined}
      />

      <Link href="/admin/organisations" className="mb-4 inline-block text-sm text-primary hover:underline">
        ← All organisations
      </Link>

      {sp.updated && (
        <div className="mb-4 rounded-md bg-success-bg px-4 py-2 text-sm text-success-fg">
          Organisation updated.
        </div>
      )}
      {sp.dd && (
        <div className="mb-4 rounded-md bg-success-bg px-4 py-2 text-sm text-success-fg">
          Due-diligence check updated.
        </div>
      )}
      {sp.error && (
        <div className="mb-4 rounded-md bg-destructive-bg px-4 py-2 text-sm text-destructive-fg">
          {sp.error === "invalid"
            ? "Invalid input."
            : sp.error === "csrf"
              ? "Security check failed."
              : "An error occurred."}
        </div>
      )}

      {/* Organisation details + edit form */}
      <div className="mb-8 rounded-lg border border-border p-6">
        <h2 className="mb-4 text-lg font-semibold">Details</h2>
        <form action={`/api/admin/organisations/${org.id}`} method="POST" className="space-y-4">
          <input type="hidden" name={CSRF_FIELD_NAME} value={csrfToken} />
          <input type="hidden" name="id" value={org.id} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <input
                type="text"
                name="name"
                defaultValue={org.name}
                required
                maxLength={200}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Relationship status</label>
              <select
                name="relationshipStatus"
                defaultValue={org.relationshipStatus}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="prospect">Prospect</option>
                <option value="enquirer">Enquirer</option>
                <option value="under_review">Under Review</option>
                <option value="potential_partner">Potential Partner</option>
                <option value="active_partner">Active Partner</option>
                <option value="donor_funder">Donor / Funder</option>
                <option value="referral_partner">Referral Partner</option>
                <option value="supplier">Supplier</option>
                <option value="government_authority">Government / Authority</option>
                <option value="former_partner">Former Partner</option>
                <option value="restricted">Restricted / Do Not Engage</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Website</label>
              <input
                type="url"
                name="website"
                defaultValue={org.website ?? ""}
                maxLength={500}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                defaultValue={org.email ?? ""}
                maxLength={200}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Phone</label>
              <input
                type="tel"
                name="phone"
                defaultValue={org.phone ?? ""}
                maxLength={50}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Geographic area</label>
              <input
                type="text"
                name="geographicArea"
                defaultValue={org.geographicArea ?? ""}
                maxLength={200}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Registration number</label>
              <input
                type="text"
                name="registrationNumber"
                defaultValue={org.registrationNumber ?? ""}
                maxLength={100}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Internal notes</label>
            <textarea
              name="notes"
              defaultValue={org.notes ?? ""}
              maxLength={5000}
              rows={3}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary/90"
          >
            Save changes
          </button>
        </form>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Contacts */}
        <div className="rounded-lg border border-border p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Users className="h-5 w-5" />
            Contacts ({persons.length})
          </h2>
          {persons.length === 0 ? (
            <p className="text-sm text-muted-foreground">No contacts linked yet.</p>
          ) : (
            <ul className="space-y-2">
              {persons.map((person) => (
                <li key={person.id} className="rounded-md border border-border p-3 text-sm">
                  <div className="font-medium">{person.fullName}</div>
                  {person.roleTitle && (
                    <div className="text-muted-foreground">{person.roleTitle}</div>
                  )}
                  {person.primaryEmail && (
                    <div className="text-muted-foreground">{person.primaryEmail}</div>
                  )}
                  {person.phone && (
                    <div className="text-muted-foreground">{person.phone}</div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Add contact form */}
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-primary">
              + Add contact
            </summary>
            <form action="/api/admin/persons" method="POST" className="mt-3 space-y-3">
              <input type="hidden" name={CSRF_FIELD_NAME} value={csrfToken} />
              <input type="hidden" name="organisationId" value={org.id} />
              <input
                type="text"
                name="fullName"
                placeholder="Full name *"
                required
                maxLength={200}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
              <input
                type="email"
                name="primaryEmail"
                placeholder="Email"
                maxLength={200}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                maxLength={50}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
              <input
                type="text"
                name="roleTitle"
                placeholder="Role / title"
                maxLength={200}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-fg hover:bg-primary/90"
              >
                Add contact
              </button>
            </form>
          </details>
        </div>

        {/* Cases */}
        <div className="rounded-lg border border-border p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <ClipboardList className="h-5 w-5" />
            Cases ({cases.length})
          </h2>
          {cases.length === 0 ? (
            <p className="text-sm text-muted-foreground">No cases linked yet.</p>
          ) : (
            <ul className="space-y-2">
              {cases.map((c) => {
                const isSafeguarding = c.caseType === "safeguarding";
                return (
                  <li key={c.id} className="rounded-md border border-border p-3 text-sm">
                    <a
                      href={`/admin/messages?open=${c.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {isSafeguarding ? "Safeguarding concern" : c.name}
                    </a>
                    <div className="mt-1 flex items-center gap-2">
                      <CaseStatusBadge status={c.workflowStatus} />
                      <span className="text-xs text-muted-foreground">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Due diligence */}
      <div id="due-diligence" className="mt-8 rounded-lg border border-border p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <ShieldCheck className="h-5 w-5" />
          Due diligence
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Progressive checks proportional to the relationship. Not every check is required for every organisation.
        </p>

        {DUE_DILIGENCE_LEVELS.map((level) => {
          const levelChecks = DUE_DILIGENCE_CHECKS.filter((c) => c.level === level.value);
          return (
            <div key={level.value} className="mb-6">
              <h3 className="mb-2 text-sm font-semibold">{level.label}</h3>
              <p className="mb-3 text-xs text-muted-foreground">{level.description}</p>
              <div className="space-y-2">
                {levelChecks.map((checkDef) => {
                  const existing = ddChecks.find(
                    (c) => c.checkKey === checkDef.key,
                  );
                  const currentStatus = existing?.status ?? "not_started";
                  return (
                    <form
                      key={checkDef.key}
                      action="/api/admin/cases/due-diligence"
                      method="POST"
                      className="flex flex-wrap items-center gap-2 rounded-md border border-border p-2 text-sm"
                    >
                      <input type="hidden" name={CSRF_FIELD_NAME} value={csrfToken} />
                      <input type="hidden" name="organisationId" value={org.id} />
                      <input type="hidden" name="level" value={level.value} />
                      <input type="hidden" name="checkKey" value={checkDef.key} />
                      <span className="flex-1">{checkDef.label}</span>
                      <select
                        name="status"
                        defaultValue={currentStatus}
                        className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                      >
                        {DUE_DILIGENCE_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        name="note"
                        placeholder="Note..."
                        defaultValue={existing?.note ?? ""}
                        maxLength={2000}
                        className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-xs"
                      />
                      <button
                        type="submit"
                        className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-fg hover:bg-primary/90"
                      >
                        Save
                      </button>
                    </form>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Container>
  );
}

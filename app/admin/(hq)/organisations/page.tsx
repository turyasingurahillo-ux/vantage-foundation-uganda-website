import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Building2, Plus } from "lucide-react";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { searchOrganisations } from "@/lib/db/organisations";
import { getCsrfTokenFromRequest, CSRF_FIELD_NAME } from "@/lib/csrf";
import { Container } from "@/components/shared/Container";
import { PageHeader } from "@/components/admin/hq/PageHeader";
import { getOrganisationRelationshipStatusLabel } from "@/lib/organisation-types";

export const metadata: Metadata = {
  title: "Organisations",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function OrganisationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; created?: string; error?: string }>;
}) {
  const cookieStore = await cookies();
  if (!verifySessionToken(cookieStore.get(sessionCookieName)?.value)) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const query = params.q ?? "";
  const csrfToken = await getCsrfTokenFromRequest();

  const orgs = await searchOrganisations({ query }).catch(() => []);

  return (
    <Container>
      <PageHeader
        title="Organisations"
        description="Institutional memory for every organisation Vantage engages with"
      />

      {params.created && (
        <div className="mb-4 rounded-md bg-success-bg px-4 py-2 text-sm text-success-fg">
          Organisation created.
        </div>
      )}
      {params.error && (
        <div className="mb-4 rounded-md bg-destructive-bg px-4 py-2 text-sm text-destructive-fg">
          {params.error === "invalid"
            ? "Invalid input."
            : params.error === "csrf"
              ? "Security check failed. Please try again."
              : params.error === "rate-limited"
                ? "Too many requests. Please slow down."
                : "An error occurred."}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form method="get" className="flex-1">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search organisations by name, email, website, or area..."
            className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm"
          />
        </form>
        <a
          href="#new-organisation"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New organisation
        </a>
      </div>

      {/* Organisation list */}
      <div className="mb-8 overflow-hidden rounded-lg border border-border">
        {orgs.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <Building2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {query
                ? "No organisations match your search."
                : "No organisations yet. Create one to start building institutional memory."}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Name</th>
                <th className="px-4 py-2 text-left font-medium">Type</th>
                <th className="px-4 py-2 text-left font-medium">Relationship</th>
                <th className="px-4 py-2 text-left font-medium">Owner</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => (
                <tr
                  key={org.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <a
                      href={`/admin/organisations/${org.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {org.name}
                    </a>
                    {org.website && (
                      <div className="text-xs text-muted-foreground">
                        {org.website}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {org.organisationType ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                      {getOrganisationRelationshipStatusLabel(org.relationshipStatus)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {org.primaryOwnerId ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* New organisation form */}
      <div id="new-organisation" className="rounded-lg border border-border p-6">
        <h2 className="mb-4 text-lg font-semibold">Create organisation</h2>
        <form action="/api/admin/organisations" method="POST" className="space-y-4">
          <input type="hidden" name={CSRF_FIELD_NAME} value={csrfToken} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Name *</label>
              <input
                type="text"
                name="name"
                required
                maxLength={200}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Type</label>
              <select
                name="organisationType"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">—</option>
                <option value="ngo">NGO / Non-profit</option>
                <option value="community_based">Community-based organisation</option>
                <option value="government">Government / public authority</option>
                <option value="private_company">Private company</option>
                <option value="foundation">Foundation / trust</option>
                <option value="academic">Academic / research institution</option>
                <option value="religious">Religious institution</option>
                <option value="media">Media organisation</option>
                <option value="donor_agency">Donor / funding agency</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Website</label>
              <input
                type="url"
                name="website"
                maxLength={500}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                maxLength={200}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Phone</label>
              <input
                type="tel"
                name="phone"
                maxLength={50}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Geographic area</label>
              <input
                type="text"
                name="geographicArea"
                maxLength={200}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Registration number</label>
              <input
                type="text"
                name="registrationNumber"
                maxLength={100}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Relationship status</label>
              <select
                name="relationshipStatus"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="prospect">Prospect</option>
                <option value="enquirer" selected>Enquirer</option>
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
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Notes</label>
            <textarea
              name="notes"
              maxLength={5000}
              rows={3}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="Internal notes about this organisation (never public)..."
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create organisation
          </button>
        </form>
      </div>
    </Container>
  );
}

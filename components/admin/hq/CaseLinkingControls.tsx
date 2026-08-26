import {
  searchOrganisations,
  suggestPersonsByEmailOrPhone,
} from "@/lib/db/organisations";
import type { CaseRow } from "@/lib/db/cases";
import type { OrganisationRow, PersonRow } from "@/lib/organisation-types";

interface CaseLinkingControlsProps {
  caseRow: CaseRow;
  linkedOrganisation: OrganisationRow | null;
  linkedPerson: PersonRow | null;
  csrfToken: string;
  csrfFieldName: string;
}

/**
 * Controls for linking a case to an organisation and/or person.
 *
 * Shows the current link (if any) and provides forms to:
 *   - Link to an existing organisation (search by name)
 *   - Create a new organisation from this case
 *   - Link the requester to an existing person
 *
 * This is a server component — the search results are pre-fetched
 * based on the case's text fields. No auto-merging: the admin decides.
 */
export async function CaseLinkingControls({
  caseRow,
  linkedOrganisation,
  linkedPerson,
  csrfToken,
  csrfFieldName,
}: CaseLinkingControlsProps) {
  // Suggest organisations matching the case's text organisation field
  const suggestedOrgs = caseRow.organisation
    ? await searchOrganisations({ query: caseRow.organisation, limit: 5 }).catch(
        () => [],
      )
    : [];

  // Suggest persons matching the case's email or phone
  const suggestedPersons = await suggestPersonsByEmailOrPhone(
    caseRow.email,
    caseRow.phone,
  ).catch(() => []);

  return (
    <div>
      <details>
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Organisation & person linking
        </summary>
        <div className="mt-3 space-y-4">
          {/* Current links */}
          {linkedOrganisation && (
            <div className="rounded-md border border-border p-3 text-sm">
              <span className="text-xs text-muted-foreground">Organisation:</span>
              <a
                href={`/admin/organisations/${linkedOrganisation.id}`}
                className="ml-2 font-medium text-primary hover:underline"
              >
                {linkedOrganisation.name}
              </a>
            </div>
          )}
          {linkedPerson && (
            <div className="rounded-md border border-border p-3 text-sm">
              <span className="text-xs text-muted-foreground">Person:</span>
              <span className="ml-2 font-medium">{linkedPerson.fullName}</span>
              {linkedPerson.primaryEmail && (
                <span className="ml-2 text-xs text-muted-foreground">
                  {linkedPerson.primaryEmail}
                </span>
              )}
            </div>
          )}

          {/* Unlink form */}
          {(linkedOrganisation || linkedPerson) && (
            <form
              action="/api/admin/cases/link"
              method="POST"
              className="text-xs"
            >
              <input type="hidden" name={csrfFieldName} value={csrfToken} />
              <input type="hidden" name="caseId" value={caseRow.id} />
              {linkedOrganisation && (
                <input type="hidden" name="organisationId" value="" />
              )}
              {linkedPerson && (
                <input type="hidden" name="personId" value="" />
              )}
              <button
                type="submit"
                className="text-destructive-fg hover:underline"
              >
                Unlink
              </button>
            </form>
          )}

          {/* Suggested organisations */}
          {!linkedOrganisation && suggestedOrgs.length > 0 && (
            <div>
              <p className="mb-1 text-xs text-muted-foreground">
                Suggested organisations (matching &ldquo;{caseRow.organisation}&rdquo;):
              </p>
              <ul className="space-y-1">
                {suggestedOrgs.map((org) => (
                  <li key={org.id} className="text-sm">
                    <form
                      action="/api/admin/cases/link"
                      method="POST"
                      className="inline"
                    >
                      <input type="hidden" name={csrfFieldName} value={csrfToken} />
                      <input type="hidden" name="caseId" value={caseRow.id} />
                      <input type="hidden" name="organisationId" value={org.id} />
                      <button
                        type="submit"
                        className="text-primary hover:underline"
                      >
                        Link to {org.name}
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested persons */}
          {!linkedPerson && suggestedPersons.length > 0 && (
            <div>
              <p className="mb-1 text-xs text-muted-foreground">
                Suggested persons (matching email/phone):
              </p>
              <ul className="space-y-1">
                {suggestedPersons.map((person) => (
                  <li key={person.id} className="text-sm">
                    <form
                      action="/api/admin/cases/link"
                      method="POST"
                      className="inline"
                    >
                      <input type="hidden" name={csrfFieldName} value={csrfToken} />
                      <input type="hidden" name="caseId" value={caseRow.id} />
                      <input type="hidden" name="personId" value={person.id} />
                      <button
                        type="submit"
                        className="text-primary hover:underline"
                      >
                        Link to {person.fullName}
                        {person.primaryEmail && ` (${person.primaryEmail})`}
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Create new organisation from case */}
          {!linkedOrganisation && (
            <details>
              <summary className="cursor-pointer text-xs text-primary hover:underline">
                Create new organisation from this case
              </summary>
              <form
                action="/api/admin/organisations"
                method="POST"
                className="mt-2 space-y-2"
              >
                <input type="hidden" name={csrfFieldName} value={csrfToken} />
                <input
                  type="hidden"
                  name="name"
                  value={caseRow.organisation ?? caseRow.name}
                />
                {caseRow.email && (
                  <input type="hidden" name="email" value={caseRow.email} />
                )}
                {caseRow.phone && (
                  <input type="hidden" name="phone" value={caseRow.phone} />
                )}
                <button
                  type="submit"
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-fg hover:bg-primary/90"
                >
                  Create &ldquo;{caseRow.organisation ?? caseRow.name}&rdquo;
                </button>
                <p className="text-xs text-muted-foreground">
                  You can edit details after creation. The case will need to be
                  linked manually from the organisation page.
                </p>
              </form>
            </details>
          )}
        </div>
      </details>
    </div>
  );
}

import { formatDate } from "@/lib/format";
import {
  CASE_REFERRAL_STATUSES,
  CASE_REFERRAL_OUTCOMES,
  getCaseReferralStatusLabel,
  getCaseReferralOutcomeLabel,
  type CaseReferralRow,
} from "@/lib/organisation-types";

interface CaseReferralHistoryProps {
  caseId: number;
  referrals: CaseReferralRow[];
  csrfToken: string;
  csrfFieldName: string;
}

/**
 * Referral history for a case.
 *
 * Displays all referrals chronologically (newest first) and provides
 * forms to add new referrals, update existing ones, mark as sent,
 * set follow-up dates, and record outcomes.
 *
 * This replaces the single-referral limitation of the legacy
 * contact_messages.referral_* columns. Multiple referrals per case
 * are preserved — old referrals are never overwritten.
 */
export function CaseReferralHistory({
  caseId,
  referrals,
  csrfToken,
  csrfFieldName,
}: CaseReferralHistoryProps) {
  return (
    <div>
      <details>
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Referral history ({referrals.length})
        </summary>
        <div className="mt-3 space-y-3">
          {/* Existing referrals */}
          {referrals.length > 0 && (
            <ul className="space-y-3">
              {referrals.map((referral) => (
                <li
                  key={referral.id}
                  className="rounded-md border border-border p-3 text-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className="font-medium">
                        {referral.referredToName}
                      </span>
                      {referral.opportunityName &&
                        referral.opportunityName !== referral.referredToName && (
                          <span className="ml-2 text-muted-foreground">
                            — {referral.opportunityName}
                          </span>
                        )}
                    </div>
                    <time className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(referral.referredAt)}
                    </time>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`rounded-full px-2 py-0.5 font-medium ${
                        referral.status === "closed"
                          ? "bg-muted text-muted-foreground"
                          : referral.status === "follow_up_due"
                            ? "bg-warning-bg text-warning-fg"
                            : "bg-info-bg text-info-fg"
                      }`}
                    >
                      {getCaseReferralStatusLabel(referral.status)}
                    </span>
                    {referral.outcome && (
                      <span className="rounded-full bg-muted px-2 py-0.5 font-medium">
                        Outcome: {getCaseReferralOutcomeLabel(referral.outcome)}
                      </span>
                    )}
                    {referral.followUpAt && (
                      <span className="text-muted-foreground">
                        Follow-up: {formatDate(referral.followUpAt)}
                      </span>
                    )}
                  </div>

                  {referral.description && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {referral.description}
                    </p>
                  )}
                  {referral.urlReference && (
                    <a
                      href={referral.urlReference}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-xs text-primary hover:underline"
                    >
                      Reference link ↗
                    </a>
                  )}
                  {referral.referredBy && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Referred by: {referral.referredBy}
                    </p>
                  )}
                  {referral.notes && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Notes: {referral.notes}
                    </p>
                  )}

                  {/* Inline update form */}
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-primary hover:underline">
                      Edit
                    </summary>
                    <form
                      action="/api/admin/cases/referrals"
                      method="POST"
                      className="mt-2 space-y-2 rounded-md border border-dashed border-border p-2"
                    >
                      <input type="hidden" name={csrfFieldName} value={csrfToken} />
                      <input type="hidden" name="intent" value="update" />
                      <input type="hidden" name="referralId" value={referral.id} />
                      <input
                        type="text"
                        name="referredToName"
                        defaultValue={referral.referredToName}
                        placeholder="Referred to"
                        maxLength={200}
                        className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                      />
                      <input
                        type="text"
                        name="opportunityName"
                        defaultValue={referral.opportunityName}
                        placeholder="Opportunity name"
                        maxLength={300}
                        className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                      />
                      <div className="flex gap-2">
                        <select
                          name="status"
                          defaultValue={referral.status}
                          className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                        >
                          {CASE_REFERRAL_STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="date"
                          name="followUpAt"
                          defaultValue={
                            referral.followUpAt
                              ? referral.followUpAt.toISOString().slice(0, 10)
                              : ""
                          }
                          className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                          title="Follow-up date"
                        />
                      </div>
                      <textarea
                        name="notes"
                        defaultValue={referral.notes ?? ""}
                        placeholder="Internal notes..."
                        maxLength={5000}
                        rows={2}
                        className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                      />
                      <button
                        type="submit"
                        className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-fg hover:bg-primary/90"
                      >
                        Save changes
                      </button>
                    </form>

                    {/* Record outcome form */}
                    {referral.status !== "closed" && (
                      <form
                        action="/api/admin/cases/referrals"
                        method="POST"
                        className="mt-2 space-y-2 rounded-md border border-dashed border-border p-2"
                      >
                        <input type="hidden" name={csrfFieldName} value={csrfToken} />
                        <input type="hidden" name="intent" value="outcome" />
                        <input type="hidden" name="referralId" value={referral.id} />
                        <select
                          name="outcome"
                          required
                          className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                        >
                          <option value="">Record outcome...</option>
                          {CASE_REFERRAL_OUTCOMES.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          name="notes"
                          placeholder="Outcome notes (optional)"
                          maxLength={5000}
                          className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                        />
                        <button
                          type="submit"
                          className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-fg hover:bg-primary/90"
                        >
                          Record outcome
                        </button>
                      </form>
                    )}
                  </details>
                </li>
              ))}
            </ul>
          )}

          {/* Add referral form */}
          <form
            action="/api/admin/cases/referrals"
            method="POST"
            className="space-y-2 rounded-md border border-dashed border-border p-3"
          >
            <input type="hidden" name={csrfFieldName} value={csrfToken} />
            <input type="hidden" name="caseId" value={caseId} />
            <input type="hidden" name="status" value="sent" />
            <div className="flex gap-2">
              <input
                type="text"
                name="referredToName"
                placeholder="Referred to (organisation/fund) *"
                required
                maxLength={200}
                className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm"
              />
              <input
                type="text"
                name="opportunityName"
                placeholder="Opportunity name *"
                required
                maxLength={300}
                className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm"
              />
            </div>
            <textarea
              name="description"
              placeholder="Description (what was referred, why)..."
              maxLength={2000}
              rows={2}
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
            />
            <div className="flex gap-2">
              <input
                type="url"
                name="urlReference"
                placeholder="Reference URL (optional)"
                maxLength={500}
                className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-xs"
              />
              <input
                type="text"
                name="referredBy"
                placeholder="Referred by"
                maxLength={200}
                className="rounded-md border border-border bg-background px-2 py-1.5 text-xs"
              />
              <input
                type="date"
                name="referredAt"
                className="rounded-md border border-border bg-background px-2 py-1.5 text-xs"
                title="Referred on"
              />
              <input
                type="date"
                name="followUpAt"
                className="rounded-md border border-border bg-background px-2 py-1.5 text-xs"
                title="Follow-up date"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-fg hover:bg-primary/90"
            >
              Add referral
            </button>
          </form>
        </div>
      </details>
    </div>
  );
}

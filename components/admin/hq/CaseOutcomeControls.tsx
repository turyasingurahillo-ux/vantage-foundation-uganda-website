"use client";

import { useState } from "react";
import {
  CASE_OUTCOMES,
  DECLINE_REASONS,
  REFERRAL_OUTCOMES,
} from "@/lib/case-types";
import type { CaseRow } from "@/lib/db/cases";

interface CaseOutcomeControlsProps {
  case: CaseRow;
  csrfToken: string;
  csrfFieldName: string;
}

/**
 * Outcome, decline and referral controls — progressive disclosure section.
 *
 * Collapsed by default. Expands to reveal outcome selection, decline
 * reason/detail (when outcome is 'declined'), and referral fields (when
 * outcome is 'referred' or workflow status is 'referred'). Posts to
 * /api/admin/cases/update as a normal form.
 */
export function CaseOutcomeControls({
  case: caseRow,
  csrfToken,
  csrfFieldName,
}: CaseOutcomeControlsProps) {
  const [expanded, setExpanded] = useState(false);
  const [outcome, setOutcome] = useState(caseRow.outcome ?? "");

  const hasOutcome = caseRow.outcome || caseRow.declineReason || caseRow.referralOrg;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Outcome
        </p>
        {caseRow.outcome && (
          <span className="inline-flex items-center rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {caseRow.outcome.replace(/_/g, " ")}
          </span>
        )}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="ml-auto text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
        >
          {expanded ? "Hide" : hasOutcome ? "Edit outcome" : "Set outcome"}
        </button>
      </div>

      {expanded && (
        <form
          method="post"
          action="/api/admin/cases/update"
          className="space-y-4 rounded-lg border border-border bg-surface/50 p-4"
        >
          <input type="hidden" name={csrfFieldName} value={csrfToken} />
          <input type="hidden" name="id" value={caseRow.id} />

          <div>
            <label
              htmlFor={`outcome-${caseRow.id}`}
              className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Outcome / disposition
            </label>
            <select
              id={`outcome-${caseRow.id}`}
              name="outcome"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="">—</option>
              {CASE_OUTCOMES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {outcome === "declined" && (
            <>
              <div>
                <label
                  htmlFor={`declineReason-${caseRow.id}`}
                  className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Decline reason
                </label>
                <select
                  id={`declineReason-${caseRow.id}`}
                  name="declineReason"
                  defaultValue={caseRow.declineReason ?? ""}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="">—</option>
                  {DECLINE_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor={`declineDetail-${caseRow.id}`}
                  className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Decline detail (internal)
                </label>
                <textarea
                  id={`declineDetail-${caseRow.id}`}
                  name="declineDetail"
                  rows={2}
                  maxLength={2000}
                  defaultValue={caseRow.declineDetail ?? ""}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
            </>
          )}

          {(outcome === "referred" || caseRow.workflowStatus === "referred") && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor={`referralOrg-${caseRow.id}`}
                    className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Referred to (organisation)
                  </label>
                  <input
                    id={`referralOrg-${caseRow.id}`}
                    name="referralOrg"
                    type="text"
                    maxLength={200}
                    defaultValue={caseRow.referralOrg ?? ""}
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`referralDate-${caseRow.id}`}
                    className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Referral date
                  </label>
                  <input
                    id={`referralDate-${caseRow.id}`}
                    name="referralDate"
                    type="date"
                    defaultValue={
                      caseRow.referralDate
                        ? caseRow.referralDate.toISOString().split("T")[0]
                        : ""
                    }
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor={`referralLink-${caseRow.id}`}
                  className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Referral link / reference
                </label>
                <input
                  id={`referralLink-${caseRow.id}`}
                  name="referralLink"
                  type="url"
                  maxLength={500}
                  defaultValue={caseRow.referralLink ?? ""}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor={`referralFollowupDate-${caseRow.id}`}
                    className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Referral follow-up date
                  </label>
                  <input
                    id={`referralFollowupDate-${caseRow.id}`}
                    name="referralFollowupDate"
                    type="date"
                    defaultValue={
                      caseRow.referralFollowupDate
                        ? caseRow.referralFollowupDate.toISOString().split("T")[0]
                        : ""
                    }
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`referralOutcome-${caseRow.id}`}
                    className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Referral outcome
                  </label>
                  <select
                    id={`referralOutcome-${caseRow.id}`}
                    name="referralOutcome"
                    defaultValue={caseRow.referralOutcome ?? ""}
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="">—</option>
                    {REFERRAL_OUTCOMES.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label
                  htmlFor={`referralDetail-${caseRow.id}`}
                  className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Referral detail (internal)
                </label>
                <textarea
                  id={`referralDetail-${caseRow.id}`}
                  name="referralDetail"
                  rows={2}
                  maxLength={2000}
                  defaultValue={caseRow.referralDetail ?? ""}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Save outcome
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

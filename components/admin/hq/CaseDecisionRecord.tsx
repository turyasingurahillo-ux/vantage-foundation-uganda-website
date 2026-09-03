import { formatDate } from "@/lib/format";
import {
  CASE_DECISIONS,
  getCaseDecisionLabel,
  type CaseDecisionRow,
} from "@/lib/organisation-types";

interface CaseDecisionRecordProps {
  caseId: number;
  decisions: CaseDecisionRow[];
  csrfToken: string;
  csrfFieldName: string;
}

/**
 * Decision record for a case requiring organisational judgment.
 *
 * Shows the full decision history (latest first) and a form to record
 * a new decision. This complements workflow status — it captures the
 * *why* behind a decision, not just the *what*.
 */
export function CaseDecisionRecord({
  caseId,
  decisions,
  csrfToken,
  csrfFieldName,
}: CaseDecisionRecordProps) {
  return (
    <div>
      <details>
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Decision record ({decisions.length})
        </summary>
        <div className="mt-3 space-y-3">
          {/* Existing decisions */}
          {decisions.length > 0 && (
            <ul className="space-y-2">
              {decisions.map((d) => (
                <li
                  key={d.id}
                  className="rounded-md border border-border p-3 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">
                      {getCaseDecisionLabel(d.decision)}
                    </span>
                    <time className="text-xs text-muted-foreground">
                      {formatDate(d.decisionDate)}
                    </time>
                  </div>
                  {d.rationale && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Rationale: {d.rationale}
                    </p>
                  )}
                  {d.conditions && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Conditions: {d.conditions}
                    </p>
                  )}
                  {d.decisionMakerId && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Decision maker: {d.decisionMakerId}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Add decision form */}
          <form
            action="/api/admin/cases/decision"
            method="POST"
            className="space-y-2 rounded-md border border-dashed border-border p-3"
          >
            <input type="hidden" name={csrfFieldName} value={csrfToken} />
            <input type="hidden" name="caseId" value={caseId} />
            <select
              name="decision"
              required
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
            >
              <option value="">Select decision...</option>
              {CASE_DECISIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
            <textarea
              name="rationale"
              placeholder="Rationale / internal note..."
              maxLength={5000}
              rows={2}
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
            />
            <textarea
              name="conditions"
              placeholder="Conditions (if applicable)..."
              maxLength={5000}
              rows={2}
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
            />
            <button
              type="submit"
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-fg hover:bg-primary/90"
            >
              Record decision
            </button>
          </form>
        </div>
      </details>
    </div>
  );
}

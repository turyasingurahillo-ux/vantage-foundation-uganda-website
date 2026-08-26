import { formatDate } from "@/lib/format";
import { getCaseActionStatusLabel } from "@/lib/organisation-types";
import type { CaseActionRow } from "@/lib/organisation-types";

interface CaseActionHistoryProps {
  caseId: number;
  actions: CaseActionRow[];
  csrfToken: string;
  csrfFieldName: string;
}

/**
 * Action / follow-up history for a case.
 *
 * Shows all actions (open and completed) so the full history is preserved.
 * Admins can add new actions and complete open ones. The case's
 * `next_action` column remains the "highlighted" current action, but
 * previous actions don't disappear when it changes.
 */
export function CaseActionHistory({
  caseId,
  actions,
  csrfToken,
  csrfFieldName,
}: CaseActionHistoryProps) {
  return (
    <div>
      <details>
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Action history ({actions.length})
        </summary>
        <div className="mt-3 space-y-3">
          {/* Existing actions */}
          {actions.length > 0 && (
            <ul className="space-y-2">
              {actions.map((action) => (
                <li
                  key={action.id}
                  className="rounded-md border border-border p-3 text-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className="font-medium">{action.title}</span>
                      {action.note && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {action.note}
                        </p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        action.status === "completed"
                          ? "bg-success-bg text-success-fg"
                          : action.status === "open"
                            ? "bg-warning-bg text-warning-fg"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {getCaseActionStatusLabel(action.status)}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                    {action.dueAt && (
                      <span>Due: {formatDate(action.dueAt)}</span>
                    )}
                    {action.completedAt && (
                      <span>Completed: {formatDate(action.completedAt)}</span>
                    )}
                    {action.ownerId && <span>Owner: {action.ownerId}</span>}
                  </div>
                  {action.status === "open" && (
                    <form
                      action="/api/admin/cases/actions"
                      method="POST"
                      className="mt-2"
                    >
                      <input type="hidden" name={csrfFieldName} value={csrfToken} />
                      <input type="hidden" name="intent" value="complete" />
                      <input type="hidden" name="actionId" value={action.id} />
                      <input type="hidden" name="caseId" value={caseId} />
                      <button
                        type="submit"
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Mark completed
                      </button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Add action form */}
          <form
            action="/api/admin/cases/actions"
            method="POST"
            className="space-y-2 rounded-md border border-dashed border-border p-3"
          >
            <input type="hidden" name={csrfFieldName} value={csrfToken} />
            <input type="hidden" name="caseId" value={caseId} />
            <input
              type="text"
              name="title"
              placeholder="Action title (e.g. 'Request registration certificate')"
              required
              maxLength={300}
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
            />
            <div className="flex gap-2">
              <input
                type="date"
                name="dueAt"
                className="rounded-md border border-border bg-background px-2 py-1.5 text-xs"
                title="Due date"
              />
              <input
                type="text"
                name="ownerId"
                placeholder="Owner (admin username)"
                maxLength={100}
                className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-xs"
              />
              <button
                type="submit"
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-fg hover:bg-primary/90"
              >
                Add action
              </button>
            </div>
          </form>
        </div>
      </details>
    </div>
  );
}

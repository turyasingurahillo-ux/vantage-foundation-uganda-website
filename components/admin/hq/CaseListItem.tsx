import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import { CaseStatusBadge, CasePriorityBadge } from "@/components/admin/hq/CaseStatusBadge";
import { getCaseSourceLabel, getCaseTypeLabel } from "@/lib/case-types";
import type { CaseSummary } from "@/lib/db/cases";

interface CaseListItemProps {
  case: CaseSummary;
  selected: boolean;
  preserveParams: string;
  replyCount: number;
}

function isOverdue(dueAt: Date | undefined): boolean {
  if (!dueAt) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueAt) < today;
}

/**
 * Case list item for the workspace master pane.
 *
 * Shows: workflow status badge, priority badge (only high/critical), source
 * label, sender name, organisation, case type, bounded message preview,
 * overdue indicator, reply count, relative time.
 *
 * Safeguarding cases do NOT show the message preview in the list — only the
 * case type label and sender name — to avoid leaking sensitive details in
 * an inappropriate list view. The full message is visible in the detail pane
 * behind authentication.
 */
export function CaseListItem({
  case: caseRow,
  selected,
  preserveParams,
  replyCount,
}: CaseListItemProps) {
  const overdue = isOverdue(caseRow.nextActionDueAt);
  const isSafeguarding = caseRow.caseType === "safeguarding";

  return (
    <li>
      <Link
        href={`/admin/messages?${preserveParams}&open=${caseRow.id}`}
        aria-current={selected ? "page" : undefined}
        className={cn(
          "flex flex-col gap-1 border-b border-border px-4 py-3 transition-colors",
          selected
            ? "bg-primary/5 border-l-2 border-l-primary"
            : "hover:bg-surface border-l-2 border-l-transparent",
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <CaseStatusBadge status={caseRow.workflowStatus} />
          <CasePriorityBadge priority={caseRow.priority} />
          {overdue && (
            <span className="inline-flex items-center rounded-full bg-destructive-bg px-2 py-0.5 text-xs font-semibold text-destructive-fg">
              Overdue
            </span>
          )}
          {replyCount > 0 && (
            <span className="ml-auto text-xs text-muted-foreground">
              {replyCount} {replyCount === 1 ? "reply" : "replies"}
            </span>
          )}
        </div>

        <p className="text-sm font-semibold text-foreground">
          {caseRow.name}
        </p>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          {caseRow.organisation && (
            <span className="font-medium">{caseRow.organisation}</span>
          )}
          {caseRow.caseType && (
            <span>· {getCaseTypeLabel(caseRow.caseType)}</span>
          )}
          <span>· {getCaseSourceLabel(caseRow.source)}</span>
        </div>

        {/* Safeguarding: do not show message preview in the list */}
        {!isSafeguarding && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {caseRow.messagePreview}
          </p>
        )}
        {isSafeguarding && (
          <p className="text-xs font-medium text-destructive-fg">
            Safeguarding concern — open to view details
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatRelativeTime(caseRow.createdAt)}</span>
          {caseRow.nextAction && (
            <span className={cn(overdue && "font-semibold text-destructive-fg")}>
              {overdue ? "Overdue: " : "Next: "}
              {caseRow.nextAction.length > 40
                ? caseRow.nextAction.slice(0, 40) + "…"
                : caseRow.nextAction}
            </span>
          )}
        </div>
      </Link>
    </li>
  );
}

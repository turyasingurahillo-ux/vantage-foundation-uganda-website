import { cn } from "@/lib/utils";
import type { CaseWorkflowStatus, CasePriority } from "@/lib/case-types";

const STATUS_CONFIG: Record<
  CaseWorkflowStatus,
  { label: string; classes: string; dotClasses: string }
> = {
  new: {
    label: "New",
    classes: "bg-warning-bg text-warning-fg",
    dotClasses: "bg-warning",
  },
  triage: {
    label: "Triage",
    classes: "bg-warning-bg text-warning-fg",
    dotClasses: "bg-warning",
  },
  awaiting_vantage: {
    label: "Awaiting Vantage",
    classes: "bg-info-bg text-info-fg",
    dotClasses: "bg-info",
  },
  awaiting_external: {
    label: "Awaiting External",
    classes: "bg-info-bg text-info-fg",
    dotClasses: "bg-info",
  },
  under_review: {
    label: "Under Review",
    classes: "bg-info-bg text-info-fg",
    dotClasses: "bg-info",
  },
  due_diligence: {
    label: "Due Diligence",
    classes: "bg-info-bg text-info-fg",
    dotClasses: "bg-info",
  },
  meeting_scheduled: {
    label: "Meeting Scheduled",
    classes: "bg-info-bg text-info-fg",
    dotClasses: "bg-info",
  },
  decision_required: {
    label: "Decision Required",
    classes: "bg-warning-bg text-warning-fg",
    dotClasses: "bg-warning",
  },
  accepted: {
    label: "Accepted",
    classes: "bg-success-bg text-success-fg",
    dotClasses: "bg-success",
  },
  referred: {
    label: "Referred",
    classes: "bg-surface text-muted-foreground",
    dotClasses: "bg-muted-foreground",
  },
  declined: {
    label: "Declined",
    classes: "bg-surface text-muted-foreground",
    dotClasses: "bg-muted-foreground",
  },
  completed: {
    label: "Completed",
    classes: "bg-success-bg text-success-fg",
    dotClasses: "bg-success",
  },
  archived: {
    label: "Archived",
    classes: "bg-surface text-muted-foreground",
    dotClasses: "bg-muted-foreground",
  },
};

const PRIORITY_CONFIG: Record<CasePriority, { label: string; classes: string }> = {
  critical: { label: "Critical", classes: "bg-destructive-bg text-destructive-fg" },
  high: { label: "High", classes: "bg-warning-bg text-warning-fg" },
  normal: { label: "Normal", classes: "bg-surface text-muted-foreground" },
  low: { label: "Low", classes: "bg-surface text-muted-foreground" },
};

interface CaseStatusBadgeProps {
  status: CaseWorkflowStatus;
  className?: string;
}

export function CaseStatusBadge({ status, className }: CaseStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        config.classes,
        className,
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", config.dotClasses)}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}

interface CasePriorityBadgeProps {
  priority: CasePriority;
  className?: string;
}

/**
 * Priority badge. Only rendered for critical/high priorities in the list
 * to avoid visual noise — normal/low are implied by absence.
 */
export function CasePriorityBadge({ priority, className }: CasePriorityBadgeProps) {
  if (priority === "normal" || priority === "low") return null;
  const config = PRIORITY_CONFIG[priority];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-semibold",
        config.classes,
        className,
      )}
    >
      {config.label}
    </span>
  );
}

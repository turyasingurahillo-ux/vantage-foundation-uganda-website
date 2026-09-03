import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { getWorkflowStatusLabel } from "@/lib/case-types";
import type { UpcomingAction } from "@/lib/db/cases";
import type { LucideIcon } from "lucide-react";

interface UpcomingActionsListProps {
  title: string;
  icon: LucideIcon;
  actions: UpcomingAction[];
  available: boolean;
  variant: "overdue" | "today" | "upcoming";
}

/**
 * Upcoming actions list for the dashboard attention centre.
 *
 * Shows next-action due dates for active cases. Each item links to the case
 * detail view. Safeguarding cases are NOT shown here with their next-action
 * text — only the case name and due date — to avoid leaking sensitive
 * operational details in a dashboard summary view.
 */
export function UpcomingActionsList({
  title,
  icon: Icon,
  actions,
  available,
  variant,
}: UpcomingActionsListProps) {
  const variantClasses = {
    overdue: "border-destructive/30 bg-destructive/5",
    today: "border-warning/30 bg-warning/5",
    upcoming: "border-border bg-white",
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        variantClasses[variant],
      )}
    >
      <div className="flex items-center gap-2">
        <Icon
          className={cn(
            "h-4 w-4",
            variant === "overdue" && "text-destructive-fg",
            variant === "today" && "text-warning-fg",
            variant === "upcoming" && "text-muted-foreground",
          )}
          aria-hidden="true"
        />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {actions.length > 0 && (
          <span className="ml-auto text-xs font-medium text-muted-foreground">
            {actions.length}
          </span>
        )}
      </div>

      {!available && (
        <p className="mt-3 text-xs text-muted-foreground">
          Action data unavailable.
        </p>
      )}

      {available && actions.length === 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          {variant === "overdue" && "No overdue actions."}
          {variant === "today" && "Nothing due today."}
          {variant === "upcoming" && "Nothing due this week."}
        </p>
      )}

      {available && actions.length > 0 && (
        <ul className="mt-3 space-y-2">
          {actions.slice(0, 5).map((action) => (
            <li key={action.id}>
              <Link
                href={`/admin/messages?filter=${variant === "overdue" ? "overdue" : "active"}&open=${action.id}`}
                className="block rounded-lg p-2 transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-medium text-foreground">
                    {action.name}
                  </p>
                  <time
                    dateTime={action.nextActionDueAt.toISOString()}
                    className={cn(
                      "shrink-0 text-xs",
                      variant === "overdue"
                        ? "font-semibold text-destructive-fg"
                        : "text-muted-foreground",
                    )}
                  >
                    {formatDate(action.nextActionDueAt)}
                  </time>
                </div>
                {action.organisation && (
                  <p className="truncate text-xs text-muted-foreground">
                    {action.organisation}
                  </p>
                )}
                <p className="truncate text-xs text-muted-foreground">
                  {action.nextAction}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {getWorkflowStatusLabel(action.workflowStatus)}
                </p>
              </Link>
            </li>
          ))}
          {actions.length > 5 && (
            <li>
              <Link
                href={`/admin/messages?filter=${variant === "overdue" ? "overdue" : "active"}`}
                className="block rounded-lg p-2 text-center text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                View all {actions.length} →
              </Link>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

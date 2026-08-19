import { cn } from "@/lib/utils";
import type { ContactMessageStatus } from "@/lib/db/contact";

const STATUS_CONFIG: Record<
  ContactMessageStatus,
  { label: string; classes: string; dotClasses: string }
> = {
  new: {
    label: "New",
    classes: "bg-warning-bg text-warning-fg",
    dotClasses: "bg-warning",
  },
  awaiting_response: {
    label: "Awaiting response",
    classes: "bg-warning-bg text-warning-fg",
    dotClasses: "bg-warning",
  },
  replied: {
    label: "Replied",
    classes: "bg-success-bg text-success-fg",
    dotClasses: "bg-success",
  },
  archived: {
    label: "Archived",
    classes: "bg-surface text-muted-foreground",
    dotClasses: "bg-muted-foreground",
  },
};

interface MessageStatusBadgeProps {
  status: ContactMessageStatus;
  className?: string;
}

/**
 * Status badge for contact message workflow state.
 *
 * Status is never communicated by colour alone: the text label is always
 * present, and the dot is decorative (aria-hidden).
 */
export function MessageStatusBadge({
  status,
  className,
}: MessageStatusBadgeProps) {
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

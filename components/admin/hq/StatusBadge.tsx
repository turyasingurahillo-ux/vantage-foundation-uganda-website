import { cn } from "@/lib/utils";

export type DonationStatus = "pending" | "verified" | "rejected";

interface StatusBadgeProps {
  status: DonationStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  DonationStatus,
  { label: string; classes: string; dotClasses: string }
> = {
  pending: {
    label: "Pending",
    classes: "bg-warning-bg text-warning-fg",
    dotClasses: "bg-warning",
  },
  verified: {
    label: "Verified",
    classes: "bg-success-bg text-success-fg",
    dotClasses: "bg-success",
  },
  rejected: {
    label: "Rejected",
    classes: "bg-destructive-bg text-destructive-fg",
    dotClasses: "bg-destructive",
  },
};

/**
 * Status badge with a colour dot + text label.
 *
 * Status is never communicated by colour alone: the text label is always
 * present, and the dot is decorative (aria-hidden).
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
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

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

interface AttentionCardProps {
  href: string;
  label: string;
  description: string;
  count: number;
  /** When true, the count is shown as a warning badge (needs action). */
  urgent?: boolean;
  /** When the data source is unavailable, show a degraded state. */
  unavailable?: boolean;
  /** Accessible label for the count, e.g. "3 pending donations". */
  countLabel?: string;
  className?: string;
}

/**
 * Attention card for the dashboard — links to a filtered workflow.
 *
 * - A non-zero count with `urgent` renders a warning badge.
 * - A zero count renders a calm "resolved" state (success badge).
 * - An unavailable source renders a muted "unavailable" state.
 *
 * Status is never communicated by colour alone: the count and label
 * are always present as text.
 */
export function AttentionCard({
  href,
  label,
  description,
  count,
  urgent,
  unavailable,
  countLabel,
  className,
}: AttentionCardProps) {
  if (unavailable) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed border-border bg-white p-5",
          className,
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-medium text-foreground">{label}</div>
            <div className="text-sm text-muted-foreground">
              Data unavailable
            </div>
          </div>
          <Badge variant="outline">—</Badge>
        </div>
      </div>
    );
  }

  const resolved = count === 0;
  const badgeVariant = resolved ? "success" : urgent ? "warning" : "default";
  const badgeText = countLabel ?? String(count);

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center justify-between gap-3 rounded-xl border border-border bg-white p-5 transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        className,
      )}
    >
      <div className="min-w-0">
        <div className="font-medium text-foreground">{label}</div>
        <div className="truncate text-sm text-muted-foreground">
          {resolved ? "All caught up" : description}
        </div>
      </div>
      <Badge
        variant={badgeVariant}
        aria-label={countLabel ?? `${count} ${label.toLowerCase()}`}
      >
        {badgeText}
      </Badge>
    </Link>
  );
}

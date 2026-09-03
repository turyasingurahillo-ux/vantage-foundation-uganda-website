import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionProps {
  href: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  className?: string;
}

/**
 * A single quick-action link button for the dashboard.
 * Renders as a link with an icon and label.
 */
export function QuickAction({
  href,
  label,
  description,
  icon: Icon,
  className,
}: QuickActionProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col gap-1 rounded-xl border border-border bg-white p-4 transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <Icon
          className="h-5 w-5 text-primary"
          aria-hidden="true"
        />
        <span className="font-medium text-foreground">{label}</span>
      </div>
      {description && (
        <span className="text-sm text-muted-foreground">{description}</span>
      )}
    </Link>
  );
}

import Link from "next/link";
import { cn } from "@/lib/utils";

export interface StatusTab {
  /** Tab label, e.g. "Pending". */
  label: string;
  /** URL search params string for this tab, e.g. "status=pending". */
  params: string;
  /** Whether this tab is currently active. */
  active: boolean;
  /** Optional count badge. */
  count?: number;
}

interface StatusTabsProps {
  tabs: StatusTab[];
  /** Base path for tab links, e.g. "/admin/donations". */
  basePath: string;
  className?: string;
}

/**
 * Segmented tab navigation for status filtering.
 *
 * Renders as a row of links (server-component friendly) with aria-current
 * for the active tab. Keyboard navigation uses native link semantics —
 * Tab moves between tabs, Enter activates.
 *
 * The active tab is identified by aria-current="page" and a visual
 * indicator (background + text colour), not by colour alone.
 */
export function StatusTabs({ tabs, basePath, className }: StatusTabsProps) {
  return (
    <nav
      aria-label="Filter by status"
      className={cn(
        "flex flex-wrap gap-1 rounded-xl border border-border bg-white p-1",
        className,
      )}
    >
      {tabs.map((tab) => {
        const href = tab.params ? `${basePath}?${tab.params}` : basePath;
        return (
          <Link
            key={tab.label}
            href={href}
            aria-current={tab.active ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              tab.active
                ? "bg-primary text-white"
                : "text-foreground hover:bg-surface",
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular-nums",
                  tab.active
                    ? "bg-white/20 text-white"
                    : tab.count > 0
                      ? "bg-warning-bg text-warning-fg"
                      : "bg-surface text-muted-foreground",
                )}
                aria-label={`${tab.count} ${tab.label.toLowerCase()}`}
              >
                {tab.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

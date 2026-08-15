"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Filter } from "lucide-react";
import {
  ActionStatusBadge,
  type ActionStatus,
} from "@/components/guides/GuideBadges";
import type {
  OpportunityStatus,
  OpportunityType,
} from "@/lib/career-guide";
import { cn } from "@/lib/utils";

export interface OpportunityBoardItem {
  id: string;
  status: OpportunityStatus;
  type: OpportunityType;
  funding: string;
  content: ReactNode;
}

export interface OpportunityBoardGroup {
  status: OpportunityStatus;
  heading: string;
  items: OpportunityBoardItem[];
}

const statusMeta: Record<
  OpportunityStatus,
  { label: string; badge: ActionStatus; headingId: string }
> = {
  act: { label: "Act now", badge: "act", headingId: "act-now" },
  watch: {
    label: "Watch",
    badge: "watch",
    headingId: "watch-the-next-date-is-not-published",
  },
  "not-now": {
    label: "Not for now",
    badge: "not-now",
    headingId: "remove-these-from-your-list",
  },
};

const filterButton =
  "min-h-11 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

export function OpportunityBoard({
  checkedAt,
  groups,
  guidance,
}: {
  checkedAt: string;
  groups: OpportunityBoardGroup[];
  guidance?: ReactNode;
}) {
  const [status, setStatus] = useState<"all" | OpportunityStatus>("all");
  const [type, setType] = useState<"all" | OpportunityType>("all");
  const types = useMemo(
    () =>
      Array.from(
        new Set(groups.flatMap((group) => group.items.map((item) => item.type)))
      ),
    [groups]
  );

  // Group headings double as guide-navigation targets. A filter that hides a
  // group deletes the element those links point at, so clear the filters when a
  // reader navigates to a hidden group and re-run the scroll once the heading is
  // back in the DOM. Filters start at "all", so only later navigation matters.
  useEffect(() => {
    const isGroupHeading = (id: string) =>
      (Object.keys(statusMeta) as OpportunityStatus[]).some(
        (value) => statusMeta[value].headingId === id
      );

    const reveal = (id: string) => {
      if (!isGroupHeading(id)) return;
      setStatus("all");
      setType("all");
      window.requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView();
      });
    };

    const onHashChange = () =>
      reveal(decodeURIComponent(window.location.hash.slice(1)));

    // Re-clicking the link for the hash already in the URL fires no hashchange.
    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement | null)?.closest?.(
        'a[href*="#"]'
      );
      const href = link?.getAttribute("href");
      if (!href) return;
      reveal(decodeURIComponent(href.slice(href.indexOf("#") + 1)));
    };

    window.addEventListener("hashchange", onHashChange);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      document.removeEventListener("click", onClick);
    };
  }, []);

  const visibleGroups = groups
    .filter((group) => status === "all" || group.status === status)
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => type === "all" || item.type === type),
    }))
    .filter((group) => group.items.length > 0);
  const visibleCount = visibleGroups.reduce(
    (count, group) => count + group.items.length,
    0
  );

  return (
    <section
      id="11-opportunity-board-14-august-2026"
      className="scroll-mt-40 border-y border-border bg-surface px-4 py-10 sm:px-6 lg:scroll-mt-28 md:py-12 lg:px-8"
      aria-labelledby="opportunity-board-heading"
    >
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary">
            Verified opportunity board
          </p>
          <h2
            id="opportunity-board-heading"
            className="mt-2 text-3xl font-bold tracking-tight text-foreground"
          >
            Opportunities checked 14 August 2026
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            Status last checked at {checkedAt || "23:08 EAT"}. Recheck the official
            source before applying; a visible page is not always an open call.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
          <Filter className="h-4 w-4 text-primary" aria-hidden="true" />
          {visibleCount} {visibleCount === 1 ? "result" : "results"}
        </div>
      </div>

      <div className="grid gap-5 py-6 md:grid-cols-2">
        <fieldset>
          <legend className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
            Filter by action status
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStatus("all")}
              aria-pressed={status === "all"}
              className={cn(
                filterButton,
                status === "all"
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white text-foreground hover:border-primary"
              )}
            >
              All
            </button>
            {(Object.keys(statusMeta) as OpportunityStatus[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                aria-pressed={status === value}
                className={cn(
                  filterButton,
                  status === value
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-white text-foreground hover:border-primary"
                )}
              >
                {statusMeta[value].label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">
            Filter by opportunity type
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setType("all")}
              aria-pressed={type === "all"}
              className={cn(
                filterButton,
                type === "all"
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white text-foreground hover:border-primary"
              )}
            >
              All types
            </button>
            {types.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                aria-pressed={type === value}
                className={cn(
                  filterButton,
                  type === value
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-white text-foreground hover:border-primary"
                )}
              >
                {value}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        Showing {visibleCount} opportunities.
      </p>

      <div className="space-y-10">
        {visibleGroups.map((group) => (
          <section
            key={group.status}
            aria-labelledby={statusMeta[group.status].headingId}
          >
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h3
                id={statusMeta[group.status].headingId}
                className="scroll-mt-40 text-xl font-bold lg:scroll-mt-28"
              >
                {group.heading.replace(/^[^A-Za-z]+/, "")}
              </h3>
              <ActionStatusBadge status={statusMeta[group.status].badge} />
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {group.items.map((item) => (
                <article
                  key={item.id}
                  className="flex min-w-0 flex-col border-l-2 border-primary/70 bg-white p-5"
                >
                  <div className="mb-3.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 border-b border-border pb-2.5 text-xs text-slate-600">
                    <span className="font-bold uppercase tracking-[0.07em] text-slate-700">
                      {item.type}
                    </span>
                    <span aria-hidden="true" className="text-slate-300">
                      /
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          item.funding === "Unconfirmed" ? "bg-warning" : "bg-success"
                        )}
                        aria-hidden="true"
                      />
                      Funding: {item.funding.toLowerCase()}
                    </span>
                  </div>
                  <div className="text-[0.975rem] leading-relaxed text-slate-700">
                    {item.content}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      {visibleCount === 0 && (
        <div className="border border-dashed border-border bg-white p-6 text-sm text-slate-600">
          No opportunities match both filters. Change one filter to see more.
        </div>
      )}

      {guidance && (
        <div className="mt-10 border-t border-border pt-8">{guidance}</div>
      )}
    </section>
  );
}

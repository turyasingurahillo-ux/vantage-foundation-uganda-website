"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, List } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GuideNavigationItem {
  id: string;
  label: string;
}

function useGuidePosition(items: GuideNavigationItem[], targetId: string) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const [progress, setProgress] = useState(0);
  const ids = useMemo(() => items.map((item) => item.id), [items]);

  useEffect(() => {
    const headings = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -68% 0px", threshold: [0, 1] }
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [ids]);

  // A jump lands the heading above the observer's detection band, so nothing
  // intersects and the highlight would stay behind. Readers with
  // prefers-reduced-motion get instant jumps for every link, so trust the hash
  // directly whenever it names a section.
  useEffect(() => {
    const syncToHash = () => {
      const hash = decodeURIComponent(window.location.hash.slice(1));
      if (hash && ids.includes(hash)) setActiveId(hash);
    };

    window.addEventListener("hashchange", syncToHash);
    return () => window.removeEventListener("hashchange", syncToHash);
  }, [ids]);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const target = document.getElementById(targetId);
      if (!target) return;
      const start = target.offsetTop;
      const distance = Math.max(target.offsetHeight - window.innerHeight, 1);
      const value = Math.min(Math.max((window.scrollY - start) / distance, 0), 1);
      setProgress(value);
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [targetId]);

  return { activeId, progress };
}

function NavigationLinks({
  items,
  activeId,
  onNavigate,
}: {
  items: GuideNavigationItem[];
  activeId: string;
  onNavigate?: () => void;
}) {
  return (
    <ol className="space-y-0.5">
      {items.map((item, index) => {
        const active = activeId === item.id;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={onNavigate}
              className={cn(
                "group flex min-h-10 items-start gap-2.5 rounded-md px-2.5 py-2 text-sm leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                active
                  ? "bg-primary-light font-semibold text-primary-dark"
                  : "text-slate-600 hover:bg-surface hover:text-foreground"
              )}
              aria-current={active ? "location" : undefined}
            >
              <span
                className={cn(
                  "mt-0.5 w-4 shrink-0 text-right font-mono text-[0.68rem]",
                  active ? "text-primary" : "text-slate-600"
                )}
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{item.label}</span>
            </a>
          </li>
        );
      })}
    </ol>
  );
}

export function GuideNavigation({
  items,
  targetId = "career-guide-content",
}: {
  items: GuideNavigationItem[];
  targetId?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { activeId, progress } = useGuidePosition(items, targetId);
  const activeLabel = items.find((item) => item.id === activeId)?.label;

  return (
    <>
      <div
        className="fixed inset-x-0 top-0 z-[60] h-1 bg-transparent"
        aria-hidden="true"
      >
        <div
          className="h-full origin-left bg-deep-teal transition-transform duration-150 motion-reduce:transition-none"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      <div className="sticky top-[85px] z-30 -mx-4 border-b border-border bg-white/95 px-4 py-2 shadow-sm backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-expanded={mobileOpen}
          aria-controls="guide-mobile-sections"
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <List className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span>
              <span className="block text-xs font-bold uppercase tracking-[0.08em] text-primary">
                Jump to section
              </span>
              <span className="block truncate text-sm text-slate-600">
                {activeLabel ?? "Start here"}
              </span>
            </span>
          </span>
          <ChevronDown
            className={cn(
              "h-5 w-5 shrink-0 transition-transform motion-reduce:transition-none",
              mobileOpen && "rotate-180"
            )}
            aria-hidden="true"
          />
        </button>
        {mobileOpen && (
          <nav
            id="guide-mobile-sections"
            className="max-h-[min(62vh,32rem)] overflow-y-auto border-t border-border pb-2 pt-3"
            aria-label="Career guide sections"
          >
            <NavigationLinks
              items={items}
              activeId={activeId}
              onNavigate={() => setMobileOpen(false)}
            />
          </nav>
        )}
      </div>

      <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
        <nav
          className="max-h-[calc(100vh-7rem)] overflow-y-auto overscroll-contain border-l border-border pl-4 pr-2"
          aria-label="On this page"
        >
          <p className="mb-3 px-2.5 text-xs font-bold uppercase tracking-[0.1em] text-primary">
            On this page
          </p>
          <NavigationLinks items={items} activeId={activeId} />
        </nav>
      </aside>
    </>
  );
}

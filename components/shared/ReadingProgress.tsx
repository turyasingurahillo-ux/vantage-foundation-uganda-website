"use client";

import { useEffect, useState } from "react";

/**
 * ReadingProgress — a thin bar pinned to the top of the viewport whose width
 * tracks how far the reader has moved through an article.
 *
 * When `targetId` names an element the bar measures progress through that
 * element, so the header, hero and related-stories carousel do not count as
 * article the reader has finished. Without it, progress is measured across the
 * whole document.
 */
export function ReadingProgress({ targetId }: { targetId?: string }) {
  const progress = useReadingProgress(targetId);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-1 bg-transparent"
      aria-hidden="true"
    >
      <div
        className="h-full origin-left bg-deep-teal transition-transform duration-150 motion-reduce:transition-none"
        style={{ transform: `scaleX(${progress})` }}
        data-testid="reading-progress"
        data-progress={progress.toFixed(3)}
      />
    </div>
  );
}

export function useReadingProgress(targetId?: string): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const target = targetId ? document.getElementById(targetId) : null;

      if (target) {
        const start = target.offsetTop;
        const distance = Math.max(target.offsetHeight - window.innerHeight, 1);
        setProgress(clamp((window.scrollY - start) / distance));
        return;
      }

      if (targetId) return;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? clamp(window.scrollY / scrollable) : 0);
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

  return progress;
}

function clamp(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

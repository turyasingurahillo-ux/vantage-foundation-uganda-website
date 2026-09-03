"use client";

import { useEffect, useState, type ReactNode } from "react";

interface LazySectionProps {
  children: ReactNode;
  /**
   * Placeholder height to prevent layout shift while the section loads.
   * Use a CSS value (e.g. "400px", "50vh").
   */
  placeholderHeight?: string;
  /**
   * Root margin for the IntersectionObserver. A positive value preloads
   * the section before it scrolls into view. Default: "200px" (loads
   * when the section is within 200px of the viewport).
   */
  rootMargin?: string;
  /** Optional className for the placeholder. */
  className?: string;
  /** Optional test id for the placeholder, useful for driving lazy E2E tests. */
  dataTestId?: string;
}

/**
 * Defers rendering of client-side children until the section scrolls near
 * the viewport. The server-rendered HTML includes a placeholder div with
 * the specified height (preventing CLS); the actual children are mounted
 * only when the user scrolls close enough.
 *
 * Use this for heavy below-the-fold client components (interactive maps,
 * galleries, filter UIs) to reduce initial JS execution time on mobile.
 *
 * The initial `visible` state is `false` so server and client render the
 * same placeholder during hydration. Browsers that do not support
 * IntersectionObserver will not auto-reveal the section; the heavy children
 * are client-only and below-the-fold, so a missing observer is acceptable.
 */
export function LazySection({
  children,
  placeholderHeight = "400px",
  rootMargin = "200px",
  className,
  dataTestId,
}: LazySectionProps) {
  const [visible, setVisible] = useState(false);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  if (visible) {
    return <>{children}</>;
  }

  return (
    <div
      ref={setRef}
      style={{ height: placeholderHeight }}
      className={className}
      aria-hidden="true"
      data-testid={dataTestId}
    />
  );
}

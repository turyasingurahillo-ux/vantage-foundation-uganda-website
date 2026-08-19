"use client";

import { useCallback } from "react";

export function SkipToContent() {
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const main = document.getElementById("main");
    if (main) {
      if (main.tabIndex < 0) main.tabIndex = -1;
      main.focus();
    }
  }, []);

  return (
    <a
      href="#main"
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
    >
      Skip to main content
    </a>
  );
}

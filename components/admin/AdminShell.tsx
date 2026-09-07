"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

interface AdminShellProps {
  children: React.ReactNode;
  csrfToken: string;
  actorName: string;
}

/** Keep the page behind the modal drawer out of the tab order and a11y tree. */
function isolatePageBehind(menu: HTMLElement): () => void {
  const siblings = Array.from(document.body.children).filter(
    (element) => element !== menu && !element.contains(menu) && element.tagName !== "SCRIPT",
  );
  const previous = siblings.map((element) => ({
    element,
    wasInert: element.hasAttribute("inert"),
    ariaHidden: element.getAttribute("aria-hidden"),
  }));

  for (const element of siblings) {
    element.setAttribute("inert", "");
    element.setAttribute("aria-hidden", "true");
  }

  return () => {
    for (const { element, wasInert, ariaHidden } of previous) {
      if (!wasInert) element.removeAttribute("inert");
      if (ariaHidden === null) element.removeAttribute("aria-hidden");
      else element.setAttribute("aria-hidden", ariaHidden);
    }
  };
}

export function AdminShell({
  children,
  csrfToken,
  actorName,
}: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mobileOpen) return;

    const drawer = drawerRef.current;
    if (!drawer) return;

    // Focus the close button when the drawer opens.
    closeButtonRef.current?.focus();

    const releasePage = isolatePageBehind(drawer);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        return;
      }

      if (e.key === "Tab" && drawer) {
        const focusable = drawer.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !drawer.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !drawer.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      releasePage();
    };
  }, [mobileOpen]);

  const wasOpen = useRef(false);

  useEffect(() => {
    // Restore focus to the menu trigger only when the drawer transitions
    // from open to closed; do not focus anything on initial mount.
    if (wasOpen.current && !mobileOpen) {
      menuButtonRef.current?.focus();
    }
    wasOpen.current = mobileOpen;
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-slate-50 text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <AdminSidebar
        csrfToken={csrfToken}
        actorName={actorName}
        className="fixed left-0 top-0 z-40 hidden h-screen lg:flex"
      />

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          role="presentation"
          onClick={() => setMobileOpen(false)}
        >
          <div
            ref={drawerRef}
            id="admin-mobile-nav"
            className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Vantage HQ navigation"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <span className="font-bold text-foreground">Vantage HQ</span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <AdminSidebar
              csrfToken={csrfToken}
              actorName={actorName}
              onClose={() => setMobileOpen(false)}
              className="h-[calc(100%-4rem)] border-0"
            />
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-col lg:pl-64">
        <AdminTopbar
          actorName={actorName}
          onMenuClick={() => setMobileOpen(true)}
          mobileOpen={mobileOpen}
          menuButtonRef={menuButtonRef}
        />
        <main
          id="main"
          tabIndex={-1}
          className="flex-1 p-4 outline-none sm:p-6 lg:p-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

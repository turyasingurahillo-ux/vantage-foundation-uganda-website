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

export function AdminShell({
  children,
  csrfToken,
  actorName,
}: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!mobileOpen) return;

    // Focus the close button when the drawer opens.
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
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
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-border"
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

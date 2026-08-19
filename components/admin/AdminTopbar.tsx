"use client";

import { Menu } from "lucide-react";

export interface AdminTopbarProps {
  actorName: string;
  onMenuClick: () => void;
  mobileOpen: boolean;
  menuButtonRef?: React.Ref<HTMLButtonElement | null>;
}

export function AdminTopbar({
  actorName,
  onMenuClick,
  mobileOpen,
  menuButtonRef,
}: AdminTopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          ref={menuButtonRef}
          type="button"
          onClick={onMenuClick}
          aria-label="Open Vantage HQ navigation"
          aria-expanded={mobileOpen}
          aria-controls="admin-mobile-nav"
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-border lg:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <span className="font-semibold text-foreground lg:hidden">
          Vantage HQ
        </span>
      </div>
      <div className="text-sm text-muted-foreground">
        Signed in as{" "}
        <span className="font-medium text-foreground" title={actorName}>
          {actorName}
        </span>
      </div>
    </header>
  );
}

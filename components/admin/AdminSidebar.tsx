"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ExternalLink } from "lucide-react";
import { CSRF_FIELD_NAME } from "@/lib/csrf-constants";
import { adminNavGroups } from "@/lib/admin-navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";
import { site } from "@/content/site";

export interface AdminSidebarProps {
  csrfToken: string;
  actorName: string;
  onClose?: () => void;
  className?: string;
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({
  csrfToken,
  actorName,
  onClose,
  className,
}: AdminSidebarProps) {
  const pathname = usePathname() ?? "";

  return (
    <aside
      className={cn(
        "flex w-64 flex-col border-r border-border bg-white",
        className,
      )}
    >
      <div className="flex h-16 items-center border-b border-border px-4">
        <Logo
          href="/admin"
          variant="symbol"
          height={32}
          alt=""
          className="shrink-0"
        />
        <div className="ml-3 leading-tight">
          <div className="text-sm font-bold text-foreground">
            {site.name}
          </div>
          <div className="text-xs font-semibold text-primary">Vantage HQ</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Vantage HQ">
        {adminNavGroups.map((group) => (
          <div key={group.title} className="mb-6">
            <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {group.title}
            </div>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary text-white"
                          : "text-foreground hover:bg-slate-100",
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-3 border-t border-border p-4">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[44px] items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-slate-100"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          View public website
        </a>

        <p className="px-3 text-xs text-muted-foreground">
          Signed in as{" "}
          <span className="font-medium text-foreground" title={actorName}>
            {actorName}
          </span>
        </p>

        <form method="post" action="/api/admin/logout">
          <input type="hidden" name={CSRF_FIELD_NAME} value={csrfToken} />
          <button
            type="submit"
            className="flex w-full min-h-[44px] items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Log out
          </button>
        </form>
      </div>
    </aside>
  );
}

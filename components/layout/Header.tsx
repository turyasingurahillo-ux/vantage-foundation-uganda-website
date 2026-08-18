"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { site } from "@/content/site";
import type { NavEntry } from "@/types";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/shared/Container";
import { Logo } from "@/components/shared/Logo";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function DesktopNavItem({ item, pathname }: { item: NavEntry; pathname: string }) {
  const [open, setOpen] = useState(false);
  const itemRef = useRef<HTMLLIElement>(null);
  const active = isActive(pathname, item.href);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (itemRef.current && !itemRef.current.contains(e.target as Node)) {
        close();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, close]);

  if (!item.children || item.children.length === 0) {
    const isDonate = item.label === "Donate";
    if (isDonate) {
      return (
        <li ref={itemRef}>
          <Button href={item.href} size="sm" className="min-h-[44px]">
            {item.label}
          </Button>
        </li>
      );
    }
    return (
      <li ref={itemRef}>
        <Link
          href={item.href}
          className={cn(
            "inline-flex min-h-[44px] items-center text-sm font-medium transition-colors hover:text-primary",
            active ? "text-primary" : "text-foreground"
          )}
          aria-current={active ? "page" : undefined}
        >
          {item.label}
        </Link>
      </li>
    );
  }

  return (
    <li ref={itemRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          "inline-flex min-h-[44px] items-center gap-1 text-sm font-medium transition-colors hover:text-primary",
          active ? "text-primary" : "text-foreground"
        )}
      >
        {item.label}
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      {open && (
        <ul className="absolute left-0 top-full z-50 mt-1 min-w-[15rem] rounded-lg border border-border bg-white py-2 shadow-lg">
          {item.children.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                onClick={close}
                className={cn(
                  "block min-h-[44px] px-4 py-2 text-sm text-foreground transition-colors hover:bg-surface hover:text-primary",
                  isActive(pathname, child.href) && "text-primary"
                )}
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function MobileNavItem({
  item,
  pathname,
  onNavigate,
}: {
  item: NavEntry;
  pathname: string;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const active = isActive(pathname, item.href);

  if (!item.children || item.children.length === 0) {
    const isDonate = item.label === "Donate";
    if (isDonate) {
      return (
        <Button
          href={item.href}
          onClick={onNavigate}
          className="mt-2 min-h-[44px]"
        >
          {item.label}
        </Button>
      );
    }
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "flex min-h-[44px] items-center text-lg font-medium",
          active ? "text-primary" : "text-foreground"
        )}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className={cn(
          "flex min-h-[44px] w-full items-center justify-between text-lg font-medium",
          active ? "text-primary" : "text-foreground"
        )}
      >
        {item.label}
        <ChevronDown
          className={cn("h-5 w-5 transition-transform", expanded && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      {expanded && (
        <ul className="mt-2 flex flex-col gap-1 pl-4">
          {item.children.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                onClick={onNavigate}
                className="block min-h-[44px] py-2 text-base text-muted-foreground hover:text-primary"
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Header() {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const menu = menuRef.current;
    if (!menu) return;

    const trigger = triggerRef.current;

    const closeBtn = menu.querySelector<HTMLButtonElement>("[aria-label='Close menu']");
    closeBtn?.focus();

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }

      if (e.key === "Tab") {
        const focusable = menu.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      trigger?.focus();
    };
  }, [open]);

  const navItems = site.nav;
  const donateItem = navItems.find((i) => i.label === "Donate");
  const navWithoutDonate = navItems.filter((i) => i.label !== "Donate");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-white/95 backdrop-blur">
      <div className="h-1 w-full bg-gradient-to-r from-primary via-deep-teal to-primary" aria-hidden="true" />
      <Container>
        <div className="flex h-20 items-center justify-between">
          <Logo
            href="/"
            variant="horizontal"
            height={56}
            alt={site.name}
          />

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Main navigation">
            <ul className="flex items-center gap-6">
              {navWithoutDonate.map((item) => (
                <DesktopNavItem key={item.href} item={item} pathname={pathname} />
              ))}
            </ul>
            {donateItem && (
              <Button href={donateItem.href} size="sm" className="min-h-[44px]">
                {donateItem.label}
              </Button>
            )}
          </nav>

          <button
            ref={triggerRef}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </Container>

      {open && (
        <div
          ref={menuRef}
          id="mobile-menu"
          className="fixed inset-0 z-50 bg-white lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <Container>
            <div className="flex h-20 items-center justify-between">
              <Link href="/" onClick={() => setOpen(false)} aria-label={site.name}>
                <Logo variant="horizontal" height={48} alt={site.name} />
              </Link>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </Container>
          <nav className="flex flex-col gap-2 px-4 pt-8" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <MobileNavItem
                key={item.href}
                item={item}
                pathname={pathname}
                onNavigate={() => setOpen(false)}
              />
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

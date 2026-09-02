"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import type { NavEntry } from "@/types";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Container } from "@/components/shared/Container";
import { Logo } from "@/components/shared/Logo";
import { cn } from "@/lib/utils";
import { localePath, stripLocale, type Locale } from "@/lib/i18n/config";
import type { I18nDictionary } from "@/lib/i18n/dictionaries";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { site } from "@/content/site";

const DESKTOP_QUERY = "(min-width: 1024px)";

/**
 * Pin the document behind the mobile overlay and restore its exact position.
 * Fixing the body also covers iOS Safari, where overflow alone does not
 * reliably prevent background scrolling.
 */
function lockBodyScroll(): () => void {
  const { body } = document;
  const scrollY = window.scrollY;
  const previous = {
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    width: body.style.width,
    overflow: body.style.overflow,
  };

  body.style.position = "fixed";
  body.style.top = `-${scrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  body.style.overflow = "hidden";

  return () => {
    Object.assign(body.style, previous);
    window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
  };
}

/** Keep the page behind the modal menu out of both the tab order and a11y tree. */
function isolatePageBehind(menu: HTMLElement): () => void {
  const siblings = Array.from(document.body.children).filter(
    (element) => element !== menu && element.tagName !== "SCRIPT",
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
    const isDonate = stripLocale(item.href).split("#")[0] === "/donate";
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
  const panelId = `mobile-nav-panel-${item.href.replace(/[^a-z0-9]+/gi, "-")}`;

  if (!item.children || item.children.length === 0) {
    const isDonate = stripLocale(item.href).split("#")[0] === "/donate";
    if (isDonate) {
      return (
        <li className="pt-4 short:pt-2">
          <Link
            href={item.href}
            onClick={onNavigate}
            className={cn(
              buttonVariants({ size: "lg" }),
              "min-h-[52px] w-full short:min-h-[48px]",
            )}
          >
            {item.label}
          </Link>
        </li>
      );
    }
    return (
      <li className="border-b border-border">
        <Link
          href={item.href}
          onClick={onNavigate}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex min-h-[56px] items-center py-2 text-lg font-medium short:min-h-[48px] short:py-1",
            active ? "text-primary" : "text-foreground",
          )}
        >
          {item.label}
        </Link>
      </li>
    );
  }

  return (
    <li className="border-b border-border">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={panelId}
        className={cn(
          "flex min-h-[56px] w-full items-center justify-between gap-4 py-2 text-left text-lg font-medium short:min-h-[48px] short:py-1",
          active ? "text-primary" : "text-foreground",
        )}
      >
        <span className="min-w-0">{item.label}</span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 transition-transform",
            expanded && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>
      {expanded && (
        <ul id={panelId} className="flex flex-col pb-2 pl-4">
          {item.children.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                onClick={onNavigate}
                aria-current={isActive(pathname, child.href) ? "page" : undefined}
                className={cn(
                  "flex min-h-[48px] items-center py-2 text-base hover:text-primary short:min-h-[44px] short:py-1",
                  isActive(pathname, child.href)
                    ? "text-primary"
                    : "text-muted-foreground",
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

export function Header({ locale, dictionary }: { locale: Locale; dictionary: I18nDictionary }) {
  const pathname = usePathname();
  // Tie the open state to the current route so link navigation and browser
  // history cannot leave a hidden, scroll-locking menu mounted.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeMenu = useCallback(() => setOpenedOn(null), []);

  useEffect(() => {
    const menu = menuRef.current;
    if (!open || !menu) return;

    const trigger = triggerRef.current;
    const releaseScroll = lockBodyScroll();
    const releasePage = isolatePageBehind(menu);

    menu.querySelector<HTMLElement>("[data-menu-autofocus]")?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenedOn(null);
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
          if (document.activeElement === first || !menu.contains(document.activeElement)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last || !menu.contains(document.activeElement)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    const desktop = window.matchMedia(DESKTOP_QUERY);
    const handleBreakpoint = () => {
      if (desktop.matches) setOpenedOn(null);
    };
    desktop.addEventListener("change", handleBreakpoint);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      desktop.removeEventListener("change", handleBreakpoint);
      releasePage();
      releaseScroll();
      trigger?.focus({ preventScroll: true });
    };
  }, [open]);

  const n = dictionary.navigation;
  const localize = (href: string) => localePath(href, locale);
  const navItems: NavEntry[] = [
    { label: n.about, href: localize("/about-us"), children: [
      { label: n.ourStory, href: localize("/about-us") },
      { label: n.team, href: localize("/about-us/team") },
      { label: n.governance, href: localize("/about-us#governance") },
      { label: n.reportsAccountability, href: localize("/reports-and-accountability") },
      { label: n.contact, href: localize("/contact") },
    ] },
    { label: n.programmes, href: localize("/our-work"), children: [
      { label: "Vantage Care", href: localize("/programmes/health") },
      { label: "KikumiKyo Academy", href: localize("/programmes/education") },
      { label: n.humanitarian, href: localize("/programmes/humanitarian") },
      { label: n.wash, href: localize("/programmes/water") },
    ] },
    { label: n.impact, href: localize("/impact"), children: [
      { label: n.projects, href: localize("/projects") },
      { label: n.whereWeWork, href: localize("/impact#where-we-work") },
      { label: n.impactResults, href: localize("/impact") },
      { label: n.reports, href: localize("/reports-and-accountability") },
    ] },
    { label: n.stories, href: localize("/stories") },
    { label: n.getInvolved, href: localize("/get-involved"), children: [
      { label: n.donate, href: localize("/donate") },
      { label: n.volunteer, href: localize("/get-involved#volunteer") },
      { label: n.partner, href: localize("/get-involved#partner") },
      { label: n.sponsor, href: localize("/get-involved#sponsor") },
      { label: n.csr, href: localize("/get-involved#csr") },
    ] },
    { label: n.donate, href: localize("/donate") },
  ];
  const donateItem = navItems.at(-1);
  const navWithoutDonate = navItems.slice(0, -1);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-white/95 backdrop-blur">
        <div
          className="h-1 w-full bg-gradient-to-r from-primary via-deep-teal to-primary"
          aria-hidden="true"
        />
        <Container>
          <div className="flex h-20 items-center justify-between">
            <Logo
              href={localize("/")}
              variant="horizontal"
              height={56}
              alt={site.name}
            />

            <nav className="hidden items-center gap-3 lg:flex xl:gap-5" aria-label={n.main}>
              <ul className="flex items-center gap-3 xl:gap-5">
                {navWithoutDonate.map((item) => (
                  <DesktopNavItem key={item.href} item={item} pathname={pathname} />
                ))}
              </ul>
              {donateItem && (
                <Button href={donateItem.href} size="sm" className="min-h-[44px]">
                  {donateItem.label}
                </Button>
              )}
              <LanguageSelector
                id="language-desktop"
                locale={locale}
                label={dictionary.language.change}
                changingLabel={dictionary.language.changing}
              />
            </nav>

            <button
              ref={triggerRef}
              type="button"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center lg:hidden"
              onClick={() => setOpenedOn(pathname)}
              aria-label={n.openMenu}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </Container>
      </header>

      {/* Keep the fixed overlay outside the backdrop-filtered header. A fixed
          descendant of that header uses its 84px box as the containing block,
          which caused the menu and evidence content to paint over each other. */}
      {open && (
        <div
          ref={menuRef}
          id="mobile-menu"
          className="mobile-nav-overlay fixed inset-x-0 top-0 z-[1050] flex w-full flex-col overscroll-none bg-white lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={n.mobile}
        >
          <div className="shrink-0 border-b border-border">
            <Container>
              <div className="flex h-20 items-center justify-between gap-4 short:h-14">
                <Link
                  href={localize("/")}
                  onClick={closeMenu}
                  aria-label={site.name}
                  className="inline-flex shrink-0 items-center"
                >
                  <Logo variant="horizontal" height={44} alt={site.name} />
                </Link>
                <button
                  type="button"
                  data-menu-autofocus
                  data-mobile-menu-close
                  onClick={closeMenu}
                  aria-label={n.closeMenu}
                  className="-mr-2 inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-md"
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </Container>
          </div>

          <div
            id="mobile-menu-scroll"
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
          >
            <Container>
              <nav className="pb-8 pt-2 short:pb-4 short:pt-0" aria-label={n.mobile}>
                <ul className="flex flex-col">
                  {navItems.map((item) => (
                    <MobileNavItem
                      key={item.href}
                      item={item}
                      pathname={pathname}
                      onNavigate={closeMenu}
                    />
                  ))}
                </ul>
                <div className="mt-4 border-t border-border pt-4">
                  <LanguageSelector
                    id="language-mobile"
                    locale={locale}
                    label={dictionary.language.change}
                    changingLabel={dictionary.language.changing}
                    className="mobile w-full justify-start"
                  />
                </div>
              </nav>
            </Container>
          </div>
        </div>
      )}
    </>
  );
}

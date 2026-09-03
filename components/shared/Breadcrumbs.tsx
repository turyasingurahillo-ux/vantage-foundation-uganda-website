import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import { getPageContent } from "@/lib/i18n/content/pages";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  /**
   * Ellipsise the current-page crumb when it cannot fit. Defaults to true:
   * the last crumb is the variable-length one (a member name, project or
   * story title) and, left unconstrained, it overflows the viewport on
   * narrow screens. Pass `false` only where the final label is known-short
   * and must always render in full.
   */
  truncateCurrent?: boolean;
  locale?: Locale;
}

export function Breadcrumbs({
  items,
  className,
  truncateCurrent = true,
  locale = "en",
}: BreadcrumbsProps) {
  const c = getPageContent(locale).common;

  return (
    <nav
      className={cn(
        "min-w-0 text-sm text-muted-foreground",
        className,
      )}
      aria-label={c.breadcrumb}
    >
      <ol className="flex min-w-0 items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              key={`${item.label}-${index}`}
              className={cn(
                "flex items-center gap-2",
                isLast && truncateCurrent ? "min-w-0 flex-1" : "shrink-0",
              )}
            >
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="rounded-sm hover:text-primary"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    isLast && "text-foreground",
                    isLast && truncateCurrent && "block truncate",
                  )}
                  aria-current={isLast ? "page" : undefined}
                  title={isLast && truncateCurrent ? item.label : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span aria-hidden="true" className="text-muted-foreground/60">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

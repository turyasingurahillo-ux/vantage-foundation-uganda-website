"use client";

import { useId, useState } from "react";
import { Globe2 } from "lucide-react";
import {
  localeNames,
  localePath,
  locales,
  type Locale,
} from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type LanguageSelectorProps = {
  locale: Locale;
  label: string;
  changingLabel: string;
  className?: string;
  /**
   * Optional stable id for the select. When omitted a React useId() is used.
   * Provide a deterministic id for testable/mobile controls such as
   * `#language-mobile`.
   */
  id?: string;
};

/**
 * A native `<select>` rather than a custom popup menu: it gets keyboard
 * support, screen-reader announcement of the current value, and the platform
 * picker on mobile for free, none of which a hand-rolled listbox reliably
 * reproduces.
 *
 * Selecting a language does two things: it stores the preference (so a later
 * visit to `/` lands in the right language) and it navigates to the SAME page
 * in the new language — `/de/contact` from `/fr/contact`, never back to the
 * homepage.
 */
export function LanguageSelector({
  locale,
  label,
  changingLabel,
  className,
  id,
}: LanguageSelectorProps) {
  const [changing, setChanging] = useState(false);
  const generatedId = useId();
  const selectId = id ?? generatedId;

  async function changeLocale(nextLocale: Locale) {
    if (nextLocale === locale || changing) return;
    setChanging(true);
    try {
      const response = await fetch("/api/locale", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale: nextLocale }),
      });
      if (!response.ok) throw new Error(`Unable to save locale: ${response.status}`);
      const destination = `${localePath(window.location.pathname, nextLocale)}${window.location.search}${window.location.hash}`;
      // A full document load, not a client transition: the locale lives in the
      // root layout, so `<html lang>` and the whole shell have to be re-rendered.
      window.location.assign(destination);
    } catch {
      setChanging(false);
    }
  }

  return (
    <div
      className={cn(
        "inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-border bg-white px-2 text-foreground focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
        className,
      )}
    >
      <Globe2 className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <label htmlFor={selectId} className="sr-only">
        {label}
      </label>
      <select
        id={selectId}
        value={locale}
        disabled={changing}
        aria-busy={changing}
        aria-describedby={changing ? `${selectId}-status` : undefined}
        onChange={(event) => void changeLocale(event.target.value as Locale)}
        className="min-h-[42px] max-w-[8rem] cursor-pointer bg-transparent pe-1 text-sm font-semibold outline-none disabled:cursor-wait"
      >
        {locales.map((value) => (
          <option key={value} value={value} lang={value}>
            {localeNames[value]}
          </option>
        ))}
      </select>
      <span id={`${selectId}-status`} role="status" className="sr-only">
        {changing ? changingLabel : ""}
      </span>
    </div>
  );
}

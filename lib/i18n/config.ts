export const locales = ["en", "de", "fr"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
export const LOCALE_COOKIE_NAME = "vantage_locale";

export const localeNames: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return locales.includes(value as Locale);
}

export function localePath(path: string, locale: Locale): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const withoutLocale = normalized.replace(/^\/(?:en|de|fr)(?=\/|$)/, "") || "/";
  return locale === defaultLocale
    ? withoutLocale
    : `/${locale}${withoutLocale === "/" ? "" : withoutLocale}`;
}

export function localeFromPathname(pathname: string): Locale {
  const segment = pathname.split("/")[1];
  return isLocale(segment) ? segment : defaultLocale;
}

export function stripLocale(pathname: string): string {
  return pathname.replace(/^\/(?:en|de|fr)(?=\/|$)/, "") || "/";
}

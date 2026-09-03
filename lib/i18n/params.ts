import { notFound } from "next/navigation";
import { isLocale, type Locale } from "./config";

/**
 * The shape every route under `app/[locale]` receives.
 */
export type LocaleParams = Promise<{ locale: string }>;

/**
 * Resolves the locale from the route segment.
 *
 * The URL is the single source of truth for language. Deriving it from the
 * segment rather than from a cookie or request header is what keeps public
 * pages statically prerenderable — reading `headers()` or `cookies()` in a
 * layout opts the whole tree into request rendering — and it guarantees that
 * `/de/about-us` renders German even when a stale `fr` preference cookie is
 * present.
 *
 * `dynamicParams = false` on the locale layout already rejects unknown
 * prefixes at the routing level; the `notFound()` here keeps the invariant
 * explicit for any caller that reaches it another way.
 */
export async function resolveLocale(params: LocaleParams): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}

import { notFound } from "next/navigation";
import { isLocale, type Locale } from "./config";

/**
 * The shape every route under `app/[locale]` receives.
 *
 * Next.js passes `params` as a `Promise<unknown>` in async layouts and pages
 * (the exact runtime shape is `{ locale: string }`). This wide type lets the
 * generated route-group validator stay happy while `resolveLocale` narrows it.
 */
export type LocaleParams = Promise<unknown>;

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
  const resolved = (await params) as { locale?: string };
  const { locale } = resolved;
  if (!isLocale(locale)) notFound();
  return locale;
}

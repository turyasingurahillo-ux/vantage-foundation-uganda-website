import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/Button";
import { site } from "@/content/site";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { defaultLocale, localePath } from "@/lib/i18n/config";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

// `not-found.tsx` renders outside the matched route, so it does not receive
// the `[locale]` param. English is the correct fallback here: an unmatched
// URL has no reliable locale, and the middleware only rewrites unprefixed
// paths into the English tree.
export default async function NotFound() {
  const locale = defaultLocale;
  const dictionary = await getDictionary(locale);
  const copy = dictionary.errors;

  return (
    <section className="py-24 md:py-32">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            404
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {copy.notFoundTitle}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            {copy.notFoundDescription}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href={localePath("/", locale)} size="lg">
              {copy.returnHome}
            </Button>
            <Button
              href={localePath("/contact", locale)}
              variant="outline"
              size="lg"
            >
              {copy.contactUs}
            </Button>
          </div>
          <nav
            className="mt-10 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground"
            aria-label={copy.popularPages}
          >
            {site.nav
              .filter((item) => item.href !== "/")
              .map((item) => (
                <Link
                  key={item.href}
                  href={localePath(item.href, locale)}
                  className="hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
          </nav>
        </div>
      </Container>
    </section>
  );
}

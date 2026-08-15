import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/Button";
import { site } from "@/content/site";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="py-24 md:py-32">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            404
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Page not found
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            The page you are looking for may have moved, been renamed, or is no
            longer available.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/" size="lg">
              Return Home
            </Button>
            <Button href="/contact" variant="outline" size="lg">
              Contact Us
            </Button>
          </div>
          <nav
            className="mt-10 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground"
            aria-label="Popular pages"
          >
            {site.nav
              .filter((item) => item.href !== "/")
              .map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-primary">
                  {item.label}
                </Link>
              ))}
          </nav>
        </div>
      </Container>
    </section>
  );
}

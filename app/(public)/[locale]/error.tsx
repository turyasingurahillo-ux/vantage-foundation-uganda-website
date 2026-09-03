"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/Button";
import { localeFromPathname, localePath } from "@/lib/i18n/config";
import { errorCopy } from "@/lib/i18n/error-copy";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // The error boundary sits above the route params, so the locale is read
  // back off the URL. Unprefixed paths are English by definition.
  const locale = localeFromPathname(usePathname() ?? "/");
  const copy = errorCopy[locale];

  useEffect(() => {
    // Log the error to an error reporting service (console for now).
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <section className="py-24 md:py-32">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            {copy.eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            {copy.description}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button onClick={reset} size="lg">
              {copy.tryAgain}
            </Button>
            <Button
              href={localePath("/", locale)}
              variant="outline"
              size="lg"
            >
              {copy.returnHome}
            </Button>
          </div>
          {error.digest && (
            <p className="mt-8 text-xs text-muted-foreground">
              {copy.errorId}: {error.digest}
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}

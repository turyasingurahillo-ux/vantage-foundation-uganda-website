"use client";

import { useEffect } from "react";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service (console for now).
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <section className="py-24 md:py-32">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Something went wrong
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            An error occurred
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            We&rsquo;re sorry &mdash; something went wrong while loading this
            page. Please try again, or contact us if the problem persists.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button onClick={reset} size="lg">
              Try again
            </Button>
            <Button href="/" variant="outline" size="lg">
              Return Home
            </Button>
          </div>
          {error.digest && (
            <p className="mt-8 text-xs text-muted-foreground">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}

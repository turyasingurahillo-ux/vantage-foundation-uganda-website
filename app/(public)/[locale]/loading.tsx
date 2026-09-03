import { Container } from "@/components/shared/Container";

export default function Loading() {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-3xl">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="mt-4 h-4 w-full animate-pulse rounded-lg bg-muted" />
          <div className="mt-2 h-4 w-3/4 animate-pulse rounded-lg bg-muted" />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-border p-6">
                <div className="h-32 w-full animate-pulse rounded-lg bg-muted" />
                <div className="mt-4 h-5 w-3/4 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

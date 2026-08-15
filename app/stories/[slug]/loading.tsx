import { Container } from "@/components/shared/Container";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";

export default function StoryLoading() {
  return (
    <>
      <section className="bg-primary py-16 text-white md:py-24">
        <Container>
          <div className="max-w-3xl">
            <div className="h-5 w-20 animate-pulse rounded-full bg-white/20" />
            <div className="mt-4 h-10 w-full animate-pulse rounded-lg bg-white/20" />
            <div className="mt-4 h-10 w-2/3 animate-pulse rounded-lg bg-white/20" />
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container className="max-w-3xl">
          <Breadcrumbs
            className="mb-8"
            items={[
              { label: "Home", href: "/" },
              { label: "Stories", href: "/stories" },
              { label: "…" },
            ]}
          />
          <div className="aspect-[16/10] w-full animate-pulse rounded-2xl bg-muted" />
          <div className="mt-8 space-y-4">
            <div className="h-5 w-full animate-pulse rounded bg-muted" />
            <div className="h-5 w-full animate-pulse rounded bg-muted" />
            <div className="h-5 w-5/6 animate-pulse rounded bg-muted" />
            <div className="h-5 w-full animate-pulse rounded bg-muted" />
            <div className="h-5 w-4/5 animate-pulse rounded bg-muted" />
          </div>
        </Container>
      </section>
    </>
  );
}

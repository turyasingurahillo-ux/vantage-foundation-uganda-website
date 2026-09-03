"use client";

import { useParams } from "next/navigation";
import { Container } from "@/components/shared/Container";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { getPageContent } from "@/lib/i18n/content/pages";
import { localePath, type Locale } from "@/lib/i18n/config";

export default function ProjectLoading() {
  const { locale } = useParams() as { locale: Locale };
  const p = getPageContent(locale);

  return (
    <>
      <section className="bg-primary py-16 md:py-24">
        <Container>
          <div className="max-w-3xl">
            <div className="flex gap-2">
              <div className="h-6 w-24 animate-pulse rounded-full bg-white/20" />
              <div className="h-6 w-20 animate-pulse rounded-full bg-white/20" />
            </div>
            <div className="mt-4 h-10 w-full animate-pulse rounded-lg bg-white/20" />
            <div className="mt-4 h-10 w-3/4 animate-pulse rounded-lg bg-white/20" />
            <div className="mt-4 h-6 w-full animate-pulse rounded bg-white/10" />
            <div className="mt-2 h-6 w-5/6 animate-pulse rounded bg-white/10" />
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <Breadcrumbs
            className="mb-8"
            items={[
              { label: p.common.home, href: localePath("/", locale) },
              { label: p.projects.title, href: localePath("/projects", locale) },
              { label: p.ui.loading.ellipsis },
            ]}
          />
          <div className="aspect-[16/9] w-full animate-pulse rounded-2xl bg-muted" />
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              <div className="h-6 w-full animate-pulse rounded bg-muted" />
              <div className="h-6 w-full animate-pulse rounded bg-muted" />
              <div className="h-6 w-5/6 animate-pulse rounded bg-muted" />
              <div className="h-6 w-full animate-pulse rounded bg-muted" />
              <div className="h-6 w-4/5 animate-pulse rounded bg-muted" />
            </div>
            <div className="rounded-2xl border border-border bg-surface p-6">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="mt-4 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-4 w-4 shrink-0 animate-pulse rounded bg-muted" />
                    <div className="flex-1">
                      <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                      <div className="mt-1 h-3 w-32 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

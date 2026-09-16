import type { Metadata } from "next";
import Link from "next/link";
import { reachDistricts } from "@/content/reach";
import { getPublishedProjects } from "@/content/projects";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { LazyUgandaReachMap } from "@/components/sections/LazyUgandaReachMap";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createPublicMetadata } from "@/lib/metadata";
import { getPageContent } from "@/lib/i18n/content/pages";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/params";
import { localePath } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: LocaleParams;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const w = getPageContent(locale).whereWeWork;
  return createPublicMetadata({
    title: w.title,
    description: w.description,
    path: "/where-we-work",
    locale,
    contentLocalized: false,
  });
}

export const revalidate = 3600;

export default function WhereWeWorkPage({ params }: { params: LocaleParams }) {
  return <WhereWeWorkContent params={params} />;
}

async function WhereWeWorkContent({ params }: { params: LocaleParams }) {
  const locale = await resolveLocale(params);
  const p = getPageContent(locale);
  const w = p.whereWeWork;
  const projects = getPublishedProjects();

  return (
    <>
      <section className="bg-primary py-16 text-white md:py-24">
        <Container>
          <SectionHeader
            level="h1"
            title={w.title}
            description={w.description}
            light
          />
        </Container>
      </section>

      {/* Honest framing before the map — presence is not a national rollout */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="grid gap-6 md:grid-cols-3">
            {w.principles.map((item) => (
              <Card key={item.title} className="p-6">
                <h2 className="text-base font-semibold text-foreground">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <div data-testid="uganda-reach-map-section">
        <LazyUgandaReachMap locale={locale} />
      </div>

      {/* District list — what kind of work, linked to real projects only */}
      <section className="bg-surface py-16 md:py-24">
        <Container>
          <SectionHeader
            align="left"
            title={w.districtsTitle}
            description={w.districtsDescription}
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {reachDistricts.map((d) => {
              const linked = (d.projectSlugs ?? [])
                .map((slug) => projects.find((pr) => pr.slug === slug))
                .filter(Boolean);
              return (
                <Card key={d.district} className="p-5">
                  <h3 className="text-base font-semibold text-foreground">
                    {d.district}
                  </h3>
                  {d.description && (
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {d.description}
                    </p>
                  )}
                  {linked.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {linked.map((pr) => (
                        <li key={pr!.slug}>
                          <Link
                            href={localePath(`/projects/${pr!.slug}`, locale)}
                            className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
                          >
                            {pr!.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              );
            })}
          </div>
          <p className="mt-8 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {w.caveat}
          </p>
        </Container>
      </section>

      <section className="py-16 md:py-20">
        <Container>
          <div className="mx-auto flex max-w-2xl flex-wrap justify-center gap-3">
            <Button href={localePath("/our-work", locale)} variant="outline">
              {w.ourWorkCta}
            </Button>
            <Button href={localePath("/partner", locale)}>
              {w.partnerCta}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}

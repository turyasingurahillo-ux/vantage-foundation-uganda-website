import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedProgrammes, getProgrammeProjects } from "@/content/programmes";
import { vantagePoint } from "@/content/vantage-point";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AreaIcon } from "@/components/shared/AreaIcon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { JsonLd, buildBreadcrumbJsonLd } from "@/components/shared/JsonLd";
import { site } from "@/content/site";
import { createPublicMetadata } from "@/lib/metadata";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getPageContent } from "@/lib/i18n/content/pages";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/params";
import { localePath } from "@/lib/i18n/config";
import { programmeTokenForProgramme } from "@/lib/design-tokens";
import type { ProgrammeStatus } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: LocaleParams;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const content = getPageContent(locale).ourWork;
  return createPublicMetadata({
    title: content.title,
    description: content.description,
    path: "/our-work",
    locale,
    contentLocalized: false,
  });
}

export default async function OurWorkPage({
  params,
}: {
  params: LocaleParams;
}) {
  const locale = await resolveLocale(params);
  const dictionary = await getDictionary(locale);
  const p = getPageContent(locale);
  const statusMap: Record<ProgrammeStatus, string> = {
    active: p.programme.statusActive,
    developing: p.programme.statusDeveloping,
    pilot: p.programme.statusPilot,
    planned: p.programme.statusPlanned,
  };

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd(
          [
            { label: dictionary.common.home, url: localePath("/", locale) },
            { label: p.ourWork.title, url: localePath("/our-work", locale) },
          ],
          site.url,
        )}
      />
      <section className="bg-primary py-16 text-white md:py-24">
        <Container>
          <SectionHeader
            level="h1"
            title={p.ourWork.title}
            description={p.ourWork.description}
            light
          />
        </Container>
      </section>

      {/* Six programme portfolios */}
      <section className="py-16 md:py-24">
        <Container>
          <p className="mb-12 rounded-lg border border-primary/20 bg-primary-light p-4 text-sm text-foreground">
            {dictionary.common.originalLanguageNotice}
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {getPublishedProgrammes().map((programme) => {
              const prog = programmeTokenForProgramme(programme.slug);
              const projectCount = getProgrammeProjects(programme.slug).length;
              return (
                <Link
                  key={programme.slug}
                  href={localePath(`/programmes/${programme.slug}`, locale)}
                  className="group block"
                >
                  <Card className="flex h-full flex-col p-6 transition-shadow group-hover:shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: `${prog.hex}1a`,
                          color: prog.hex,
                        }}
                      >
                        <AreaIcon id={programme.icon ?? programme.slug} className="h-5 w-5" />
                      </div>
                      <Badge variant="outline">
                        {statusMap[programme.status]}
                      </Badge>
                    </div>
                    <h2 className="mt-4 text-xl font-bold leading-snug group-hover:text-primary">
                      {programme.title}
                    </h2>
                    {programme.programmeName && (
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {programme.programmeName}
                      </p>
                    )}
                    <p className="mt-3 text-sm font-medium leading-snug">
                      {programme.outcomeHeadline}
                    </p>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {programme.summary}
                    </p>
                    <p className="mt-4 text-xs text-muted-foreground">
                      {projectCount > 0
                        ? p.ourWork.projectCount.replace("{count}", String(projectCount))
                        : p.ourWork.developingNote}
                    </p>
                    <span className="mt-3 inline-flex text-sm font-semibold text-primary group-hover:underline">
                      {dictionary.common.learnMore}
                      <span aria-hidden="true">&nbsp;&rarr;</span>
                    </span>
                  </Card>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Vantage Point — cross-programme platform, NOT a seventh portfolio */}
      <section className="bg-surface py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-white p-8 shadow-sm md:p-12">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {p.vantagePoint.platformEyebrow}
              </p>
              <Badge variant="outline">
                {statusMap[vantagePoint.status]}
              </Badge>
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              {vantagePoint.title}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {vantagePoint.summary}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {vantagePoint.relationship}
            </p>
            <div className="mt-8">
              <Button
                href={localePath(`/programmes/${vantagePoint.slug}`, locale)}
                variant="outline"
              >
                {p.vantagePoint.learnMore}
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { getPublishedImpactStats, outputs, outcomes, longTermGoals, regions, sdgs } from "@/content/impact";
import { getPublishedProjects } from "@/content/projects";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { StatCard } from "@/components/shared/StatCard";
import { ProjectCard } from "@/components/shared/ProjectCard";
import { ImpactMetricList, type ImpactTier } from "@/components/shared/ImpactMetric";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createPublicMetadata } from "@/lib/metadata";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/params";
import { getPageContent } from "@/lib/i18n/content/pages";
import { localePath } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: LocaleParams;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const content = getPageContent(locale).impact;
  return createPublicMetadata({
    title: content.title,
    description: content.description,
    path: "/impact",
    locale,
    contentLocalized: false,
  });
}

export default async function ImpactPage({
  params,
}: {
  params: LocaleParams;
}) {
  const locale = await resolveLocale(params);
  const dictionary = await getDictionary(locale);
  const p = getPageContent(locale);
  const i = p.impact;

  const tieredItems: { tier: ImpactTier; text: string }[] = [
    ...outputs.map((text) => ({ tier: "output" as const, text })),
    ...outcomes.map((text) => ({ tier: "outcome" as const, text })),
    ...longTermGoals.map((text) => ({ tier: "long-term" as const, text })),
  ];

  return (
    <>
      <section className="bg-primary py-16 text-white md:py-24">
        <Container>
          <SectionHeader
            level="h1"
            title={i.title}
            description={i.description}
            light
          />
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <p className="mb-12 rounded-lg border border-primary/20 bg-primary-light p-4 text-sm text-foreground">
            {dictionary.common.originalLanguageNotice}
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {getPublishedImpactStats().map((stat) => (
              <StatCard key={stat.label} {...stat} locale={locale} />
            ))}
          </div>
          <p className="mt-6 max-w-3xl text-sm text-muted-foreground">
            {i.disclaimer}
          </p>

          <div className="mt-16">
            <ImpactMetricList
              items={tieredItems}
              title={i.fromOutputs}
              description={i.outputsToLongTerm}
              locale={locale}
            />
          </div>
        </Container>
      </section>

      <section className="bg-surface py-16 md:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold">{i.geographicReach}</h2>
              <p className="mt-4 text-muted-foreground">
                {i.geographicDescription}
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                {regions.map((region) => (
                  <span
                    key={region}
                    className="rounded-full border border-border bg-white px-3 py-1 text-sm font-medium"
                  >
                    {region}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold">{i.sdgsTitle}</h2>
              <p className="mt-4 text-muted-foreground">
                {i.sdgDescription}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {sdgs.map((goal) => (
                  <span
                    key={goal}
                    className="inline-flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-lg font-bold text-white"
                    title={`${i.sdgsTitle} ${goal}`}
                  >
                    {goal}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <SectionHeader title={i.monitoring} />
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-primary">{i.quantitative}</h3>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-primary">{i.qualitative}</h3>
            </Card>
          </div>
        </Container>
      </section>

      <section className="bg-surface py-16 md:py-24">
        <Container>
          <SectionHeader title={i.projectsBehind} />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {getPublishedProjects().slice(0, 3).map((project) => (
              <ProjectCard key={project.slug} project={project} locale={locale} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button href={localePath("/projects", locale)}>{i.viewAllProjects}</Button>
          </div>
        </Container>
      </section>
    </>
  );
}

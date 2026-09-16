import type { Metadata } from "next";
import Link from "next/link";
import {
  getPublishedImpactStats,
  outputs,
  outcomes,
  longTermGoals,
  regions,
  sdgs,
} from "@/content/impact";
import { getPublishedProjects } from "@/content/projects";
import { getAllProgrammeLearning } from "@/content/programmes";
import { getEvidenceItems } from "@/content/evidence";
import { theoryOfChange } from "@/content/theory-of-change";
import { vantagePoint } from "@/content/vantage-point";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { StatCard } from "@/components/shared/StatCard";
import { ProjectCard } from "@/components/shared/ProjectCard";
import { EvidenceBadge } from "@/components/shared/EvidenceBadge";
import {
  ImpactMetricList,
  type ImpactTier,
} from "@/components/shared/ImpactMetric";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { createPublicMetadata } from "@/lib/metadata";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/params";
import { getPageContent } from "@/lib/i18n/content/pages";
import { localePath } from "@/lib/i18n/config";
import type { EvidenceStatus } from "@/types";

const EVIDENCE_STATUSES: EvidenceStatus[] = [
  "verified",
  "programme-team-figure",
  "estimated-catchment",
  "pilot",
  "planned",
  "external-evidence",
];

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

export const revalidate = 3600;

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

  const programmeLearning = getAllProgrammeLearning();
  const evidenceItems = getEvidenceItems();

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

      {/* How Vantage thinks about impact — the measurement framework */}
      <section className="py-16 md:py-24">
        <Container>
          <p className="mb-12 rounded-lg border border-primary/20 bg-primary-light p-4 text-sm text-foreground">
            {dictionary.common.originalLanguageNotice}
          </p>
          <SectionHeader
            align="left"
            title={i.frameworkTitle}
            description={i.frameworkDescription}
          />
          <dl className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {theoryOfChange.measurement.map((concept) => (
              <Card key={concept.kind} className="p-5">
                <dt className="text-sm font-bold text-primary">
                  {concept.title}
                </dt>
                <dd className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {concept.body}
                </dd>
              </Card>
            ))}
          </dl>
        </Container>
      </section>

      {/* Results — approved metrics with evidence status */}
      <section className="bg-surface py-16 md:py-24">
        <Container>
          <h2 className="sr-only">{i.title}</h2>
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

      {/* How to read our evidence — the claim-status taxonomy explainer */}
      <section className="py-16 md:py-24">
        <Container>
          <SectionHeader
            align="left"
            title={i.readEvidenceTitle}
            description={i.readEvidenceDescription}
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {EVIDENCE_STATUSES.map((status) => (
              <Card key={status} className="p-6">
                <EvidenceBadge status={status} locale={locale} />
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {i.evidenceDefinitions[status]}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Theory of Change feature */}
      <section className="bg-surface py-16 md:py-24">
        <Container>
          <Card className="flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-foreground">
                {i.tocFeatureTitle}
              </h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {i.tocFeatureDescription}
              </p>
            </div>
            <Button
              href={localePath("/theory-of-change", locale)}
              className="shrink-0"
            >
              {i.tocFeatureCta}
            </Button>
          </Card>
        </Container>
      </section>

      {/* Programme learning — attributed, never generic */}
      {programmeLearning.length > 0 && (
        <section className="py-16 md:py-24">
          <Container>
            <SectionHeader
              align="left"
              title={i.learningTitle}
              description={i.learningDescription}
            />
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {programmeLearning.map(({ programme, learning }) => (
                <Card key={learning.title} className="p-6">
                  <Link
                    href={localePath(
                      `/programmes/${programme.slug}`,
                      locale,
                    )}
                    className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline"
                  >
                    {i.learningFrom} {programme.title}
                  </Link>
                  <h3 className="mt-2 text-base font-semibold text-foreground">
                    {learning.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {learning.body}
                  </p>
                  {learning.href && (
                    <Link
                      href={localePath(learning.href, locale)}
                      className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-primary underline-offset-4 hover:underline"
                    >
                      {p.common.viewProject}
                    </Link>
                  )}
                </Card>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Evidence library — honest empty state until approved publications exist */}
      <section className="bg-surface py-16 md:py-24">
        <Container>
          <SectionHeader
            align="left"
            title={i.evidenceLibraryTitle}
            description={i.evidenceLibraryDescription}
          />
          {evidenceItems.length === 0 ? (
            <p className="mt-8 max-w-3xl rounded-lg border border-dashed border-border bg-white p-6 text-sm leading-relaxed text-muted-foreground">
              {i.evidenceLibraryEmpty}
            </p>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {evidenceItems.map((item) => (
                <Card key={item.id} className="flex flex-col p-6">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.type}</Badge>
                    {item.evidenceStatus && (
                      <EvidenceBadge
                        status={item.evidenceStatus}
                        locale={locale}
                      />
                    )}
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {item.summary}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {[item.sourceLabel, item.date, item.reviewedAt]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* Where we work — geographic reach + SDGs + the reach map */}
      <section className="py-16 md:py-24">
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

      <div
        id="where-we-work"
        className="scroll-mt-24"
        data-testid="uganda-reach-map-section"
      >
        {/* Canonical geography now lives at /where-we-work; this anchor
            stays so historical deep links still land somewhere sensible. */}
        <section className="bg-surface py-16 md:py-20">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {p.whereWeWork.title}
              </h2>
              <p className="mt-4 text-muted-foreground">
                {p.whereWeWork.districtsDescription}
              </p>
              <Button
                href={localePath("/where-we-work", locale)}
                className="mt-6"
              >
                {p.whereWeWork.mapCta} &rarr;
              </Button>
            </div>
          </Container>
        </section>
      </div>

      {/* Monitoring approach */}
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

      {/* Reports & accountability + policies */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {i.reportsTitle}
              </h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {i.reportsDescription}
              </p>
              <div className="mt-6">
                <Button
                  href={localePath("/reports-and-accountability", locale)}
                  variant="outline"
                >
                  {i.reportsCta}
                </Button>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {i.policiesTitle}
              </h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {i.policiesDescription}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  href={localePath("/safeguarding", locale)}
                  variant="outline"
                  size="sm"
                >
                  {p.legal.safeguarding}
                </Button>
                <Button
                  href={localePath("/privacy", locale)}
                  variant="outline"
                  size="sm"
                >
                  {p.legal.privacy}
                </Button>
                <Button
                  href={localePath("/accessibility", locale)}
                  variant="outline"
                  size="sm"
                >
                  {p.legal.accessibility}
                </Button>
                <Button
                  href={localePath("/terms", locale)}
                  variant="outline"
                  size="sm"
                >
                  {p.legal.terms}
                </Button>
                <Button
                  href={localePath("/about-us#governance", locale)}
                  variant="outline"
                  size="sm"
                >
                  {p.reports.governance}
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Vantage Point — the cross-programme learning connection */}
      <section className="bg-surface py-16 md:py-24">
        <Container>
          <Card className="flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <EvidenceBadge status="planned" locale={locale} />
              <h2 className="mt-3 text-2xl font-bold text-foreground">
                {i.vantagePointTitle}
              </h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {i.vantagePointDescription}
              </p>
            </div>
            <Button
              href={localePath(`/programmes/${vantagePoint.slug}`, locale)}
              variant="outline"
              className="shrink-0"
            >
              {i.vantagePointCta}
            </Button>
          </Card>
        </Container>
      </section>

      {/* CTA — evidence scrutiny is invited */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="rounded-xl bg-primary p-8 text-center text-white md:p-12">
            <h2 className="text-2xl font-bold">{i.ctaTitle}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-white/90">
              {i.ctaDescription}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                href={localePath("/contact", locale)}
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                {p.reports.contactUs}
              </Button>
              <Button
                href={localePath("/partner", locale)}
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                {p.common.partnerWithUs}
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

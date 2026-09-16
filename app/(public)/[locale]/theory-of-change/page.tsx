import type { Metadata } from "next";
import { theoryOfChange } from "@/content/theory-of-change";
import { vantagePoint } from "@/content/vantage-point";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ToCFlow } from "@/components/impact/ToCFlow";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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
  const p = getPageContent(locale).toc;
  return createPublicMetadata({
    title: p.title,
    description: p.description,
    path: "/theory-of-change",
    locale,
    contentLocalized: false,
  });
}

export const revalidate = 3600;

export default async function TheoryOfChangePage({
  params,
}: {
  params: LocaleParams;
}) {
  const locale = await resolveLocale(params);
  const dictionary = await getDictionary(locale);
  const p = getPageContent(locale);
  const t = p.toc;
  const toc = theoryOfChange;

  return (
    <>
      <section className="bg-primary py-16 text-white md:py-24">
        <Container>
          <SectionHeader
            level="h1"
            title={t.title}
            description={t.description}
            light
          />
        </Container>
      </section>

      {/* What we believe leads to change — positioning statement */}
      <section className="py-16 md:py-24">
        <Container>
          <p className="mb-12 rounded-lg border border-primary/20 bg-primary-light p-4 text-sm text-foreground">
            {dictionary.common.originalLanguageNotice}
          </p>
          <SectionHeader align="left" title={t.statementHeading} />
          <div className="mt-8 max-w-3xl space-y-5 text-lg leading-relaxed text-foreground">
            {toc.statement.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        </Container>
      </section>

      {/* The four-layer causal flow */}
      <section className="bg-surface py-16 md:py-24">
        <Container>
          <ToCFlow layers={toc.layers} />
        </Container>
      </section>

      {/* Assumptions — exposed, not disguised as evidence */}
      <section className="py-16 md:py-24">
        <Container>
          <SectionHeader
            align="left"
            title={t.assumptionsTitle}
            description={t.assumptionsDescription}
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {toc.assumptions.map((assumption) => (
              <Card key={assumption.title} className="p-6">
                <h3 className="text-base font-semibold text-foreground">
                  {assumption.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {assumption.body}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* External actors — partner vs ecosystem distinction */}
      <section className="bg-surface py-16 md:py-24">
        <Container>
          <SectionHeader
            align="left"
            title={t.actorsTitle}
            description={t.actorsDescription}
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {toc.externalActors.map((actor) => (
              <Card key={actor.name} className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold text-foreground">
                    {actor.name}
                  </h3>
                  <Badge
                    variant={actor.kind === "partner" ? "default" : "outline"}
                    className="shrink-0"
                  >
                    {actor.kind === "partner"
                      ? p.programme.partnersLabel
                      : p.programme.ecosystemLabel}
                  </Badge>
                </div>
                {actor.note && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {actor.note}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Measurement framework — outputs ≠ reach ≠ outcomes ≠ catchment ≠ targets */}
      <section className="py-16 md:py-24">
        <Container>
          <SectionHeader
            align="left"
            title={t.measurementTitle}
            description={t.measurementDescription}
          />
          <dl className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {toc.measurement.map((concept) => (
              <Card key={concept.kind} className="p-6">
                <dt className="text-base font-semibold text-primary">
                  {concept.title}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {concept.body}
                </dd>
                {concept.example && (
                  <dd className="mt-3 border-t border-border pt-3 text-xs italic leading-relaxed text-muted-foreground">
                    {concept.example}
                  </dd>
                )}
              </Card>
            ))}
          </dl>
        </Container>
      </section>

      {/* Learning loop — intended discipline, not a claimed evaluation system */}
      <section className="bg-surface py-16 md:py-24">
        <Container>
          <SectionHeader
            align="left"
            title={t.learningLoopTitle}
            description={t.learningLoopDescription}
          />
          <ol className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {toc.learningLoop.map((step, index) => (
              <li
                key={step.slice(0, 30)}
                className="border-t-2 border-primary/20 pt-5"
              >
                <span
                  className="text-xs font-semibold uppercase tracking-wider text-primary"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 text-sm leading-relaxed text-foreground">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Evidence limitations — legible uncertainty, not apology */}
      <section className="py-16 md:py-24">
        <Container>
          <Card className="border-l-4 border-l-accent p-8">
            <h2 className="text-xl font-bold text-foreground">
              {t.limitationsTitle}
            </h2>
            <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">
              {t.limitationsBody}
            </p>
          </Card>
        </Container>
      </section>

      {/* See it in practice */}
      <section className="bg-surface py-16 md:py-24">
        <Container>
          <SectionHeader align="left" title={t.inPracticeTitle} />
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={localePath("/our-work", locale)}>
              {t.viewProgrammes}
            </Button>
            <Button href={localePath("/impact", locale)} variant="outline">
              {t.viewImpact}
            </Button>
            <Button
              href={localePath(`/programmes/${vantagePoint.slug}`, locale)}
              variant="outline"
            >
              {t.viewVantagePoint}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}

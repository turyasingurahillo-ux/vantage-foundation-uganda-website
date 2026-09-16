import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllProgrammes,
  getProgrammeBySlug,
  getProgrammeProjects,
} from "@/content/programmes";
import { vantagePoint } from "@/content/vantage-point";
import { getPublishedStoriesWithDb } from "@/lib/stories-public";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { EvidenceBadge } from "@/components/shared/EvidenceBadge";
import { ImageOrPlaceholder } from "@/components/shared/ImageOrPlaceholder";
import { ProjectCard } from "@/components/shared/ProjectCard";
import { StoryCard } from "@/components/shared/StoryCard";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { programmeTokenForProgramme } from "@/lib/design-tokens";
import { getProgrammeAdditionalPhotos } from "@/lib/media-public";
import { createPublicMetadata } from "@/lib/metadata";
import { JsonLd, buildBreadcrumbJsonLd } from "@/components/shared/JsonLd";
import { site } from "@/content/site";
import { resolveLocale } from "@/lib/i18n/params";
import { localePath, type Locale } from "@/lib/i18n/config";
import { getPageContent } from "@/lib/i18n/content/pages";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { ProgrammeStatus } from "@/types";

export const revalidate = 3600;

export function generateStaticParams() {
  // Generate routes for all portfolios (including unpublished) plus the
  // Vantage Point platform route — a platform destination, not a seventh
  // portfolio. Unpublished portfolios return notFound() in production.
  return [
    ...getAllProgrammes().map((p) => ({ slug: p.slug })),
    { slug: vantagePoint.slug },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const resolved = await params;
  const locale = await resolveLocale(Promise.resolve({ locale: resolved.locale }));

  if (resolved.slug === vantagePoint.slug) {
    return createPublicMetadata({
      title: vantagePoint.title,
      description: vantagePoint.summary,
      path: `/programmes/${vantagePoint.slug}`,
      locale,
      contentLocalized: false,
    });
  }

  const programme = getProgrammeBySlug(resolved.slug);
  if (
    !programme ||
    (programme.published === false && process.env.NODE_ENV === "production")
  ) {
    return {
      title: getPageContent(locale).ui.programmeNotFound.title,
      robots: { index: false, follow: true },
    };
  }
  return createPublicMetadata({
    title: programme.title,
    description: programme.summary,
    path: `/programmes/${resolved.slug}`,
    locale,
    contentLocalized: false,
  });
}

function statusLabel(
  status: ProgrammeStatus,
  p: ReturnType<typeof getPageContent>,
): string {
  const map: Record<ProgrammeStatus, string> = {
    active: p.programme.statusActive,
    developing: p.programme.statusDeveloping,
    pilot: p.programme.statusPilot,
    planned: p.programme.statusPlanned,
  };
  return map[status];
}

export default async function ProgrammePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const resolved = await params;
  const locale = await resolveLocale(Promise.resolve({ locale: resolved.locale }));
  const p = getPageContent(locale);
  const d = await getDictionary(locale);

  if (resolved.slug === vantagePoint.slug) {
    return <VantagePointPage locale={locale} />;
  }

  const programme = getProgrammeBySlug(resolved.slug);
  if (!programme) notFound();
  // In production, unpublished portfolios are not accessible. In development,
  // they are previewable for content editing.
  if (programme.published === false && process.env.NODE_ENV === "production") {
    notFound();
  }

  const prog = programmeTokenForProgramme(programme.slug);
  const relatedProjects = getProgrammeProjects(programme.slug);
  const relatedStories = (await getPublishedStoriesWithDb()).filter((s) =>
    (s.relatedProjectSlugs ?? []).some((projectSlug) =>
      relatedProjects.some((pr) => pr.slug === projectSlug)
    )
  );
  const additionalPhotos = (
    await Promise.all(
      [programme.slug, ...(programme.legacySlugs ?? [])].map((id) =>
        getProgrammeAdditionalPhotos(id)
      )
    )
  ).flat();
  const partners = (programme.actors ?? []).filter((a) => a.kind === "partner");
  const ecosystem = (programme.actors ?? []).filter(
    (a) => a.kind === "ecosystem"
  );

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd(
          [
            { label: d.common.home, url: localePath("/", locale) },
            { label: p.ourWork.title, url: localePath("/our-work", locale) },
            { label: programme.title, url: localePath(`/programmes/${programme.slug}`, locale) },
          ],
          site.url,
        )}
      />

      {/* 01 — Programme hero */}
      <section className="py-16 text-white md:py-24" style={{ backgroundColor: prog.safeHex }}>
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-white/80">
                {p.programme.portfolioEyebrow}
              </p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
                {programme.title}
              </h1>
              {programme.programmeName && (
                <p className="mt-3 text-lg font-semibold text-white/90">
                  {programme.programmeName}
                </p>
              )}
              <p className="mt-4 text-xl font-medium leading-snug text-white/95">
                {programme.outcomeHeadline}
              </p>
              <p className="mt-4 max-w-2xl leading-relaxed text-white/85">
                {programme.summary}
              </p>
              <div className="mt-6">
                <Badge variant="outline" className="border-white/60 text-white">
                  {statusLabel(programme.status, p)}
                </Badge>
              </div>
            </div>
            {programme.image && (
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg">
                <ImageOrPlaceholder
                  src={programme.image}
                  alt={programme.imageAlt ?? programme.title}
                  fill
                  sizes="(max-width: 1023px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <Breadcrumbs
            className="mb-8"
            items={[
              { label: d.common.home, href: localePath("/", locale) },
              { label: p.ourWork.title, href: localePath("/our-work", locale) },
              { label: programme.title },
            ]}
            locale={locale}
          />

          <p className="mb-12 rounded-lg border border-primary/20 bg-primary-light p-4 text-sm text-foreground">
            {d.common.originalLanguageNotice}
          </p>

          {/* 02 — Why this matters */}
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold md:text-3xl">
              {programme.whyThisMatters.heading ?? p.programme.whyThisMatters}
            </h2>
            {programme.whyThisMatters.body.map((paragraph) => (
              <p
                key={paragraph.slice(0, 48)}
                className="mt-4 leading-relaxed text-muted-foreground"
              >
                {paragraph}
              </p>
            ))}
            {programme.whyThisMatters.evidence?.length ? (
              <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
                {programme.whyThisMatters.evidence.map((ref) => (
                  <li key={ref.label}>
                    {ref.href ? (
                      <Link href={ref.href} className="text-primary hover:underline">
                        {ref.label}
                      </Link>
                    ) : (
                      ref.label
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* 03 — Our approach */}
          <div className="mt-14 max-w-3xl">
            <h2 className="text-2xl font-bold md:text-3xl">
              {programme.approach.heading ?? p.programme.ourApproach}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {programme.approach.body}
            </p>
            {programme.approach.items?.length ? (
              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {programme.approach.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: prog.hex }}
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </Container>
      </section>

      {/* 04 — Projects */}
      {relatedProjects.length > 0 && (
        <section className="bg-surface py-16 md:py-24">
          <Container>
            <SectionHeader
              title={p.programme.projectsIn.replace("{programme}", programme.title)}
            />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProjects.map((project) => (
                <ProjectCard key={project.slug} project={project} locale={locale} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 05 — Results & evidence */}
      <section className="py-16 md:py-24">
        <Container>
          <SectionHeader title={p.programme.resultsTitle} />
          {programme.results?.length ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {programme.results.map((result) => (
                <Card key={result.label} className="flex flex-col p-6">
                  <p className="text-3xl font-bold tracking-tight">
                    {result.value}
                  </p>
                  <p className="mt-2 text-sm font-medium leading-snug">
                    {result.label}
                  </p>
                  <div className="mt-3">
                    <EvidenceBadge status={result.evidenceStatus} locale={locale} />
                  </div>
                  {result.methodology && (
                    <p className="mt-3 flex-1 text-xs leading-relaxed text-muted-foreground">
                      {result.methodology}
                    </p>
                  )}
                  {result.asOf && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {p.programme.asOf.replace("{date}", result.asOf)}
                    </p>
                  )}
                  {result.sourceHref && (
                    <Link
                      href={localePath(result.sourceHref, locale)}
                      className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline"
                    >
                      {p.common.viewProject}
                    </Link>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <p className="mt-8 max-w-2xl rounded-lg border border-dashed border-border p-6 text-sm leading-relaxed text-muted-foreground">
              {p.programme.resultsEmpty}
            </p>
          )}
          <p className="mt-8 text-sm">
            <Link
              href={localePath("/impact", locale)}
              className="inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline"
            >
              {p.programme.readEvidenceCta}
            </Link>
          </p>
        </Container>
      </section>

      {/* 06 — Learning (omitted when empty, never fabricated) */}
      {programme.learning?.length ? (
        <section className="bg-surface py-16 md:py-24">
          <Container>
            <SectionHeader title={p.programme.learningTitle} />
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {programme.learning.map((item) => (
                <div
                  key={item.title}
                  className="border-l-2 pl-5"
                  style={{ borderColor: prog.safeHex }}
                >
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                  {item.href && (
                    <Link
                      href={localePath(item.href, locale)}
                      className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline"
                    >
                      {d.common.learnMore}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* 07 — Partners & ecosystem */}
      {(partners.length > 0 || ecosystem.length > 0) && (
        <section className="py-16 md:py-24">
          <Container>
            <SectionHeader title={p.programme.partnersTitle} />
            <div className="mt-10 grid gap-10 lg:grid-cols-2">
              {partners.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {p.programme.partnersLabel}
                  </h3>
                  <ul className="mt-4 space-y-4">
                    {partners.map((actor) => (
                      <li key={actor.name}>
                        <p className="font-semibold">{actor.name}</p>
                        {actor.note && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {actor.note}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {ecosystem.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {p.programme.ecosystemLabel}
                  </h3>
                  <ul className="mt-4 space-y-4">
                    {ecosystem.map((actor) => (
                      <li key={actor.name}>
                        <p className="font-semibold">{actor.name}</p>
                        {actor.note && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {actor.note}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* 08 — Next priorities (forward-looking) */}
      {programme.nextPriorities?.length ? (
        <section className={partners.length || ecosystem.length ? "bg-surface py-16 md:py-24" : "py-16 md:py-24"}>
          <Container>
            <SectionHeader
              title={p.programme.nextPrioritiesTitle}
              description={p.programme.nextPrioritiesNote}
            />
            <ul className="mt-8 max-w-3xl space-y-3">
              {programme.nextPriorities.map((priority) => (
                <li key={priority} className="flex items-start gap-3">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: prog.hex }}
                    aria-hidden="true"
                  />
                  <span className="leading-relaxed">{priority}</span>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {programme.externalPlatformLink && (
        <section className="py-16 md:py-24">
          <Container>
            <Card className="mx-auto max-w-3xl p-8">
              <h2 className="text-lg font-semibold">
                {programme.externalPlatformLink.label}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {programme.externalPlatformLink.description}
              </p>
              <Button
                href={programme.externalPlatformLink.href}
                variant="outline"
                className="mt-4"
                size="sm"
              >
                {p.programme.visitPlatform}
              </Button>
            </Card>
          </Container>
        </section>
      )}

      {relatedStories.length > 0 && (
        <section className="py-16 md:py-24">
          <Container>
            <SectionHeader title={p.programme.storiesFrom} />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedStories.map((story) => (
                <StoryCard key={story.slug} story={story} locale={locale} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {additionalPhotos.length > 0 && (
        <section className="py-16 md:py-24">
          <Container>
            <SectionHeader
              title={p.programme.photosFrom.replace("{programme}", programme.title)}
            />
            <div className="mt-12">
              <GalleryGrid images={additionalPhotos} />
            </div>
          </Container>
        </section>
      )}

      {/* 09 — CTA */}
      <section className="bg-surface py-16">
        <Container>
          <div className="flex flex-col items-center justify-between gap-6 rounded-xl bg-primary p-8 text-white md:flex-row">
            <div>
              <h2 className="text-xl font-bold">{p.programme.getInvolved}</h2>
              <p className="mt-1 max-w-xl text-white/90">
                {p.programme.workAcross}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                href={localePath(programme.cta?.href ?? "/partner", locale)}
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                {programme.cta?.label ?? p.common.partnerWithUs}
              </Button>
              <Button
                href={localePath("/our-work", locale)}
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                {p.programme.viewAllProgrammes}
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

/**
 * The Vantage Point platform page — rendered under /programmes/vantage-point
 * for IA coherence but deliberately NOT presented as a seventh portfolio.
 */
async function VantagePointPage({ locale }: { locale: Locale }) {
  const p = getPageContent(locale);
  const d = await getDictionary(locale);
  const prog = programmeTokenForProgramme(vantagePoint.slug);
  const portfolios = getAllProgrammes().filter((pr) => pr.published !== false);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd(
          [
            { label: d.common.home, url: localePath("/", locale) },
            { label: p.ourWork.title, url: localePath("/our-work", locale) },
            { label: vantagePoint.title, url: localePath(`/programmes/${vantagePoint.slug}`, locale) },
          ],
          site.url,
        )}
      />

      <section className="py-16 text-white md:py-24" style={{ backgroundColor: prog.safeHex }}>
        <Container>
          <p className="text-sm font-semibold uppercase tracking-wider text-white/80">
            {p.vantagePoint.platformEyebrow}
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            {vantagePoint.title}
          </h1>
          <p className="mt-4 max-w-2xl text-xl leading-relaxed text-white/90">
            {vantagePoint.summary}
          </p>
          <div className="mt-6">
            <Badge variant="outline" className="border-white/60 text-white">
              {statusLabel(vantagePoint.status, p)}
            </Badge>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <Breadcrumbs
            className="mb-8"
            items={[
              { label: d.common.home, href: localePath("/", locale) },
              { label: p.ourWork.title, href: localePath("/our-work", locale) },
              { label: vantagePoint.title },
            ]}
            locale={locale}
          />

          <p className="mb-12 rounded-lg border border-primary/20 bg-primary-light p-4 text-sm text-foreground">
            {d.common.originalLanguageNotice}
          </p>

          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold md:text-3xl">
              {p.vantagePoint.purposeTitle}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {vantagePoint.purpose}
            </p>
          </div>

          <div className="mt-14 max-w-3xl">
            <h2 className="text-2xl font-bold md:text-3xl">
              {p.vantagePoint.functionsTitle}
            </h2>
            <ul className="mt-6 space-y-3">
              {vantagePoint.functions.map((fn) => (
                <li key={fn.slice(0, 40)} className="flex items-start gap-3">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                  <span className="leading-relaxed">{fn}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="bg-surface py-16 md:py-24">
        <Container>
          <SectionHeader
            title={p.vantagePoint.relationshipTitle}
            description={vantagePoint.relationship}
          />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {portfolios.map((portfolio) => (
              <li key={portfolio.slug}>
                <Link
                  href={localePath(`/programmes/${portfolio.slug}`, locale)}
                  className="block rounded-lg border border-border bg-white p-4 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
                >
                  {portfolio.title}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {vantagePoint.surfacing}
          </p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="flex flex-col items-center justify-between gap-6 rounded-xl bg-primary p-8 text-white md:flex-row">
            <div>
              <h2 className="text-xl font-bold">{p.programme.getInvolved}</h2>
              <p className="mt-1 max-w-xl text-white/90">
                {p.vantagePoint.ctaNote}
              </p>
            </div>
            {vantagePoint.cta && (
              <Button
                href={localePath(vantagePoint.cta.href, locale)}
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                {vantagePoint.cta.label}
              </Button>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}

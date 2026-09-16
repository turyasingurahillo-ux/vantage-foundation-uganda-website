import Link from "next/link";
import { getFlagshipProjects } from "@/content/projects";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ImageOrPlaceholder } from "@/components/shared/ImageOrPlaceholder";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { programmeTokenForCategory } from "@/lib/design-tokens";
import { MapPin, Calendar, Users, ArrowRight } from "lucide-react";
import { localePath, type Locale } from "@/lib/i18n/config";
import { getPageContent } from "@/lib/i18n/content/pages";
import type { HomepageSectionContent } from "@/lib/i18n/page-content";
import type { ProjectStatus } from "@/types";

/**
 * Homepage block 06 — flagship work. The first flagship gets the editorial
 * feature treatment; the rest render as compact cards beneath it. Every
 * project shown is drawn from the canonical projects manifest with its real
 * status — a planned project is never presented as having delivered results.
 *
 * Renders nothing if no flagship projects exist (graceful no-op).
 */
export function FlagshipProjectSection({ locale, copy }: { locale: Locale; copy: HomepageSectionContent["flagship"] }) {
  const flagships = getFlagshipProjects();
  if (flagships.length === 0) return null;

  const [featured, ...rest] = flagships;
  const prog = programmeTokenForCategory(featured.category);
  const pageContent = getPageContent(locale);
  const statusText: Record<ProjectStatus, string> = {
    Active: pageContent.projects.statusActive,
    Completed: pageContent.projects.statusCompleted,
    Planned: pageContent.projects.statusPlanned,
  };

  return (
    <section className="bg-surface py-16 md:py-24 lg:py-32">
      <Container>
        <SectionHeader
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
        />

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Image column */}
          <div className="order-1 lg:order-1">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg">
              <ImageOrPlaceholder
                src={featured.heroImage}
                alt={featured.title}
                fill
                preset="half"
                priority
                containerClassName="h-full w-full"
              />
              <span
                className="absolute left-4 top-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm"
                style={{ backgroundColor: prog.safeHex }}
              >
                {featured.category}
              </span>
            </div>
          </div>

          {/* Content column */}
          <div className="order-2 lg:order-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {pageContent.common.status}: {statusText[featured.status]}
              </span>
            </div>
            <h3 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {featured.title}
            </h3>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {featured.summary}
            </p>

            {/* Key facts */}
            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <MapPin className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  {copy.location}
                </dt>
                <dd className="text-sm text-foreground">
                  {featured.location}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Calendar className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  {copy.timeline}
                </dt>
                <dd className="text-sm text-foreground">{featured.date}</dd>
              </div>
              {featured.beneficiaries && (
                <div className="flex flex-col gap-1">
                  <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Users className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    {copy.beneficiaries}
                  </dt>
                  <dd className="text-sm text-foreground">
                    {featured.beneficiaries}
                  </dd>
                </div>
              )}
              {featured.fundingStatus && (
                <div className="flex flex-col gap-1">
                  <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center text-primary"
                      aria-hidden="true"
                    >
                      <span className="block h-2 w-2 rounded-full bg-primary" />
                    </span>
                    {copy.funding}
                  </dt>
                  <dd className="text-sm text-foreground">
                    {featured.fundingStatus}
                  </dd>
                </div>
              )}
            </dl>

            {/* Themes */}
            {featured.themes && featured.themes.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {featured.themes.map((theme) => (
                  <Badge key={theme} variant="outline">
                    {theme}
                  </Badge>
                ))}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href={localePath(`/projects/${featured.slug}`, locale)}>
                {copy.read}
              </Button>
              {featured.fundingStatus && (
                <Button href={localePath("/donate", locale)} variant="outline">
                  {copy.support}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Secondary flagships */}
        {rest.length > 0 && (
          <div className="mt-16 grid gap-6 sm:grid-cols-2">
            {rest.map((project) => (
              <Link
                key={project.slug}
                href={localePath(`/projects/${project.slug}`, locale)}
                className="group block overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <ImageOrPlaceholder
                    src={project.heroImage}
                    alt={project.heroImageAlt || project.title}
                    fill
                    sizes="(max-width: 639px) 100vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{project.category}</Badge>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {statusText[project.status]}
                    </span>
                  </div>
                  <h3 className="mt-3 text-xl font-bold text-foreground">
                    {project.title}
                  </h3>
                  {project.location && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {project.location}
                    </p>
                  )}
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {project.summary}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    {pageContent.common.viewProject}
                    <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Button href={localePath("/projects", locale)} variant="outline">
            {copy.viewAll}
          </Button>
        </div>
      </Container>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProjectBySlug,
  getProjectSlugs,
  getProjectsByProgramme,
} from "@/content/projects";
import { Container } from "@/components/shared/Container";
import { Badge } from "@/components/ui/Badge";
import { ImageOrPlaceholder } from "@/components/shared/ImageOrPlaceholder";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { JsonLd, buildBreadcrumbJsonLd } from "@/components/shared/JsonLd";
import { Button } from "@/components/ui/Button";
import { ProjectCard } from "@/components/shared/ProjectCard";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { LazySection } from "@/components/shared/LazySection";
import { ImpactMetric } from "@/components/shared/ImpactMetric";
import { MapPin, Calendar, Users, Target, ListChecks, TrendingUp } from "lucide-react";
import { Markdown } from "@/components/shared/Markdown";
import { site } from "@/content/site";
import { programmeTokenForCategory, programmeIdForCategory, programmeLabel } from "@/lib/design-tokens";
import { createPublicMetadata } from "@/lib/metadata";
import { contentSocialImageCandidates } from "@/lib/social-image";
import { resolveLocale } from "@/lib/i18n/params";
import { localePath } from "@/lib/i18n/config";
import { getPageContent } from "@/lib/i18n/content/pages";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = await resolveLocale(Promise.resolve({ locale: resolvedParams.locale }));
  const { slug } = resolvedParams;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return createPublicMetadata({
    title: project.seo?.title || project.title,
    description: project.seo?.description || project.summary,
    path: `/projects/${slug}`,
    image: contentSocialImageCandidates(project),
    imageAlt: project.heroImageAlt || project.title,
    locale,
    contentLocalized: false,
  });
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const resolvedParams = await params;
  const locale = await resolveLocale(Promise.resolve({ locale: resolvedParams.locale }));
  const { slug } = resolvedParams;
  const project = getProjectBySlug(slug);

  if (!project || (process.env.NODE_ENV === "production" && project.published === false)) {
    notFound();
  }

  const p = getPageContent(locale);
  const d = await getDictionary(locale);
  const primaryProgramme = project.primaryProgramme ?? programmeIdForCategory(project.category);
  const relatedProjects = getProjectsByProgramme(primaryProgramme)
    .filter((p) => p.slug !== project.slug)
    .slice(0, 3);
  const prog = programmeTokenForCategory(project.category);
  const allProgrammes = [
    primaryProgramme,
    ...(project.secondaryProgrammes ?? []),
  ];

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd(
          [
            { label: d.common.home, url: localePath("/", locale) },
            { label: p.projects.title, url: localePath("/projects", locale) },
            { label: project.title, url: localePath(`/projects/${slug}`, locale) },
          ],
          site.url
        )}
      />
      <section className="py-16 text-white md:py-24" style={{ backgroundColor: prog.safeHex }}>
        <Container>
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white">
                {project.category}
              </span>
              <Badge variant="outline" className="border-white/30 text-white">
                {project.status}
              </Badge>
              {project.flagship && (
                <span className="inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {p.common.flagship}
                </span>
              )}
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              {project.title}
            </h1>
            <p className="mt-4 text-lg text-white/90">{project.summary}</p>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <Breadcrumbs
            className="mb-8"
            items={[
              { label: d.common.home, href: localePath("/", locale) },
              { label: p.projects.title, href: localePath("/projects", locale) },
              { label: project.title },
            ]}
            locale={locale}
          />

          <p className="mb-8 rounded-lg border border-primary/20 bg-primary-light p-4 text-sm text-foreground">
            {d.common.originalLanguageNotice}
          </p>

          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
            <ImageOrPlaceholder
              src={project.heroImage}
              alt={project.heroImageAlt || project.title}
              fill
              preload
              preset="detailHero"
              containerClassName="h-full w-full"
            />
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
            <div className="min-w-0 space-y-12">
              {project.body && (
                <div className="max-w-3xl">
                  <Markdown locale={locale}>{project.body}</Markdown>
                </div>
              )}

              {project.objective && (
                <div>
                  <h2 className="flex items-center gap-2 text-2xl font-bold">
                    <Target className="h-6 w-6 text-primary" aria-hidden="true" />
                    {p.project.whyItMatters}
                  </h2>
                  <p className="mt-4 text-muted-foreground">{project.objective}</p>
                </div>
              )}

              {project.activities && project.activities.length > 0 && (
                <div>
                  <h2 className="flex items-center gap-2 text-2xl font-bold">
                    <ListChecks className="h-6 w-6 text-primary" aria-hidden="true" />
                    {p.project.whatWeDid}
                  </h2>
                  <ul className="mt-4 space-y-2 text-muted-foreground">
                    {project.activities.map((activity) => (
                      <li key={activity} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {activity}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {project.outcomes && project.outcomes.length > 0 && (
                <div>
                  <h2 className="flex items-center gap-2 text-2xl font-bold">
                    <TrendingUp className="h-6 w-6 text-primary" aria-hidden="true" />
                    {p.project.impact}
                  </h2>
                  <ul className="mt-4 space-y-4">
                    {project.outcomes.map((outcome, i) => (
                      <ImpactMetric
                        key={i}
                        tier={i === 0 ? "output" : i <= 2 ? "outcome" : "long-term"}
                        text={outcome}
                        locale={locale}
                      />
                    ))}
                  </ul>
                </div>
              )}

              {project.gallery && project.gallery.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold">{p.project.gallery}</h2>
                  <LazySection
                    placeholderHeight="300px"
                    rootMargin="300px"
                    className="mt-6 rounded-xl bg-surface"
                  >
                    <GalleryGrid
                      images={project.gallery.map((src, index) => ({
                        id: `${project.slug}-${index}`,
                        src,
                        alt: `${project.title} — ${p.project.gallery} ${index + 1}`,
                        consent: "verified" as const,
                      }))}
                    />
                  </LazySection>
                </div>
              )}

              {project.partners && project.partners.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold">{p.project.partners}</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.partners.map((partner) => (
                      <span
                        key={partner}
                        className="rounded-full border border-border bg-white px-3 py-1 text-sm"
                      >
                        {partner}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-border bg-surface p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
                  {p.project.atAGlance}
                </h2>
                <dl className="mt-4 space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <dt className="font-semibold text-foreground">{p.project.location}</dt>
                      <dd className="text-muted-foreground">{project.location}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <dt className="font-semibold text-foreground">{p.project.timeline}</dt>
                      <dd className="text-muted-foreground">{project.date}</dd>
                    </div>
                  </div>
                  {project.beneficiaries && (
                    <div className="flex items-start gap-3">
                      <Users className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <div>
                        <dt className="font-semibold text-foreground">{p.project.beneficiaries}</dt>
                        <dd className="text-muted-foreground">{project.beneficiaries}</dd>
                      </div>
                    </div>
                  )}
                  {project.fundingStatus && (
                    <div>
                      <dt className="font-semibold text-foreground">{p.project.funding}</dt>
                      <dd className="mt-0.5 text-muted-foreground">{project.fundingStatus}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="font-semibold text-foreground">{p.project.programmes}</dt>
                    <dd className="mt-1 flex flex-wrap gap-1.5">
                      {allProgrammes.map((pid) => (
                        <Link
                          key={pid}
                          href={localePath(`/programmes/${pid}`, locale)}
                          className="rounded-full border border-border bg-white px-2.5 py-0.5 text-xs font-medium text-primary hover:border-primary/50"
                        >
                          {programmeLabel(pid)}
                        </Link>
                      ))}
                    </dd>
                  </div>
                  {project.themes && project.themes.length > 0 && (
                    <div>
                      <dt className="font-semibold text-foreground">{p.project.themes}</dt>
                      <dd className="mt-1 flex flex-wrap gap-1.5">
                        {project.themes.map((theme) => (
                          <span key={theme} className="rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-medium text-primary">
                            {theme}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                  {project.beneficiaryGroups && project.beneficiaryGroups.length > 0 && (
                    <div>
                      <dt className="font-semibold text-foreground">{p.project.whoBenefits}</dt>
                      <dd className="mt-1 flex flex-wrap gap-1.5">
                        {project.beneficiaryGroups.map((group) => (
                          <span key={group} className="text-xs text-muted-foreground">
                            {group}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                  {project.sdgs && project.sdgs.length > 0 && (
                    <div>
                      <dt className="font-semibold text-foreground">{p.project.sdgs}</dt>
                      <dd className="mt-2 flex flex-wrap gap-2">
                        {project.sdgs.map((goal) => (
                          <span
                            key={goal}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white"
                            title={`UN Sustainable Development Goal ${goal}`}
                          >
                            {goal}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="mt-6 rounded-2xl bg-primary p-6 text-white">
                <h2 className="text-lg font-bold">{p.project.supportProject}</h2>
                <p className="mt-2 text-sm text-white/90">
                  {p.ourWork.description}
                </p>
                <Button href={localePath("/donate", locale)} variant="secondary" className="mt-4 w-full">
                  {p.common.donateNow}
                </Button>
              </div>
            </aside>
          </div>

          {relatedProjects.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold">{p.project.relatedProjects}</h2>
              <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {relatedProjects.map((p) => (
                  <ProjectCard key={p.slug} project={p} locale={locale} />
                ))}
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}

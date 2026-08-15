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

export async function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return createPublicMetadata({
    title: project.seo?.title || project.title,
    description: project.seo?.description || project.summary,
    path: `/projects/${slug}`,
    image: project.seo?.ogImage || project.heroImage,
  });
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  // In production, unpublished projects should 404.
  if (!project || (process.env.NODE_ENV === "production" && project.published === false)) {
    notFound();
  }

  // Taxonomy-aware related projects: surface projects in the same programme
  // (primary or secondary), falling back to the legacy category match.
  const primaryProgramme = project.primaryProgramme ?? programmeIdForCategory(project.category);
  const relatedProjects = getProjectsByProgramme(primaryProgramme)
    .filter((p) => p.slug !== project.slug)
    .slice(0, 3);
  const prog = programmeTokenForCategory(project.category);

  // All programmes this project belongs to (for the at-a-glance sidebar).
  const allProgrammes = [
    primaryProgramme,
    ...(project.secondaryProgrammes ?? []),
  ];

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd(
          [
            { label: "Home", url: "/" },
            { label: "Projects", url: "/projects" },
            { label: project.title, url: `/projects/${slug}` },
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
                  Flagship
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
              { label: "Home", href: "/" },
              { label: "Projects", href: "/projects" },
              { label: project.title },
            ]}
          />
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

          {/* Two-column layout: main content + at-a-glance sidebar */}
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
            {/* Main content column */}
            <div className="min-w-0 space-y-12">
              {project.body && (
                <div className="max-w-3xl">
                  <Markdown>{project.body}</Markdown>
                </div>
              )}

              {project.objective && (
                <div>
                  <h2 className="flex items-center gap-2 text-2xl font-bold">
                    <Target className="h-6 w-6 text-primary" aria-hidden="true" />
                    Why it matters
                  </h2>
                  <p className="mt-4 text-muted-foreground">{project.objective}</p>
                </div>
              )}

              {project.activities && project.activities.length > 0 && (
                <div>
                  <h2 className="flex items-center gap-2 text-2xl font-bold">
                    <ListChecks className="h-6 w-6 text-primary" aria-hidden="true" />
                    What we did
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
                    Impact
                  </h2>
                  <ul className="mt-4 space-y-4">
                    {project.outcomes.map((outcome, i) => (
                      <ImpactMetric
                        key={i}
                        tier={i === 0 ? "output" : i <= 2 ? "outcome" : "long-term"}
                        text={outcome}
                      />
                    ))}
                  </ul>
                </div>
              )}

              {project.gallery && project.gallery.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold">Gallery</h2>
                  <LazySection
                    placeholderHeight="300px"
                    rootMargin="300px"
                    className="mt-6 rounded-xl bg-surface"
                  >
                    <GalleryGrid
                      images={project.gallery.map((src, index) => ({
                        id: `${project.slug}-${index}`,
                        src,
                        alt: `${project.title} — photo ${index + 1}`,
                        consent: "verified" as const,
                      }))}
                    />
                  </LazySection>
                </div>
              )}

              {project.partners && project.partners.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold">Partners</h2>
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

            {/* At-a-glance sidebar */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-border bg-surface p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">
                  At a glance
                </h2>
                <dl className="mt-4 space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <dt className="font-semibold text-foreground">Location</dt>
                      <dd className="text-muted-foreground">{project.location}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <dt className="font-semibold text-foreground">Timeline</dt>
                      <dd className="text-muted-foreground">{project.date}</dd>
                    </div>
                  </div>
                  {project.beneficiaries && (
                    <div className="flex items-start gap-3">
                      <Users className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <div>
                        <dt className="font-semibold text-foreground">Beneficiaries</dt>
                        <dd className="text-muted-foreground">{project.beneficiaries}</dd>
                      </div>
                    </div>
                  )}
                  {project.fundingStatus && (
                    <div>
                      <dt className="font-semibold text-foreground">Funding</dt>
                      <dd className="mt-0.5 text-muted-foreground">{project.fundingStatus}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="font-semibold text-foreground">Programmes</dt>
                    <dd className="mt-1 flex flex-wrap gap-1.5">
                      {allProgrammes.map((pid) => (
                        <Link
                          key={pid}
                          href={`/programmes/${pid}`}
                          className="rounded-full border border-border bg-white px-2.5 py-0.5 text-xs font-medium text-primary hover:border-primary/50"
                        >
                          {programmeLabel(pid)}
                        </Link>
                      ))}
                    </dd>
                  </div>
                  {project.themes && project.themes.length > 0 && (
                    <div>
                      <dt className="font-semibold text-foreground">Themes</dt>
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
                      <dt className="font-semibold text-foreground">Who benefits</dt>
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
                      <dt className="font-semibold text-foreground">SDGs</dt>
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
                <h2 className="text-lg font-bold">Support this project</h2>
                <p className="mt-2 text-sm text-white/90">
                  Your contribution helps us expand this work and reach more communities.
                </p>
                <Button href="/donate" variant="secondary" className="mt-4 w-full">
                  Donate now
                </Button>
              </div>
            </aside>
          </div>

          {relatedProjects.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold">Related projects</h2>
              <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {relatedProjects.map((p) => (
                  <ProjectCard key={p.slug} project={p} />
                ))}
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}

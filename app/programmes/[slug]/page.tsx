import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { areasOfWork, projectCategoriesByAreaId } from "@/content/areas";
import { getPublishedProjects } from "@/content/projects";
import { getPublishedStories } from "@/content/stories";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AreaIcon } from "@/components/shared/AreaIcon";
import { ProjectCard } from "@/components/shared/ProjectCard";
import { StoryCard } from "@/components/shared/StoryCard";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { programmeTokenForArea } from "@/lib/design-tokens";
import { getProgrammeAdditionalPhotos } from "@/lib/media-public";
import { createPublicMetadata } from "@/lib/metadata";
import { JsonLd, buildBreadcrumbJsonLd } from "@/components/shared/JsonLd";
import { site } from "@/content/site";

// Lets an admin add photos to a programme via /admin/media without a code
// deploy — refreshes periodically well within the presigned URL TTL.
export const revalidate = 3600;

export function generateStaticParams() {
  return areasOfWork.map((area) => ({ slug: area.id }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const area = areasOfWork.find((a) => a.id === slug);
    if (!area) return { title: "Programme not found" };
    const name = area.programmeName ?? area.title;
    return createPublicMetadata({
      title: name,
      description: area.summary,
      path: `/programmes/${slug}`,
    });
  });
}

export default async function ProgrammePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const area = areasOfWork.find((a) => a.id === slug);
  if (!area) notFound();

  const prog = programmeTokenForArea(area.id);
  const categories = projectCategoriesByAreaId[area.id] ?? [];
  const relatedProjects = getPublishedProjects().filter((p) =>
    categories.includes(p.category)
  );
  const relatedStories = getPublishedStories().filter((s) =>
    (s.relatedProjectSlugs ?? []).some((projectSlug) =>
      relatedProjects.some((p) => p.slug === projectSlug)
    )
  );
  const additionalPhotos = await getProgrammeAdditionalPhotos(area.id);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd(
          [
            { label: "Home", url: "/" },
            { label: "Our Work", url: "/our-work" },
            { label: area.programmeName ?? area.title, url: `/programmes/${area.id}` },
          ],
          site.url,
        )}
      />
      <section className="py-16 text-white md:py-24" style={{ backgroundColor: prog.safeHex }}>
        <Container>
          <SectionHeader
            level="h1"
            eyebrow={area.programmeName ? `${area.title} Programme` : undefined}
            title={area.programmeName ?? area.title}
            description={area.summary}
            light
          />
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          {/* Breadcrumbs */}
          <nav
            className="mb-8 flex items-center gap-2 text-sm text-muted-foreground"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/our-work" className="hover:text-primary">
              Our Work
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground" aria-current="page">
              {area.programmeName ?? area.title}
            </span>
          </nav>

          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="flex items-start gap-4">
                <div
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${prog.hex}1a`, color: prog.hex }}
                >
                  <AreaIcon id={area.id} className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">About this programme</h2>
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    {area.description}
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: prog.safeHex }}>
                  What we do
                </h3>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {area.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: prog.hex }} aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <Card className="p-6">
                <h2 className="text-lg font-semibold">Get involved</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Support this programme through a donation or by volunteering
                  your time and skills.
                </p>
                <div className="mt-4 space-y-2">
                  <Button
                    href={`/donate?campaign=${area.id}`}
                    className="w-full"
                    size="sm"
                  >
                    Donate to this programme
                  </Button>
                  <Button
                    href="/get-involved"
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    Volunteer with us
                  </Button>
                </div>
              </Card>

              {area.externalPlatformLink && (
                <Card className="mt-6 p-6">
                  <h2 className="text-lg font-semibold">
                    {area.externalPlatformLink.label}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {area.externalPlatformLink.description}
                  </p>
                  <Button
                    href={area.externalPlatformLink.href}
                    variant="outline"
                    className="mt-4 w-full"
                    size="sm"
                  >
                    Visit the learning platform
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </Container>
      </section>

      {relatedProjects.length > 0 && (
        <section className="bg-surface py-16 md:py-24">
          <Container>
            <SectionHeader
              title={`Projects in ${area.title}`}
              description="See how we put this programme into action."
            />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProjects.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {relatedStories.length > 0 && (
        <section className="py-16 md:py-24">
          <Container>
            <SectionHeader
              title="Stories from this programme"
              description="Real experiences from the people and communities we work with."
            />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedStories.map((story) => (
                <StoryCard key={story.slug} story={story} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {additionalPhotos.length > 0 && (
        <section className="py-16 md:py-24">
          <Container>
            <SectionHeader
              title={`Photos from ${area.title}`}
              description="Moments from this programme's work in the field."
            />
            <div className="mt-12">
              <GalleryGrid images={additionalPhotos} />
            </div>
          </Container>
        </section>
      )}

      <section className="bg-surface py-16">
        <Container>
          <div className="flex flex-col items-center justify-between gap-4 rounded-xl bg-primary p-8 text-white md:flex-row">
            <div>
              <h2 className="text-xl font-bold">
                Explore our other programmes
              </h2>
              <p className="mt-1 text-white/90">
                We work across four interconnected programmes, with youth
                leadership running through all of them.
              </p>
            </div>
            <Button href="/our-work" variant="outline" className="border-white text-white hover:bg-white/10">
              View all programmes
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}

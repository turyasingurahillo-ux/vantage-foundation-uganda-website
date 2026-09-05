import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { areasOfWork, projectCategoriesByAreaId } from "@/content/areas";
import { getPublishedProjects } from "@/content/projects";
import { getPublishedStories } from "@/content/stories";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
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
import { resolveLocale } from "@/lib/i18n/params";
import { localePath } from "@/lib/i18n/config";
import { getPageContent } from "@/lib/i18n/content/pages";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const revalidate = 3600;

export function generateStaticParams() {
  // Generate routes for all areas (including unpublished) so that the route
  // exists. Unpublished areas return notFound() in production via the page
  // body check below. In development, unpublished areas are previewable.
  return areasOfWork.map((area) => ({ slug: area.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const resolved = await params;
  const locale = await resolveLocale(Promise.resolve({ locale: resolved.locale }));
  const area = areasOfWork.find((a) => a.id === resolved.slug);
  if (!area || (area.published === false && process.env.NODE_ENV === "production")) {
    return {
      title: getPageContent(locale).ui.programmeNotFound.title,
      robots: { index: false, follow: true },
    };
  }
  const name = area.programmeName ?? area.title;
  return createPublicMetadata({
    title: name,
    description: area.summary,
    path: `/programmes/${resolved.slug}`,
    locale,
    contentLocalized: false,
  });
}

export default async function ProgrammePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const resolved = await params;
  const locale = await resolveLocale(Promise.resolve({ locale: resolved.locale }));
  const area = areasOfWork.find((a) => a.id === resolved.slug);
  if (!area) notFound();
  // In production, unpublished areas are not accessible. In development,
  // they are previewable for content editing.
  if (area.published === false && process.env.NODE_ENV === "production") {
    notFound();
  }

  const p = getPageContent(locale);
  const d = await getDictionary(locale);
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
            { label: d.common.home, url: localePath("/", locale) },
            { label: p.ourWork.title, url: localePath("/our-work", locale) },
            { label: area.programmeName ?? area.title, url: localePath(`/programmes/${area.id}`, locale) },
          ],
          site.url,
        )}
      />
      <section className="py-16 text-white md:py-24" style={{ backgroundColor: prog.safeHex }}>
        <Container>
          <SectionHeader
            level="h1"
            eyebrow={area.programmeName ? `${area.title} ${p.ourWork.programmeSuffix}` : undefined}
            title={area.programmeName ?? area.title}
            description={area.summary}
            light
          />
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <Breadcrumbs
            className="mb-8"
            items={[
              { label: d.common.home, href: localePath("/", locale) },
              { label: p.ourWork.title, href: localePath("/our-work", locale) },
              { label: area.programmeName ?? area.title },
            ]}
            locale={locale}
          />

          <p className="mb-8 rounded-lg border border-primary/20 bg-primary-light p-4 text-sm text-foreground">
            {d.common.originalLanguageNotice}
          </p>

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
                  <h2 className="text-2xl font-bold">{p.programme.aboutTitle}</h2>
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    {area.description}
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: prog.safeHex }}>
                  {p.programme.whatWeDo}
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
                <h2 className="text-lg font-semibold">{p.programme.getInvolved}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {p.ourWork.description}
                </p>
                <div className="mt-4 space-y-2">
                  <Button
                    href={localePath(`/donate?campaign=${area.id}`, locale)}
                    className="w-full"
                    size="sm"
                  >
                    {p.programme.donateToProgramme}
                  </Button>
                  <Button
                    href={localePath("/get-involved", locale)}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    {p.programme.volunteerWithUs}
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
                    {p.programme.visitPlatform}
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
              title={p.programme.projectsIn.replace("{programme}", area.title)}
            />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProjects.map((project) => (
                <ProjectCard key={project.slug} project={project} locale={locale} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {relatedStories.length > 0 && (
        <section className="py-16 md:py-24">
          <Container>
            <SectionHeader
              title={p.programme.storiesFrom}
            />
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
              title={p.programme.photosFrom.replace("{programme}", area.title)}
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
              <h2 className="text-xl font-bold">{p.programme.exploreOther}</h2>
              <p className="mt-1 text-white/90">
                {p.programme.workAcross}
              </p>
            </div>
            <Button href={localePath("/our-work", locale)} variant="outline" className="border-white text-white hover:bg-white/10">
              {p.programme.viewAllProgrammes}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}

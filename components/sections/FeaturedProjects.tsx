import { getPublishedProjects } from "@/content/projects";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ProjectCard } from "@/components/shared/ProjectCard";
import { Button } from "@/components/ui/Button";
import { localePath, type Locale } from "@/lib/i18n/config";
import { getPageContent } from "@/lib/i18n/content/pages";

export function FeaturedProjects({ locale }: { locale: Locale }) {
  const content = getPageContent(locale).projects;
  const featured = getPublishedProjects().slice(0, 3);

  return (
    <section className="py-16 md:py-24 lg:py-32">
      <Container>
        <SectionHeader
          eyebrow={content.eyebrow}
          title={content.title}
          description={content.description}
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((project) => (
            <ProjectCard key={project.slug} project={project} locale={locale} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button href={localePath("/projects", locale)} variant="outline">
            {content.viewAll}
          </Button>
        </div>
      </Container>
    </section>
  );
}

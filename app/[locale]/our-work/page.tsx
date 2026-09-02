import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { areasOfWork, projectCategoriesByAreaId } from "@/content/areas";
import { getPublishedProjects } from "@/content/projects";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AreaIcon } from "@/components/shared/AreaIcon";
import { ProjectCard } from "@/components/shared/ProjectCard";
import { Card } from "@/components/ui/Card";
import { createPublicMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPublicMetadata({
  title: "Our Work",
  description: `Explore ${site.name}'s four community programmes: Vantage Care, KikumiKyo Academy, Humanitarian Assistance, and Water, Sanitation and Hygiene.`,
  path: "/our-work",
});

export default function OurWorkPage() {
  return (
    <>
      <section className="bg-primary py-16 text-white md:py-24">
        <Container>
          <SectionHeader
            level="h1"
            title="Our Work"
            description="Four connected programmes advancing health, financial capability, humanitarian support, and clean water and sanitation."
            light
          />
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-12">
            {areasOfWork.map((area) => {
              const categories = projectCategoriesByAreaId[area.id] ?? [];
              const relatedProjects = getPublishedProjects().filter((p) =>
                categories.includes(p.category)
              );

              return (
                <div key={area.id} id={area.id}>
                  <Card className="min-w-0 overflow-hidden p-6 md:p-8">
                    <div className="flex items-start gap-4">
                      <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <AreaIcon id={area.id} className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                          <h2 className="text-2xl font-bold">
                            <Link
                              href={`/programmes/${area.id}`}
                              className="hover:text-primary"
                            >
                              {area.programmeName ?? area.title}
                            </Link>
                          </h2>
                          <Link
                            href={`/programmes/${area.id}`}
                            className="shrink-0 text-sm font-medium text-primary hover:underline"
                          >
                            Learn more
                            <span className="sr-only">
                              {" "}
                              about {area.programmeName ?? area.title}
                            </span>{" "}
                            <span aria-hidden="true">&rarr;</span>
                          </Link>
                        </div>
                        {area.programmeName && (
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {area.title} Programme
                          </p>
                        )}
                        <p className="mt-2 text-muted-foreground">{area.description}</p>
                        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {area.items.map((item) => (
                            <li key={item} className="flex items-center gap-2 text-sm">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {relatedProjects.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
                          Related projects
                        </h3>
                        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                          {relatedProjects.map((project) => (
                            <ProjectCard key={project.slug} project={project} />
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}

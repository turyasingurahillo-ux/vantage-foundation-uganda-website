import type { Metadata } from "next";
import Link from "next/link";
import { areasOfWork, projectCategoriesByAreaId } from "@/content/areas";
import { getPublishedProjects } from "@/content/projects";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AreaIcon } from "@/components/shared/AreaIcon";
import { ProjectCard } from "@/components/shared/ProjectCard";
import { Card } from "@/components/ui/Card";
import { createPublicMetadata } from "@/lib/metadata";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getPageContent } from "@/lib/i18n/content/pages";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/params";
import { localePath } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: LocaleParams;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const content = getPageContent(locale).ourWork;
  return createPublicMetadata({
    title: content.title,
    description: content.description,
    path: "/our-work",
    locale,
    contentLocalized: false,
  });
}

export default async function OurWorkPage({
  params,
}: {
  params: LocaleParams;
}) {
  const locale = await resolveLocale(params);
  const dictionary = await getDictionary(locale);
  const p = getPageContent(locale);

  return (
    <>
      <section className="bg-primary py-16 text-white md:py-24">
        <Container>
          <SectionHeader
            level="h1"
            title={p.ourWork.title}
            description={p.ourWork.description}
            light
          />
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <p className="mb-12 rounded-lg border border-primary/20 bg-primary-light p-4 text-sm text-foreground">
            {dictionary.common.originalLanguageNotice}
          </p>

          <div className="grid gap-12">
            {areasOfWork.map((area) => {
              const categories = projectCategoriesByAreaId[area.id] ?? [];
              const relatedProjects = getPublishedProjects().filter((p) =>
                categories.includes(p.category),
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
                              href={localePath(`/programmes/${area.id}`, locale)}
                              className="hover:text-primary"
                            >
                              {area.programmeName ?? area.title}
                            </Link>
                          </h2>
                          <Link
                            href={localePath(`/programmes/${area.id}`, locale)}
                            className="shrink-0 text-sm font-medium text-primary hover:underline"
                            aria-label={`${dictionary.common.learnMore} ${p.common.about} ${area.programmeName ?? area.title}`}
                          >
                            {dictionary.common.learnMore}
                            <span className="sr-only">
                              {" "}
                              {p.common.about} {area.programmeName ?? area.title}
                            </span>{" "}
                            <span aria-hidden="true">&rarr;</span>
                          </Link>
                        </div>
                        {area.programmeName && (
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {area.title} {p.ourWork.programmeSuffix}
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
                          {p.ourWork.relatedProjects}
                        </h3>
                        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                          {relatedProjects.map((project) => (
                            <ProjectCard key={project.slug} project={project} locale={locale} />
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

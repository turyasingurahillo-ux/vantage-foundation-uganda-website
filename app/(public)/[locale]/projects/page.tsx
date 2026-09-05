import type { Metadata } from "next";
import { getPublishedProjects } from "@/content/projects";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ProjectList } from "@/components/projects/ProjectList";
import { JsonLd, buildBreadcrumbJsonLd } from "@/components/shared/JsonLd";
import { site } from "@/content/site";
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
  const content = getPageContent(locale).projects;
  return createPublicMetadata({
    title: content.title,
    description:
      "Browse Vantage Foundation Uganda's projects in health, education, humanitarian aid and water & sanitation.",
    path: "/projects",
    locale,
    contentLocalized: false,
  });
}

export default async function ProjectsPage({
  params,
}: {
  params: LocaleParams;
}) {
  const locale = await resolveLocale(params);
  const dictionary = await getDictionary(locale);
  const content = getPageContent(locale).projects;

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd(
          [
            { label: dictionary.common.home, url: localePath("/", locale) },
            { label: content.title, url: localePath("/projects", locale) },
          ],
          site.url,
        )}
      />
      <section className="bg-primary py-16 text-white md:py-24">
        <Container>
          <SectionHeader title={content.title} level="h1" light />
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <p className="mb-12 rounded-lg border border-primary/20 bg-primary-light p-4 text-sm text-foreground">
            {dictionary.common.originalLanguageNotice}
          </p>
          <ProjectList projects={getPublishedProjects()} locale={locale} />
        </Container>
      </section>
    </>
  );
}

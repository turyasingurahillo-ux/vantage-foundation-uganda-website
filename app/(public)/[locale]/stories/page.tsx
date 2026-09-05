import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedStoriesWithDb } from "@/lib/stories-public";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { StoryList } from "@/components/stories/StoryList";
import { ImageOrPlaceholder } from "@/components/shared/ImageOrPlaceholder";
import { Badge } from "@/components/ui/Badge";
import { JsonLd, buildBreadcrumbJsonLd } from "@/components/shared/JsonLd";
import { site } from "@/content/site";
import { createPublicMetadata } from "@/lib/metadata";
import { formatContentDate } from "@/lib/content-date";
import { DEFAULT_LANDSCAPE_FOCAL_POINT } from "@/lib/story-article";
import { getPageContent } from "@/lib/i18n/content/pages";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/params";
import { localePath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: LocaleParams;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const content = getPageContent(locale).stories;
  return createPublicMetadata({
    title: content.title,
    description: content.description,
    path: "/stories",
    locale,
    contentLocalized: true,
  });
}

export const revalidate = 3600;

export default async function StoriesPage({
  params,
}: {
  params: LocaleParams;
}) {
  const locale = await resolveLocale(params);
  const p = getPageContent(locale);
  const d = await getDictionary(locale);
  const c = p.common;
  const s = p.stories;
  const ui = p.ui.contentTypes;

  const stories = await getPublishedStoriesWithDb();
  const [featured, ...rest] = stories;
  const categories = [...new Set(stories.map((s) => s.category))].sort();

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd(
          [
            { label: d.common.home, url: localePath("/", locale) },
            { label: s.title, url: localePath("/stories", locale) },
          ],
          site.url,
        )}
      />
      <section className="bg-primary py-16 text-white md:py-24">
        <Container>
          <SectionHeader
            level="h1"
            title={s.title}
            description={s.description}
            light
          />
        </Container>
      </section>

      {/* Featured story */}
      {featured && (
        <section className="py-12 md:py-16">
          <Container>
            <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-surface-strong shadow-lg">
                <ImageOrPlaceholder
                  src={featured.heroImage}
                  alt={featured.heroImageAlt || featured.title}
                  fill
                  preset="half"
                  priority
                  objectPosition={featured.heroImageFocalPoint ?? DEFAULT_LANDSCAPE_FOCAL_POINT}
                  containerClassName="h-full w-full"
                />
              </div>
              <div>
                {(() => {
                  const featuredContentType =
                    ui[(featured.contentType ?? "story").toLowerCase() as keyof typeof ui] ??
                    ui.story;
                  return (
                    <>
                      <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                        {s.featured} {featuredContentType.toLowerCase()}
                      </p>
                      <div className="mt-3">
                        <Badge variant="accent">
                          {featuredContentType} · {featured.category}
                        </Badge>
                      </div>
                    </>
                  );
                })()}
                <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                  <Link
                    href={localePath(`/stories/${featured.slug}`, locale)}
                    className="hover:text-primary"
                  >
                    {featured.title}
                  </Link>
                </h2>
                <p className="mt-4 text-muted-foreground">{featured.excerpt}</p>
                <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                  {featured.author && <span>{featured.author}</span>}
                  {featured.author && featured.date && <span>&middot;</span>}
                  <span>{formatContentDate(featured.date)}</span>
                </div>
                <Link
                  href={localePath(`/stories/${featured.slug}`, locale)}
                  className="mt-6 inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline"
                >
                  {c.readStory} &rarr;
                </Link>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* All stories with search and filter */}
      <section className="py-12 md:py-16">
        <Container>
          <SectionHeader
            align="left"
            title={s.title}
            description={s.description}
          />
          <StoryList stories={rest} categories={categories} locale={locale} />
        </Container>
      </section>
    </>
  );
}

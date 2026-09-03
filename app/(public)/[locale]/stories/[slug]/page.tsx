import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllStorySlugsWithDb,
  getPublishedStoriesWithDb,
  getStoryWithDb,
} from "@/lib/stories-public";
import { Container } from "@/components/shared/Container";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import {
  JsonLd,
  buildBreadcrumbJsonLd,
  buildArticleJsonLd,
} from "@/components/shared/JsonLd";
import { Markdown } from "@/components/shared/Markdown";
import { ArticleAnalytics } from "@/components/shared/ArticleAnalytics";
import { ArticleShareButtons } from "@/components/shared/ArticleShareButtons";
import { ArticleCtaBar } from "@/components/shared/ArticleCtaBar";
import { RelatedStories } from "@/components/shared/RelatedStories";
import { ReadingProgress } from "@/components/shared/ReadingProgress";
import { StoryHero } from "@/components/stories/StoryHero";
import { StoryContextRail, StoryShareRail } from "@/components/stories/StoryRails";
import { site } from "@/content/site";
import { createPublicMetadata } from "@/lib/metadata";
import { contentSocialImageCandidates } from "@/lib/social-image";
import { getLocalImageDimensions } from "@/lib/image-dimensions";
import {
  estimateReadingTime,
  extractOutline,
  extractPullQuote,
  resolveHeroFraming,
} from "@/lib/story-article";
import { BeyondTheWardGuide } from "@/components/guides/BeyondTheWardGuide";
import { getPageContent } from "@/lib/i18n/content/pages";
import { resolveLocale } from "@/lib/i18n/params";
import { localePath } from "@/lib/i18n/config";
import type { Story } from "@/types";

/** Cards shown in the end-of-article carousel. */
const RELATED_STORY_COUNT = 6;

/** Anchor the reading-progress bar measures against. */
const ARTICLE_ELEMENT_ID = "story-article";

export async function generateStaticParams() {
  const slugs = await getAllStorySlugsWithDb();
  return slugs.map((slug) => ({ slug }));
}

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const story = await getStoryWithDb(slug);
  if (!story) return {};
  const resolvedLocale = await resolveLocale(Promise.resolve({ locale }));
  return createPublicMetadata({
    title: story.seo?.title || story.title,
    description: story.seo?.description || story.excerpt,
    path: `/stories/${slug}`,
    type: "article",
    publishedTime: story.date,
    modifiedTime: story.updatedAt,
    authors: story.author ? [story.author] : undefined,
    image: contentSocialImageCandidates(story),
    imageAlt: story.heroImageAlt || story.title,
    locale: resolvedLocale,
    contentLocalized: false,
  });
}

function selectRelatedStories(story: Story, published: Story[]): Story[] {
  const storyTags = new Set(story.tags ?? []);
  const candidates = published.filter((candidate) => candidate.slug !== story.slug);

  const scored = candidates
    .map((candidate) => ({
      story: candidate,
      score:
        (candidate.category === story.category ? 10 : 0) +
        (candidate.tags ?? []).filter((tag) => storyTags.has(tag)).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ story: candidate }) => candidate);

  const selected = [...scored];
  const chosen = new Set(selected.map((candidate) => candidate.slug));
  for (const candidate of candidates) {
    if (selected.length >= RELATED_STORY_COUNT) break;
    if (chosen.has(candidate.slug)) continue;
    selected.push(candidate);
    chosen.add(candidate.slug);
  }

  return selected.slice(0, RELATED_STORY_COUNT);
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug, locale: localeParam } = await params;
  const locale = await resolveLocale(Promise.resolve({ locale: localeParam }));
  const story = await getStoryWithDb(slug);
  const p = getPageContent(locale);

  if (!story || (process.env.NODE_ENV === "production" && story.published === false)) {
    notFound();
  }

  const relatedStories = selectRelatedStories(story, await getPublishedStoriesWithDb());

  const readingTime = story.readingTimeMinutes ?? estimateReadingTime(story.body);
  const heroFraming = resolveHeroFraming({
    src: story.heroImage,
    dimensions: getLocalImageDimensions(story.heroImage),
    focalPoint: story.heroImageFocalPoint,
  });
  const outline = extractOutline(story.body);
  const pullQuote = extractPullQuote(story.body);

  return (
    <>
      <ArticleAnalytics
        articleSlug={story.slug}
        articleTitle={story.title}
        articleId={story.dbId}
      />
      <JsonLd
        data={buildBreadcrumbJsonLd(
          [
            { label: p.common.home, url: localePath("/", locale) },
            { label: p.stories.title, url: localePath("/stories", locale) },
            { label: story.title, url: localePath(`/stories/${slug}`, locale) },
          ],
          site.url
        )}
      />
      <JsonLd
        data={buildArticleJsonLd({
          title: story.title,
          description: story.excerpt,
          url: localePath(`/stories/${slug}`, locale),
          baseUrl: site.url,
          datePublished: story.date,
          dateModified: story.updatedAt,
          author: story.author,
          authorType: story.authorType,
          image: story.heroImage,
        })}
      />
      {story.slug === "beyond-the-ward" ? (
        <BeyondTheWardGuide story={story} relatedStories={relatedStories} locale={locale} />
      ) : (
        <>
          <ReadingProgress targetId={ARTICLE_ELEMENT_ID} />

          <StoryHero story={story} framing={heroFraming} readingTime={readingTime} locale={locale} />

          <section className="py-10 md:py-14">
            <Container width="wide">
              <Breadcrumbs
                className="mb-8"
                items={[
                  { label: p.common.home, href: localePath("/", locale) },
                  { label: p.stories.title, href: localePath("/stories", locale) },
                  { label: story.title },
                ]}
                locale={locale}
              />

              <p className="mb-8 rounded-lg border border-primary/20 bg-primary-light p-4 text-sm text-foreground">
                {p.story.originalLanguageNotice}
              </p>

              <div className="grid gap-x-10 gap-y-8 lg:grid-cols-[minmax(8rem,0.75fr)_minmax(0,36rem)_minmax(10rem,0.9fr)] xl:gap-x-14 xl:grid-cols-[minmax(10rem,0.8fr)_minmax(0,40rem)_minmax(14rem,1fr)] 2xl:grid-cols-[minmax(12rem,0.8fr)_minmax(0,44rem)_minmax(16rem,1fr)]">
                <StoryShareRail
                  slug={story.slug}
                  title={story.title}
                  readingTime={readingTime}
                  locale={locale}
                />

                <div className="min-w-0">
                  <article id={ARTICLE_ELEMENT_ID}>
                    <Markdown variant="article" locale={locale} resolveImageSize={getLocalImageDimensions}>
                      {story.body}
                    </Markdown>
                  </article>

                  <ArticleShareButtons
                    slug={story.slug}
                    title={story.title}
                    className="mt-10 lg:hidden"
                    locale={locale}
                  />

                  <ArticleCtaBar slug={story.slug} locale={locale} />
                </div>

                <StoryContextRail outline={outline} pullQuote={pullQuote} locale={locale} />
              </div>
            </Container>
          </section>

          <section className="pb-16 md:pb-20">
            <Container width="wide">
              <RelatedStories stories={relatedStories} locale={locale} />
            </Container>
          </section>
        </>
      )}
    </>
  );
}

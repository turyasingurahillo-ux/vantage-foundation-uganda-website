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
import { getLocalImageDimensions } from "@/lib/image-dimensions";
import {
  estimateReadingTime,
  extractOutline,
  extractPullQuote,
  resolveHeroFraming,
} from "@/lib/story-article";
import { BeyondTheWardGuide } from "@/components/guides/BeyondTheWardGuide";
import type { Story } from "@/types";

/** Cards shown in the end-of-article carousel. */
const RELATED_STORY_COUNT = 6;

/** Anchor the reading-progress bar measures against. */
const ARTICLE_ELEMENT_ID = "story-article";

export async function generateStaticParams() {
  return (await getAllStorySlugsWithDb()).map((slug) => ({ slug }));
}

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStoryWithDb(slug);
  if (!story) return {};
  return createPublicMetadata({
    title: story.seo?.title || story.title,
    description: story.seo?.description || story.excerpt,
    path: `/stories/${slug}`,
    type: "article",
    publishedTime: story.date,
    modifiedTime: story.updatedAt,
    authors: story.author ? [story.author] : undefined,
    image: story.seo?.ogImage || story.heroImage,
  });
}

/**
 * Further reading: stories sharing a category or tag first, then the most
 * recent remaining stories so the carousel is never left with one lonely card.
 */
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
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await getStoryWithDb(slug);

  // In production, unpublished stories should 404.
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
      {story.dbId && (
        <ArticleAnalytics
          articleId={story.dbId}
          articleSlug={story.slug}
          articleTitle={story.title}
        />
      )}
      <JsonLd
        data={buildBreadcrumbJsonLd(
          [
            { label: "Home", url: "/" },
            { label: "Stories & Insights", url: "/stories" },
            { label: story.title, url: `/stories/${slug}` },
          ],
          site.url
        )}
      />
      <JsonLd
        data={buildArticleJsonLd({
          title: story.title,
          description: story.excerpt,
          url: `/stories/${slug}`,
          baseUrl: site.url,
          datePublished: story.date,
          dateModified: story.updatedAt,
          author: story.author,
          authorType: story.authorType,
          image: story.heroImage,
        })}
      />
      {story.slug === "beyond-the-ward" ? (
        <BeyondTheWardGuide story={story} relatedStories={relatedStories} />
      ) : (
        <>
          <ReadingProgress targetId={ARTICLE_ELEMENT_ID} />

          <StoryHero story={story} framing={heroFraming} readingTime={readingTime} />

          <section className="py-10 md:py-14">
            <Container width="wide">
              <Breadcrumbs
                className="mb-8"
                items={[
                  { label: "Home", href: "/" },
                  { label: "Stories & Insights", href: "/stories" },
                  { label: story.title },
                ]}
              />

              {/*
                Three columns from `lg` up: sticky share rail, reading column,
                context rail. The reading column is capped for line length and
                the surplus width goes to the rails, so a widescreen monitor
                fills its margins instead of leaving them blank. Below `lg`
                both rails drop out and this collapses to a single column.

                The cap rises with each breakpoint — 576px, 640px, then 704px —
                so a 1920px monitor is not handed the same column as a 1280px
                laptop, while the line length stays inside a readable band.
              */}
              <div className="grid gap-x-10 gap-y-8 lg:grid-cols-[minmax(8rem,0.75fr)_minmax(0,36rem)_minmax(10rem,0.9fr)] xl:gap-x-14 xl:grid-cols-[minmax(10rem,0.8fr)_minmax(0,40rem)_minmax(14rem,1fr)] 2xl:grid-cols-[minmax(12rem,0.8fr)_minmax(0,44rem)_minmax(16rem,1fr)]">
                <StoryShareRail
                  slug={story.slug}
                  title={story.title}
                  readingTime={readingTime}
                />

                <div className="min-w-0">
                  <article id={ARTICLE_ELEMENT_ID}>
                    <Markdown variant="article" resolveImageSize={getLocalImageDimensions}>
                      {story.body}
                    </Markdown>
                  </article>

                  {/* The desktop rail already carries these controls. */}
                  <ArticleShareButtons
                    slug={story.slug}
                    title={story.title}
                    className="mt-10 lg:hidden"
                  />

                  <ArticleCtaBar slug={story.slug} />
                </div>

                <StoryContextRail outline={outline} pullQuote={pullQuote} />
              </div>
            </Container>
          </section>

          <section className="pb-16 md:pb-20">
            <Container width="wide">
              <RelatedStories stories={relatedStories} />
            </Container>
          </section>
        </>
      )}
    </>
  );
}

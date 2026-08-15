import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllStorySlugsWithDb,
  getPublishedStoriesWithDb,
  getStoryWithDb,
} from "@/lib/stories-public";
import { Container } from "@/components/shared/Container";
import { Badge } from "@/components/ui/Badge";
import { ImageOrPlaceholder } from "@/components/shared/ImageOrPlaceholder";
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
import { site } from "@/content/site";
import { createPublicMetadata } from "@/lib/metadata";
import { contentSocialImageCandidates } from "@/lib/social-image";
import { formatContentDate } from "@/lib/content-date";
import { BeyondTheWardGuide } from "@/components/guides/BeyondTheWardGuide";

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
    image: contentSocialImageCandidates(story),
    imageAlt: story.heroImageAlt || story.title,
  });
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

  const storyTags = new Set(story.tags ?? []);
  const relatedStories = (await getPublishedStoriesWithDb())
    .filter((candidate) => candidate.slug !== story.slug)
    .map((candidate) => ({
      story: candidate,
      score:
        (candidate.category === story.category ? 10 : 0) +
        (candidate.tags ?? []).filter((tag) => storyTags.has(tag)).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ story: candidate }) => candidate)
    .slice(0, 3);

  const contentType = story.contentType ?? "Story";

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
      <section className="bg-primary py-16 text-white md:py-24">
        <Container>
          <div className="max-w-3xl">
            <Badge variant="accent">
              {contentType} · {story.category}
            </Badge>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              {story.title}
            </h1>
            <p className="mt-4 text-lg text-white/90">{story.excerpt}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/80">
              {story.author && <span>By {story.author}</span>}
              {story.role && <span>{story.role}</span>}
              {story.date && (
                <time dateTime={story.date}>{formatContentDate(story.date)}</time>
              )}
              {story.updatedAt && story.updatedAt !== story.date && (
                <span>Updated {formatContentDate(story.updatedAt)}</span>
              )}
              {story.readingTimeMinutes && (
                <span>{story.readingTimeMinutes} min read</span>
              )}
              {story.location && <span>{story.location}</span>}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <Breadcrumbs
            className="mb-8"
            items={[
              { label: "Home", href: "/" },
              { label: "Stories & Insights", href: "/stories" },
              { label: story.title },
            ]}
          />
          {story.heroImage && (
            <figure>
              <div
                className="relative aspect-[16/9] overflow-hidden rounded-2xl"
                data-testid="story-hero"
              >
                <ImageOrPlaceholder
                  src={story.heroImage}
                  alt={story.heroImageAlt || story.title}
                  fill
                  preload
                  preset="detailHero"
                  containerClassName="h-full w-full"
                />
              </div>
              {story.heroImageCredit && (
                <figcaption className="mt-3 text-sm text-muted-foreground">
                  {story.heroImageCredit}
                </figcaption>
              )}
            </figure>
          )}

          <article className="mx-auto mt-12 max-w-3xl">
            <Markdown variant="article">{story.body}</Markdown>
          </article>

          <div className="mx-auto mt-8 max-w-3xl">
            <ArticleShareButtons slug={story.slug} title={story.title} />
          </div>

          <div className="mx-auto mt-8 max-w-3xl">
            <ArticleCtaBar slug={story.slug} />
          </div>

          <RelatedStories stories={relatedStories} />
        </Container>
      </section>
        </>
      )}
    </>
  );
}

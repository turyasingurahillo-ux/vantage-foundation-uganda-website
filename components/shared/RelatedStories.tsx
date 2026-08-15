"use client";

import Link from "next/link";
import { ImageOrPlaceholder } from "./ImageOrPlaceholder";
import { formatContentDate } from "@/lib/content-date";
import { DEFAULT_LANDSCAPE_FOCAL_POINT, estimateReadingTime } from "@/lib/story-article";
import type { Story } from "@/types";

/**
 * RelatedStories — a horizontally scrollable carousel of further reading.
 *
 * Each card click fires an `article_related_story_click` event so the admin
 * panel can measure which articles drive readers to more content.
 *
 * The carousel scroll-snaps and is driven by touch, trackpad or the keyboard
 * (each card is a link, so tabbing scrolls the strip). It deliberately has no
 * arrow buttons: the strip bleeds past the container edge on narrow screens,
 * which reads as scrollable without extra chrome.
 */
interface RelatedStoriesProps {
  stories: Story[];
}

export function RelatedStories({ stories }: RelatedStoriesProps) {
  if (stories.length === 0) return null;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest("a");
    if (!anchor) return;
    const href = anchor.getAttribute("href") ?? "";
    const slugMatch = href.match(/\/stories\/([^/?#]+)/);
    if (!slugMatch) return;
    const w = window as unknown as {
      __vantageArticle?: { trackRelatedClick: (slug: string) => void };
    };
    w.__vantageArticle?.trackRelatedClick(slugMatch[1]);
  };

  return (
    <div className="mt-16">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 className="text-2xl font-bold">More stories &amp; insights</h2>
        <Link
          href="/stories"
          className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          Browse all stories &rarr;
        </Link>
      </div>

      <div
        className="-mx-4 mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        onClickCapture={handleClick}
        data-testid="related-stories-carousel"
      >
        {stories.map((story) => (
          <RelatedStoryCard key={story.slug} story={story} />
        ))}
      </div>
    </div>
  );
}

function RelatedStoryCard({ story }: { story: Story }) {
  const readingTime = story.readingTimeMinutes ?? estimateReadingTime(story.body);
  const contentType = story.contentType ?? "Story";

  return (
    <article className="group w-[16.5rem] shrink-0 snap-start sm:w-[19rem]">
      <Link
        href={`/stories/${story.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-surface-strong">
          <ImageOrPlaceholder
            src={story.heroImage}
            alt={story.heroImageAlt || story.title}
            fill
            preset="card"
            objectPosition={story.heroImageFocalPoint ?? DEFAULT_LANDSCAPE_FOCAL_POINT}
            className="transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            containerClassName="h-full w-full"
          />
        </div>

        <div className="flex flex-1 flex-col p-5">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
            {contentType} · {story.category}
          </p>
          <h3 className="mt-2 text-base font-semibold leading-snug text-foreground group-hover:text-primary">
            {story.title}
          </h3>
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
            {story.excerpt}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            {formatContentDate(story.date)} · {readingTime} min read
          </p>
        </div>
      </Link>
    </article>
  );
}

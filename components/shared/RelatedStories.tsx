"use client";

import { StoryCard } from "./StoryCard";
import type { Story } from "@/types";

/**
 * RelatedStories — renders related story cards with click tracking.
 * Each card click fires an `article_related_story_click` event so the admin
 * panel can measure which articles drive readers to more content.
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
      <h2 className="text-2xl font-bold">More stories &amp; insights</h2>
      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3" onClickCapture={handleClick}>
        {stories.map((s) => (
          <StoryCard key={s.slug} story={s} />
        ))}
      </div>
    </div>
  );
}

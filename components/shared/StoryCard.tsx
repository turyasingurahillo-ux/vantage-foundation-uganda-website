import Link from "next/link";
import { Story } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ImageOrPlaceholder } from "./ImageOrPlaceholder";
import { formatContentDate } from "@/lib/content-date";
import { DEFAULT_LANDSCAPE_FOCAL_POINT, estimateReadingTime } from "@/lib/story-article";
import { localePath, type Locale } from "@/lib/i18n/config";
import { getPageContent } from "@/lib/i18n/content/pages";

interface StoryCardProps {
  story: Story;
  locale?: Locale;
}

export function StoryCard({ story, locale = "en" }: StoryCardProps) {
  const p = getPageContent(locale);
  const c = p.common;
  const ui = p.ui.contentTypes;
  const readingTime = story.readingTimeMinutes ?? estimateReadingTime(story.body);
  const contentTypeKey = (story.contentType ?? "story").toLowerCase() as keyof typeof ui;
  const contentType = ui[contentTypeKey] ?? ui.story;

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-strong">
        <ImageOrPlaceholder
          src={story.heroImage}
          alt={story.heroImageAlt || story.title}
          fill
          objectPosition={story.heroImageFocalPoint ?? DEFAULT_LANDSCAPE_FOCAL_POINT}
          containerClassName="h-full w-full"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <Badge variant="accent">
          {contentType} · {story.category}
        </Badge>
        <h3 className="mt-3 text-lg font-semibold leading-snug">
          <Link href={localePath(`/stories/${story.slug}`, locale)} className="hover:text-primary">
            {story.title}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {story.excerpt}
        </p>
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>{story.author}</span>
          <span>{formatContentDate(story.date)}</span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Link
            href={localePath(`/stories/${story.slug}`, locale)}
            className="inline-flex text-sm font-semibold text-primary hover:underline"
          >
            {c.readStory}
          </Link>
          <span className="text-xs text-muted-foreground">
            {c.minRead.replace("{minutes}", String(readingTime))}
          </span>
        </div>
      </div>
    </Card>
  );
}

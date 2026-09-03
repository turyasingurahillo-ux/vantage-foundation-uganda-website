import { Container } from "@/components/shared/Container";
import { ImageOrPlaceholder } from "@/components/shared/ImageOrPlaceholder";
import { Badge } from "@/components/ui/Badge";
import { formatContentDate } from "@/lib/content-date";
import type { HeroFraming } from "@/lib/story-article";
import type { Story } from "@/types";
import type { Locale } from "@/lib/i18n/config";
import { getPageContent } from "@/lib/i18n/content/pages";

interface StoryHeroProps {
  story: Story;
  framing: HeroFraming;
  readingTime: number;
  locale?: Locale;
}

export function StoryHero({ story, framing, readingTime, locale = "en" }: StoryHeroProps) {
  const contentType = story.contentType ?? "Story";
  const kicker = `${contentType} · ${story.category}`;

  if (framing.variant === "cinematic") {
    return (
      <section className="relative isolate bg-navy text-white" data-testid="story-hero">
        <div className="relative aspect-[16/10] w-full overflow-hidden md:absolute md:inset-0 md:-z-10 md:aspect-auto">
          <ImageOrPlaceholder
            src={story.heroImage}
            alt={story.heroImageAlt || story.title}
            fill
            preload
            preset="banner"
            objectPosition={framing.objectPosition}
            containerClassName="h-full w-full"
          />
          <div
            className="absolute inset-0 hidden bg-gradient-to-t from-black/90 via-black/60 to-black/25 md:block"
            aria-hidden="true"
          />
        </div>

        <Container className="flex flex-col justify-end py-10 md:min-h-[clamp(22rem,56vw,34rem)] md:py-14">
          <div className="max-w-[46rem]">
            <StoryKicker>{kicker}</StoryKicker>
            <h1 className="mt-4 text-[clamp(1.875rem,5vw,3.5rem)] font-bold leading-[1.1] tracking-tight">
              {story.title}
            </h1>
            <p className="mt-4 max-w-[38rem] text-base text-white/90 sm:text-lg">
              {story.excerpt}
            </p>
            <StoryByline story={story} readingTime={readingTime} tone="onImage" locale={locale} />
          </div>
        </Container>

        {story.heroImageCredit && (
          <Container>
            <p className="pb-5 text-xs text-white/70">{story.heroImageCredit}</p>
          </Container>
        )}
      </section>
    );
  }

  if (framing.variant === "portrait") {
    return (
      <section className="bg-navy text-white" data-testid="story-hero">
        <Container className="py-10 md:py-14">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
            <div className="order-2 max-w-[46rem] lg:order-1">
              <StoryKicker>{kicker}</StoryKicker>
              <h1 className="mt-4 text-[clamp(1.875rem,4.5vw,3.25rem)] font-bold leading-[1.1] tracking-tight">
                {story.title}
              </h1>
              <p className="mt-4 text-base text-white/90 sm:text-lg">{story.excerpt}</p>
              <StoryByline story={story} readingTime={readingTime} tone="onImage" locale={locale} />
            </div>

            <figure className="order-1 lg:order-2">
              <div className="relative mx-auto aspect-[4/5] w-full max-w-[22rem] overflow-hidden rounded-2xl shadow-xl lg:max-w-none">
                <ImageOrPlaceholder
                  src={story.heroImage}
                  alt={story.heroImageAlt || story.title}
                  fill
                  preload
                  preset="half"
                  objectPosition={framing.objectPosition}
                  containerClassName="h-full w-full"
                />
              </div>
              {story.heroImageCredit && (
                <figcaption className="mt-3 text-center text-xs text-white/70 lg:text-left">
                  {story.heroImageCredit}
                </figcaption>
              )}
            </figure>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="bg-primary py-16 text-white md:py-24">
      <Container>
        <div className="max-w-3xl">
          <Badge variant="accent">{kicker}</Badge>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{story.title}</h1>
          <p className="mt-4 text-lg text-white/90">{story.excerpt}</p>
          <StoryByline story={story} readingTime={readingTime} tone="onBrand" locale={locale} />
        </div>
      </Container>
    </section>
  );
}

function StoryKicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.12em] text-white drop-shadow-sm sm:text-sm">
      {children}
    </p>
  );
}

function StoryByline({
  story,
  readingTime,
  tone,
  locale = "en",
}: {
  story: Story;
  readingTime: number;
  tone: "onImage" | "onBrand";
  locale?: Locale;
}) {
  const c = getPageContent(locale).common;
  const s = getPageContent(locale).story;

  const meta = [
    story.author,
    story.role,
    story.location,
  ].filter(Boolean) as string[];

  return (
    <div className={tone === "onImage" ? "mt-6 text-white/85" : "mt-6 text-white/80"}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        {meta.map((item) => (
          <span key={item}>{item}</span>
        ))}
        {story.date && (
          <time dateTime={story.date}>{formatContentDate(story.date)}</time>
        )}
        {story.updatedAt && story.updatedAt !== story.date && (
          <span>{s.updated} {formatContentDate(story.updatedAt)}</span>
        )}
      </div>

      <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium">
        <span>{story.category}</span>
        <span aria-hidden="true">·</span>
        <span>{c.minRead.replace("{minutes}", String(readingTime))}</span>
      </p>

      {story.tags && story.tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {story.tags.slice(0, 5).map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium capitalize"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

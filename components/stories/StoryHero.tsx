import { Container } from "@/components/shared/Container";
import { ImageOrPlaceholder } from "@/components/shared/ImageOrPlaceholder";
import { Badge } from "@/components/ui/Badge";
import { formatContentDate } from "@/lib/content-date";
import type { HeroFraming } from "@/lib/story-article";
import type { Story } from "@/types";

interface StoryHeroProps {
  story: Story;
  framing: HeroFraming;
  readingTime: number;
}

/**
 * StoryHero — the opening of a story page.
 *
 * The hero breaks out of the reading column and runs the full width of the
 * viewport, so a widescreen monitor gets imagery rather than empty margin.
 * Which shape it takes depends on the photograph:
 *
 * - `cinematic`: landscape sources fill a wide band with the headline set over
 *   a bottom scrim.
 * - `portrait`: tall sources keep their own proportions in a column beside the
 *   headline. A portrait photograph forced into a cinematic band shows only a
 *   narrow strip of its height, which is what cropped through subjects' faces.
 * - `textOnly`: stories with no hero image keep the brand colour band.
 */
export function StoryHero({ story, framing, readingTime }: StoryHeroProps) {
  const contentType = story.contentType ?? "Story";
  const kicker = `${contentType} · ${story.category}`;

  if (framing.variant === "cinematic") {
    return (
      <section className="relative isolate bg-navy text-white" data-testid="story-hero">
        {/*
          Below `md` the photograph sits above the headline rather than behind
          it: on a phone the text block covers most of the band, and an overlay
          would hide the very subject the photograph is there to show. From
          `md` up it moves behind the copy and fills the section.
        */}
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
          {/* Scrim: opaque enough at the base to hold display type at AA, and
              clear at the top so the photograph is still the subject. */}
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
            <StoryByline story={story} readingTime={readingTime} tone="onImage" />
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
              <StoryByline story={story} readingTime={readingTime} tone="onImage" />
            </div>

            <figure className="order-1 lg:order-2">
              {/* 4:5 sits close to the 3:4 these photographs are shot at, so
                  the crop trims edges rather than removing the subject. */}
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
          <StoryByline story={story} readingTime={readingTime} tone="onBrand" />
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

/**
 * Byline strip: author, date, tags and reading time. Tags and reading time sit
 * with the byline (rather than at the foot of the article) so a reader can see
 * the subject and the commitment before deciding to read.
 */
function StoryByline({
  story,
  readingTime,
  tone,
}: {
  story: Story;
  readingTime: number;
  tone: "onImage" | "onBrand";
}) {
  const meta = [
    story.author && `By ${story.author}`,
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
          <span>Updated {formatContentDate(story.updatedAt)}</span>
        )}
      </div>

      <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium">
        <span>{story.category}</span>
        <span aria-hidden="true">·</span>
        <span>{readingTime} min read</span>
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

import { getPublishedStoriesWithDb } from "@/lib/stories-public";
import { Container } from "@/components/shared/Container";
import { ImageWithOverlay } from "@/components/shared/ImageWithOverlay";
import { Button } from "@/components/ui/Button";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { HomepageSectionContent } from "@/lib/i18n/page-content";

/**
 * Homepage block 08 — one dignified human story. The featured story is
 * curated by slug rather than "latest" so the primary narrative always shows
 * a first-person voice (not an insight or programme update). Falls back to
 * the most recent published story if the curated one is unpublished.
 * The story is deliberately kept separate from the quantitative proof layer.
 */
const HOMEPAGE_STORY_SLUG = "what-are-we-without-our-dreams";

export async function FeaturedImpactStory({ locale, copy }: { locale: Locale; copy: HomepageSectionContent["stories"] }) {
  const stories = await getPublishedStoriesWithDb();
  const story = stories.find((s) => s.slug === HOMEPAGE_STORY_SLUG) ?? stories[0];
  if (!story) return null;

  return (
    <section className="bg-white py-16 md:py-24 lg:py-32">
      <Container>
        <ImageWithOverlay
          src={story.heroImage}
          alt={story.title}
          overlay="dark-gradient"
          preset="hero"
          containerClassName="min-h-[26rem] w-full rounded-2xl"
          contentClassName="flex h-full flex-col justify-end p-8 text-white md:p-12"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-white/80">
            {copy.featuredEyebrow}
            {story.location ? ` — ${story.location}` : ""}
          </p>
          <h2 className="mt-2 max-w-2xl text-3xl font-bold sm:text-4xl">
            {story.title}
          </h2>
          <p className="mt-4 max-w-xl text-white/90">{story.excerpt}</p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Button href={localePath(`/stories/${story.slug}`, locale)} variant="secondary">
              {copy.read}
            </Button>
            <Button
              href={localePath("/stories", locale)}
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              {copy.moreStories}
            </Button>
          </div>
        </ImageWithOverlay>
      </Container>
    </section>
  );
}

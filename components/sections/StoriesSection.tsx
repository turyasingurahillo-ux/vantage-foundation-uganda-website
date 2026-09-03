import { getPublishedStories } from "@/content/stories";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { StoryCard } from "@/components/shared/StoryCard";
import { Button } from "@/components/ui/Button";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { HomepageSectionContent } from "@/lib/i18n/page-content";

export function StoriesSection({ locale, copy }: { locale: Locale; copy: HomepageSectionContent["stories"] }) {
  const featured = getPublishedStories().slice(0, 3);

  return (
    <section className="py-16 md:py-24 lg:py-32">
      <Container>
        <SectionHeader
          eyebrow={copy.eyebrow} title={copy.title} description={copy.description}
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((story) => (
            <StoryCard key={story.slug} story={story} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button href={localePath("/stories", locale)} variant="outline">
            {copy.cta}
          </Button>
        </div>
      </Container>
    </section>
  );
}

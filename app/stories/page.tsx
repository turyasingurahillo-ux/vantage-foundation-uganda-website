import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedStoriesWithDb } from "@/lib/stories-public";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { StoryList } from "@/components/stories/StoryList";
import { ImageOrPlaceholder } from "@/components/shared/ImageOrPlaceholder";
import { Badge } from "@/components/ui/Badge";
import { createPublicMetadata } from "@/lib/metadata";
import { formatContentDate } from "@/lib/content-date";
import { DEFAULT_LANDSCAPE_FOCAL_POINT } from "@/lib/story-article";

export const metadata: Metadata = createPublicMetadata({
  title: "Stories & Insights",
  description:
    "Read community stories, programme updates, research and reflections from Vantage Foundation Uganda.",
  path: "/stories",
});

export const revalidate = 3600;

export default async function StoriesPage() {
  const stories = await getPublishedStoriesWithDb();
  // Featured: the first story (or a specific one if we add a `featured` flag later)
  const [featured, ...rest] = stories;
  // Derive categories from the published stories, sorted alphabetically.
  const categories = [...new Set(stories.map((s) => s.category))].sort();

  return (
    <>
      <section className="bg-primary py-16 text-white md:py-24">
        <Container>
          <SectionHeader
            level="h1"
            title="Stories & Insights"
            description="Community voices, programme updates, research and reflections from our work."
            light
          />
        </Container>
      </section>

      {/* Featured story */}
      {featured && (
        <section className="py-12 md:py-16">
          <Container>
            <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-surface-strong shadow-lg">
                <ImageOrPlaceholder
                  src={featured.heroImage}
                  alt={featured.heroImageAlt || featured.title}
                  fill
                  preset="half"
                  priority
                  objectPosition={featured.heroImageFocalPoint ?? DEFAULT_LANDSCAPE_FOCAL_POINT}
                  containerClassName="h-full w-full"
                />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                  Featured {(featured.contentType ?? "Story").toLowerCase()}
                </p>
                <div className="mt-3">
                  <Badge variant="accent">
                    {featured.contentType ?? "Story"} · {featured.category}
                  </Badge>
                </div>
                <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                  <Link
                    href={`/stories/${featured.slug}`}
                    className="hover:text-primary"
                  >
                    {featured.title}
                  </Link>
                </h2>
                <p className="mt-4 text-muted-foreground">{featured.excerpt}</p>
                <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                  {featured.author && <span>{featured.author}</span>}
                  {featured.author && featured.date && <span>&middot;</span>}
                  <span>{formatContentDate(featured.date)}</span>
                </div>
                <Link
                  href={`/stories/${featured.slug}`}
                  className="mt-6 inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Read the {(featured.contentType ?? "Story").toLowerCase()} &rarr;
                </Link>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* All stories with search and filter */}
      <section className="py-12 md:py-16">
        <Container>
          <SectionHeader
            align="left"
            title="All stories & insights"
            description={`${stories.length} ${stories.length === 1 ? "story or insight" : "stories and insights"} from our community`}
          />
          <StoryList stories={rest} categories={categories} />
        </Container>
      </section>
    </>
  );
}

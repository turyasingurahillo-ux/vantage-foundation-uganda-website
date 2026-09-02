import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/Button";
import { ImageOrPlaceholder } from "@/components/shared/ImageOrPlaceholder";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { HomepageSectionContent } from "@/lib/i18n/page-content";

export function AboutTeaser({ locale, copy }: { locale: Locale; copy: HomepageSectionContent["about"] }) {
  return (
    <section className="py-16 md:py-24 lg:py-32">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <ImageOrPlaceholder
              src="/images/photos/photo-062.webp"
              alt={copy.imageAlt}
              fill
              preset="half"
              containerClassName="h-full w-full"
            />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              {copy.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {copy.title}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              {copy.paragraphs[0]}
            </p>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {copy.paragraphs[1]}
            </p>
            <Button href={localePath("/about-us", locale)} className="mt-8" variant="outline">
              {copy.cta}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

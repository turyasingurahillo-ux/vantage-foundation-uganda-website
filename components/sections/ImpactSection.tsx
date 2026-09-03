import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { StatCard } from "@/components/shared/StatCard";
import { getPublishedImpactStats } from "@/content/impact";
import { Button } from "@/components/ui/Button";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { HomepageSectionContent } from "@/lib/i18n/page-content";

export function ImpactSection({ locale, copy }: { locale: Locale; copy: HomepageSectionContent["impact"] }) {
  return (
    <section className="bg-surface py-16 md:py-24 lg:py-32">
      <Container>
        <SectionHeader
          eyebrow={copy.eyebrow} title={copy.title} description={copy.description}
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {getPublishedImpactStats().map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="mx-auto mb-6 max-w-2xl text-sm text-muted-foreground">
            {copy.note}
          </p>
          <Button href={localePath("/impact", locale)}>{copy.cta}</Button>
        </div>
      </Container>
    </section>
  );
}

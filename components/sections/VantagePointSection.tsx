import { Container } from "@/components/shared/Container";
import { EvidenceBadge } from "@/components/shared/EvidenceBadge";
import { Button } from "@/components/ui/Button";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { HomepageSectionContent } from "@/lib/i18n/page-content";

/**
 * Homepage block 07 — controlled introduction to Vantage Point, the
 * cross-programme learning platform. The "Planned / target" evidence badge
 * keeps the maturity of the platform honest; the CTA points to the real
 * platform page created in PR-3 (/programmes/vantage-point).
 */
export function VantagePointSection({
  locale,
  copy,
}: {
  locale: Locale;
  copy: HomepageSectionContent["vantagePoint"];
}) {
  return (
    <section className="bg-white py-16 md:py-24 lg:py-32">
      <Container>
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-surface p-8 shadow-sm md:p-12">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              {copy.eyebrow}
            </p>
            <EvidenceBadge status="planned" locale={locale} />
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {copy.title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            {copy.paragraphs[0]}
          </p>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            {copy.paragraphs[1]}
          </p>
          {copy.learnMore && (
            <div className="mt-8">
              <Button
                href={localePath("/programmes/vantage-point", locale)}
                variant="outline"
              >
                {copy.learnMore}
              </Button>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Button } from "@/components/ui/Button";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { HomepageSectionContent } from "@/lib/i18n/page-content";

/**
 * Homepage block 05 — Theory of Change teaser. A semantic ordered list of the
 * pathway behind Vantage's work. The full Theory of Change page arrives in
 * PR-4; the CTA points at /impact until then.
 */
export function ChangePathway({
  locale,
  copy,
}: {
  locale: Locale;
  copy: HomepageSectionContent["pathway"];
}) {
  return (
    <section className="bg-white py-16 md:py-24 lg:py-32">
      <Container>
        <SectionHeader eyebrow={copy.eyebrow} title={copy.title} />
        <ol className="mx-auto mt-14 grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {copy.steps.map((step, index) => (
            <li key={step.title} className="border-t-2 border-primary/20 pt-6">
              <span
                className="text-xs font-semibold uppercase tracking-wider text-primary"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-base font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
        <div className="mt-12 text-center">
          <Button href={localePath("/impact", locale)} variant="outline">
            {copy.cta}
          </Button>
        </div>
      </Container>
    </section>
  );
}

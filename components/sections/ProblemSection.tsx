import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import type { HomepageSectionContent } from "@/lib/i18n/page-content";

/**
 * Homepage block 03 — problem statement. Explains why Vantage works across
 * connected determinants of wellbeing and opportunity rather than within a
 * single programme category. Qualitative by design: no prevalence figures
 * without an authoritative source.
 */
export function ProblemSection({ copy }: { copy: HomepageSectionContent["problem"] }) {
  return (
    <section className="bg-white py-16 md:py-24 lg:py-32">
      <Container>
        <SectionHeader eyebrow={copy.eyebrow} title={copy.title} />
        <p className="mx-auto mt-6 max-w-3xl text-center text-lg leading-relaxed text-muted-foreground">
          {copy.lead}
        </p>
        <ol className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {copy.chain.map((statement, index) => (
            <li
              key={statement}
              className="rounded-xl border border-border bg-surface p-5"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-2 text-sm leading-relaxed text-foreground">{statement}</p>
            </li>
          ))}
        </ol>
        <p className="mx-auto mt-10 max-w-3xl text-center text-base font-medium leading-relaxed text-foreground">
          {copy.closing}
        </p>
      </Container>
    </section>
  );
}

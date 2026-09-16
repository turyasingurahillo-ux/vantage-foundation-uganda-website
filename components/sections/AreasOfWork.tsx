import Link from "next/link";
import { getPublishedProgrammes } from "@/content/programmes";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AreaIcon } from "@/components/shared/AreaIcon";
import { Badge } from "@/components/ui/Badge";
import { ArrowRight } from "lucide-react";
import { localePath, type Locale } from "@/lib/i18n/config";
import { programmeTokenForProgramme } from "@/lib/design-tokens";
import { getPageContent } from "@/lib/i18n/content/pages";
import type { I18nDictionary } from "@/lib/i18n/dictionaries";
import type { ProgrammeStatus } from "@/types";

/**
 * Homepage portfolio preview (block 04) — renders the six canonical
 * portfolios from content/programmes.ts. Deliberately concise: each card
 * answers "what outcome area is this, what is Vantage trying to change,
 * where can I learn more" — the full brief lives on the programme page.
 */
export function AreasOfWork({ locale, dictionary }: { locale: Locale; dictionary: I18nDictionary }) {
  const p = getPageContent(locale);
  const statusMap: Record<ProgrammeStatus, string> = {
    active: p.programme.statusActive,
    developing: p.programme.statusDeveloping,
    pilot: p.programme.statusPilot,
    planned: p.programme.statusPlanned,
  };

  return (
    <section className="bg-surface py-16 md:py-24 lg:py-32">
      <Container>
        <SectionHeader
          eyebrow={dictionary.home.areasEyebrow}
          title={dictionary.home.areasTitle}
          description={dictionary.home.areasDescription}
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {getPublishedProgrammes().map((programme) => {
            const prog = programmeTokenForProgramme(programme.slug);
            return (
              <Link
                key={programme.slug}
                href={localePath(`/programmes/${programme.slug}`, locale)}
                className="group block rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: `${prog.hex}1a`,
                      color: prog.hex,
                    }}
                  >
                    <AreaIcon id={programme.icon ?? programme.slug} className="h-5 w-5" />
                  </div>
                  {programme.status !== "active" && (
                    <Badge variant="outline">
                      {statusMap[programme.status]}
                    </Badge>
                  )}
                </div>
                <h3 className="mt-4 text-xl font-bold leading-snug text-foreground group-hover:text-primary">
                  {programme.title}
                </h3>
                {programme.programmeName && (
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {programme.programmeName}
                  </p>
                )}
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {programme.outcomeHeadline}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  {dictionary.common.learnMore}
                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

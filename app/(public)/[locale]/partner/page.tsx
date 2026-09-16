import type { Metadata } from "next";
import Link from "next/link";
import {
  partnershipOptions,
  resolvePartnershipTypeFromQuery,
} from "@/content/partnership";
import { getPublishedProgrammes, getProgrammeBySlug } from "@/content/programmes";
import { vantagePoint } from "@/content/vantage-point";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { PartnershipForm } from "@/components/partnership/PartnershipForm";
import { EvidenceBadge } from "@/components/shared/EvidenceBadge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createPublicMetadata } from "@/lib/metadata";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/params";
import { getPageContent } from "@/lib/i18n/content/pages";
import { localePath } from "@/lib/i18n/config";
import type { PartnershipType } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: LocaleParams;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const p = getPageContent(locale).partner;
  return createPublicMetadata({
    title: p.title,
    description: p.description,
    path: "/partner",
    locale,
    contentLocalized: false,
  });
}

export const revalidate = 3600;

export default async function PartnerPage({
  params,
  searchParams,
}: {
  params: LocaleParams;
  searchParams: Promise<{ type?: string; programme?: string }>;
}) {
  const locale = await resolveLocale(params);
  const dictionary = await getDictionary(locale);
  const p = getPageContent(locale);
  const pt = p.partner;

  const { type, programme } = await searchParams;
  const defaultType = resolvePartnershipTypeFromQuery(type);
  const defaultProgramme =
    programme && getProgrammeBySlug(programme) ? programme : "";

  return (
    <>
      {/* Hero — institutional proposition, not "support us" */}
      <section className="bg-primary py-16 text-white md:py-24">
        <Container>
          <SectionHeader
            level="h1"
            eyebrow={pt.eyebrow}
            title={pt.title}
            description={pt.description}
            light
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="#mechanisms" variant="secondary">
              {pt.exploreCta}
            </Button>
            <Button
              href="#enquiry"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              {pt.conversationCta}
            </Button>
          </div>
        </Container>
      </section>

      {/* Why partner with Vantage — grounded in the established architecture */}
      <section className="py-16 md:py-24">
        <Container>
          <p className="mb-12 rounded-lg border border-primary/20 bg-primary-light p-4 text-sm text-foreground">
            {dictionary.common.originalLanguageNotice}
          </p>
          <SectionHeader align="left" title={pt.whyTitle} />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pt.whyItems.map((item) => (
              <Card key={item.title} className="p-6">
                <h3 className="text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* The six partnership mechanisms */}
      <section id="mechanisms" className="scroll-mt-24 bg-surface py-16 md:py-24">
        <Container>
          <SectionHeader
            align="left"
            title={pt.mechanismsTitle}
            description={pt.mechanismsDescription}
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {partnershipOptions.map((option) => {
              const m = pt.mechanisms[option.id];
              return (
                <Card key={option.id} className="flex flex-col p-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    {m.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {m.summary}
                  </p>
                  {option.relevantProgrammeIds && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {option.relevantProgrammeIds.map((pid) => {
                        const prog = getProgrammeBySlug(pid);
                        return prog ? (
                          <Link
                            key={pid}
                            href={localePath(
                              `/programmes/${prog.slug}`,
                              locale,
                            )}
                            className="rounded-full border border-border bg-white px-2.5 py-0.5 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary"
                          >
                            {prog.title}
                          </Link>
                        ) : null;
                      })}
                    </div>
                  )}
                  {option.links && (
                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
                      {option.links.map((link) => (
                        <Link
                          key={link.href}
                          href={localePath(link.href, locale)}
                          className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
                        >
                          {pt.linkLabels[link.labelKey]}
                        </Link>
                      ))}
                    </div>
                  )}
                  <div className="mt-5 border-t border-border pt-4">
                    <Link
                      href={localePath(
                        `/partner?type=${option.id}#enquiry`,
                        locale,
                      )}
                      className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline-offset-4 hover:underline"
                    >
                      {pt.discussCta}
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Six portfolios — canonical programme data, not a duplicated array */}
      <section className="py-16 md:py-24">
        <Container>
          <SectionHeader
            align="left"
            title={pt.portfoliosTitle}
            description={pt.portfoliosDescription}
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {getPublishedProgrammes().map((prog) => (
              <Link
                key={prog.slug}
                href={localePath(`/programmes/${prog.slug}`, locale)}
                className="rounded-lg border border-border bg-white p-5 transition-colors hover:border-primary"
              >
                <h3 className="text-base font-semibold text-primary">
                  {prog.title}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                  {prog.summary}
                </p>
              </Link>
            ))}
          </div>

          {/* Vantage Point — a platform, never a seventh portfolio */}
          <Card className="mt-8 flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-foreground">
                  {pt.vantagePointTitle}
                </h3>
                <EvidenceBadge status="planned" locale={locale} />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {pt.vantagePointDescription}
              </p>
            </div>
            <Button
              href={localePath(`/programmes/${vantagePoint.slug}`, locale)}
              variant="outline"
              className="shrink-0"
            >
              {pt.vantagePointCta}
            </Button>
          </Card>
        </Container>
      </section>

      {/* How we approach partnership — due diligence before conversion */}
      <section className="bg-surface py-16 md:py-24">
        <Container>
          <SectionHeader align="left" title={pt.approachTitle} />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pt.approachItems.map((item) => (
              <Card key={item.title} className="p-6">
                <h3 className="text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </Card>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              href={localePath("/safeguarding", locale)}
              variant="outline"
              size="sm"
            >
              {p.legal.safeguarding}
            </Button>
            <Button
              href={localePath("/impact", locale)}
              variant="outline"
              size="sm"
            >
              {pt.linkLabels.impact}
            </Button>
            <Button
              href={localePath("/theory-of-change", locale)}
              variant="outline"
              size="sm"
            >
              {pt.linkLabels.theoryOfChange}
            </Button>
            <Button
              href={localePath("/reports-and-accountability", locale)}
              variant="outline"
              size="sm"
            >
              {pt.linkLabels.reports}
            </Button>
            <Button
              href={localePath("/privacy", locale)}
              variant="outline"
              size="sm"
            >
              {p.legal.privacy}
            </Button>
          </div>
        </Container>
      </section>

      {/* The tailored enquiry form */}
      <section id="enquiry" className="scroll-mt-24 py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-2xl">
            <SectionHeader
              align="left"
              title={pt.formTitle}
              description={pt.formDescription}
            />
            <div className="mt-8">
              <PartnershipForm
                key={`${defaultType}-${defaultProgramme}`}
                defaultType={defaultType as PartnershipType | ""}
                defaultProgramme={defaultProgramme}
                copy={pt.form}
                mechanisms={partnershipOptions.map((o) => ({
                  id: o.id,
                  label: pt.mechanisms[o.id].title,
                  prompt: pt.mechanisms[o.id].prompt,
                }))}
                programmes={getPublishedProgrammes().map((prog) => ({
                  id: prog.slug,
                  label: prog.title,
                }))}
                locale={locale}
                privacyLabel={p.legal.privacy}
              />
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              {pt.alternativeNote}{" "}
              <Link
                href={localePath("/donate", locale)}
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                {pt.donateCta}
              </Link>
              {" · "}
              <Link
                href={localePath("/get-involved", locale)}
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                {pt.volunteerCta}
              </Link>
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}

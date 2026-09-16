import type { Metadata } from "next";
import { getPublishedTeam } from "@/content/team";
import { getPublishedProgrammes } from "@/content/programmes";
import { reachDistricts } from "@/content/reach";
import { getTeamMemberPhotoOverride } from "@/lib/media-public";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TeamCard } from "@/components/shared/TeamCard";
import { Button } from "@/components/ui/Button";
import { JsonLd, buildBreadcrumbJsonLd } from "@/components/shared/JsonLd";
import { site } from "@/content/site";
import { createPublicMetadata } from "@/lib/metadata";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/params";
import { aboutContent } from "@/lib/i18n/page-content";
import { localePath } from "@/lib/i18n/config";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: LocaleParams;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const dictionary = await getDictionary(locale);
  return createPublicMetadata({
    title: dictionary.about.title,
    description: dictionary.about.description,
    path: "/about-us",
    locale,
  });
}

// Lets an admin update a team member's photo via /admin/media without a
// code deploy — refreshes periodically well within the presigned URL TTL.
export const revalidate = 3600;

export default async function AboutPage({ params }: { params: LocaleParams }) {
  const locale = await resolveLocale(params);
  const dictionary = await getDictionary(locale);
  const copy = dictionary.about;
  const content = aboutContent[locale];
  const programmes = getPublishedProgrammes();
  const teamPreview = getPublishedTeam().slice(0, 4);
  const teamPhotoOverrides = new Map(
    await Promise.all(
      teamPreview.map(
        async (m) => [m.slug, await getTeamMemberPhotoOverride(m.slug)] as const,
      ),
    ),
  );
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd(
          [
            { label: dictionary.common.home, url: localePath("/", locale) },
            { label: copy.title, url: localePath("/about-us", locale) },
          ],
          site.url,
        )}
      />

      {/* 01 — Institutional hero */}
      <section className="bg-primary py-16 text-white md:py-24">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/80">
            {content.tagline}
          </p>
          <SectionHeader
            level="h1"
            title={copy.title}
            description={content.institutional}
            light
          />
        </Container>
      </section>

      {/* 02 — Why Vantage exists */}
      <section className="py-16 md:py-24">
        <Container>
          <SectionHeader align="left" title={content.whyTitle} />
          <div className="mt-6 max-w-3xl space-y-5 text-lg leading-relaxed text-muted-foreground">
            <p>{content.whyBody[0]}</p>
            <p>{content.whyBody[1]}</p>
          </div>
          <div className="mt-8">
            <Button
              href={localePath("/theory-of-change", locale)}
              variant="outline"
            >
              {content.whyCta}
            </Button>
          </div>
        </Container>
      </section>

      {/* 03 — Our story: prose + evidence-supported timeline only */}
      <section className="bg-surface py-16 md:py-24">
        <Container>
          <SectionHeader
            align="left"
            title={content.storyTitle}
            description={content.storyLead}
          />
          <ol className="mt-12 space-y-0">
            {content.milestones.map((m) => (
              <li
                key={m.year}
                className="relative border-s-2 border-primary/25 pb-10 ps-8 last:pb-0"
              >
                <span
                  className="absolute -start-[9px] top-1 h-4 w-4 rounded-full border-2 border-primary bg-white"
                  aria-hidden="true"
                />
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                  {m.year}
                </p>
                <h3 className="mt-1 text-lg font-semibold">{m.title}</h3>
                <p className="mt-2 max-w-3xl text-muted-foreground">{m.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Mission / vision / values — compact institutional strip */}
      <section className="py-12 md:py-16">
        <Container>
          <div className="grid gap-6 sm:grid-cols-3">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-primary">
                {copy.mission}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {content.mission}
              </p>
            </Card>
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-primary">
                {copy.vision}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {content.vision}
              </p>
            </Card>
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-primary">
                {copy.values}
              </h2>
              <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {content.values.map((value) => (
                  <li key={value} className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {value}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </Container>
      </section>

      {/* 04 — What our identity means */}
      <section className="bg-surface py-16 md:py-24">
        <Container>
          <SectionHeader
            title={content.identityTitle}
            description={content.identityIntro}
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {content.identity.map((item) => (
              <Card key={item.title} className="p-6">
                <h3 className="text-xl font-semibold text-primary">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href={localePath("/impact", locale)}
              className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              {content.identityImpactCta} &rarr;
            </Link>
          </div>
        </Container>
      </section>

      {/* 05 — How Vantage works */}
      <section className="py-16 md:py-24">
        <Container>
          <SectionHeader
            title={content.howTitle}
            description={content.howDescription}
          />
          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {content.howSteps.map((step, i) => (
              <li key={step.title} className="flex flex-col">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <h3 className="mt-3 text-base font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-10 text-center">
            <Button
              href={localePath("/theory-of-change", locale)}
              variant="outline"
            >
              {content.howCta}
            </Button>
          </div>
        </Container>
      </section>

      {/* 06 — Six connected portfolios (canonical programme data) */}
      <section className="bg-surface py-16 md:py-24">
        <Container>
          <SectionHeader
            title={content.portfoliosTitle}
            description={content.portfoliosDescription}
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {programmes.map((prog) => (
              <Card key={prog.slug} className="flex flex-col p-6">
                <h3 className="text-lg font-semibold">
                  <Link
                    href={localePath(`/programmes/${prog.slug}`, locale)}
                    className="hover:text-primary"
                  >
                    {prog.title}
                  </Link>
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {prog.summary}
                </p>
              </Card>
            ))}
          </div>

          {/* Vantage Point — deliberately separate, not a seventh card */}
          <div className="mt-10">
            <Card className="border-dashed p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{content.vpTitle}</h3>
                    <Badge variant="outline">{content.vpStatusLabel}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {content.vpBody}
                  </p>
                </div>
                <Button
                  href={localePath("/programmes/vantage-point", locale)}
                  variant="outline"
                  className="shrink-0"
                >
                  {content.vpCta}
                </Button>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* 07 — Where we work */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <SectionHeader align="left" title={content.geoTitle} />
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {content.geoBody}
              </p>
              <p className="mt-4 text-sm font-medium text-foreground">
                {reachDistricts.map((d) => d.district).join(" · ")}
              </p>
              <Button
                href={localePath("/where-we-work", locale)}
                className="mt-6"
              >
                {content.geoCta}
              </Button>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-8">
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {reachDistricts.map((d) => (
                  <li
                    key={d.district}
                    className="rounded-lg bg-white px-3 py-2 text-center text-sm font-medium text-foreground shadow-sm"
                  >
                    {d.district}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* 08 — Leadership */}
      <section className="bg-surface py-16 md:py-24">
        <Container>
          <SectionHeader title={copy.meetTeam} description={copy.teamDescription} />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {teamPreview.map((member) => (
              <TeamCard
                key={member.slug}
                member={member}
                photoOverrideSrc={teamPhotoOverrides.get(member.slug)?.src}
                locale={locale}
              />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button href={localePath("/about-us/team", locale)} variant="outline">
              {copy.fullTeam}
            </Button>
          </div>
        </Container>
      </section>

      {/* Governance & accountability */}
      <section id="governance" className="scroll-mt-24 py-16 md:py-24">
        <Container>
          <SectionHeader
            title={copy.governanceTitle}
            description={copy.governanceDescription}
          />
          <div className="mt-8 max-w-3xl text-muted-foreground">
            <p>{content.governance[0]}</p>
            <p className="mt-4">{content.governance[1]}</p>
            <p className="mt-4 text-sm">
              {site.legalName} · {dictionary.contact.postalAddress}:{" "}
              {site.contact.postalAddress.display}
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href={localePath("/reports-and-accountability", locale)}
              className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              {dictionary.navigation.reportsAccountability} &rarr;
            </Link>
            <Link
              href={localePath("/safeguarding", locale)}
              className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              {dictionary.common.safeguarding} &rarr;
            </Link>
          </div>
        </Container>
      </section>

      {/* Building toward + conversion */}
      <section className="bg-primary py-16 text-white md:py-24">
        <Container>
          <SectionHeader
            align="left"
            title={content.buildingTitle}
            description={content.buildingBody}
            light
          />
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href={localePath("/partner", locale)} variant="secondary">
              {content.partnerCta}
            </Button>
            <Button
              href={localePath("/donate", locale)}
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              {content.donateCta}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}

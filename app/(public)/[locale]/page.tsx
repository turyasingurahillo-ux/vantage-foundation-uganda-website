import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { ImpactSection } from "@/components/sections/ImpactSection";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { AreasOfWork } from "@/components/sections/AreasOfWork";
import { ChangePathway } from "@/components/sections/ChangePathway";
import { FlagshipProjectSection } from "@/components/sections/FlagshipProjectSection";
import { VantagePointSection } from "@/components/sections/VantagePointSection";
import { FeaturedImpactStory } from "@/components/sections/FeaturedImpactStory";
import { AccountabilitySection } from "@/components/sections/AccountabilitySection";
import { PartnersSection } from "@/components/sections/PartnersSection";
import { NewsletterSection } from "@/components/sections/NewsletterSection";
import { FinalCta } from "@/components/sections/FinalCta";
import { createPublicMetadata } from "@/lib/metadata";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/params";
import { homepageSectionContent } from "@/lib/i18n/page-content";

export async function generateMetadata({
  params,
}: {
  params: LocaleParams;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const dictionary = await getDictionary(locale);
  return createPublicMetadata({
    title: `${dictionary.home.heroTitle} | Vantage Foundation Uganda`,
    description: dictionary.home.heroDescription,
    path: "/",
    locale,
  });
}

export const revalidate = 3600;

export default async function Home({ params }: { params: LocaleParams }) {
  const locale = await resolveLocale(params);
  const dictionary = await getDictionary(locale);
  const sections = homepageSectionContent[locale];
  return (
    <>
      {/* 01 — Identity */}
      <Hero locale={locale} dictionary={dictionary} />
      {/* 02 — Proof */}
      <TrustStrip copy={sections.trust} />
      <ImpactSection locale={locale} copy={sections.impact} />
      {/* 03 — Problem */}
      <ProblemSection copy={sections.problem} />
      {/* 04 — Portfolio preview (six-portfolio model lands in PR-3) */}
      <AreasOfWork locale={locale} dictionary={dictionary} />
      {/* 05 — How change happens (full Theory of Change page lands in PR-4) */}
      <ChangePathway locale={locale} copy={sections.pathway} />
      {/* 06 — Flagship work */}
      <FlagshipProjectSection locale={locale} copy={sections.flagship} />
      {/* 07 — Vantage Point (dedicated route lands in PR-3) */}
      <VantagePointSection locale={locale} copy={sections.vantagePoint} />
      {/* 08 — One human story */}
      <FeaturedImpactStory locale={locale} copy={sections.stories} />
      {/* 09 — Accountability */}
      <AccountabilitySection locale={locale} copy={sections.accountability} />
      {/* 10 — Partners */}
      <PartnersSection copy={sections.partners} />
      {/* 11 — Conversion: Partner + Donate */}
      <FinalCta locale={locale} dictionary={dictionary} />
      <NewsletterSection locale={locale} dictionary={dictionary} />
    </>
  );
}

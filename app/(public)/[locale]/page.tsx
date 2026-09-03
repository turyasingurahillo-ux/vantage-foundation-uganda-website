import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { ImpactSection } from "@/components/sections/ImpactSection";
import { AreasOfWork } from "@/components/sections/AreasOfWork";
import { FlagshipProjectSection } from "@/components/sections/FlagshipProjectSection";
import { FeaturedImpactStory } from "@/components/sections/FeaturedImpactStory";
import { UgandaReachMap } from "@/components/sections/UgandaReachMap";
import { InstagramSection } from "@/components/sections/InstagramSection";
import { PartnersSection } from "@/components/sections/PartnersSection";
import { NewsletterSection } from "@/components/sections/NewsletterSection";
import { FinalCta } from "@/components/sections/FinalCta";
import { AboutTeaser } from "@/components/sections/AboutTeaser";
import { StoriesSection } from "@/components/sections/StoriesSection";
import { GetInvolvedSection } from "@/components/sections/GetInvolvedSection";
import { LazySection } from "@/components/shared/LazySection";
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
      <Hero locale={locale} dictionary={dictionary} />
      <TrustStrip copy={sections.trust} />
      <ImpactSection locale={locale} copy={sections.impact} />
      <AreasOfWork locale={locale} dictionary={dictionary} />
      <FlagshipProjectSection locale={locale} copy={sections.flagship} />
      <AboutTeaser locale={locale} copy={sections.about} />
      <LazySection
        placeholderHeight="600px"
        rootMargin="300px"
        className="bg-white"
        dataTestId="uganda-reach-map-section"
      >
        <UgandaReachMap locale={locale} />
      </LazySection>
      <FeaturedImpactStory locale={locale} copy={sections.stories} />
      <StoriesSection locale={locale} copy={sections.stories} />
      <InstagramSection copy={sections.instagram} locale={locale} />
      <PartnersSection copy={sections.partners} />
      <GetInvolvedSection locale={locale} copy={sections.involved} />
      <FinalCta locale={locale} dictionary={dictionary} />
      <NewsletterSection locale={locale} dictionary={dictionary} />
    </>
  );
}

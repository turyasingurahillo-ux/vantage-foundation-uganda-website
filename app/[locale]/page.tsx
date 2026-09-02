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

export const metadata: Metadata = createPublicMetadata({
  title: "Vantage Foundation Uganda | Community-led impact",
  description:
    "Vantage Foundation Uganda is a youth-led nonprofit improving access to health, education, clean water and humanitarian support in underserved Ugandan communities.",
  path: "/",
});

export const revalidate = 3600;

export default function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <ImpactSection />
      <AreasOfWork />
      <FlagshipProjectSection />
      <AboutTeaser />
      <LazySection
        placeholderHeight="600px"
        rootMargin="300px"
        className="bg-white"
      >
        <UgandaReachMap />
      </LazySection>
      <FeaturedImpactStory />
      <StoriesSection />
      <InstagramSection />
      <PartnersSection />
      <GetInvolvedSection />
      <FinalCta />
      <NewsletterSection />
    </>
  );
}

import type { Partner } from "@/types";
import { getPublishedPartners } from "@/content/partners";
import { getPublishedLogos } from "@/lib/media-public";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { PartnerCard } from "@/components/shared/PartnerCard";
import type { HomepageSectionContent } from "@/lib/i18n/page-content";

export async function PartnersSection({ copy }: { copy: HomepageSectionContent["partners"] }) {
  // Static partners form the canonical source. Any logo uploaded via /admin/media
  // overrides or supplements the same partner by name, but never duplicates it.
  const staticPartners = getPublishedPartners();
  const uploadedLogos = await getPublishedLogos();
  const byName = new Map<string, Partner>();

  for (const partner of staticPartners) {
    byName.set(partner.name, partner);
  }

  for (const uploaded of uploadedLogos) {
    const existing = byName.get(uploaded.name);
    if (existing) {
      byName.set(uploaded.name, {
        ...existing,
        logo: uploaded.logo ?? existing.logo,
        logoAlt: uploaded.logoAlt ?? existing.logoAlt,
      });
    } else {
      byName.set(uploaded.name, uploaded);
    }
  }

  const partners = [...byName.values()];

  return (
    <section className="py-16 md:py-24 lg:py-32">
      <Container>
        <SectionHeader
          eyebrow={copy.eyebrow} title={copy.title} description={copy.description}
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {partners.map((partner) => (
            <PartnerCard key={partner.name} partner={partner} />
          ))}
        </div>
      </Container>
    </section>
  );
}

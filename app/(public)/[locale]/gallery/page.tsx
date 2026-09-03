import type { Metadata } from "next";
import { getPublishedMedia } from "@/content/media";
import { getPublishedGalleryMedia } from "@/lib/media-public";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { createPublicMetadata } from "@/lib/metadata";
import { resolveLocale } from "@/lib/i18n/params";
import { localePath } from "@/lib/i18n/config";
import { getPageContent } from "@/lib/i18n/content/pages";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const p = getPageContent(locale).gallery;
  return createPublicMetadata({
    title: p.title,
    description: p.description,
    path: "/gallery",
    locale,
    contentLocalized: false,
  });
}

export const revalidate = 3600;

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  const p = getPageContent(locale);
  const d = await getDictionary(locale);
  const uploaded = await getPublishedGalleryMedia();
  const images = [...uploaded, ...getPublishedMedia()];

  return (
    <>
      <section className="bg-primary py-16 text-white md:py-24">
        <Container>
          <SectionHeader
            level="h1"
            title={p.gallery.title}
            description={p.gallery.description}
            light
          />
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <Breadcrumbs
            className="mb-8"
            items={[
              { label: d.common.home, href: localePath("/", locale) },
              { label: p.gallery.title },
            ]}
            locale={locale}
          />
          <GalleryGrid images={images} />
        </Container>
      </section>
    </>
  );
}

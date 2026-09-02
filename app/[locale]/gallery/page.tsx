import type { Metadata } from "next";
import { getPublishedMedia } from "@/content/media";
import { getPublishedGalleryMedia } from "@/lib/media-public";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { createPublicMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPublicMetadata({
  title: "Gallery",
  description:
    "Photos from Vantage Foundation Uganda's water, education, health and community programmes.",
  path: "/gallery",
});

// Refreshes admin-uploaded photos periodically without a full redeploy.
export const revalidate = 3600;

export default async function GalleryPage() {
  // Static, pre-processed photos plus anything an admin has since uploaded
  // via /admin/media (newest uploads first).
  const uploaded = await getPublishedGalleryMedia();
  const images = [...uploaded, ...getPublishedMedia()];

  return (
    <>
      <section className="bg-primary py-16 text-white md:py-24">
        <Container>
          <SectionHeader
            level="h1"
            title="Gallery"
            description="Moments from our boreholes, schools and community programmes across Uganda."
            light
          />
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <GalleryGrid images={images} />
        </Container>
      </section>
    </>
  );
}

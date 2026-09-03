import { site } from "@/content/site";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/Button";
import { ImageOrPlaceholder } from "@/components/shared/ImageOrPlaceholder";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { I18nDictionary } from "@/lib/i18n/dictionaries";

export function Hero({ locale, dictionary }: { locale: Locale; dictionary: I18nDictionary }) {
  const home = dictionary.home;
  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden" aria-label={home.heroEyebrow}>
      <div className="absolute inset-0">
        <ImageOrPlaceholder
          src="/images/photos/photo-014.webp"
          alt="A crowd gathers on a street to greet visiting volunteers in matching branded t-shirts and traditional grass skirts."
          fill preload sizes="100vw" objectPosition="center 30%" preset="hero" containerClassName="h-full w-full"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/70 to-navy/30" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-navy/20" aria-hidden="true" />
      <Container className="relative z-10 max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-white/80">{site.name} — {home.heroEyebrow}</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">{home.heroTitle}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/90 md:text-xl">{home.heroDescription}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button href={localePath("/donate", locale)} size="lg">{home.donateNow}</Button>
          <Button href={localePath("/impact", locale)} variant="outline" size="lg" className="border-white bg-white/10 text-white hover:bg-white/20">
            {home.ourImpact}
          </Button>
        </div>
      </Container>
    </section>
  );
}

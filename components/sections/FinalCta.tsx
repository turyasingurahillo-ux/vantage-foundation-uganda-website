import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/Button";
import { BrandPattern } from "@/components/shared/BrandPattern";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { I18nDictionary } from "@/lib/i18n/dictionaries";

export function FinalCta({ locale, dictionary }: { locale: Locale; dictionary: I18nDictionary }) {
  const home = dictionary.home;
  return (
    <section className="relative overflow-hidden bg-navy py-16 text-white md:py-24">
      <BrandPattern variant="topographic" color="var(--deep-teal)" opacity={0.1} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--deep-teal) 0%, transparent 70%)" }}
      />
      <Container className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-deep-teal" aria-hidden="true" />
            <p className="text-sm font-semibold uppercase tracking-wider text-white/90">
              {home.joinUs}
            </p>
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {home.finalTitle}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/80">
            {home.finalDescription}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href={localePath("/donate", locale)} size="lg">
              {home.donateNow}
            </Button>
            <Button
              href={localePath("/get-involved", locale)}
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10"
            >
              {dictionary.navigation.getInvolved}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

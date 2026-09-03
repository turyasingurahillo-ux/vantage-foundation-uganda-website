import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { NewsletterForm } from "@/components/shared/NewsletterForm";
import { BrandPattern } from "@/components/shared/BrandPattern";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { I18nDictionary } from "@/lib/i18n/dictionaries";

export function NewsletterSection({ locale, dictionary }: { locale: Locale; dictionary: I18nDictionary }) {
  return (
    <section className="relative overflow-hidden bg-primary py-16 text-white md:py-24">
      <BrandPattern variant="waves" color="var(--bright-aqua)" opacity={0.1} />
      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <SectionHeader
            title={dictionary.home.stayInLoop}
            description={dictionary.home.stayDescription}
            light
          />
          <div className="mt-8 mx-auto max-w-md">
            <NewsletterForm light dictionary={dictionary.forms} privacyLabel={dictionary.common.privacy} privacyHref={localePath("/privacy", locale)} />
          </div>
        </div>
      </Container>
    </section>
  );
}

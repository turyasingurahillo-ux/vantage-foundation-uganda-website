import type { Metadata } from "next";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { JsonLd, buildFaqJsonLd } from "@/components/shared/JsonLd";
import { createPublicMetadata } from "@/lib/metadata";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/params";
import { engagementContent } from "@/lib/i18n/content/engagement";

export async function generateMetadata({
  params,
}: {
  params: LocaleParams;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const content = engagementContent[locale].faq;
  return createPublicMetadata({
    title: content.title,
    description: content.description,
    path: "/faq",
    locale,
    contentLocalized: true,
  });
}

export default async function FaqPage({
  params,
}: {
  params: LocaleParams;
}) {
  const locale = await resolveLocale(params);
  const content = engagementContent[locale].faq;

  return (
    <>
      <JsonLd data={buildFaqJsonLd(content.items)} />
      <section className="bg-primary py-16 text-white md:py-24">
        <Container>
          <SectionHeader
            level="h1"
            title={content.heroTitle}
            description={content.heroDescription}
            light
          />
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container className="max-w-3xl">
          <div className="space-y-4">
            {content.items.map((item, index) => {
              const summaryId = `faq-summary-${index}`;
              const contentId = `faq-content-${index}`;
              return (
                <details
                  key={item.id}
                  className="group rounded-xl border border-border bg-white p-6 open:shadow-sm"
                >
                  <summary
                    id={summaryId}
                    className="flex cursor-pointer list-none items-center justify-between text-lg font-semibold"
                  >
                    {item.question}
                    <span className="ml-4 text-primary transition-transform group-open:rotate-180" aria-hidden="true">
                      &#x25BC;
                    </span>
                  </summary>
                  <p
                    id={contentId}
                    aria-labelledby={summaryId}
                    className="mt-4 leading-relaxed text-muted-foreground"
                  >
                    {item.answer}
                  </p>
                </details>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}

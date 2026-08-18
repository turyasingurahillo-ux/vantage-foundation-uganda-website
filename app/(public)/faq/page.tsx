import type { Metadata } from "next";
import { faq } from "@/content/faq";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { JsonLd, buildFaqJsonLd } from "@/components/shared/JsonLd";
import { createPublicMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPublicMetadata({
  title: "FAQ",
  description: "Frequently asked questions about Vantage Foundation Uganda, our work, donations and partnerships.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <JsonLd data={buildFaqJsonLd(faq)} />
      <section className="bg-primary py-16 text-white md:py-24">
        <Container>
          <SectionHeader
            level="h1"
            title="Frequently Asked Questions"
            description="Answers to common questions about our work and how to get involved."
            light
          />
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container className="max-w-3xl">
          <div className="space-y-4">
            {faq.map((item, index) => {
              const summaryId = `faq-summary-${index}`;
              const contentId = `faq-content-${index}`;
              return (
                <details
                  key={index}
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

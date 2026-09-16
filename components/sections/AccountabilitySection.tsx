import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { HomepageSectionContent } from "@/lib/i18n/page-content";

/**
 * Homepage block 09 — accountability and trust. Links only to real, existing
 * routes and describes publication status honestly (no reports are implied
 * published before approval).
 */
export function AccountabilitySection({
  locale,
  copy,
}: {
  locale: Locale;
  copy: HomepageSectionContent["accountability"];
}) {
  return (
    <section className="bg-surface py-16 md:py-24 lg:py-32">
      <Container>
        <SectionHeader
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {copy.items.map((item) => (
            <Link
              key={item.href}
              href={localePath(item.href, locale)}
              className="group block rounded-xl border border-border bg-white p-6 transition-shadow hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                {copy.learnMore}
                <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-muted-foreground">
          {copy.closing}{" "}
          <Link
            href={localePath("/contact", locale)}
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            {copy.contactCta}
          </Link>
        </p>
      </Container>
    </section>
  );
}

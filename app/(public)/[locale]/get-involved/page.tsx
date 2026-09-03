import type { Metadata } from "next";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ContactForm } from "@/components/shared/ContactForm";
import {
  Heart,
  HandHelping,
  Handshake,
  Megaphone,
  Users,
  Briefcase,
} from "lucide-react";
import { createPublicMetadata } from "@/lib/metadata";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/params";
import { engagementContent, type InvolvementPathway } from "@/lib/i18n/content/engagement";
import { localePath } from "@/lib/i18n/config";

const pathwayIcons: Record<InvolvementPathway["id"], typeof Heart> = {
  donate: Heart,
  volunteer: HandHelping,
  partner: Handshake,
  sponsor: Megaphone,
  collaborate: Users,
  csr: Briefcase,
};

export async function generateMetadata({
  params,
}: {
  params: LocaleParams;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const content = engagementContent[locale].getInvolved;
  return createPublicMetadata({
    title: content.title,
    description: content.description,
    path: "/get-involved",
    locale,
    contentLocalized: true,
  });
}

export default async function GetInvolvedPage({
  params,
}: {
  params: LocaleParams;
}) {
  const locale = await resolveLocale(params);
  const dictionary = await getDictionary(locale);
  const content = engagementContent[locale].getInvolved;

  return (
    <>
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
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {content.pathways.map((path) => {
              const Icon = pathwayIcons[path.id];
              return (
                <Card key={path.id} id={path.id} className="flex flex-col p-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h2 className="mt-4 text-xl font-semibold">{path.title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {path.description}
                  </p>
                  <Button href={localePath(path.ctaHref, locale)} variant="outline" className="mt-6">
                    {path.ctaLabel}
                  </Button>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="bg-surface py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-2xl">
            <SectionHeader
              title={content.reachOutTitle}
              description={content.reachOutDescription}
            />
            <div className="mt-8 rounded-xl bg-white p-6 shadow-sm md:p-8">
              <ContactForm
                dictionary={dictionary.forms}
                locale={locale}
                privacyLabel={dictionary.common.privacy}
              />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { HeartHandshake } from "lucide-react";
import { site } from "@/content/site";
import { getPublishedPartners } from "@/content/partners";
import { getPublishedLogos } from "@/lib/media-public";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ImageOrPlaceholder } from "@/components/shared/ImageOrPlaceholder";
import { ContactForm } from "@/components/shared/ContactForm";
import { createPublicMetadata } from "@/lib/metadata";
import { resolveCategoryFromQuery } from "@/lib/contact-categories";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/params";
import { engagementContent } from "@/lib/i18n/content/engagement";
import { localePath } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: LocaleParams;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const content = engagementContent[locale].donorsAndSponsors;
  return createPublicMetadata({
    title: content.title,
    description: content.description.replace("{name}", site.name),
    path: "/donors-and-sponsors",
    locale,
    contentLocalized: true,
  });
}

// Lets an admin recognise a new donor/sponsor via /admin/media without a
// code deploy — refreshes periodically well within the presigned URL TTL.
export const revalidate = 3600;

export default async function DonorsAndSponsorsPage({
  params,
}: {
  params: LocaleParams;
}) {
  const locale = await resolveLocale(params);
  const dictionary = await getDictionary(locale);
  const content = engagementContent[locale].donorsAndSponsors;

  const uploadedLogos = await getPublishedLogos();
  const recognized = [...uploadedLogos, ...getPublishedPartners()];

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
          <div className="max-w-3xl">
            <p className="text-lg leading-relaxed text-muted-foreground">
              {content.intro.replace("{name}", site.name)}
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {content.categories.map((cat) => (
              <Card key={cat.name} className="p-6">
                <h3 className="text-base font-semibold text-primary">{cat.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{cat.description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-surface py-16 md:py-24">
        <Container>
          <SectionHeader
            title={content.recognisedTitle}
            description={content.recognisedDescription}
          />

          {recognized.length > 0 ? (
            <div className="mt-12 space-y-12">
              {/* Group contributors by relationship type */}
              {Object.entries(
                recognized.reduce((groups, partner) => {
                  const type = partner.relationshipType ?? "Other";
                  if (!groups[type]) groups[type] = [];
                  groups[type].push(partner);
                  return groups;
                }, {} as Record<string, typeof recognized>),
              ).map(([type, partners]) => (
                <div key={type}>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
                    {(content.relationshipTypeLabels[type] ??
                      (type === "Other" ? content.otherRelationshipType : type))}
                  </h3>
                  <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {partners.map((partner) => (
                      <Card key={partner.name} className="flex flex-col items-center p-6 text-center">
                        <div className="flex h-20 w-full items-center justify-center rounded-lg border border-border bg-white px-4">
                          {partner.logo ? (
                            <ImageOrPlaceholder
                              src={partner.logo}
                              alt={partner.logoAlt ?? `${partner.name} ${content.logoAltSuffix}`}
                              fill
                              preset="card"
                              containerClassName="h-14 w-36"
                            />
                          ) : (
                            <span className="text-lg font-bold text-primary">
                              {partner.name}
                            </span>
                          )}
                        </div>
                        <h4 className="mt-4 text-lg font-semibold">{partner.name}</h4>
                        <p className="mt-2 text-sm text-muted-foreground">{partner.description}</p>
                        {partner.url && (
                          <a
                            href={partner.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                          >
                            {content.visitWebsite}
                          </a>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mx-auto mt-12 max-w-md text-center">
              <HeartHandshake className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden="true" />
              <p className="mt-4 text-muted-foreground">
                {content.emptyState}
              </p>
            </div>
          )}
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold">{content.policyTitle}</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {content.policyBody}
              </p>
              <h2 className="mt-10 text-2xl font-bold">{content.sponsorTitle}</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {content.sponsorBody}
              </p>
              <Button href={localePath("/donate", locale)} size="lg" className="mt-6">
                {content.donateCta}
              </Button>
            </div>

            <Card className="p-6 md:p-8">
              <h2 className="text-xl font-semibold">{content.contactTitle}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {content.contactDescription}
              </p>
              <div className="mt-6">
                <ContactForm
                  defaultSubject={resolveCategoryFromQuery("sponsor")}
                  dictionary={dictionary.forms}
                  locale={locale}
                  privacyLabel={dictionary.common.privacy}
                />
              </div>
            </Card>
          </div>
        </Container>
      </section>
    </>
  );
}

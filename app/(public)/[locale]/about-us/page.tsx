import type { Metadata } from "next";
import { getPublishedTeam } from "@/content/team";
import { getTeamMemberPhotoOverride } from "@/lib/media-public";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ImageOrPlaceholder } from "@/components/shared/ImageOrPlaceholder";
import { Card } from "@/components/ui/Card";
import { TeamCard } from "@/components/shared/TeamCard";
import { Button } from "@/components/ui/Button";
import { createPublicMetadata } from "@/lib/metadata";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/params";
import { aboutContent } from "@/lib/i18n/page-content";
import { localePath } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: LocaleParams;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const dictionary = await getDictionary(locale);
  return createPublicMetadata({
    title: dictionary.about.title,
    description: dictionary.about.description,
    path: "/about-us",
    locale,
  });
}

// Lets an admin update a team member's photo via /admin/media without a
// code deploy — refreshes periodically well within the presigned URL TTL.
export const revalidate = 3600;

export default async function AboutPage({ params }: { params: LocaleParams }) {
  const locale = await resolveLocale(params);
  const dictionary = await getDictionary(locale);
  const copy = dictionary.about;
  const content = aboutContent[locale];
  const teamPreview = getPublishedTeam().slice(0, 4);
  const teamPhotoOverrides = new Map(
    await Promise.all(
      teamPreview.map(
        async (m) => [m.slug, await getTeamMemberPhotoOverride(m.slug)] as const,
      ),
    ),
  );
  return (
    <>
      <section className="bg-primary py-16 text-white md:py-24">
        <Container>
          <SectionHeader
            level="h1"
            title={copy.title}
            description={copy.description}
            light
          />
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {content.intro[0]}
              </p>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                {content.intro[1]}
              </p>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <ImageOrPlaceholder
                src="/images/photos/photo-066.webp"
                alt={content.imageAlt}
                fill
                preset="half"
                containerClassName="h-full w-full"
              />
            </div>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-primary">{copy.mission}</h2>
              <p className="mt-3 text-muted-foreground">{content.mission}</p>
            </Card>
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-primary">{copy.vision}</h2>
              <p className="mt-3 text-muted-foreground">{content.vision}</p>
            </Card>
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-primary">{copy.values}</h2>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                {content.values.map((value) => (
                  <li key={value} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    {value}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </Container>
      </section>

      <section className="bg-surface py-16 md:py-24">
        <Container>
          <SectionHeader
            title={copy.whoWeServe}
            description={copy.whoWeServeDescription}
          />
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold">{copy.targetBeneficiaries}</h3>
              <ul className="mt-4 space-y-2 text-muted-foreground">
                {content.beneficiaries.map((beneficiary) => <li key={beneficiary}>{beneficiary}</li>)}
              </ul>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold">{copy.approach}</h3>
              <p className="mt-4 text-muted-foreground">
                {content.approach}
              </p>
            </Card>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <SectionHeader title={copy.meetTeam} description={copy.teamDescription} />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {teamPreview.map((member) => (
              <TeamCard
                key={member.slug}
                member={member}
                photoOverrideSrc={teamPhotoOverrides.get(member.slug)?.src}
                locale={locale}
              />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button href={localePath("/about-us/team", locale)} variant="outline">
              {copy.fullTeam}
            </Button>
          </div>
        </Container>
      </section>

      <section className="bg-surface py-16 md:py-24">
        <Container>
          <SectionHeader
            title={copy.governanceTitle}
            description={copy.governanceDescription}
          />
          <div className="mt-8 max-w-3xl text-muted-foreground">
            <p>
              {content.governance[0]}
            </p>
            <p className="mt-4">
              {content.governance[1]}
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}

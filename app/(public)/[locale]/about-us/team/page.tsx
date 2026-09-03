import type { Metadata } from "next";
import { getLeadership, getVolunteers } from "@/content/team";
import { getTeamMemberPhotoOverride } from "@/lib/media-public";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { TeamCard } from "@/components/shared/TeamCard";
import { Button } from "@/components/ui/Button";
import { createPublicMetadata } from "@/lib/metadata";
import { resolveLocale } from "@/lib/i18n/params";
import { localePath } from "@/lib/i18n/config";
import { getPageContent } from "@/lib/i18n/content/pages";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const p = getPageContent(locale).team;
  return createPublicMetadata({
    title: p.title,
    description: p.description,
    path: "/about-us/team",
    locale,
    contentLocalized: false,
  });
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveLocale(params);
  const p = getPageContent(locale);
  const d = await getDictionary(locale);
  const leadership = getLeadership();
  const volunteers = getVolunteers();
  const allMembers = [...leadership, ...volunteers];
  const overrides = new Map(
    await Promise.all(
      allMembers.map(
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
            title={p.team.title}
            description={p.team.description}
            light
          />
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <Breadcrumbs
            className="mb-4"
            items={[
              { label: d.common.home, href: localePath("/", locale) },
              { label: p.common.aboutUs, href: localePath("/about-us", locale) },
              { label: p.team.title },
            ]}
            locale={locale}
          />
          <p className="max-w-2xl text-muted-foreground">{p.team.description}</p>
        </Container>
      </section>

      <section className="pb-4">
        <Container>
          <SectionHeader
            title={p.team.executive}
            description={p.team.executiveDescription}
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {leadership.map((member) => (
              <TeamCard
                key={member.slug}
                member={member}
                photoOverrideSrc={overrides.get(member.slug)?.src}
                locale={locale}
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <SectionHeader
            title={p.team.volunteers}
            description={p.team.volunteersDescription}
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {volunteers.map((member) => (
              <TeamCard
                key={member.slug}
                member={member}
                photoOverrideSrc={overrides.get(member.slug)?.src}
                locale={locale}
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-surface py-16 md:py-24">
        <Container>
          <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-primary p-8 text-white md:flex-row md:p-12">
            <div>
              <h2 className="text-2xl font-bold">{p.team.joinTitle}</h2>
              <p className="mt-2 max-w-xl text-white/90">{p.team.joinDescription}</p>
            </div>
            <div className="flex flex-shrink-0 flex-col gap-3 sm:flex-row">
              <Button href={localePath("/get-involved", locale)} variant="secondary">
                {p.team.volunteerCta}
              </Button>
              <Button href={localePath("/donate", locale)} variant="outline" className="border-white text-white hover:bg-white/10">
                {p.team.donateCta}
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

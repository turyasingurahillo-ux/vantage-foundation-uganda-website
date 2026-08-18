import type { Metadata } from "next";
import { site } from "@/content/site";
import { getPublishedTeam } from "@/content/team";
import { getTeamMemberPhotoOverride } from "@/lib/media-public";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ImageOrPlaceholder } from "@/components/shared/ImageOrPlaceholder";
import { Card } from "@/components/ui/Card";
import { TeamCard } from "@/components/shared/TeamCard";
import { Button } from "@/components/ui/Button";
import { createPublicMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPublicMetadata({
  title: "About Us",
  description: `Learn about ${site.name}'s mission, vision, values and youth-led approach to community development in Uganda.`,
  path: "/about-us",
});

// Lets an admin update a team member's photo via /admin/media without a
// code deploy — refreshes periodically well within the presigned URL TTL.
export const revalidate = 3600;

export default async function AboutPage() {
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
            title="About Vantage Foundation Uganda"
            description="Youth-led, community-centred and committed to one more advantage at a time."
            light
          />
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Vantage Foundation Uganda is a youth-led nonprofit established in December
                2020. Our story is just like any other for young people: our lives started
                small and, just like a forest fire, just one match will do the job. We are a
                work in progress that holds a candle for those younger than us because we can
                relate — and through this we have become revolutionaries.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                We envision improved livelihoods in communities in Uganda and Africa. Today,
                our focus is assisting young people in Uganda to achieve their full potential
                through health, education, humanitarian aid and water, sanitation and hygiene.
              </p>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <ImageOrPlaceholder
                src="/images/photos/photo-066.webp"
                alt="Vantage Foundation Uganda community work"
                fill
                preset="half"
                containerClassName="h-full w-full"
              />
            </div>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-primary">Mission</h2>
              <p className="mt-3 text-muted-foreground">{site.mission}</p>
            </Card>
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-primary">Vision</h2>
              <p className="mt-3 text-muted-foreground">{site.vision}</p>
            </Card>
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-primary">Values</h2>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                {site.values.map((value) => (
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
            title="Who we serve"
            description="We focus on the people and places often left out of mainstream development."
          />
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold">Target beneficiaries</h3>
              <ul className="mt-4 space-y-2 text-muted-foreground">
                <li>Youth in rural areas</li>
                <li>Women and girls</li>
                <li>Children and orphans</li>
                <li>People in remote districts and urban informal settlements (slums)</li>
              </ul>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold">Our approach</h3>
              <p className="mt-4 text-muted-foreground">
                We identify districts and communities that are often overlooked by larger
                international NGOs and magnify the reach of existing social safety nets. We
                recognise that development is sequential: without health and nutrition,
                education cannot be absorbed; without education, poverty cannot be escaped.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <SectionHeader title="Meet the team" description="Youth-led and volunteer-driven." />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {teamPreview.map((member) => (
              <TeamCard
                key={member.slug}
                member={member}
                photoOverrideSrc={teamPhotoOverrides.get(member.slug)?.src}
              />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button href="/about-us/team" variant="outline">
              Meet the full team
            </Button>
          </div>
        </Container>
      </section>

      <section className="bg-surface py-16 md:py-24">
        <Container>
          <SectionHeader
            title="Governance and accountability"
            description="We are working towards the highest standards of transparency and safeguarding."
          />
          <div className="mt-8 max-w-3xl text-muted-foreground">
            <p>
              Vantage Foundation Uganda operates on a 100% volunteer basis with zero salary
              overhead. As we grow, we are formalising governance structures, safeguarding
              policies and financial reporting so that every donor, partner and community can
              trust how resources are used.
            </p>
            <p className="mt-4">
              Annual reports, financial statements and project reports will be published on our
              Reports and Accountability page.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}

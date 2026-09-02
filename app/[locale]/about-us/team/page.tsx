import type { Metadata } from "next";
import { site } from "@/content/site";
import { getLeadership, getVolunteers } from "@/content/team";
import { getTeamMemberPhotoOverride } from "@/lib/media-public";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { TeamCard } from "@/components/shared/TeamCard";
import { Button } from "@/components/ui/Button";
import { createPublicMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPublicMetadata({
  title: "Our Team",
  description: `Meet the leadership and volunteers behind ${site.name}.`,
  path: "/about-us/team",
});

// Lets an admin update a team member's photo via /admin/media without a
// code deploy — refreshes periodically well within the presigned URL TTL.
export const revalidate = 3600;

export default async function TeamPage() {
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
            title="Our Team"
            description="A youth-led, volunteer-driven team working across health, education and humanitarian action in Uganda."
            light
          />
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <Breadcrumbs
            className="mb-4"
            items={[
              { label: "Home", href: "/" },
              { label: "About Us", href: "/about-us" },
              { label: "Our Team" },
            ]}
          />
          <p className="max-w-2xl text-muted-foreground">
            {site.name} operates on a 100% volunteer basis. The people below
            lead our strategy, coordinate our field operations, and give
            their clinical, technical and organisational expertise to make
            our programmes possible.
          </p>
        </Container>
      </section>

      <section className="pb-4">
        <Container>
          <SectionHeader
            title="Executive leadership"
            description="Strategic direction and day-to-day operations."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {leadership.map((member) => (
              <TeamCard
                key={member.slug}
                member={member}
                photoOverrideSrc={overrides.get(member.slug)?.src}
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <SectionHeader
            title="Volunteers and technical contributors"
            description="Clinical, technical and field expertise, contributed voluntarily."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {volunteers.map((member) => (
              <TeamCard
                key={member.slug}
                member={member}
                photoOverrideSrc={overrides.get(member.slug)?.src}
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-surface py-16 md:py-24">
        <Container>
          <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-primary p-8 text-white md:flex-row md:p-12">
            <div>
              <h2 className="text-2xl font-bold">Join our team</h2>
              <p className="mt-2 max-w-xl text-white/90">
                We&rsquo;re always glad to hear from volunteers, professionals and
                partners who want to contribute their time or expertise.
              </p>
            </div>
            <div className="flex flex-shrink-0 flex-col gap-3 sm:flex-row">
              <Button href="/get-involved" variant="secondary">
                Volunteer or partner with us
              </Button>
              <Button href="/donate" variant="outline" className="border-white text-white hover:bg-white/10">
                Donate
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

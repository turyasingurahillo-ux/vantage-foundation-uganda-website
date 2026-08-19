import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Mail, ExternalLink } from "lucide-react";
import { site } from "@/content/site";
import { getTeamBySlug, getTeamSlugs, getPublishedTeam } from "@/content/team";
import { getTeamMemberPhotoOverride } from "@/lib/media-public";
import { Container } from "@/components/shared/Container";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ImageOrPlaceholder } from "@/components/shared/ImageOrPlaceholder";
import { Button } from "@/components/ui/Button";
import { JsonLd, buildBreadcrumbJsonLd } from "@/components/shared/JsonLd";
import { createPublicMetadata } from "@/lib/metadata";

// Lets an admin update a team member's photo via /admin/media without a
// code deploy — refreshes periodically well within the presigned URL TTL.
export const revalidate = 3600;

export async function generateStaticParams() {
  return getTeamSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const member = getTeamBySlug(slug);
  if (!member) return {};
  return createPublicMetadata({
    title: member.displayName,
    description: member.shortBio,
    path: `/about-us/team/${slug}`,
    image: `${member.image}-portrait.webp`,
  });
}

export default async function TeamMemberPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const member = getTeamBySlug(slug);

  if (!member || (process.env.NODE_ENV === "production" && !member.published)) {
    notFound();
  }

  const others = getPublishedTeam().filter((m) => m.slug !== member.slug);
  const photoOverride = await getTeamMemberPhotoOverride(member.slug);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd(
          [
            { label: "Home", url: "/" },
            { label: "About Us", url: "/about-us" },
            { label: "Our Team", url: "/about-us/team" },
            { label: member.displayName, url: `/about-us/team/${slug}` },
          ],
          site.url
        )}
      />

      <section className="py-12 md:py-16">
        <Container>
          <Breadcrumbs
            className="mb-8"
            items={[
              { label: "Home", href: "/" },
              { label: "About Us", href: "/about-us" },
              { label: "Our Team", href: "/about-us/team" },
              { label: member.displayName },
            ]}
          />

          <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
            <div>
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                <ImageOrPlaceholder
                  src={photoOverride?.src ?? `${member.image}-portrait.webp`}
                  alt={photoOverride?.alt || member.imageAlt}
                  fill
                  preload
                  preset="half"
                  containerClassName="h-full w-full"
                />
              </div>
              {(member.email || member.linkedin) && (
                <div className="mt-4 flex gap-3">
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Mail className="h-4 w-4" /> Email
                    </a>
                  )}
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" /> LinkedIn
                    </a>
                  )}
                </div>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {member.displayName}
              </h1>
              <p className="mt-2 text-lg text-primary">{member.role}</p>
              <p className="mt-6 max-w-2xl leading-relaxed text-muted-foreground">
                {member.fullBio}
              </p>

              {member.citations && member.citations.length > 0 && (
                <div className="mt-4 max-w-2xl">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Sources
                  </h2>
                  <ul className="mt-2 space-y-1">
                    {member.citations.map((c) => (
                      <li key={c.url}>
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5 shrink-0" /> {c.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-10 rounded-xl bg-primary p-8 text-white">
                <h2 className="text-xl font-bold">Support this work</h2>
                <p className="mt-2 text-white/90">
                  Help {site.name} continue its health, education and
                  humanitarian programmes.
                </p>
                <Button href="/donate" variant="secondary" className="mt-6">
                  Donate now
                </Button>
              </div>
            </div>
          </div>

          {others.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold">Meet the rest of the team</h2>
              <div className="mt-6 flex flex-wrap gap-3">
                {others.map((m) => (
                  <Link
                    key={m.slug}
                    href={`/about-us/team/${m.slug}`}
                    className="rounded-full border border-border bg-white px-4 py-2 text-sm hover:border-primary hover:text-primary"
                  >
                    {m.displayName}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}

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
import { resolveLocale } from "@/lib/i18n/params";
import { localePath } from "@/lib/i18n/config";
import { getPageContent } from "@/lib/i18n/content/pages";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const revalidate = 3600;

export async function generateStaticParams() {
  return getTeamSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug, locale: localeParam } = await params;
  const member = getTeamBySlug(slug);
  if (!member) return {};
  const locale = await resolveLocale(Promise.resolve({ locale: localeParam }));
  return createPublicMetadata({
    title: member.displayName,
    description: member.shortBio,
    path: `/about-us/team/${slug}`,
    image: `${member.image}-portrait.webp`,
    locale,
    contentLocalized: false,
  });
}

export default async function TeamMemberPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug, locale: localeParam } = await params;
  const locale = await resolveLocale(Promise.resolve({ locale: localeParam }));
  const member = getTeamBySlug(slug);

  if (!member || (process.env.NODE_ENV === "production" && !member.published)) {
    notFound();
  }

  const p = getPageContent(locale);
  const d = await getDictionary(locale);
  const others = getPublishedTeam().filter((m) => m.slug !== member.slug);
  const photoOverride = await getTeamMemberPhotoOverride(member.slug);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd(
          [
            { label: d.common.home, url: localePath("/", locale) },
            { label: p.common.aboutUs, url: localePath("/about-us", locale) },
            { label: p.team.title, url: localePath("/about-us/team", locale) },
            { label: member.displayName, url: localePath(`/about-us/team/${slug}`, locale) },
          ],
          site.url
        )}
      />

      <section className="py-12 md:py-16">
        <Container>
          <Breadcrumbs
            className="mb-8"
            items={[
              { label: d.common.home, href: localePath("/", locale) },
              { label: p.common.aboutUs, href: localePath("/about-us", locale) },
              { label: p.team.title, href: localePath("/about-us/team", locale) },
              { label: member.displayName },
            ]}
            locale={locale}
          />

          <p className="mb-8 rounded-lg border border-primary/20 bg-primary-light p-4 text-sm text-foreground">
            {d.common.originalLanguageNotice}
          </p>

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
                      <Mail className="h-4 w-4" /> {p.teamMember.email}
                    </a>
                  )}
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" /> {p.teamMember.linkedIn}
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
                    {p.common.sources}
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
                <h2 className="text-xl font-bold">{p.teamMember.support}</h2>
                <p className="mt-2 text-white/90">
                  {p.team.supportWork.replace("{site}", site.name)}
                </p>
                <Button href={localePath("/donate", locale)} variant="secondary" className="mt-6">
                  {p.teamMember.donate}
                </Button>
              </div>
            </div>
          </div>

          {others.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold">{p.team.meetRest}</h2>
              <div className="mt-6 flex flex-wrap gap-3">
                {others.map((m) => (
                  <Link
                    key={m.slug}
                    href={localePath(`/about-us/team/${m.slug}`, locale)}
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

import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ContactChannelListItem } from "@/components/shared/ContactChannel";
import { site } from "@/content/site";
import { createPublicMetadata } from "@/lib/metadata";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { resolveLocale, type LocaleParams } from "@/lib/i18n/params";
import { localePath } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: LocaleParams;
}): Promise<Metadata> {
  const locale = await resolveLocale(params);
  return createPublicMetadata({
    title: "Safeguarding Policy",
    description:
      "Vantage Foundation Uganda's safeguarding policy for protecting children, young people, and vulnerable adults.",
    path: "/safeguarding",
    locale,
    contentLocalized: false,
  });
}

export default async function SafeguardingPage({
  params,
}: {
  params: LocaleParams;
}) {
  const locale = await resolveLocale(params);
  const dictionary = await getDictionary(locale);
  return (
    <>
      <section className="bg-primary py-16 text-white md:py-24">
        <Container>
          <SectionHeader
            level="h1"
            title="Safeguarding Policy"
            description="Our commitment to protecting children, young people, and vulnerable adults."
            light
          />
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container className="max-w-3xl">
          <p className="rounded-lg border border-primary/20 bg-primary-light p-4 text-sm text-foreground">
            {dictionary.common.originalLanguageNotice}
          </p>
          <div className="mt-8 space-y-8 leading-relaxed text-muted-foreground">
            <div>
              <h2 className="mb-3 text-xl font-bold text-foreground">
                Our commitment
              </h2>
              <p>
                {site.legalName} is committed to creating a safe environment
                for children, young people, and vulnerable adults who come
                into contact with our organisation through our programmes,
                events, and online presence. We believe that every person has
                the right to live free from abuse, exploitation, and harm.
              </p>
              <p className="mt-3">
                This policy applies to all staff, volunteers, partners, and
                anyone representing {site.name} in any capacity.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-foreground">
                Principles
              </h2>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  The safety and wellbeing of the people we serve is our
                  highest priority.
                </li>
                <li>
                  Every person has the right to be treated with dignity and
                  respect.
                </li>
                <li>
                  We take a zero-tolerance approach to abuse, exploitation,
                  and neglect.
                </li>
                <li>
                  We listen to and act on concerns raised by children, young
                  people, and vulnerable adults.
                </li>
                <li>
                  We work in partnership with families, communities, and
                  authorities to promote safety.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-foreground">
                Who we protect
              </h2>
              <p>
                <strong className="text-foreground">Children</strong> (under
                18): We take special care to protect children in all our
                programmes, including medical camps, mentorship sessions, and
                humanitarian aid distribution.
              </p>
              <p className="mt-3">
                <strong className="text-foreground">
                  Young people
                </strong>{" "}
                (18-30): Many of our programmes engage young people as
                beneficiaries and volunteers. We ensure they are protected
                from exploitation and harm.
              </p>
              <p className="mt-3">
                <strong className="text-foreground">Vulnerable adults</strong>:
                We recognise that some adults may be vulnerable due to
                disability, illness, age, or social circumstances. We treat
                them with dignity and protect them from abuse.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-foreground">
                Code of conduct
              </h2>
              <p className="mb-3">All staff and volunteers must:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  Treat all children, young people, and vulnerable adults with
                  respect and dignity.
                </li>
                <li>
                  Never engage in any form of physical, emotional, or sexual
                  abuse.
                </li>
                <li>
                  Never develop a sexual relationship with a beneficiary of
                  our programmes.
                </li>
                <li>
                  Never use language or behaviour that is inappropriate,
                  harassing, or degrading.
                </li>
                <li>
                  Never spend time alone with a child away from others.
                </li>
                <li>
                  Never take or share photographs of children without verified
                  consent (see our{" "}
                  <Link
                    href={localePath("/privacy", locale)}
                    className="text-primary underline"
                  >
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link
                    href={localePath("/accessibility", locale)}
                    className="text-primary underline"
                  >
                    Accessibility Statement
                  </Link>
                  ).
                </li>
                <li>
                  Report any concern about the safety of a child or vulnerable
                  person immediately.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-foreground">
                Photography and media
              </h2>
              <p>
                We follow strict guidelines for photographing and publishing
                images of children and vulnerable adults:
              </p>
              <ul className="mt-3 ml-6 list-disc space-y-2">
                <li>
                  Photographs are taken only with informed consent from the
                  individual and/or their parent/guardian.
                </li>
                <li>
                  Children are never identified by full name, location, or
                  other identifying details in published content.
                </li>
                <li>
                  Images must be dignified and not place the subject at risk
                  of identification, exploitation, or harm.
                </li>
                <li>
                  All EXIF metadata (including GPS coordinates) is stripped
                  from photos before publishing.
                </li>
                <li>
                  Anyone featured in our media can request removal at any
                  time.
                </li>
              </ul>
              <p className="mt-3">
                For the full technical and editorial details, see our{" "}
                <Link
                  href={localePath("/reports-and-accountability", locale)}
                  className="text-primary underline"
                >
                  Reports &amp; Accountability
                </Link>{" "}
                page.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-foreground">
                Reporting concerns
              </h2>
              <p>
                If you have a safeguarding concern or believe someone is at
                risk of harm, please report it immediately. You do not need
                proof &mdash; reporting a concern allows us to investigate and
                take appropriate action.
              </p>
              <ul className="mt-3 ml-6 list-disc space-y-1">
                <ContactChannelListItem category="safeguarding" locale={locale} />
                <li>
                  Phone/WhatsApp:{" "}
                  <a
                    href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                    className="text-primary underline"
                  >
                    {site.contact.phone}
                  </a>
                </li>
              </ul>
              <p className="mt-3">
                All reports are treated confidentially and handled by our
                volunteer leadership team. We cooperate fully with Ugandan
                authorities, including the Uganda Police Force and the Ministry
                of Gender, Labour and Social Development, in any investigation.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-foreground">
                Recruitment and training
              </h2>
              <p>
                All staff and volunteers who work with children or vulnerable
                adults undergo:
              </p>
              <ul className="mt-3 ml-6 list-disc space-y-2">
                <li>
                  Background checks and reference verification before
                  appointment.
                </li>
                <li>
                  Safeguarding induction training before working with
                  beneficiaries.
                </li>
                <li>
                  Regular refresher training on safeguarding policies and
                  procedures.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-foreground">
                Policy review
              </h2>
              <p>
                This policy is reviewed annually and updated as needed. The
                date below indicates when it was last revised.
              </p>
            </div>

            <div className="border-t border-border pt-6">
              <h2 className="mb-3 text-xl font-bold text-foreground">
                Designated safeguarding officer
              </h2>
              <p className="text-muted-foreground">
                We are in the process of formally appointing a designated
                safeguarding officer. Their name and direct contact will be
                published here once confirmed.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Last updated: July 2026. This policy is reviewed annually.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import {
  ContactChannelLink,
  ContactChannelListItem,
} from "@/components/shared/ContactChannel";
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
    title: "Privacy Policy",
    description:
      "How Vantage Foundation Uganda collects, uses, and protects personal data of donors, volunteers, and website visitors.",
    path: "/privacy",
    locale,
    contentLocalized: false,
  });
}

export default async function PrivacyPage({
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
            title="Privacy Policy"
            description="How we handle your personal data."
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
                Overview
              </h2>
              <p>
                {site.legalName} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or
                &ldquo;our&rdquo;) is committed to protecting your privacy.
                This policy explains what personal data we collect, why we
                collect it, how we use it, and the choices you have.
              </p>
              <p className="mt-3">
                This policy applies to our website, donation forms, contact
                forms, newsletter signup, and any other channels where we
                collect personal information.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-foreground">
                Data we collect
              </h2>
              <p className="mb-3">We collect the following personal data:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong className="text-foreground">Donors:</strong> name,
                  email, phone (optional), donation amount, frequency,
                  campaign, transaction reference, and any message you
                  provide.
                </li>
                <li>
                  <strong className="text-foreground">
                    Contact form submissions:
                  </strong>{" "}
                  name, email, phone (optional), subject, and message.
                </li>
                <li>
                  <strong className="text-foreground">
                    Newsletter subscribers:
                  </strong>{" "}
                  email address only.
                </li>
                <li>
                  <strong className="text-foreground">
                    Volunteer and partnership enquiries:
                  </strong>{" "}
                  name, email, phone (optional), and details you provide in
                  your message.
                </li>
                <li>
                  <strong className="text-foreground">
                    Technical data:
                  </strong>{" "}
                  we do not use tracking cookies or analytics tools. Our
                  hosting provider (Vercel) may log standard request data
                  (IP address, browser type, timestamp) for security and
                  operational purposes.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-foreground">
                How we use your data
              </h2>
              <ul className="ml-6 list-disc space-y-2">
                <li>To process and acknowledge donations.</li>
                <li>To respond to your enquiries and messages.</li>
                <li>To send you our newsletter (only if you opt in).</li>
                <li>
                  To verify donations against official bank statements (admin
                  dashboard).
                </li>
                <li>
                  To maintain records required for financial accountability
                  and audit purposes.
                </li>
              </ul>
              <p className="mt-3">
                We do <strong className="text-foreground">not</strong> sell,
                rent, or share your personal data with third parties for
                marketing purposes.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-foreground">
                Legal basis
              </h2>
              <p>
                We process your personal data based on your consent (when you
                submit a form or make a donation) and our legitimate interest
                in operating as a registered non-profit organisation in
                Uganda. We comply with the Data Protection and Privacy Act,
                2019 of Uganda.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-foreground">
                Data storage and security
              </h2>
              <p>
                Donation data is stored in a secure PostgreSQL database hosted
                by Neon. Access to the admin dashboard is protected by a
                password and CSRF protection. We do not store payment
                credentials (PINs, OTPs, card numbers) &mdash; donations are
                made via bank transfer or Mobile Money outside this website,
                and we only record the transaction reference you provide.
              </p>
              <p className="mt-3">
                Email notifications (if enabled) are sent via a secure SMTP
                connection. We do not store sent emails on our servers.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-foreground">
                Data retention
              </h2>
              <p>
                We retain donor records for as long as required for financial
                accountability and audit purposes. When you request deletion,
                your records are soft-deleted (marked as deleted and hidden
                from our dashboard) and permanently purged after 12 months.
                Contact form submissions are retained for up to 12 months
                after resolution. Newsletter subscriptions are retained
                until you unsubscribe.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-foreground">
                Your rights
              </h2>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong className="text-foreground">Access:</strong> you can
                  request a copy of the personal data we hold about you.
                </li>
                <li>
                  <strong className="text-foreground">Correction:</strong> you
                  can ask us to correct inaccurate or incomplete data.
                </li>
                <li>
                  <strong className="text-foreground">Deletion:</strong> you
                  can ask us to delete your personal data, subject to legal
                  retention requirements.
                </li>
                <li>
                  <strong className="text-foreground">Withdrawal:</strong> you
                  can unsubscribe from our newsletter at any time.
                </li>
                <li>
                  <strong className="text-foreground">Complaint:</strong> you
                  can lodge a complaint with the Personal Data Protection
                  Office of Uganda.
                </li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, contact us through{" "}
                <ContactChannelLink locale={locale} />.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-foreground">
                Cookies
              </h2>
              <p>
                This website does not use tracking or advertising cookies. We
                use a single essential cookie (<code>vantage_admin</code>) to
                authenticate administrators on the donation verification
                dashboard. This cookie is set only after an admin logs in and
                is deleted when they log out.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-foreground">
                Children&rsquo;s privacy
              </h2>
              <p>
                We do not knowingly collect personal data from children under
                18. Our programmes may involve children, but we do not
                collect their personal data through this website. Photographs
                of children are published only with verified consent &mdash;
                see our{" "}
                <Link
                  href={localePath("/safeguarding", locale)}
                  className="text-primary underline"
                >
                  Safeguarding Policy
                </Link>
                .
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-foreground">
                Changes to this policy
              </h2>
              <p>
                We may update this policy from time to time. The date below
                indicates when it was last revised. We will notify you of any
                significant changes by posting the updated policy on this
                page.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-foreground">
                Contact us
              </h2>
              <p>
                If you have any questions about this Privacy Policy or how we
                handle your personal data, please contact us:
              </p>
              <ul className="mt-3 ml-6 list-disc space-y-1">
                <ContactChannelListItem locale={locale} />
                <li>
                  Phone/WhatsApp:{" "}
                  <a
                    href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                    className="text-primary underline"
                  >
                    {site.contact.phone}
                  </a>
                </li>
                <li>
                  Address:{" "}
                  {site.contact.offices
                    .map((o) => `${o.city}, ${o.region}`)
                    .join("; ")}
                </li>
              </ul>
            </div>

            <p className="border-t border-border pt-6 text-sm text-muted-foreground">
              Last updated: July 2026. This policy is reviewed annually.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}

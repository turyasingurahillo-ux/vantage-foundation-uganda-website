import type { Metadata } from "next";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ContactChannelListItem } from "@/components/shared/ContactChannel";
import { site } from "@/content/site";
import { createPublicMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPublicMetadata({
  title: "Terms of Use",
  description:
    "Terms and conditions for using the Vantage Foundation Uganda website and making donations.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <section className="bg-primary py-16 text-white md:py-24">
        <Container>
          <SectionHeader
            level="h1"
            title="Terms of Use"
            description="The terms and conditions for using our website and services."
            light
          />
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container className="max-w-3xl">
          <div className="space-y-8 leading-relaxed text-muted-foreground">
            <div>
              <h2 className="mb-3 text-xl font-bold text-foreground">
                Acceptance of terms
              </h2>
              <p>
                By accessing and using this website, you accept and agree to
                be bound by these Terms of Use. If you do not agree with any
                part of these terms, please do not use our website.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-foreground">
                About us
              </h2>
              <p>
                This website is operated by {site.legalName}, a youth-led
                non-profit organisation registered in Uganda. We have offices in{" "}
                {site.contact.offices
                  .map((o) => `${o.city}, ${o.region}`)
                  .join(" and ")}
                .
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-foreground">
                Donations
              </h2>
              <p className="mb-3">
                When you submit a donation intent through our website:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  You confirm that the information you provide (name, email,
                  amount, transaction reference) is accurate and truthful.
                </li>
                <li>
                  You acknowledge that submitting the form records your
                  donation intent in our database. The donation is only
                  marked as <strong className="text-foreground">verified</strong>{" "}
                  after an administrator confirms the transfer against the
                  official bank statement.
                </li>
                <li>
                  You authorise us to contact you regarding your donation if
                  clarification is needed.
                </li>
                <li>
                  Donations are made via bank transfer or Mobile Money outside
                  this website. We do not process online payments directly.
                </li>
                <li>
                  We do not store payment credentials (PINs, OTPs, card
                  numbers). Never send these through our forms.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-foreground">
                Use of content
              </h2>
              <p className="mb-3">
                All content on this website, including text, images, logos,
                and design, is the property of {site.legalName} unless
                otherwise stated. You may:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>View and share content for personal, non-commercial use.</li>
                <li>
                  Link to our pages from your website or social media.
                </li>
                <li>
                  Reproduce short excerpts with attribution to{" "}
                  {site.name} and a link back to the source page.
                </li>
              </ul>
              <p className="mt-3">
                You may <strong className="text-foreground">not</strong>:
              </p>
              <ul className="mt-3 ml-6 list-disc space-y-2">
                <li>
                  Use our content for commercial purposes without written
                  permission.
                </li>
                <li>
                  Modify, redistribute, or sell our content without
                  permission.
                </li>
                <li>
                  Use images of children or vulnerable individuals in any way
                  that could cause harm or distress (see our{" "}
                  <a
                    href="/safeguarding"
                    className="text-primary underline"
                  >
                    Safeguarding Policy
                  </a>
                  ).
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-foreground">
                Acceptable use
              </h2>
              <p>You agree not to:</p>
              <ul className="mt-3 ml-6 list-disc space-y-2">
                <li>
                  Submit false, misleading, or fraudulent donation intents.
                </li>
                <li>
                  Attempt to gain unauthorised access to the admin dashboard
                  or any secured part of the website.
                </li>
                <li>
                  Use automated tools (bots, scrapers) to submit forms or
                  extract data in bulk.
                </li>
                <li>
                  Submit content that is unlawful, harmful, defamatory, or
                  infringes on the rights of others.
                </li>
                <li>
                  Disrupt or interfere with the security or operation of the
                  website.
                </li>
              </ul>
              <p className="mt-3">
                We reserve the right to block access to anyone who violates
                these terms.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-foreground">
                Disclaimer
              </h2>
              <p>
                We strive to keep the information on this website accurate and
                up to date. However, we do not warrant that the content is
                free from errors or omissions. Impact figures and project
                descriptions are based on our records at the time of
                publishing and may be updated as new information becomes
                available.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-foreground">
                Limitation of liability
              </h2>
              <p>
                {site.legalName} is not liable for any direct, indirect,
                incidental, or consequential damages arising from your use of
                this website or reliance on its content. We are not
                responsible for the content of external websites linked from
                our pages.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-foreground">
                Changes to these terms
              </h2>
              <p>
                We may update these Terms of Use from time to time. The date
                below indicates when they were last revised. Continued use of
                the website after changes constitutes acceptance of the
                updated terms.
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-bold text-foreground">
                Contact us
              </h2>
              <p>
                If you have any questions about these Terms of Use, please
                contact us:
              </p>
              <ul className="mt-3 ml-6 list-disc space-y-1">
                <ContactChannelListItem />
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
            </div>

            <p className="border-t border-border pt-6 text-sm text-muted-foreground">
              Last updated: July 2026. These terms are reviewed annually.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}

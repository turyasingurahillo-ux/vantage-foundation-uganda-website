import type { Metadata } from "next";
import { site } from "@/content/site";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ContactForm } from "@/components/shared/ContactForm";
import { WhatsAppButtonClient } from "@/components/shared/WhatsAppButtonClient";
import { Card } from "@/components/ui/Card";
import { Mail, Phone, MapPin } from "lucide-react";
import { createPublicMetadata } from "@/lib/metadata";
import { resolveCategoryFromQuery } from "@/lib/contact-categories";

export const metadata: Metadata = createPublicMetadata({
  title: "Contact",
  description: "Get in touch with Vantage Foundation Uganda for donations, volunteering, partnerships and media inquiries.",
  path: "/contact",
});

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const { subject } = await searchParams;
  // Accepts current category values and the legacy ?subject= values still used
  // by older CTAs elsewhere on the site.
  const defaultSubject = resolveCategoryFromQuery(subject);

  return (
    <>
      <section className="bg-primary py-16 text-white md:py-24">
        <Container>
          <SectionHeader
            level="h1"
            title="Contact us"
            description="We would love to hear from you. Reach out for donations, volunteering, partnerships or general inquiries."
            light
          />
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          {/* WhatsApp quick-contact — prominent CTA */}
          <div className="mx-auto max-w-2xl">
            <Card className="p-6 md:p-8">
              <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground">
                    Quick question? Chat to us on WhatsApp
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    The fastest way to reach Vantage Foundation Uganda. Send
                    us a message and we will get back to you.
                  </p>
                </div>
                <WhatsAppButtonClient
                  number={site.contact.whatsapp}
                  size="lg"
                  context="contact page quick contact"
                  position="hero"
                  className="shrink-0"
                />
              </div>
            </Card>
          </div>

          {/* Structured contact form + contact details */}
          <div className="mt-12 grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-1 space-y-6">
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Formal enquiry</h3>
                    {site.contact.publicEmail ? (
                      <a
                        href={`mailto:${site.contact.publicEmail}`}
                        className="text-sm text-muted-foreground hover:text-primary"
                      >
                        {site.contact.publicEmail}
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Use the form on this page — choose a category and your
                        message goes straight to the right team.
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <a
                      href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      {site.contact.phone}
                    </a>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Location</h3>
                    <div className="mt-1 space-y-2">
                      {site.contact.offices.map((office) => (
                        <p key={office.label} className="text-sm text-muted-foreground">
                          <span className="font-medium">{office.label}</span>
                          <br />
                          {office.city}, {office.region}, {office.country}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="p-6 md:p-8">
                <h2 className="text-2xl font-bold">Send a formal enquiry</h2>
                <p className="mt-2 text-muted-foreground">
                  For partnership proposals, grant applications, media
                  enquiries and other formal matters, fill out the form below
                  and we will respond as soon as possible.
                </p>
                <div className="mt-6">
                  <ContactForm defaultSubject={defaultSubject} />
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

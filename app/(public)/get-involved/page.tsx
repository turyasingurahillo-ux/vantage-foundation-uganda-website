import type { Metadata } from "next";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ContactForm } from "@/components/shared/ContactForm";
import {
  Heart,
  HandHelping,
  Handshake,
  Megaphone,
  Users,
  Briefcase,
} from "lucide-react";
import { createPublicMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPublicMetadata({
  title: "Get Involved",
  description: "Donate, volunteer, partner, sponsor or collaborate with Vantage Foundation Uganda.",
  path: "/get-involved",
});

const pathways = [
  {
    id: "donate",
    icon: Heart,
    title: "Donate",
    description: "Fund a project, a campaign or our general operations. Every contribution is one more advantage.",
    cta: { label: "Donate now", href: "/donate" },
  },
  {
    id: "volunteer",
    icon: HandHelping,
    title: "Volunteer",
    description: "Share your time as a mentor, health worker, educator, communications volunteer or logistics helper.",
    cta: { label: "Become a volunteer", href: "/contact?subject=volunteer" },
  },
  {
    id: "partner",
    icon: Handshake,
    title: "Partner",
    description: "Collaborate on programmes, funding, technical expertise or joint community initiatives.",
    cta: { label: "Partner with us", href: "/contact?subject=partner" },
  },
  {
    id: "sponsor",
    icon: Megaphone,
    title: "Sponsor",
    description: "Sponsor a specific project, event or community need and receive updates on outcomes.",
    cta: { label: "Sponsor a project", href: "/contact?subject=sponsor" },
  },
  {
    id: "collaborate",
    icon: Users,
    title: "Collaborate",
    description: "Join a campaign, workshop or community mobilisation aligned with your skills.",
    cta: { label: "Get in touch", href: "/contact?subject=general" },
  },
  {
    id: "csr",
    icon: Briefcase,
    title: "Corporate social responsibility",
    description: "Align your organisation's CSR with youth empowerment, health, education and WASH impact.",
    cta: { label: "Discuss CSR", href: "/contact?subject=partner" },
  },
];

export default function GetInvolvedPage() {
  return (
    <>
      <section className="bg-primary py-16 text-white md:py-24">
        <Container>
          <SectionHeader
            level="h1"
            title="Get Involved"
            description="There are many ways to help create one more advantage."
            light
          />
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pathways.map((path) => (
              <Card key={path.id} id={path.id} className="flex flex-col p-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <path.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h2 className="mt-4 text-xl font-semibold">{path.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {path.description}
                </p>
                <Button href={path.cta.href} variant="outline" className="mt-6">
                  {path.cta.label}
                </Button>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-surface py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-2xl">
            <SectionHeader
              title="Reach out"
              description="Tell us how you would like to be involved and we will follow up."
            />
            <div className="mt-8 rounded-xl bg-white p-6 shadow-sm md:p-8">
              <ContactForm />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

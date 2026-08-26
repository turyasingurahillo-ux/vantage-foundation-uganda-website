import Link from "next/link";
import { site } from "@/content/site";
import { Container } from "@/components/shared/Container";
import { NewsletterForm } from "@/components/shared/NewsletterForm";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/Button";
import { BrandPattern } from "@/components/shared/BrandPattern";
import { Mail, Phone, MapPin } from "lucide-react";
import { InstagramIcon, LinkedinIcon, YoutubeIcon } from "@/components/shared/SocialIcons";
import { WhatsAppButtonClient } from "@/components/shared/WhatsAppButtonClient";

export function Footer() {
  const programmeLinks = [
    { label: "Vantage Care", href: "/programmes/health" },
    { label: "KikumiKyo Academy", href: "/programmes/education" },
    { label: "Humanitarian Assistance", href: "/programmes/humanitarian" },
    { label: "Water, Sanitation and Hygiene", href: "/programmes/water" },
  ];

  const impactLinks = [
    { label: "Projects", href: "/projects" },
    { label: "Impact Results", href: "/impact" },
    { label: "Reports and Accountability", href: "/reports-and-accountability" },
    { label: "Where We Work", href: "/impact#where-we-work" },
  ];

  const getInvolvedLinks = [
    { label: "Donate", href: "/donate" },
    { label: "Volunteer", href: "/get-involved#volunteer" },
    { label: "Partner", href: "/get-involved#partner" },
    { label: "Sponsor", href: "/get-involved#sponsor" },
    { label: "Corporate Social Responsibility", href: "/get-involved#csr" },
  ];

  const legalLinks = [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Safeguarding", href: "/safeguarding" },
    { label: "Accessibility", href: "/accessibility" },
  ];

  const socials = [
    { icon: InstagramIcon, label: "Instagram", href: site.socials.instagram },
    { icon: LinkedinIcon, label: "LinkedIn", href: site.socials.linkedin },
    { icon: YoutubeIcon, label: "YouTube", href: site.socials.youtube },
  ].filter((s) => s.href);

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-navy text-white">
      <BrandPattern variant="topographic" color="var(--deep-teal)" opacity={0.08} />
      <Container className="relative">
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
          {/* Organisation summary */}
          <div className="lg:col-span-1">
            <Logo href="/" variant="horizontal" theme="dark" height={56} alt={site.name} />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
              {site.legalName} is a youth-led nonprofit improving access to
              health, education, clean water and humanitarian support in
              underserved Ugandan communities.
            </p>
            <p className="mt-4 text-sm font-medium text-deep-teal">
              {site.tagline}
            </p>
            <Button href={site.primaryCta.href} size="sm" className="mt-6">
              {site.primaryCta.label}
            </Button>
          </div>

          {/* Programmes */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/90">
              Programmes
            </h2>
            <ul className="mt-4 space-y-2">
              {programmeLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/70 transition-colors hover:text-deep-teal"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Impact and accountability */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/90">
              Impact &amp; Accountability
            </h2>
            <ul className="mt-4 space-y-2">
              {impactLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/70 transition-colors hover:text-deep-teal"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get involved */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/90">
              Get Involved
            </h2>
            <ul className="mt-4 space-y-2">
              {getInvolvedLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/70 transition-colors hover:text-deep-teal"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact, social, newsletter */}
        <div className="grid gap-12 border-t border-white/10 py-12 md:grid-cols-2 lg:grid-cols-3">
          {/* Contact information */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/90">
              Contact
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li>
                {site.contact.publicEmail ? (
                  <a
                    href={`mailto:${site.contact.publicEmail}`}
                    className="inline-flex items-center gap-2 transition-colors hover:text-deep-teal"
                  >
                    <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {site.contact.publicEmail}
                  </a>
                ) : (
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 transition-colors hover:text-deep-teal"
                  >
                    <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Contact Vantage
                  </Link>
                )}
              </li>
              <li>
                <a
                  href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2 transition-colors hover:text-deep-teal"
                >
                  <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {site.contact.phone}
                </a>
              </li>
            </ul>
            <div className="mt-4">
              <WhatsAppButtonClient
                number={site.contact.whatsapp}
                size="sm"
                variant="outline"
                context="footer quick contact"
                position="footer"
                className="border-white/30 text-white hover:bg-white/10"
              />
            </div>
            <div className="mt-4 space-y-2">
              {site.contact.offices.map((office) => (
                <p key={office.label} className="inline-flex items-start gap-2 text-sm text-white/70">
                  <MapPin className="h-4 w-4 shrink-0 text-deep-teal" aria-hidden="true" />
                  <span><span className="font-medium text-white/90">{office.label}:</span> {office.city}, {office.region}</span>
                </p>
              ))}
            </div>
            {/* Social icons */}
            <div className="mt-6 flex gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-deep-teal hover:text-white"
                >
                  <social.icon className="h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/90">
              Newsletter
            </h2>
            <p className="mt-4 text-sm text-white/70">
              Get updates on our work, stories and ways to support.
            </p>
            <div className="mt-4 max-w-md">
              <NewsletterForm light />
            </div>
          </div>
        </div>

        {/* Legal links and copyright */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-sm text-white/60 md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {site.legalName}. All rights
            reserved.
          </p>
          <div className="flex flex-wrap gap-4 md:gap-6">
            {legalLinks.map((item) => (
              <Link key={item.href} href={item.href} className="transition-colors hover:text-deep-teal">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
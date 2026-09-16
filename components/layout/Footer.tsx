import Link from "next/link";
import { site } from "@/content/site";
import { Container } from "@/components/shared/Container";
import { NewsletterForm } from "@/components/shared/NewsletterForm";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/Button";
import { BrandPattern } from "@/components/shared/BrandPattern";
import { Mail, Phone, MapPin } from "lucide-react";
import { InstagramIcon, LinkedinIcon, YoutubeIcon } from "@/components/shared/SocialIcons";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { I18nDictionary } from "@/lib/i18n/dictionaries";
import { WhatsAppButtonClient } from "@/components/shared/WhatsAppButtonClient";

export function Footer({ locale, dictionary }: { locale: Locale; dictionary: I18nDictionary }) {
  const n = dictionary.navigation;
  const f = dictionary.footer;
  const c = dictionary.common;
  const href = (path: string) => localePath(path, locale);
  const programmeLinks = [
    { label: "Health & Wellbeing", href: href("/programmes/health-wellbeing") },
    { label: "Education & Learning", href: href("/programmes/education-learning") },
    {
      label: "Financial Capability",
      href: href("/programmes/financial-capability-economic-opportunity"),
    },
    { label: "Food & Basic Needs", href: href("/programmes/food-basic-needs") },
    {
      label: "Vulnerability & Protection",
      href: href("/programmes/humanitarian-vulnerability-protection"),
    },
    {
      label: "Youth Leadership",
      href: href("/programmes/youth-leadership-participation"),
    },
    { label: "Vantage Point", href: href("/programmes/vantage-point") },
  ];

  const impactLinks = [
    { label: n.impactResults, href: href("/impact") },
    { label: n.theoryOfChange, href: href("/theory-of-change") },
    { label: n.projects, href: href("/projects") },
    { label: n.reportsAccountability, href: href("/reports-and-accountability") },
    { label: n.whereWeWork, href: href("/where-we-work") },
  ];

  const getInvolvedLinks = [
    { label: n.donate, href: href("/donate") },
    { label: n.partner, href: href("/partner") },
    { label: n.volunteer, href: href("/get-involved#volunteer") },
    { label: n.stories, href: href("/stories") },
    { label: n.contact, href: href("/contact") },
  ];

  const legalLinks = [
    { label: c.privacy, href: href("/privacy") },
    { label: c.terms, href: href("/terms") },
    { label: c.safeguarding, href: href("/safeguarding") },
    { label: c.accessibility, href: href("/accessibility") },
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
            <Logo href={href("/")} variant="horizontal" theme="dark" height={56} alt={site.name} />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
              {f.summary}
            </p>
            <p className="mt-4 text-sm font-medium text-deep-teal">
              {dictionary.home.heroTitle}
            </p>
            <Button href={href(site.primaryCta.href)} size="sm" className="mt-6">
              {n.donate}
            </Button>
          </div>

          {/* Programmes */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-white/90">
              {n.programmes}
            </p>
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
            <p className="text-sm font-semibold uppercase tracking-wider text-white/90">
              {f.impactAccountability}
            </p>
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
            <p className="text-sm font-semibold uppercase tracking-wider text-white/90">
              {n.getInvolved}
            </p>
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
            <p className="text-sm font-semibold uppercase tracking-wider text-white/90">
              {n.contact}
            </p>
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
                    href={href("/contact")}
                    className="inline-flex items-center gap-2 transition-colors hover:text-deep-teal"
                  >
                    <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {f.contactVantage}
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
                label={c.whatsappUs}
              />
            </div>
            <p className="mt-4 inline-flex items-start gap-2 text-sm text-white/70">
              <MapPin className="h-4 w-4 shrink-0 text-deep-teal" aria-hidden="true" />
              {site.contact.country}
            </p>
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
                  <span className="sr-only">(opens in new tab)</span>
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-wider text-white/90">
              {f.newsletter}
            </p>
            <p className="mt-4 text-sm text-white/70">
              {f.newsletterDescription}
            </p>
            <div className="mt-4 max-w-md">
              <NewsletterForm light dictionary={dictionary.forms} privacyLabel={c.privacy} privacyHref={href("/privacy")} />
            </div>
          </div>
        </div>

        {/* Legal links and copyright */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-sm text-white/60 md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {site.legalName}. {c.allRightsReserved}
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

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CircleCheck,
  Clock3,
  Database,
  MapPin,
  Microscope,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { Story } from "@/types";
import type { GuideRoadmap } from "@/lib/career-guide";
import { formatContentDate } from "@/lib/content-date";
import { Container } from "@/components/shared/Container";
import { ImageOrPlaceholder } from "@/components/shared/ImageOrPlaceholder";
import { Markdown } from "@/components/shared/Markdown";
import { NewsletterForm } from "@/components/shared/NewsletterForm";
import { ArticleShareButtons } from "@/components/shared/ArticleShareButtons";

export function CareerGuideHero({ story }: { story: Story }) {
  const verifiedDate = story.updatedAt ?? story.date;

  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #ddf5f4 0, transparent 36%), radial-gradient(circle at 85% 70%, #008f95 0, transparent 32%)",
        }}
      />
      <Container className="relative py-12 md:py-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
          <div>
            <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-deep-teal">
              <span className="h-px w-8 bg-deep-teal" aria-hidden="true" />
              Vantage Career Guide
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-[-0.03em] sm:text-5xl lg:text-6xl">
              {story.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">
              {story.excerpt}
            </p>
            <p className="mt-4 text-sm font-semibold text-white/70">
              For Ugandan medical graduates &amp; health professionals
            </p>

            <div className="mt-7 flex flex-wrap gap-3" aria-label="Guide shortcuts">
              <a
                href="#1-your-next-30-days"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-navy transition-colors hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
              >
                Start with my next 30 days
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="#11-opportunity-board-14-august-2026"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/35 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal"
              >
                See opportunities
              </a>
              <a
                href="#9-pick-the-roadmap-that-fits-you"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/35 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal"
              >
                Choose a career path
              </a>
            </div>

            <dl className="mt-8 grid gap-x-6 gap-y-3 border-t border-white/15 pt-6 text-sm text-white/75 sm:grid-cols-2">
              <div className="grid grid-cols-[1rem_1fr] items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-deep-teal" aria-hidden="true" />
                <dt className="sr-only">Author</dt>
                <dd>{story.author ?? "Vantage Foundation Uganda"}</dd>
              </div>
              <div className="grid grid-cols-[1rem_1fr] items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-deep-teal" aria-hidden="true" />
                <dt className="sr-only">Location</dt>
                <dd>{story.location ?? "Uganda"}</dd>
              </div>
              <div className="grid grid-cols-[1rem_1fr] items-start gap-2">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-deep-teal" aria-hidden="true" />
                <dt className="sr-only">Published</dt>
                <dd>Published {formatContentDate(story.date)}</dd>
              </div>
              {story.readingTimeMinutes && (
                <div className="grid grid-cols-[1rem_1fr] items-start gap-2">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-deep-teal" aria-hidden="true" />
                  <dt className="sr-only">Reading time</dt>
                  <dd>About {story.readingTimeMinutes} minutes</dd>
                </div>
              )}
            </dl>

            <div className="mt-6 border-l-2 border-deep-teal bg-white/[0.06] px-4 py-3">
              <p className="text-sm font-bold text-white">
                Last verified: {formatContentDate(verifiedDate)}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-white/65">
                Opportunities and funding information change frequently. Vantage
                checks official sources before assigning VERIFIED status.
              </p>
            </div>
          </div>

          {story.heroImage && (
            <figure className="lg:pl-2">
              <div
                className="relative aspect-[4/3] overflow-hidden border border-white/15 bg-charcoal shadow-2xl"
                data-testid="story-hero"
              >
                <ImageOrPlaceholder
                  src={story.heroImage}
                  alt={story.heroImageAlt || story.title}
                  fill
                  preload
                  sizes="(min-width: 1024px) 42vw, 100vw"
                  containerClassName="h-full w-full"
                />
              </div>
              {story.heroImageCredit && (
                <figcaption className="mt-3 text-xs leading-relaxed text-white/60">
                  {story.heroImageCredit}
                </figcaption>
              )}
            </figure>
          )}
        </div>
      </Container>
    </section>
  );
}

export function GuideQuickStart({ items }: { items: string[] }) {
  return (
    <section
      id="start-here"
      className="scroll-mt-36 border-y border-primary/20 bg-primary-light/60 px-4 py-8 sm:px-6 md:scroll-mt-28 md:py-10"
      aria-labelledby="quick-start-title"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary">
            Start here
          </p>
          <h2 id="quick-start-title" className="mt-1 text-3xl font-bold tracking-tight">
            If you only have 2 minutes
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-slate-600">
          Seven decisions from the full guide, kept short for a tired reader.
        </p>
      </div>
      <div className="mt-6">
        <Markdown variant="compact">
          {items.map((item) => `- ${item}`).join("\n")}
        </Markdown>
      </div>
    </section>
  );
}

const careerPaths: Array<{
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}> = [
  {
    title: "Research",
    description: "Move from GCP and data skills into study teams and publications.",
    href: "#a-research-career",
    icon: Microscope,
  },
  {
    title: "M&E / MEAL",
    description: "Turn health knowledge into indicators, reporting and programme learning.",
    href: "#b-ngo-and-m-and-e",
    icon: BarChart3,
  },
  {
    title: "Clinical research / PV",
    description: "Build trial-site experience toward coordination and drug safety work.",
    href: "#c-clinical-research-and-pharmacovigilance",
    icon: ShieldCheck,
  },
  {
    title: "Global health",
    description: "Use community work to build credible programme and scholarship evidence.",
    href: "#d-global-health-through-community-work",
    icon: Users,
  },
  {
    title: "Epidemiology",
    description: "Combine local health work, postgraduate study and field epidemiology.",
    href: "#e-epidemiology-and-leadership-at-home",
    icon: Activity,
  },
  {
    title: "Digital health",
    description: "Pair clinical context with data tools, informatics and health technology.",
    href: "#f-digital-health-and-data",
    icon: Database,
  },
];

export function CareerPathGrid() {
  return (
    <section className="border-b border-border pb-12" aria-labelledby="career-paths-title">
      <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary">
        Choose your path
      </p>
      <h2 id="career-paths-title" className="mt-2 text-3xl font-bold tracking-tight">
        Where do you want to go?
      </h2>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
        Start with the roadmap closest to your next realistic move. You can return
        to the deeper career analysis when you need it.
      </p>
      <div className="mt-6 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 xl:grid-cols-3">
        {careerPaths.map((path) => {
          const Icon = path.icon;
          return (
            <a
              key={path.title}
              href={path.href}
              className="group min-w-0 bg-white p-5 transition-colors hover:bg-primary-light/50 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
            >
              <div className="flex items-start justify-between gap-4">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                <ArrowRight
                  className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-primary motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </div>
              <h3 className="mt-5 text-lg font-bold text-foreground">{path.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {path.description}
              </p>
            </a>
          );
        })}
      </div>
    </section>
  );
}

export function ManifestoCallout({ children }: { children: React.ReactNode }) {
  return (
    <section
      id="the-white-coat-is-not-a-prison-uniform"
      className="scroll-mt-36 border-y border-white/10 bg-navy px-5 py-14 text-white md:scroll-mt-28 md:px-10 md:py-20"
    >
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-deep-teal">
          A Vantage principle
        </p>
        <p className="mt-6 text-4xl font-bold uppercase leading-[0.98] tracking-[-0.04em] sm:text-5xl md:text-6xl">
          The white coat
          <br />
          is not a prison uniform.
        </p>
        <div className="mt-8 max-w-2xl border-l-2 border-deep-teal pl-5 text-lg leading-relaxed text-white/75">
          {children}
        </div>
      </div>
    </section>
  );
}

export function FundingCheck() {
  const terms = [
    { symbol: "+", label: "Tuition" },
    { symbol: "+", label: "Living costs" },
    { symbol: "+", label: "Visa / proof-of-funds requirement" },
    { symbol: "+", label: "Travel / setup costs" },
    { symbol: "−", label: "Guaranteed scholarship or stipend" },
  ];

  return (
    <aside
      id="the-vantage-funding-rule"
      className="my-10 border-y-2 border-primary bg-primary-light/55 px-5 py-8 sm:px-7"
      aria-labelledby="vantage-funding-check"
    >
      <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary">
        Decision method
      </p>
      <h3 id="vantage-funding-check" className="mt-2 text-2xl font-bold tracking-tight">
        The Vantage Funding Check
      </h3>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-700">
        Never publish tuition without the second number: the money required to
        live there and obtain the visa.
      </p>
      <div className="mt-6 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <ol className="space-y-2">
          {terms.map((term) => (
            <li
              key={term.label}
              className="grid grid-cols-[1.5rem_1fr] items-center border-b border-primary/15 bg-white/70 px-3 py-2.5"
            >
              <span className="font-mono text-lg font-bold text-primary" aria-hidden="true">
                {term.symbol}
              </span>
              <span className="font-semibold text-foreground">{term.label}</span>
            </li>
          ))}
        </ol>
        <ArrowDown className="mx-auto hidden h-6 w-6 text-primary sm:block" aria-hidden="true" />
      </div>
      <div className="mt-3 flex items-center gap-3 bg-navy px-4 py-4 text-white">
        <CircleCheck className="h-5 w-5 shrink-0 text-deep-teal" aria-hidden="true" />
        <p className="font-bold">Actual funding gap</p>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        Low tuition does not automatically mean an affordable relocation route.
        A scholarship you may win is not guaranteed money you can budget against.
      </p>
    </aside>
  );
}

export function CareerRoadmap({ roadmap }: { roadmap: GuideRoadmap }) {
  return (
    <section
      className="scroll-mt-36 border-t-4 border-primary bg-white p-5 shadow-sm md:scroll-mt-28 md:p-6"
      aria-labelledby={roadmap.id}
    >
      <h3 id={roadmap.id} className="text-2xl font-bold tracking-tight">
        {roadmap.heading}
      </h3>
      {roadmap.steps.length > 0 && (
        <ol className="mt-6 grid gap-0" aria-label={`${roadmap.heading} progression`}>
          {roadmap.steps.map((step, index) => (
            <li key={`${step}-${index}`} className="relative flex gap-4 pb-5 last:pb-0">
              {index < roadmap.steps.length - 1 && (
                <span
                  className="absolute left-[0.9375rem] top-8 h-[calc(100%-1.5rem)] w-px bg-primary/30"
                  aria-hidden="true"
                />
              )}
              <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-white font-mono text-xs font-bold text-primary">
                {index + 1}
              </span>
              <span className="pt-1 font-semibold leading-relaxed text-foreground">
                {step}
              </span>
            </li>
          ))}
        </ol>
      )}
      <div className="mt-6 border-t border-border pt-5">
        <Markdown variant="guide">{roadmap.detailMarkdown}</Markdown>
      </div>
    </section>
  );
}

export function VantageView({ children }: { children: React.ReactNode }) {
  return (
    <section
      id="the-vantage-position"
      className="scroll-mt-36 border-l-4 border-primary bg-primary-light/45 px-5 py-9 sm:px-8 md:scroll-mt-28"
      aria-labelledby="vantage-view-title"
    >
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
        Vantage view
      </p>
      <h2 id="vantage-view-title" className="mt-2 text-3xl font-bold tracking-tight">
        Career resilience is not workforce reform
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function VerificationPanel({ children }: { children: React.ReactNode }) {
  return (
    <section
      id="verification-and-corrections"
      className="scroll-mt-36 border border-border bg-white p-5 shadow-sm sm:p-7 md:scroll-mt-28"
      aria-labelledby="verification-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary">
            Evidence and accountability
          </p>
          <h2 id="verification-title" className="mt-2 text-3xl font-bold tracking-tight">
            Verification and corrections
          </h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1.5 text-xs font-bold text-primary-dark">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Checked to 14 August 2026
        </span>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function CareerAlertsCta({ story }: { story: Story }) {
  return (
    <section
      id="career-alerts"
      className="border-y border-border bg-navy px-5 py-10 text-white sm:px-8 md:py-12"
      aria-labelledby="career-alerts-title"
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-deep-teal">
            Do not miss the next opportunity
          </p>
          <h2 id="career-alerts-title" className="mt-2 text-3xl font-bold tracking-tight">
            Get verified Vantage career alerts
          </h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-white/70">
            Scholarships, research roles, internships, training opportunities and
            major updates for Ugandan health professionals.
          </p>
          <div className="mt-6 max-w-md">
            <NewsletterForm
              light
              idPrefix="career-alerts"
              submitLabel="Get career alerts"
            />
          </div>
        </div>

        <div className="border-t border-white/15 pt-7 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-white/65">
            Help keep this guide useful
          </h3>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center rounded-lg border border-white/30 px-4 py-2 text-sm font-bold text-white hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal"
            >
              Report an opportunity
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center rounded-lg border border-white/30 px-4 py-2 text-sm font-bold text-white hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal"
            >
              Report a correction
            </Link>
          </div>
          <div className="mt-7 rounded-lg bg-white p-4 text-foreground">
            <ArticleShareButtons slug={story.slug} title={story.title} />
          </div>
        </div>
      </div>
    </section>
  );
}

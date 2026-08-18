import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/shared/Container";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ImageOrPlaceholder } from "@/components/shared/ImageOrPlaceholder";
import {
  brandColors,
  semanticColors,
  programmeColours,
  contrastRatio,
  type ProgrammeToken,
} from "@/lib/design-tokens";
import {
  HeartPulse,
  GraduationCap,
  Droplets,
  HandHeart,
  Lightbulb,
  Beaker,
  Sprout,
  AlertTriangle,
  ArrowRight,
  Check,
  X,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Brand Guide",
  description:
    "Visual identity system for Vantage Foundation Uganda — logos, colours, typography, components, and usage rules.",
  robots: { index: false, follow: false },
};

const sectionWrap = "py-16 md:py-24";
const subsectionTitle = "text-2xl font-bold tracking-tight";
const subLabel = "text-sm font-semibold uppercase tracking-wider text-primary";

// ---- Colour swatch ----
function Swatch({
  name,
  hex,
  token,
  on,
  ratio,
}: {
  name: string;
  hex: string;
  token: string;
  on?: string;
  ratio?: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
      <div
        className="flex h-24 items-end p-3"
        style={{ backgroundColor: hex, color: on ?? "#ffffff" }}
      >
        <span className="text-xs font-semibold uppercase tracking-wider">{hex}</span>
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold">{name}</p>
        <p className="mt-0.5 font-mono text-xs text-muted-foreground">{token}</p>
        {ratio && (
          <p className="mt-1 text-xs text-muted-foreground">Contrast on white: {ratio}</p>
        )}
      </div>
    </div>
  );
}

function ratioLabel(r: number) {
  const pass = r >= 4.5 ? "AA" : r >= 3 ? "AA-large" : "fail";
  return `${r.toFixed(1)}:1 (${pass})`;
}

// ---- Programme chip ----
function ProgrammeChip({ p }: { p: ProgrammeToken }) {
  const icons: Record<string, React.ReactNode> = {
    health: <HeartPulse className="h-5 w-5" aria-hidden="true" />,
    education: <GraduationCap className="h-5 w-5" aria-hidden="true" />,
    water: <Droplets className="h-5 w-5" aria-hidden="true" />,
    humanitarian: <HandHeart className="h-5 w-5" aria-hidden="true" />,
    youth: <Lightbulb className="h-5 w-5" aria-hidden="true" />,
    research: <Beaker className="h-5 w-5" aria-hidden="true" />,
    environment: <Sprout className="h-5 w-5" aria-hidden="true" />,
    alert: <AlertTriangle className="h-5 w-5" aria-hidden="true" />,
  };
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-white p-4">
      <span
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${p.hex}1a`, color: p.hex }}
      >
        {icons[p.id]}
      </span>
      <div>
        <p className="text-sm font-semibold">{p.label}</p>
        <p className="font-mono text-xs text-muted-foreground">{p.hex}</p>
      </div>
    </div>
  );
}

const navSections = [
  { id: "foundations", label: "Foundations" },
  { id: "logo", label: "Logo" },
  { id: "colour", label: "Colour" },
  { id: "typography", label: "Typography" },
  { id: "components", label: "Components" },
  { id: "programme", label: "Programme Colours" },
  { id: "icons", label: "Iconography" },
  { id: "photography", label: "Photography" },
  { id: "accessibility", label: "Accessibility" },
  { id: "downloads", label: "Downloads" },
];

export default function BrandGuidePage() {
  const white = "#ffffff";
  const navyOnWhite = ratioLabel(contrastRatio(semanticColors.foreground, white));
  const tealOnWhite = ratioLabel(contrastRatio(semanticColors.primary, white));
  const deepTealOnWhite = ratioLabel(contrastRatio(brandColors.deepTeal, white));
  const whiteOnTeal = ratioLabel(contrastRatio(white, semanticColors.primary));
  const whiteOnNavy = ratioLabel(contrastRatio(white, semanticColors.foreground));
  const mutedOnWhite = ratioLabel(contrastRatio(semanticColors.mutedForeground, white));
  const aquaOnWhite = ratioLabel(contrastRatio(semanticColors.primaryLight, white));

  return (
    <>
      {/* Hero */}
      <section className="bg-navy py-20 text-white md:py-28">
        <Container>
          <p className={subLabel} style={{ color: brandColors.brightAqua }}>
            Visual Identity System
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Vantage Foundation Uganda Brand Guide
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/90">
            The complete visual identity system — logos, colours, typography,
            components, and usage rules. Use this guide to keep every
            communication recognisable, credible, and consistent.
          </p>
          <p className="mt-6 text-sm text-white/70">
            Change the World One Advantage at a Time
          </p>
        </Container>
      </section>

      {/* Sticky in-page nav */}
      <nav
        className="sticky top-16 z-30 border-b border-border bg-white/95 backdrop-blur"
        aria-label="Brand guide sections"
      >
        <Container>
          <ul className="flex gap-4 overflow-x-auto py-3 text-sm">
            {navSections.map((s) => (
              <li key={s.id} className="shrink-0">
                <Link
                  href={`#${s.id}`}
                  className="font-medium text-muted-foreground hover:text-primary"
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </nav>

      {/* Foundations */}
      <section id="foundations" className={sectionWrap}>
        <Container>
          <p className={subLabel}>01 — Foundations</p>
          <h2 className={`mt-2 ${subsectionTitle}`}>Brand foundations</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">
              <h3 className="text-lg font-semibold">Mission</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                To change the world one advantage at a time by developing
                sustainable, community-driven solutions in health, education,
                humanitarian assistance, research, youth empowerment, and
                livelihood improvement.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold">Vision</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Improved livelihoods in Ugandan and East African communities.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold">Personality</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Compassionate, professional, trustworthy, youthful, progressive,
                evidence-based, transparent, hopeful, community-led, resilient,
                practical, future-focused.
              </p>
            </Card>
          </div>
          <div className="mt-6">
            <h3 className="text-base font-semibold">Core values</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "Growth",
                "Sustainability",
                "Safety",
                "Inclusivity",
                "Integrity",
                "Compassion",
                "Excellence",
                "Transparency",
                "Community participation",
                "Innovation",
              ].map((v) => (
                <Badge key={v} variant="default">
                  {v}
                </Badge>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Logo */}
      <section id="logo" className={`${sectionWrap} bg-surface`}>
        <Container>
          <p className={subLabel}>02 — Logo</p>
          <h2 className={`mt-2 ${subsectionTitle}`}>Logo system</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            The Vantage Foundation Uganda logo has three lockup variants. Use the
            horizontal lockup for headers and signatures, the primary stacked
            lockup for formal documents and covers, and the symbol-only mark for
            favicons, social profiles, and small applications.
          </p>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <Card className="flex flex-col items-center justify-center p-8">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Primary / stacked
              </p>
              <Logo variant="primary" height={120} alt="Vantage Foundation Uganda primary logo" />
            </Card>
            <Card className="flex flex-col items-center justify-center p-8">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Horizontal
              </p>
              <Logo variant="horizontal" height={64} alt="Vantage Foundation Uganda horizontal logo" />
            </Card>
            <Card className="flex flex-col items-center justify-center p-8">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Symbol only
              </p>
              <Logo variant="symbol" height={96} alt="Vantage Foundation Uganda symbol" />
            </Card>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold">Clear space</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Maintain clear space around the logo equal to the height of the
                &ldquo;V&rdquo; in the symbol on all sides. Never let text,
                images, or other elements enter this margin.
              </p>
              <div className="mt-4 rounded-lg border-2 border-dashed border-primary/40 p-6">
                <div className="flex items-center justify-center bg-surface px-8 py-6">
                  <Logo variant="horizontal" height={48} alt="Clear space example" />
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold">Minimum sizes</h3>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                <li>
                  <strong className="text-foreground">Digital:</strong> horizontal
                  lockup minimum height 32px; symbol minimum 24px.
                </li>
                <li>
                  <strong className="text-foreground">Print:</strong> horizontal
                  lockup minimum width 25mm; primary stacked minimum width 30mm.
                </li>
                <li>
                  <strong className="text-foreground">Favicon:</strong> use the
                  symbol only, never the full lockup.
                </li>
              </ul>
            </Card>
          </div>

          <div className="mt-10">
            <h3 className="text-lg font-semibold">Logo misuse — never do this</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                "Stretch or compress",
                "Rotate or skew",
                "Recolour with unapproved colours",
                "Add shadows or outlines",
                "Place on noisy backgrounds",
                "Recreate with different fonts",
                "Separate the symbol from the wordmark",
                "Place inside arbitrary shapes",
              ].map((misuse) => (
                <div
                  key={misuse}
                  className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive-bg p-3"
                >
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
                  <span className="text-xs text-destructive-fg">{misuse}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-success/30 bg-success-bg p-4">
            <p className="text-sm text-success-fg">
              <strong>All logo variants are now true vector SVGs</strong> (under 15 KB each,
              scalable from 24px to signage size). Monochrome and dark-background variants
              are available in <code className="font-mono">public/brand/logos/</code>.
              See <code className="font-mono">docs/brand/logo-guidelines.md</code>.
            </p>
          </div>
        </Container>
      </section>

      {/* Colour */}
      <section id="colour" className={sectionWrap}>
        <Container>
          <p className={subLabel}>03 — Colour</p>
          <h2 className={`mt-2 ${subsectionTitle}`}>Colour system</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Exactly three dominant colours, roughly a third each: teal, white,
            and black/dark charcoal for text and dark sections. Target ratio:
            ~33% white/neutral, ~33% teal, ~33% black/charcoal.
          </p>

          <h3 className="mt-10 text-lg font-semibold">Primary palette</h3>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Teal Primary only reaches {deepTealOnWhite} on white — short of
            WCAG AA&rsquo;s 4.5:1 for normal text — so it&rsquo;s reserved for large
            text/surfaces (24px+, which only needs 3:1). Teal Dark backs
            <code className="mx-1 rounded bg-surface-strong px-1 py-0.5 font-mono text-xs">--primary</code>
            everywhere text- and button-sized contrast matters.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Swatch name="Teal Primary" hex={brandColors.deepTeal} token="Large text/surfaces only" on="#ffffff" ratio={deepTealOnWhite} />
            <Swatch name="Teal Dark" hex={brandColors.oceanBlue} token="--primary" on="#ffffff" ratio={tealOnWhite} />
            <Swatch name="Teal Light" hex={brandColors.brightAqua} token="--primary-light" on="#050708" ratio={aquaOnWhite} />
            <Swatch name="Black" hex={brandColors.darkNavy} token="--foreground / --navy" on="#ffffff" ratio={navyOnWhite} />
            <Swatch name="Dark Charcoal" hex={brandColors.charcoal} token="--charcoal" on="#ffffff" />
            <Swatch name="White" hex={brandColors.white} token="--background" on="#050708" />
          </div>

          <h3 className="mt-10 text-lg font-semibold">Accessible pairings</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Swatch name="White on Teal Dark" hex={brandColors.oceanBlue} token="text on primary" on="#ffffff" ratio={whiteOnTeal} />
            <Swatch name="White on Navy" hex={brandColors.darkNavy} token="text on navy" on="#ffffff" ratio={whiteOnNavy} />
            <Swatch name="Muted on White" hex={semanticColors.mutedForeground} token="muted-foreground" on="#ffffff" ratio={mutedOnWhite} />
          </div>

          <div className="mt-6 rounded-lg border border-border bg-surface p-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Warning:</strong> Teal
              Primary ({brandColors.deepTeal.toUpperCase()}) reaches only{" "}
              {deepTealOnWhite} as text on white — below WCAG AA&rsquo;s 4.5:1 for
              normal text. Use it for large text/surfaces only (24px+, 3:1
              threshold); use Teal Dark for body text, links and buttons.
              Teal Light ({brandColors.brightAqua.toUpperCase()}) is a pale
              wash — use it only for fills, decorative accents, and large
              non-text elements, never for body text or links.
            </p>
          </div>
        </Container>
      </section>

      {/* Typography */}
      <section id="typography" className={`${sectionWrap} bg-surface`}>
        <Container>
          <p className={subLabel}>04 — Typography</p>
          <h2 className={`mt-2 ${subsectionTitle}`}>Typography</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Inter is the primary typeface, loaded via next/font/google with a
            robust system-font fallback. Avoid excessive uppercase — reserve it
            for short labels and eyebrows.
          </p>

          <div className="mt-8 space-y-6">
            <div className="rounded-lg border border-border bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Display</p>
              <p className="mt-1 text-xs text-muted-foreground">56px / 700 / 1.1 / -0.02em</p>
              <p className="mt-2 text-5xl font-bold tracking-tight">
                Improved livelihoods
              </p>
            </div>
            <div className="rounded-lg border border-border bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">H1 — Page title</p>
              <p className="mt-1 text-xs text-muted-foreground">40px / 700 / 1.15</p>
              <p className="mt-2 text-4xl font-bold tracking-tight">
                Kasaale deep borehole project
              </p>
            </div>
            <div className="rounded-lg border border-border bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">H2 — Section</p>
              <p className="mt-1 text-xs text-muted-foreground">30px / 600 / 1.2</p>
              <p className="mt-2 text-3xl font-semibold">
                Our programme areas
              </p>
            </div>
            <div className="rounded-lg border border-border bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">H3 — Subsection</p>
              <p className="mt-1 text-xs text-muted-foreground">24px / 600 / 1.3</p>
              <p className="mt-2 text-2xl font-semibold">
                Community water access
              </p>
            </div>
            <div className="rounded-lg border border-border bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Body large</p>
              <p className="mt-1 text-xs text-muted-foreground">18px / 400 / 1.6</p>
              <p className="mt-2 text-lg leading-relaxed">
                Vantage Foundation Uganda works with communities to deliver
                sustainable, evidence-driven solutions across health, education,
                water, and humanitarian assistance.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Body / Caption / Overline</p>
              <p className="mt-2 text-base leading-relaxed">
                Body 16px — standard paragraph text for articles, descriptions, and reports.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Body small 14px — secondary information and metadata.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Caption 12px — photo credits, footnotes, table annotations.
              </p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-primary">
                Overline — eyebrow label
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Components */}
      <section id="components" className={sectionWrap}>
        <Container>
          <p className={subLabel}>05 — Components</p>
          <h2 className={`mt-2 ${subsectionTitle}`}>UI components</h2>

          <h3 className="mt-8 text-lg font-semibold">Buttons</h3>
          <div className="mt-4 flex flex-wrap gap-4">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="ghost">Ghost</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
          </div>
          <div className="mt-4 rounded-lg bg-navy p-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/70">
              On dark background
            </p>
            <div className="flex flex-wrap gap-3">
              <Button>Primary</Button>
              <Button variant="outline" className="text-white">Outline</Button>
            </div>
          </div>

          <h3 className="mt-10 text-lg font-semibold">Badges</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            <Badge>Default</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>

          <h3 className="mt-10 text-lg font-semibold">Cards</h3>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">
              <h4 className="text-lg font-semibold">Project card</h4>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Cards use rounded-xl corners, subtle shadow, and consistent
                padding. Hover states elevate the shadow.
              </p>
              <div className="mt-4">
                <Button href="#" size="sm" variant="outline">
                  Learn more <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
            <Card className="p-6">
              <h4 className="text-lg font-semibold">Impact stat</h4>
              <p className="mt-2 text-4xl font-bold text-primary">5,000+</p>
              <p className="mt-1 text-sm text-muted-foreground">people reached</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Source: Vantage Foundation field records, 2024.
              </p>
            </Card>
            <Card className="p-6">
              <h4 className="text-lg font-semibold">Quote</h4>
              <blockquote className="mt-2 text-sm italic leading-relaxed text-muted-foreground">
                &ldquo;The borehole means our children no longer walk hours for
                water. They can stay in school.&rdquo;
              </blockquote>
              <p className="mt-3 text-xs font-semibold">— Community member, Kasaale</p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Programme colours */}
      <section id="programme" className={`${sectionWrap} bg-surface`}>
        <Container>
          <p className={subLabel}>06 — Programme colours</p>
          <h2 className={`mt-2 ${subsectionTitle}`}>Programme accent colours</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Each programme area has a recognisable accent colour, always paired
            with an icon and text label. Colour is never the sole means of
            conveying category (WCAG 2.2 §1.4.1).
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.values(programmeColours).map((p) => (
              <ProgrammeChip key={p.id} p={p} />
            ))}
          </div>
        </Container>
      </section>

      {/* Iconography */}
      <section id="icons" className={sectionWrap}>
        <Container>
          <p className={subLabel}>07 — Iconography</p>
          <h2 className={`mt-2 ${subsectionTitle}`}>Iconography</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Icons are outlined, rounded, and consistent in stroke weight (Lucide).
            They support programme categorisation and wayfinding. Use at
            1.25rem default, 1.5rem for feature contexts.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {[
              { icon: HeartPulse, label: "Health" },
              { icon: GraduationCap, label: "Education" },
              { icon: Droplets, label: "Water & WASH" },
              { icon: HandHeart, label: "Humanitarian" },
              { icon: Lightbulb, label: "Youth" },
              { icon: Beaker, label: "Research" },
              { icon: Sprout, label: "Environment" },
              { icon: AlertTriangle, label: "Alert" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 rounded-lg border border-border bg-white p-4"
              >
                <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Photography */}
      <section id="photography" className={`${sectionWrap} bg-surface`}>
        <Container>
          <p className={subLabel}>08 — Photography</p>
          <h2 className={`mt-2 ${subsectionTitle}`}>Photography direction</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Authentic Vantage Foundation photography is the primary visual asset.
            Prioritise real communities, volunteers in action, field
            implementation, and visible results. Avoid pity-based imagery and
            dehumanising close-ups.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <figure>
              <div className="overflow-hidden rounded-xl">
                <ImageOrPlaceholder
                  src="/images/photos/photo-003.webp"
                  alt="Volunteers and community members unload supplies from a pickup truck."
                  width={600}
                  height={400}
                  preset="card"
                />
              </div>
              <figcaption className="mt-2 text-xs text-muted-foreground">
                Humanitarian distribution — landscape 3:2 crop
              </figcaption>
            </figure>
            <figure>
              <div className="overflow-hidden rounded-xl">
                <ImageOrPlaceholder
                  src="/images/photos/photo-001.webp"
                  alt="Two staff members hand drink bottles to a child at a wooden table."
                  width={600}
                  height={450}
                  preset="card"
                />
              </div>
              <figcaption className="mt-2 text-xs text-muted-foreground">
                Community outreach — portrait 4:5 crop
              </figcaption>
            </figure>
            <figure>
              <div className="overflow-hidden rounded-xl">
                <ImageOrPlaceholder
                  src="/images/photos/photo-004.webp"
                  alt="Four young adults smile together at a Financial Literacy event."
                  width={600}
                  height={400}
                  preset="card"
                />
              </div>
              <figcaption className="mt-2 text-xs text-muted-foreground">
                Education programme — landscape crop
              </figcaption>
            </figure>
          </div>
          <div className="mt-6 rounded-lg border border-border bg-white p-4">
            <h3 className="text-sm font-semibold">Crop presets</h3>
            <ul className="mt-2 text-xs text-muted-foreground">
              <li>Hero landscape 16:9 · Feature 3:2 · Card 4:3 · Square 1:1 · Portrait 4:5</li>
              <li>Social portrait 9:16 · Social square 1:1 · Social landscape 1.91:1</li>
            </ul>
          </div>
        </Container>
      </section>

      {/* Accessibility */}
      <section id="accessibility" className={sectionWrap}>
        <Container>
          <p className={subLabel}>09 — Accessibility</p>
          <h2 className={`mt-2 ${subsectionTitle}`}>Accessibility</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            The brand system targets WCAG 2.2 AA. Colour contrast, keyboard
            focus, semantic structure, and reduced-motion support are built in.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              "Body text contrast ≥ 4.5:1 (navy on white = 16:1)",
              "Large text and UI ≥ 3:1",
              "Visible keyboard focus on all interactive elements",
              "Semantic HTML with correct heading hierarchy",
              "Descriptive alt text on all meaningful images",
              "Reduced-motion support via prefers-reduced-motion",
              "No information conveyed by colour alone",
              "Touch-friendly controls (min 44×44px)",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-2 rounded-lg border border-success/30 bg-success-bg p-3"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                <span className="text-sm text-success-fg">{item}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Downloads */}
      <section id="downloads" className={`${sectionWrap} bg-navy text-white`}>
        <Container>
          <p className={subLabel} style={{ color: brandColors.brightAqua }}>
            10 — Downloads
          </p>
          <h2 className={`mt-2 ${subsectionTitle} text-white`}>Approved assets</h2>
          <p className="mt-3 max-w-2xl text-white/80">
            All logo files are true vector SVG (under 15 KB each, scalable to any size).
            Files live in <code className="font-mono text-white">public/brand/logos/</code>.
            Do not redistribute proprietary fonts.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Primary logo (SVG)", path: "/brand/logos/vantage-logo-primary.svg" },
              { name: "Primary — dark bg (SVG)", path: "/brand/logos/vantage-logo-primary-dark.svg" },
              { name: "Horizontal logo (SVG)", path: "/brand/logos/vantage-logo-horizontal.svg" },
              { name: "Horizontal — dark bg (SVG)", path: "/brand/logos/vantage-logo-horizontal-light.svg" },
              { name: "Symbol (SVG)", path: "/brand/logos/vantage-symbol.svg" },
              { name: "Monochrome white (SVG)", path: "/brand/logos/vantage-logo-primary-monochrome-white.svg" },
              { name: "Monochrome black (SVG)", path: "/brand/logos/vantage-logo-primary-monochrome-black.svg" },
              { name: "Grayscale (SVG)", path: "/brand/logos/vantage-logo-primary-grayscale.svg" },
            ].map((asset) => (
              <a
                key={asset.name}
                href={asset.path}
                className="flex items-center justify-between rounded-lg border border-white/20 bg-white/5 p-4 transition-colors hover:border-white/40 hover:bg-white/10"
              >
                <span className="text-sm font-medium">{asset.name}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            ))}
          </div>
          <p className="mt-6 text-xs text-white/60">
            Full documentation: <code className="font-mono">docs/brand/</code> and{" "}
            <code className="font-mono">docs/design-tokens.md</code>
          </p>
        </Container>
      </section>
    </>
  );
}

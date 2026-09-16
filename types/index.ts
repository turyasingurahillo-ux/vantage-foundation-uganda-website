export interface NavItem {
  label: string;
  href: string;
}

export interface NavDropdownItem {
  label: string;
  href: string;
}

export interface NavEntry {
  label: string;
  href: string;
  children?: NavDropdownItem[];
}

export interface OfficeLocation {
  label: string;
  city: string;
  region: string;
  country: string;
}

export interface ContactInfo {
  /**
   * Public-facing contact alias, shown only when an administrator has actually
   * created and verified a domain alias (set via NEXT_PUBLIC_CONTACT_EMAIL).
   * Undefined by default so the site publishes no address rather than a
   * fictional one. Vantage's protected operational mailbox is NEVER stored
   * here — it is server-only, in lib/contact-inbox.ts.
   */
  publicEmail?: string;
  phone: string;
  /**
   * WhatsApp quick-contact number, displayed as the prominent quick-contact
   * CTA across the public site. Stored in E.164-ish display form
   * (e.g. "+256 786 585 216"); the WhatsApp helper normalises it to digits
   * for the wa.me URL. This is a public contact channel — it is NOT the
   * protected operational mailbox.
   */
  whatsapp: string;
  address: string;
  city: string;
  country: string;
  offices: OfficeLocation[];
}

export interface SocialLinks {
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  youtube?: string;
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode: string;
}

export interface SiteConfig {
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  mission: string;
  vision: string;
  values: string[];
  founded: string;
  contact: ContactInfo;
  socials: SocialLinks;
  bankDetails: BankDetails;
  nav: NavEntry[];
  primaryCta: NavItem;
  secondaryCta: NavItem;
  url: string;
}

export type ProjectCategory =
  | "Health"
  | "Education"
  | "Humanitarian Aid"
  | "Water & Sanitation"
  | "Youth Leadership";

/**
 * The six public programme portfolios from the 2026 blueprint architecture.
 * These replace the legacy four/five-area structure (`content/areas.ts`,
 * now `content/programmes.ts`). A project's `category` (above) remains a
 * display label; `primaryProgramme` / `relatedProgrammes` are the canonical
 * taxonomy. Vantage Point is deliberately NOT a member — it is a
 * cross-programme platform, modelled separately in content/vantage-point.ts.
 */
export type ProgrammeId =
  | "health-wellbeing"
  | "education-learning"
  | "financial-capability-economic-opportunity"
  | "food-basic-needs"
  | "humanitarian-vulnerability-protection"
  | "youth-leadership-participation";

/**
 * Maturity/state of a portfolio — distinct from `ProjectStatus` (a specific
 * intervention) and `EvidenceStatus` (the epistemic status of a claim).
 * A portfolio may be "active" while containing planned projects, and a
 * "developing" portfolio communicates direction without claiming results.
 */
export type ProgrammeStatus =
  | "active"
  | "developing"
  | "pilot"
  | "planned";

/**
 * An external evidence source cited by a portfolio's context section.
 * Only cite sources that are actually present in repository content —
 * never add a citation merely to fill the model.
 */
export interface ProgrammeEvidenceReference {
  label: string;
  href?: string;
  evidenceStatus?: EvidenceStatus;
}

/**
 * A single programme-level result figure. `evidenceStatus` is REQUIRED —
 * a result is never published without declaring what kind of claim it is.
 * Distinguish results (measured) from targets (planned) and estimates
 * (e.g. Kasaale's estimated catchment, which is not a beneficiary count).
 */
export interface ProgrammeResult {
  value: string;
  label: string;
  evidenceStatus: EvidenceStatus;
  /** How the figure was derived — preserve methodology where it exists. */
  methodology?: string;
  /** Provenance — e.g. the project page or impact stat this comes from. */
  sourceHref?: string;
  /** As-of date where the figure is time-bound. */
  asOf?: string;
}

/** Honest institutional learning/reflection tied to a portfolio. */
export interface ProgrammeLearning {
  title: string;
  body: string;
  /** Optional link to a fuller reflection (e.g. a story). */
  href?: string;
}

/**
 * An organisation relevant to the change pathway. `kind` distinguishes an
 * actual Vantage partner (a documented relationship) from a broader
 * ecosystem actor (public systems, referral destinations, community
 * actors) — never label an ecosystem actor a "partner".
 */
export interface ProgrammeActor {
  name: string;
  kind: "partner" | "ecosystem";
  note?: string;
}

/**
 * A public programme portfolio — what outcome area Vantage works in and
 * why, what it does, which projects implement it, what evidence exists,
 * what has been learned, who else matters, and what comes next.
 * Optional sections are honest: absence of evidence is rendered as an
 * absence of evidence, never as invented maturity.
 */
export interface Programme {
  slug: ProgrammeId;
  /** Portfolio display name, e.g. "Health & Wellbeing". */
  title: string;
  /** Branded programme name within the portfolio, e.g. "Vantage Care". */
  programmeName?: string;
  status: ProgrammeStatus;
  /** Short public framing — who/what the portfolio is about. */
  summary: string;
  /** What Vantage is trying to change — positioning, not a measured result. */
  outcomeHeadline: string;
  whyThisMatters: {
    heading?: string;
    body: string[];
    evidence?: ProgrammeEvidenceReference[];
  };
  approach: {
    heading?: string;
    body: string;
    items?: string[];
  };
  results?: ProgrammeResult[];
  learning?: ProgrammeLearning[];
  actors?: ProgrammeActor[];
  /** Forward-looking priorities — rendered as such, never as achievements. */
  nextPriorities?: string[];
  cta?: {
    label: string;
    href: string;
  };
  /** External platform callout (e.g. KikumiKyo Academy's learning hub). */
  externalPlatformLink?: {
    label: string;
    href: string;
    description: string;
  };
  /** Small card accent icon id (mapped in components/shared/AreaIcon). */
  icon?: string;
  image?: string;
  imageAlt?: string;
  /**
   * Legacy `/programmes/{id}` slugs that redirect to this portfolio.
   * Used for media-tag lookups and backward-compatible resolution —
   * redirects themselves live in next.config.ts.
   */
  legacySlugs?: string[];
  published?: boolean;
}

/**
 * Vantage Point — the cross-programme learning and dialogue platform.
 * Structurally separate from the six portfolios: the portfolios answer
 * "where does Vantage seek outcomes?", Vantage Point answers "how does
 * Vantage connect learning, dialogue, evidence and community/youth voice
 * across them?".
 */
export interface VantagePoint {
  slug: "vantage-point";
  title: string;
  status: ProgrammeStatus;
  summary: string;
  /** What the platform is for. */
  purpose: string;
  /** Functions the platform performs or is designed to perform. */
  functions: string[];
  /** How it relates to the six portfolios (rendered as text, not a diagram). */
  relationship: string;
  /** How future evidence/learning will be surfaced through it. */
  surfacing: string;
  cta?: {
    label: string;
    href: string;
  };
  image?: string;
  imageAlt?: string;
}

/**
 * One layer of the public Theory of Change. `kind` is fixed — the
 * organizational ToC has exactly these four causal layers, in order:
 * context/problems → interventions → intermediate outcomes →
 * longer-term outcomes. Positioning language only ("we expect",
 * "we seek") — a layer is never a measured result.
 */
export interface TocLayer {
  kind: "context" | "interventions" | "intermediate" | "longTerm";
  title: string;
  /** Positioning description of this layer. */
  description: string;
  /** The items that populate the layer (problems, approaches, outcomes). */
  items: string[];
}

/**
 * A named assumption underpinning the Theory of Change. Assumptions are
 * things Vantage depends on but does not control — they are exposed so
 * readers can see where the logic could break. Never presented as
 * evidence.
 */
export interface TocAssumption {
  title: string;
  body: string;
}

/**
 * An external actor category the ToC depends on. `kind` distinguishes
 * documented Vantage partners from ecosystem actors (public systems,
 * referral services, community structures) — same distinction as
 * ProgrammeActor in PR-3.
 */
export interface TocExternalActor {
  name: string;
  kind: "partner" | "ecosystem";
  note?: string;
}

/**
 * One concept in the public measurement framework — how Vantage talks
 * about what it counts. `kind` distinguishes outputs (delivered),
 * reach (who was reached), outcomes (what changed), context/catchment
 * (potential beneficiaries — not reach), and targets (intended, not
 * achieved).
 */
export interface MeasurementConcept {
  kind: "output" | "reach" | "outcome" | "catchment" | "target";
  title: string;
  body: string;
  /** A concrete in-repo example, where one exists. */
  example?: string;
}

/**
 * The organization's public Theory of Change — the causal logic Vantage
 * believes leads to change, with its assumptions, dependencies and
 * learning loop made visible. Blueprint-derived organizational logic;
 * NOT measured evidence.
 */
export interface TheoryOfChange {
  /** The concise public ToC statement. */
  statement: string[];
  /** Exactly four layers, ordered context → interventions → intermediate → longTerm. */
  layers: TocLayer[];
  assumptions: TocAssumption[];
  externalActors: TocExternalActor[];
  measurement: MeasurementConcept[];
  /**
   * The learning/adaptation loop: implement → observe/measure → learn →
   * adapt. Describes the intended discipline, not a claim that a formal
   * evaluation system already exists.
   */
  learningLoop: string[];
}

/**
 * An item in the public evidence library — an inspectable evidence or
 * learning output. Distinct from Report (formal organizational reporting
 * documents): the library is where results briefs, learning notes,
 * research outputs, evaluations and evidence summaries surface.
 */
export type EvidenceItemType =
  | "results-brief"
  | "learning-note"
  | "research"
  | "evaluation"
  | "evidence-summary"
  | "external-evidence";

export interface EvidenceItem {
  id: string;
  title: string;
  type: EvidenceItemType;
  summary: string;
  /** Portfolios the item relates to — resolved by slug, not by title. */
  programmeIds?: ProgrammeId[];
  projectSlugs?: string[];
  evidenceStatus?: EvidenceStatus;
  date?: string;
  /** Provenance label — who produced or holds this item. */
  sourceLabel?: string;
  /** Public destination — internal route or external URL. */
  href?: string;
  methodology?: string;
  /** When the item was last reviewed/approved for publication. */
  reviewedAt?: string;
}

/**
 * Cross-cutting themes a project can address. A project selects one or more
 * themes so it can surface on every relevant programme/theme page without
 * duplicating its source data. Themes are intentionally distinct from
 * programmes (the "what we do" pillars) and from content types (story/insight).
 */
export type ProjectTheme =
  | "Maternal & Child Health"
  | "Sexual & Reproductive Health"
  | "Mental Health"
  | "Preventive Healthcare"
  | "Financial Literacy"
  | "Youth Empowerment"
  | "Menstrual Health"
  | "Education"
  | "Water"
  | "Sanitation"
  | "Humanitarian Relief"
  | "Food Security"
  | "Disability Inclusion"
  | "Leadership"
  | "Community Development"
  | "Mentorship";

export type ProjectStatus = "Active" | "Completed" | "Planned";

/**
 * A social-card image, described the way Open Graph and the Twitter card
 * markup want it: an explicit size and MIME type alongside the URL, so a
 * crawler never has to download and decode the file to size the card.
 *
 * `url` is a site-relative path (e.g. /images/social/my-story-og.jpg); it is
 * made absolute at render time. See `lib/social-image.ts` for which formats
 * are safe to hand to a crawler and why.
 */
export interface SocialImageSource {
  url: string;
  width?: number;
  height?: number;
  /** Falls back to the item's hero-image alt text, then its title. */
  alt?: string;
  /** e.g. "image/jpeg". Derived from the file extension when omitted. */
  type?: string;
}

/**
 * SEO metadata for a content item. When omitted, the item's title and
 * summary/excerpt are used as fallbacks.
 */
export interface SeoMeta {
  title?: string;
  description?: string;
  /**
   * Path to a custom OG image (e.g. /images/og/project-slug.png).
   *
   * Prefer `socialImage`, which also carries the dimensions and MIME type
   * that link previews need. This remains for items whose card is a bare
   * path and whose size is not known.
   */
  ogImage?: string;
  /**
   * Dedicated social card for this item. Takes precedence over `ogImage`
   * and the hero image. Build one with `socialCard()` from
   * `lib/social-image.ts` after running `npm run generate:social`.
   */
  socialImage?: SocialImageSource;
}

/**
 * Consent classification for media featuring people, especially children
 * and vulnerable adults.
 *
 * - `none`: No people featured (landscape, object, text).
 * - `verified`: Written consent on file for all identifiable individuals.
 * - `pending`: Consent being sought; do NOT publish until verified.
 * - `group-consent`: Community/group leader consent obtained (e.g. for
 *   crowds or wide shots where individual consent is impractical).
 *   Use sparingly and only where individuals are not identifiable.
 */
export type ConsentClassification =
  | "none"
  | "verified"
  | "pending"
  | "group-consent";

/**
 * A document attached to a project (e.g. project report, budget, MoU).
 */
export interface ProjectDocument {
  title: string;
  /** Path to the file in public/ or an external URL. */
  url: string;
  /** Document type for grouping/filtering. */
  type?: "report" | "budget" | "agreement" | "other";
  date?: string;
  description?: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: ProjectCategory;
  status: ProjectStatus;
  location: string;
  date: string;
  summary: string;
  heroImage?: string;
  /** Alt text for the hero image. Falls back to the project title when omitted. */
  heroImageAlt?: string;
  objective?: string;
  activities?: string[];
  outcomes?: string[];
  beneficiaries?: string;
  partners?: string[];
  gallery?: string[];
  relatedStorySlugs?: string[];
  body?: string;
  cta?: {
    label: string;
    href: string;
  };
  // --- Phase 4 extensions (all optional for backward compatibility) ---
  /** ISO date string (YYYY-MM-DD) for the formal reporting period start. */
  reportingPeriod?: { start?: string; end?: string };
  /** Funding progress, e.g. "UGX 12,000,000 of UGX 20,000,000 raised". */
  fundingStatus?: string;
  /** ISO date string (YYYY-MM-DD) for project start. */
  startDate?: string;
  /** ISO date string (YYYY-MM-DD) for project end (omit if ongoing). */
  endDate?: string;
  /** Attached documents (reports, budgets, agreements). */
  documents?: ProjectDocument[];
  /** Per-item SEO overrides. */
  seo?: SeoMeta;
  /**
   * Whether the project is published. Defaults to true when omitted.
   * Unpublished projects are filtered out of production routes but
   * remain visible in development for previewing.
   */
  published?: boolean;
  /**
   * Consent classification for the hero image and gallery. Defaults to
   * "none" when omitted. Set to "pending" to block publishing of media
   * featuring identifiable people until consent is verified.
   */
  consentClassification?: ConsentClassification;
  // --- Taxonomy extensions (all optional for backward compatibility) ---
  /**
   * Canonical primary programme id. When omitted, derived from `category`
   * via programmeIdForCategory. Set explicitly when a project's primary
   * programme differs from its legacy `category` mapping.
   */
  primaryProgramme?: ProgrammeId;
  /**
   * Other portfolios this project also contributes to. A project surfaces
   * on every programme page whose id is in
   * {primaryProgramme, ...relatedProgrammes}. One primary portfolio per
   * project — related portfolios are relevance links, not duplicates.
   */
  relatedProgrammes?: ProgrammeId[];
  /**
   * Cross-cutting themes addressed by this project (e.g. "Menstrual Health",
   * "Financial Literacy"). Used for theme-based filtering and surfacing
   * projects on relevant programme pages without duplicating source data.
   */
  themes?: ProjectTheme[];
  /**
   * Beneficiary groups this project serves (e.g. "Young women", "Orphans").
   * Free-form strings for now; may be enumerated later.
   */
  beneficiaryGroups?: string[];
  /**
   * UN Sustainable Development Goals this project contributes to (numbers 1-17).
   */
  sdgs?: number[];
  /**
   * Whether this project is a flagship/editorial feature. Flagship projects
   * get prominent treatment on the homepage and programme pages.
   */
  flagship?: boolean;
}

export interface Story {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** Editorial presentation used by story listings and guide-specific layouts. */
  contentType?: "Story" | "Insight";
  author?: string;
  /** Schema.org author type. Organisation-authored research should not be marked as a person. */
  authorType?: "Person" | "Organization";
  role?: string;
  date: string;
  /** ISO date string for substantive editorial updates. */
  updatedAt?: string;
  /** Editorially reviewed reading-time estimate. */
  readingTimeMinutes?: number;
  location?: string;
  category: string;
  /** Numeric database id for DB-backed stories (analytics tracking). Null for static stories. */
  dbId?: number;
  heroImage?: string;
  /** Alt text for the hero image. Falls back to the story title when omitted. */
  heroImageAlt?: string;
  /**
   * Visible credit/caption rendered beneath the hero image. Use this to
   * disclose provenance where the image is not documentary Vantage
   * photography (illustration, licensed stock, partner-supplied).
   */
  heroImageCredit?: string;
  /**
   * CSS `object-position` for the hero image wherever it is cropped (page
   * hero, cards, carousel) — e.g. "50% 20%" to hold a subject's face in a
   * wide frame. Omit to use the template default, which biases slightly above
   * centre. Set this per photograph rather than changing the default: the
   * right focus is a property of the image, not of the layout.
   */
  heroImageFocalPoint?: string;
  relatedProjectSlugs?: string[];
  body: string;
  // --- Phase 4 extensions (all optional for backward compatibility) ---
  /** Free-form tags for filtering and related-story matching. */
  tags?: string[];
  /**
   * Consent classification for the hero image and any embedded media.
   * Defaults to "none" when omitted.
   */
  consentClassification?: ConsentClassification;
  /** Per-item SEO overrides. */
  seo?: SeoMeta;
  /** Visible FAQ content that may also be expressed as structured data. */
  faqs?: FaqItem[];
  /**
   * Whether the story is published. Defaults to true when omitted.
   * Unpublished stories are filtered out of production routes but
   * remain visible in development for previewing.
   */
  published?: boolean;
}

export type TeamCategory = "leadership" | "volunteer";

export interface TeamMember {
  id: string;
  slug: string;
  fullName: string;
  displayName: string;
  role: string;
  category: TeamCategory;
  shortBio: string;
  fullBio: string;
  /** Base path without extension/suffix, e.g. "/images/team/omara-godfrey" — square/portrait crops in webp+avif are derived from this. */
  image: string;
  imageAlt: string;
  email?: string;
  linkedin?: string;
  /** Sources for claims in fullBio that go beyond Vantage's own records (e.g. an external partner org's own published page). */
  citations?: { label: string; url: string }[];
  displayOrder: number;
  published: boolean;
}

export interface Partner {
  name: string;
  relationshipType?: string;
  logo?: string;
  logoAlt?: string;
  url?: string;
  description?: string;
}

/**
 * Claim-status taxonomy for public impact and results figures, per the 2026
 * website strategy blueprint. Every published figure must carry an explicit
 * status so planned or estimated work is never presented as achieved impact.
 */
export type EvidenceStatus =
  | "verified"
  | "programme-team-figure"
  | "estimated-catchment"
  | "pilot"
  | "planned"
  | "external-evidence";

/**
 * Provenance metadata for a published claim. `methodology`/`sourceLabel` are
 * plain-text only — never fabricate sources or review dates.
 */
export interface EvidenceMeta {
  status: EvidenceStatus;
  methodology?: string;
  sourceLabel?: string;
  sourceHref?: string;
  asOf?: string;
  lastReviewed?: string;
}

export interface ImpactStat {
  value: string;
  label: string;
  programme: string;
  location: string;
  period: string;
  methodology: string;
  evidenceStatus: EvidenceStatus;
  href: string;
}

export interface Report {
  title: string;
  date: string;
  type: string;
  url?: string;
  description?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * A media asset (photo, video, illustration) in the site's media library.
 *
 * The media manifest (`content/media.ts`) is the single source of truth for
 * all published images. Each entry records consent status, credit, and
 * contextual metadata so editors can verify safeguarding compliance before
 * publishing.
 */
export interface MediaAsset {
  /** Unique id, e.g. "kasaale-borehole-opening-2022". */
  id: string;
  /** Path in public/ or an absolute URL. */
  src: string;
  /** Descriptive alt text based on visible content (no invented names). */
  alt: string;
  /** Optional caption shown below the image. */
  caption?: string;
  /** Photographer or source credit. */
  credit?: string;
  /** ISO date string (YYYY-MM-DD) when the photo was taken. */
  date?: string;
  /** Location where the photo was taken (general, not GPS-specific). */
  location?: string;
  /** Programme area id this image relates to (health, education, etc.). */
  programme?: string;
  /** Project slug this image relates to, if any. */
  projectSlug?: string;
  /** Consent classification for people featured in the image. */
  consent: ConsentClassification;
  /** Notes about consent (e.g. "Verbal consent from headteacher"). */
  consentNotes?: string;
  /** Whether this asset is published. Defaults to true when omitted. */
  published?: boolean;
}

// ---------------------------------------------------------------------------
// Instagram
// ---------------------------------------------------------------------------

export type InstagramMediaType = "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | "REEL";

export interface InstagramMetrics {
  reach?: number;
  impressions?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  views?: number;
  profileVisits?: number;
}

export interface InstagramPost {
  id: string;
  mediaType: InstagramMediaType;
  mediaUrl: string;
  thumbnailUrl?: string;
  permalink: string;
  caption: string;
  timestamp: string;
  username: string;
  metrics: InstagramMetrics;
  score?: number;
  pinned?: boolean;
  hidden?: boolean;
  featuredCampaign?: boolean;
  programmeCategory?: string;
  manuallyAdded?: boolean;
}

export interface InstagramScoreWeights {
  reach: number;
  shares: number;
  saves: number;
  interactions: number;
  freshness: number;
}

export interface InstagramManualPost {
  id: string;
  mediaType: InstagramMediaType;
  mediaUrl: string;
  thumbnailUrl?: string;
  permalink: string;
  caption: string;
  timestamp: string;
  programmeCategory?: string;
  featuredCampaign?: boolean;
}

export interface InstagramEditorialOverrides {
  pinnedPostIds: string[];
  hiddenPostIds: string[];
  manualPosts: InstagramManualPost[];
  disableAutoRanking: boolean;
  featuredCampaignPostIds: string[];
  safeguardingExcludedIds: string[];
}

export interface InstagramFeedResult {
  posts: InstagramPost[];
  source: "api" | "cache" | "manual" | "empty";
  fetchedAt: number;
  profileUrl: string;
  username: string;
}

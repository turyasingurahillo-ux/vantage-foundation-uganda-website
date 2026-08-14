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
  email: string;
  phone: string;
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
 * The four primary programmes. A project's `category` (above) maps 1:1 to one
 * of these for backward compatibility, but `primaryProgramme` / `secondaryProgrammes`
 * are the canonical, multi-programme-aware taxonomy going forward.
 */
export type ProgrammeId = "health" | "education" | "humanitarian" | "water";

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
 * SEO metadata for a content item. When omitted, the item's title and
 * summary/excerpt are used as fallbacks.
 */
export interface SeoMeta {
  title?: string;
  description?: string;
  /** Path to a custom OG image (e.g. /images/og/project-slug.png). */
  ogImage?: string;
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
   * Secondary programmes this project also contributes to. A project
   * surfaces on every programme page whose id is in
   * {primaryProgramme, ...secondaryProgrammes}.
   */
  secondaryProgrammes?: ProgrammeId[];
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

export interface ImpactStat {
  value: string;
  label: string;
  programme: string;
  location: string;
  period: string;
  methodology: string;
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

export interface AreaOfWork {
  id: string;
  title: string;
  /** Branded flagship programme name for this area, e.g. "Vantage Care". Falls back to `title` when unset. */
  programmeName?: string;
  summary: string;
  description: string;
  items: string[];
  icon: string;
  image?: string;
  imageAlt?: string;
  /** Optional external platform link shown as a callout on the programme page
   *  (e.g. KikumiKyo Academy's online learning hub). */
  externalPlatformLink?: {
    label: string;
    href: string;
    description: string;
  };
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

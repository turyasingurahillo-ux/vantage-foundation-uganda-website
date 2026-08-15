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
}

export interface Story {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** Public editorial format within the Stories & Insights collection. */
  contentType?: "Story" | "Insight";
  author?: string;
  /** Schema.org author type. Defaults to Person when omitted. */
  authorType?: "Person" | "Organization";
  role?: string;
  date: string;
  /** ISO date for material revisions or fact-check updates. */
  updatedAt?: string;
  /** Estimated time to read the full article. */
  readingTimeMinutes?: number;
  location?: string;
  category: string;
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
  /** Visible FAQ entries that may also be emitted as FAQPage structured data. */
  faqs?: FaqItem[];
  /**
   * Whether the story is published. Defaults to true when omitted.
   * Unpublished stories are filtered out of production routes but
   * remain visible in development for previewing.
   */
  published?: boolean;
}

export type BlogCategory =
  | "Health"
  | "Education"
  | "Humanitarian Action"
  | "Community Stories"
  | "Foundation News"
  | "Research & Learning"
  | "Accountability";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: BlogCategory;
  summary: string;
  body: string;
  author?: string;
  /** ISO date string, e.g. "2026-07-27". */
  publishedAt: string;
  readingTimeMinutes?: number;
  heroImage?: string;
  heroImageAlt?: string;
  relatedSlugs?: string[];
  consentClassification?: ConsentClassification;
  seo?: SeoMeta;
  /**
   * Whether the post is published. Defaults to true when omitted.
   * Unpublished/draft posts are filtered out of production routes but
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

# Content Model

This document describes the typed content schema for the Vantage Foundation Uganda website.

## Overview

All editable content lives in the `content/` folder as TypeScript modules. Each module exports typed data and helper functions. Content is validated at build time using Zod schemas (`lib/validate-content.ts`).

## Content Modules

### `content/site.ts` — Site configuration
Global site settings: name, description, mission, vision, values, contact info, social links, bank details, mobile money, navigation items, CTAs.

**Type:** `SiteConfig` (see `types/index.ts`)

### `content/projects.ts` — Projects
Individual project pages with full details.

**Type:** `Project`
**Helpers:** `getPublishedProjects()`, `getProjectBySlug(slug)`, `getProjectsByCategory(category)`
**Route:** `/projects`, `/projects/[slug]`

Key fields:
- `id`, `slug`, `title`, `category`, `status`, `location`, `date`
- `summary`, `heroImage`, `objective`, `activities`, `outcomes`, `beneficiaries`
- `partners`, `gallery`, `relatedStorySlugs`, `body`, `cta`
- `reportingPeriod`, `fundingStatus`, `startDate`, `endDate`, `documents`
- `seo` (title, description, ogImage), `published`, `consentClassification`

### `content/stories.ts` — Stories & Insights
Community stories, programme updates, research and reflections.

**Type:** `Story`
**Helpers:** `getPublishedStories()`, `getStoryBySlug(slug)`
**Route:** `/stories`, `/stories/[slug]`

Key fields:
- `id`, `slug`, `title`, `excerpt`, `author`, `role`, `date`, `location`, `category`
- `heroImage`, `relatedProjectSlugs`, `body`
- `tags`, `consentClassification`, `seo`, `published`

### `content/team.ts` — Team members
**Type:** `TeamMember`
**Helpers:** `getPublishedTeam()`
**Used in:** `/about-us`

### `content/partners.ts` — Partners
**Type:** `Partner`
**Helpers:** `getPublishedPartners()`
**Used in:** Homepage partners section

### `content/impact.ts` — Impact statistics
**Type:** `ImpactStat`
**Helpers:** `getPublishedImpact()`
**Used in:** `/impact`, homepage

### `content/reports.ts` — Reports and documents
**Type:** `Report`
**Helpers:** `getPublishedReports()`
**Used in:** `/reports-and-accountability`

### `content/faq.ts` — FAQ items
**Type:** `FaqItem`
**Used in:** `/faq`

### `content/areas.ts` — Programme areas
**Type:** `AreaOfWork`
**Used in:** `/our-work`, `/programmes/[slug]`

### `content/donate.ts` — Donation configuration
Suggested amounts, donation campaigns.
**Used in:** `/donate`, `DonationForm`

### `content/media.ts` — Media manifest
**Type:** `MediaAsset`
**Helpers:** `getPublishedMedia()`
**Purpose:** Single source of truth for all published images with consent tracking.

## Published Flag

All content types support an optional `published` boolean:
- When `true` (or omitted): content appears in production
- When `false`: content is filtered out of production routes but visible in development

This allows editors to draft content in the codebase without publishing it.

## Consent Classification

Media featuring people uses a `consentClassification` field:
- `none`: No people featured (landscape, object, text)
- `verified`: Written consent on file for all identifiable individuals
- `pending`: Consent being sought; do NOT publish until verified
- `group-consent`: Community/group leader consent obtained

See `docs/safeguarding-and-consent.md` for the full consent policy.

## Build-Time Validation

`lib/validate-content.ts` runs Zod schema validation on all content modules before the build. Run it with:

```bash
npm run validate-content
```

This catches:
- Missing required fields
- Invalid enum values (e.g., wrong category name)
- Malformed dates or URLs
- Type mismatches

The validation runs automatically in CI before every build.

## SEO Metadata

Projects and stories support per-item `seo` overrides:
```typescript
seo?: {
  title?: string;       // Override the page title
  description?: string; // Override the meta description
  ogImage?: string;     // Custom OG image path
}
```

When omitted, the item's `title` and `summary`/`excerpt` are used as fallbacks.

## Adding New Content

To add a new project:
1. Add an entry to `content/projects.ts`
2. Set `published: false` if not ready to publish
3. Run `npm run validate-content` to verify
4. Set `published: true` (or omit) when ready
5. The sitemap, RSS feed, and routes update automatically

To add a new story:
1. Add an entry to `content/stories.ts`
2. Write the body in markdown (stored as a string)
3. Set `published: false` if drafting
4. Run `npm run validate-content`

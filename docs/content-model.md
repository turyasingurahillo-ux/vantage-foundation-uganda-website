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
**Helpers:** `getPublishedAreas()` (excludes `published: false` in production), `getAllAreas()` (all areas)
**Used in:** `/our-work`, `/programmes/[slug]`, homepage `AreasOfWork` section, `app/sitemap.ts`

Programme areas support the `published` flag (see below). The 5th pillar, Youth Leadership & Community Empowerment, is currently `published: false` pending management-approved content.

### `content/donate.ts` — Donation configuration
Suggested amounts, donation campaigns.
**Used in:** `/donate`, `DonationForm`

### `content/media.ts` — Media manifest
**Type:** `MediaAsset`
**Helpers:** `getPublishedMedia()`, `getMediaAsset()`, `getMediaByProject()`, `getMediaByProgramme()`
**Purpose:** Single source of truth for all published images with consent tracking.

### `content/reach.ts` — Geographic reach
**Type:** `ReachDistrict` (defined in-file)
**Exports:** `reachDistricts: ReachDistrict[]`
**Purpose:** Documents the districts/regions where Vantage operates. Used in the `/impact` page "Where We Work" section.

### `content/instagram-overrides.ts` — Instagram editorial overrides
**Type:** `InstagramEditorialOverrides`
**Helpers:** `getInstagramOverrides()`
**Purpose:** Editor-curated overrides for the Instagram feed shown on the homepage. Allows the team to pin, caption, or hide specific posts without modifying the Instagram API integration.

## Published Flag

All content types support an optional `published` boolean:
- When `true` (or omitted): content appears in production
- When `false`: content is filtered out of production routes but visible in development

This allows editors to draft content in the codebase without publishing it.

For programme areas (`content/areas.ts`), `getPublishedAreas()` filters out unpublished areas from the `/our-work` listing, homepage section, and sitemap. The `/programmes/[slug]` route still generates a static param for unpublished areas so the route exists, but returns `notFound()` in production. In development, unpublished areas are fully previewable.

## Database-Backed Stories

In addition to the static `content/stories.ts` manifest, stories can be created and edited through the admin dashboard (`/admin/stories`) and stored in the `stories` PostgreSQL table. The public `/stories` route merges both sources:

- **Static stories** (`content/stories.ts`): version-controlled, reviewed via PR, include markdown bodies stored as strings or referenced from `content/stories/*.md`.
- **Database stories** (`stories` table): created via the admin editor, support markdown bodies and optional hero images uploaded through the media presign flow. New entries default to drafts; publishing is explicit.

**Merge logic** (`lib/stories-public.ts`): `getPublishedStoriesWithDb()` combines `getPublishedStories()` (static) with DB-backed published stories, deduplicating by slug (static takes precedence). `getDbStorySlugs()` is used by `generateStaticParams` and `app/sitemap.ts` to ensure DB stories are included in static generation and sitemap coverage.

**Build-time requirement**: the build environment must have `DATABASE_URL` configured so DB story slugs are available at build time. If the database is unreachable, only static stories are generated.

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

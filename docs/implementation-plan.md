# Vantage Foundation Uganda Website — Implementation Plan

**Source:** GitHub Issue #1 (Devin master task)
**Phase 1 audit:** [`docs/technical-audit.md`](./technical-audit.md)
**Strategy:** Incremental improvement on the existing Next.js 16 architecture (no rewrite — see audit §11 and §13).

This plan is a phased checklist. Each phase is independently shippable. Phases are ordered by dependency and launch-readiness impact. **No phase should be merged to `main` without management approval for any content it depends on (see audit §12).**

---

## Phase 1 — Audit and baseline fixes ✅ (this PR)

- [x] Inspect entire repository (routes, components, APIs, content, assets, env, deployment)
- [x] Install dependencies and record baseline (lint, type-check, build, tests, audit)
- [x] Inspect application at mobile and desktop sizes
- [x] Identify broken, unfinished, duplicated, unsafe, inaccessible, and poorly designed areas
- [x] Check for hard-coded content, placeholders, fake stats, missing images, broken links, exposed secrets, unhandled errors
- [x] Review Neon database and Nodemailer usage
- [x] Write `docs/technical-audit.md` with classified findings
- [x] Write `docs/implementation-plan.md` (this file)
- [x] Recommend incremental improvement vs partial rebuild (recommendation: incremental)
- [x] Apply clearly-safe baseline fixes only:
  - [x] Add `app/not-found.tsx` (branded 404)
  - [x] Fix `ImageOrPlaceholder` to treat missing files as placeholders (stop HTTP 400s)
  - [x] Remove redundant category-matching clause in `app/our-work/page.tsx`
- [x] Open draft pull request (do not merge)

**Blocker for Phase 2:** management answers to audit §12 items 1-3 (impact figures, team names/photos, Mobile Money) and item 8 (photograph consent).

---

## Phase 2 — Content and image foundation (requires management input)

Goal: replace every public placeholder with verified content and authentic, consent-cleared images.

- [ ] **Management approval gate:** collect verified answers to audit §12 items 1-8 and 10-11.
- [ ] Organise `vantage photos/` into `public/images/` by programme/project/year/location, with meaningful filenames.
- [ ] Strip EXIF metadata from all published images (especially GPS).
- [ ] Compress and convert images to WebP/AVIF; define image size presets per usage (hero, card, thumbnail, OG).
- [ ] Write descriptive alt text for every image based on visible content (no invented names for children/vulnerable people).
- [ ] Build a lightweight image/media manifest (TS module or JSON) with fields: filename, alt, caption, credit, date, location, programme, consent status, consent notes.
- [ ] Replace `content/team.ts` placeholders with verified names, roles, bios, and photos (with consent).
- [ ] Replace `content/partners.ts` placeholder with verified partner (or remove if none).
- [ ] Replace `content/impact.ts` `[Number]` placeholders with verified figures and reporting periods.
- [ ] Verify or correct the "10,000+" and "500+" figures across `Hero.tsx`, `TrustStrip.tsx`, `ImpactSection.tsx`, `impact/page.tsx`, and `content/projects.ts`.
- [ ] Replace `content/reports.ts` placeholders with real documents (host in `public/reports/` or external URL).
- [ ] Add verified Mobile Money details to `content/site.ts`.
- [ ] Fix the `contact.address` ("Ishaka, Bushenyi, Uganda") vs `contact.city` ("Jinja") mismatch per management.
- [ ] Add the 5th programme pillar (Youth leadership & community empowerment) to `content/areas.ts` and `types/index.ts`.
- [ ] Add `docs/media-guidelines.md` and `docs/safeguarding-and-consent.md`.

---

## Phase 3 — Information architecture and core pages

Goal: implement the routes the issue requires, with real content and sensible empty states.

**Scope reconciliation (performed 2026-09-05 against `main` at `2152a7f`):**

The original Phase 3 checklist was written before Phases 1–2 and the Vantage HQ redesign work. Many items are already implemented or were intentionally consolidated. The reconciled status is below.

### Already implemented (no action needed)

- [x] `/about-us` with mission/vision/values, team preview, and governance section — implemented as a consolidated page at `/about-us` with `/about-us/team` and `/about-us/team/[slug]` sub-routes. Governance is a section on `/about-us`, not a separate route. This is the correct IA: splitting `/about/history`, `/about/team`, `/about/governance` into separate routes would fragment the narrative and add navigation overhead without user value.
- [x] `/our-work` programme overview — lists all programme pillars with descriptions, activities, and related projects.
- [x] `/programmes/[slug]` programme detail pages — `health`, `education`, `humanitarian`, `water` all have dedicated pages with breadcrumbs, `BreadcrumbList` JSON-LD, related projects/stories, and CTAs.
- [x] `/gallery` — exists with curated media from the media manifest (`content/media.ts`), breadcrumbs, and `GalleryGrid`.
- [x] `/privacy`, `/terms`, `/safeguarding`, `/accessibility` — all four policy pages exist with full content and last-updated dates.
- [x] `app/(public)/[locale]/error.tsx` — client error boundary exists at the locale level.
- [x] `app/(public)/[locale]/loading.tsx` — generic skeleton loading UI exists.
- [x] `app/(public)/[locale]/not-found.tsx` — branded 404 exists.
- [x] `app/(public)/[locale]/projects/[slug]/loading.tsx` and `stories/[slug]/loading.tsx` — detail-page loading skeletons exist.
- [x] Breadcrumbs — `components/shared/Breadcrumbs.tsx` is used on team, programme, project, story, and gallery pages.
- [x] `BreadcrumbList` JSON-LD — emitted on programme, project, story, and team-member detail pages.
- [x] `Article` structured data — emitted on story detail pages via `buildArticleJsonLd`.
- [x] RSS feed — `/stories/rss.xml` exists with RSS 2.0, `<link rel="alternate">` in `<head>`, and middleware bypass for `.xml`.
- [x] `app/sitemap.ts` — includes all canonical public routes with hreflang alternates for localized routes and English-only detail routes for programmes, projects, stories, and team members.
- [x] `docs/content-model.md` — exists and documents all content modules, the published flag, consent classification, build-time validation, and SEO metadata.
- [x] `FAQPage` JSON-LD — emitted on `/faq`.
- [x] `NGO` + `Organization` + `WebSite` JSON-LD — emitted on all public pages via the locale layout.

### Implemented differently / intentionally consolidated (no action needed)

- [x] `/partners` — intentionally folded into the homepage partners section and `/donors-and-sponsors`. A standalone `/partners` route would duplicate content without adding user value. The partners list is `content/partners.ts` with `getPublishedPartners()`.
- [x] `/volunteer` and `/partner-with-us` — intentionally consolidated into `/get-involved` as anchor-based pathways (`#volunteer`, `#partner`, `#sponsor`, `#csr`). The contact form's category system (`volunteering`, `partnerships`) already routes these enquiries correctly into the Inbox V2 / case-management workflow. Splitting into dedicated routes would add navigation overhead without operational value. See Phase 3B evaluation below for the formal decision.
- [x] `/about/history` — the history/founding story is part of the `/about-us` narrative, not a separate route. Splitting would fragment the user journey.

### Genuinely missing and safe to implement (Phase 3A)

- [ ] **5th programme pillar: Youth Leadership & Community Empowerment** — `content/areas.ts` has only 4 pillars (`health`, `education`, `humanitarian`, `water`). The original plan and `types/index.ts` (which already includes `"Youth Leadership"` and `"Youth Empowerment"` in the `ProjectCategory` union) call for a 5th pillar. This is a content-model gap, not a route gap — the `/programmes/[slug]` route already handles any slug. Adding the pillar to `content/areas.ts` will automatically generate the route, sitemap entry, and navigation link. **Blocker:** requires management-approved programme description, activities, and image. If unavailable, add a `published: false` placeholder so the route exists but is not visible in production.
- [ ] **Root-level `app/not-found.tsx`** — the locale-level 404 exists but there is no root-level fallback for requests that don't match any locale. A root `app/not-found.tsx` ensures a branded 404 for edge cases (e.g., a request to a non-existent top-level path before the locale rewrite runs).
- [ ] **`BreadcrumbList` JSON-LD on listing/index pages** — visual breadcrumbs exist on `/about-us/team`, `/projects`, `/stories`, `/our-work`, `/gallery` but do not emit `BreadcrumbList` JSON-LD. Adding it improves search engine understanding of site hierarchy.
- [ ] **`docs/content-model.md` update** — the existing doc does not mention `content/reach.ts`, `content/instagram-overrides.ts`, or the DB-backed stories merge. Update to reflect the full content model.

### Blocked by management-supplied facts

- [ ] **5th programme pillar content** — description, activities, image, and programme name require management approval. The route and type infrastructure can be prepared, but the content must come from Vantage management.
- [ ] **`Event` structured data** — would require events with real dates, locations, and descriptions. No event content model exists, and no management-approved events are available. Do not fabricate events.

### Blocked by consent/safeguarding

- [ ] **Gallery expansion / curated photo stories** — the gallery exists but expanding it requires consent-aware media metadata. The media manifest (`content/media.ts`) already supports `consentClassification`, but additional photos require safeguarding review per `docs/safeguarding-and-consent.md`. Do not publish photos without verified consent.

### Obsolete because later work superseded it

- [x] ~~"Add `app/error.tsx` global error boundary"~~ — the locale-level `error.tsx` handles this. A root-level `app/error.tsx` would only catch errors in the root layout itself, which is minimal. The locale-level boundary is the correct architecture for a localized App Router site.
- [x] ~~"Add `app/loading.tsx` for dynamic routes"~~ — loading skeletons exist at the locale level and for the two slowest detail routes (projects, stories). This is sufficient.

### Phase 3A scope (this PR)

1. Add 5th programme pillar to `content/areas.ts` as `published: false` (Youth Leadership & Community Empowerment) with a clear placeholder description — route infrastructure works automatically.
2. Add root-level `app/not-found.tsx` for non-locale edge cases.
3. Add `BreadcrumbList` JSON-LD to listing pages that have visual breadcrumbs.
4. Update `docs/content-model.md` to document `content/reach.ts`, `content/instagram-overrides.ts`, and DB-backed stories.
5. Update `docs/implementation-plan.md` (this section) with the reconciled status.

### Phase 3B scope (next PR)

Evaluate whether `/volunteer` and `/partner-with-us` should become dedicated routes or remain consolidated. **Preliminary assessment:** remain consolidated. The current `/get-involved` with anchor-based pathways + contact form category routing is the correct UX. A dedicated route would add a page without adding capability. The formal evaluation will be documented in the Phase 3B PR.

### Phase 3B scope (this PR) — Engagement architecture evaluation

**Decision: `/volunteer` and `/partner-with-us` remain consolidated into `/get-involved` and `/contact`.**

**Evaluation performed 2026-09-05 against `main` at `25ca753`.**

The current engagement architecture was evaluated end-to-end:

1. `/get-involved` renders six pathway cards (donate, volunteer, partner, sponsor, collaborate, csr).
2. Each card CTA routes to `/donate` or `/contact?subject=<legacy-alias>`.
3. On `/contact`, the `?subject=` query parameter pre-selects the contact form category via `resolveCategoryFromQuery`.
4. The contact form submits to `submitContact` (server action), which validates, stores in `contact_messages`, and seeds a case via `seedCaseFromContactSubmission`.
5. The case `source` is set to `website_form`; the `case_type` is derived from the category via `suggestCaseTypeFromCategory`.
6. The admin inbox (`/admin/messages`) displays the source and case type in both the list and detail views.

**Arguments for remaining consolidated:**

- The current architecture already works end-to-end: pathway → category → case type → admin workflow.
- The contact form category system already distinguishes volunteering from partnerships from grants from media, etc.
- The admin case workflow shows the source ("Website form") and case type ("Volunteer", "Partnership", etc.) in both the list and detail views.
- Dedicated `/volunteer` and `/partner-with-us` routes would add pages without adding capability — the form, the case workflow, and the admin experience are identical regardless of which page the user came from.
- No management-approved content exists for dedicated volunteer/partner pages. Creating thin pages would harm SEO and user experience.
- Adding dedicated routes would require new content, new navigation entries, new sitemap entries, and new tests — all for zero operational benefit.
- The original roadmap listed those URLs, but the user explicitly asked to "base the decision on actual UX and operational value, not merely because the original roadmap listed those URLs."

**Arguments for dedicated routes (considered and rejected):**

- SEO: dedicated pages could rank for "volunteer Uganda NGO" — but thin pages without real content would rank poorly and could harm the site's overall quality signals.
- Focused user journey: a volunteer might need different information — but the pathway cards on `/get-involved` already provide context-specific descriptions, and the contact form category is pre-selected.
- Form pre-filling: a dedicated route could show a tailored form — but this already works via `?subject=volunteer` on `/contact`.

**Safe improvement implemented: page-of-origin tracking**

One genuine operational gap was identified: the admin can see the enquiry type (volunteer, partnership) but not which page the form was submitted from (`/get-involved` vs `/contact` vs `/donate`). This has operational value for understanding where enquiries originate.

Implemented as an additive enhancement:
- New nullable `origin_page` column on `contact_messages` (idempotent migration).
- Hidden `origin_page` field in `ContactForm` capturing the current page path via `usePathname()`.
- `origin_page` added to the `submitContact` Zod schema and `createContactMessage`.
- Displayed in the admin case detail view alongside source and case type.
- No parallel datastore, no separate workflow — enriches the existing `contact_messages` table and case pipeline.

### Phase 3C scope (deferred pending management/consent inputs)

**Phase 3C is deferred, not an engineering blocker.** Gallery expansion, `Event` structured data, and additional curated photo stories are blocked on:

- additional media has verified consent/safeguarding metadata;
- Vantage management supplies approved event facts where Event structured data is justified.

Do not fabricate media consent, events, dates, locations, impact figures, partner information or reports. Phase 3C should resume only when the above inputs are available.

---

## Phase 4 — Content model and editorial architecture

Goal: make the content system robust enough for non-developer updates and consent-aware media handling.

### Phase 4 reconciliation (performed 2026-09-05 against `main` at `1cb17e0`)

#### Project model — `types/index.ts:193-275`

| Old checklist item | Status | Evidence |
|---|---|---|
| `reportingPeriod` | **Already implemented** | `types/index.ts:264` — `{ start?: string; end?: string }` |
| `fundingStatus` | **Already implemented** | `types/index.ts:265` — free-form string |
| `startDate` / `endDate` | **Already implemented** | `types/index.ts:266-267` — ISO date strings |
| `documents` | **Already implemented** | `types/index.ts:268` — `ProjectDocument[]` with `title`, `url`, `type?`, `date?`, `description?` |
| `seo` (title, description, ogImage) | **Already implemented** | `types/index.ts:270` — `SeoMeta` with `title`, `description`, `ogImage`, `socialImage` |
| `published` (boolean) | **Already implemented** | `types/index.ts:272` — `published?: boolean`, defaults to `true`; `getPublishedProjects()` filters in production |
| `consent` classification | **Already implemented** | `types/index.ts:273` — `consentClassification?: ConsentClassification` |
| `primaryProgramme` / `secondaryProgrammes` | **Already implemented** | `types/index.ts:275` — `ProgrammeId` enum |
| `themes`, `beneficiaryGroups`, `sdgs`, `flagship` | **Already implemented** | `types/index.ts:275` — Phase 4 extensions present |

#### Story model — `types/index.ts:277-334`

| Old checklist item | Status | Evidence |
|---|---|---|
| `tags` | **Already implemented** | `types/index.ts:296` — `tags?: string[]` |
| `consentClassification` | **Already implemented** | `types/index.ts:299` — `ConsentClassification` |
| `relatedProjectSlugs` | **Already implemented** | `types/index.ts:293` — `string[]` |
| `seo` | **Already implemented** | `types/index.ts:300` — `SeoMeta` |
| `published` | **Already implemented** | `types/index.ts:303` — `published?: boolean`, defaults to `true`; `getPublishedStories()` filters in production |
| `heroImageFocalPoint` | **Already implemented** | `types/index.ts:291` — CSS `object-position` |
| `socialImage` | **Already implemented** | via `seo.socialImage` |
| `contentType` (Story/Insight) | **Already implemented** | `types/index.ts:284` |
| `faqs` | **Already implemented** | `types/index.ts:301` — `FaqItem[]` |

#### Media model

| Old checklist item | Status | Evidence |
|---|---|---|
| `MediaAsset` type | **Already implemented** | `types/index.ts:426-451` |
| Media manifest module | **Already implemented** | `content/media.ts` with 1000+ lines, `getPublishedMedia()`, `getMediaByProject()`, `getMediaByProgramme()` |
| Consent classification | **Already implemented** | `MediaAsset.consent: ConsentClassification` (required) |
| Caption, credit, location, date | **Already implemented** | `types/index.ts:431-435` |
| Programme/project relationship | **Already implemented** | `types/index.ts:436-437` — `programme?`, `projectSlug?` |
| Publication state | **Already implemented** | `types/index.ts:439` — `published?: boolean` |
| DB media (`media_objects`) | **Already implemented** | `lib/db/schema.sql:59-95` — full consent, publication, programme, project_slug columns |
| Admin media management | **Already implemented** | `/admin/media` with upload, edit, consent, publication, delete, audit |
| Public DB media helpers | **Already implemented** | `lib/media-public.ts` — gallery, team photos, programme photos, documents, logos |

#### Editorial infrastructure

| Old checklist item | Status | Evidence |
|---|---|---|
| Build-time Zod validation | **Already implemented** | `lib/validate-content.ts` (534 lines), runs via `prebuild` in `package.json:18` |
| Unpublished-content filtering | **Already implemented** | `getPublishedProjects()`, `getPublishedStories()`, `getPublishedAreas()`, `getPublishedMedia()` — all filter `published !== false` in production |
| DB-backed vs static story behavior | **Already implemented** | `lib/stories-public.ts` merges DB + static; DB stories take slug precedence; static fallback |
| Editorial workflow documentation | **Already implemented** | `docs/editorial-guidelines.md` (139 lines) |
| Media workflow documentation | **Already implemented** | `docs/safeguarding-and-consent.md` |
| MDX evaluation | **Already evaluated — rejected** | `docs/editorial-guidelines.md:101-113` documents the decision to defer MDX; Markdown + react-markdown covers all current needs |

#### Genuinely missing / unsafe (Phase 4A scope)

1. **Consent is not enforced as a publication gate.** Public media helpers (`lib/media-public.ts`) and `content/media.ts:getPublishedMedia()` filter on `published` only, not `consent`. A DB media row with `published: true` + `consent: "pending"` will render publicly. The editorial guidelines say "Never publish media with `consent: "pending"`" but the code does not enforce it.
2. **Project gallery images hardcode `consent: "verified"`.** `app/(public)/[locale]/projects/[slug]/page.tsx:211` sets `consent: "verified"` for every gallery image regardless of actual consent status.
3. **Admin APIs allow `published: true` + `consent: "pending"`.** Neither `app/api/admin/media/route.ts` nor `app/api/admin/stories/route.ts` guards against this combination.
4. **Build-time validation does not check `published` + `consent` coexistence.** `lib/validate-content.ts` validates `consent` and `published` independently.
5. **Homepage and programme pages miss DB stories.** `StoriesSection.tsx` and `FeaturedImpactStory.tsx` use `getPublishedStories()` (static only) instead of `getPublishedStoriesWithDb()`.
6. **`generateMetadata` can leak unpublished metadata.** Project, story, and team member routes use raw `get*BySlug` in `generateMetadata` without checking `published`.
7. **Uganda reach map can expose unpublished projects.** `UgandaReachMap.tsx` uses `getProjectBySlug()` without checking `published`.

### Phase 4A scope (this PR)

Treat consent as a publication gate, not merely descriptive metadata.

1. **Enforce consent as a publication gate in all public media helpers.** Add `consent !== "pending"` to `getPublishedGalleryMedia()`, `getTeamMemberPhotoOverride()`, `getProgrammeAdditionalPhotos()`, `getPublishedDocuments()`, `getPublishedLogos()`, and `content/media.ts:getPublishedMedia()`.
2. **Guard admin APIs against `published: true` + `consent: "pending"`.** Add Zod refinements or server-side checks in `app/api/admin/media/route.ts` and `app/api/admin/stories/route.ts`.
3. **Add build-time validation for `published` + `consent` coexistence.** In `lib/validate-content.ts`, reject static `MediaAsset`, `Story`, and `Project` entries where `published: true` and `consent: "pending"`.
4. **Fix project gallery consent hardcoding.** Remove the hardcoded `consent: "verified"` and either look up the actual consent from the media manifest or default to `"pending"` (which would then be filtered by the consent gate).
5. **Surface DB stories on homepage and programme pages.** Switch `StoriesSection.tsx` and `FeaturedImpactStory.tsx` to `getPublishedStoriesWithDb()`.
6. **Fix `generateMetadata` to respect `published`.** Use publication-filtered helpers or add the production `published` check in `generateMetadata` for project, story, and team member routes.
7. **Fix Uganda reach map to respect `published`.** Filter `district.projectSlugs` against the published project slug set.
8. **Add regression tests** for all consent-gate and publication-leak fixes.
9. **Update `docs/editorial-guidelines.md`** to note that consent is now enforced in code, not just editorial process.

### Phase 4 closure

- **Phase 4 reconciliation — complete.** Every old Phase 4 checklist item was classified as "already implemented" with exact file/line evidence.
- **Phase 4A consent/publication safety remediation — complete.** PR #77 merged at `698e8d445bf7a4c3b7b998d2c10c3291705107a7`.
- No further Phase 4 engineering work is required unless new content-model requirements emerge.
- **Phase 3C remains separately deferred** pending consent-approved media and management-approved event facts. It is not an engineering blocker.

---

## Phase 5 — Forms and email flows

Goal: make every form safe, accessible, and abuse-resistant.

### Phase 5 reconciliation (performed 2026-09-05 against `main` at `698e8d4`)

#### Public form abuse protection

| Old checklist item | Status | Evidence |
|---|---|---|
| Rate limiting (contact, newsletter, donation, admin login) | **Already implemented** | `app/actions.ts:121-135` `checkFormRateLimit` (3/min/IP default); admin login `app/api/admin/login/route.ts:67` (5/min + lockout); all admin API routes have per-route rate limits |
| CSRF tokens on admin forms | **Already implemented** | Every state-changing admin API route validates CSRF via `validateCsrf` or `validateCsrfHeader` — full inventory in audit table below |
| Second honeypot + time-trap | **Already implemented** | `components/shared/HoneypotFields.tsx:93-113` renders `website` + `company_url` honeypots and `form_loaded_at` time-trap; `app/actions.ts:174-189` `isBotSubmission()` enforces both |
| Per-field error display | **Already implemented** | `ContactForm.tsx`, `NewsletterForm.tsx`, `DonationForm.tsx` all render `FieldError` per field with `aria-invalid`/`aria-describedby`; server actions return `fieldErrors` from Zod |
| Donation-intent idempotency | **Already implemented** | `app/actions.ts:152-170` in-memory `Map` with 5-minute TTL; `DonationForm.tsx:45` sends `submissionId` via `HoneypotFields withIdempotency` |
| Email body sanitisation/escaping | **Already implemented** | `lib/sanitise.ts:21-30` `sanitiseValue` strips CR/LF/control chars; `lib/email.ts:61-100` `emailTemplate` escapes all values via `escapeHtml`; `lib/contact-reply.ts:61-91` `htmlBody` escapes all user-controlled values |
| `SMTP_FROM` format validation | **Already implemented** | `lib/contact-inbox.ts:31-41` `readAddressEnv` validates against `SINGLE_ADDRESS_REGEX`, caps at 254 chars, logs and ignores invalid values |
| Safe HTML email templates | **Already implemented** | `lib/email.ts:61-100` `emailTemplate` builds branded HTML with full escaping; `lib/contact-reply.ts:61-91` `htmlBody` for replies |
| Email config in README + deployment docs | **Already implemented** | `README.md:47-65` env var table; `docs/deployment.md:48-128` Step 3 email configuration; `docs/email-privacy-and-contact.md` full architecture |
| Privacy notice on every form | **Already implemented** | `ContactForm.tsx:191`, `NewsletterForm.tsx:89-94`, `DonationForm.tsx:201-205` all render `FormPrivacyNotice` with link to `/privacy` |

#### Admin request protection — full route inventory

Every state-changing admin API route has `verifySessionToken` (except login/logout which create/clear sessions) and CSRF validation:

| Route | Auth | CSRF | Rate limit |
|---|---|---|---|
| `/api/admin/login` | N/A (creates session) | `validateCsrf` | 5/min + lockout |
| `/api/admin/logout` | N/A (clears session) | `validateCsrf` | **None** |
| `/api/admin/verify` | `verifySessionToken` | `validateCsrf` | 20/min |
| `/api/admin/admins` (POST/DELETE) | `guard()` | `validateCsrf`/`validateCsrfHeader` | 20/min |
| `/api/admin/media/presign` | `verifySessionToken` | `validateCsrf`/`validateCsrfHeader` | 20/min |
| `/api/admin/media` (POST/PATCH/DELETE) | `guard()` | `validateCsrf`/`validateCsrfHeader` | 60/min |
| `/api/admin/stories` (POST/PATCH/DELETE) | `guard()` | `validateCsrfHeader` | 60/min |
| `/api/admin/messages/reply` | `verifySessionToken` | `validateCsrf` | 10/min |
| `/api/admin/messages/resend` | `verifySessionToken` | `validateCsrf` | 20/min |
| `/api/admin/messages/resolve` | `verifySessionToken` | `validateCsrf` | 20/min |
| `/api/admin/messages/status` | `verifySessionToken` | `validateCsrf` | 30/min |
| `/api/admin/cases/update` | `verifySessionToken` | `validateCsrf` | 30/min |
| `/api/admin/cases/note` | `verifySessionToken` | `validateCsrf` | 30/min |
| `/api/admin/cases/intake` | `verifySessionToken` | `validateCsrf` | 20/min |
| `/api/admin/cases/actions` | `verifySessionToken` | `validateCsrf` | 30/min |
| `/api/admin/cases/decision` | `verifySessionToken` | `validateCsrf` | 20/min |
| `/api/admin/cases/due-diligence` | `verifySessionToken` | `validateCsrf` | 30/min |
| `/api/admin/cases/communication` | `verifySessionToken` | `validateCsrf` | 30/min |
| `/api/admin/cases/referrals` | `verifySessionToken` | `validateCsrf` | 30/min |
| `/api/admin/cases/link` | `verifySessionToken` | `validateCsrf` | 20/min |
| `/api/admin/persons` | `verifySessionToken` | `validateCsrf` | 20/min |
| `/api/admin/organisations` | `verifySessionToken` | `validateCsrf` | 20/min |
| `/api/admin/organisations/[id]` | `verifySessionToken` | `validateCsrf` | 30/min |
| `/api/admin/analytics` (GET) | `verifySessionToken` | `validateCsrfHeader` | 60/min |
| `/api/admin/analytics/export` (GET) | `verifySessionToken` | `validateCsrfHeader` | 10/min |

No admin route accepts a user-supplied `returnTo`/`redirectTo` URL — all redirects are hardcoded internal paths.

#### Email safety — full path audit

| Item | Status | Evidence |
|---|---|---|
| Email data preparation | **Already implemented** | `lib/email.ts:31-36` `formatBody` (plain text), `lib/email.ts:45-55` `buildEmailRows` (HTML rows), both `sanitiseValue` all values |
| Recipient resolution | **Already implemented** | Admin reply: recipient from stored DB row (`app/api/admin/messages/reply/route.ts:108`); notifications: `resolveInboxFor(category)` (`lib/contact-inbox.ts:65-72`) |
| From address resolution | **Unsafe** — see below | `lib/email.ts:156` `const from = getFromAddress() ?? options.to;` — falls back to recipient address when no authorised sender configured |
| Reply-To resolution | **Already implemented** | `lib/contact-reply.ts:141` `replyTo: getFromAddress() ?? getDefaultInbox()` |
| Subject/body sanitisation | **Already implemented** | `lib/email.ts:161` `sanitiseValue(options.subject).substring(0, 200)`; body is plain text or escaped HTML |
| HTML escaping | **Already implemented** | `lib/email.ts:61-100` `emailTemplate` escapes all values; `lib/contact-reply.ts:61-91` `htmlBody` escapes all user-controlled values |
| SMTP transport | **Already implemented** | `lib/email.ts:144-152` Nodemailer transport from `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS` |
| Provider result handling | **Already implemented** | `lib/email.ts:170-191` returns `{ok, messageId, providerStatus}` or `{ok:false, error}` |
| Retry/error handling | **Already implemented** | Reply route marks reply as failed and message as `awaiting_response` on send failure (`app/api/admin/messages/reply/route.ts:166-175`) |
| Audit/logging | **Already implemented** | All admin email actions logged to `audit_log`; `logInfo`/`logWarn`/`logError` without PII |

#### Privacy review

| Form | Fields collected | Storage | Email copy | Privacy notice | Matches `/privacy`? |
|---|---|---|---|---|---|
| Contact | name, email, phone?, organisation?, subject, message, origin_page | `contact_messages` table | Yes (to team inbox) | `ContactForm.tsx:191` | Yes — `/privacy` describes contact data |
| Donation | name, email, phone?, amount, frequency, campaign, transactionReference, message | `donations` table | Yes (to team inbox) | `DonationForm.tsx:201-205` | Yes — `/privacy` describes donation data |
| Newsletter | email, consent | No DB table (email only) | Yes (to team inbox) | `NewsletterForm.tsx:89-94` | Yes — `/privacy` describes newsletter data |

No form is missing a privacy notice. No form collects data not described in `/privacy`.

#### Genuinely missing / unsafe (Phase 5A scope)

1. **Unsafe `From` fallback in `lib/email.ts:156`.** `const from = getFromAddress() ?? options.to;` means when no authorised sender is configured, the recipient's address becomes the From address. This can cause SPF/DMARC failure, sender spoofing, and incorrect reply behavior. **Fix:** Never derive From from the recipient. If no authorised sender is configured, fail the send cleanly and preserve workflow state for retry.

2. **Donation schema missing max lengths.** `donorSchema` in `app/actions.ts:90-106` has no max length on `name`, `email`, `phone`, `campaign`, `transactionReference`, or `message`. The contact schema has max lengths. This is a validation inconsistency that could allow oversized payloads. **Fix:** Add max lengths consistent with the contact schema and DB column sizes.

3. **Newsletter schema missing email max length.** `newsletterSchema` in `app/actions.ts:82-88` has no max length on `email`. **Fix:** Add `.max(254)` consistent with RFC 5321.

### Phase 5A scope (this PR)

1. **Fix the unsafe `From` fallback.** Remove `?? options.to` from `lib/email.ts:156`. When `getFromAddress()` returns null, return `{ok:false, error:"No authorised sender configured"}` instead of using the recipient as the sender. This is the highest-priority fix.
2. **Add max lengths to donation and newsletter schemas.** Bring `donorSchema` and `newsletterSchema` in line with `contactSchema` for field-size validation.
3. **Add regression tests** for the sender-identity fix and schema validation.
4. **Update `docs/implementation-plan.md`** with the reconciled Phase 5 status.

### Phase 5 closure

- **Phase 5 reconciliation — complete.** Every old Phase 5 checklist item was classified as "already implemented" with exact file/line evidence.
- **Phase 5A sender-identity safety and schema validation — complete.** PR #78 merged at `e6705f06bd69edbfec6a2ecd0ee1309099d8ac38`.
- No further Phase 5 engineering work is required unless new form/email requirements emerge.

---

## Phase 6 — Media optimisation and performance

Goal: mobile-first, low-bandwidth performance.

### Phase 6 reconciliation (performed 2026-09-05 against `main` at `e6705f0`)

#### Old checklist items — all already implemented

| Old checklist item | Status | Evidence |
|---|---|---|
| Image size presets and `sizes` attributes | **Already implemented** | `lib/image-presets.ts:12-58` defines 8 presets (hero, splitHero, detailHero, card, half, team, banner, articleBody); used by `ImageOrPlaceholder` and direct `next/image` usages |
| `placeholder="blur"` with blur data URLs | **Already implemented** | `lib/blur-placeholder.ts:13` provides generic SVG blur; `ImageOrPlaceholder` always sets `placeholder="blur"` + `blurDataURL` |
| Lazy-load below-the-fold images | **Already implemented** | `next/image` defaults to `loading="lazy"`; only above-the-fold images use `preload` or `priority` |
| Explicit `width`/`height` on all images | **Already implemented** | All `fill` images use aspect-ratio containers (`aspect-[16/10]`, `aspect-[4/3]`, etc.); fixed-size images use `width`/`height` props |
| Focal-point-aware cropping | **Already implemented** | `ImageOrPlaceholder` accepts `objectPosition` prop; story heroes use `heroImageFocalPoint`; `StoryCard` uses `DEFAULT_LANDSCAPE_FOCAL_POINT` |
| Performance budgets documented | **Already implemented** | `docs/performance.md` documents LCP < 2.5s, CLS < 0.1, INP < 200ms, JS < 150 KB gzip, CSS < 30 KB gzip, images < 200 KB |
| Client-side JS audit | **Already implemented** | 45 client components identified (docs were stale at 7); all are justified (forms, maps, galleries, analytics, navigation) |
| `next/font` display=swap | **Already implemented** | `Source_Sans_3` with `display: "swap"` in public layout; `Noto_Sans_Arabic` for Arabic; admin layout uses `Source_Sans_3` |
| Throttled 3G testing at multiple viewport widths | **Measurement-only** | Lighthouse mobile preset simulates slow 4G; 320px tested separately |
| Lighthouse scores recorded | **Measurement-only** | Full Lighthouse run on 9 routes, mobile + desktop, recorded below |

#### Measured production baseline (2026-09-05, Lighthouse 13.4.1)

**Mobile (perf preset, simulated slow 4G):**

| Route | Perf | LCP (ms) | CLS | TBT (ms) | FCP (ms) | SI (ms) | Total KB |
|---|---|---|---|---|---|---|---|
| `/` | 33 | 6828 | 0 | 2678 | 4020 | 6987 | 668 |
| `/projects` | 33 | 7113 | 0 | 2081 | 4695 | 7133 | 760 |
| `/projects/kasaale-deep-borehole` | 69 | 3796 | 0 | 478 | 3244 | 3855 | 600 |
| `/stories` | 58 | 4147 | 0 | 805 | 3598 | 4094 | 699 |
| `/stories/beyond-the-ward` | 39 | 5561 | 0 | 2772 | 3501 | 5747 | 637 |
| `/gallery` | 46 | 6106 | 0 | 734 | 4709 | 6125 | 916 |
| `/get-involved` | 74 | 3624 | 0 | 379 | 3124 | 3525 | 517 |
| `/contact` | 75 | 3584 | 0 | 368 | 3109 | 3500 | 505 |
| `/donate` | 59 | 4314 | 0 | 756 | 3248 | 4056 | 508 |

**Desktop (desktop preset):**

| Route | Perf | A11y | BP | SEO | LCP (ms) | CLS | TBT (ms) | FCP (ms) | Total KB |
|---|---|---|---|---|---|---|---|---|---|
| `/` | 95 | 100 | 100 | 100 | 1124 | 0 | 99 | 670 | 906 |
| `/projects` | 95 | 99 | 100 | 100 | 1095 | 0 | 52 | 805 | 819 |
| `/projects/kasaale-deep-borehole` | 79 | 94 | 100 | 100 | 1090 | 0.32 | 9 | 615 | 753 |
| `/stories` | 82 | 100 | 100 | 100 | 885 | 0.32 | 7 | 525 | 829 |
| `/stories/beyond-the-ward` | 67 | 100 | 96 | 100 | 1453 | 0.33 | 205 | 1046 | 639 |
| `/gallery` | 80 | 100 | 100 | 100 | 1116 | 0.32 | 0 | 736 | 1159 |
| `/get-involved` | 83 | 100 | 100 | 100 | 847 | 0.32 | 7 | 519 | 549 |
| `/contact` | 82 | 100 | 100 | 100 | 875 | 0.25 | 3 | 518 | 542 |
| `/donate` | 97 | 100 | 100 | 100 | 993 | 0 | 18 | 891 | 541 |

#### Budget compliance

| Budget | Target | Actual (mobile) | Actual (desktop) | Status |
|---|---|---|---|---|
| LCP | < 2.5s | 3.6–7.1s | 0.85–1.45s | **Mobile exceeds budget** |
| CLS | < 0.1 | 0 (all routes) | 0–0.33 | **Desktop exceeds budget on some routes** |
| INP/TBT | < 200ms | 368–2772ms | 0–205ms | **Mobile exceeds budget** |
| JS per route (gzip) | < 150 KB | 245–257 KB | 245–257 KB | **Exceeds budget** |
| CSS per route (gzip) | < 30 KB | 17 KB | 17 KB | **Within budget** |
| Images per page | < 200 KB | 147 KB (home) | 147 KB (home) | **Within budget** (gallery 411 KB exceeds) |

#### Identified bottlenecks (by impact)

1. **JS bundle 246 KB gzip** — above 150 KB budget. The Uganda reach map chunk (~150 KB uncompressed, includes d3-geo and district data) is loaded on the homepage even though it's below the fold. **Fix: dynamic import.**
2. **CLS 0.324 on desktop** — footer shift caused by font swap. The Arabic font (`Noto_Sans_Arabic`) is loaded on all pages including non-Arabic. **Fix: only preload Arabic font on Arabic pages.**
3. **LCP 3.5–7.1s on mobile** — primarily caused by JS execution time (7.5s main thread work on homepage). The dynamic import for the map should reduce initial JS execution.
4. **Gallery over-fetching** — 34 images, 411 KB. This is a content volume issue; pagination would help but is a larger change.
5. **`docs/performance.md` outdated** — claims 7 client components (actual 45), mentions Inter font (actual Source Sans 3), claims `priority` is used (actual `preload` is correct for Next.js 16).

#### Vercel Speed Insights

`@vercel/speed-insights` is not installed. No real-user Core Web Vitals telemetry is available. Field data cannot be reported. Vercel Dashboard may show Speed Insights if enabled at the project level, but this is not instrumented in the application code.

### Phase 6A scope (this PR)

1. **Dynamic import for UgandaReachMap** — the map component (~150 KB chunk with d3-geo and district data) is below the fold on the homepage. Use `next/dynamic` with `ssr: false` to split it into a separate chunk that loads only when needed.
2. **Arabic font preload optimization** — set `preload: false` on `Noto_Sans_Arabic` so it's not preloaded on non-Arabic pages. This reduces unnecessary font downloads and CLS from font swap.
3. **Update `docs/performance.md`** with actual measured results, correct client component count, correct font name, and correct `preload` vs `priority` documentation for Next.js 16.

---

## Phase 7 — Accessibility (WCAG 2.2 AA)

Goal: no major accessibility failures in critical flows.

- [ ] Audit heading order on every page (single h1, no skipped levels).
- [ ] Verify colour contrast for all text on primary, slate-50, white, and amber backgrounds.
- [ ] Add visible focus indicators to all interactive elements (Button has them; verify custom buttons in `DonationForm` and `Header` mobile menu).
- [ ] Trap focus in the mobile menu dialog and restore focus on close.
- [ ] Add `aria-label` to all icon-only buttons and links.
- [ ] Add `aria-describedby` to form fields with hints/errors.
- [ ] Add screen-reader announcements for form submission states (already `role="status"` — verify).
- [ ] Verify keyboard navigation through the project filter, FAQ accordion, and mobile menu.
- [ ] Add captions or transcripts for any video.
- [ ] Test with a screen reader (NVDA or VoiceOver) on critical journeys.
- [ ] Add automated axe-core checks to CI.
- [ ] Document manual testing in `docs/accessibility.md` (new).

---

## Phase 8 — SEO and structured data

Goal: complete, accurate, non-spammy discoverability.

- [ ] Add unique `metadata` to every page (most have it; verify `/projects` and `/stories` index pages have descriptions).
- [ ] Add canonical URLs to all pages.
- [ ] Add Open Graph images per project and per story (currently only the generated default).
- [ ] Add `noindex` to `/admin/*` and any preview/staging routes.
- [ ] Add `Article` structured data to story pages.
- [ ] Add `BreadcrumbList` structured data.
- [ ] Add `Event` structured data where event stories have dates.
- [ ] Verify `sitemap.xml` and `robots.txt` render correctly in production.
- [ ] Add a social sharing image per page (or confirm the generated default is sufficient).
- [ ] Avoid keyword stuffing and fabricated claims (content review).

---

## Phase 9 — Security and privacy

Goal: production-ready security posture.

- [ ] Upgrade `next` to latest 16.x patch (fixes postcss and sharp advisories).
- [ ] Upgrade `nodemailer` to 9.x (fixes 3 high-severity advisories; verify no breaking changes).
- [ ] Run `npm audit` clean (or document accepted residual risk).
- [ ] Add security headers in `next.config.ts`: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- [ ] Replace admin shared-secret cookie with a signed session token (HMAC of a random session ID using `ADMIN_SECRET` as the key).
- [ ] Add admin login rate limiting and lockout.
- [ ] Add an audit log to donation status changes (who, when, before, after).
- [ ] Add a data retention and deletion policy for the `donations` table (with a `deleted_at` column and a scheduled cleanup).
- [ ] Ensure the privacy policy accurately reflects actual data collection (forms, donations, no analytics yet).
- [ ] Add safeguarding-aware media and data handling guidance to `docs/safeguarding-and-consent.md`.
- [ ] Remove the two large PDFs from `reference/` (requires history rewrite — coordinate with management).
- [ ] Add `docs/deployment.md` with security notes.

---

## Phase 10 — Tests and CI

Goal: confidence without slowing down the team.

- [ ] Add a GitHub Actions CI workflow: install, lint, type-check, build, test.
- [ ] Install Vitest for unit tests; add tests for `lib/utils.ts`, content helpers, and Zod schemas.
- [ ] Add React Testing Library component tests for `ContactForm`, `DonationForm`, `NewsletterForm`, `Header` (mobile menu), `ProjectList` (filtering).
- [ ] Add Playwright E2E tests for the 8 critical journeys in the issue:
  1. Visit homepage and navigate to a programme.
  2. Open a project detail page.
  3. Submit a contact enquiry.
  4. Submit a volunteer enquiry.
  5. Open donation information.
  6. Read an article or story.
  7. Use the site fully on mobile navigation.
  8. Use major flows with keyboard only.
- [ ] Add axe-core accessibility checks to E2E.
- [ ] Add a broken-link checker to CI.
- [ ] Document the test strategy in the README.

---

## Phase 11 — Documentation

Goal: a project-specific, complete README and docs set.

- [ ] Replace the default README with a project-specific one: purpose, stack, architecture, local setup, env vars, commands, content workflow, media workflow, testing, deployment, database/migrations, email config, security notes, troubleshooting.
- [ ] Finalise `docs/technical-audit.md` (update with post-fix status).
- [ ] Finalise `docs/content-model.md`.
- [ ] Finalise `docs/design-system.md` (design tokens, colours, typography, spacing, components).
- [ ] Finalise `docs/media-guidelines.md`.
- [ ] Finalise `docs/deployment.md`.
- [ ] Finalise `docs/editorial-guidelines.md`.
- [ ] Finalise `docs/safeguarding-and-consent.md`.
- [ ] Add `docs/accessibility.md`.

---

## Phase 12 — Pre-launch final checks

- [ ] Confirm no placeholder strings remain in `content/` (grep for `placeholder`, `[`, `]`).
- [ ] Verify all internal and social links.
- [ ] Verify `sitemap.xml` and `robots.txt` in production.
- [ ] Configure Vercel with root directory `vantage-website` and all env vars.
- [ ] Run `node scripts/setup-db.mjs` against production Neon.
- [ ] Test `/admin/login` → `/admin/donations` end-to-end in production.
- [ ] Submit test contact, newsletter, and donation-intent forms; confirm DB writes and/or email fallback.
- [ ] Run Lighthouse on production.
- [ ] Test at 320px, 375px, 768px, 1024px, 1440px.
- [ ] Verify keyboard navigation and 200% zoom.
- [ ] Verify `prefers-reduced-motion`.
- [ ] Get management sign-off on all public content.

---

## Decisions requiring Vantage Foundation management approval

(Tracked in audit §12 and §15. The implementation cannot proceed past Phase 2 without these.)

1. Verified impact figures (10,000+ and 500+) with reporting period and source.
2. Team member names, photos, and bios (with consent).
3. Mobile Money details.
4. Partner list (with consent, especially "Housing Finance Bank").
5. Annual report, financial statements, safeguarding policy, governance manual, Kasaale report documents.
6. Organisation registration number, NGO status, tax-exempt status.
7. Safeguarding policy text and approval.
8. Photograph consent and safeguarding review for the 73 photos in `vantage photos/`.
9. Donor data retention and deletion policy.
10. Bank account details accuracy and approval to publish.
11. Contact details accuracy (Ishaka vs Jinja mismatch).
12. Founding date accuracy (December 2020).
13. Social media accounts to link.
14. Confirmed site domain.

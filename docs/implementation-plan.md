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

### Phase 3C scope (future PR, blocked on consent)

Gallery expansion, `Event` structured data, and additional curated photo stories are blocked on consent-aware media metadata and management-approved event content. Do not implement until consent review is complete.

---

## Phase 4 — Content model and editorial architecture

Goal: make the content system robust enough for non-developer updates and consent-aware media handling.

- [ ] Extend `types/index.ts` `Project` with: `reportingPeriod`, `fundingStatus`, `startDate`, `endDate`, `documents`, `seo` (title, description, ogImage), `published` (boolean), `consent` classification.
- [ ] Extend `types/index.ts` `Story` with: `tags`, `consentClassification`, `relatedProjectSlugs` (already present), `seo`, `published`.
- [ ] Add a `MediaAsset` type and media manifest module.
- [ ] Validate all content modules with Zod schemas at build time (a `lib/validate-content.ts` called from a prebuild script).
- [ ] Add a `published` flag and filter unpublished content from production routes (keep visible in dev).
- [ ] Document the editorial workflow in `docs/editorial-guidelines.md`.
- [ ] Evaluate MDX for long-form story bodies (optional — only if the team needs richer formatting than markdown).

---

## Phase 5 — Forms and email flows

Goal: make every form safe, accessible, and abuse-resistant.

- [ ] Add rate limiting to contact, newsletter, donation-intent, and admin login (in-memory or Upstash Redis if deployed to Vercel).
- [ ] Add CSRF tokens to admin forms (or migrate admin actions to server actions with origin checks).
- [ ] Improve honeypot: add a second honeypot with a realistic field name and a time-trap field.
- [ ] Add per-form field-level error display (currently only a single concatenated message).
- [ ] Add idempotency to donation-intent (prevent duplicate submissions from double-clicks).
- [ ] Sanitise and escape all user-controlled content in email bodies (currently `formatBody` does `Object.entries` join — safe for plain text but should be explicit).
- [ ] Validate `SMTP_FROM` format at startup.
- [ ] Add safe HTML email templates (optional — plain text is currently sent).
- [ ] Add a documented email configuration section to README and `docs/deployment.md`.
- [ ] Add a privacy notice to every form ("We will only use your details to respond to your enquiry…").

---

## Phase 6 — Media optimisation and performance

Goal: mobile-first, low-bandwidth performance.

- [ ] Define image size presets and `sizes` attributes per component (hero, card, thumbnail).
- [ ] Add `placeholder="blur"` with generated blur data URLs for above-the-fold images.
- [ ] Lazy-load all below-the-fold images (default in `next/image` — verify).
- [ ] Set explicit `width`/`height` on all images to prevent CLS.
- [ ] Add focal-point-aware cropping for hero images (using `objectPosition`).
- [ ] Define and document performance budgets (LCP < 2.5s on 3G, JS bundle < 150 KB gzip per route, no layout shift).
- [ ] Audit and reduce client-side JS (only `Header`, `ProjectList`, forms, `CopyBankDetails` are client — verify no accidental client components).
- [ ] Add `next/font` display=swap (already set) and preconnect to Google Fonts.
- [ ] Test under throttled 3G network conditions at 320px, 375px, 768px, 1024px, 1440px.
- [ ] Run Lighthouse and record scores in `docs/deployment.md`.

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

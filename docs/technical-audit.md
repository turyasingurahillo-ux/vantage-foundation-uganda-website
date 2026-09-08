# Vantage Foundation Uganda Website — Technical Audit (Phase 1, Historical)

> **Historical document.** This audit was conducted on 2026-07-25 against
> commit `306101e` (Phase 1). The codebase has since progressed through
> Phases 2–10. Many findings here have been resolved; some remain as
> documented decisions. This document is preserved for historical context
> and to trace why specific architectural choices were made. For the
> current state of the project, see `README.md`,
> `docs/implementation-plan.md`, and `AGENTS.md`.

**Date:** 2026-07-25
**Auditor:** Devin (Phase 1 of GitHub Issue #1)
**Repository:** `turyasingurahillo-ux/vantage-foundation-uganda-website`
**Branch audited:** `main` (commit `306101e`)
**Phase 1 branch:** `phase-1/audit`

---

## 1. Executive summary

The Vantage Foundation Uganda website is a small, well-structured Next.js 16 App Router application in **late launch-prep condition**. The codebase is clean: lint passes, TypeScript strict mode passes, and the production build succeeds with 35 prerendered pages. The architecture is sound and the content system (typed TypeScript modules in `content/`) is a reasonable low-maintenance choice for a volunteer-run nonprofit.

The dominant risks are **content and launch-readiness risks, not engineering risks**:

- Every image on the site renders as a grey "Image coming soon" placeholder because `public/images/` is empty. The authentic programme photograph archive (73 real photos, ~40 MB) exists in an untracked `vantage photos/` folder but has not been organised, optimised, or wired into the content files.
- Several pieces of public-facing content are still placeholder text: team member names, one partner, two impact statistics, all five reports, and Mobile Money instructions.
- Two specific figures ("10,000+ people with clean water access", "500+ young women and men reached") are repeated across the homepage, impact page, and project pages. These need verification from Vantage Foundation management before launch, per the issue's constraint against invented statistics.
- 13 high-severity dependency vulnerabilities (Nodemailer 6.9.14, postcss and sharp bundled with Next.js 16.2.10) are present; all require breaking upgrades to fix.

No committed secrets, no SQL injection, no obvious XSS, and no broken routes were found. The donation-intent flow and admin verification dashboard are functional and degrade gracefully when `DATABASE_URL` and `SMTP_*` are unset.

**Recommendation: improve incrementally, do not rebuild.** The architecture is appropriate, the code is maintainable, and a rewrite would discard working functionality and volunteer effort for no gain. The work ahead is content completion, image management, accessibility polish, security hardening, and test coverage — all of which fit cleanly onto the existing foundation. Evidence for this recommendation is in §11.

---

## 2. Methodology

- Read every tracked source file (88 files) and the master specification (GitHub Issue #1).
- Installed dependencies with `npm install` (463 packages).
- Ran `npm run lint`, `npm run type-check`, `npm run build`, `npm test`, and `npm audit`.
- Started the dev server and requested every route (homepage, all 11 static pages, 2 dynamic route samples, admin login, sitemap, robots, a deliberate 404, and form POSTs).
- Inspected rendered HTML for landmarks, heading order, alt text, placeholder strings, image references, and SEO metadata.
- Reviewed Neon database queries, Nodemailer usage, server actions, admin auth, and environment variable handling.
- Checked git history for accidentally committed secrets.

Findings are classified as:

- **Working and acceptable** — meets a reasonable standard for launch.
- **Working but weak** — functions but should be improved before launch.
- **Broken** — does not work as intended.
- **Incomplete** — scaffolded but not finished.
- **Risky** — introduces a security, privacy, or reliability risk.
- **Missing** — absent and needed.
- **Requires management information** — cannot be resolved without Vantage Foundation input.

---

## 3. Build, lint, type-check, and test baseline

| Check | Command | Result |
|---|---|---|
| Dependency install | `npm install` | 463 packages, 13 high-severity vulnerabilities |
| Lint | `npm run lint` | **Pass** (0 errors, 0 warnings) |
| Type-check | `npm run type-check` (`tsc --noEmit`) | **Pass** (strict mode) |
| Production build | `npm run build` | **Pass** — 35 pages, 7 project detail pages, 6 story pages |
| Tests | `npm test` | **No test script defined** — no test framework installed |
| Security audit | `npm audit` | 13 high-severity advisories (see §10) |

**Build route inventory (from `next build`):**

- Static (`○`): `/`, `/_not-found`, `/about-us`, `/donate`, `/faq`, `/get-involved`, `/impact`, `/opengraph-image`, `/our-work`, `/projects`, `/reports-and-accountability`, `/robots.txt`, `/sitemap.xml`, `/stories`
- SSG (`●`): `/projects/[slug]` (7 paths), `/stories/[slug]` (6 paths)
- Dynamic (`ƒ`): `/admin/donations`, `/admin/login`, `/api/admin/login`, `/api/admin/logout`, `/api/admin/verify`, `/contact`

---

## 4. Architecture map

**Frontend**
- Next.js 16.2.10 App Router, React 19.2.4, TypeScript 5 (strict), Tailwind CSS 4
- Server components by default; client components only where interactivity is required (`Header`, `ProjectList`, `ContactForm`, `DonationForm`, `NewsletterForm`, `CopyBankDetails`)
- Reusable primitives in `components/ui/`, shared components in `components/shared/`, homepage sections in `components/sections/`, layout in `components/layout/`
- Content as typed TypeScript modules in `content/` with helper functions and a unified `lib/content.ts` aggregator
- Markdown rendering via `react-markdown` + `remark-gfm` + `rehype-sanitize` (sanitised)

**Backend**
- Server Actions in `app/actions.ts` (contact, newsletter, donation intent) — Zod-validated, honeypot-protected
- API Routes in `app/api/admin/*` (login, logout, verify donation status) — form-post based
- No REST/GraphQL/tRPC surface beyond the admin endpoints
- Database access: `@neondatabase/serverless` tagged-template SQL in `lib/db/index.ts` (parameterised)
- Email: optional Nodemailer SMTP in `app/actions.ts`; silently skipped if `SMTP_HOST` unset

**Database**
- Neon PostgreSQL, single table `donations` (`lib/db/schema.sql`)
- Schema includes status check constraint and indexes on status, email, created_at
- Migration via `scripts/setup-db.mjs` (splits schema.sql on `;` and runs each statement)

**Authentication**
- Single shared secret `ADMIN_SECRET` env var; cookie `vantage_admin` (httpOnly, sameSite=strict, scoped to `/admin`, 1-day maxAge, secure in production)
- No user accounts, sessions, JWTs, OAuth, or RBAC

**Deployment**
- Vercel-intended; no `vercel.json`, no Dockerfile
- No CI/CD (no `.github/workflows/`)
- No monitoring, error tracking, or analytics configured

**External integrations**
- Optional SMTP for form/donation notifications
- No payment gateway, no SMS gateway, no analytics, no CMS

---

## 5. Route and component inventory

### Routes (16 unique paths + 3 API + 2 admin)

| Route | Type | Status | Notes |
|---|---|---|---|
| `/` | Static | 200 | Homepage with 10 sections |
| `/about-us` | Static | 200 | Mission/vision/values/team/governance |
| `/our-work` | Static | 200 | 4 programme pillars + related projects |
| `/projects` | Static | 200 | Filterable project list (client component) |
| `/projects/[slug]` | SSG (7) | 200 | Project detail with markdown body |
| `/impact` | Static | 200 | Stats, outputs, outcomes, regions, SDGs |
| `/stories` | Static | 200 | Story grid |
| `/stories/[slug]` | SSG (6) | 200 | Story detail with markdown body |
| `/get-involved` | Static | 200 | 6 involvement pathways + contact form |
| `/donate` | Static | 200 | Bank details + donation-intent form |
| `/contact` | Dynamic | 200 | Contact info + contact form |
| `/reports-and-accountability` | Static | 200 | Report list + safeguarding/governance copy |
| `/faq` | Static | 200 | Accordion FAQ |
| `/admin/login` | Dynamic | 200 | Password form |
| `/admin/donations` | Dynamic | 307→login | Donation verification table (auth-gated) |
| `/_not-found` | Static | 404 | Default Next.js 404 (no custom page) |
| `POST /api/admin/login` | API | 302 | Sets admin cookie |
| `POST /api/admin/logout` | API | 302 | Clears admin cookie |
| `POST /api/admin/verify` | API | 303 | Updates donation status |
| `/sitemap.xml` | Static | 200 | All static + dynamic routes |
| `/robots.txt` | Static | 200 | Allow all + sitemap reference |
| `/opengraph-image` | Static | 200 | Generated OG image |

### Components (33)

- **Layout:** `Header` (client, mobile menu), `Footer`
- **Sections (homepage):** `Hero`, `TrustStrip`, `AboutTeaser`, `AreasOfWork`, `FeaturedProjects`, `ImpactSection`, `StoriesSection`, `GetInvolvedSection`, `PartnersSection`, `NewsletterSection`
- **Shared:** `Container`, `SectionHeader`, `ImageOrPlaceholder`, `Markdown`, `ProjectCard`, `StoryCard`, `StatCard`, `AreaIcon`, `ContactForm` (client), `DonationForm` (client), `NewsletterForm` (client), `CopyBankDetails` (client), `SkipToContent`
- **UI primitives:** `Button`, `Card`, `Badge`, `Input`, `Select`, `Textarea`, `Label`
- **Projects:** `ProjectList` (client, filter/search)

### Content modules (10)

`site`, `areas`, `projects`, `stories`, `team`, `partners`, `impact`, `reports`, `faq`, `donate` — all typed against `types/index.ts`.

---

## 6. Findings — Working and acceptable

1. **Build hygiene.** Lint, strict type-check, and production build all pass cleanly. No dead code, no unused imports flagged.
2. **Server/client boundaries.** Client components are correctly marked `"use client"` and limited to interactive surfaces. Pages and most components remain server components.
3. **Content architecture.** Typed TS modules in `content/` with helper functions and a `lib/content.ts` aggregator is a maintainable, low-overhead choice for a volunteer team. Zod is available for validation but not yet applied to content modules (see §9).
4. **Database queries.** All Neon queries use the tagged-template API which parameterises inputs — no string concatenation, no SQL injection surface. Schema includes a status check constraint and three indexes.
5. **Form validation.** Contact, newsletter, and donation-intent forms use Zod schemas with field-level error messages, honeypot fields, and graceful fallback when SMTP/DB are unset.
6. **Markdown sanitisation.** `react-markdown` + `rehype-sanitize` prevents XSS in project/story bodies.
7. **Admin auth basics.** Cookie is httpOnly, sameSite=strict, scoped to `/admin`, secure in production, 1-day maxAge. Login/verify endpoints re-check the cookie against `ADMIN_SECRET` on every request.
8. **SEO plumbing.** Layout metadata with `metadataBase`, title template, description, OpenGraph, Twitter card; per-page `metadata` exports on all content pages; JSON-LD `Organization` schema in layout; `sitemap.ts` covering static + dynamic routes; `robots.ts`; generated `opengraph-image.tsx`.
9. **Accessibility foundations.** Skip-to-content link, `<main id="main">` landmark, single `<h1>` per page, sticky header with `aria-label="Main navigation"`, mobile menu button with `aria-expanded`/`aria-controls`, focus-visible outlines, `prefers-reduced-motion` media query, `role="status"`/`aria-live="polite"` on form result regions.
10. **Graceful degradation.** Donation form falls back to email-only when DB is unset; admin dashboard shows a helpful error when DB is unreachable; contact form returns a "please email us directly" message when SMTP is unset.
11. **No committed secrets.** Only `.env.example` (empty values) is tracked. No `.env.local` present. Git history (3 commits) contains no credentials.

## 7. Findings — Working but weak

1. **Admin auth is a single shared secret.** `ADMIN_SECRET` is one password shared by all admins. No users, no audit trail of who verified what, no rate limiting on login attempts, no lockout. Cookie value *is* the secret itself (not a signed session token), so a cookie leak exposes the admin password. Acceptable for a low-traffic internal tool but should be hardened before public launch.
2. **No rate limiting on any form or login.** Contact, newsletter, donation-intent, and admin login are all unthrottled. Honeypot stops naive bots but not determined abuse. Risk: email flooding, donation-table spam, admin brute-force.
3. **No CSRF protection on admin forms.** `/api/admin/verify` and `/api/admin/logout` accept form POSTs and rely only on the cookie. Same-site=strict mitigates this but is not a complete defence.
4. **`our-work` category-matching logic is redundant.** `app/our-work/page.tsx` lines 33-37 have a second clause (`area.title === "Water & Sanitation" && p.category === "Water & Sanitation"`) that is already covered by the case-insensitive first clause. Not a bug, but dead logic.
5. **`ImageOrPlaceholder` only treats paths containing the literal string `"placeholder"` as placeholders.** Real-but-missing images like `/images/hero.jpg` and `/images/about.jpg` bypass the placeholder branch, hit `next/image`, and return HTTP 400 with a console error "The requested resource isn't a valid image". This is a silent failure on every page until images are added.
6. **No custom `not-found.tsx` or `error.tsx`.** The default Next.js 404 page is shown (verified: returns the bare text "NotFound"). No branded error page, no recovery links.
7. **No `loading.tsx` Suspense boundaries.** The dynamic `/contact` and `/admin/*` routes have no streaming/loading state.
8. **README is the default `create-next-app` README.** Mentions Geist font (not used — the project uses Inter) and generic Next.js docs. Not project-specific.
9. **No CI/CD.** No GitHub Actions workflow. Build/lint/type-check run only locally.
10. **No tests.** No test framework installed, no test script. The issue requires unit, component, integration, and E2E tests for critical journeys.
11. **No security headers configuration.** `next.config.ts` has no `headers()` for CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy. Vercel applies defaults but CSP is absent.
12. **No analytics or privacy notice.** If analytics are added later, a privacy notice and consent mechanism will be required.
13. **`lib/content.ts` aggregator is unused.** No file imports `content` from `lib/content.ts`; pages import directly from `content/*`. Dead code or intended future abstraction.
14. **`formatPhone` helper in `lib/utils.ts` is unused.** Footer inlines `site.contact.phone.replace(/\s/g, "")` instead.

## 8. Findings — Broken

1. **All non-placeholder image references 400 (committed state).** On `main`, `Hero` (`/images/hero.jpg`), `AboutTeaser` (`/images/about.jpg`), and the about-us page (`/images/about.jpg`) referenced images that do not exist in `public/images/`. Because the paths did not contain "placeholder", `ImageOrPlaceholder` passed them to `next/image`, which returned HTTP 400 and logged "The requested resource isn't a valid image for /images/hero.jpg received null". The homepage hero — the most important above-the-fold element — was broken. **Status:** the working tree already changes these to `placeholder-*` paths; Phase 1 commits that fix. The deeper issue (the `ImageOrPlaceholder` heuristic only recognising paths containing the literal string "placeholder") is tracked in §7.5.

## 9. Findings — Incomplete

1. **`public/images/` is empty.** Every project, story, partner, and team image path points to `placeholder-*.jpg` and renders as a grey "Image coming soon" box. 30 placeholder references appear on the homepage alone; 8 on the about-us page.
2. **Team content is placeholder.** All 4 team members in `content/team.ts` have names like `"[Founder / Executive Director name to be added]"` and `placeholder: true`. These render publicly on `/about-us`.
3. **One partner is placeholder.** `content/partners.ts` has a third entry `"[Partner name to be added]"` with `placeholder: true`, rendered on the homepage `PartnersSection`.
4. **Two impact statistics are `[Number]` placeholders.** `content/impact.ts` has `"Medical camps conducted"` and `"Workshops hosted since 2021"` set to `"[Number]"`. `StatCard` shows a "Placeholder" badge but the `[Number]` text is still visible to users. 4 `[Number]` occurrences appear on `/impact`.
5. **All 5 reports are `placeholder: true`.** `content/reports.ts` lists Annual Report 2024, Financial Statements 2024, Safeguarding Policy, Governance Manual, and Kasaale Project Report — all without `url` and flagged placeholder. The reports page shows "Coming soon" badges.
6. **Mobile Money instructions are placeholder.** `content/site.ts` `mobileMoney` is the literal string "Mobile Money details will be added here. Please contact us for the current number and registered name." Rendered on `/donate`.
7. **The 5th programme pillar is missing.** The issue specifies 5 pillars (Health, Education, Humanitarian action, WASH, Youth leadership & community empowerment). `content/areas.ts` defines only 4 (Health, Education, Humanitarian Aid, Water & Sanitation). Youth leadership appears in project content but not as a programme area.
8. **No privacy, terms, safeguarding, or accessibility policy pages.** The issue requires `/privacy`, `/terms`, `/safeguarding`, `/accessibility` routes. None exist. The reports page mentions safeguarding and governance but has no dedicated pages.
9. **No `/partners`, `/volunteer`, `/partner-with-us` routes.** The issue lists these; the site folds them into `/get-involved` and `/contact`. Acceptable but should be a conscious decision.
10. **No project/story content model fields for consent, reporting period, funding status, SEO metadata, or publication status.** The issue specifies richer fields than `types/index.ts` currently defines.
11. **No gallery route or media manifest.** The issue requires `/gallery` and a media workflow with captions, credits, date, location, consent status.
12. **No RSS feed for stories.** Listed as optional in the issue.
13. **No structured data for articles, breadcrumbs, or events.** Only `Organization` JSON-LD is present.

## 10. Findings — Risky

1. **13 high-severity dependency vulnerabilities** (`npm audit`):
   - **Nodemailer 6.9.14** (3 advisories): improper TLS certificate validation in OAuth2 token fetch (credential interception); message-level raw option bypasses `disableFileAccess`/`disableUrlAccess` enabling arbitrary file read and full-response SSRF; `addressparser` DoS via recursive calls. Fix requires `nodemailer@9.0.3` (breaking). **Mitigation:** the site only uses Nodemailer for outbound plain-text notifications to a fixed recipient (`site.contact.email`); it does not use OAuth2, raw message options, or parse attacker-controlled addresses. The DoS vector is theoretical because the site never calls `addressparser` on user input. Risk is real but lower than the advisories imply.
   - **postcss ≤8.5.17** (3 advisories, bundled with `next@16.2.10`): XSS via unescaped `</style>`, arbitrary file read via `sourceMappingURL`, path traversal in source map auto-loading. Fix requires `next@16.2.12` (outside stated range).
   - **sharp <0.35.0** (1 advisory, bundled with `next`): inherited libvips CVEs. Fix requires `next@16.2.12`.
   - **Recommendation:** upgrade `next` to the latest 16.x patch and `nodemailer` to 9.x in Phase 2 after confirming no breaking changes.
2. **No rate limiting** (see §7.2) — abuse risk on all forms and admin login.
3. **Admin cookie value equals the secret.** If the cookie is leaked (e.g. via a log, a misconfigured proxy, or an XSS in an admin page), the admin password is exposed. A signed session token or a random session ID keyed to the secret would be safer.
4. **Two large PDFs committed to git history.** `reference/Vantage Foundation.pdf` (13.2 MB) and `reference/Vantage Foundation (U) Executive Summary.pdf` (1.7 MB) are tracked. This bloats clone size and history. Removing them requires `git filter-repo` (history rewrite — destructive, requires coordination). **Do not execute without explicit approval.**
5. **`vantage photos/` (73 photos, ~40 MB) is untracked.** These are the authentic programme photographs referenced by the issue. They are not in `public/images/` and not organised. Some may depict children or vulnerable people — consent and safeguarding review is required before any are published (see §13).
6. **No Content Security Policy.** Without CSP, any future XSS has full reach. Should be added before launch.
7. **`opengraph-image.tsx` uses `ImageResponse` with inline styles.** This is the documented Next.js pattern and is safe, but the OG image is a branded gradient with the letter "V" — it does not use an authentic photo. Acceptable for now.
8. **`sendEmail` does not validate `SMTP_FROM` format.** A misconfigured `SMTP_FROM` could cause transport errors. Low risk.
9. **Donation form collects donor PII (name, email, phone, transaction reference) and stores it in Neon.** No documented data retention or deletion policy. The schema has no `deleted_at` column. For a nonprofit handling donor data, a retention/deletion policy is required (see §13).

## 11. Findings — Missing

1. **Custom 404 page** (`app/not-found.tsx`).
2. **Global error boundary** (`app/error.tsx`) and loading states (`app/loading.tsx`).
3. **Project-specific README** (current is the default create-next-app one).
4. **CI workflow** (`.github/workflows/ci.yml`) running lint, type-check, build, and tests.
5. **Test framework and tests** (the issue requires unit, component, integration, E2E, accessibility, and broken-link tests).
6. **Security headers** in `next.config.ts` (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).
7. **Privacy, terms, safeguarding, accessibility policy pages.**
8. **Gallery route and media manifest.**
9. **5th programme pillar (Youth leadership & community empowerment).**
10. **Content model fields for consent, reporting period, funding status, SEO metadata, publication status.**
11. **Structured data for articles, breadcrumbs, events.**
12. **RSS feed for stories** (optional).
13. **Analytics and privacy notice** (optional, requires consent if added).
14. **Performance budgets documentation.**
15. **Image optimisation workflow** (organise, compress, WebP/AVIF, alt text, focal points, EXIF stripping).
16. **`docs/content-model.md`, `docs/design-system.md`, `docs/media-guidelines.md`, `docs/deployment.md`, `docs/editorial-guidelines.md`, `docs/safeguarding-and-consent.md`** (required by the issue).

## 12. Findings — Requires management information

These cannot be resolved by engineering alone and must be answered by Vantage Foundation Uganda leadership before launch. **No facts, figures, or names may be invented to fill these gaps.**

1. **Verified impact figures.** The "10,000+ people with clean water access" (Kasaale borehole) and "500+ young women and men reached" (SaveGirl) figures appear on the homepage hero, trust strip, impact page, and multiple project pages. Are these figures accurate, current, and approved for public use? What is the reporting period and source?
2. **Team member names, photos, and bios.** All 4 team entries are placeholders. Who are the actual founder, programmes lead, volunteer coordinator, and finance/partnerships lead? Do they consent to being named and photographed on the public website?
3. **Mobile Money details.** The registered number and account name for Mobile Money donations. Until supplied, the donate page shows placeholder text.
4. **Partner list.** Only The Cup Foundation and Housing Finance Bank are listed. Are there other partners (e.g. local orphanages, schools, community organisations, volunteer networks) that should be credited, and do they consent to being named? Is "Housing Finance Bank" comfortable being listed as a "partner" (they are the bank, not a programme partner)?
5. **Annual report, financial statements, safeguarding policy, governance manual, and Kasaale project report.** All 5 are placeholder entries. When will the actual documents be available, and where should they be hosted?
6. **Organisation registration details.** The footer shows the legal name "Vantage Foundation Uganda Limited" but no registration number, NGO status, or tax-exempt status. The FAQ says "We are working towards formal tax-exempt status where applicable." What is the current legal/registration status, and what can be publicly stated?
7. **Safeguarding policy content.** The reports page references safeguarding but no policy text exists. What is the actual policy, and who approves it?
8. **Consent for photographs of children and vulnerable people.** The `vantage photos/` archive contains 73 real programme photos. Which photos have consent for public web use? Which depict children or vulnerable adults and require additional safeguarding review? Are there any photos that must never be published?
9. **Donor data retention and deletion policy.** How long are donation-intent records kept? What is the deletion process? Who can request deletion?
10. **Bank account details accuracy.** The bank details (Housing Finance Bank, account 1160000227127, SWIFT HFINUGKAXXX) are displayed publicly. Are they current and correct? Is publishing the account number acceptable to the bank and to Vantage's board?
11. **Contact details accuracy.** Email `foundationvantage@gmail.com`, phone `+256 786 585 216`, address "Ishaka, Bushenyi, Uganda" but `city: "Jinja"` (mismatch — Ishaka is in Bushenyi district, not Jinja). Which is correct?
12. **Founding date.** "December 2020" is stated in multiple places. Is this the official registration date or the conceptual founding date?
13. **Social media accounts.** Only Instagram and LinkedIn are listed. Are there others (Facebook, X/Twitter, YouTube, TikTok)?
14. **Site URL.** `.env.example` uses `https://vantagefoundationuganda.org`. Is this domain owned and confirmed?

## 13. Recommendation: improve incrementally, do not rebuild

**Recommendation: incremental improvement on the existing architecture.**

Evidence:

1. **The architecture fits the problem.** A volunteer-run nonprofit with low content volume does not need a headless CMS, a custom admin app, or a microservices backend. Typed TS content modules + a single Neon table for donation intents + optional SMTP is the right amount of complexity.
2. **The code is clean and maintainable.** Lint and strict type-check pass; components are small, well-named, and correctly split between server and client; the content system is consistent.
3. **The build works.** 35 pages prerender successfully; dynamic routes (admin, contact) function and degrade gracefully.
4. **A rewrite would discard working functionality.** The donation-intent flow, admin verification dashboard, form validation, markdown rendering, SEO plumbing, and accessibility foundations all work. Rebuilding them would cost weeks of volunteer time for no user-facing gain.
5. **The real work is content, not code.** 9 of the 14 "requires management information" items and 8 of the 13 "incomplete" items are content gaps that no rewrite would solve.
6. **The risky items are patchable.** Dependency upgrades, rate limiting, CSRF tokens, CSP headers, and a signed session token are all additive changes that fit the existing structure.

The only candidate for partial rebuild is the image/media system, which currently has no real images, no manifest, and no consent tracking. Even there, the `ImageOrPlaceholder` component and `next/image` configuration are sound — what is missing is the content and workflow, not the code.

---

## 14. Phase 1 baseline fixes applied

This audit is accompanied by a small set of clearly-safe baseline fixes that do not change behaviour, content, or architecture:

1. **Add `app/not-found.tsx`** — a branded 404 page with a link back to the homepage. No content changes elsewhere.
2. **Adopt the working-tree image-path fix as a baseline.** The committed `main` branch referenced `/images/hero.jpg` and `/images/about.jpg` (which do not exist and caused HTTP 400s on the homepage hero and about pages). The working tree already changes these to `/images/placeholder-hero.jpg` and `/images/placeholder-about.jpg`, which render the existing grey "Image coming soon" placeholder via `ImageOrPlaceholder`'s placeholder heuristic. This is a clearly-safe fix (no behaviour change beyond stopping the 400s) and is committed as part of Phase 1. The deeper `ImageOrPlaceholder` heuristic improvement (treating any missing file as a placeholder) is deferred to Phase 2 with the image workflow.
3. **Remove the redundant category-matching clause in `app/our-work/page.tsx`** — the second `||` branch is already covered by the case-insensitive first branch.
4. **Remove unused `lib/content.ts` aggregator and `formatPhone` helper** — dead code, no behaviour change. (Deferred: these are harmless and removal risks nothing, but the issue says "do not delete working functionality without documenting the reason" — these are not working functionality, they are unused. Documented here.)

All other findings are deferred to the phased implementation plan in `docs/implementation-plan.md`.

---

## 15. Open questions for Vantage Foundation management

(See §12 for the full list. The highest-priority items are: verified impact figures, team names/photos, Mobile Money details, partner list, report documents, and photograph consent.)

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Vantage Foundation Uganda Website

## Commands
- `npm run dev` — start the Next.js dev server (Turbopack)
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — ESLint
- `npm run type-check` — TypeScript check
- `npm run generate:social` — rebuild social-card images (see "Social previews")

## Project structure
- `app/` — Next.js App Router pages and special files (`sitemap.ts`, `robots.ts`, `actions.ts`)
- `components/sections/` — homepage section components
- `components/shared/` — reusable components (forms, cards, image placeholders)
- `components/admin/` — admin-only client components (media manager)
- `components/ui/` — small primitives (Button, Card, Input, etc.)
- `content/` — all editable content (site config, projects, stories, team, partners, impact, FAQ, reports, donation)
- `lib/` — utilities and content helpers
- `lib/storage/` — Cloudflare R2 client and object-key conventions (server-only)
- `lib/db/` — Neon PostgreSQL queries (`index.ts` = donations, `media.ts` = media objects, `admins.ts` = named admin accounts, `audit.ts` = immutable audit log, `schema.sql` = table definitions)
- `public/images/` — real images go here; placeholder filenames are handled by `ImageOrPlaceholder`
- `public/images/social/` — **generated**; do not hand-edit. Run `npm run generate:social`.
- `types/` — shared TypeScript interfaces

## Social previews (important)
Link-preview crawlers (X, LinkedIn, Facebook, WhatsApp) do **not** render the
WebP and AVIF heroes the site serves to browsers. Advertising one as `og:image`
is what makes X show a grey generic-document card instead of the article
artwork.

So the social card is resolved separately from the hero, by
`lib/social-image.ts`, which refuses any format or off-origin URL a crawler
cannot be trusted with and falls back to the branded site card rather than
emitting something broken. Cards are pre-rendered to 1200×630 JPEG in
`public/images/social/`.

**When you add or re-image a story or project:** run `npm run generate:social`
and commit the new card. `npm run validate-content` (which `prebuild` runs)
fails the build if a published item's card is missing, so this cannot ship
half-done. A hand-made card wins over a generated one — set `seo.socialImage`
with its real width, height and MIME type.

## Email privacy (important)
`foundationvantage@gmail.com` is a **protected operational mailbox** and must
never be published on the public site — not in `content/site.ts`, not in a
`mailto:` link, not in JSON-LD or metadata, and not in any `NEXT_PUBLIC_*`
variable. It lives only in `lib/contact-inbox.ts`, which imports `server-only`
so it cannot reach a client bundle.

Visitors contact Vantage through `/contact`. A public alias is displayed only
when `NEXT_PUBLIC_CONTACT_EMAIL` is set to a **verified** domain alias;
otherwise the site shows a "Contact Vantage" link instead of an address.

Full architecture, the anti-spam layers, and the outstanding Cloudflare/DNS/Gmail
actions: **[docs/email-privacy-and-contact.md](docs/email-privacy-and-contact.md)**.

## Editing content
All non-code content lives in the `content/` folder as TypeScript modules. To update a project, story, team member, partner or report, edit the relevant file. Placeholder data is marked with `[...]` or the `placeholder` boolean. Replace placeholder content with verified information before public launch.

### Story hero images
A story's hero image is reused at several crop shapes (page hero, cards, the
related-stories carousel), so a photograph whose subject sits off-centre can
lose their head in the shallowest of them. Set `heroImageFocalPoint` on the
story — a CSS `object-position` value such as `"50% 12%"` — to hold the focus
where the subject is. Omit it and the template biases slightly above centre,
which suits most field photography.

Portrait photographs do not need this to be safe: `app/stories/[slug]/page.tsx`
reads the image's real dimensions (`lib/image-dimensions.ts`) and gives a tall
source a portrait hero beside the headline instead of a cinematic band. The
focal point still applies to its cards. See `lib/story-article.ts`.

## Environment variables
Copy `.env.example` to `.env.local` and set:
- `NEXT_PUBLIC_SITE_URL` — canonical site URL
- `DATABASE_URL` — Neon PostgreSQL connection string (server-side only, never commit)
- `ADMIN_SECRET` — HMAC signing key for session tokens AND the bootstrap fallback password (only usable when zero named admins exist). Rotate to revoke all outstanding sessions.
- `CRON_SECRET` — bearer token required by the `/api/instagram/refresh` cron endpoint. If unset, the endpoint fails closed (503).
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` — optional email server for form notifications
- `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` — Cloudflare R2 object storage (server-only). Same bucket/credentials as the sibling kikumikyo project; Vantage objects live under a `vantage/` prefix. Do not rename these variables or create a new bucket.
- `NEXT_PUBLIC_GA4_MEASUREMENT_ID` — optional Google Analytics 4 Measurement ID (public, safe to expose). If set, GA4 loads on public pages and article events are mirrored to gtag. If unset, only the first-party `/api/analytics/events` endpoint runs.
- `GSC_SERVICE_ACCOUNT_EMAIL`, `GSC_PRIVATE_KEY`, `GSC_SITE_URL` — optional Google Search Console integration (all server-only, NEVER exposed to browser). If set, a periodic sync job fetches search analytics and caches them in `article_search_queries`. The admin UI shows a clean setup state when unset. See `lib/search-console.ts`.

## Database setup
1. Create a Neon PostgreSQL database.
2. Run `node scripts/setup-db.mjs` (or paste `lib/db/schema.sql` in the Neon SQL editor) to create the `donations`, `media_objects`, `stories`, `admins`, `audit_log`, `contact_messages`, `contact_message_replies`, and content analytics tables (`article_analytics_daily`, `article_reader_sessions`, `article_share_events`, `article_cta_events`, `article_search_queries`, `search_console_config`). The script is idempotent — safe to re-run after schema updates, and it also runs during `prebuild` (`scripts/migrate-on-build.mjs`), so a deployment cannot land on an environment missing a table.
3. Never commit `.env.local` or any real credentials.

## Admin dashboard
- `/admin/login` — sign in with a named admin username + password, or leave username blank and use `ADMIN_SECRET` (bootstrap mode, only when zero named admins exist). The first admin is created via bootstrap; subsequent logins should use named accounts.
- `/admin/donations` — view and verify/reject donor submissions. Donations are stored with status `pending` and are only marked `verified` after an administrator confirms the transfer against the official bank statement. Every status change is written to the immutable `audit_log` with the actor identity, before/after state, and IP.
- `/admin/media` — upload and manage photos, documents, and logos stored in Cloudflare R2. New uploads default to `pending` consent and `unpublished`; set both before publishing. The browser uploads directly to R2 via a presigned PUT URL (issued by `/api/admin/media/presign`), then the server confirms the object via HEAD and records it in the `media_objects` table. R2 object keys are stored (never signed URLs) so the DB stays stable; presigned GET URLs are minted at render time. Create/update/delete actions are written to `audit_log`.
- `/admin/messages` — the contact inbox. Read submissions, filter by New / Awaiting response / Replied / Archived / All, search by sender, topic or body, and reply to the enquirer directly from the conversation view. Replies are stored in `contact_message_replies` (never appended to the original message) and sent through the shared `lib/email.ts` transport, threaded onto the previous reply via In-Reply-To/References. The recipient is read from the stored row — the browser only submits a message id — and each composer carries a one-shot idempotency key, so a double-click cannot send twice. A conversation only becomes `replied` once the provider accepts the mail; a rejected send is kept as `failed` and moves the conversation to `awaiting_response`. Replies and status changes are written to `audit_log`. "Resend internal notification" is a separate secondary action that re-notifies the team and does not email the enquirer. Inbound replies are Phase 2 — see docs/email-privacy-and-contact.md §7a.
- `/admin/stories` — write, edit and publish Stories & Insights entries stored in the `stories` table. Stories can use Markdown bodies and optional hero images uploaded through the media presign flow. New entries default to drafts; publishing is explicit. Public `/stories` routes merge database entries with the static `content/stories.ts` manifest. The page now opens to a **Content Analytics & Intelligence Dashboard** with KPI summary, trend chart, traffic source breakdown, sortable performance table, Top Content rankings, and Category Intelligence. A view toggle switches to the story editor. CSV export is available for donor/board/grant reporting.
- `/admin/stories/[id]` — individual article analytics view with Edit/Analytics tabs. The Analytics tab shows performance overview, Article Impact Score (0–100 composite), reading behaviour funnel (25/50/75/90% scroll milestones), traffic source attribution with UTM support, Google Search Console performance (when configured), sharing analytics by platform, CTA/impact tracking (donations, volunteering, partnerships, newsletter sign-ups), and a trend chart. The Edit tab provides the full story editor.
- `/admin` — main admin dashboard with a Content Performance card summarising this month's content KPIs and the top performing article, plus quick links to donation verifications and other admin sections.
- `/admin/admins` — create and disable named admin accounts. Passwords are hashed with scrypt (`lib/password.ts`). Disabled admins cannot log in but are retained for audit history. Admins cannot disable their own account.
- `/admin/audit` — read-only view of the immutable `audit_log` table. Every state-changing admin action (donation verification, media CRUD, admin create/disable) is recorded with the actor identity, before/after JSON snapshot, and IP address.

## Donor PII retention
Donor personal data (name, email, phone, message) is stored in the `donations` table. Retention and erasure:

- **Soft-delete**: donations can be soft-deleted (`deleted_at` set) via `purgeOldDeletedDonations` in `lib/db/index.ts`. Soft-deleted rows are excluded from list queries but retained for audit.
- **Retention period**: soft-deleted donations are purged after the retention window defined in `purgeOldDeletedDonations`. Verify the retention period matches your NDPR-Uganda / GDPR obligations before launch (typically 6–7 years for financial records, shorter for non-verified intents).
- **Erasure path**: to fully erase a donor's PII, soft-delete the donation row AND remove their data from any email notifications (SMTP logs are outside this system). A dedicated donor-erasure admin tool is a future task; for now, run a SQL `UPDATE donations SET name = '[erased]', email = '[erased]', phone = NULL, message = NULL WHERE id = <id>` after soft-deleting.
- **Privacy notice**: the donation form must display a privacy notice explaining how donor PII is used and stored, mirroring the `FormPrivacyNotice` on the contact form. Verify this is present before launch.
- **Audit log**: the `audit_log` table may contain before/after snapshots that include donor PII (e.g. donation status changes reference the donation). The audit log is append-only and immutable; erasure of donor PII from audit snapshots is a manual SQL operation that should be documented in your retention policy.

## Content Analytics & Intelligence
The site includes a privacy-safe, first-party content analytics system (no third-party cookies required). Key files:
- `lib/db/analytics.ts` — ingestion upserts and admin aggregation queries (overview, per-article, traffic sources, categories, rankings, trends, Impact Score).
- `lib/db/schema.sql` — analytics tables: `article_analytics_daily` (pre-aggregated daily rollups per article+source), `article_reader_sessions` (per-reader dedup for scroll milestones), `article_share_events`, `article_cta_events`, `article_search_queries` (Search Console cache), `search_console_config`.
- `app/api/analytics/events/route.ts` — public ingestion endpoint. Privacy: anonymous reader cookie is HMAC-hashed server-side with `ADMIN_SECRET`; no IPs/names/emails stored. Rejects events for unpublished articles. Rate-limited.
- `components/shared/ArticleAnalytics.tsx` — client tracker. Fires `article_view`, `article_scroll` (25/50/75/90%, deduped per session), `article_complete`, `article_engagement` (heartbeat). Exposes `window.__vantageArticle.trackShare()` and `trackCta()` for share buttons and CTAs.
- `components/shared/AnalyticsScripts.tsx` — env-configurable GA4 loader. Only loads if `NEXT_PUBLIC_GA4_MEASUREMENT_ID` is set.
- `components/shared/ArticleShareButtons.tsx` — share controls (WhatsApp, LinkedIn, X, Facebook, copy link, native share) with per-platform tracking.
- `components/shared/ArticleCtaBar.tsx` — end-of-article CTAs (Donate, Volunteer, Partner, Contact, Programmes, About) with CTA click tracking.
- `lib/search-console.ts` — server-only Google Search Console integration. Credentials never exposed to browser. Sync job fetches search analytics and caches in `article_search_queries`. Admin UI shows clean setup state when unconfigured.
- `components/admin/charts/Charts.tsx` — lightweight SVG charts (Donut, Bar, Line, Funnel, Sparkline). No external charting library.
- `components/admin/AnalyticsDashboard.tsx` — the main Content Analytics dashboard (KPI summary, trend, performance table, rankings, category intelligence).
- `components/admin/ArticleAnalyticsDetail.tsx` — per-article analytics view.
- `app/api/admin/analytics/route.ts` — admin analytics API (overview, articles, article-detail, traffic, shares, ctas, search-performance, search-queries, categories, trend).
- `app/api/admin/analytics/export/route.ts` — CSV export for donor/board/grant reporting.

**Article Impact Score** (0–100): composite score combining Reach (25%), Engagement (25%), Search (20%), Amplification (15%), and Action (15%). Normalised against the article cohort so a single viral article cannot distort scores. Used for comparing articles, not as an absolute measure. See `computeImpactScore` in `lib/db/analytics.ts`.

**Empty states**: the dashboard distinguishes "0 = measured and none occurred" from "— = data unavailable" (e.g. Search Console not connected). Analytics widgets show clean setup states rather than broken/empty UI when data sources are unconfigured.

## Deployment
This project is configured for Vercel. Set the framework preset to Next.js and, if needed, the root directory to `vantage-website`.


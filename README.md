# Vantage Foundation Uganda Website

The official website for Vantage Foundation Uganda — a youth-led nonprofit improving lives through health, education, and humanitarian action in underserved communities across Uganda.

**Live site:** https://www.vantagefoundationuganda.com

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Neon PostgreSQL (serverless)
- **Email:** Nodemailer (optional, SMTP)
- **Deployment:** Vercel
- **Testing:** Vitest (unit), Playwright (E2E), axe-core (accessibility)
- **CI:** GitHub Actions

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your values (see below)

# Run development server
npm run dev
# Open http://localhost:3000
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript check |
| `npm run validate-content` | Validate content with Zod schemas |
| `npm run check-placeholders` | Scan content/ for placeholder strings |
| `npm run check-links` | Check internal links against routes and content slugs |
| `npm run generate:social` | Regenerate social preview cards |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:e2e` | Run full E2E tests (Playwright) |
| `npm run test:e2e:smoke` | Run CI smoke suite (10 tagged tests) |
| `npm run test:e2e:a11y` | Run accessibility tests (axe-core) |

## Environment Variables

Copy `.env.example` to `.env.local` and set:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string (server-side only) |
| `ADMIN_SECRET` | Yes | HMAC signing key for session tokens AND bootstrap fallback password (only when zero named admins exist) |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical site URL |
| `CRON_SECRET` | No | Bearer token for `/api/instagram/refresh` cron endpoint (fails closed if unset) |
| `INBOUND_EMAIL_SECRET` | No | Bearer token for `/api/inbound/email` endpoint (Cloudflare Email Worker; fails closed if unset) |
| `SMTP_HOST` | No | SMTP server hostname |
| `SMTP_PORT` | No | SMTP port (default: 587) |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASS` | No | SMTP password |
| `SMTP_FROM` | No | From email address |
| `R2_ENDPOINT` | For media | Cloudflare R2 endpoint URL (server-only) |
| `R2_ACCESS_KEY_ID` | For media | R2 access key (server-only, never commit) |
| `R2_SECRET_ACCESS_KEY` | For media | R2 secret key (server-only, never commit) |
| `R2_BUCKET_NAME` | For media | R2 bucket name (shared with sibling kikumikyo project; Vantage objects live under `vantage/` prefix) |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | No | Google Analytics 4 Measurement ID (public, safe to expose) |
| `GSC_SERVICE_ACCOUNT_EMAIL` | No | Google Search Console service account email (server-only) |
| `GSC_PRIVATE_KEY` | No | Google Search Console private key (server-only) |
| `GSC_SITE_URL` | No | Google Search Console site URL (server-only) |

See `docs/deployment.md` for detailed setup instructions.

## Project Structure

```
vantage-website/
├── app/                    # Next.js App Router
│   ├── about-us/           # About page
│   ├── admin/              # Admin dashboard (login + donations)
│   ├── api/                # API routes (admin login, verify, logout)
│   ├── contact/            # Contact page
│   ├── donate/             # Donation page
│   ├── faq/                # FAQ page
│   ├── get-involved/       # Get involved page
│   ├── impact/             # Impact page
│   ├── our-work/           # Our work overview
│   ├── projects/           # Projects list + [slug] detail
│   ├── programmes/         # Programmes [slug] detail
│   ├── reports-and-accountability/
│   ├── stories/            # Stories list + [slug] detail
│   ├── privacy/            # Privacy policy
│   ├── terms/              # Terms of service
│   ├── safeguarding/       # Safeguarding policy
│   ├── accessibility/      # Accessibility statement
│   ├── actions.ts          # Server actions (forms)
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   ├── sitemap.ts          # Sitemap generation
│   └── robots.ts           # Robots.txt
├── components/
│   ├── layout/             # Header, Footer
│   ├── sections/           # Homepage sections (Hero, ImpactSection, etc.)
│   ├── shared/             # Reusable components (forms, cards, images)
│   └── ui/                 # UI primitives (Button, Card, Input, etc.)
├── content/                # All editable content (TypeScript modules)
│   ├── site.ts             # Site config (name, contact, nav)
│   ├── projects.ts         # Project entries
│   ├── stories.ts          # Stories & Insights entries
│   ├── team.ts             # Team members
│   ├── partners.ts         # Partners
│   ├── impact.ts           # Impact statistics
│   ├── reports.ts          # Reports and documents
│   ├── faq.ts              # FAQ items
│   ├── areas.ts            # Programme areas
│   ├── donate.ts           # Donation config
│   └── media.ts            # Media manifest (photos with consent)
├── lib/                    # Utilities
│   ├── db/                 # Database (Neon, schema, queries)
│   ├── rate-limit.ts       # Rate limiting + lockout
│   ├── csrf.ts             # CSRF protection
│   ├── session.ts          # Signed session tokens
│   ├── logger.ts           # Structured logging
│   ├── image-presets.ts    # Image size presets
│   ├── blur-placeholder.ts # Blur placeholder data URL
│   └── validate-content.ts # Zod content validation
├── types/                  # TypeScript interfaces
├── tests/                  # Test files
│   ├── unit/               # Vitest unit/component tests
│   ├── integration/        # Vitest integration tests (PGlite + real PG)
│   ├── e2e/                # Playwright E2E tests
│   └── helpers/            # Test utilities (PGlite, seed data)
├── docs/                   # Documentation
├── scripts/                # Setup scripts
└── public/                 # Static assets (images, etc.)
```

## Content Workflow

All content lives in `content/` as TypeScript modules. Stories & Insights are maintained in `content/stories.ts`. To update content:

1. Edit the relevant file in `content/`
2. Run `npm run validate-content` to verify
3. Set `published: false` if not ready to publish
4. Commit and deploy — the sitemap, RSS feed, and routes update automatically

See `docs/content-model.md` for the full content schema and `docs/editorial-guidelines.md` for the editorial workflow.

## Media Workflow

Media (photos, documents, logos) is managed through two complementary systems:

1. **Admin media uploads** (`/admin/media`) — for operational media managed at runtime.
   - Uploads go directly to Cloudflare R2 via a presigned PUT URL.
   - New uploads default to `pending` consent and `unpublished`; set both before publishing.
   - Object keys (not signed URLs) are stored in the `media_objects` table for stability.
   - All create/update/delete actions are written to the immutable audit log.

2. **Committed static images** (`public/images/`) — for content images bundled with the codebase.
   - Processed through `scripts/process-images.js` and `scripts/generate-media-manifest.js`.
   - Tracked in `content/media.ts` with consent classification.
   - See `docs/media-guidelines.md` for the full pipeline.

**Social preview cards** are generated by `npm run generate:social` and stored in `public/images/social/`. Do not hand-edit these — they are regenerated from content. `npm run validate-content` fails the build if a published item's card is missing.

## Database Setup

1. Create a free [Neon](https://neon.tech) PostgreSQL database
2. Set `DATABASE_URL` in `.env.local`
3. Run the schema setup:
   ```bash
   node --env-file=.env.local scripts/setup-db.mjs
   ```
4. The script is idempotent — safe to re-run after schema updates

See `docs/deployment.md` for detailed database setup instructions.

## Admin Dashboard

- **URL:** `/admin/login`
- **Authentication:** sign in with a named admin username + password, or leave username blank and use `ADMIN_SECRET` (bootstrap mode, only when zero named admins exist)
- **Features:**
  - **Cases & Enquiries** (`/admin/messages`) — case-management workspace tracking every relationship and enquiry through triage to outcome
  - **Donations** (`/admin/donations`) — view, verify, and reject donor submissions
  - **Stories & Insights** (`/admin/stories`) — write, edit, and publish stories; includes Content Analytics & Intelligence Dashboard
  - **Media** (`/admin/media`) — upload and manage photos, documents, and logos in Cloudflare R2. New uploads default to `pending` consent and `unpublished`; set both before publishing.
  - **Admins** (`/admin/admins`) — create and disable named admin accounts (scrypt-hashed passwords)
  - **Audit Log** (`/admin/audit`) — read-only view of the immutable audit trail
  - **Analytics** (`/admin/analytics`) — content performance and analytics overview
- **Security:** Signed session tokens (HMAC), CSRF protection, rate limiting, lockout after 5 failed attempts, active-session authorization (disabled admins and retired bootstrap sessions are revoked immediately)

## Testing

```bash
# Unit, component, and in-process integration tests (Vitest + PGlite)
npm test

# Real PostgreSQL integration tests (requires local PG + INTEGRATION_TEST=1)
INTEGRATION_TEST=1 INTEGRATION_DATABASE_URL=postgresql://localhost/vantage_test npx vitest run tests/integration/

# Full Playwright E2E suite (requires build first)
npm run test:e2e

# CI smoke suite — a small high-value subset tagged @smoke
npm run test:e2e:smoke

# Accessibility tests (axe-core, WCAG 2.2 AA)
npm run test:e2e:a11y
```

CI runs lint, type-check, content validation, placeholder checking, internal-link
checking, Vitest, a production dependency audit, a production build, and Playwright
E2E (accessibility + smoke). Some integration tests require an explicit local
PostgreSQL environment (`INTEGRATION_TEST=1`) and are intentionally excluded from
normal CI — the PGlite-backed integration tests that exercise the same SQL do run
in every CI pass.

See `docs/accessibility.md` for the accessibility testing checklist.

## Deployment

The site is configured for Vercel:

1. Push to GitHub
2. Import the repo in Vercel
3. Set environment variables (see above)
4. Set root directory to `vantage-website` if needed
5. Deploy

See `docs/deployment.md` for full deployment instructions including email configuration.

## Documentation

| Document | Description |
|----------|-------------|
| `docs/deployment.md` | Deployment guide, environment variables, email config, security notes |
| `docs/performance.md` | Performance budgets, image optimization |
| `docs/accessibility.md` | WCAG 2.2 AA compliance, testing checklist |
| `docs/content-model.md` | Content schema and types |
| `docs/design-tokens.md` | Design tokens, colors, typography (canonical) |
| `docs/editorial-guidelines.md` | Editorial workflow |
| `docs/media-guidelines.md` | Media handling, R2 workflow, and optimization |
| `docs/safeguarding-and-consent.md` | Safeguarding and photo consent policy |
| `docs/technical-audit.md` | Phase 1 technical audit (historical) |
| `docs/implementation-plan.md` | Phased implementation plan |
| `docs/email-privacy-and-contact.md` | Email privacy architecture and contact flow |
| `docs/security.md` | Security architecture and threat model |
| `docs/case-management-workflows.md` | Case management pipeline documentation |
| `docs/internationalization.md` | i18n architecture and locale routing |

## Troubleshooting

### Build fails with "Setup failed: NeonDbError: Error connecting to database"

The build runs `scripts/migrate-on-build.mjs` during `prebuild`. If `DATABASE_URL` is missing or the database is unreachable, the build fails. Set `DATABASE_URL` in your environment (`.env.local` for local dev, Vercel env vars for production).

### `npm audit` fails with a gzip decode error

This is a known npm bug behind some proxies. Try:
```bash
npm audit --prefer-online
# or
npx better-npm-audit audit
```

### E2E tests fail locally with "Error connecting to database"

E2E tests start a local Playwright server that needs `DATABASE_URL`. Set it in `.env.local` or skip E2E tests if you only need unit tests (`npm test`).

### Admin login fails with "Invalid credentials"

- If no named admins exist, leave the username blank and use `ADMIN_SECRET` (bootstrap mode).
- If named admins exist, use their username and password. Bootstrap mode is disabled once any admin exists.
- After 5 failed attempts within 15 minutes, the IP is locked out for 15 minutes.

### Social preview cards show a grey placeholder

Run `npm run generate:social` to regenerate cards from content. `npm run validate-content` will fail the build if a published item's card is missing.

### Link checker fails with "broken internal links"

Run `npm run check-links` to see which links are broken. The checker validates internal links against the app's route patterns and content-backed dynamic slugs. See `scripts/check-links.ts` for the matcher logic.

## Security

- `.env.local` is gitignored — never commit secrets
- Admin auth uses HMAC-signed session tokens (not raw secrets)
- All forms have honeypot fields, time-trap bot detection, and rate limiting
- CSRF protection on all admin routes (double-submit cookie pattern)
- Email content is sanitised to prevent header injection
- Donation form has idempotency protection (prevents duplicate submissions)
- See `docs/deployment.md` → Security Notes for full details

## License

© 2026 Vantage Foundation Uganda Limited. All rights reserved.

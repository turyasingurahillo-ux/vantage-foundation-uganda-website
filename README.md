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
| `npm test` | Run unit tests (Vitest) |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:e2e` | Run E2E tests (Playwright) |

## Environment Variables

Copy `.env.example` to `.env.local` and set:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `ADMIN_SECRET` | Yes | Password for `/admin` dashboard |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical site URL |
| `SMTP_HOST` | No | SMTP server hostname |
| `SMTP_PORT` | No | SMTP port (default: 587) |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASS` | No | SMTP password |
| `SMTP_FROM` | No | From email address |
| `R2_ENDPOINT` | For media uploads | Cloudflare R2 endpoint URL (server-only) |
| `R2_ACCESS_KEY_ID` | For media uploads | R2 access key (server-only, never commit) |
| `R2_SECRET_ACCESS_KEY` | For media uploads | R2 secret key (server-only, never commit) |
| `R2_BUCKET_NAME` | For media uploads | R2 bucket name (shared with sibling kikumikyo project; Vantage objects live under `vantage/` prefix) |

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
│   ├── unit/               # Vitest unit tests
│   └── e2e/                # Playwright E2E tests
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
- **Password:** the value of `ADMIN_SECRET`
- **Features:**
  - View donations, verify/reject donation status (`/admin/donations`)
  - Upload and manage media in Cloudflare R2 (`/admin/media`) — photos, documents, logos. New uploads default to `pending` consent and `unpublished`; set both before publishing.
  - Write, edit and publish Stories & Insights entries (`/admin/stories`). New entries default to drafts.
- **Security:** Signed session tokens (HMAC), CSRF protection, rate limiting, lockout after 5 failed attempts

## Testing

```bash
# Unit tests (65 tests)
npm test

# E2E tests (Playwright — requires build first)
npm run test:e2e

# Accessibility tests (axe-core, WCAG 2.2 AA)
npx playwright test tests/e2e/accessibility.spec.ts
```

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
| `docs/deployment.md` | Deployment guide, email config, security notes |
| `docs/performance.md` | Performance budgets, image optimization |
| `docs/accessibility.md` | WCAG 2.2 AA compliance, testing checklist |
| `docs/content-model.md` | Content schema and types |
| `docs/design-system.md` | Design tokens, colors, typography, components |
| `docs/editorial-guidelines.md` | Editorial workflow |
| `docs/media-guidelines.md` | Media handling and optimization |
| `docs/safeguarding-and-consent.md` | Safeguarding and photo consent policy |
| `docs/technical-audit.md` | Initial technical audit findings |
| `docs/implementation-plan.md` | Phased implementation plan |

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

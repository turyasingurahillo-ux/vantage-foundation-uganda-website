# Deployment Guide

This document covers everything you need to deploy the Vantage Foundation Uganda website to Vercel, including environment variables, database setup, and optional email configuration.

## Prerequisites

- A GitHub account with the repository pushed
- A [Vercel](https://vercel.com) account (free tier is sufficient)
- A [Neon](https://neon.tech) PostgreSQL database (free tier is sufficient)
- Node.js 20+ installed locally for database setup

## Step 1: Database Setup (Neon)

1. Create a free Neon database at https://console.neon.tech
2. Copy your connection string (starts with `postgresql://...`)
3. Run the schema setup locally:
   ```bash
   # In your .env.local file, set DATABASE_URL to your Neon connection string
   node --env-file=.env.local scripts/setup-db.mjs
   ```
4. Verify the table was created:
   ```bash
   node --env-file=.env.local -e "import('@neondatabase/serverless').then(async ({neon}) => { const sql = neon(process.env.DATABASE_URL); const r = await sql\`SELECT count(*) FROM donations\`; console.log('Row count:', r[0].count) })"
   ```

## Step 2: Deploy to Vercel

1. Go to https://vercel.com and sign in with GitHub
2. Click "Add New Project" and import the repository
3. If the project is in a subdirectory, set the Root Directory to `vantage-website`
4. Add the following Environment Variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string (server-side only) |
| `ADMIN_SECRET` | Yes | HMAC signing key for session tokens AND the bootstrap fallback password (only usable when zero named admins exist). Rotate to revoke all outstanding sessions. |
| `NEXT_PUBLIC_SITE_URL` | Yes | Your site URL (e.g. `https://your-project.vercel.app`) |
| `CRON_SECRET` | No | Bearer token required by the `/api/instagram/refresh` cron endpoint. If unset, the endpoint fails closed (503). |
| `INBOUND_EMAIL_SECRET` | No | Bearer token required by the `/api/inbound/email` endpoint (Cloudflare Email Worker). If unset, the endpoint fails closed (503). Rotate to revoke the worker's access. |
| `SMTP_HOST` | No | SMTP server hostname (see Email Configuration below) |
| `SMTP_PORT` | No | SMTP port (default: 587) |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASS` | No | SMTP password |
| `SMTP_FROM` | No | From address. Must be authorised by your SMTP provider; falls back to `SMTP_USER`. Never falls back to the protected mailbox. |
| `CONTACT_INBOX` | No | Where contact-form notifications are delivered (server-only). See [email-privacy-and-contact.md](email-privacy-and-contact.md). |
| `NEXT_PUBLIC_CONTACT_EMAIL` | No | Public alias to display on the site. Leave blank until a domain alias is created **and verified**. |
| `R2_ENDPOINT` | For media | Cloudflare R2 endpoint URL (server-only) |
| `R2_ACCESS_KEY_ID` | For media | R2 access key (server-only, never commit) |
| `R2_SECRET_ACCESS_KEY` | For media | R2 secret key (server-only, never commit) |
| `R2_BUCKET_NAME` | For media | R2 bucket name (shared with sibling kikumikyo project; Vantage objects live under a `vantage/` prefix) |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | No | Google Analytics 4 Measurement ID (public, safe to expose). If set, GA4 loads on public pages and article events are mirrored to gtag. If unset, only the first-party `/api/analytics/events` endpoint runs. |
| `GSC_SERVICE_ACCOUNT_EMAIL` | No | Google Search Console service account email (server-only, never exposed to browser) |
| `GSC_PRIVATE_KEY` | No | Google Search Console private key (server-only) |
| `GSC_SITE_URL` | No | Google Search Console site URL (server-only) |

5. Click "Deploy" and wait 2-3 minutes

## Step 3: Email Configuration (Optional)

By default, the website works without email — form submissions are stored in the database and shown in the admin dashboard. Email notifications are sent only when SMTP is configured.

### When email is enabled

The following events trigger an email notification to the mailbox resolved by `lib/contact-inbox.ts` (`CONTACT_INBOX`, or a per-category alias, falling back to Vantage's protected mailbox):

| Event | Subject line |
|-------|-------------|
| Contact form submission | `[VANTAGE CONTACT — {CATEGORY}] {Category} from {name}` |
| Newsletter subscription | `Newsletter signup` |
| Donation intent submitted | `Donation intent received` |

### SMTP Providers

Any SMTP provider works. Common choices:

#### Resend (recommended — free tier: 3,000 emails/month)

1. Sign up at https://resend.com
2. Add and verify your domain (or use `onboarding@resend.dev` for testing)
3. Create an API key
4. Set environment variables:
   ```
   SMTP_HOST=smtp.resend.com
   SMTP_PORT=465
   SMTP_USER=resend
   SMTP_PASS=your_api_key_here
   SMTP_FROM=onboarding@resend.dev  (or your verified domain email)
   ```

#### Gmail (for low volume only — 500 emails/day limit)

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password at https://myaccount.google.com/apppasswords
3. Set environment variables:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   SMTP_FROM=your_email@gmail.com
   ```

#### Brevo (free tier: 300 emails/day)

1. Sign up at https://www.brevo.com
2. Get your SMTP credentials from Settings → SMTP & API
3. Set environment variables:
   ```
   SMTP_HOST=smtp-relay.brevo.com
   SMTP_PORT=587
   SMTP_USER=your_smtp_key
   SMTP_PASS=your_smtp_key
   SMTP_FROM=your_verified_email@yourdomain.com
   ```

### SMTP_FROM validation

The `SMTP_FROM` environment variable is validated at runtime:
- Must be a valid email address format (`name@domain.tld`), a single address with no commas or CR/LF
- If invalid or unset, the system falls back to `SMTP_USER`
- A warning is logged when an invalid value is ignored
- It deliberately does **not** fall back to Vantage's protected mailbox — an unauthorised From address is rejected by SPF/DMARC anyway

### Email content

All emails are sent as both plain text and HTML:
- **Plain text**: key-value pairs of form data
- **HTML**: branded template with Vantage Foundation header, data table, and footer
- All user-controlled content is sanitised (CR/LF and control characters stripped, length capped) to prevent email header injection, and HTML-escaped before it is placed in the HTML body

### Testing email locally

1. Set SMTP variables in `.env.local`
2. Run `npm run dev`
3. Submit a contact form, newsletter signup, or donation
4. Check the inbox configured by `CONTACT_INBOX`

If SMTP is not configured, contact submissions are still stored in the `contact_messages` table and readable at `/admin/messages`, so nothing is lost. No mailbox address is ever shown to the visitor.

## Step 4: Custom Domain (Optional)

1. Purchase a domain (e.g. `vantagefoundationuganda.org`)
2. In Vercel: Project Settings → Domains → Add Domain
3. Add the DNS records Vercel shows you at your domain registrar
4. Wait for DNS propagation (can take up to 48 hours, usually 15 minutes)
5. Update `NEXT_PUBLIC_SITE_URL` in Vercel env vars to your custom domain
6. Redeploy

## Step 5: Admin Dashboard

Once deployed, the admin dashboard is available at:
- **URL**: `https://your-project.vercel.app/admin/login`
- **Authentication**: sign in with a named admin username + password, or leave username blank and use `ADMIN_SECRET` (bootstrap mode, only when zero named admins exist). The first admin is created via bootstrap; subsequent logins should use named accounts.

Features:
- **Cases & Enquiries** (`/admin/messages`) — the case-management workspace. Tracks every relationship and enquiry through triage to outcome. The legacy message-delivery state (`status`: new / awaiting_response / replied / archived) tracks email correspondence, and a separate case workflow state (`workflow_status`: new / triage / awaiting_vantage / awaiting_external / under_review / due_diligence / meeting_scheduled / decision_required / accepted / referred / declined / completed / archived) records what happens next. Internal notes, outcomes, decline reasons, referrals, and manual intake from non-website sources (WhatsApp, phone, social media) are all supported.
- **Donations** (`/admin/donations`) — view all donation submissions with status (pending, verified, rejected). Verify donations (marks as confirmed against bank statement) or reject. Soft-deleted records are permanently purged after 365 days.
- **Stories & Insights** (`/admin/stories`) — write, edit, and publish stories stored in the `stories` table. Opens to a Content Analytics & Intelligence Dashboard with KPI summary, trend chart, traffic source breakdown, sortable performance table, Top Content rankings, and Category Intelligence. Public `/stories` routes merge database entries with the static `content/stories.ts` manifest.
- **Media** (`/admin/media`) — upload and manage photos, documents, and logos stored in Cloudflare R2. New uploads default to `pending` consent and `unpublished`; set both before publishing. The browser uploads directly to R2 via a presigned PUT URL, then the server confirms the object and records it in the `media_objects` table.
- **Admins** (`/admin/admins`) — create and disable named admin accounts. Passwords are hashed with scrypt. Disabled admins cannot log in but are retained for audit history. Admins cannot disable their own account.
- **Audit Log** (`/admin/audit`) — read-only view of the immutable `audit_log` table. Every state-changing admin action is recorded with actor identity, before/after JSON snapshot, and IP address.
- **Analytics** (`/admin/analytics`) — content performance and analytics overview.
- CSRF-protected with double-submit cookie pattern
- Rate-limited (5 login attempts per minute, 20 verify actions per minute)

## Security Notes

- `.env.local` is gitignored and will never be committed
- `DATABASE_URL` is server-side only (never exposed to the browser)
- `ADMIN_SECRET` is server-side only
- Admin cookie is httpOnly, secure (in production), sameSite=strict
- All forms have honeypot fields and time-trap bot detection
- All forms are rate-limited (3 submissions per minute per IP)
- Donation form has idempotency protection (prevents duplicate submissions from double-clicks)
- All email content is sanitised to prevent header injection

### Admin authentication

- **Signed session tokens**: The admin cookie stores an HMAC-signed random session ID, not the raw `ADMIN_SECRET`. Even if the cookie is leaked, the secret cannot be extracted from it.
- **Lockout policy**: After 5 failed login attempts within 15 minutes, the IP is locked out for 15 minutes. Successful login clears the failure history.
- **Rate limiting**: 5 login attempts per minute per IP (in addition to lockout).
- **CSRF protection**: All admin POST routes use the double-submit cookie pattern with timing-safe comparison.
- **Cookie security**: httpOnly, secure (in production), sameSite=strict, path=/admin, maxAge=1 day.

### Audit logging

All state-changing admin actions are logged with:
- Actor identity (admin username or bootstrap)
- Before and after status/JSON snapshot
- Admin IP address
- Timestamp

Logged actions include: donation verification/rejection, media CRUD (create/update/delete), admin create/disable, story publish/unpublish/edit, case workflow updates, case notes, case intake, and message replies.

Logs do not contain PII (names, emails, phone numbers). Audit logs are written to the server log stream (visible in Vercel dashboard) and the immutable `audit_log` database table.

### Data retention and deletion

- Donations can be soft-deleted (sets `deleted_at` timestamp, hides from dashboard)
- Soft-deleted records are permanently purged after 365 days via `purgeOldDeletedDonations()`
- To run the purge manually: `node --env-file=.env.local -e "..."` (see `lib/db/index.ts`)
- For automated cleanup, set up a Vercel Cron job that calls the purge function

### Database migrations

The `scripts/setup-db.mjs` script is idempotent and safe to re-run. It creates all tables:
- `donations` — donor submissions with soft-delete support
- `media_objects` — R2 media object metadata
- `stories` — database-backed Stories & Insights entries
- `admins` — named admin accounts (scrypt-hashed passwords)
- `audit_log` — immutable audit trail
- `contact_messages` — contact form submissions with case-management enrichment
- `contact_message_replies` — threaded email replies (stored separately, never appended to the original message)
- Content analytics tables: `article_analytics_daily`, `article_reader_sessions`, `article_share_events`, `article_cta_events`, `article_search_queries`, `search_console_config`

The script also runs during `prebuild` (`scripts/migrate-on-build.mjs`), so a deployment cannot land on an environment missing a table.

To apply schema updates after pulling new code:
```bash
node --env-file=.env.local scripts/setup-db.mjs
```

### npm audit

Run `npm audit` periodically to check for known vulnerabilities. If the npm registry returns a gzipped response that npm can't decode (a known npm bug behind some proxies), try:
```bash
npm audit --prefer-online
# or
npx better-npm-audit audit
```

### Removing large files from git history

The `reference/` directory previously contained two large PDFs (~15 MB total). These have been removed from the working tree and gitignored, but they still exist in git history. To fully purge them, coordinate with all contributors and run:
```bash
# Install git-filter-repo (one-time)
pip install git-filter-repo
# Rewrite history to remove the PDFs
git filter-repo --path "reference/Vantage Foundation.pdf" --path "reference/Vantage Foundation (U) Executive Summary.pdf" --invert-paths
# Force-push (coordinate with all contributors first!)
git push origin --force --all
```
This is a destructive operation that rewrites all commits. Ensure all contributors have pushed their work and no one has uncommitted changes before running.

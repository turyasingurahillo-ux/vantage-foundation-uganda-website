# Security — Vantage Foundation Uganda

This document consolidates the security posture of the Vantage Foundation Uganda website in one place. It is intended for developers, deployers, and reviewers.

**Last audit:** 2026-08-02
**npm audit:** 0 vulnerabilities
**Dependencies:** next 16.2.12 (latest), nodemailer 9.0.3 (latest), react 19.2.4

---

## Security headers

All headers are set in `next.config.ts` and applied to every route via the `headers()` function.

| Header | Value | Purpose |
|--------|-------|---------|
| `Content-Security-Policy` | Strict static CSP (see below) | Prevents XSS exfiltration, blocks external resources |
| `X-Frame-Options` | `DENY` | Clickjacking protection (older browsers) |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-type sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits referrer leakage |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), ...` | Locks down browser APIs |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Forces HTTPS for 2 years |
| `X-DNS-Prefetch-Control` | `off` | Prevents cross-origin prefetch leakage |
| `X-Powered-By` | (removed) | Does not advertise framework |

### Content-Security-Policy

```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https://*.r2.cloudflarestorage.com;
font-src 'self';
object-src 'none';
frame-src 'none';
form-action 'self';
frame-ancestors 'none';
base-uri 'self';
upgrade-insecure-requests;
connect-src 'self';
```

- `'unsafe-inline'` for scripts/styles is required by Next.js's inline runtime without nonces.
- `img-src` allows Cloudflare R2 for admin-uploaded media (presigned GET URLs).
- All external-origin resource loading is blocked.
- Future: move to nonce-based CSP via `proxy.ts` when the site moves to full dynamic rendering.

---

## Admin authentication

### Session tokens (`lib/session.ts`)

- **HMAC-SHA256 signed tokens** — the raw `ADMIN_SECRET` is never stored in a cookie.
- Token format: `{sessionId}.{expiresAt}.{hmac}`
  - `sessionId`: 32 random bytes (hex, 64 chars)
  - `expiresAt`: Unix timestamp (seconds) — embedded expiry prevents replay beyond lifetime
  - `hmac`: HMAC-SHA256 of `{sessionId}.{expiresAt}` using `ADMIN_SECRET` as key
- **Timing-safe comparison** prevents timing attacks on the HMAC.
- **Cookie attributes**: `httpOnly: true`, `secure: true` (production), `sameSite: "strict"`, `path: "/admin"`, `maxAge: 1 day`.
- **Emergency revocation**: rotate `ADMIN_SECRET` to invalidate all outstanding tokens.

### Rate limiting and lockout (`app/api/admin/login/route.ts`)

- **Rate limit**: 5 login attempts per minute per IP.
- **Lockout**: after 5 failed attempts within 15 minutes, IP is locked out for 15 minutes.
- **Successful login**: clears failure history.
- **CSRF**: double-submit cookie pattern with timing-safe comparison.

### Admin route protection

- All `/admin/*` routes require a valid session cookie (verified via `verifySessionToken`).
- All admin POST routes use CSRF double-submit cookie pattern.
- Admin pages have `robots: { index: false, follow: false }` (centralized in `app/admin/layout.tsx`).
- `/admin/`, `/api/`, `/brand-guide` are disallowed in `robots.txt`.

---

## Public form protection (`app/actions.ts`)

### Rate limiting

- 3 submissions per minute per IP on contact, newsletter, and donation-intent forms.
- In-memory sliding-window limiter (`lib/rate-limit.ts`).
- Returns 429-style message: "Too many submissions from your location."

### Honeypot and time-trap

- **Honeypot 1**: `website` field (hidden, should be empty).
- **Honeypot 2**: `company_url` field (realistic name, hidden, should be empty).
- **Time-trap**: `form_loaded_at` timestamp — if form is submitted within 2 seconds, it's likely a bot.
- Bot submissions return success (to not tip off the bot) but are not processed.

### Idempotency (donation form only)

- `submissionId` token generated on form mount.
- Server tracks recent IDs in-memory with 5-minute TTL.
- Duplicate submissions return success without creating a duplicate record.

### Email sanitisation (`lib/sanitise.ts`)

- `sanitiseValue`: strips CR/LF/tabs/control chars (0x00–0x1f), limits to 1000 chars. Prevents email header injection.
- `escapeHtml`: escapes `&`, `<`, `>`, `"`, `'` for HTML email template. Prevents HTML injection in email body.
- Both functions are unit-tested (`tests/unit/sanitise.test.ts`).

### SMTP_FROM validation

- Validated at runtime with email regex.
- Falls back to `site.contact.email` if invalid.
- Warning logged when fallback is used.

---

## Audit logging (`lib/logger.ts`)

All security-relevant events are logged to the server log stream (visible in Vercel dashboard):

| Event | Log level | Fields |
|-------|-----------|--------|
| Admin login success | `info` | IP |
| Admin login failed | `warn` | IP |
| Admin login locked out | `warn` | IP, remaining seconds |
| Admin login rate limited | `warn` | IP |
| Admin login CSRF failed | `warn` | IP |
| Donation status updated | `info` | ID, before/after status, notes changed, IP |
| Donation duplicate submission | `warn` | submissionId (truncated) |
| Contact/newsletter/donation rate limited | `warn` | — |
| Contact/newsletter/donation honeypot triggered | `warn` | — |
| Contact/newsletter/donation validation failed | `warn` | issue count |
| Email send failed | `error` | SMTP host, subject, error (truncated) |
| SMTP_FROM invalid | `warn` | from (truncated) |

**PII is never logged.** Names, emails, phone numbers, and messages are not included in log entries.

---

## Data retention and deletion (`lib/db/index.ts`)

- **Soft delete**: `softDeleteDonation(id)` sets `deleted_at` timestamp. Record is hidden from admin dashboard but retained for audit.
- **Purge**: `purgeOldDeletedDonations(retentionDays = 365)` permanently deletes records where `deleted_at` is older than 365 days.
- **Privacy policy**: states donor records are soft-deleted on request and permanently purged after 12 months. Contact form submissions retained for up to 12 months. Newsletter subscriptions retained until unsubscribe.
- **Automated cleanup**: set up a Vercel Cron job that calls `purgeOldDeletedDonations()` periodically.

---

## Client IP extraction (`lib/rate-limit.ts`)

- **Trust order**: `x-vercel-forwarded-for` (Vercel edge) → `x-forwarded-for` (rightmost entry) → `x-real-ip`.
- **Rightmost XFF entry**: the closest trusted proxy added it; the leftmost is client-controlled and easy to forge.
- **Single proxy hop assumption**: if deployed behind multiple chained proxies, adjust trust-hop count.

---

## Image security (`next.config.ts`)

- `dangerouslyAllowSVG: true` only for trusted brand logos in `/public/brand/logos/`.
- SVG `Content-Security-Policy`: `default-src 'self'; script-src 'none'; sandbox;` — prevents script execution in SVGs.
- SVG `Content-Disposition: attachment` — forces download, not inline rendering.
- Remote images only from `*.r2.cloudflarestorage.com` (Cloudflare R2).

---

## Environment variables

| Variable | Scope | Security |
|----------|-------|----------|
| `DATABASE_URL` | Server-only | Never exposed to browser, never committed |
| `ADMIN_SECRET` | Server-only | Used as HMAC key for session tokens, never sent to browser |
| `NEXT_PUBLIC_SITE_URL` | Public | Used for canonical URLs and metadata |
| `SMTP_HOST/PORT/USER/PASS/FROM` | Server-only | Never exposed to browser |
| `R2_*` | Server-only | Cloudflare R2 credentials, never exposed to browser |

- `.env.local` is gitignored.
- No secrets are committed to the repository.
- `NEXT_PUBLIC_*` prefix is only used for `NEXT_PUBLIC_SITE_URL` (not sensitive).

---

## What NOT to do

- **Do not** log PII (names, emails, phone numbers, messages) in any log entry.
- **Do not** store payment credentials (PINs, OTPs, card numbers). Donations are bank transfer or Mobile Money — only the transaction reference is recorded.
- **Do not** remove the CSRF protection from admin routes.
- **Do not** reduce the rate limits or lockout thresholds.
- **Do not** disable security headers in `next.config.ts`.
- **Do not** commit `.env.local` or any real credentials.
- **Do not** publish photos without verified consent (see `docs/safeguarding-and-consent.md`).

---

## Testing

```bash
# Run npm audit
npm audit

# Check for outdated packages
npm outdated

# Run unit tests (includes sanitisation and rate-limit tests)
npx vitest run

# Run E2E accessibility tests (includes axe-core checks)
npx playwright test tests/e2e/accessibility.spec.ts
```

### Security review checklist

Before each deployment, verify:

- [ ] `npm audit` reports 0 vulnerabilities
- [ ] No secrets in git history (`git log --all -p | grep -i "secret\|password\|key"`)
- [ ] `.env.local` is not committed
- [ ] `ADMIN_SECRET` is a strong, unique password
- [ ] `DATABASE_URL` points to the production Neon database
- [ ] `NEXT_PUBLIC_SITE_URL` matches the production domain
- [ ] SMTP credentials are set (or email fallback is documented)
- [ ] Security headers are present (check with `curl -I https://your-domain`)
- [ ] `/admin/login` returns 200 and has `noindex`
- [ ] `/admin/donations` redirects to `/admin/login` without a session cookie

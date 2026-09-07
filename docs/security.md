# Security — Vantage Foundation Uganda

This document consolidates the security posture of the Vantage Foundation Uganda website in one place. It is intended for developers, deployers, and reviewers.

**Last audit:** 2026-09-07 (Phase 9 reconciliation)
**npm audit:** 0 vulnerabilities (production, high severity)
**Dependencies:** next 16.3.3, nodemailer 9.1.0, react 19.2.8

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

The CSP is a strict static policy that blocks all external-origin resource loading by default. It is conditionally widened only when specific features are configured:

```
default-src 'self';
script-src 'self' 'unsafe-inline' [Turnstile] [GA4];
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https://*.r2.cloudflarestorage.com;
font-src 'self';
object-src 'none';
frame-src 'none' [or Turnstile origin];
form-action 'self';
frame-ancestors 'none';
base-uri 'self';
upgrade-insecure-requests;
connect-src 'self' [Turnstile] [GA4];
```

- `'unsafe-inline'` for scripts/styles is required by Next.js's inline runtime without nonces.
- `img-src` allows Cloudflare R2 for admin-uploaded media (presigned GET URLs).
- **Turnstile**: when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set, `https://challenges.cloudflare.com` is added to `script-src`, `frame-src`, and `connect-src`.
- **GA4**: when a valid `NEXT_PUBLIC_GA4_MEASUREMENT_ID` (matching `G-[A-Z0-9]{6,}`) is set, `https://www.googletagmanager.com` is added to `script-src` and `https://www.google-analytics.com` is added to `connect-src`. These are narrow, specific origins — no broad wildcards.
- When neither Turnstile nor GA4 is configured, the CSP is exactly as strict as the base policy above.
- Future: move to nonce-based CSP via `proxy.ts` when the site moves to full dynamic rendering.

---

## Admin authentication

### Two-layer session verification

Admin session verification uses two distinct layers:

**Layer A — cryptographic verification (`lib/session.ts`)**

`verifySessionToken(token)` performs pure cryptographic verification with no database I/O:
- Token structure: `{sessionId}.{actorId}.{expiresAt}.{hmac}`
- `sessionId`: 32 random bytes (hex, 64 chars)
- `actorId`: numeric admin id or the literal `"bootstrap"`
- `expiresAt`: Unix timestamp (seconds) — embedded expiry prevents replay beyond lifetime
- `hmac`: HMAC-SHA256 of `{sessionId}.{actorId}.{expiresAt}` using `ADMIN_SECRET` as key
- Timing-safe comparison prevents timing attacks on the HMAC.
- This layer is sync, independently testable, and does not perform database queries.

**Layer B — active authorization (`lib/auth.ts`)**

`verifyActiveAdminSession(token)` builds on Layer A and additionally verifies that the actor is still authorized:
- For `bootstrap` tokens: queries `countActiveAdmins()` and accepts only when zero active named admins exist. **Fails closed on DB/query errors** — a database failure does not allow a bootstrap session.
- For named-admin tokens: queries `isAdminActive(id)` and accepts only when the admin row exists and `disabled_at IS NULL`. **Fails closed on DB/query errors.**
- This layer is async and performs database queries.

**Every security boundary controlling admin access uses Layer B** (`verifyActiveAdminSession` or the shared `guard()` helper), not Layer A alone. This ensures:
- Disabled admins' sessions are **invalidated immediately** — no waiting for the 1-day token expiry.
- Bootstrap sessions become **invalid once named admins exist**.
- Bootstrap checks **fail closed** on database errors.

### Cookie attributes

- `httpOnly: true` — not accessible via JavaScript
- `secure: true` in production — only sent over HTTPS
- `sameSite: "strict"` — not sent on cross-site requests
- `path: "/"` — the cookie is sent to both `/admin/*` pages and `/api/admin/*` endpoints (both need it)
- `maxAge: 1 day`

### Emergency revocation

- **Rotate `ADMIN_SECRET`** to invalidate all outstanding tokens (global revocation).
- **Disable the admin** in `/admin/admins` to invalidate that admin's sessions immediately (individual revocation via Layer B).

### Bootstrap authentication

- `ADMIN_SECRET` login is only allowed when the system has **positively established** that zero active named admins exist.
- If the admin-count query fails, bootstrap login **fails closed** — the system does not treat a DB error as "zero admins".
- Once at least one named admin exists, bootstrap login is disabled and existing bootstrap sessions are rejected by Layer B.
- `ADMIN_SECRET` comparison uses the shared `safeSecretEqual` helper (`lib/safe-compare.ts`) for constant-time comparison.

### Rate limiting and lockout (`app/api/admin/login/route.ts`)

- **Rate limit**: 5 login attempts per minute per IP.
- **Lockout**: after 5 failed attempts within 15 minutes, IP is locked out for 15 minutes.
- **Successful login**: clears failure history.
- **CSRF**: double-submit cookie pattern with timing-safe comparison.

### Authorization model

The system uses an **intentional single-admin-role model**. Any authenticated admin (or the bootstrap actor when no named admins exist) can read and modify every object in the system — donations, cases, organisations, stories, media, and other admin accounts. There is no RBAC or object-level ownership boundary.

This is a deliberate design choice for a small team. If the team grows, a role/permission model or row-level ownership checks should be introduced. Until then, the admin role should be treated as high-trust.

### Admin route protection

- All `/admin/*` pages and `/api/admin/*` endpoints require a valid active session (Layer B verification).
- All admin POST/PATCH/DELETE routes use CSRF double-submit cookie pattern.
- Admin pages have `robots: { index: false, follow: false }` (centralized in `app/admin/layout.tsx`).
- `/admin/`, `/api/`, `/brand-guide` are disallowed in `robots.txt`.

---

## Analytics hashing

First-party analytics (`/api/analytics/events` and `/api/analytics/whatsapp-click`) use HMAC-SHA256 to hash the anonymous `vantage_reader` cookie for dedup. The hash key is `ADMIN_SECRET`.

- If `ADMIN_SECRET` is not configured, the endpoints **fail silently** (return 204) without persisting reader-identifying analytics. A public constant is never used as an HMAC key.
- No IP addresses, names, emails, or browsing profiles are stored. The IP is never persisted — only its HMAC hash, which is not reversible.

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

## Media consent gate

Media uploads enforce a consent invariant: **media cannot be published while consent is `"pending"`**. This is enforced by a shared `assertConsentGate` helper in `app/api/admin/media/route.ts`, used by both POST (create) and PATCH (update) so the invariant cannot drift.

- `published: true` + `consent: "pending"` → rejected with 422 `consent-required`
- `published: false` + `consent: "pending"` → accepted (draft state)
- `published: true` + `consent: "verified"` / `"group-consent"` / `"none"` → accepted
- The public rendering layer (`lib/media-public.ts`) additionally filters to `published: true AND consent !== "pending"`.

---

## Audit logging (`lib/logger.ts`)

All security-relevant events are logged to the server log stream (visible in Vercel dashboard):

| Event | Log level | Fields |
|-------|-----------|--------|
| Admin login success | `info` | IP, actor |
| Admin login failed | `warn` | IP |
| Admin login locked out | `warn` | IP, remaining seconds |
| Admin login rate limited | `warn` | IP |
| Admin login CSRF failed | `warn` | IP |
| Admin login bootstrap disabled | `warn` | IP |
| Admin login count unavailable (fail closed) | `error` | error (truncated) |
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
- **Retention scheduling for other data types** (contact messages, organisations, audit logs, article reader sessions) requires management/legal policy decisions on retention periods.

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

## CI supply-chain hardening

- **Least-privilege permissions**: the CI workflow declares `permissions: { contents: read }` at the workflow level. No deploy tokens, no PR comments, no registry writes.
- **SHA-pinned actions**: `actions/checkout` and `actions/setup-node` are pinned to full commit SHAs with trailing comments identifying the human-readable release (e.g. `# v4.4.0`). This prevents supply-chain attacks via floating tag compromise.
- **Dependabot**: weekly checks for npm and GitHub Actions updates. Dependabot can still propose action updates despite SHA pinning.
- **Dependency audit**: `npm audit --omit=dev --audit-level=high` runs in CI on every push and PR.

---

## Environment variables

| Variable | Scope | Security |
|----------|-------|----------|
| `DATABASE_URL` | Server-only | Never exposed to browser, never committed |
| `ADMIN_SECRET` | Server-only | HMAC key for session tokens and analytics hashing; bootstrap fallback password; never sent to browser |
| `CRON_SECRET` | Server-only | Bearer token for cron endpoints; fails closed if unset |
| `INBOUND_EMAIL_SECRET` | Server-only | Bearer token for inbound email endpoint; fails closed if unset |
| `NEXT_PUBLIC_SITE_URL` | Public | Used for canonical URLs and metadata |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Public | Public contact alias (verified domain only; consumer domains rejected) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public | Cloudflare Turnstile site key (public by design) |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | Public | GA4 measurement ID (public identifier); widens CSP when configured |
| `SMTP_HOST/PORT/USER/PASS/FROM` | Server-only | Never exposed to browser |
| `R2_*` | Server-only | Cloudflare R2 credentials, never exposed to browser |

- `.env.local` is gitignored.
- No secrets are committed to the repository.
- `NEXT_PUBLIC_*` prefix is only used for genuinely public identifiers.

---

## What NOT to do

- **Do not** log PII (names, emails, phone numbers, messages) in any log entry.
- **Do not** store payment credentials (PINs, OTPs, card numbers). Donations are bank transfer or Mobile Money — only the transaction reference is recorded.
- **Do not** remove the CSRF protection from admin routes.
- **Do not** reduce the rate limits or lockout thresholds.
- **Do not** disable security headers in `next.config.ts`.
- **Do not** commit `.env.local` or any real credentials.
- **Do not** publish photos without verified consent (see `docs/safeguarding-and-consent.md`).
- **Do not** use `verifySessionToken` alone for security boundaries — use `verifyActiveAdminSession` or `guard()` to ensure disabled admins and retired bootstrap sessions are rejected.
- **Do not** use a hardcoded constant as an HMAC key for analytics hashing.

---

## Testing

```bash
# Run npm audit
npm audit

# Check for outdated packages
npm outdated

# Run unit tests (includes session, auth, sanitisation, consent gate, and rate-limit tests)
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
- [ ] Disabling an admin invalidates their existing session (Layer B verification)
- [ ] Bootstrap login fails closed when the admin-count query fails

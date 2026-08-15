# Email privacy, contact routing and anti-spam

How Vantage Foundation Uganda's public contact pathway works, what is already
configured, and the steps that still need an administrator with access to
Cloudflare, Gmail and Vercel.

---

## 1. The principle

`foundationvantage@gmail.com` is a **protected operational mailbox**. It is used
for administration, account recovery, Google services, finance, grants and
sensitive correspondence.

It is **not** a public address. Publishing it in page HTML and in Schema.org
structured data is what made it a target for automated web-design/SEO
cold-outreach: harvesters scrape `mailto:` links and JSON-LD `email` fields.

The mailbox itself is unchanged. Only its **publication** has stopped.

### Where the address now lives

| Layer | Contains the address? |
|---|---|
| `content/site.ts` (imported by client components) | **No** |
| Rendered HTML on any public page | **No** |
| Schema.org / JSON-LD | **No** |
| Client JS bundles (`.next/static`) | **No** |
| `lib/contact-inbox.ts` (`import "server-only"`) | Yes — server-side only |
| `CONTACT_INBOX` env var (preferred) | Yes, when set |

`lib/contact-inbox.ts` imports `server-only`, so a build fails if anything ever
tries to pull it into a client component. That is the structural guarantee, not
just a convention.

---

## 2. The visitor flow

```
Visitor
  └─▶ /contact  (or "Contact Vantage" in the footer)
        └─▶ Contact form — name, email, organisation, phone, category, message
              └─▶ Anti-spam layers, in order:
                    1. Rate limit        3 submissions/minute/IP
                    2. Honeypots         two hidden fields + 2s time-trap
                    3. Zod validation    types, lengths, fixed category enum
                    4. Turnstile         only if configured
                    └─▶ Persist to `contact_messages` (survives SMTP outage)
                          └─▶ Notification email, subject-tagged by category
                                └─▶ Protected Vantage inbox (or a category alias)
```

The visitor sees one confirmation regardless of which mailbox received the
message. Internal routing is never disclosed.

### Category routing

Each category has a subject prefix so the team can filter in Gmail even with a
single mailbox:

| Category | Subject prefix | Optional dedicated alias |
|---|---|---|
| General inquiry | `[VANTAGE CONTACT — GENERAL]` | `CONTACT_INBOX` |
| Partnerships | `[VANTAGE CONTACT — PARTNERSHIP]` | `CONTACT_INBOX_PARTNERSHIPS` |
| Grants & funding | `[VANTAGE CONTACT — GRANTS]` | `CONTACT_INBOX_GRANTS` |
| Programmes | `[VANTAGE CONTACT — PROGRAMMES]` | falls back |
| Volunteering | `[VANTAGE CONTACT — VOLUNTEERING]` | falls back |
| Media / press | `[VANTAGE CONTACT — MEDIA]` | `CONTACT_INBOX_MEDIA` |
| Research | `[VANTAGE CONTACT — RESEARCH]` | `CONTACT_INBOX_RESEARCH` |
| Donation support | `[VANTAGE CONTACT — DONATION]` | falls back |
| Safeguarding concern | `[VANTAGE CONTACT — SAFEGUARDING]` | `CONTACT_INBOX_SAFEGUARDING` |
| Other | `[VANTAGE CONTACT — OTHER]` | falls back |

Anything unset falls back to `CONTACT_INBOX`, so partial configuration is safe.

**The form cannot be used as an email relay.** The recipient is resolved from
server env plus a fixed category enum. No request field influences it.

---

## 3. What is already true (verified)

Checked against public DNS on 2026-08-15:

- Domain: **vantagefoundationuganda.com**
- **MX records exist** and point at Cloudflare Email Routing:
  `route1.mx.cloudflare.net`, `route2.mx.cloudflare.net`, `route3.mx.cloudflare.net`
- **SPF exists**: `v=spf1 include:_spf.mx.cloudflare.net ~all`
- **DMARC is absent** — `_dmarc.vantagefoundationuganda.com` does not resolve.

This means **Cloudflare Email Routing is already set up on the domain**. Creating
`contact@`, `partnerships@`, `grants@`, `media@` and `research@` is a dashboard
task, not a DNS migration.

> Which specific aliases already exist could not be verified from this
> environment — that requires signing in to the Cloudflare dashboard. Treat
> section 4 as the checklist to confirm and complete.

---

## 4. Administrator actions still required

These need human access. **None of them are done yet.**

### 4a. Create the public aliases (Cloudflare dashboard)

Cloudflare → your domain → **Email** → **Email Routing** → **Routing rules**.

Create each as a *custom address* forwarding to the protected mailbox:

| Alias | Forwards to |
|---|---|
| `contact@vantagefoundationuganda.com` | `foundationvantage@gmail.com` |
| `partnerships@vantagefoundationuganda.com` | `foundationvantage@gmail.com` |
| `grants@vantagefoundationuganda.com` | `foundationvantage@gmail.com` |
| `media@vantagefoundationuganda.com` | `foundationvantage@gmail.com` |
| `research@vantagefoundationuganda.com` | `foundationvantage@gmail.com` |

Cloudflare sends a verification email to the destination — **the forward does not
work until that link is clicked.**

**Verify before going further:** send a test message from an outside account to
each alias and confirm it arrives. Do not skip this — publishing an unverified
alias means publishing a dead address.

### 4b. Publish the alias on the site

Only after 4a is verified, in **Vercel → Project → Settings → Environment
Variables**:

```
NEXT_PUBLIC_CONTACT_EMAIL = contact@vantagefoundationuganda.com
```

Then **redeploy** — `NEXT_PUBLIC_*` values are inlined at build time, so an env
change alone does nothing until a rebuild.

The footer, policy pages and JSON-LD then display that alias automatically. Until
it is set, they show a "Contact Vantage" link to the form. The code **rejects any
consumer-provider address** (`gmail.com`, `outlook.com`, …) for this variable, so
a mistake here cannot re-publish the protected mailbox.

### 4c. Route form notifications through the aliases (optional but recommended)

```
CONTACT_INBOX               = contact@vantagefoundationuganda.com
CONTACT_INBOX_PARTNERSHIPS  = partnerships@vantagefoundationuganda.com
CONTACT_INBOX_GRANTS        = grants@vantagefoundationuganda.com
CONTACT_INBOX_MEDIA         = media@vantagefoundationuganda.com
CONTACT_INBOX_RESEARCH      = research@vantagefoundationuganda.com
```

These are server-only and take effect without a rebuild.

### 4d. Add a DMARC record (DNS)

Currently missing. Without it, anyone can spoof mail *from* the domain, and
deliverability of legitimate mail suffers.

Cloudflare → DNS → add a **TXT** record:

- **Name:** `_dmarc`
- **Content:** `v=DMARC1; p=none; rua=mailto:contact@vantagefoundationuganda.com; adkim=r; aspf=r`

Start at `p=none` (monitor only). After a few weeks of clean reports, tighten to
`p=quarantine`, then `p=reject`.

> DKIM: Cloudflare Email Routing signs forwarded mail itself. If you later send
> *outbound* mail from the domain (e.g. via Resend or Google Workspace), add that
> provider's DKIM records and include it in SPF at that point.

### 4e. Configure SMTP so the form can send

The form currently has **no SMTP configured** (`SMTP_HOST` is blank). Messages
are still captured in the database and readable at `/admin/messages`, but no
notification is emailed. Set in Vercel:

```
SMTP_HOST = smtp.resend.com          (or your provider)
SMTP_PORT = 587
SMTP_USER = resend
SMTP_PASS = <api key — never commit>
SMTP_FROM = notifications@vantagefoundationuganda.com
```

`SMTP_FROM` must be an address the provider has authorised, or SPF/DMARC will
reject it. It deliberately does **not** fall back to the protected mailbox.

### 4f. Create the database table

Run once (idempotent):

```bash
node --env-file=.env.local scripts/setup-db.mjs
```

This creates `contact_messages`. **Already run against the current database.**

### 4g. Turnstile (optional)

Cloudflare → Turnstile → create a widget for the domain, then set:

```
NEXT_PUBLIC_TURNSTILE_SITE_KEY = <site key>     (public, safe in the browser)
TURNSTILE_SECRET_KEY           = <secret key>   (NEVER prefix with NEXT_PUBLIC_)
```

Requires a **rebuild** — both the widget and the CSP allowance are build-time
gated. With the keys unset, the CSP stays exactly as strict as before and the
widget renders nothing.

The widget is set to `interaction-only`, so most visitors never see a challenge.
Verification **fails open** on a Cloudflare outage: a provider incident must
never block a grantmaker from reaching Vantage.

---

## 5. Gmail-side checklist for the Vantage team

Repository changes cannot configure Gmail. Do this in the mailbox itself.

### Filters for cold outreach

Gmail → Settings → **Filters and Blocked Addresses** → *Create a new filter*.

Put these in **Has the words**, joined with `OR`:

```
"I took a look at your website" OR "took a look at your site" OR
"noticed some issues" OR "design-related issues" OR "website issues" OR
"a few SEO issues" OR "SEO audit" OR "can I send you screenshots" OR
"send you a few screenshots" OR "increase your traffic" OR
"rank higher on Google" OR "redesign your website"
```

**Recommended action: apply the label `Cold outreach` and *Skip the Inbox*.**

> **Do not choose "Delete it".** Wording like "we took a look at your website"
> also appears in genuine partner, donor and grantmaker mail. A label keeps the
> message recoverable; deletion does not. Review the label weekly at first.

Add an exception filter *above* it so known-good senders are never caught:
`from:(*.org OR *.ac.ug OR *.go.ug OR *.edu)` → **Never send it to Spam**.

### Handling rules

- Use **Report spam** on obvious unsolicited pitches. It trains Gmail's filter
  and helps every other recipient.
- **Do not reply** — even "no thanks" confirms the address is live and monitored.
- **Do not click "unsubscribe"** in suspicious cold email. In genuine marketing
  mail it works; in cold outreach it is often a tracking or confirmation pixel.
- Keep the protected address off web forms, directory listings, conference
  sign-ups and public documents. Use `contact@` once it exists.

---

## 6. Anti-spam layers in the code

| Layer | Where | Behaviour |
|---|---|---|
| Rate limit | `lib/rate-limit.ts`, `app/actions.ts` | 3/min/IP, sliding window. Tunable via `FORM_RATE_LIMIT`. |
| Honeypot ×2 | `components/shared/HoneypotFields.tsx` | `website` + `company_url`; hidden, `aria-hidden`, `tabindex="-1"`. |
| Time-trap | same | Submissions under 2s are treated as bots. |
| Validation | `app/actions.ts` | Zod: lengths, email format, fixed category enum. |
| Turnstile | `lib/turnstile.ts` | Env-gated; fails open on provider outage. |
| Header-injection guard | `sanitiseValue()` | Strips CR/LF and control characters. |
| HTML escaping | `escapeHtml()` | Applied to every value in the HTML email. |
| Fixed recipients | `lib/contact-inbox.ts` | Env + enum only; single address, commas rejected. |

A honeypot hit returns the **same confirmation a human gets** — the bot learns
nothing — and nothing is forwarded or stored.

---

## 7. If email delivery fails

Every submission is written to `contact_messages` *before* the email is
attempted, so an SMTP outage cannot lose an inquiry.

Read them at **`/admin/messages`** (sign in at `/admin/login`). Anything badged
**"Email failed"** never reached the inbox and needs a manual reply — and
signals that SMTP needs attention.

---

## 8. Residual risks

- **The address is still in git history** and in two internal files
  (`docs/safeguarding-and-consent.md`, `docs/technical-audit.md`). These are not
  served by the website. Rewriting history is not worth it; the address is not
  secret, it is simply no longer *advertised*.
- **Already-harvested addresses keep receiving spam.** This change stops new
  harvesting; it cannot undo old scrapes. Gmail filters (section 5) handle the
  existing flow.
- **The phone number is still published** (`+256 786 585 216`) and can attract
  SMS/WhatsApp spam. Left in place deliberately — it is a genuine contact route
  for Ugandan beneficiaries, many of whom will not use a web form.
- **Rate limiting is per-instance and in-memory.** On serverless, several warm
  instances each hold their own window, so the effective limit is higher than
  3/min. Move to Upstash Redis or Vercel KV if abuse becomes a problem.
- **Without Turnstile configured**, a determined bot that respects the 2s
  time-trap and leaves honeypots empty can still submit. The honeypots stop
  commodity spam; Turnstile is the answer to targeted abuse.
- **Third-party addresses remain in editorial content** — the "Beyond the Ward"
  story publishes contact details for MUII-plus, Mildmay, Reach Out Mbuya and
  KEMRI-Wellcome. These are those organisations' own published addresses and are
  the point of the article. Not Vantage's to remove.

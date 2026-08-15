# Vantage Foundation Uganda brand optimisation audit

**Audit and implementation date:** 29 July 2026

**Scope:** Public website, brand application, messaging, programme structure,
impact presentation, partner credibility, SEO, accessibility, responsiveness,
performance, and public-profile consistency

**Implementation branch:** `agent/brand-optimisation-20260729`

**Canonical website:** `https://www.vantagefoundationuganda.com`

## Executive outcome

The site now presents Vantage Foundation Uganda as a credible, locally led
organisation with a clear four-programme model:

1. Vantage Care
2. KikumiKyo Academy
3. Humanitarian Assistance
4. Water, Sanitation and Hygiene (WASH)

The implementation fixes the most visible trust and brand failures, strengthens
the homepage narrative, makes impact claims traceable, distinguishes actual
partner relationships, and standardises metadata across the public site. It also
adds automated route-wide checks for accessibility, SEO, mobile layout, image
loading, and minimum target sizes.

No statistics, reports, partnerships, certifications, or payment channels were
invented. Where the organisation has not supplied an approved document, logo,
or independently audited measurement, the interface says so plainly.

The work is implemented and verified locally. It has not been pushed, merged, or
deployed as part of this pass.

## Audit method

The review combined:

- live-site inspection at the canonical and apex domains;
- a route-by-route review of the Next.js application and content sources;
- visual inspection at 320, 360, 390, 430, 768, and desktop widths;
- keyboard and automated WCAG checks;
- rendered-page checks for metadata, canonical URLs, structured data, images,
  menus, and layout overflow;
- production builds and Lighthouse runs;
- inspection of the organisation's approved logo and authentic photo library;
- a public LinkedIn profile review; and
- verification of redirects, sitemap output, robots directives, and social links.

## Priority findings and resolution

| Priority | Finding before this pass | Brand or trust risk | Resolution |
| --- | --- | --- | --- |
| P0 | The approved header and footer logos rendered at `0 x 0` because their responsive image classes had no usable CSS dimensions. | The live site appeared to have no logo at its main identity touchpoints. | Added explicit intrinsic display dimensions, responsive constraints, and rendered-size browser assertions. |
| P0 | Canonical, Open Graph, JSON-LD, and sitemap URLs could become `https://http/vantagefoundationuganda.com`. | Invalid search and social metadata undermined discovery and link previews. | Added a code-owned canonical origin and route-aware metadata helper; exact canonical URLs are now tested. |
| P0 | Impact numbers lacked a visible period, method, location, and source path. | Claims looked promotional rather than accountable. | Every featured statistic now identifies its programme, geography, period, counting method, and evidence link. |
| P1 | The reports page contained bracketed or prospective publication placeholders. | Visitors could mistake drafts for published accountability documents. | Removed unapproved report records and added an honest publication-status explanation. |
| P1 | The partner section did not explain the nature of each relationship. | A service provider could be mistaken for a programme sponsor. | Added relationship types and explicit descriptions; Housing Finance Bank is identified as a banking service provider, not a programme sponsor. |
| P1 | The homepage did not quickly explain who the organisation is, where it works, or how its programmes connect. | Weak comprehension and participation pathways. | Reworked the narrative from identity and programmes through evidence, stories, participation, and donation. |
| P1 | Public metadata was generic or inconsistent between routes. | Poor search snippets and duplicate social previews. | Added unique titles, descriptions, canonical URLs, Open Graph data, and Twitter metadata across public routes. |
| P1 | The visual system was cold and generic: bright white surfaces, Inter, and inconsistent public warning colours. | The interface felt more like a template than a community organisation. | Introduced warmer mint surfaces, Source Sans 3 with Frutiger fallbacks, disciplined teal/navy/white application, and a human-centred social card. |
| P2 | Several link labels were generic, such as “Learn more.” | Weak accessibility and poor programme-level search context. | Programme links now have descriptive visible or accessible names. |
| P2 | Missing-media states advertised “coming soon.” | Repeated placeholders made the organisation appear unfinished. | Replaced them with quiet neutral media surfaces and removed the unused video placeholder. |
| P2 | The apex HTTPS domain adds a redirect before reaching `www`. | Small crawl and navigation inefficiency. | Documented as a Vercel domain-setting action; it cannot be corrected safely in application code. |

## Brand and visual system

### Logo

The approved Vantage Foundation Uganda artwork is now visible and consistently
used in:

- the desktop header;
- the mobile header and navigation dialog;
- the footer;
- favicons and application icons already present in the project; and
- the static social-sharing image.

The browser suite asserts that the desktop logo occupies a real rendered box,
preventing a regression to the earlier invisible state.

### Colour and typography

The public experience now uses:

- deep teal for primary actions and brand recognition;
- dark navy and charcoal for high-contrast text;
- white and restrained mint surfaces for warmth and hierarchy; and
- aqua only as an accent where contrast remains safe.

Orange and amber were removed from ordinary public-facing notices so they do
not compete with the approved brand palette. Source Sans 3 is the primary web
font, with Frutiger and system sans-serif fallbacks.

### Photography

Authentic programme photography remains the visual anchor. The homepage hero
uses a real WASH image with meaningful alternative text, responsive image
delivery, and explicit preload behaviour. Below-the-fold images remain lazy
loaded. No synthetic programme imagery was introduced.

### Social preview

The old runtime-generated preview was replaced by a compressed `1200 x 630`
static card using:

- approved horizontal logo artwork;
- an authentic field photograph;
- high-contrast teal/navy treatment;
- the approved tagline; and
- a concise four-programme descriptor.

The final JPEG is approximately 93 KB.

## Messaging and information architecture

The homepage now follows a coherent trust journey:

1. a clear promise and two actions: **Support Our Work** and
   **Explore Our Impact**;
2. immediate trust and location context;
3. a concise statement of local leadership and the problems addressed;
4. the four approved programmes;
5. current projects;
6. traceable impact evidence;
7. geographic reach;
8. stories and field updates;
9. partner relationship context;
10. ways to participate; and
11. a final donation and newsletter pathway.

Youth leadership is treated as a cross-cutting approach, not an unsupported
fifth programme. No obsolete “Astra” programme references were added.

## Impact integrity

The three featured figures retain their supplied values while adding the
context required for responsible use:

| Figure | Programme and geography | Period | Method shown to visitors |
| --- | --- | --- | --- |
| `10,000+` | Kasaale WASH work | Borehole completed 16 May 2025; continuation phase underway | Community catchment estimate |
| `About 500` | SaveGirl Uganda | Cumulative reach since 2021 | Participant count maintained by the programme team |
| `4 orphanages` | Humanitarian Assistance | Programme activity since 2022 | Institutions receiving at least one recorded relief delivery |

Each card links to a relevant project or evidence page. The impact interface
states that these programme-reported figures have not been independently
audited. This is more credible than implying assurance that has not occurred.

## Partners, reports, and donation trust

Partner records now describe the actual relationship:

- The Cup Foundation is presented as an in-kind programme contributor.
- Housing Finance Bank is presented as a banking service provider and is
  explicitly not described as a programme sponsor.

Where an approved logo is unavailable, the site uses a neutral nameplate rather
than a fake or broken logo.

The reports page lists only approved, uploaded publications. Because none are
currently supplied in the content source, it explains the publication process
without displaying fabricated years, filenames, or “coming soon” documents.

The donation page no longer advertises an unconfigured Mobile Money channel or
calls the intent form a secure online payment flow. It directs visitors to
official bank-transfer details and verification instead.

## SEO and sharing

The canonical origin is code-owned and no longer depends on a malformed
environment value. Public routes now receive:

- a unique title and description;
- an exact canonical URL;
- Open Graph title, description, URL, and image;
- Twitter card metadata; and
- article metadata for Stories & Insights detail pages.

The sitemap and structured data use the same canonical origin. Automated tests
also reject malformed `/http/` URLs, Vercel preview origins, duplicate public
metadata, and missing dynamic-route canonicals.

### Redirect observations

Observed on 29 July 2026:

| Request | Result |
| --- | --- |
| `http://www.vantagefoundationuganda.com` | One redirect to canonical HTTPS `www` |
| `http://vantagefoundationuganda.com` | Redirects to apex HTTPS, then to HTTPS `www` |
| `https://vantagefoundationuganda.com` | Redirects to HTTPS `www` |
| `/about-us/` | Redirects once to `/about-us` |

The additional apex-domain hop should be removed in the Vercel domain dashboard
by making every non-canonical domain redirect directly to
`https://www.vantagefoundationuganda.com`. The application already produces
canonical internal links.

## Route-by-route implementation checklist

| Surface | Review and implementation status |
| --- | --- |
| `/` | Brand shell, narrative hierarchy, programme links, impact evidence, partner context, calls to action, photography, and metadata updated. |
| `/about-us` | Route-specific metadata and canonical URL verified. Existing mission and organisational content retained. |
| `/about-us/team` and team profiles | Route and profile metadata made unique; dynamic canonicals verified. |
| `/our-work` | Corrected to four programmes; phone-width overflow fixed; accessible programme links added. |
| `/programmes/[slug]` | Four programme pages retained; per-programme canonical, sharing, and descriptions verified. |
| `/projects` and `/projects/[slug]` | Listing and detail metadata standardised; project evidence paths support impact traceability. |
| `/impact` | Claims contextualised with period, method, location, programme, evidence link, and assurance disclaimer. |
| `/stories`, story profiles, and RSS | Listing/detail metadata standardised; detail pages use article sharing metadata. |
| `/stories` and Stories & Insights articles | Listing/detail metadata standardised; detail pages use article sharing metadata. |
| `/gallery` | Metadata standardised; responsive image behaviour retained and tested. |
| `/get-involved` | Metadata standardised and participation pathway retained. |
| `/donors-and-sponsors` | Relationship types and honest no-logo treatment added. |
| `/donate` | Payment language corrected; unconfigured Mobile Money removed; visual notice aligned to brand. |
| `/contact` | Metadata standardised; organisational contact information retained. |
| `/reports-and-accountability` | Fabricated placeholders removed; approved-publication-only policy shown. |
| `/faq` | Metadata standardised. |
| `/privacy`, `/terms`, `/safeguarding`, `/accessibility` | Unique metadata added; accessibility claims brought into line with actual automated coverage. |
| Global header/footer | Visible approved logo, responsive navigation, keyboard behaviour, and descriptive links verified. |
| Sitemap, robots, JSON-LD, and social image | Canonical origin corrected and automated assertions added. |

## Accessibility and responsive quality

Automated browser coverage now visits 27 public routes and checks:

- WCAG 2.0 A/AA, WCAG 2.1 A/AA, and WCAG 2.2 AA axe rules;
- one main landmark and one level-one heading per route;
- skip-link keyboard operation;
- mobile-menu opening, focus management, Escape dismissal, and focus return;
- horizontal overflow at 320, 360, 390, 430, and 768 pixels;
- successful public image loading; and
- 44-pixel minimum sizing for key interactive targets.

The final browser suite passed all 83 checks. Automated checks do not replace a
manual screen-reader review; NVDA/Firefox and VoiceOver/Safari should still be
included in the pre-release human QA pass.

## Performance

Lighthouse was run with controlled Playwright Chromium sessions. The baseline
used the live deployment; the new implementation used a local production build.
The environments differ, so timing changes are directional rather than a
scientific deployment-to-deployment comparison.

| Metric | Before: live | After: local production |
| --- | ---: | ---: |
| Performance | 97 | 94 |
| Accessibility | 100 | 100 |
| Best Practices | 100 | 100 |
| SEO | 92 | 100 |
| First Contentful Paint | 1.0 s | 0.9 s |
| Largest Contentful Paint | 2.5 s | 3.1 s |
| Total Blocking Time | 90 ms | 50 ms |
| Cumulative Layout Shift | 0 | 0 |
| Speed Index | 2.5 s | 0.9 s |

The implementation preserves a strong performance score while adding a richer
homepage and fixes the measured SEO deficit. A post-deployment Lighthouse run
should be recorded before sign-off because CDN and origin behaviour can affect
LCP.

Raw reports are stored in `docs/brand-performance/`.

## Verification results

| Check | Result |
| --- | --- |
| Content validation | Passed |
| Content-placeholder scan | Passed |
| TypeScript | Passed |
| ESLint | Passed |
| Unit tests | 155 passed across 15 files |
| Production build | Passed; 61 routes generated |
| Public browser suite | 83 passed |
| Lighthouse accessibility | 100 |
| Lighthouse SEO | 100 |

The link checker exits successfully but reports a small set of parser false
positives from template strings, dynamic/admin-only paths, and unit fixtures.
Rendered-route browser tests provide the stronger verification for public
navigation.

## Before-and-after evidence

Screenshots are stored in `docs/brand-screenshots/`.

| View | Before | After |
| --- | --- | --- |
| Homepage desktop | `before-home-desktop.png` | `after-home-desktop.png` |
| Homepage mobile 390 | `before-home-mobile-390.png` | `after-home-mobile-390.png` |
| Programme mobile 390 | `before-programme-mobile-390.png` | `after-programme-mobile-390.png` |
| Donate desktop | `before-donate-desktop.png` | `after-donate-desktop.png` |
| Mobile range | — | `after-home-mobile-320.png`, `360.png`, `390.png`, `430.png` |
| Tablet | — | `after-home-tablet-768.png` |
| Our Work at 320 | — | `after-our-work-mobile-320.png` |
| Impact desktop | — | `after-impact-desktop.png` |
| Reports desktop | — | `after-reports-desktop.png` |
| Social card | — | `after-social-card.jpg` |

## External profile alignment checklist

### LinkedIn: observed mismatch

The public LinkedIn organisation page showed:

- name: **Vantage Foundation** rather than **Vantage Foundation Uganda**;
- description: “A youth-led non-profit organization seeking to elevate youth
  in Uganda and Africa”;
- website: the old `https://vantagefoundation.net/` domain; and
- headquarters: Ishaka/Bushenyi only.

Recommended owner actions:

- rename the page to **Vantage Foundation Uganda**;
- use the approved horizontal logo and current brand cover artwork;
- replace the website with `https://www.vantagefoundationuganda.com`;
- align the About text with the four-programme description on the site;
- use the organisation's approved location wording consistently; and
- verify the public company-size and organisation-type fields.

### Instagram and YouTube

The site links to:

- `https://www.instagram.com/vantagefoundationuganda/`
- `https://www.youtube.com/@vantagefoundation`

Public inspection was throttled during this audit, so profile owners should
manually confirm:

- display name, handle, logo, and bio;
- canonical website link;
- the same four-programme wording;
- location and contact details;
- active donation or campaign links;
- YouTube channel art, About text, and featured video; and
- removal of old domains or unsupported claims.

### Search and social re-scraping after deployment

- Submit the canonical sitemap in Google Search Console.
- Inspect the homepage and priority programme URLs for indexing.
- Request re-indexing after the canonical fixes deploy.
- Re-scrape the homepage in Facebook Sharing Debugger and LinkedIn Post
  Inspector so the new social card replaces cached previews.
- Confirm the production sitemap contains only HTTPS `www` URLs.

## Remaining organisational and operational actions

These items require content ownership, platform access, or documentary approval:

1. Validate every impact figure, period, methodology, and linked project record
   with programme leads.
2. Upload approved annual reports, audited financial statements, policies, or
   outcome reports before adding them to the reports content source.
3. Obtain and record permission before publishing partner logos; keep the
   relationship description accurate.
4. Confirm the organisation's preferred public wording for Jinja and
   Ishaka/Bushenyi locations across the website and profiles.
5. Complete the manual screen-reader and real-device QA pass.
6. Correct the apex-domain redirect in Vercel.
7. Re-run Lighthouse against the deployed production version and compare it
   with the stored baseline.
8. Update LinkedIn, Instagram, YouTube, and any donation directories that still
   use the former domain or older organisation description.

## Principal implementation surfaces

- `app/layout.tsx` and `app/globals.css`
- `lib/site-url.ts` and `lib/metadata.ts`
- all public route metadata modules under `app/`
- `components/shared/Logo.tsx`, plus `components/layout/Header.tsx` and
  `components/layout/Footer.tsx`
- homepage sections under `components/sections/`
- `components/shared/StatCard.tsx` and image helpers
- `content/impact.ts`, `content/partners.ts`, `content/reports.ts`, and
  `content/site.ts`
- `public/brand/social/vantage-foundation-uganda-og.jpg`
- public E2E coverage under `tests/e2e/`
- unit coverage under `tests/unit/`

## Final consistency statement

The public website now uses the approved name, logo system, teal-led palette,
four-programme structure, authentic photography, and canonical domain
consistently. The most important remaining inconsistencies are external to the
codebase: the LinkedIn identity and old domain, profile checks that require
account-owner access, the extra apex redirect, and publication or verification
material that the organisation has not yet supplied.

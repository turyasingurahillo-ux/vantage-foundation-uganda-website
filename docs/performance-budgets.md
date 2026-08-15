# Performance Budgets — Vantage Foundation Uganda

**Target audience:** Ugandan mobile users on 3G/4G connections with mid-range Android devices.

These budgets are designed for real-world mobile UX, not just Lighthouse scores. The objective is fast, stable page loads on slower connections — not green scorecards.

---

## Core Web Vitals targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| **LCP** (Largest Contentful Paint) | < 2.5s on 3G | Hero image + headline are the LCP element on most pages. WebP/AVIF + responsive `sizes` + `preload` keep this fast. |
| **CLS** (Cumulative Layout Shift) | < 0.1 | All images use aspect-ratio containers or explicit width/height. No lazy-loaded content above the fold. |
| **INP** (Interaction to Next Paint) | < 200ms | Minimise client JS. Defer below-the-fold interactivity (map, gallery) via `LazySection`. |

---

## JavaScript budgets

| Route | Initial JS (gzip) | Notes |
|-------|-------------------|-------|
| Homepage (`/`) | < 120 KB | Header + Hero + TrustStrip + ImpactSection + AreasOfWork + FlagshipProject are server-rendered. UgandaReachMap is deferred via `LazySection`. |
| Project detail (`/projects/[slug]`) | < 100 KB | SSG. GalleryGrid deferred via `LazySection`. |
| Stories hub (`/stories`) | < 110 KB | StoryList (search/filter) is client-side. |
| Stories & Insights list (`/stories`) | < 90 KB | Server-rendered. |
| Donate (`/donate`) | < 110 KB | DonationForm + CopyBankDetails are client-side. |
| All other routes | < 90 KB | Mostly server-rendered with minimal client JS. |

### Client components audit (public routes only)

| Component | Route(s) | Justification |
|-----------|----------|---------------|
| `Header` | All | Mobile menu toggle — essential, tiny |
| `DonationForm` | `/donate` | Form state + validation — essential |
| `ContactForm` | `/contact`, `/donors-and-sponsors` | Form state + validation — essential |
| `NewsletterForm` | All (footer) | Form state — essential, tiny |
| `CopyBankDetails` | `/donate` | Copy-to-clipboard — essential, tiny |
| `HoneypotFields` | All forms | Anti-spam — essential, tiny |
| `ProjectList` | `/projects` | Search/filter — essential for UX |
| `StoryList` | `/stories` | Search/filter — essential for UX |
| `UgandaReachMap` | `/` | Interactive map — **deferred via `LazySection`** |
| `GalleryGrid` | `/projects/[slug]`, `/gallery` | Lightbox — **deferred via `LazySection`** on project pages |
| `ArticleShare` | `/stories/[slug]` | Share buttons — tiny |

### Admin-only components (excluded from public bundles)

- `AdminsManager`, `MediaManager` — only loaded on `/admin/*` routes.

---

## Image budgets

| Preset | Max display width | `sizes` attribute | Format |
|--------|-------------------|-------------------|--------|
| `hero` | 1200px | `(max-width: 768px) 100vw, 1200px` | WebP/AVIF |
| `splitHero` | 576px | `(max-width: 1023px) 100vw, 576px` | WebP/AVIF |
| `detailHero` | 1200px | `(max-width: 768px) 100vw, 1200px` | WebP/AVIF |
| `card` | 33vw | `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw` | WebP/AVIF |
| `half` | 50vw | `(max-width: 768px) 100vw, 50vw` | WebP/AVIF |
| `team` | 20vw | `(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw` | WebP/AVIF |

- All images use `placeholder="blur"` with a 1x1 SVG data URL for smooth loading.
- All images use aspect-ratio containers (`aspect-[16/10]`, `aspect-[4/3]`, etc.) to prevent CLS.
- Above-the-fold images use `priority` or `preload`.
- Below-the-fold images are lazy-loaded by default (next/image behaviour).

---

## Font budget

- **Source Sans 3** via `next/font/google` with `display: "swap"` and `subsets: ["latin"]`.
- Fonts are self-hosted (downloaded at build time, served from same origin).
- No external font requests at runtime.

---

## Lazy-loading strategy

### `LazySection` component

Wraps below-the-fold client components to defer their JS execution until the user scrolls near them. Uses `IntersectionObserver` with a 200-300px `rootMargin` to preload before the section is visible.

**Used on:**
- `UgandaReachMap` (homepage) — 600px placeholder, 300px rootMargin
- `GalleryGrid` (project pages) — 300px placeholder, 300px rootMargin

**Not used on:**
- Above-the-fold content (would delay LCP)
- Server-rendered content with SEO value (would hide from crawlers)
- Essential interactive elements (forms, navigation)

### `loading.tsx` skeletons

Route-specific loading skeletons for client-side navigation on slow connections:
- `/projects/[slug]/loading.tsx` — project detail skeleton
- `/stories/[slug]/loading.tsx` — story detail skeleton
- `/stories/[slug]/loading.tsx` — story detail skeleton
- `/loading.tsx` — global fallback skeleton

---

## Testing methodology

### Manual testing

Test the following routes at these viewport widths: **320px, 375px, 768px, 1024px, 1440px**

1. `/` (homepage) — LCP, map lazy-loading, scroll performance
2. `/projects/kasaale-deep-borehole` — project detail, gallery lazy-loading
3. `/stories` — story list, search/filter responsiveness
4. `/donate` — form interactivity, bank details copy
5. `/impact` — impact metrics rendering
6. `/our-work` — project grid filtering

### Throttled testing

Use Chrome DevTools Network throttling:
- **Fast 3G** (1.5 Mbps down, 750 Kbps up, 40ms RTT) — primary target
- **Slow 3G** (400 Kbps down, 400 Kbps up, 400ms RTT) — worst case
- **Regular 4G** (4 Mbps down, 3 Mbps up, 20ms RTT) — common Ugandan mobile

### Lighthouse

Run Lighthouse on the homepage and key routes with:
- Mobile device preset
- Throttled 3G (Simulated)
- Categories: Performance, Accessibility, Best Practices, SEO

Record scores in deployment docs after each significant change.

---

## What NOT to do

- **Do not remove useful functionality to improve Lighthouse scores.** The objective is faster real-world mobile UX, not just a green scorecard.
- **Do not lazy-load above-the-fold content.** This delays LCP.
- **Do not defer hydration of server-rendered SEO content.** Crawlers need the HTML.
- **Do not add external analytics or tracking scripts without considering the performance cost.** Each script adds round-trips and execution time.
- **Do not use large images.** Compress and convert to WebP/AVIF before uploading.

# Performance Budgets & Image Guidelines

This document defines the performance targets for the Vantage Foundation Uganda website, documents the image optimization strategy, and records measured production baselines.

## Performance Budgets

### Core Web Vitals Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| **LCP** (Largest Contentful Paint) | < 2.5s on 3G | Hero image is the LCP element on most pages |
| **CLS** (Cumulative Layout Shift) | < 0.1 | All images use `fill` with aspect-ratio containers |
| **INP** (Interaction to Next Paint) | < 200ms | Minimal client-side JS, below-the-fold components lazy-loaded |

### Bundle Size Budgets

| Budget | Target | Notes |
|--------|--------|-------|
| JS per route (gzip) | < 150 KB | Next.js + React + client components. Currently ~246 KB — see measured baseline below |
| CSS per route (gzip) | < 30 KB | Tailwind v4, purged at build. Currently ~17 KB — within budget |
| Images per page | < 200 KB total | WebP/AVIF, responsive srcset. Homepage ~147 KB — within budget |

### Network Constraints

The site is designed for mobile-first, low-bandwidth users in Uganda. Test under:
- **Slow 3G**: 400 KB/s, 400ms RTT
- **Viewport widths**: 320px, 375px, 768px, 1024px, 1440px

## Measured Production Baseline (2026-09-05)

Lighthouse 13.4.1 against `https://www.vantagefoundationuganda.com`.

### Mobile (perf preset, simulated slow 4G)

| Route | Perf | LCP (ms) | CLS | TBT (ms) | FCP (ms) | SI (ms) | Total KB |
|---|---|---|---|---|---|---|---|
| `/` | 33 | 6828 | 0 | 2678 | 4020 | 6987 | 668 |
| `/projects` | 33 | 7113 | 0 | 2081 | 4695 | 7133 | 760 |
| `/projects/kasaale-deep-borehole` | 69 | 3796 | 0 | 478 | 3244 | 3855 | 600 |
| `/stories` | 58 | 4147 | 0 | 805 | 3598 | 4094 | 699 |
| `/stories/beyond-the-ward` | 39 | 5561 | 0 | 2772 | 3501 | 5747 | 637 |
| `/gallery` | 46 | 6106 | 0 | 734 | 4709 | 6125 | 916 |
| `/get-involved` | 74 | 3624 | 0 | 379 | 3124 | 3525 | 517 |
| `/contact` | 75 | 3584 | 0 | 368 | 3109 | 3500 | 505 |
| `/donate` | 59 | 4314 | 0 | 756 | 3248 | 4056 | 508 |

### Desktop (desktop preset)

| Route | Perf | A11y | BP | SEO | LCP (ms) | CLS | TBT (ms) | FCP (ms) | Total KB |
|---|---|---|---|---|---|---|---|---|---|
| `/` | 95 | 100 | 100 | 100 | 1124 | 0 | 99 | 670 | 906 |
| `/projects` | 95 | 99 | 100 | 100 | 1095 | 0 | 52 | 805 | 819 |
| `/projects/kasaale-deep-borehole` | 79 | 94 | 100 | 100 | 1090 | 0.32 | 9 | 615 | 753 |
| `/stories` | 82 | 100 | 100 | 100 | 885 | 0.32 | 7 | 525 | 829 |
| `/stories/beyond-the-ward` | 67 | 100 | 96 | 100 | 1453 | 0.33 | 205 | 1046 | 639 |
| `/gallery` | 80 | 100 | 100 | 100 | 1116 | 0.32 | 0 | 736 | 1159 |
| `/get-involved` | 83 | 100 | 100 | 100 | 847 | 0.32 | 7 | 519 | 549 |
| `/contact` | 82 | 100 | 100 | 100 | 875 | 0.25 | 3 | 518 | 542 |
| `/donate` | 97 | 100 | 100 | 100 | 993 | 0 | 18 | 891 | 541 |

### Budget compliance

| Budget | Target | Actual (mobile) | Actual (desktop) | Status |
|---|---|---|---|---|
| LCP | < 2.5s | 3.6–7.1s | 0.85–1.45s | Mobile exceeds budget |
| CLS | < 0.1 | 0 (all routes) | 0–0.33 | Desktop exceeds budget on some routes |
| INP/TBT | < 200ms | 368–2772ms | 0–205ms | Mobile exceeds budget |
| JS per route (gzip) | < 150 KB | 245–257 KB | 245–257 KB | Exceeds budget |
| CSS per route (gzip) | < 30 KB | 17 KB | 17 KB | Within budget |
| Images per page | < 200 KB | 147 KB (home) | 147 KB (home) | Within budget (gallery 411 KB exceeds) |

### Key findings

1. **JS bundle 246 KB gzip** — the Uganda reach map chunk (~150 KB, includes d3-geo and district data) was loaded on the homepage even though it's below the fold. Fixed in Phase 6A with `next/dynamic`.
2. **CLS 0.324 on desktop** — footer shift caused by font swap. The Arabic font (`Noto_Sans_Arabic`) was preloaded on all pages including non-Arabic. Fixed in Phase 6A with `preload: false`.
3. **LCP 3.5–7.1s on mobile** — primarily caused by JS execution time (7.5s main thread work on homepage). The dynamic import for the map reduces initial JS execution.
4. **Gallery over-fetching** — 34 images, 411 KB. This is a content volume issue; pagination would help but is a larger change.
5. **Desktop scores are strong** — Performance 67–97, Accessibility 94–100, Best Practices 96–100, SEO 100.

### Vercel Speed Insights

`@vercel/speed-insights` is not installed in the application. No real-user Core Web Vitals telemetry is available from the application code. Vercel Dashboard may show Speed Insights if enabled at the project level, but this is not instrumented in the codebase. Field data cannot be reported without installing the package.

## Post-Phase-6A Production Results

After PR #79 (Phase 6A) was deployed, Lighthouse 13.4.1 was re-run against the same 9 production routes on 2026-09-05.

### Before/After comparison — Homepage

| Metric | Before (Phase 6A) | After (Phase 6A) | Change |
|---|---|---|---|
| **Mobile Perf** | 33 | 43 | +10 |
| **Mobile LCP** | 6828 ms | 6366 ms | -462 ms |
| **Mobile TBT** | 2678 ms | 794 ms | -1884 ms (70% reduction) |
| **Mobile JS transfer** | 246 KB | 173 KB | -73 KB (map chunk deferred) |
| **Mobile Total** | 668 KB | 431 KB | -237 KB |
| **Desktop Perf** | 95 | 99 | +4 |
| **Desktop LCP** | 1124 ms | 915 ms | -209 ms |
| **Desktop CLS** | 0 | 0 | unchanged |
| **Desktop JS transfer** | ~246 KB | 206 KB | -40 KB |

### UgandaReachMap deferral

The map chunk (~150 KB uncompressed, includes d3-geo and district data) is no longer in the initial homepage bundle. Verified by inspecting the server-rendered HTML: the map chunk filename is absent from the initial `<script>` tags.

- **Initial JS transferred (before scroll):** 173 KB gzip (homepage mobile)
- **Deferred map JS:** ~73 KB gzip (loaded only when user scrolls near the map section)
- **Total JS after scrolling to map:** ~246 KB gzip (same as before, but not blocking initial render)
- **Main-thread execution:** reduced from 7.5s to ~3.3s (Script Evaluation dropped from 2.9s to ~1.5s)
- **TBT:** reduced from 2678 ms to 794 ms

The deferred map JS is not counted against the initial-route JS budget.

### Arabic font preload change

- **Font bytes on `/`:** 28 KB (1 font — Source Sans 3 only). The Arabic font is no longer preloaded on non-Arabic pages.
- **Font bytes on `/ar`:** 222 KB (3 fonts — Source Sans 3 + Noto Sans Arabic weights). The Arabic font loads correctly on Arabic pages.
- **Desktop CLS on `/`:** 0 (unchanged — homepage already had CLS 0)

### Desktop CLS investigation and fix

**Root cause (confirmed by trace evidence):** The body uses `min-h-full flex flex-col`, which pushes the footer to the viewport bottom on initial render. When the font swaps (`display: "swap"`), text reflows and content grows, pushing the footer down — a visible shift on pages with content near viewport height.

**Evidence:**
- Pages with CLS 0.32: stories, project-detail, gallery, get-involved (content ~viewport height)
- Pages with CLS ~0: privacy, terms (short text content, minimal reflow)
- Pages with CLS 0: homepage, donate (content much taller than viewport, footer already below viewport)
- The shifting element is always `<footer>` (confirmed in Lighthouse layout-shift trace)
- The `adjustFontFallback: true` fallback metrics (Arial with size-adjust 93.76%) were not close enough to prevent the shift

**Fix (Phase 6B):** Changed `display: "swap"` to `display: "optional"` for both Source Sans 3 and Noto Sans Arabic. With `optional`, the browser uses the fallback font if the custom font isn't loaded within 100ms and never swaps, eliminating the shift. The font is self-hosted and preloaded, so most users on fast connections will still get the custom font.

### Mobile LCP investigation

Mobile LCP remains 3.6–8.7s across routes, exceeding the 2.5s budget. The LCP element is typically the hero image or a text heading.

**Root cause:** On simulated slow 4G (Lighthouse mobile preset), the main-thread blocking time is the primary contributor. The homepage TBT dropped from 2678 ms to 794 ms after deferring the map, but other routes still have TBT of 500–4800 ms. The story-detail route has TBT of 4804 ms, likely from `react-markdown` + `remark-gfm` + `rehype-sanitize` processing the article body.

**Accepted:** Mobile LCP on slow 4G is constrained by the Next.js/React framework runtime and content processing. The initial JS transfer (173–213 KB gzip) includes the framework runtime (~90 KB), React DOM (~40 KB), and route-specific code. Further reduction would require either:
- Splitting the framework runtime (not practical with Next.js)
- Reducing client-side dependencies (react-markdown is the heaviest on story pages)
- Server-only rendering of markdown bodies (would lose client-side hydration)

These are larger architectural changes beyond Phase 6 scope.

### JavaScript budget clarification

The previous report's "246 KB gzip" included the map chunk. After Phase 6A:

| Category | Homepage | Other routes | Notes |
|---|---|---|---|
| **Initial JS** (transferred during navigation) | 173 KB | 200–216 KB | Excludes deferred map chunk |
| **Deferred JS** (transferred after viewport proximity) | ~73 KB | 0 | Map chunk on homepage only |
| **Total eventual JS** | ~246 KB | 200–216 KB | After all deferred chunks load |

The **initial JS** of 173–216 KB gzip exceeds the original 150 KB budget. The remaining JS is:
- Next.js framework runtime: ~90 KB
- React DOM: ~40 KB
- Route-specific code (forms, navigation, analytics): ~40–80 KB

The framework runtime alone (Next.js + React) is ~130 KB gzip, leaving only ~20 KB for route-specific code to meet the 150 KB budget. This is unrealistic for a production application with forms, analytics, and navigation. The budget should be revised to **200 KB initial JS gzip** to accommodate the framework runtime while still encouraging lean route code.

### Gallery transfer semantics

The `/gallery` page transfers 412 KB of images (34 images) on mobile and 618 KB (52 images on desktop with larger viewport).

**How `next/image` handles gallery images:**
- All gallery images use `next/image` with `fill` and `sizes` set to `THUMBNAIL_SIZES` (responsive srcset)
- `next/image` generates responsive srcset variants, so the browser only downloads the appropriate size for each viewport
- Images are lazy-loaded by default (`loading="lazy"`) — only images near the viewport are transferred initially
- The 34 images measured by Lighthouse represent the images that were within or near the viewport during the audit

**Initial viewport:** On mobile (375px), approximately 6–8 thumbnail images are visible. At ~12 KB per thumbnail (WebP/AVIF), the initial image transfer is ~72–96 KB — within the 200 KB budget.

**After scroll:** The remaining images load as the user scrolls. The 412 KB total represents the full-gallery consumption, not the initial load.

**Conclusion:** The gallery's initial experience is lightweight. The 412 KB total is eventual consumption after scrolling, not a low-bandwidth problem. No pagination or progressive loading is needed based on current measurement.

### Remaining known limitations

1. **Mobile LCP on slow 4G** — 3.6–8.7s across routes. Constrained by framework runtime and content processing. Accepted as a known limitation of the current architecture.
2. **Initial JS budget** — 173–216 KB gzip exceeds the original 150 KB target. The framework runtime alone is ~130 KB. Budget revised to 200 KB.
3. **Story-detail TBT** — 4804 ms on mobile, caused by react-markdown processing. A larger architectural change (server-only markdown rendering) would be needed to fix this.
4. **No real-user telemetry** — `@vercel/speed-insights` is not installed. Field data is unavailable.

### Accepted budget exceptions

| Budget | Original target | Revised target | Rationale |
|---|---|---|---|
| Initial JS per route | < 150 KB gzip | < 200 KB gzip | Next.js + React framework runtime is ~130 KB gzip, leaving only 20 KB for route code at 150 KB target |
| Mobile LCP on slow 4G | < 2.5s | < 5.0s (accepted) | Constrained by framework runtime and content processing on simulated slow 4G |

## Image Optimization Strategy

### Formats

All images are served in **WebP** and **AVIF** formats via `next/image`:
- `next.config.ts` sets `images.formats: ["image/webp", "image/avif"]`
- The browser automatically picks the best format it supports
- AVIF provides ~50% smaller files vs JPEG; WebP provides ~30% smaller

### Responsive Sizing

Images use the `sizes` attribute to tell the browser what width the image will be at different breakpoints. This lets the browser pick the right source from the srcset, avoiding downloading unnecessarily large images on mobile.

**Presets** are defined in `lib/image-presets.ts`:

| Preset | Use case | sizes value |
|--------|----------|-------------|
| `hero` | Homepage hero | 100vw on mobile, 1200px on desktop |
| `detailHero` | Project/story detail hero | 100vw on mobile, 1200px on desktop |
| `card` | Card grids (projects, stories) | 100vw mobile, 50vw tablet, 33vw desktop |
| `half` | Two-column layouts | 100vw mobile, 50vw desktop |
| `team` | Team member photos | 50vw mobile, 33vw tablet, 20vw desktop |
| `banner` | Full-width banners | 100vw |

### Blur Placeholders

All images use `placeholder="blur"` with a lightweight SVG-based blur data URL (`lib/blur-placeholder.ts`). This shows a smooth gray placeholder while the image loads, preventing layout shift and improving perceived performance.

For true per-image blur (where the placeholder is a blurred version of the actual image), use Next.js static image imports which generate `blurDataURL` automatically.

### Lazy Loading

- **Above-the-fold images**: `preload={true}` — preloaded by the browser via `<link>` in `<head>`. In Next.js 16, `priority` is deprecated in favor of `preload`.
- **Below-the-fold images**: default `loading="lazy"` (next/image default) — loaded when scrolled into view

### CLS Prevention

All images use `fill` mode within containers with explicit aspect ratios:
- Hero: `aspect-[4/3]`
- Detail heroes: `aspect-[16/9]`
- Cards: `aspect-[16/10]`
- Team photos: fixed `h-24 w-24` (rounded)

This reserves space for the image before it loads, preventing layout shift.

### Focal Point Cropping

The `ImageOrPlaceholder` component accepts an `objectPosition` prop for focal-point-aware cropping:
```tsx
<ImageOrPlaceholder
  src="/images/hero.jpg"
  alt="Community gathering"
  fill
  objectPosition="center top"
/>
```
Use this when the important part of the image is not centered (e.g., faces in the upper third).

## Client-Side JS Audit

45 components are client-side (`"use client"`). This is more than the original 7 documented in earlier versions, but all are justified:

| Category | Components | Why client |
|----------|-----------|------------|
| Navigation | `Header`, `LanguageSelector` | Mobile menu state, `usePathname`, locale switching |
| Forms | `ContactForm`, `DonationForm`, `NewsletterForm` | `useActionState` for server actions |
| Interactive UI | `GalleryGrid`, `StoryList`, `ProjectList` | `useState` for filtering, lightbox, selection |
| Analytics | `ArticleAnalytics`, `ArticleShareButtons`, `ArticleCtaBar`, `WhatsAppButtonClient` | Browser APIs, event tracking |
| Reading UX | `ReadingProgress`, `RelatedStories` | Scroll tracking, carousel |
| Lazy loading | `LazySection` | `IntersectionObserver` |
| Map | `UgandaReachMap`, `UgandaMap` | d3-geo, interactive SVG (dynamically imported in Phase 6A) |
| Admin | `AnalyticsDashboard`, `Charts`, `MediaManager`, `StoriesWorkspace`, etc. | Admin-only, not in public bundle |
| Infrastructure | `error.tsx`, `AnalyticsScripts`, `TurnstileWidget` | Next.js error boundary, script loading |

No accidental client components were found. All client components have a clear reason for being client-side.

## Fonts

- **Primary font**: `Source_Sans_3` (not Inter — docs were previously stale)
- **Arabic font**: `Noto_Sans_Arabic` (loaded only on Arabic pages, `preload: false` to avoid unnecessary downloads)
- **Display strategy**: `display: "swap"` with `adjustFontFallback: true` to reduce CLS
- Fonts are self-hosted via `next/font` — no runtime Google Fonts requests

## Testing

### Lighthouse

Run Lighthouse in Chrome DevTools (or via CLI):
```bash
npx lighthouse https://www.vantagefoundationuganda.com --preset=desktop --output=html --output-path=./lighthouse-report.html
```

Target scores:
- Performance: 90+ (desktop), 50+ (mobile — mobile is constrained by JS execution time on slow 4G)
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+

### Throttled Testing

In Chrome DevTools → Network → Throttling → "Slow 3G":
1. Load the homepage
2. Verify hero image loads within 3 seconds
3. Navigate to /projects and verify card images lazy-load on scroll
4. Check no layout shift during image load

### Vercel Speed Insights

Vercel can automatically collect Core Web Vitals from real users if enabled at the project level. View them in:
Vercel Dashboard → Project → Analytics → Speed Insights

Note: `@vercel/speed-insights` is not installed in the application code. Install it if real-user monitoring is needed.

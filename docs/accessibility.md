# Accessibility

Vantage Foundation Uganda is committed to making its website usable by everyone, including people with disabilities. This document describes the accessibility posture, testing methodology, and known limitations.

## Standards

The target conformance level is **WCAG 2.2 AA**. The site is tested against the `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, and `wcag22aa` axe-core rule tags.

## Automated testing

Axe-core runs in CI via Playwright on 23 public routes, covering every page type (homepage, programme, project, story, gallery, donate, contact, get-involved, policy pages, team pages, donors-and-sponsors, reports-and-accountability).

**CI job:** `.github/workflows/ci.yml` → `e2e-a11y`

**Test file:** `tests/e2e/accessibility.spec.ts`

The automated suite verifies:

- Each page has exactly one visible `<h1>` and a `<main>` landmark.
- The skip link is the first sequential keyboard destination.
- The skip link targets `#main` and the main landmark has `tabindex="-1"`.
- The skip link receives focus and becomes visible when focused.
- The mobile navigation dialog opens with keyboard, receives focus, and closes with Escape (focus is restored to the trigger button).
- No positive `tabindex` values exist on any public page.
- Axe-core reports zero violations on all tested routes.

### Limitations of automated testing

Axe-core cannot detect:

- Heading order issues beyond a single h1 (it does not flag skipped levels).
- Color contrast on image-backed text (gradients over photographs).
- Focus trap quality in custom dialogs (it checks DOM structure, not runtime focus behavior).
- Screen reader announcement timing and correctness.
- Keyboard navigation through custom widgets at runtime.

These are covered by manual testing (below).

## Manual testing

### Heading order

Every page was audited statically for heading order. The following rules are enforced:

- One `<h1>` per page.
- No skipped heading levels (h1 → h3 without an intervening h2 is a violation).
- Footer column labels are `<p>` elements, not headings.
- Map tooltip district names are `<p>` elements, not headings.
- Markdown content renders `#` as `<h2>` (not `<h1>`) to prevent multiple h1s on article pages.

### Color contrast

Design token contrast ratios are documented in `docs/brand/colour-system.md` and `lib/design-tokens.ts`. Key ratios:

| Foreground | Background | Ratio | Status |
|---|---|---|---|
| Teal Dark (`#006b70`) on white | — | 6.3:1 | Pass (AA normal) |
| White on Teal Dark | — | 6.3:1 | Pass (AA normal) |
| White on Navy (`#050708`) | — | ~19.7:1 | Pass |
| Teal Primary (`#008f95`) on white | — | 3.9:1 | Fail (large text/surfaces only) |
| Muted foreground (`#475569`) on white | — | ~7.5:1 | Pass |

**Rules:**

- `--deep-teal` (`#008f95`) is reserved for large text (24px+) or non-text surfaces only.
- `--primary` (`#006b70`) is used for all text-sized contrast needs.
- On `bg-primary` backgrounds, text uses `text-white` or `text-white/90` (minimum 5.4:1).
- Translucent white badges on `bg-primary` use `bg-white/10` (not `bg-white/20`) to maintain contrast.

### Keyboard navigation

Manual keyboard testing covers:

1. **Tab order:** Skip link → main content → navigation → footer. No positive `tabindex` values.
2. **Mobile menu (public):** Trigger button → dialog opens → focus moves to dialog → Tab cycles within dialog → Escape closes → focus restores to trigger.
3. **Mobile menu (admin):** Same pattern as public, with focus trap and page isolation (`inert`/`aria-hidden` on background content).
4. **FAQ accordion:** Native `<details>`/`<summary>` — keyboard accessible by default.
5. **Project/story filters:** Native `<select>` and `<input>` — keyboard accessible by default.
6. **Gallery lightbox:** Native `<dialog>` with arrow-key navigation between images.
7. **Sortable table headers:** `<button>` elements inside `<th>` with `aria-sort` indicators.
8. **Admin row-action menus:** `onClick` (not `onMouseDown`), `role="menu"`, focus closes on focusout.

### Focus indicators

A global `:focus-visible` rule in `app/globals.css` provides a 2px solid `--primary` outline with 2px offset on all native focusable elements. Key interactive components (`Button`, `Input`, `Select`, `Textarea`, `WhatsAppButton`) also have explicit `focus-visible:ring-2` styling.

### Screen reader testing

The site uses native HTML semantics throughout:

- `<nav>`, `<main>`, `<footer>`, `<section>`, `<article>` landmarks.
- `<button>`, `<a>`, `<input>`, `<select>`, `<textarea>` native controls.
- `<details>`/`<summary>` for accordions.
- `<dialog>` for the gallery lightbox.
- `role="dialog"` + `aria-modal="true"` for mobile menus.
- `role="status"` / `role="alert"` for form feedback.
- `aria-live="polite"` for async content updates.
- `aria-current="page"` for active navigation links.
- `aria-sort` on sortable table columns.
- `aria-pressed` on toggle buttons.
- `aria-expanded` / `aria-controls` on disclosure buttons.
- `aria-invalid` / `aria-describedby` on form fields with validation errors.
- `aria-hidden="true"` on decorative icons and separators.
- `sr-only` text for icon-only buttons and screen-reader-only labels.

### Video and audio

The site does not currently embed any `<video>` or `<audio>` content. If video is added in the future, captions and transcripts will be required per WCAG 2.2 AA.

## Known limitations

1. **Short-page CLS:** Pages with minimal content (`/get-involved`, `/contact`, `/ar`) may exhibit CLS around 0.25–0.33 due to font loading and footer positioning. This is documented as an accepted limitation in `docs/performance.md`.

2. **Turnstile widget:** The Cloudflare Turnstile widget's internal focus management and accessibility is controlled by the third-party provider and cannot be audited as project-owned UI.

3. **Admin axe-core coverage:** Automated axe-core tests currently cover public routes only. Admin routes require authentication and are tested via manual keyboard/screen-reader testing. Adding authenticated axe-core scans for admin pages is a future improvement.

4. **Image-backed hero text:** The homepage hero and story hero overlays use gradient scrims over photographs. Contrast depends on the underlying image brightness. The gradients are designed to maintain at least 4.5:1 contrast in the text regions, but this should be verified per-image if photographs change.

5. **Related-stories carousel:** The horizontally scrollable related-stories section has no previous/next buttons. Items are keyboard-focusable links, but keyboard users cannot scroll to off-screen items without tabbing through them. This is a low-priority enhancement.

## Reporting accessibility issues

If you encounter an accessibility barrier on this site, please contact Vantage through the `/contact` page. Reports are tracked through the case-management pipeline and addressed in phased accessibility work.

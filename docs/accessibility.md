# Accessibility — Vantage Foundation Uganda

**Target:** WCAG 2.2 AA across all public routes.

This document records the current accessibility state, testing methodology, and known considerations for the Vantage Foundation Uganda website.

---

## Current state

All 27 public routes pass automated axe-core checks against WCAG 2.2 AA tags (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`). See `tests/e2e/accessibility.spec.ts` for the full test suite.

### Document structure
- Every page has exactly one visible `<h1>` (verified by E2E tests on all 27 routes).
- Heading hierarchy follows h1 → h2 → h3 with no skipped levels.
- `SectionHeader` component supports `level="h1"` (page title) and `level="h2"` (section title, default).
- `<main id="main">` landmark is present on every page.

### Skip link
- `SkipToContent` component is the first focusable element in the layout.
- Visible on focus, links to `#main`, and moves focus to the main landmark.
- Verified by E2E keyboard navigation test.

### Focus management
- Global `:focus-visible` style in `globals.css`: `outline: 2px solid var(--primary); outline-offset: 2px`.
- `Button` component: `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`.
- `Input`, `Select`, `Textarea`: `focus:ring-2 focus:ring-primary`.
- Custom buttons in `DonationForm` (amount/frequency toggles): `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`.
- `UgandaReachMap` filter buttons: `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`.

### Mobile menu (dialog)
- `role="dialog"`, `aria-modal="true"`, `aria-label="Mobile navigation"`.
- Focus trap: Tab and Shift+Tab cycle within the dialog.
- Escape key closes the dialog.
- Focus restores to the trigger button on close.
- Body scroll locked while open.
- Verified by E2E keyboard navigation test.

### Forms
All three public forms (`ContactForm`, `DonationForm`, `NewsletterForm`) include:
- `<Label>` with `htmlFor` association for every field.
- `aria-invalid` on fields with validation errors.
- `aria-describedby` linking fields to their error messages.
- `FieldError` component for per-field error display.
- `role="status"` + `aria-live="polite"` for form submission status announcements.
- `HoneypotFields` for anti-spam (hidden from screen readers and sighted users).
- `FormPrivacyNotice` on every form.
- `noValidate` on `<form>` (server-side validation with accessible error messages).

### Interactive components
- **FAQ accordion**: Native `<details>`/`<summary>` — keyboard accessible by default, no JS required.
- **Project/Story filters**: `Select` elements with `aria-label` for filter controls.
- **UgandaReachMap**: Map pins are `<button>` elements with `aria-expanded` and `aria-controls`. SVG is `aria-hidden`; accessible district list carries the same information.
- **GalleryGrid**: Lightbox uses `<dialog>` with `showModal()`. Close button has `aria-label`. Arrow keys navigate. Click backdrop to close.
- **DonationForm amount/frequency toggles**: `aria-pressed` for toggle state.

### Colour and contrast
- Primary colour (`#006b70`) passes WCAG AA 4.5:1 on white for normal text.
- `--primary` token uses teal dark (`#006b70`), not teal primary (`#008f95`) — the latter only reaches 3.9:1.
- White text on primary background passes AA for normal and large text.
- `text-muted-foreground` on `bg-background` passes AA.
- `ImpactMetric` tier badges use colour + text labels (WCAG 1.4.1 — colour is not the sole indicator).

### Motion
- `prefers-reduced-motion: reduce` media query in `globals.css` disables all animations and transitions.

### Icons
- All decorative icons have `aria-hidden="true"`.
- All icon-only buttons have `aria-label` (e.g. "Open menu", "Close menu", "Close photo viewer", "Previous photo", "Next photo").

---

## Testing methodology

### Automated tests (CI)

**axe-core E2E tests** (`tests/e2e/accessibility.spec.ts`):
- 17 pages checked against WCAG 2.2 AA tags.
- Run with Playwright in Chromium.
- Zero violations expected.

**Document structure tests**:
- 27 routes checked for exactly one visible `<h1>` and a `<main>` landmark.

**Keyboard navigation tests**:
- Skip link: Tab → focus → Enter → focus moves to `#main`.
- Mobile menu: focus trigger → Enter → dialog visible → Escape → dialog hidden → focus restored.

### Manual testing

Test the following at **320px, 375px, 768px, 1024px, 1440px**:

1. **Keyboard-only navigation**: Tab through the homepage, open/close mobile menu, navigate to a project page, open gallery lightbox, close it.
2. **Screen reader testing** (NVDA on Windows or VoiceOver on macOS):
   - Navigate homepage by headings.
   - Submit contact form with errors — verify error announcements.
   - Use UgandaReachMap district list — verify all districts are announced.
3. **200% zoom**: Verify no horizontal scrolling on key routes.
4. **High contrast mode**: Verify all text remains readable.

### Test commands

```bash
# Run accessibility E2E tests
npx playwright test tests/e2e/accessibility.spec.ts

# Run all E2E tests
npx playwright test

# Run unit tests (includes component accessibility checks)
npx vitest run
```

---

## Known considerations

### Images
- All images use `next/image` with descriptive `alt` text.
- Placeholder images (when no photo is available) render as `aria-hidden="true"` neutral surfaces — they make no publication claim.
- Team member photos use verified alt text based on visible content (no invented names for children/vulnerable people).

### External content
- Instagram posts are server-rendered with accessible captions.
- Social media links use `rel="noopener noreferrer"` and descriptive `aria-label`s.

### Future work
- Add captions or transcripts for any video content (none currently).
- Test with a screen reader on critical journeys (NVDA/VoiceOver).
- Consider adding a high-contrast theme if user research indicates a need.
- Evaluate `prefers-contrast: more` support for users who need higher contrast.

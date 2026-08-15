# Editorial Guidelines

This document describes the content model, editorial workflow, and content
validation system for the Vantage Foundation Uganda website.

## Content location

All editable content lives in the `content/` folder as TypeScript modules.
See [`content/README.md`](../content/README.md) for a file-by-file overview.

## Content model

The typed content schema is defined in [`types/index.ts`](../types/index.ts).
Key types:

| Type | File | Description |
|------|------|-------------|
| `SiteConfig` | `content/site.ts` | Global config: name, contact, nav, bank details |
| `Project` | `content/projects.ts` | A project with slug, category, status, body |
| `Story` | `content/stories.ts` | A story or insight with slug, author, body |
| `AreaOfWork` | `content/areas.ts` | A programme area (Health, Education, etc.) |
| `TeamMember` | `content/team.ts` | A team member with name, role, bio, photo |
| `Partner` | `content/partners.ts` | A partner organisation |
| `ImpactStat` | `content/impact.ts` | A single impact statistic |
| `Report` | `content/reports.ts` | A downloadable report or document |
| `FaqItem` | `content/faq.ts` | A FAQ question and answer |
| `MediaAsset` | `content/media.ts` | A media asset with consent metadata |

### Phase 4 extensions

`Project` and `Story` now support these optional fields:

- **`published`** (boolean, defaults to `true`): Unpublished items are
  filtered out of production routes but remain visible in development for
  previewing. Set `published: false` to draft an item without publishing it.
- **`seo`** (`SeoMeta`): Per-item SEO overrides for `title`, `description`,
  and `ogImage`. When omitted, the item's `title` and `summary`/`excerpt`
  are used as fallbacks.
- **`consentClassification`** (`ConsentClassification`): Consent status for
  media featuring people. One of `"none"`, `"verified"`, `"pending"`,
  `"group-consent"`. See Safeguarding below.
- **`tags`** (Story only, string array): Free-form tags for filtering.
- **`reportingPeriod`**, **`fundingStatus`**, **`startDate`**, **`endDate`**,
  **`documents`** (Project only): Project metadata for richer reporting.

## Build-time validation

All content modules are validated against Zod schemas at build time via
[`lib/validate-content.ts`](../lib/validate-content.ts). The validation runs
automatically before `next build` (via the `prebuild` npm script) and can
also be run manually:

```bash
npm run validate-content
```

The validation checks:

1. **Required fields**: Every item has the required fields defined in its type.
2. **Field formats**: Slugs are lowercase hyphen-separated; emails are valid;
   URLs are valid; enums match the allowed values.
3. **Cross-references**: `relatedStorySlugs` in projects reference existing
   story slugs; `relatedProjectSlugs` in stories reference existing project
   slugs.
4. **Uniqueness**: No duplicate project or story slugs.

If validation fails, the build will not proceed and the errors will be
printed with the file, path, and message for each issue.

## Editorial workflow

### Adding a new project

1. Add a new object to the `projects` array in `content/projects.ts`.
2. Set `published: false` if the project is a draft.
3. Run `npm run validate-content` to verify the new entry is valid.
4. Run `npm run dev` to preview the project at `/projects/{slug}`.
5. When ready to publish, set `published: true` (or omit the field).

### Adding a new story

1. Add a new object to the `stories` array in `content/stories.ts`.
2. Set `published: false` if the story is a draft.
3. Run `npm run validate-content` to verify.
4. Run `npm run dev` to preview at `/stories/{slug}`.
5. When ready, set `published: true`.

### Updating content

1. Edit the relevant file in `content/`.
2. Run `npm run validate-content` to catch any schema violations.
3. Run `npm run build` to verify the full build passes.

## Markdown

Long-form body content for projects and stories supports Markdown via the
`Markdown` component (`components/shared/Markdown.tsx`). Keep formatting
simple: paragraphs, headings, lists, and links. The markdown is sanitized
with `rehype-sanitize` to prevent XSS.

### MDX evaluation (Phase 4)

**Decision: stay with Markdown for now.**

MDX was evaluated for long-form story bodies. The current Markdown approach
(using `react-markdown` + `remark-gfm` + `rehype-sanitize`) is sufficient
for the site's needs. MDX would add complexity (build-time compilation,
component imports in content files) without clear benefit until the editorial
team needs interactive components embedded in stories. Revisit if:

- Stories need embedded data visualizations or interactive elements.
- The editorial team requests reusable callout/admonition components.
- Story bodies need conditional rendering based on user state.

## Safeguarding and consent

### Consent classification

Every `MediaAsset` and every `Project`/`Story` with a `heroImage` or
`gallery` must have a `consentClassification`:

| Classification | When to use |
|----------------|-------------|
| `none` | No people featured (landscape, object, text, diagram) |
| `verified` | Written consent on file for all identifiable individuals |
| `pending` | Consent being sought; **do NOT publish** until verified |
| `group-consent` | Community/group leader consent for wide shots where individuals are not identifiable |

### Rules

1. **Never publish media with `consent: "pending"` in production.** The
   `published` flag on the media asset should be `false` until consent is
   verified.
2. **Alt text must describe visible content without inventing names** for
   children or vulnerable people. Use "a young student" not "Jane, 14".
3. **Strip EXIF metadata** (especially GPS) from all published images
   before adding them to `public/images/`.
4. **Generalise locations** in captions and alt text for sensitive contexts
   (e.g. "a rural community in Bushenyi District" not a specific village).

## Placeholders

Content that still needs to be verified is marked with:
- `[placeholder text]` in the content value, or
- `placeholder: true` boolean flag on the item.

Before public launch, replace all placeholders with accurate, consent-approved
information. The build-time validation does not currently flag placeholder
text (it would require natural language processing), so editors must
manually review for `[` characters in content fields.

## Images

- Real images go in `public/images/`.
- Update `heroImage`, `photo`, or `logo` paths in content files.
- If an image path contains `placeholder` or is missing, the
  `ImageOrPlaceholder` component shows a styled placeholder.
- Every published image should have a corresponding entry in
  `content/media.ts` with consent metadata.

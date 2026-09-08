# Media Guidelines

This document describes how images are processed, stored, and managed on the
Vantage Foundation Uganda website.

## Image processing pipeline

All raw photos in `vantage photos/` are processed through
`scripts/process-images.js` before being published:

1. **Metadata stripping**: All EXIF, IPTC, ICC, and XMP metadata is removed.
   This includes GPS coordinates, camera serial numbers, timestamps, and
   software fingerprints. This is a critical safeguarding measure — GPS
   coordinates in photos of vulnerable people can reveal their location.

2. **Resizing**: Images are resized to a maximum of 1920px on the longest
   side, preserving aspect ratio. This is sufficient for full-bleed hero
   images on retina displays while keeping file sizes reasonable.

3. **Format conversion**: Each image is converted to:
   - **WebP** (quality 82) — primary format, supported by all modern browsers
   - **AVIF** (quality 60) — next-generation format, 30-50% smaller than WebP

4. **Output**: Processed images are saved to `public/images/photos/` with
   sequential filenames (`photo-001.webp` through `photo-089.webp`).

5. **Manifest generation**: `scripts/generate-media-manifest.js` creates
   `content/media.ts` with one `MediaAsset` entry per image.

### Running the pipeline

```bash
# Process all photos in "vantage photos/"
node scripts/process-images.js

# Regenerate content/media.ts from the manifest template
node scripts/generate-media-manifest.js

# Validate all content (including media manifest)
npm run validate-content
```

### Results (initial run)

- 89 photos processed
- 50.8 MB → 19.7 MB WebP (61% reduction)
- All metadata stripped (no GPS, no camera info, no dates)
- All entries have `consent: "pending"` and `published: false`

## Image size presets

The following presets should be used when displaying images:

| Usage | Max width | `sizes` attribute | Priority |
|-------|-----------|-------------------|----------|
| Hero (full-bleed) | 1920px | `100vw` (mobile), `50vw` (desktop) | `priority` |
| Project/story card | 800px | `33vw` (desktop), `50vw` (tablet), `100vw` (mobile) | lazy |
| Thumbnail | 400px | `25vw` (desktop), `50vw` (mobile) | lazy |
| OG image | 1200x630px | N/A (not rendered in page) | N/A |

## Next.js Image component

All images should be rendered through `next/image` (via `ImageOrPlaceholder`)
which provides:
- Automatic responsive `srcset` generation
- Lazy loading for below-the-fold images
- Automatic format negotiation (WebP/AVIF)
- Prevention of layout shift with explicit `width`/`height`

## Folder structure

```
public/images/
  photos/           # All processed photos (photo-001.webp, etc.)
    photo-001.webp
    photo-001.avif
    ...
  og/               # Open Graph images (1200x630px)
  placeholder-*.jpg # Placeholder images for missing content
```

When human reviewers categorize photos by programme/project, they may
reorganize `public/images/photos/` into subdirectories:
```
public/images/
  projects/
    kasaale-borehole/
    savegirl-uganda/
    ...
  stories/
  team/
  partners/
  general/
```

## Human review checklist

Before setting `published: true` for any photo in `content/media.ts`:

1. **View the photo** and write descriptive alt text based on visible content.
   - Do NOT invent names for children or vulnerable people.
   - Use "a young student" not "Jane, 14".
   - Describe what is happening, not who is in the photo.

2. **Verify consent** for all identifiable individuals:
   - Is there written consent on file? → `consent: "verified"`
   - Is it a wide shot where individuals are not identifiable? → `consent: "group-consent"`
   - Are there no people featured? → `consent: "none"`
   - Is consent still being sought? → `consent: "pending"` (do NOT publish)

3. **Categorize** the photo:
   - Set `programme` to the area id (health, education, humanitarian, water, youth-leadership)
   - Set `projectSlug` if the photo relates to a specific project
   - Set `caption`, `credit`, `date`, and `location` where known

4. **Safeguarding review** for photos featuring children:
   - Could this photo put the child at risk of identification or harm?
   - Is the child in a dignified pose and context?
   - Is the child adequately clothed?
   - Would the child or their guardian be comfortable with this photo being
     publicly visible on the internet?

If any answer is "no" or "unsure", do NOT publish the photo.

## Backup

The original raw photos in `vantage photos/` should be backed up securely
and not committed to the git repository (they contain personal data and
are large). The processed WebP/AVIF files in `public/images/photos/` are
committed to the repository.

## Admin media uploads (Cloudflare R2)

In addition to the committed static image pipeline, operational media
(photos, documents, logos) can be uploaded at runtime through the admin
dashboard at `/admin/media`. These uploads are stored in Cloudflare R2,
not in the git repository.

### Upload flow

1. The admin selects a file and folder in `/admin/media`.
2. The browser requests a presigned PUT URL from `/api/admin/media/presign`.
   - Authorization uses Layer B (active session verification) — disabled
     admins and retired bootstrap sessions are rejected before any upload
     capability is minted.
   - CSRF validation runs before presigning.
   - The server validates the MIME type and file size against the allowed
     set (JPEG, PNG, WebP, AVIF, GIF, PDF).
3. The browser uploads directly to R2 via the presigned PUT URL.
4. The server confirms the object via HEAD and records it in the
   `media_objects` table.
5. The object key (not a signed URL) is stored in the database for
   stability; presigned GET URLs are minted at render time.

### Consent and publication

New uploads default to:
- `consent: "pending"` — consent must be verified before publishing.
- `published: false` — the object is not visible on the public site until
  an admin explicitly publishes it.

Set both fields before publishing. See the human review checklist above
for consent classification guidance.

### Audit

All media create, update, and delete actions are written to the immutable
`audit_log` table with:
- Actor identity (admin username or bootstrap)
- Before/after JSON snapshot
- Admin IP address
- Timestamp

### Key files

- `lib/storage/r2-client.ts` — R2 client and presigned URL generation
- `lib/storage/vantage-objects.ts` — object key conventions
- `lib/db/media.ts` — media object database queries
- `app/api/admin/media/presign/route.ts` — presign endpoint
- `app/api/admin/media/route.ts` — media CRUD endpoints
- `components/admin/MediaManager.tsx` — admin media manager UI

### Relationship to the static image pipeline

The two systems are complementary:
- **Committed static images** (`public/images/photos/`) — content images
  bundled with the codebase, processed through `scripts/process-images.js`
  and tracked in `content/media.ts`.
- **Admin R2 uploads** — operational media managed at runtime through the
  admin dashboard, stored in R2 and tracked in the `media_objects` table.

Both systems enforce the same consent classification model. The static
pipeline is for images that ship with the codebase; R2 uploads are for
images added by admins without a code deployment.

# Safeguarding and Consent Policy

This document describes Vantage Foundation Uganda's approach to safeguarding
and consent for photographs and media featuring children, young people, and
vulnerable adults.

## Principles

1. **The safety and dignity of the people we serve comes first.** No photo,
   story, or content is more important than the wellbeing of the individuals
   featured.

2. **Informed consent is required.** People featured in our media must
   understand how their image will be used and must freely agree to it.

3. **Children require additional protection.** Photos of children (under 18)
   require consent from a parent or guardian, and must never place the child
   at risk of identification, exploitation, or harm.

4. **Context matters.** A photo that is safe in one context may be harmful in
   another. Consider how a photo could be misused before publishing.

5. **Deletion is always possible.** Anyone featured in our media can request
   removal at any time, and we will honour that request promptly.

## Consent classification

Every media asset in `content/media.ts` must have a `consent` classification:

| Classification | When to use | Can publish? |
|----------------|-------------|--------------|
| `none` | No people featured (landscape, object, text, diagram) | Yes |
| `verified` | Written consent on file for all identifiable individuals | Yes |
| `pending` | Consent being sought or not yet verified | **No** |
| `group-consent` | Community/group leader consent for wide shots where individuals are not identifiable | Yes, with caution |

## Consent process

### For adults

1. Explain how the photo will be used (website, social media, reports).
2. Explain that the photo will be publicly visible on the internet.
3. Obtain verbal or written agreement.
4. Record the consent in the media manifest (`consentNotes` field).
5. For written consent, store the consent form securely.

### For children (under 18)

1. Explain to the child (in age-appropriate language) how the photo will be used.
2. Obtain consent from a parent or guardian.
3. Obtain the child's assent (their agreement to be photographed).
4. A child's dissent (refusal) overrides parental consent — do not photograph.
5. Record the consent in the media manifest.

### For group/community photos

1. Obtain consent from the community leader or group representative.
2. Ensure individuals in the group are aware they are being photographed.
3. Only use `group-consent` for wide shots where individuals are not
   identifiable. If individuals are identifiable, individual consent is
   required.

## Safeguarding rules for photos of children

**Never publish a photo of a child if:**

1. The child is identifiable by name, location, or context (e.g. school uniform).
2. The photo could put the child at risk of abuse, exploitation, or stigma.
3. The child is in an undignified pose or context.
4. The child is not adequately clothed.
5. The photo reveals the child's location (e.g. school name, village sign).
6. The child or their guardian has requested removal.

**Always:**

1. Generalise locations in captions and alt text (e.g. "a rural community in
   Bushenyi District" not "Kasaale Village, near the borehole").
2. Use first names only, or no names, for children.
3. Describe what is happening, not who is in the photo.
4. Consider how the photo could be misused by someone with bad intentions.

## EXIF and metadata

All photos published on the website must have EXIF, IPTC, ICC, and XMP
metadata stripped before publishing. This removes:

- **GPS coordinates** — can reveal the exact location where a photo was taken
- **Timestamps** — can be used to track patterns of activity
- **Camera serial numbers** — can identify the photographer
- **Software fingerprints** — can reveal editing history

The image processing pipeline (`scripts/process-images.js`) strips all
metadata automatically. See [`docs/media-guidelines.md`](./media-guidelines.md)
for details.

## Data retention

- **Original photos**: Stored securely in `vantage photos/` (not committed to
  git). Retained until consent expires or removal is requested.
- **Processed photos**: Stored in `public/images/photos/` (committed to git).
  Removed when consent expires or removal is requested.
- **Media manifest**: `content/media.ts` records consent status. Updated when
  consent is granted, expired, or revoked.

## Removal requests

If anyone featured in our media requests removal:

1. Immediately set `published: false` in `content/media.ts` for that asset.
2. Remove the image file from `public/images/photos/`.
3. Remove references to the image from all content files.
4. Deploy the updated site.
5. Record the removal request and action taken.

## Review schedule

- **Quarterly**: Review all published media to verify consent is still current.
- **Annually**: Full audit of media manifest against consent records.
- **On request**: Immediate review when a removal request is received.

## Contact

For consent questions, removal requests, or safeguarding concerns:
- Email: foundationvantage@gmail.com
- Phone/WhatsApp: +256 786 585 216

## Management approval

This policy requires review and approval by Vantage Foundation Uganda
leadership before public launch. The operational principles and consent
classification system are implemented in the codebase; the following
items require management input to finalise:

1. Final consent form templates (adult, child, group).
2. Data retention periods (how long to keep photos after consent expires).
3. Who is the designated safeguarding officer.
4. Process for handling safeguarding incidents.
5. Legal requirements under Ugandan data protection law.

Until these items are resolved, the policy is operational but not
finalised. The codebase enforces consent defaults (`pending` + `unpublished`)
so no media can be published without explicit admin action.

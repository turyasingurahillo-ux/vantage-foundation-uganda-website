import "server-only";

import { getMediaObjects, type MediaObjectRow } from "@/lib/db/media";
import { createPresignedGetUrl } from "@/lib/storage/r2-client";
import { parseObjectKey, type MediaFolder } from "@/lib/storage/vantage-objects";
import type { MediaAsset, Report, Partner } from "@/types";

/**
 * Resolves published, admin-uploaded media (see /admin/media) into the same
 * shapes the static content/*.ts manifests already use, so pages can render
 * uploads alongside — or in place of — their static defaults without
 * knowing the difference.
 *
 * Every export here fails soft (returns an empty list/null) if the database
 * or R2 aren't reachable or configured. This is supplementary content
 * layered on top of the static manifests, not a hard dependency — a local
 * dev environment without R2 credentials, or a transient DB/R2 outage,
 * should never break a page that has static content to fall back on.
 *
 * TTL note: pages calling these functions are statically rendered and must
 * set `export const revalidate = 3600;` (must be a literal — Next.js's
 * route segment config can't resolve an imported constant) so the page
 * itself refreshes well within PUBLIC_URL_TTL_SECONDS below — otherwise a
 * page could still be serving a presigned URL from a previous build after
 * it has expired. Keep the literal in sync with PUBLIC_URL_TTL_SECONDS if
 * either changes.
 */

/** How long a minted presigned GET URL stays valid for public renders. */
const PUBLIC_URL_TTL_SECONDS = 24 * 60 * 60; // 24 hours

function folderOf(row: MediaObjectRow): MediaFolder | null {
  return parseObjectKey(row.objectKey)?.folder ?? null;
}

/**
 * Consent gate: a media row is only eligible for public rendering when its
 * consent state is NOT "pending". The editorial guidelines
 * (docs/editorial-guidelines.md §Rules) state: "Never publish media with
 * consent: 'pending' in production." This enforces that rule in code, not
 * just in editorial process, so a row with published=true + consent="pending"
 * cannot leak onto the public site.
 */
function hasConsentForPublication(row: MediaObjectRow): boolean {
  return row.consent !== "pending";
}

async function toMediaAsset(row: MediaObjectRow): Promise<MediaAsset> {
  const src = await createPresignedGetUrl({
    objectKey: row.objectKey,
    ttlSeconds: PUBLIC_URL_TTL_SECONDS,
  });
  return {
    id: `r2-${row.id}`,
    src,
    alt: row.altText,
    caption: row.caption ?? undefined,
    date: row.createdAt.toISOString().slice(0, 10),
    programme: row.programme ?? undefined,
    projectSlug: row.projectSlug ?? undefined,
    consent: row.consent,
    consentNotes: row.consentNotes ?? undefined,
    published: row.published,
  };
}

/** Published gallery uploads (vantage/gallery/...), newest first. */
export async function getPublishedGalleryMedia(): Promise<MediaAsset[]> {
  try {
    const rows = (await getMediaObjects({ published: true }))
      .filter((r) => folderOf(r) === "gallery")
      .filter(hasConsentForPublication);
    return await Promise.all(rows.map(toMediaAsset));
  } catch {
    return [];
  }
}

/**
 * The most recently published photo uploaded for a given team member
 * (vantage/team/{slug}/...), or null if none exists — the caller falls back
 * to the static portrait in content/team.ts.
 */
export async function getTeamMemberPhotoOverride(
  slug: string,
): Promise<MediaAsset | null> {
  try {
    const rows = (
      await getMediaObjects({ published: true, projectSlug: slug })
    )
      .filter((r) => folderOf(r) === "team")
      .filter(hasConsentForPublication);
    if (rows.length === 0) return null;
    return await toMediaAsset(rows[0]);
  } catch {
    return null;
  }
}

/** Published extra photos for a programme area (vantage/programmes/...). */
export async function getProgrammeAdditionalPhotos(
  programmeId: string,
): Promise<MediaAsset[]> {
  try {
    const rows = (
      await getMediaObjects({ published: true, programme: programmeId })
    )
      .filter((r) => folderOf(r) === "programmes")
      .filter(hasConsentForPublication);
    return await Promise.all(rows.map(toMediaAsset));
  } catch {
    return [];
  }
}

/** Published documents (vantage/documents/...) shaped like content/reports.ts. */
export async function getPublishedDocuments(): Promise<Report[]> {
  try {
    const rows = (await getMediaObjects({ published: true }))
      .filter((r) => folderOf(r) === "documents")
      .filter(hasConsentForPublication);
    return await Promise.all(
      rows.map(async (r) => ({
        title: r.caption || r.originalFilename,
        date: r.createdAt.toISOString().slice(0, 10),
        type: "Document",
        url: await createPresignedGetUrl({
          objectKey: r.objectKey,
          ttlSeconds: PUBLIC_URL_TTL_SECONDS,
        }),
        description: r.caption ?? undefined,
      })),
    );
  } catch {
    return [];
  }
}

/** Published partner/sponsor logos (vantage/logos/...) shaped like content/partners.ts. */
export async function getPublishedLogos(): Promise<Partner[]> {
  try {
    const rows = (await getMediaObjects({ published: true }))
      .filter((r) => folderOf(r) === "logos")
      .filter(hasConsentForPublication);
    return await Promise.all(
      rows.map(async (r) => ({
        name: r.caption || r.originalFilename,
        logo: await createPresignedGetUrl({ objectKey: r.objectKey }),
        description: r.caption ?? undefined,
      })),
    );
  } catch {
    return [];
  }
}

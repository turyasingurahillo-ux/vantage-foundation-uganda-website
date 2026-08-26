export interface AnalyticsStoryIdentity {
  analyticsArticleId: number;
  storyId: number | null;
  slug: string;
}

/** Public story URLs are always slug-based. */
export function publicStoryHref(identity: Pick<AnalyticsStoryIdentity, "slug">): string {
  return `/stories/${identity.slug}`;
}

/** Editorial/admin routes exist only for DB-backed stories. */
export function adminStoryHref(
  identity: Pick<AnalyticsStoryIdentity, "storyId">,
): string | null {
  return identity.storyId == null ? null : `/admin/stories/${identity.storyId}`;
}

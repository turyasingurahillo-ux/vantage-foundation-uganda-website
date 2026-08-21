/**
 * Build-time synchronization of the analytics_articles registry.
 *
 * Reads all currently published stories (static manifest + DB), upserts those
 * identities as active, then marks missing registry rows inactive only when a
 * complete snapshot was obtained and every active upsert succeeded.
 *
 * Historical analytics are never deleted when content is unpublished, deleted,
 * or removed from the static manifest.
 *
 * Run by migrate-on-build.mjs after schema setup. The script is non-fatal to
 * the overall deployment, but lifecycle synchronization itself is fail-safe:
 * a partial DB read or failed upsert will skip the inactive sweep rather than
 * risk deactivating valid content.
 *
 * PREVIEW_DATABASE_ISOLATED is an operator confirmation gate used by
 * migrate-on-build.mjs. It is not itself proof that DATABASE_URL is isolated;
 * the actual environment must still point to the intended preview database.
 */
import { getPublishedStories } from "@/content/stories";
import { getStories } from "@/lib/db/stories";
import {
  markAnalyticsArticlesInactiveExcept,
  upsertAnalyticsArticle,
} from "@/lib/db/analytics-articles";
import type { PublishedStoryRef } from "@/lib/stories-public";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("[seed-analytics] DATABASE_URL not set — skipping registry seed.");
    process.exit(0);
  }

  const refsBySlug = new Map<string, PublishedStoryRef>();

  // Static-manifest stories are always available without a DB read.
  for (const story of getPublishedStories()) {
    refsBySlug.set(story.slug, {
      slug: story.slug,
      title: story.title,
      category: story.category,
      source: "static",
      publishedDate: story.date,
    });
  }

  // A complete lifecycle snapshot requires the DB published-story read to
  // succeed. DB rows intentionally override same-slug static metadata because
  // the canonical public resolver gives the DB version precedence.
  let completeSnapshot = true;
  try {
    const dbStories = await getStories({ published: true });
    for (const row of dbStories) {
      refsBySlug.set(row.slug, {
        slug: row.slug,
        title: row.title,
        category: row.category,
        source: "db",
        dbId: row.id,
        publishedDate: row.date,
      });
    }
  } catch (error) {
    completeSnapshot = false;
    console.warn(
      "[seed-analytics] Could not read DB stories — inactive sweep disabled:",
      String(error).split("\n")[0],
    );
  }

  const refs = Array.from(refsBySlug.values());

  // Do not catch individual upsert failures. If any active story cannot be
  // refreshed, abort before the inactive sweep. The outer catch keeps the
  // deployment non-fatal while preserving registry correctness.
  for (const ref of refs) {
    await upsertAnalyticsArticle(ref);
  }

  if (completeSnapshot) {
    await markAnalyticsArticlesInactiveExcept(refs.map((ref) => ref.slug));
  } else {
    console.warn(
      "[seed-analytics] Registry active rows refreshed, but no rows were marked inactive because the public-content snapshot was incomplete.",
    );
  }

  console.log(
    `[seed-analytics] Synchronized ${refs.length} active analytics article identities${
      completeSnapshot ? " and completed lifecycle sweep" : " without lifecycle sweep"
    }.`,
  );
}

main().catch((error) => {
  console.warn(
    "[seed-analytics] Registry synchronization did not complete; inactive sweep was not applied:",
    String(error).split("\n")[0],
  );
  process.exit(0);
});

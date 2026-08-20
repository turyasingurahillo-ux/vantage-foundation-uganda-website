/**
 * Build-time seeding of the analytics_articles registry.
 *
 * Reads all published stories (both static-manifest stories from
 * content/stories.ts and database stories) and upserts registry rows so the
 * admin dashboard performance table lists every trackable article — including
 * those with zero views — from the first deployment.
 *
 * Run by migrate-on-build.mjs after the schema migration. Non-fatal: a
 * database blip must not break a deployment of a mostly-static site.
 *
 * DEPLOYMENT SAFETY: migrate-on-build.mjs gates this script on VERCEL_ENV to
 * prevent preview builds from seeding the shared production database. Manual
 * runs (local/CI) always proceed — ensure DATABASE_URL points to the intended
 * database before running manually.
 *
 * Usage: npx tsx scripts/seed-analytics-registry.ts
 */
import { getPublishedStories } from "@/content/stories";
import { getStories } from "@/lib/db/stories";
import { upsertAnalyticsArticle } from "@/lib/db/analytics-articles";
import type { PublishedStoryRef } from "@/lib/stories-public";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("[seed-analytics] DATABASE_URL not set — skipping registry seed.");
    process.exit(0);
  }

  const refs: PublishedStoryRef[] = [];

  // Static-manifest stories (always available, no DB needed).
  for (const story of getPublishedStories()) {
    refs.push({
      slug: story.slug,
      title: story.title,
      category: story.category,
      source: "static",
      publishedDate: story.date,
    });
  }

  // Database stories (published only). Wrapped in try/catch so a DB blip
  // doesn't prevent static stories from being seeded.
  try {
    const dbStories = await getStories({ published: true });
    for (const row of dbStories) {
      refs.push({
        slug: row.slug,
        title: row.title,
        category: row.category,
        source: "db",
        dbId: row.id,
        publishedDate: row.date,
      });
    }
  } catch (e) {
    console.warn("[seed-analytics] Could not read DB stories — seeding static only:", String(e).split("\n")[0]);
  }

  let seeded = 0;
  for (const ref of refs) {
    try {
      await upsertAnalyticsArticle(ref);
      seeded++;
    } catch (e) {
      console.warn(`[seed-analytics] Failed to seed "${ref.slug}":`, String(e).split("\n")[0]);
    }
  }

  console.log(`[seed-analytics] Seeded ${seeded}/${refs.length} articles into analytics_articles registry.`);
}

main().catch((error) => {
  console.warn("[seed-analytics] Registry seeding did not complete:", String(error).split("\n")[0]);
  // Non-fatal — the build continues.
  process.exit(0);
});

import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { getCsrfTokenFromRequest } from "@/lib/csrf";
import { getStoryById } from "@/lib/db/stories";
import { getAnalyticsArticleBySlug } from "@/lib/db/analytics-articles";
import { Container } from "@/components/shared/Container";
import { ArticleAnalyticsDetail } from "@/components/admin/ArticleAnalyticsDetail";
import { StoryEditorForm } from "@/components/admin/stories/StoryEditorForm";

export const metadata: Metadata = {
  title: "Article analytics",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminArticleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id: idParam } = await params;
  const { tab } = await searchParams;
  const cookieStore = await cookies();
  if (!verifySessionToken(cookieStore.get(sessionCookieName)?.value)) {
    redirect("/admin/login");
  }
  const csrfToken = await getCsrfTokenFromRequest();
  const storyId = Number(idParam);
  if (!Number.isFinite(storyId) || storyId <= 0) notFound();

  let story = null;
  let dbError = "";
  try {
    story = await getStoryById(storyId);
  } catch {
    dbError =
      "Could not load the article. Check that DATABASE_URL is set and the stories table exists.";
  }
  if (!dbError && !story) notFound();

  // This route remains editorial-story-ID based. Analytics use a separate
  // identity and must be resolved through the public slug -> registry row.
  let analyticsArticle = null;
  let analyticsRegistryError = "";
  if (story) {
    try {
      analyticsArticle = await getAnalyticsArticleBySlug(story.slug);
    } catch {
      analyticsRegistryError =
        "Could not load this story's analytics registry record.";
    }
  }

  const activeTab = tab === "edit" ? "edit" : "analytics";

  return (
    <section className="py-12 md:py-16">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/admin/stories"
              className="text-sm font-semibold text-primary hover:underline"
            >
              ← Back to Stories &amp; Insights
            </Link>
            {story && (
              <>
                <h1 className="mt-2 text-2xl font-bold">{story.title}</h1>
                <p className="text-sm text-muted-foreground">
                  /stories/{story.slug} · {story.category}
                </p>
              </>
            )}
          </div>
        </div>

        {dbError && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900"
          >
            {dbError}
          </p>
        )}

        {story && (
          <>
            <div className="mt-6 flex gap-1 border-b border-border">
              <Link
                href={`/admin/stories/${story.id}?tab=analytics`}
                className={`border-b-2 px-4 py-2 text-sm font-semibold ${
                  activeTab === "analytics"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Analytics
              </Link>
              <Link
                href={`/admin/stories/${story.id}?tab=edit`}
                className={`border-b-2 px-4 py-2 text-sm font-semibold ${
                  activeTab === "edit"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Edit / Content
              </Link>
              <a
                href={`/stories/${story.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="border-b-2 border-transparent px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                Preview ↗
              </a>
            </div>

            <div className="mt-6">
              {activeTab === "analytics" ? (
                analyticsRegistryError ? (
                  <p
                    role="alert"
                    className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900"
                  >
                    {analyticsRegistryError}
                  </p>
                ) : analyticsArticle ? (
                  <ArticleAnalyticsDetail articleId={analyticsArticle.id} />
                ) : (
                  <div className="rounded-xl border border-dashed border-border bg-surface p-6">
                    <h2 className="font-semibold">No analytics registry record</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      This editorial story does not currently have an analytics
                      identity. Analytics are not queried with the story ID.
                    </p>
                  </div>
                )
              ) : (
                <StoryEditorForm csrfToken={csrfToken} story={story} />
              )}
            </div>
          </>
        )}
      </Container>
    </section>
  );
}

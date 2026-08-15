import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { getCsrfTokenFromRequest, CSRF_FIELD_NAME } from "@/lib/csrf";
import { getStoryById } from "@/lib/db/stories";
import { Container } from "@/components/shared/Container";
import { ArticleAnalyticsDetail } from "@/components/admin/ArticleAnalyticsDetail";
import { ArticleEditorForm } from "@/components/admin/ArticleEditorForm";

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
  const articleId = Number(idParam);
  if (!Number.isFinite(articleId) || articleId <= 0) notFound();

  let story = null;
  let dbError = "";
  try {
    story = await getStoryById(articleId);
  } catch {
    dbError = "Could not load the article. Check that DATABASE_URL is set and the stories table exists.";
  }
  if (!dbError && !story) notFound();

  const activeTab = tab === "edit" ? "edit" : "analytics";

  return (
    <section className="py-12 md:py-16">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/admin/stories" className="text-sm font-semibold text-primary hover:underline">← Back to Stories &amp; Insights</Link>
            {story && (
              <>
                <h1 className="mt-2 text-2xl font-bold">{story.title}</h1>
                <p className="text-sm text-muted-foreground">/stories/{story.slug} · {story.category}</p>
              </>
            )}
          </div>
          <nav className="flex gap-2" aria-label="Admin navigation">
            <Link href="/admin/donations" className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold">Donations</Link>
            <Link href="/admin/media" className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold">Media</Link>
            <Link href="/admin/audit" className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold">Audit</Link>
            <form method="post" action="/api/admin/logout" className="inline">
              <input type="hidden" name={CSRF_FIELD_NAME} value={csrfToken} />
              <button type="submit" className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold">Log out</button>
            </form>
          </nav>
        </div>

        {dbError && <p role="alert" className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">{dbError}</p>}

        {story && (
          <>
            {/* Tabs */}
            <div className="mt-6 flex gap-1 border-b border-border">
              <Link
                href={`/admin/stories/${story.id}?tab=analytics`}
                className={`border-b-2 px-4 py-2 text-sm font-semibold ${activeTab === "analytics" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                Analytics
              </Link>
              <Link
                href={`/admin/stories/${story.id}?tab=edit`}
                className={`border-b-2 px-4 py-2 text-sm font-semibold ${activeTab === "edit" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
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
                <ArticleAnalyticsDetail articleId={story.id} />
              ) : (
                <ArticleEditorForm csrfToken={csrfToken} story={story} />
              )}
            </div>
          </>
        )}
      </Container>
    </section>
  );
}

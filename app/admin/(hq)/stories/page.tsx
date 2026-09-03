import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { getCsrfTokenFromRequest } from "@/lib/csrf";
import { getStories } from "@/lib/db/stories";
import { getPublishedStories } from "@/content/stories";
import { Container } from "@/components/shared/Container";
import { StoriesWorkspace } from "@/components/admin/stories/StoriesWorkspace";

export const metadata: Metadata = {
  title: "Stories & Insights",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminStoriesPage() {
  const cookieStore = await cookies();
  if (!verifySessionToken(cookieStore.get(sessionCookieName)?.value)) redirect("/admin/login");
  const csrfToken = await getCsrfTokenFromRequest();
  let items: Awaited<ReturnType<typeof getStories>> = [];
  let dbError = "";
  try {
    items = await getStories();
  } catch {
    dbError = "Could not load Stories & Insights. Run the database setup so the stories table exists.";
  }

  // Static stories are always available from the code manifest.
  const staticStories = getPublishedStories().map((s) => ({
    slug: s.slug,
    title: s.title,
    category: s.category,
    author: s.author ?? null,
    date: s.date,
  }));

  return (
    <section className="py-12 md:py-16">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Stories &amp; Insights</h1>
            <p className="text-sm text-muted-foreground">
              Write, edit, schedule and publish the public Stories &amp; Insights content.
            </p>
          </div>
          <Link
            href="/admin/analytics"
            className="text-sm font-semibold text-primary hover:underline"
          >
            View analytics →
          </Link>
        </div>
        {dbError && (
          <p role="alert" className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
            {dbError}
          </p>
        )}
        <StoriesWorkspace
          csrfToken={csrfToken}
          initialItems={items}
          staticStories={staticStories}
        />
      </Container>
    </section>
  );
}

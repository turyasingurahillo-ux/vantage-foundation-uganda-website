import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { getCsrfTokenFromRequest } from "@/lib/csrf";
import { getStories } from "@/lib/db/stories";
import { Container } from "@/components/shared/Container";
import { StoriesManager } from "@/components/admin/StoriesManager";

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
  return (
    <section className="py-12 md:py-16">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Stories & Insights</h1>
            <p className="text-sm text-muted-foreground">Write, edit, schedule and publish the public Stories & Insights content.</p>
          </div>
          <nav className="flex gap-2" aria-label="Admin navigation">
            <Link href="/admin/donations" className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold">Donations</Link>
            <Link href="/admin/media" className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold">Media library</Link>
            <Link href="/admin/audit" className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold">Audit log</Link>
          </nav>
        </div>
        {dbError && <p role="alert" className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">{dbError}</p>}
        <StoriesManager csrfToken={csrfToken} initialItems={items} />
      </Container>
    </section>
  );
}

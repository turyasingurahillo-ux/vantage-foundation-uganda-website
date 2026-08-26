import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { getStories } from "@/lib/db/stories";
import { Container } from "@/components/shared/Container";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";

export const metadata: Metadata = {
  title: "Analytics",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const cookieStore = await cookies();
  if (!verifySessionToken(cookieStore.get(sessionCookieName)?.value)) redirect("/admin/login");

  // Load DB stories so the analytics dashboard can resolve editorial stories
  // for row actions. If the DB is unavailable, the analytics dashboard
  // shows its own database-unavailable state.
  let items: Awaited<ReturnType<typeof getStories>> = [];
  try {
    items = await getStories();
  } catch {
    // AnalyticsDashboard handles the db-unavailable case internally.
  }

  return (
    <section className="py-12 md:py-16">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Foundation-wide content performance, traffic sources, and Search Console insights.
            </p>
          </div>
          <Link
            href="/admin/stories"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Manage stories →
          </Link>
        </div>

        {/* The AnalyticsDashboard is rendered standalone.
            Edit/delete actions use link-based navigation to /admin/stories/[id]
            rather than in-place callbacks, since this is a separate route. */}
        <AnalyticsDashboard stories={items} />
      </Container>
    </section>
  );
}

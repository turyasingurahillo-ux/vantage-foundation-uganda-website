import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  MessageSquare,
  Wallet,
  FileText,
  Image as ImageIcon,
  ArrowRight,
} from "lucide-react";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { getDashboardAttention, getRecentActivity } from "@/lib/db/dashboard";
import { getAdmins } from "@/lib/db/admins";
import { Container } from "@/components/shared/Container";
import { ContentPerformanceCard } from "@/components/admin/ContentPerformanceCard";
import { PageHeader } from "@/components/admin/hq/PageHeader";
import { AttentionCard } from "@/components/admin/hq/AttentionCard";
import { QuickAction } from "@/components/admin/hq/QuickAction";
import { ActivityFeed } from "@/components/admin/hq/ActivityFeed";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  if (!verifySessionToken(cookieStore.get(sessionCookieName)?.value)) {
    redirect("/admin/login");
  }

  // Attention counts — each source degrades gracefully to 0 if the DB
  // or a specific table is unavailable.
  const { attention, sources } = await getDashboardAttention().catch(() => ({
    attention: {
      pendingDonations: 0,
      newMessages: 0,
      awaitingResponseMessages: 0,
      draftStories: 0,
      mediaPendingConsent: 0,
    },
    sources: {
      donations: false,
      contactMessages: false,
      stories: false,
      media: false,
    },
  }));

  // Recent activity from the audit log.
  let activityEntries: Awaited<ReturnType<typeof getRecentActivity>> = [];
  let adminNames: Record<string, string> = {};
  try {
    [activityEntries, adminNames] = await Promise.all([
      getRecentActivity(8),
      getAdmins()
        .then((admins) =>
          Object.fromEntries(admins.map((a) => [String(a.id), a.username])),
        )
        .catch(() => ({})),
    ]);
  } catch {
    // Activity feed is a nice-to-have; show empty state if unavailable.
  }

  const hasAttention =
    attention.pendingDonations > 0 ||
    attention.newMessages > 0 ||
    attention.awaitingResponseMessages > 0 ||
    attention.draftStories > 0 ||
    attention.mediaPendingConsent > 0;

  return (
    <Container>
      <PageHeader
        title="Vantage HQ"
        description="Overview of activity requiring attention."
      />

      {/* ATTENTION */}
      <section aria-labelledby="attention-heading" className="mt-8">
        <h2
          id="attention-heading"
          className="text-lg font-semibold text-foreground"
        >
          {hasAttention ? "Needs attention" : "All clear"}
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {hasAttention
            ? "Items below are waiting for an administrator to act."
            : "Nothing is waiting for you right now."}
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <AttentionCard
            href="/admin/donations?status=pending"
            label="Pending donations"
            description="Awaiting verification against the bank statement"
            count={attention.pendingDonations}
            urgent={attention.pendingDonations > 0}
            unavailable={!sources.donations}
            countLabel={`${attention.pendingDonations} pending`}
          />
          <AttentionCard
            href="/admin/messages?filter=new"
            label="New messages"
            description="Contact enquiries that nobody has actioned yet"
            count={attention.newMessages}
            urgent={attention.newMessages > 0}
            unavailable={!sources.contactMessages}
            countLabel={`${attention.newMessages} new`}
          />
          <AttentionCard
            href="/admin/messages?filter=awaiting_response"
            label="Awaiting response"
            description="Conversations waiting for a reply to be sent"
            count={attention.awaitingResponseMessages}
            urgent={attention.awaitingResponseMessages > 0}
            unavailable={!sources.contactMessages}
            countLabel={`${attention.awaitingResponseMessages} awaiting`}
          />
          <AttentionCard
            href="/admin/stories"
            label="Draft stories"
            description="Stories saved but not yet published"
            count={attention.draftStories}
            urgent={attention.draftStories > 0}
            unavailable={!sources.stories}
            countLabel={`${attention.draftStories} drafts`}
          />
          <AttentionCard
            href="/admin/media"
            label="Media awaiting consent"
            description="Uploaded photos pending consent classification"
            count={attention.mediaPendingConsent}
            urgent={attention.mediaPendingConsent > 0}
            unavailable={!sources.media}
            countLabel={`${attention.mediaPendingConsent} pending consent`}
          />
        </div>
      </section>

      {/* QUICK ACTIONS + RECENT ACTIVITY */}
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="quick-actions-heading">
          <h2
            id="quick-actions-heading"
            className="text-lg font-semibold text-foreground"
          >
            Quick actions
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <QuickAction
              href="/admin/donations?status=pending"
              label="Review donations"
              description="Verify pending donor submissions"
              icon={Wallet}
            />
            <QuickAction
              href="/admin/messages?filter=new"
              label="Open inbox"
              description="Read and reply to contact enquiries"
              icon={MessageSquare}
            />
            <QuickAction
              href="/admin/stories"
              label="Write story"
              description="Create or publish a Stories & Insights entry"
              icon={FileText}
            />
            <QuickAction
              href="/admin/media"
              label="Upload media"
              description="Add photos or documents to the library"
              icon={ImageIcon}
            />
          </div>
        </section>

        <section aria-labelledby="recent-activity-heading">
          <div className="flex items-center justify-between">
            <h2
              id="recent-activity-heading"
              className="text-lg font-semibold text-foreground"
            >
              Recent activity
            </h2>
            <a
              href="/admin/audit"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-white p-2">
            <ActivityFeed entries={activityEntries} adminNames={adminNames} />
          </div>
        </section>
      </div>

      {/* CONTENT PERFORMANCE */}
      <section aria-labelledby="performance-heading" className="mt-10">
        <h2
          id="performance-heading"
          className="text-lg font-semibold text-foreground"
        >
          Content performance
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          This month&apos;s content KPIs and top performing article.
        </p>
        <div className="mt-4">
          <ContentPerformanceCard />
        </div>
      </section>
    </Container>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  MessageSquare,
  Wallet,
  FileText,
  Image as ImageIcon,
  ArrowRight,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import {
  getDashboardAttention,
  getDashboardUpcomingActions,
  getRecentActivity,
} from "@/lib/db/dashboard";
import { getAdmins } from "@/lib/db/admins";
import { Container } from "@/components/shared/Container";
import { ContentPerformanceCard } from "@/components/admin/ContentPerformanceCard";
import { PageHeader } from "@/components/admin/hq/PageHeader";
import { AttentionCard } from "@/components/admin/hq/AttentionCard";
import { QuickAction } from "@/components/admin/hq/QuickAction";
import { ActivityFeed } from "@/components/admin/hq/ActivityFeed";
import { UpcomingActionsList } from "@/components/admin/hq/UpcomingActionsList";

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
      untriagedCases: 0,
      awaitingVantageCases: 0,
      overdueCases: 0,
      safeguardingCases: 0,
      highPriorityCases: 0,
      activeCases: 0,
      referralFollowupsDue: 0,
      dueDiligenceConcerns: 0,
    },
    sources: {
      donations: false,
      contactMessages: false,
      stories: false,
      media: false,
      cases: false,
      referrals: false,
      dueDiligence: false,
    },
  }));

  // Upcoming/overdue actions for the case pipeline.
  const { actions: upcomingActions, available: upcomingAvailable } =
    await getDashboardUpcomingActions().catch(() => ({
      actions: { overdue: [], today: [], upcoming: [] },
      available: false,
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
    attention.mediaPendingConsent > 0 ||
    attention.untriagedCases > 0 ||
    attention.awaitingVantageCases > 0 ||
    attention.overdueCases > 0 ||
    attention.safeguardingCases > 0 ||
    attention.highPriorityCases > 0 ||
    attention.referralFollowupsDue > 0 ||
    attention.dueDiligenceConcerns > 0;

  return (
    <Container>
      <PageHeader
        title="Vantage HQ"
        description="Overview of activity requiring attention."
      />

      {/* ATTENTION — Case pipeline + legacy attention */}
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

        {/* Case pipeline attention cards */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <AttentionCard
            href="/admin/messages?filter=new"
            label="Untriaged"
            description="New cases needing triage"
            count={attention.untriagedCases}
            urgent={attention.untriagedCases > 0}
            unavailable={!sources.cases}
            countLabel={`${attention.untriagedCases} untriaged`}
          />
          <AttentionCard
            href="/admin/messages?filter=awaiting_vantage"
            label="Awaiting Vantage"
            description="Cases waiting on Vantage to act"
            count={attention.awaitingVantageCases}
            urgent={attention.awaitingVantageCases > 0}
            unavailable={!sources.cases}
            countLabel={`${attention.awaitingVantageCases} awaiting`}
          />
          <AttentionCard
            href="/admin/messages?filter=overdue"
            label="Overdue"
            description="Next-action due dates passed"
            count={attention.overdueCases}
            urgent={attention.overdueCases > 0}
            unavailable={!sources.cases}
            countLabel={`${attention.overdueCases} overdue`}
          />
          <AttentionCard
            href="/admin/messages?filter=safeguarding"
            label="Safeguarding"
            description="Safeguarding concerns"
            count={attention.safeguardingCases}
            urgent={attention.safeguardingCases > 0}
            unavailable={!sources.cases}
            countLabel={`${attention.safeguardingCases} safeguarding`}
          />
          <AttentionCard
            href="/admin/messages?filter=high_priority"
            label="High priority"
            description="Critical or high priority cases"
            count={attention.highPriorityCases}
            urgent={attention.highPriorityCases > 0}
            unavailable={!sources.cases}
            countLabel={`${attention.highPriorityCases} high priority`}
          />
          <AttentionCard
            href="/admin/messages?filter=active"
            label="Active cases"
            description="All cases in the active pipeline"
            count={attention.activeCases}
            urgent={false}
            unavailable={!sources.cases}
            countLabel={`${attention.activeCases} active`}
          />
          <AttentionCard
            href="/admin/messages?filter=active"
            label="Referral follow-ups due"
            description="Referrals with follow-up dates due within 7 days"
            count={attention.referralFollowupsDue}
            urgent={attention.referralFollowupsDue > 0}
            unavailable={!sources.referrals}
            countLabel={`${attention.referralFollowupsDue} due`}
          />
          <AttentionCard
            href="/admin/organisations"
            label="Due-diligence concerns"
            description="Organisations with failed or concerning checks"
            count={attention.dueDiligenceConcerns}
            urgent={attention.dueDiligenceConcerns > 0}
            unavailable={!sources.dueDiligence}
            countLabel={`${attention.dueDiligenceConcerns} concerns`}
          />
        </div>

        {/* Legacy attention cards */}
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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

      {/* UPCOMING ACTIONS */}
      <section aria-labelledby="upcoming-heading" className="mt-8">
        <h2
          id="upcoming-heading"
          className="text-lg font-semibold text-foreground"
        >
          Upcoming actions
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Next actions due on active cases — overdue, today and this week.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <UpcomingActionsList
            title="Overdue"
            icon={AlertTriangle}
            actions={upcomingActions.overdue}
            available={upcomingAvailable}
            variant="overdue"
          />
          <UpcomingActionsList
            title="Today"
            icon={Clock}
            actions={upcomingActions.today}
            available={upcomingAvailable}
            variant="today"
          />
          <UpcomingActionsList
            title="This week"
            icon={ArrowRight}
            actions={upcomingActions.upcoming}
            available={upcomingAvailable}
            variant="upcoming"
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
              label="Open cases"
              description="Triage new enquiries and manage the pipeline"
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
            <QuickAction
              href="/admin/analytics/service"
              label="Service performance"
              description="Response times, triage and case-flow metrics"
              icon={Clock}
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

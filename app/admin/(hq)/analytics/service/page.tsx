import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import {
  getSlaSummary,
  getSlaByCaseType,
  getReferralAnalyticsSummary,
  type SlaPeriod,
} from "@/lib/db/case-history";
import { getCaseTypeLabel } from "@/lib/case-types";
import { Container } from "@/components/shared/Container";
import { PageHeader } from "@/components/admin/hq/PageHeader";

export const metadata: Metadata = {
  title: "Service Performance",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatDuration(ms: number | null): string {
  if (ms == null) return "—";
  const hours = ms / (1000 * 60 * 60);
  if (hours < 1) return `${Math.round(ms / (1000 * 60))}m`;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  const days = hours / 24;
  return `${days.toFixed(1)}d`;
}

function isSlaPeriod(value: string): value is SlaPeriod {
  return value === "30d" || value === "90d" || value === "all";
}

export default async function ServicePerformancePage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const cookieStore = await cookies();
  if (!verifySessionToken(cookieStore.get(sessionCookieName)?.value)) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const period: SlaPeriod = isSlaPeriod(params.period ?? "")
    ? (params.period as SlaPeriod)
    : "90d";

  const [summary, byCaseType, referralSummary] = await Promise.all([
    getSlaSummary(period).catch(() => null),
    getSlaByCaseType(period).catch(() => []),
    getReferralAnalyticsSummary().catch(() => null),
  ]);

  const withinTargetPercent =
    summary && summary.respondedCount > 0
      ? Math.round((summary.withinTargetCount / summary.respondedCount) * 100)
      : null;

  return (
    <section className="py-12 md:py-16">
      <Container>
        <PageHeader
          title="Service Performance"
          description="Response times, triage and case-flow metrics. No personal data is exposed here."
        />

        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Period:</span>
          {(["30d", "90d", "all"] as const).map((p) => (
            <Link
              key={p}
              href={`/admin/analytics/service?period=${p}`}
              className={`rounded-md px-3 py-1 text-sm font-medium ${
                period === p
                  ? "bg-primary text-primary-fg"
                  : "border border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {p === "30d" ? "Last 30 days" : p === "90d" ? "Last 90 days" : "All time"}
            </Link>
          ))}
        </div>

        {/* Legacy data warning */}
        <div className="mt-6 rounded-md border border-warning-border bg-warning-bg px-4 py-3 text-sm text-warning-fg">
          <p>
            <strong>Note:</strong> SLA metrics depend on timestamps that were not
            always recorded for historical cases (before the case-management
            pipeline was introduced). Cases created before that migration may
            lack <code>first_response_at</code> and <code>triaged_at</code> values.
            Metrics here reflect only cases with recorded timestamps and should
            not be treated as authoritative for periods before the pipeline existed.
          </p>
        </div>

        {/* Summary cards */}
        {summary ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Median first response
              </p>
              <p className="mt-1 text-2xl font-bold">
                {formatDuration(summary.medianFirstResponseMs)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {summary.respondedCount} of {summary.sampleSize} cases responded
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Average first response
              </p>
              <p className="mt-1 text-2xl font-bold">
                {formatDuration(summary.averageFirstResponseMs)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Across {summary.respondedCount} responded cases
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Within target (2 days)
              </p>
              <p className="mt-1 text-2xl font-bold">
                {withinTargetPercent != null ? `${withinTargetPercent}%` : "—"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {summary.withinTargetCount} of {summary.respondedCount} responded
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Sample size
              </p>
              <p className="mt-1 text-2xl font-bold">{summary.sampleSize}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {summary.periodLabel}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-lg border border-border p-6 text-center text-sm text-muted-foreground">
            SLA data is currently unavailable. This may indicate the database is
            not configured or the case-management migration has not been applied.
          </div>
        )}

        {/* Case-flow status */}
        {summary && (
          <div className="mt-6 rounded-lg border border-border p-6">
            <h2 className="mb-4 text-lg font-semibold">Case flow status</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">Untriaged</p>
                <p className="text-xl font-bold">{summary.untriagedCount}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">Overdue active</p>
                <p className="text-xl font-bold">{summary.overdueCount}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">Awaiting Vantage</p>
                <p className="text-xl font-bold">{summary.awaitingVantageCount}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">Awaiting external</p>
                <p className="text-xl font-bold">{summary.awaitingExternalCount}</p>
              </div>
            </div>
          </div>
        )}

        {/* SLA by case type */}
        {byCaseType.length > 0 && (
          <div className="mt-6 rounded-lg border border-border p-6">
            <h2 className="mb-4 text-lg font-semibold">By case type</h2>
            <p className="mb-3 text-xs text-muted-foreground">
              Only case types with at least 3 cases are shown. Small samples
              produce statistically meaningless percentages.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Case type</th>
                    <th className="px-3 py-2 text-right font-medium">Cases</th>
                    <th className="px-3 py-2 text-right font-medium">Responded</th>
                    <th className="px-3 py-2 text-right font-medium">Median first response</th>
                    <th className="px-3 py-2 text-right font-medium">Within target</th>
                  </tr>
                </thead>
                <tbody>
                  {byCaseType
                    .filter((r) => r.caseCount >= 3)
                    .map((row) => (
                      <tr
                        key={row.caseType ?? "uncategorised"}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-3 py-2">
                          {row.caseType
                            ? getCaseTypeLabel(row.caseType as never)
                            : "Uncategorised"}
                        </td>
                        <td className="px-3 py-2 text-right">{row.caseCount}</td>
                        <td className="px-3 py-2 text-right">{row.respondedCount}</td>
                        <td className="px-3 py-2 text-right">
                          {formatDuration(row.medianFirstResponseMs)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {row.withinTargetPercent != null
                            ? `${row.withinTargetPercent}%`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {byCaseType.filter((r) => r.caseCount >= 3).length === 0 && (
              <p className="mt-3 text-sm text-muted-foreground">
                No case type has enough cases ({`>= 3`}) in this period to show
                meaningful statistics.
              </p>
            )}
          </div>
        )}

        {/* Referral analytics summary */}
        {referralSummary && referralSummary.totalReferrals > 0 && (
          <div className="mt-6 rounded-lg border border-border p-6">
            <h2 className="mb-4 text-lg font-semibold">Referral outcomes</h2>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">Total referrals</p>
                <p className="text-xl font-bold">{referralSummary.totalReferrals}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">Applied</p>
                <p className="text-xl font-bold">{referralSummary.appliedCount}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">Accepted</p>
                <p className="text-xl font-bold text-success-fg">{referralSummary.acceptedCount}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">Rejected / not eligible</p>
                <p className="text-xl font-bold">
                  {referralSummary.rejectedCount + referralSummary.notEligibleCount}
                </p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">Unknown outcome</p>
                <p className="text-xl font-bold text-muted-foreground">
                  {referralSummary.unknownOutcomeCount}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {referralSummary.openCount} open · {referralSummary.closedCount} closed ·
              {" "}{referralSummary.notAppliedCount} not applied ·
              {" "}{referralSummary.unableToContactCount} unable to contact
            </p>
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/admin"
            className="text-sm font-medium text-primary hover:underline"
          >
            ← Back to dashboard
          </Link>
        </div>
      </Container>
    </section>
  );
}

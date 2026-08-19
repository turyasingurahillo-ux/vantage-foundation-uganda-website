import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ChevronRight } from "lucide-react";
import { getDonations, DonationRow } from "@/lib/db";
import { getDonationCounts } from "@/lib/db/dashboard";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { Container } from "@/components/shared/Container";
import { PageHeader } from "@/components/admin/hq/PageHeader";
import { StatusTabs, type StatusTab } from "@/components/admin/hq/StatusTabs";
import { StatusBadge } from "@/components/admin/hq/StatusBadge";
import { SearchInput } from "@/components/admin/hq/SearchInput";
import { EmptyState } from "@/components/admin/hq/EmptyState";
import { Alert } from "@/components/admin/hq/Alert";
import { DonationCard } from "@/components/admin/hq/DonationCard";
import { formatMoneyCompact, formatDateTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Donations",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type StatusFilter = "pending" | "verified" | "rejected" | "all";

function isStatus(value: string | undefined): value is StatusFilter {
  return value === "pending" || value === "verified" || value === "rejected" || value === "all";
}

const EMPTY_STATE_MESSAGES: Record<StatusFilter, { title: string; description: string }> = {
  pending: {
    title: "No donations are waiting for verification",
    description: "New donor submissions will appear here for review.",
  },
  verified: {
    title: "No verified donations yet",
    description: "Verified donations will appear here as historical records.",
  },
  rejected: {
    title: "No rejected donations",
    description: "Rejected donations will appear here as historical records.",
  },
  all: {
    title: "No donations recorded yet",
    description: "Donations submitted through the public form will appear here.",
  },
};

export default async function AdminDonationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    q?: string;
    updated?: string;
    error?: string;
    noop?: string;
  }>;
}) {
  const params = await searchParams;
  const status: StatusFilter = isStatus(params.status) ? params.status : "pending";
  const query = params.q?.trim() ?? "";
  const { updated, error, noop } = params;

  const cookieStore = await cookies();
  if (!verifySessionToken(cookieStore.get(sessionCookieName)?.value)) {
    redirect("/admin/login");
  }

  // Fetch counts and donations in parallel. Counts drive the tab badges;
  // donations drive the list. Both degrade gracefully on DB errors.
  let donations: DonationRow[] = [];
  let counts = { pending: 0, verified: 0, rejected: 0, all: 0 };
  let dbError = false;

  try {
    [donations, counts] = await Promise.all([
      getDonations(),
      getDonationCounts().catch(() => counts),
    ]);
  } catch {
    dbError = true;
  }

  // Filter by status tab.
  const filtered = donations.filter((d) =>
    status === "all" ? true : d.status === status,
  );

  // Filter by search query across donor, reference, campaign, and id.
  const searched = query
    ? filtered.filter((d) => {
        const haystack = [
          d.name,
          d.email,
          d.campaign,
          d.transactionReference ?? "",
          `#${d.id}`,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(query.toLowerCase());
      })
    : filtered;

  // Build tab definitions with counts.
  const tabs: StatusTab[] = [
    {
      label: "Pending",
      params: "status=pending",
      active: status === "pending",
      count: counts.pending,
    },
    {
      label: "Verified",
      params: "status=verified",
      active: status === "verified",
      count: counts.verified,
    },
    {
      label: "Rejected",
      params: "status=rejected",
      active: status === "rejected",
      count: counts.rejected,
    },
    {
      label: "All",
      params: "status=all",
      active: status === "all",
      count: counts.all,
    },
  ];

  // Preserve the current status in the search form.
  const searchHiddenFields = [{ name: "status", value: status }];
  const searchAction = "/admin/donations";

  const emptyState = EMPTY_STATE_MESSAGES[status];

  return (
    <Container>
      <PageHeader
        title="Donations"
        description="Verify each donation against the official bank statement before marking it successful."
      />

      {/* Flash messages */}
      {(updated || noop || error) && (
        <div className="mt-4 space-y-2">
          {updated && (
            <Alert variant="success">
              Donation status updated successfully.
            </Alert>
          )}
          {noop && (
            <Alert variant="info">
              No changes were needed — the status was already set.
            </Alert>
          )}
          {error && (
            <Alert variant="error">
              Could not update donation status.{" "}
              {error === "invalid" && "Invalid input."}{" "}
              {error === "db" && "Database error."}{" "}
              {error === "notfound" && "Donation not found."}{" "}
              {error === "rate-limited" &&
                "Too many requests. Please wait a minute."}{" "}
              {error === "csrf" &&
                "Security check failed. Please reload the page."}
            </Alert>
          )}
        </div>
      )}

      {dbError && (
        <Alert variant="warning" className="mt-4">
          Could not load donations. Please check that the database is
          configured correctly.
        </Alert>
      )}

      {/* Status tabs */}
      <div className="mt-6">
        <StatusTabs tabs={tabs} basePath="/admin/donations" />
      </div>

      {/* Search */}
      <div className="mt-4 max-w-md">
        <SearchInput
          action={searchAction}
          hiddenFields={searchHiddenFields}
          defaultValue={query}
          placeholder="Search donor, reference, campaign, or ID…"
          ariaLabel="Search donations"
        />
      </div>

      {/* Results count */}
      <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
        {searched.length} {searched.length === 1 ? "donation" : "donations"}
        {status !== "all" && ` · ${status}`}
        {query && ` · matching "${query}"`}
      </p>

      {/* Donation list */}
      <div className="mt-4">
        {searched.length === 0 && !dbError ? (
          query ? (
            <EmptyState
              title="No donations match these filters"
              description={`Try a different search term or clear the search to see all ${status} donations.`}
            />
          ) : (
            <EmptyState
              title={emptyState.title}
              description={emptyState.description}
            />
          )
        ) : (
          <>
            {/* Desktop table — hidden on mobile, cards shown instead */}
            <div className="hidden overflow-hidden rounded-xl border border-border bg-white shadow-sm md:block">
              <table className="min-w-full divide-y divide-border">
                <caption className="sr-only">
                  Donations queue — {status} tab
                </caption>
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Donor
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Amount
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Campaign
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Reference
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Date
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {searched.map((donation) => (
                    <tr key={donation.id} className="align-top hover:bg-surface">
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-foreground">
                          {donation.name}
                        </div>
                        <div className="text-muted-foreground">
                          {donation.email}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold tabular-nums text-foreground">
                        {formatMoneyCompact(donation.amount, donation.currency)}
                        <div className="text-xs font-normal text-muted-foreground">
                          {donation.frequency}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {donation.campaign}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {donation.transactionReference || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                        {formatDateTime(donation.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <StatusBadge status={donation.status} />
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Link
                          href={`/admin/donations/${donation.id}`}
                          className="inline-flex items-center gap-1 rounded-lg font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        >
                          Review
                          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards — shown below md breakpoint */}
            <div className="grid gap-3 md:hidden">
              {searched.map((donation) => (
                <DonationCard key={donation.id} donation={donation} />
              ))}
            </div>
          </>
        )}
      </div>
    </Container>
  );
}

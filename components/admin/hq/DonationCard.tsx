import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { DonationRow } from "@/lib/db";
import { formatMoneyCompact, formatDateTime } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";

interface DonationCardProps {
  donation: DonationRow;
}

/**
 * Mobile record card for a single donation.
 *
 * Shows donor, amount, campaign/reference, date, status, and a Review
 * action. Touch targets are ≥44px (the Review link has min-h-[44px]).
 */
export function DonationCard({ donation }: DonationCardProps) {
  return (
    <Link
      href={`/admin/donations/${donation.id}`}
      className="block rounded-xl border border-border bg-white p-4 transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-medium text-foreground">{donation.name}</div>
          <div className="mt-0.5 text-sm text-muted-foreground">
            {donation.email}
          </div>
        </div>
        <StatusBadge status={donation.status} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="font-semibold tabular-nums text-foreground">
          {formatMoneyCompact(donation.amount, donation.currency)}
        </span>
        <span className="text-xs text-muted-foreground">
          {donation.frequency}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <span>{donation.campaign}</span>
        {donation.transactionReference && (
          <span className="truncate">
            Ref: {donation.transactionReference}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
        <time
          dateTime={new Date(donation.createdAt).toISOString()}
          className="text-xs text-muted-foreground"
        >
          {formatDateTime(donation.createdAt)}
        </time>
        <span className="inline-flex min-h-[44px] items-center gap-1 rounded-lg px-3 text-sm font-semibold text-primary">
          Review
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

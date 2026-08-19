import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import { ArrowLeft, Check, X } from "lucide-react";
import { getDonationById } from "@/lib/db";
import { getCsrfTokenFromRequest, CSRF_FIELD_NAME } from "@/lib/csrf";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { Container } from "@/components/shared/Container";
import { PageHeader } from "@/components/admin/hq/PageHeader";
import { StatusBadge } from "@/components/admin/hq/StatusBadge";
import { Alert } from "@/components/admin/hq/Alert";
import { formatMoney, formatDateTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Donation Review",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border py-3 sm:flex-row sm:gap-4 sm:py-2.5">
      <dt className="w-40 shrink-0 text-sm font-medium text-muted-foreground">
        {label}
      </dt>
      <dd
        className={`text-sm text-foreground ${mono ? "font-mono text-xs" : ""}`}
      >
        {value || "—"}
      </dd>
    </div>
  );
}

export default async function DonationReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  const cookieStore = await cookies();
  if (!verifySessionToken(cookieStore.get(sessionCookieName)?.value)) {
    redirect("/admin/login");
  }

  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  let donation: Awaited<ReturnType<typeof getDonationById>> = null;
  let dbError = false;
  try {
    donation = await getDonationById(id);
  } catch {
    dbError = true;
  }

  if (!dbError && !donation) {
    notFound();
  }

  const csrfToken = await getCsrfTokenFromRequest();
  const isPending = donation?.status === "pending";
  const isVerified = donation?.status === "verified";
  const isRejected = donation?.status === "rejected";

  return (
    <Container>
      {/* Back link */}
      <Link
        href="/admin/donations"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to donations
      </Link>

      {dbError && (
        <Alert variant="warning" className="mt-4">
          Could not load this donation. Please check that the database is
          configured correctly.
        </Alert>
      )}

      {donation && (
        <>
          <PageHeader
            title={`Donation #${donation.id}`}
            description="Review the donation details and verify or reject against the bank statement."
            actions={<StatusBadge status={donation.status} />}
          />

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* Donation details — spans 2 columns on desktop */}
            <section
              aria-labelledby="details-heading"
              className="lg:col-span-2"
            >
              <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
                <h2
                  id="details-heading"
                  className="text-lg font-semibold text-foreground"
                >
                  Donation details
                </h2>
                <dl className="mt-4">
                  <DetailRow label="Donor" value={donation.name} />
                  <DetailRow label="Email" value={donation.email} />
                  <DetailRow label="Phone" value={donation.phone} />
                  <DetailRow
                    label="Amount"
                    value={
                      <span className="font-semibold tabular-nums">
                        {formatMoney(donation.amount, donation.currency)}
                      </span>
                    }
                  />
                  <DetailRow label="Frequency" value={donation.frequency} />
                  <DetailRow label="Campaign" value={donation.campaign} />
                  <DetailRow
                    label="Reference"
                    value={donation.transactionReference}
                    mono
                  />
                  <DetailRow
                    label="Submitted"
                    value={formatDateTime(donation.createdAt)}
                  />
                  <DetailRow
                    label="Last verified"
                    value={
                      donation.verifiedAt
                        ? formatDateTime(donation.verifiedAt)
                        : null
                    }
                  />
                  {donation.message && (
                    <DetailRow label="Donor message" value={donation.message} />
                  )}
                  {donation.adminNotes && (
                    <DetailRow
                      label="Admin notes"
                      value={donation.adminNotes}
                    />
                  )}
                </dl>
              </div>
            </section>

            {/* Actions sidebar */}
            <section aria-labelledby="actions-heading">
              <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
                <h2
                  id="actions-heading"
                  className="text-lg font-semibold text-foreground"
                >
                  Verification
                </h2>

                {isPending && (
                  <>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Confirm this donation against the official bank
                      statement, then verify or reject it.
                    </p>

                    {/* Verify form */}
                    <form
                      method="post"
                      action="/api/admin/verify"
                      className="mt-4 space-y-3"
                    >
                      <input
                        type="hidden"
                        name={CSRF_FIELD_NAME}
                        value={csrfToken}
                      />
                      <input type="hidden" name="id" value={donation.id} />
                      <input type="hidden" name="status" value="verified" />

                      <label
                        className="block text-sm font-medium text-foreground"
                        htmlFor="verify-notes"
                      >
                        Admin notes <span className="text-muted-foreground">(optional)</span>
                      </label>
                      <textarea
                        id="verify-notes"
                        name="adminNotes"
                        rows={3}
                        defaultValue={donation.adminNotes ?? ""}
                        placeholder="e.g. Confirmed against bank statement ref TXN-2026-0819"
                        className="block w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      />

                      <button
                        type="submit"
                        className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-success px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-success/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2"
                      >
                        <Check className="h-4 w-4" aria-hidden="true" />
                        Verify donation
                      </button>
                    </form>

                    {/* Divider */}
                    <div
                      className="my-4 flex items-center gap-3"
                      role="separator"
                    >
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-xs text-muted-foreground">or</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>

                    {/* Reject form */}
                    <form
                      method="post"
                      action="/api/admin/verify"
                      className="space-y-3"
                    >
                      <input
                        type="hidden"
                        name={CSRF_FIELD_NAME}
                        value={csrfToken}
                      />
                      <input type="hidden" name="id" value={donation.id} />
                      <input type="hidden" name="status" value="rejected" />

                      <label
                        className="block text-sm font-medium text-foreground"
                        htmlFor="reject-notes"
                      >
                        Rejection reason <span className="text-muted-foreground">(recommended)</span>
                      </label>
                      <textarea
                        id="reject-notes"
                        name="adminNotes"
                        rows={3}
                        defaultValue={donation.adminNotes ?? ""}
                        placeholder="e.g. No matching transaction found on bank statement"
                        className="block w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      />

                      <button
                        type="submit"
                        className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border-2 border-destructive bg-white px-5 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                        Reject donation
                      </button>
                    </form>
                  </>
                )}

                {isVerified && (
                  <>
                    <p className="mt-2 text-sm text-muted-foreground">
                      This donation has been verified. The record is
                      historical and read-only.
                    </p>
                    {donation.verifiedAt && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Verified on{" "}
                        <time dateTime={new Date(donation.verifiedAt).toISOString()}>
                          {formatDateTime(donation.verifiedAt)}
                        </time>
                        .
                      </p>
                    )}

                    {/* Secondary correction action */}
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded">
                        Need to correct this?
                      </summary>
                      <form
                        method="post"
                        action="/api/admin/verify"
                        className="mt-3 space-y-3"
                      >
                        <input
                          type="hidden"
                          name={CSRF_FIELD_NAME}
                          value={csrfToken}
                        />
                        <input type="hidden" name="id" value={donation.id} />
                        <input type="hidden" name="status" value="rejected" />
                        <label
                          className="block text-sm font-medium text-foreground"
                          htmlFor="correct-notes"
                        >
                          Update notes for this correction
                        </label>
                        <textarea
                          id="correct-notes"
                          name="adminNotes"
                          rows={2}
                          defaultValue={donation.adminNotes ?? ""}
                          className="block w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        />
                        <button
                          type="submit"
                          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border-2 border-destructive bg-white px-5 py-3 text-sm font-semibold text-destructive transition-colors hover:bg-destructive-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                          Mark as rejected
                        </button>
                      </form>
                    </details>
                  </>
                )}

                {isRejected && (
                  <>
                    <p className="mt-2 text-sm text-muted-foreground">
                      This donation was rejected. The record is historical
                      and read-only.
                    </p>

                    {/* Secondary correction action */}
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded">
                        Need to correct this?
                      </summary>
                      <form
                        method="post"
                        action="/api/admin/verify"
                        className="mt-3 space-y-3"
                      >
                        <input
                          type="hidden"
                          name={CSRF_FIELD_NAME}
                          value={csrfToken}
                        />
                        <input type="hidden" name="id" value={donation.id} />
                        <input type="hidden" name="status" value="verified" />
                        <label
                          className="block text-sm font-medium text-foreground"
                          htmlFor="correct-notes-2"
                        >
                          Update notes for this correction
                        </label>
                        <textarea
                          id="correct-notes-2"
                          name="adminNotes"
                          rows={2}
                          defaultValue={donation.adminNotes ?? ""}
                          className="block w-full rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        />
                        <button
                          type="submit"
                          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-success px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-success/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2"
                        >
                          <Check className="h-4 w-4" aria-hidden="true" />
                          Mark as verified
                        </button>
                      </form>
                    </details>
                  </>
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </Container>
  );
}

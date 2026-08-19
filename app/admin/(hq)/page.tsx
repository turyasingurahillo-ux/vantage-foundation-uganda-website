import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { getDonations } from "@/lib/db";
import { getContactMessageCounts } from "@/lib/db/contact";
import { Container } from "@/components/shared/Container";
import { Badge } from "@/components/ui/Badge";
import { ContentPerformanceCard } from "@/components/admin/ContentPerformanceCard";

export const metadata: Metadata = {
  title: "Admin dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  if (!verifySessionToken(cookieStore.get(sessionCookieName)?.value)) {
    redirect("/admin/login");
  }

  // Quick stats for the dashboard: pending donations count.
  let pendingDonations = 0;
  let donationsAvailable = true;
  try {
    const donations = await getDonations();
    pendingDonations = donations.filter((d) => d.status === "pending").length;
  } catch {
    donationsAvailable = false;
  }

  // Contact enquiries. Until SMTP is configured no notification email goes out,
  // so this dashboard is the only place an unanswered enquiry becomes visible.
  let unhandledMessages = 0;
  let notEmailedMessages = 0;
  let contactMessagesAvailable = true;
  try {
    const counts = await getContactMessageCounts();
    unhandledMessages = counts.unhandled;
    notEmailedMessages = counts.notEmailed;
  } catch {
    contactMessagesAvailable = false;
  }

  return (
    <section className="py-12 md:py-16">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Admin dashboard</h1>
            <p className="text-sm text-muted-foreground">Overview of Vantage Foundation Uganda operations.</p>
          </div>

        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Content Performance card */}
          <ContentPerformanceCard />

          {/* Quick actions / status */}
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Operations</h2>
            <div className="mt-4 space-y-3">
              {donationsAvailable ? (
                <Link href="/admin/donations" className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-slate-50">
                  <div>
                    <div className="font-medium">Donation verifications</div>
                    <div className="text-sm text-muted-foreground">Review pending donor submissions</div>
                  </div>
                  <Badge variant={pendingDonations > 0 ? "warning" : "success"}>
                    {pendingDonations} pending
                  </Badge>
                </Link>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                  Donations database not configured.
                </div>
              )}
              {contactMessagesAvailable ? (
                <Link href="/admin/messages" className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-slate-50">
                  <div>
                    <div className="font-medium">Contact messages</div>
                    <div className="text-sm text-muted-foreground">
                      {notEmailedMessages > 0
                        ? "Nobody was emailed about these — reply from here"
                        : "Enquiries submitted through the website"}
                    </div>
                  </div>
                  <Badge variant={unhandledMessages > 0 ? "warning" : "success"}>
                    {unhandledMessages} unhandled
                  </Badge>
                </Link>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                  Contact messages database not configured.
                </div>
              )}
              <Link href="/admin/stories" className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-slate-50">
                <div>
                  <div className="font-medium">Stories &amp; Insights</div>
                  <div className="text-sm text-muted-foreground">Write, publish and analyse content</div>
                </div>
                <span className="text-sm font-semibold text-primary">Manage →</span>
              </Link>
              <Link href="/admin/media" className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-slate-50">
                <div>
                  <div className="font-medium">Media library</div>
                  <div className="text-sm text-muted-foreground">Upload and manage photos and documents</div>
                </div>
                <span className="text-sm font-semibold text-primary">Manage →</span>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

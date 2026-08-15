import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { getCsrfTokenFromRequest, CSRF_FIELD_NAME } from "@/lib/csrf";
import { getAuditLogs, AuditLogEntry } from "@/lib/db/audit";
import { getAdmins } from "@/lib/db/admins";
import { Container } from "@/components/shared/Container";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Audit Log",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function actionLabel(action: string): string {
  const labels: Record<string, string> = {
    "donation.verified": "Verified donation",
    "donation.rejected": "Rejected donation",
    "donation.pending": "Reset donation to pending",
    "media.created": "Created media",
    "media.updated": "Updated media",
    "media.deleted": "Deleted media",
    "story.created": "Created story",
    "story.updated": "Updated story",
    "story.deleted": "Deleted story",
    "admin.created": "Created admin",
    "admin.disabled": "Disabled admin",
  };
  return labels[action] ?? action;
}

function actionVariant(action: string): "success" | "warning" | "destructive" | "default" {
  if (action.endsWith(".created")) return "success";
  if (action.endsWith(".deleted")) return "destructive";
  if (action.endsWith(".rejected")) return "destructive";
  if (action.endsWith(".verified")) return "success";
  if (action.endsWith(".updated")) return "warning";
  return "default";
}

function formatJson(value: unknown): string {
  if (value == null) return "—";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ resourceType?: string; action?: string }>;
}) {
  const { resourceType, action } = await searchParams;
  const cookieStore = await cookies();

  if (!verifySessionToken(cookieStore.get(sessionCookieName)?.value)) {
    redirect("/admin/login");
  }

  const csrfToken = await getCsrfTokenFromRequest();

  // Build a lookup of admin usernames for resolving actor_id.
  let adminUsernames: Record<string, string> = {};
  try {
    const admins = await getAdmins();
    adminUsernames = Object.fromEntries(admins.map((a) => [String(a.id), a.username]));
  } catch {
    // DB not configured — show raw actor ids.
  }

  let entries: AuditLogEntry[] = [];
  let dbError = "";
  try {
    entries = await getAuditLogs({ resourceType, action, limit: 200 });
  } catch {
    dbError =
      "Could not load audit log. Check that DATABASE_URL is set and the audit_log table exists (run `node scripts/setup-db.mjs`).";
  }

  const actorLabel = (actorId: string, actorKind: string): string => {
    if (actorKind === "bootstrap") return "bootstrap (ADMIN_SECRET)";
    if (actorKind === "system") return "system";
    return adminUsernames[actorId] ? `#${actorId} (${adminUsernames[actorId]})` : `#${actorId}`;
  };

  return (
    <section className="py-12 md:py-16">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Audit log</h1>
            <p className="text-sm text-muted-foreground">
              Immutable record of admin actions. Every state change (donation
              verification and media upload/edit/delete)
              is logged with the actor, before/after state, and IP address.
            </p>
          </div>
          <nav className="flex gap-2" aria-label="Admin navigation">
            <Link
              href="/admin/stories"
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Stories & Insights
            </Link>
            <Link
              href="/admin/donations"
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Donations
            </Link>
            <Link
              href="/admin/media"
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Media library
            </Link>
            <Link
              href="/admin/admins"
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Admins
            </Link>
            <form method="post" action="/api/admin/logout" className="inline">
              <input type="hidden" name={CSRF_FIELD_NAME} value={csrfToken} />
              <button
                type="submit"
                className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Log out
              </button>
            </form>
          </nav>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href="/admin/audit"
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
              !resourceType && !action
                ? "border-primary bg-primary text-white"
                : "border-border bg-white hover:bg-slate-50"
            }`}
          >
            All
          </a>
          {["donation", "media", "story"].map((rt) => (
            <a
              key={rt}
              href={`/admin/audit?resourceType=${rt}`}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                resourceType === rt
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white hover:bg-slate-50"
              }`}
            >
              {rt.charAt(0).toUpperCase() + rt.slice(1)}
            </a>
          ))}
        </div>

        {dbError && (
          <div role="alert" className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
            {dbError}
          </div>
        )}

        {entries.length > 0 && (
          <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    When
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Actor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Resource
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Before → After
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    IP
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {entries.map((entry) => (
                  <tr key={entry.id} className="align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {actorLabel(entry.actorId, entry.actorKind)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <Badge variant={actionVariant(entry.action)}>
                        {actionLabel(entry.action)}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {entry.resourceType}
                      {entry.resourceId && (
                        <span className="text-muted-foreground"> #{entry.resourceId}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <details className="cursor-pointer">
                        <summary className="text-muted-foreground hover:text-foreground">
                          View changes
                        </summary>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground">Before</p>
                            <pre className="mt-1 overflow-x-auto rounded bg-slate-50 p-2 text-xs">
                              {formatJson(entry.before)}
                            </pre>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground">After</p>
                            <pre className="mt-1 overflow-x-auto rounded bg-slate-50 p-2 text-xs">
                              {formatJson(entry.after)}
                            </pre>
                          </div>
                        </div>
                      </details>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-mono text-xs text-muted-foreground">
                      {entry.ip ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {entries.length === 0 && !dbError && (
          <div className="mt-8 rounded-lg bg-slate-50 p-8 text-center text-sm text-muted-foreground">
            No audit log entries yet. Actions will appear here once admins
            start verifying donations or uploading media.
          </div>
        )}
      </Container>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { getCsrfTokenFromRequest, CSRF_FIELD_NAME } from "@/lib/csrf";
import { getAdmins } from "@/lib/db/admins";
import { Container } from "@/components/shared/Container";
import { AdminsManager } from "@/components/admin/AdminsManager";

export const metadata: Metadata = {
  title: "Admins",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminAdminsPage() {
  const cookieStore = await cookies();

  const session = verifySessionToken(cookieStore.get(sessionCookieName)?.value);
  if (!session) {
    redirect("/admin/login");
  }
  const actorId = session.actorId;

  const csrfToken = await getCsrfTokenFromRequest();

  let admins: Awaited<ReturnType<typeof getAdmins>> = [];
  let dbError = "";
  try {
    admins = await getAdmins();
  } catch {
    dbError =
      "Could not load admins. Check that DATABASE_URL is set and the admins table exists (run `node scripts/setup-db.mjs`).";
  }

  // Strip password hashes before passing to the client component.
  const safeItems = admins.map((a) => ({
    id: a.id,
    username: a.username,
    createdAt: a.createdAt,
    disabledAt: a.disabledAt,
  }));

  return (
    <section className="py-12 md:py-16">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Admins</h1>
            <p className="text-sm text-muted-foreground">
              Create and manage named admin accounts. Each admin has their own
              username and password; actions are attributed to them in the audit
              log. Disabled admins cannot log in but are retained for audit
              history.
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
              href="/admin/audit"
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Audit log
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

        {dbError && (
          <div role="alert" className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
            {dbError}
          </div>
        )}

        <AdminsManager
          csrfToken={csrfToken}
          initialItems={safeItems}
          currentActorId={actorId}
        />
      </Container>
    </section>
  );
}

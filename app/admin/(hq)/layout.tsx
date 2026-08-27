import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { getCsrfTokenFromRequest } from "@/lib/csrf";
import { getAdminById } from "@/lib/db/admins";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: {
    default: "Vantage HQ",
    template: `%s | Vantage HQ`,
  },
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(sessionCookieName)?.value);
  if (!session) {
    const h = await headers();
    const pathname = h.get("x-pathname") || "/admin";
    redirect(`/admin/login?returnTo=${encodeURIComponent(pathname)}`);
  }

  const csrfToken = await getCsrfTokenFromRequest();

  let actorName: string;
  if (session.actorId === "bootstrap") {
    actorName = "Bootstrap";
  } else {
    const adminId = Number(session.actorId);
    actorName = session.actorId;
    try {
      const admin = await getAdminById(adminId);
      if (admin) {
        actorName = admin.username;
      }
    } catch {
      // Keep the actor id as display name if the database is unavailable.
    }
  }

  return (
    <AdminShell csrfToken={csrfToken} actorName={actorName}>
      {children}
    </AdminShell>
  );
}

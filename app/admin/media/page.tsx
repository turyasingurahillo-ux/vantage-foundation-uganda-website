import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { getCsrfTokenFromRequest, CSRF_FIELD_NAME } from "@/lib/csrf";
import { getMediaObjects } from "@/lib/db/media";
import { Container } from "@/components/shared/Container";
import { Badge } from "@/components/ui/Badge";
import { MediaManager } from "@/components/admin/MediaManager";

export const metadata: Metadata = {
  title: "Media Library",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; updated?: string; deleted?: string; error?: string }>;
}) {
  const { created, updated, deleted, error } = await searchParams;
  const cookieStore = await cookies();

  if (!verifySessionToken(cookieStore.get(sessionCookieName)?.value)) {
    redirect("/admin/login");
  }

  const csrfToken = await getCsrfTokenFromRequest();

  let items: Awaited<ReturnType<typeof getMediaObjects>> = [];
  let dbError = "";
  try {
    items = await getMediaObjects();
  } catch {
    dbError =
      "Could not load media. Check that DATABASE_URL is set and the media_objects table exists (run `node scripts/setup-db.mjs`).";
  }

  const consentVariant = (
    consent: string
  ): "success" | "warning" | "destructive" | "default" => {
    switch (consent) {
      case "verified":
        return "success";
      case "group-consent":
        return "success";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <section className="py-12 md:py-16">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Media library</h1>
            <p className="text-sm text-muted-foreground">
              Upload and manage photos, documents, and logos stored in Cloudflare R2.
              New uploads default to <strong>pending</strong> consent and
              <strong> unpublished</strong> — set both before publishing.
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
            <form method="post" action="/api/admin/logout">
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

        {created && (
          <div role="status" className="mt-4 rounded-lg bg-green-50 p-4 text-sm text-green-800">
            Media uploaded successfully. Review consent and alt text before publishing.
          </div>
        )}
        {updated && (
          <div role="status" className="mt-4 rounded-lg bg-green-50 p-4 text-sm text-green-800">
            Media updated successfully.
          </div>
        )}
        {deleted && (
          <div role="status" className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
            Media deleted. The R2 object was removed and the database record soft-deleted.
          </div>
        )}
        {error && (
          <div role="alert" className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">
            {error === "csrf" && "Security check failed. Please reload the page."}
            {error === "unauthorized" && "Your session expired. Please log in again."}
            {error === "rate-limited" && "Too many requests. Please wait a minute."}
            {error === "presign-failed" && "Could not issue an upload URL. Check R2 credentials."}
            {error === "object-not-found" && "The uploaded file was not found in R2. Try again."}
            {error === "duplicate" && "A record for this object already exists."}
            {error === "unsupported-type" && "That file type is not allowed."}
            {error === "too-large" && "The file exceeds the 10 MB limit."}
            {error === "db" && "Database error. Check DATABASE_URL and the media_objects table."}
            {error === "not-found" && "Media record not found."}
            {error === "invalid" && "Invalid input."}
          </div>
        )}
        {dbError && (
          <div role="alert" className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
            {dbError}
          </div>
        )}

        <MediaManager csrfToken={csrfToken} initialItems={items} />

        {items.length > 0 && (
          <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Object key
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Size
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Consent
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Published
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Uploaded
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => (
                  <tr key={item.id} className="align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-sm">#{item.id}</td>
                    <td className="px-4 py-3 text-sm font-mono text-xs break-all">
                      {item.objectKey}
                      <div className="text-muted-foreground">{item.originalFilename}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">{item.contentType}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                      {formatBytes(item.byteSize)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <Badge variant={consentVariant(item.consent)}>{item.consent}</Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {item.published ? (
                        <Badge variant="success">published</Badge>
                      ) : (
                        <Badge variant="outline">draft</Badge>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Container>
    </section>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

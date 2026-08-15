import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  getContactMessages,
  ContactMessageRow,
} from "@/lib/db/contact";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { Container } from "@/components/shared/Container";
import { Badge } from "@/components/ui/Badge";
import { getCategoryLabel } from "@/lib/contact-categories";

export const metadata: Metadata = {
  title: "Contact Messages",
  robots: { index: false, follow: false },
};

/**
 * Read-only view of contact-form submissions.
 *
 * Messages are stored before the notification email is attempted, so this page
 * is the backstop when SMTP is unconfigured or failing: anything with
 * "Email failed" never reached the inbox and needs a manual reply.
 */
export default async function AdminMessagesPage() {
  const cookieStore = await cookies();

  if (!verifySessionToken(cookieStore.get(sessionCookieName)?.value)) {
    redirect("/admin/login");
  }

  let messages: ContactMessageRow[] = [];
  let dbError = "";

  try {
    messages = await getContactMessages();
  } catch {
    dbError =
      "Could not load messages. Check that DATABASE_URL is set and that the contact_messages table exists (run scripts/setup-db.mjs).";
  }

  const undelivered = messages.filter((m) => !m.emailSent).length;

  return (
    <section className="py-12">
      <Container>
        <h1 className="text-2xl font-bold">Contact messages</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Submissions from the public contact form, newest first. Every message
          is stored here before the notification email is sent, so nothing is
          lost if email delivery fails.
        </p>

        {dbError && (
          <p className="mt-6 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {dbError}
          </p>
        )}

        {!dbError && undelivered > 0 && (
          <p className="mt-6 rounded-md border border-warning/30 bg-warning/5 p-4 text-sm">
            <strong>{undelivered}</strong>{" "}
            {undelivered === 1 ? "message was" : "messages were"} stored but not
            emailed. Reply to {undelivered === 1 ? "it" : "them"} directly and
            check the SMTP configuration.
          </p>
        )}

        {!dbError && messages.length === 0 && (
          <p className="mt-6 text-sm text-muted-foreground">
            No messages yet.
          </p>
        )}

        <div className="mt-8 space-y-4">
          {messages.map((m) => (
            <article
              key={m.id}
              className="rounded-lg border border-border bg-white p-5"
            >
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={m.emailSent ? "success" : "warning"}>
                  {m.emailSent ? "Emailed" : "Email failed"}
                </Badge>
                <Badge variant="default">{getCategoryLabel(m.category)}</Badge>
                <time
                  dateTime={m.createdAt.toISOString()}
                  className="text-xs text-muted-foreground"
                >
                  {m.createdAt.toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </time>
              </div>

              <h2 className="mt-3 font-semibold">
                {m.name}
                {m.organisation ? (
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    — {m.organisation}
                  </span>
                ) : null}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                <a
                  href={`mailto:${encodeURIComponent(m.email)}`}
                  className="text-primary underline"
                >
                  {m.email}
                </a>
                {m.phone ? <span> · {m.phone}</span> : null}
              </p>

              {/* Rendered as plain text — never as HTML. */}
              <p className="mt-3 whitespace-pre-wrap text-sm">{m.message}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

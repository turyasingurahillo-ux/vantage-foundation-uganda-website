import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  getInboxCounts,
  searchContactMessages,
  type ContactMessageRow,
  type ContactMessageStatus,
  type InboxFilter,
} from "@/lib/db/contact";
import {
  getRepliesForMessages,
  type ContactReplyRow,
} from "@/lib/db/contact-replies";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { getCsrfTokenFromRequest, CSRF_FIELD_NAME } from "@/lib/csrf";
import { Container } from "@/components/shared/Container";
import { AdminNav } from "@/components/admin/AdminNav";
import { ReplyComposer } from "@/components/admin/ReplyComposer";
import { Badge } from "@/components/ui/Badge";
import { getCategoryLabel } from "@/lib/contact-categories";
import { REPLY_MAX_LENGTH, getReplyFromAddress } from "@/lib/contact-reply";

export const metadata: Metadata = {
  title: "Contact Messages",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  "rate-limited": "Too many attempts. Wait a minute and try again.",
  csrf: "Security check failed. Reload the page and try again.",
  invalid: "That request could not be understood.",
  notfound: "That message no longer exists.",
  empty: "Write something before sending.",
  "too-long": `Replies are limited to ${REPLY_MAX_LENGTH} characters.`,
  send: "The email could not be sent. The draft is kept and marked as failed — check the email settings, then send again.",
  server: "Something went wrong. Please try again.",
};

const TABS: { key: InboxFilter; label: string }[] = [
  { key: "new", label: "New" },
  { key: "awaiting_response", label: "Awaiting response" },
  { key: "replied", label: "Replied" },
  { key: "archived", label: "Archived" },
  { key: "all", label: "All" },
];

const STATUS_BADGE: Record<
  ContactMessageStatus,
  { label: string; variant: "default" | "success" | "warning" | "outline" }
> = {
  new: { label: "New", variant: "warning" },
  awaiting_response: { label: "Awaiting response", variant: "warning" },
  replied: { label: "Replied", variant: "success" },
  archived: { label: "Archived", variant: "outline" },
};

const EMPTY_STATE: Record<InboxFilter, string> = {
  new: "No new messages. Anything submitted through the contact form lands here first.",
  awaiting_response: "Nothing is waiting on a response.",
  replied: "No replied conversations yet.",
  archived: "Nothing archived.",
  all: "No messages yet. Submissions from the website contact form will appear here.",
};

function isFilter(value: string | undefined): value is InboxFilter {
  return (
    value === "new" ||
    value === "awaiting_response" ||
    value === "replied" ||
    value === "archived" ||
    value === "all"
  );
}

function formatDateTime(date: Date) {
  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Small form that posts one workflow action. */
function ActionButton({
  action,
  csrfToken,
  id,
  status,
  label,
  variant = "ghost",
}: {
  action: string;
  csrfToken: string;
  id: number;
  status?: string;
  label: string;
  variant?: "ghost" | "primary";
}) {
  return (
    <form method="post" action={action} className="inline">
      <input type="hidden" name={CSRF_FIELD_NAME} value={csrfToken} />
      <input type="hidden" name="id" value={id} />
      {status ? <input type="hidden" name="status" value={status} /> : null}
      <button
        type="submit"
        className={
          variant === "primary"
            ? "rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
            : "rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
        }
      >
        {label}
      </button>
    </form>
  );
}

function Conversation({
  message,
  replies,
  csrfToken,
  fromAddress,
}: {
  message: ContactMessageRow;
  replies: ContactReplyRow[];
  csrfToken: string;
  fromAddress: string;
}) {
  return (
    <div className="mt-5 border-t border-border pt-5">
      {/* Original submission */}
      <div className="rounded-lg bg-slate-50 p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-semibold">{message.name}</p>
          <time
            dateTime={message.createdAt.toISOString()}
            className="text-xs text-muted-foreground"
          >
            {formatDateTime(message.createdAt)}
          </time>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {message.email}
          {message.phone ? <> · {message.phone}</> : null}
          {message.organisation ? <> · {message.organisation}</> : null}
        </p>
        {/* Plain text only — never rendered as HTML. */}
        <p className="mt-3 whitespace-pre-wrap text-sm">{message.message}</p>
      </div>

      {/* Correspondence, oldest first */}
      {replies.map((reply) => (
        <div
          key={reply.id}
          className={
            reply.direction === "outbound"
              ? "mt-3 rounded-lg border border-primary/30 bg-primary/5 p-4 md:ml-8"
              : "mt-3 rounded-lg bg-slate-50 p-4"
          }
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-semibold">
              {reply.direction === "outbound"
                ? "Vantage Foundation Uganda"
                : message.name}
            </p>
            <div className="flex items-center gap-2">
              {reply.sendStatus === "failed" && (
                <Badge variant="destructive">Not sent</Badge>
              )}
              {reply.sendStatus === "pending" && (
                <Badge variant="warning">Sending</Badge>
              )}
              <time
                dateTime={(reply.sentAt ?? reply.createdAt).toISOString()}
                className="text-xs text-muted-foreground"
              >
                {formatDateTime(reply.sentAt ?? reply.createdAt)}
              </time>
            </div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            to {reply.recipientEmail}
            {reply.adminActorId ? <> · sent by {reply.adminActorId}</> : null}
          </p>
          <p className="mt-3 whitespace-pre-wrap text-sm">{reply.body}</p>
          {reply.sendStatus === "failed" && reply.errorDetail && (
            <p className="mt-2 text-xs text-destructive">
              Delivery failed: {reply.errorDetail}. Send a new reply to retry.
            </p>
          )}
        </div>
      ))}

      <ReplyComposer
        messageId={message.id}
        recipientName={message.name}
        recipientEmail={message.email}
        fromAddress={fromAddress}
        csrfToken={csrfToken}
        csrfFieldName={CSRF_FIELD_NAME}
        maxLength={REPLY_MAX_LENGTH}
      />
    </div>
  );
}

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{
    filter?: string;
    q?: string;
    open?: string;
    replied?: string;
    resent?: string;
    status?: string;
    error?: string;
  }>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();

  if (!verifySessionToken(cookieStore.get(sessionCookieName)?.value)) {
    redirect("/admin/login");
  }

  const csrfToken = await getCsrfTokenFromRequest();
  const filter: InboxFilter = isFilter(params.filter) ? params.filter : "new";
  const query = (params.q ?? "").slice(0, 100);
  const openId = Number(params.open) || null;

  let messages: ContactMessageRow[] = [];
  let counts: Record<InboxFilter, number> | null = null;
  let repliesByMessage = new Map<number, ContactReplyRow[]>();
  let dbError = "";

  try {
    const [found, tallies] = await Promise.all([
      searchContactMessages({ filter, query }),
      getInboxCounts(),
    ]);
    messages = found;
    counts = tallies;
    repliesByMessage = await getRepliesForMessages(messages.map((m) => m.id));
  } catch {
    dbError =
      "Could not load messages. Check that DATABASE_URL is set and that the contact tables exist.";
  }

  const fromAddress = getReplyFromAddress();
  const keepParams = `filter=${filter}${
    query ? `&q=${encodeURIComponent(query)}` : ""
  }`;

  return (
    <section className="py-12">
      <Container>
        <AdminNav current="/admin/messages" csrfToken={csrfToken} />

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Contact messages</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Read enquiries from the website and reply to them directly. Every
              submission is stored before any email is sent, so nothing is lost
              if delivery fails.
            </p>
          </div>
          <form method="get" className="flex gap-2">
            <input type="hidden" name="filter" value={filter} />
            <label htmlFor="q" className="sr-only">
              Search messages
            </label>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search name, email, topic…"
              className="w-56 rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            <button
              type="submit"
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Search
            </button>
          </form>
        </div>

        <nav className="mt-6 flex flex-wrap gap-2" aria-label="Message filters">
          {TABS.map((tab) => {
            const isCurrent = tab.key === filter;
            const count = counts?.[tab.key];
            return (
              <Link
                key={tab.key}
                href={`/admin/messages?filter=${tab.key}${
                  query ? `&q=${encodeURIComponent(query)}` : ""
                }`}
                aria-current={isCurrent ? "page" : undefined}
                className={
                  isCurrent
                    ? "rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-semibold text-white"
                    : "rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                }
              >
                {tab.label}
                {typeof count === "number" ? (
                  <span
                    className={
                      isCurrent ? "ml-2 opacity-80" : "ml-2 text-muted-foreground"
                    }
                  >
                    {count}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {dbError && (
          <p className="mt-6 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {dbError}
          </p>
        )}
        {params.replied && (
          <p className="mt-6 rounded-md border border-success/30 bg-success/5 p-4 text-sm">
            Reply sent. It is saved in the conversation below.
          </p>
        )}
        {params.resent && (
          <p className="mt-6 rounded-md border border-success/30 bg-success/5 p-4 text-sm">
            Internal notification re-sent to the team inbox.
          </p>
        )}
        {params.status && (
          <p className="mt-6 rounded-md border border-border bg-slate-50 p-4 text-sm">
            Message updated.
          </p>
        )}
        {params.error && (
          <p className="mt-6 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {ERRORS[params.error] ?? ERRORS.server}
          </p>
        )}

        {!dbError && messages.length === 0 && (
          <p className="mt-8 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {query
              ? `Nothing matches “${query}” in ${
                  TABS.find((t) => t.key === filter)?.label ?? filter
                }.`
              : EMPTY_STATE[filter]}
          </p>
        )}

        <div className="mt-6 space-y-4">
          {messages.map((m) => {
            const isOpen = openId === m.id;
            const replies = repliesByMessage.get(m.id) ?? [];
            const sentCount = replies.filter(
              (r) => r.sendStatus === "sent",
            ).length;
            const badge = STATUS_BADGE[m.status];

            return (
              <article
                key={m.id}
                id={`message-${m.id}`}
                className="rounded-xl border border-border bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                  <Badge variant="default">{getCategoryLabel(m.category)}</Badge>
                  {sentCount > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {sentCount} {sentCount === 1 ? "reply" : "replies"}
                    </span>
                  )}
                  {!m.emailSent && (
                    <span className="text-xs text-muted-foreground">
                      team not notified
                    </span>
                  )}
                  <time
                    dateTime={m.createdAt.toISOString()}
                    className="ml-auto text-xs text-muted-foreground"
                  >
                    {formatDateTime(m.createdAt)}
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
                  {m.lastRepliedAt ? (
                    <> · last replied {formatDateTime(m.lastRepliedAt)}</>
                  ) : null}
                </p>

                {!isOpen && (
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                    {m.message}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Link
                    href={
                      isOpen
                        ? `/admin/messages?${keepParams}#message-${m.id}`
                        : `/admin/messages?${keepParams}&open=${m.id}#message-${m.id}`
                    }
                    className={
                      isOpen
                        ? "rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                        : "rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                    }
                  >
                    {isOpen ? "Close conversation" : "Reply / view conversation"}
                  </Link>

                  {m.status === "archived" ? (
                    <ActionButton
                      action="/api/admin/messages/status"
                      csrfToken={csrfToken}
                      id={m.id}
                      status="new"
                      label="Unarchive"
                    />
                  ) : (
                    <>
                      {m.status !== "new" && (
                        <ActionButton
                          action="/api/admin/messages/status"
                          csrfToken={csrfToken}
                          id={m.id}
                          status="new"
                          label="Mark as new"
                        />
                      )}
                      {m.status === "new" && (
                        <ActionButton
                          action="/api/admin/messages/status"
                          csrfToken={csrfToken}
                          id={m.id}
                          status="awaiting_response"
                          label="Mark as awaiting response"
                        />
                      )}
                      <ActionButton
                        action="/api/admin/messages/status"
                        csrfToken={csrfToken}
                        id={m.id}
                        status="archived"
                        label="Archive"
                      />
                    </>
                  )}

                  {/* Secondary: internal team notification, NOT a reply to the sender. */}
                  <ActionButton
                    action="/api/admin/messages/resend"
                    csrfToken={csrfToken}
                    id={m.id}
                    label="Resend internal notification"
                  />
                </div>

                {isOpen && (
                  <Conversation
                    message={m}
                    replies={replies}
                    csrfToken={csrfToken}
                    fromAddress={fromAddress}
                  />
                )}
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

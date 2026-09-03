import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import {
  getInboxCounts,
  getInboxPage,
  INBOX_PAGE_SIZE,
  type ContactMessageListRow,
  type ContactMessageRow,
  type ContactMessageStatus,
  type InboxFilter,
} from "@/lib/db/contact";
import {
  getRepliesForMessage,
  isReplyPendingStale,
  type ContactReplyRow,
} from "@/lib/db/contact-replies";
import {
  buildInboxUrl,
  parseInboxContext,
  withOpen,
  type InboxContext,
} from "@/lib/admin/inbox-context";
import { describeTime, formatDateTime } from "@/lib/relative-time";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { getCsrfTokenFromRequest, CSRF_FIELD_NAME } from "@/lib/csrf";
import { Container } from "@/components/shared/Container";
import { AdminNav } from "@/components/admin/AdminNav";
import { ReplyComposer } from "@/components/admin/ReplyComposer";
import { Badge } from "@/components/ui/Badge";
import { CONTACT_CATEGORIES, getCategoryLabel } from "@/lib/contact-categories";
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
  send: "The email could not be sent. The draft is kept and marked as failed — check the email settings, then use Retry on the failed reply below.",
  notify:
    "The internal notification could not be sent to the team inbox. Nothing was sent to the enquirer.",
  "in-flight":
    "This reply is still being processed — the email provider has not confirmed it yet. Nothing has been sent twice. Reload in a moment to see the outcome.",
  "retry-invalid":
    "That reply cannot be retried. Only a reply that the provider rejected can be sent again.",
  "resolve-invalid":
    "That delivery has already been settled. Reload to see its current state.",
  server: "Something went wrong. Please try again.",
};

const DONE: Record<string, string> = {
  "mark-new": "Marked as new.",
  "needs-reply": "Marked as needing a reply.",
  archive: "Conversation archived.",
  unarchive: "Conversation restored to the active inbox.",
};

const RESOLVED: Record<string, string> = {
  sent: "Recorded as delivered. The conversation is marked replied.",
  failed:
    "Recorded as not delivered. Use Retry below to send the reply again.",
};

const TABS: { key: InboxFilter; label: string }[] = [
  { key: "new", label: "New" },
  { key: "awaiting_response", label: "Needs reply" },
  { key: "replied", label: "Replied" },
  { key: "all", label: "All active" },
  { key: "archived", label: "Archived" },
];

const STATUS_BADGE: Record<
  ContactMessageStatus,
  { label: string; variant: "default" | "success" | "warning" | "outline" }
> = {
  new: { label: "New", variant: "warning" },
  awaiting_response: { label: "Needs reply", variant: "warning" },
  replied: { label: "Replied", variant: "success" },
};

const EMPTY_STATE: Record<InboxFilter, string> = {
  new: "No new messages. Anything submitted through the contact form lands here first.",
  awaiting_response: "Nothing is waiting on a reply.",
  replied: "No replied conversations yet.",
  archived: "Nothing archived.",
  all: "No active conversations. Submissions from the public contact form will appear here.",
};

/** Hidden fields that carry the administrator's position to a mutation. */
function contextFields(context: InboxContext): Record<string, string> {
  return {
    filter: context.filter,
    q: context.q,
    page: String(context.page),
    open: context.open ? String(context.open) : "",
    category: context.category,
  };
}

/** Small form that posts one workflow action, preserving inbox position. */
function ActionButton({
  action,
  endpoint = "/api/admin/messages/status",
  csrfToken,
  id,
  context,
  label,
  extra,
  variant = "ghost",
}: {
  action?: string;
  endpoint?: string;
  csrfToken: string;
  id: number;
  context: InboxContext;
  label: string;
  extra?: Record<string, string | number>;
  variant?: "ghost" | "primary";
}) {
  return (
    <form method="post" action={endpoint} className="inline">
      <input type="hidden" name={CSRF_FIELD_NAME} value={csrfToken} />
      <input type="hidden" name="id" value={id} />
      {action ? <input type="hidden" name="action" value={action} /> : null}
      {Object.entries(extra ?? {}).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={String(value)} />
      ))}
      {Object.entries(contextFields(context)).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
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

/** The exact timestamp stays available; the relative one does the reading. */
function RelativeTime({
  date,
  prefix,
  className,
}: {
  date: Date;
  prefix?: string;
  className?: string;
}) {
  const { text, exact } = describeTime(date);
  return (
    <time dateTime={date.toISOString()} title={exact} className={className}>
      {prefix ? `${prefix} ` : ""}
      {text}
    </time>
  );
}

function Conversation({
  message,
  replies,
  csrfToken,
  fromAddress,
  context,
  retryOf,
  composerKey,
  autoFocusComposer,
}: {
  message: ContactMessageRow;
  replies: ContactReplyRow[];
  csrfToken: string;
  fromAddress: string;
  context: InboxContext;
  retryOf: ContactReplyRow | null;
  composerKey: string;
  autoFocusComposer: boolean;
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
      {replies.map((reply) => {
        const stale = isReplyPendingStale(reply);
        return (
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
                  <Badge variant="warning">
                    {stale ? "Delivery unconfirmed" : "Sending"}
                  </Badge>
                )}
                {reply.retryOfReplyId ? (
                  <Badge variant="outline">Retry</Badge>
                ) : null}
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

            {reply.sendStatus === "failed" && (
              <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 p-3">
                <p className="text-xs text-destructive">
                  Delivery failed
                  {reply.errorDetail ? `: ${reply.errorDetail}` : "."}
                </p>
                <div className="mt-2">
                  <Link
                    href={buildInboxUrl(withOpen(context, message.id), {
                      retry: reply.id,
                    })}
                    className="inline-block rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                  >
                    Retry this reply
                  </Link>
                </div>
              </div>
            )}

            {/* An interrupted send. The application cannot tell whether the
                enquirer received this, and SMTP gives it no way to find out,
                so it asks rather than guessing — and never resends on its own,
                which would risk a second copy of a mail already delivered. */}
            {reply.sendStatus === "pending" && stale && (
              <div className="mt-3 rounded-md border border-warning-fg/30 bg-warning-bg p-3">
                <p className="text-xs text-warning-fg">
                  This send was interrupted before the email provider confirmed
                  it, so whether it arrived is not known. Check the{" "}
                  {fromAddress ? <strong>{fromAddress}</strong> : "sending"}{" "}
                  mailbox&apos;s sent folder, then record what you find. Nothing
                  will be sent again until you do.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <ActionButton
                    endpoint="/api/admin/messages/resolve"
                    csrfToken={csrfToken}
                    id={message.id}
                    context={withOpen(context, message.id)}
                    extra={{ replyId: reply.id, outcome: "failed" }}
                    label="It was not delivered"
                  />
                  <ActionButton
                    endpoint="/api/admin/messages/resolve"
                    csrfToken={csrfToken}
                    id={message.id}
                    context={withOpen(context, message.id)}
                    extra={{ replyId: reply.id, outcome: "sent" }}
                    label="It was delivered"
                  />
                </div>
              </div>
            )}

            {reply.resolvedBy ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Outcome recorded by {reply.resolvedBy}
                {reply.resolvedAt ? ` · ${formatDateTime(reply.resolvedAt)}` : ""}
              </p>
            ) : null}
          </div>
        );
      })}

      <ReplyComposer
        messageId={message.id}
        recipientName={message.name}
        recipientEmail={message.email}
        fromAddress={fromAddress}
        csrfToken={csrfToken}
        csrfFieldName={CSRF_FIELD_NAME}
        maxLength={REPLY_MAX_LENGTH}
        context={contextFields(withOpen(context, message.id))}
        initialBody={retryOf?.body ?? ""}
        retryOfReplyId={retryOf?.id}
        serverKey={composerKey}
        autoFocus={autoFocusComposer}
      />
    </div>
  );
}

/** One collapsed row: who, what about, how it stands, and how long it has sat. */
function InboxCard({
  m,
  isOpen,
  context,
  csrfToken,
  children,
}: {
  m: ContactMessageListRow;
  isOpen: boolean;
  context: InboxContext;
  csrfToken: string;
  children: React.ReactNode;
}) {
  const badge = STATUS_BADGE[m.status];
  const archived = Boolean(m.archivedAt);
  const { sentCount, failedCount, pendingCount } = m.summary;

  return (
    <article
      id={`message-${m.id}`}
      className="rounded-xl border border-border bg-white p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={badge.variant}>{badge.label}</Badge>
        {archived && <Badge variant="outline">Archived</Badge>}
        {/* A delivery failure is not the same operational problem as an
            unanswered enquiry, and must not look like one. */}
        {failedCount > 0 && (
          <Badge variant="destructive">
            {failedCount === 1 ? "Send failed" : `${failedCount} sends failed`}
          </Badge>
        )}
        {pendingCount > 0 && <Badge variant="warning">Send in progress</Badge>}
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
        <RelativeTime
          date={m.lastActivityAt}
          className="ml-auto text-xs text-muted-foreground"
        />
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
          <>
            {" · "}
            <RelativeTime date={m.lastRepliedAt} prefix="replied" />
          </>
        ) : (
          <>
            {" · "}
            <RelativeTime date={m.createdAt} prefix="received" />
          </>
        )}
      </p>

      {!isOpen && (
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
          {m.message}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          href={buildInboxUrl(withOpen(context, isOpen ? null : m.id))}
          aria-expanded={isOpen}
          aria-controls={`conversation-${m.id}`}
          className={
            isOpen
              ? "rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
              : "rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
          }
        >
          {isOpen ? "Close conversation" : "Reply / view conversation"}
        </Link>

        {archived ? (
          <ActionButton
            action="unarchive"
            csrfToken={csrfToken}
            id={m.id}
            context={context}
            label="Unarchive"
          />
        ) : (
          <>
            {m.status !== "new" && (
              <ActionButton
                action="mark-new"
                csrfToken={csrfToken}
                id={m.id}
                context={context}
                label="Mark as new"
              />
            )}
            {m.status !== "awaiting_response" && (
              <ActionButton
                action="needs-reply"
                csrfToken={csrfToken}
                id={m.id}
                context={context}
                label="Mark as needing a reply"
              />
            )}
            <ActionButton
              action="archive"
              csrfToken={csrfToken}
              id={m.id}
              context={context}
              label="Archive"
            />
          </>
        )}

        {/* Secondary: internal team notification, NOT a reply to the sender. */}
        <ActionButton
          endpoint="/api/admin/messages/resend"
          csrfToken={csrfToken}
          id={m.id}
          context={context}
          label="Resend internal notification"
        />
      </div>

      <div id={`conversation-${m.id}`}>{children}</div>
    </article>
  );
}

function Pager({
  context,
  page,
  pageCount,
  total,
}: {
  context: InboxContext;
  page: number;
  pageCount: number;
  total: number;
}) {
  if (pageCount <= 1) return null;
  const first = (page - 1) * INBOX_PAGE_SIZE + 1;
  const last = Math.min(page * INBOX_PAGE_SIZE, total);

  return (
    <nav
      className="mt-6 flex flex-wrap items-center justify-between gap-3"
      aria-label="Inbox pages"
    >
      <p className="text-sm text-muted-foreground">
        Showing {first}–{last} of {total} conversations
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={buildInboxUrl({ ...withOpen(context, null), page: page - 1 })}
            rel="prev"
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold hover:bg-slate-50"
          >
            ← Previous
          </Link>
        ) : null}
        <span className="text-sm text-muted-foreground">
          Page {page} of {pageCount}
        </span>
        {page < pageCount ? (
          <Link
            href={buildInboxUrl({ ...withOpen(context, null), page: page + 1 })}
            rel="next"
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold hover:bg-slate-50"
          >
            Next →
          </Link>
        ) : null}
      </div>
    </nav>
  );
}

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();

  if (!verifySessionToken(cookieStore.get(sessionCookieName)?.value)) {
    redirect("/admin/login");
  }

  const csrfToken = await getCsrfTokenFromRequest();

  // The URL is parsed through exactly the same validator the mutations use, so
  // a hand-edited query string cannot put the page into a state a button
  // could not have produced.
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") search.set(key, value);
  }
  const context = parseInboxContext(search);
  const openId = context.open;
  const retryId = Number(search.get("retry")) || null;

  const banner = {
    replied: search.get("replied"),
    resent: search.get("resent"),
    done: search.get("done"),
    resolved: search.get("resolved"),
    error: search.get("error"),
  };
  const hasBanner = Object.values(banner).some(Boolean);

  let messages: ContactMessageListRow[] = [];
  let counts: Record<InboxFilter, number> | null = null;
  let openReplies: ContactReplyRow[] = [];
  let page = context.page;
  let pageCount = 1;
  let total = 0;
  let dbError = "";

  try {
    const [found, tallies] = await Promise.all([
      getInboxPage({
        filter: context.filter,
        query: context.q,
        category: context.category,
        page: context.page,
      }),
      getInboxCounts(),
    ]);
    messages = found.messages;
    page = found.page;
    pageCount = found.pageCount;
    total = found.total;
    counts = tallies;

    // Correspondence is loaded for the ONE conversation being read, not for
    // every card on the page. Collapsed rows show counts, which the listing
    // query already returned.
    if (openId && messages.some((m) => m.id === openId)) {
      openReplies = await getRepliesForMessage(openId);
    }
  } catch {
    dbError =
      "Could not load messages. Check that DATABASE_URL is set and that the contact tables exist.";
  }

  const retryOf =
    retryId !== null
      ? (openReplies.find(
          (r) => r.id === retryId && r.sendStatus === "failed",
        ) ?? null)
      : null;

  // A fresh key per render: a double-click reuses it (no second email), while
  // a deliberate retry is a genuinely new attempt with a new key.
  const composerKey = randomUUID();
  const fromAddress = getReplyFromAddress();

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

          <form method="get" className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="filter" value={context.filter} />
            <div>
              <label htmlFor="q" className="sr-only">
                Search messages
              </label>
              <input
                id="q"
                name="q"
                type="search"
                defaultValue={context.q}
                maxLength={100}
                placeholder="Search name, email, topic, replies…"
                className="w-56 rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="category" className="sr-only">
                Filter by category
              </label>
              <select
                id="category"
                name="category"
                defaultValue={context.category}
                className="rounded-lg border border-border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="">All categories</option>
                {CONTACT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Search
            </button>
            {(context.q || context.category) && (
              <Link
                href={buildInboxUrl({
                  filter: context.filter,
                  q: "",
                  category: "",
                  page: 1,
                  open: null,
                })}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-primary underline"
              >
                Clear
              </Link>
            )}
          </form>
        </div>

        <nav className="mt-6 flex flex-wrap gap-2" aria-label="Message filters">
          {TABS.map((tab) => {
            const isCurrent = tab.key === context.filter;
            const count = counts?.[tab.key];
            return (
              <Link
                key={tab.key}
                href={buildInboxUrl({
                  ...context,
                  filter: tab.key,
                  page: 1,
                  open: null,
                })}
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
        {banner.replied && (
          <p className="mt-6 rounded-md border border-success/30 bg-success/5 p-4 text-sm">
            Reply sent. It is saved in the conversation below.
          </p>
        )}
        {banner.resent && (
          <p className="mt-6 rounded-md border border-success/30 bg-success/5 p-4 text-sm">
            Internal notification re-sent to the team inbox.
          </p>
        )}
        {banner.resolved && RESOLVED[banner.resolved] && (
          <p className="mt-6 rounded-md border border-border bg-slate-50 p-4 text-sm">
            {RESOLVED[banner.resolved]}
          </p>
        )}
        {banner.done && (
          <p className="mt-6 rounded-md border border-border bg-slate-50 p-4 text-sm">
            {DONE[banner.done] ?? "Message updated."}
          </p>
        )}
        {banner.error && (
          <p className="mt-6 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {ERRORS[banner.error] ?? ERRORS.server}
          </p>
        )}

        {!dbError && messages.length === 0 && (
          <p className="mt-8 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {context.q || context.category
              ? `Nothing matches that search in ${
                  TABS.find((t) => t.key === context.filter)?.label ??
                  context.filter
                }.`
              : EMPTY_STATE[context.filter]}
          </p>
        )}

        <div className="mt-6 space-y-4">
          {messages.map((m) => {
            const isOpen = openId === m.id;
            return (
              <InboxCard
                key={m.id}
                m={m}
                isOpen={isOpen}
                context={context}
                csrfToken={csrfToken}
              >
                {isOpen && (
                  <Conversation
                    message={m}
                    replies={openReplies}
                    csrfToken={csrfToken}
                    fromAddress={fromAddress}
                    context={context}
                    retryOf={retryOf}
                    composerKey={composerKey}
                    autoFocusComposer={!hasBanner}
                  />
                )}
              </InboxCard>
            );
          })}
        </div>

        <Pager
          context={context}
          page={page}
          pageCount={pageCount}
          total={total}
        />
      </Container>
    </section>
  );
}

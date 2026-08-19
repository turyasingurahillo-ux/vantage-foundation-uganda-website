import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ArrowLeft } from "lucide-react";
import {
  getInboxCounts,
  searchContactMessageSummaries,
  getContactMessageById,
  type ContactMessageSummary,
  type ContactMessageRow,
  type InboxFilter,
} from "@/lib/db/contact";
import {
  getRepliesForMessage,
  getSentReplyCountsForMessages,
  type ContactReplyRow,
} from "@/lib/db/contact-replies";
import { getAdmins } from "@/lib/db/admins";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { getCsrfTokenFromRequest, CSRF_FIELD_NAME } from "@/lib/csrf";
import { Container } from "@/components/shared/Container";
import { ReplyComposer } from "@/components/admin/ReplyComposer";
import { PageHeader } from "@/components/admin/hq/PageHeader";
import { StatusTabs } from "@/components/admin/hq/StatusTabs";
import { SearchInput } from "@/components/admin/hq/SearchInput";
import { Alert } from "@/components/admin/hq/Alert";
import { EmptyState } from "@/components/admin/hq/EmptyState";
import { MessageListItem } from "@/components/admin/hq/MessageListItem";
import { ConversationHeader } from "@/components/admin/hq/ConversationHeader";
import { ConversationTimeline } from "@/components/admin/hq/ConversationTimeline";
import { MessageWorkflowActions } from "@/components/admin/hq/MessageWorkflowActions";
import { REPLY_MAX_LENGTH, getReplyFromAddress } from "@/lib/contact-reply";

export const metadata: Metadata = {
  title: "Contact Messages",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const TABS: { key: InboxFilter; label: string }[] = [
  { key: "new", label: "New" },
  { key: "awaiting_response", label: "Awaiting response" },
  { key: "replied", label: "Replied" },
  { key: "archived", label: "Archived" },
  { key: "all", label: "All" },
];

const EMPTY_STATE: Record<InboxFilter, string> = {
  new: "No new messages.",
  awaiting_response: "Nothing is waiting on a response.",
  replied: "No replied conversations yet.",
  archived: "No archived messages.",
  all: "No messages yet.",
};

const ERROR_MESSAGES: Record<string, string> = {
  "rate-limited": "Too many attempts. Wait a minute and try again.",
  csrf: "Security check failed. Reload the page and try again.",
  invalid: "That request could not be understood.",
  notfound: "That message no longer exists.",
  empty: "Write something before sending.",
  "too-long": `Replies are limited to ${REPLY_MAX_LENGTH} characters.`,
  send: "The reply could not be sent. The failed attempt is saved in the conversation — check the email settings, then try again.",
  server: "Something went wrong. Please try again.",
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

  // Preserve filter and search in all links so navigation never silently
  // discards the current context.
  const preserveParams = `filter=${filter}${
    query ? `&q=${encodeURIComponent(query)}` : ""
  }`;

  // Fetch list summaries (bounded previews, no full message bodies) and
  // canonical counts in parallel.
  let messages: ContactMessageSummary[] = [];
  let counts: Record<InboxFilter, number> | null = null;
  let dbError = false;

  try {
    const [found, tallies] = await Promise.all([
      searchContactMessageSummaries({ filter, query }),
      getInboxCounts(),
    ]);
    messages = found;
    counts = tallies;
  } catch {
    dbError = true;
  }

  // Fetch lightweight grouped reply counts for all list messages.
  // This returns only counts — no reply bodies, error details, or
  // recipient addresses — so the list can show reply counts without
  // loading full reply rows.
  let replyCounts = new Map<number, number>();
  if (!dbError && messages.length > 0) {
    try {
      replyCounts = await getSentReplyCountsForMessages(
        messages.map((m) => m.id),
      );
    } catch {
      // Reply counts are a nice-to-have; list still renders without them.
    }
  }

  // Fetch the selected conversation's full message + replies + admin names.
  // The full message body is only loaded for the selected conversation.
  let selectedMessage: ContactMessageRow | null = null;
  let replies: ContactReplyRow[] = [];
  let adminNames: Record<string, string> = {};

  if (openId) {
    try {
      const [msg, reps, admins] = await Promise.all([
        getContactMessageById(openId),
        getRepliesForMessage(openId),
        getAdmins()
          .then((list) =>
            Object.fromEntries(list.map((a) => [String(a.id), a.username])),
          )
          .catch(() => ({})),
      ]);
      selectedMessage = msg;
      replies = reps;
      adminNames = admins;
    } catch {
      // If the selected conversation fails to load, the list still renders.
      selectedMessage = null;
    }
  }

  const fromAddress = getReplyFromAddress();

  // Build tab config for StatusTabs.
  const tabs = TABS.map((tab) => ({
    label: tab.label,
    params: `filter=${tab.key}${
      query ? `&q=${encodeURIComponent(query)}` : ""
    }`,
    active: tab.key === filter,
    count: counts?.[tab.key],
  }));

  return (
    <Container>
      <PageHeader
        title="Contact messages"
        description="Read enquiries from the website and reply directly. Every submission is stored before any email is sent, so nothing is lost if delivery fails."
      />

      {/* Flash messages */}
      <div className="mt-4 space-y-2">
        {params.replied && (
          <Alert variant="success">
            Reply sent. It is saved in the conversation below.
          </Alert>
        )}
        {params.resent && (
          <Alert variant="success">
            Team notification re-sent to the internal inbox.
          </Alert>
        )}
        {params.status && (
          <Alert variant="info">Message status updated.</Alert>
        )}
        {params.error && (
          <Alert variant="error">
            {ERROR_MESSAGES[params.error] ?? ERROR_MESSAGES.server}
          </Alert>
        )}
      </div>

      {/* Filters + search */}
      <div className="mt-6 space-y-4">
        <StatusTabs
          tabs={tabs}
          basePath="/admin/messages"
          ariaLabel="Message filters"
        />
        <SearchInput
          defaultValue={query}
          action="/admin/messages"
          hiddenFields={[{ name: "filter", value: filter }]}
          placeholder="Search name, email, topic, message…"
          ariaLabel="Search messages"
          className="max-w-md"
        />
      </div>

      {dbError && (
        <Alert variant="error" className="mt-6">
          Messages could not be loaded. Please try again.
        </Alert>
      )}

      {/* Inbox body */}
      {!dbError && messages.length === 0 && !selectedMessage && (
        <EmptyState
          className="mt-6"
          title={
            query
              ? `No messages match “${query}”`
              : EMPTY_STATE[filter]
          }
        />
      )}

      {/* Desktop: two-pane master/detail. Mobile: list or conversation. */}
      {!dbError && messages.length > 0 && (
        <div className="mt-6 grid gap-0 overflow-hidden rounded-xl border border-border lg:grid-cols-[380px_1fr]">
          {/* MESSAGE LIST PANE — navigation semantics, not a listbox widget.
              These are navigation links driven by URL state. */}
          <nav
            aria-label="Conversations"
            className={
              "border-b border-border bg-white lg:border-b-0 lg:border-r " +
              (selectedMessage ? "hidden lg:block" : "block")
            }
          >
            <ul className="max-h-[70vh] overflow-y-auto">
              {messages.map((m) => (
                <MessageListItem
                  key={m.id}
                  message={m}
                  selected={selectedMessage?.id === m.id}
                  preserveParams={preserveParams}
                  replyCount={replyCounts.get(m.id) ?? 0}
                />
              ))}
            </ul>
          </nav>

          {/* CONVERSATION PANE */}
          <div className="bg-white">
            {selectedMessage ? (
              <div className="flex flex-col max-h-[70vh]">
                {/* Mobile back link */}
                <div className="border-b border-border p-3 lg:hidden">
                  <Link
                    href={`/admin/messages?${preserveParams}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Back to messages
                  </Link>
                </div>

                {/* Scrollable conversation content */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                  <ConversationHeader message={selectedMessage} />

                  <div className="mt-6">
                    <ConversationTimeline
                      message={selectedMessage}
                      replies={replies}
                      adminNames={adminNames}
                    />
                  </div>

                  {/* Reply composer — primary action */}
                  <div className="mt-6 border-t border-border pt-5">
                    <ReplyComposer
                      messageId={selectedMessage.id}
                      recipientName={selectedMessage.name}
                      recipientEmail={selectedMessage.email}
                      fromAddress={fromAddress}
                      csrfToken={csrfToken}
                      csrfFieldName={CSRF_FIELD_NAME}
                      maxLength={REPLY_MAX_LENGTH}
                    />
                  </div>

                  {/* Workflow actions — secondary/tertiary */}
                  <div className="mt-6 border-t border-border pt-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Workflow
                    </p>
                    <MessageWorkflowActions
                      messageId={selectedMessage.id}
                      status={selectedMessage.status}
                      csrfToken={csrfToken}
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* No conversation selected — desktop shows prompt, mobile shows nothing (list is visible) */
              <div className="hidden items-center justify-center p-12 lg:flex">
                <EmptyState
                  title="Select a message to view the conversation"
                  description="Choose a conversation from the list to read and reply."
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edge case: list is empty but a conversation is selected (e.g. filter excludes it) */}
      {!dbError && messages.length === 0 && selectedMessage && (
        <div className="mt-6 grid gap-0 overflow-hidden rounded-xl border border-border lg:grid-cols-[380px_1fr]">
          <div className="border-b border-border bg-white lg:border-b-0 lg:border-r">
            <EmptyState
              title={
                query
                  ? `No messages match “${query}”`
                  : EMPTY_STATE[filter]
              }
            />
          </div>
          <div className="bg-white">
            <div className="flex flex-col max-h-[70vh]">
              <div className="border-b border-border p-3 lg:hidden">
                <Link
                  href={`/admin/messages?${preserveParams}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Back to messages
                </Link>
              </div>
              <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                <ConversationHeader message={selectedMessage} />
                <div className="mt-6">
                  <ConversationTimeline
                    message={selectedMessage}
                    replies={replies}
                    adminNames={adminNames}
                  />
                </div>
                <div className="mt-6 border-t border-border pt-5">
                  <ReplyComposer
                    messageId={selectedMessage.id}
                    recipientName={selectedMessage.name}
                    recipientEmail={selectedMessage.email}
                    fromAddress={fromAddress}
                    csrfToken={csrfToken}
                    csrfFieldName={CSRF_FIELD_NAME}
                    maxLength={REPLY_MAX_LENGTH}
                  />
                </div>
                <div className="mt-6 border-t border-border pt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Workflow
                  </p>
                  <MessageWorkflowActions
                    messageId={selectedMessage.id}
                    status={selectedMessage.status}
                    csrfToken={csrfToken}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

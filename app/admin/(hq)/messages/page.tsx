import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  searchCaseSummaries,
  getCaseCounts,
  getCaseById,
  getCaseNotes,
  type CaseSummary,
} from "@/lib/db/cases";
import {
  CASE_FILTERS,
  isCaseFilter,
  type CaseFilter,
} from "@/lib/case-types";
import {
  getRepliesForMessage,
  getSentReplyCountsForMessages,
  type ContactReplyRow,
} from "@/lib/db/contact-replies";
import {
  getCaseActions,
  getCaseDecisions,
  getCaseCommunications,
  getCaseReferrals,
} from "@/lib/db/case-history";
import {
  getOrganisationById,
  getPersonById,
} from "@/lib/db/organisations";
import type {
  CaseActionRow,
  CaseDecisionRow,
  CaseCommunicationRow,
  CaseReferralRow,
  OrganisationRow,
  PersonRow,
} from "@/lib/organisation-types";
import { getAdmins } from "@/lib/db/admins";
import { verifySessionToken, sessionCookieName } from "@/lib/session";
import { getCsrfTokenFromRequest, CSRF_FIELD_NAME } from "@/lib/csrf";
import { Container } from "@/components/shared/Container";
import { PageHeader } from "@/components/admin/hq/PageHeader";
import { StatusTabs } from "@/components/admin/hq/StatusTabs";
import { SearchInput } from "@/components/admin/hq/SearchInput";
import { Alert } from "@/components/admin/hq/Alert";
import { EmptyState } from "@/components/admin/hq/EmptyState";
import { CaseListItem } from "@/components/admin/hq/CaseListItem";
import { CaseDetail } from "@/components/admin/hq/CaseDetail";
import { ManualIntakeForm } from "@/components/admin/hq/ManualIntakeForm";
import { REPLY_MAX_LENGTH, getReplyFromAddress } from "@/lib/contact-reply";

export const metadata: Metadata = {
  title: "Cases & Enquiries",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  "rate-limited": "Too many attempts. Wait a minute and try again.",
  csrf: "Security check failed. Reload the page and try again.",
  invalid: "That request could not be understood.",
  notfound: "That case no longer exists.",
  empty: "Write something before sending.",
  "too-long": `Replies are limited to ${REPLY_MAX_LENGTH} characters.`,
  send: "The reply could not be sent. The failed attempt is saved in the conversation — check the email settings, then try again.",
  server: "Something went wrong. Please try again.",
};

const EMPTY_STATE: Record<string, string> = {
  new: "No new cases.",
  triage: "Nothing in triage.",
  awaiting_vantage: "Nothing waiting on Vantage.",
  awaiting_external: "Nothing waiting on an external party.",
  under_review: "Nothing under review.",
  due_diligence: "Nothing in due diligence.",
  meeting_scheduled: "No meetings scheduled.",
  decision_required: "No decisions pending.",
  accepted: "No accepted cases.",
  referred: "No referred cases.",
  declined: "No declined cases.",
  completed: "No completed cases.",
  archived: "No archived cases.",
  active: "No active cases.",
  my_cases: "You have no assigned cases.",
  overdue: "No overdue actions. ",
  safeguarding: "No safeguarding cases.",
  high_priority: "No high-priority cases.",
  all: "No cases yet.",
};

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
    updated?: string;
    noted?: string;
    created?: string;
    error?: string;
  }>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();

  const session = verifySessionToken(
    cookieStore.get(sessionCookieName)?.value,
  );
  if (!session) {
    redirect("/admin/login");
  }
  const actorId = session.actorId;

  const csrfToken = await getCsrfTokenFromRequest();
  const filter: CaseFilter = isCaseFilter(params.filter)
    ? params.filter
    : "active";
  const query = (params.q ?? "").slice(0, 100);
  const openId = Number(params.open) || null;

  const preserveParams = `filter=${filter}${
    query ? `&q=${encodeURIComponent(query)}` : ""
  }`;

  // Fetch case summaries (with case workflow fields) and counts in parallel.
  let cases: CaseSummary[] = [];
  let counts: Awaited<ReturnType<typeof getCaseCounts>> | null = null;
  let dbError = false;

  try {
    const [found, tallies] = await Promise.all([
      searchCaseSummaries({ filter, query, actorId }),
      getCaseCounts(),
    ]);
    cases = found;
    counts = tallies;
  } catch {
    dbError = true;
  }

  // Fetch lightweight grouped reply counts for all list cases.
  let replyCounts = new Map<number, number>();
  if (!dbError && cases.length > 0) {
    try {
      replyCounts = await getSentReplyCountsForMessages(
        cases.map((c) => c.id),
      );
    } catch {
      // Reply counts are a nice-to-have.
    }
  }

  // Fetch the selected case's full detail + replies + notes + admin names.
  let selectedCase: Awaited<ReturnType<typeof getCaseById>> = null;
  let replies: ContactReplyRow[] = [];
  let notes: Awaited<ReturnType<typeof getCaseNotes>> = [];
  let actions: CaseActionRow[] = [];
  let decisions: CaseDecisionRow[] = [];
  let communications: CaseCommunicationRow[] = [];
  let referrals: CaseReferralRow[] = [];
  let linkedOrganisation: OrganisationRow | null = null;
  let linkedPerson: PersonRow | null = null;
  let adminNames: Record<string, string> = {};
  let admins: { id: number; username: string }[] = [];

  if (openId) {
    try {
      const [c, reps, noteList, adminList, actionList, decisionList, commList, referralList] = await Promise.all([
        getCaseById(openId),
        getRepliesForMessage(openId),
        getCaseNotes(openId),
        getAdmins(),
        getCaseActions(openId),
        getCaseDecisions(openId),
        getCaseCommunications(openId),
        getCaseReferrals(openId),
      ]);
      selectedCase = c;
      replies = reps;
      notes = noteList;
      actions = actionList;
      decisions = decisionList;
      communications = commList;
      referrals = referralList;
      admins = adminList.map((a) => ({ id: a.id, username: a.username }));
      adminNames = Object.fromEntries(
        adminList.map((a) => [String(a.id), a.username]),
      );

      // Fetch linked organisation and person if the case has them
      if (c?.organisationId) {
        linkedOrganisation = await getOrganisationById(c.organisationId).catch(() => null);
      }
      if (c?.personId) {
        linkedPerson = await getPersonById(c.personId).catch(() => null);
      }
    } catch {
      selectedCase = null;
    }
  }

  const fromAddress = getReplyFromAddress();

  // Build tab config — show the most useful filters first, then operational slices.
  const visibleFilters = CASE_FILTERS;
  const tabs = visibleFilters.map((tab) => ({
    label: tab.label,
    params: `filter=${tab.value}${
      query ? `&q=${encodeURIComponent(query)}` : ""
    }`,
    active: tab.value === filter,
    count: counts ? getCountForFilter(counts, tab.value) : undefined,
  }));

  return (
    <Container>
      <PageHeader
        title="Cases & Enquiries"
        description="Track every relationship and enquiry through triage to outcome. A reply by email does not complete a case — decide what happens next."
      />

      {/* Flash messages */}
      <div className="mt-4 space-y-2">
        {params.replied && (
          <Alert variant="success">
            Reply sent. It is saved in the conversation below. The case
            workflow status is unchanged — decide what happens next.
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
        {params.updated && (
          <Alert variant="success">Case updated.</Alert>
        )}
        {params.noted && (
          <Alert variant="success">Internal note added.</Alert>
        )}
        {params.created && (
          <Alert variant="success">
            Case created from external enquiry. It is now in triage.
          </Alert>
        )}
        {params.error && (
          <Alert variant="error">
            {ERROR_MESSAGES[params.error] ?? ERROR_MESSAGES.server}
          </Alert>
        )}
      </div>

      {/* Manual intake + filters + search */}
      <div className="mt-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ManualIntakeForm
            csrfToken={csrfToken}
            csrfFieldName={CSRF_FIELD_NAME}
          />
        </div>
        <StatusTabs
          tabs={tabs}
          basePath="/admin/messages"
          ariaLabel="Case filters"
        />
        <SearchInput
          defaultValue={query}
          action="/admin/messages"
          hiddenFields={[{ name: "filter", value: filter }]}
          placeholder="Search name, email, topic, case type, message…"
          ariaLabel="Search cases"
          className="max-w-md"
        />
      </div>

      {dbError && (
        <Alert variant="error" className="mt-6">
          Cases could not be loaded. Please try again.
        </Alert>
      )}

      {/* Case workspace body */}
      {!dbError && cases.length === 0 && !selectedCase && (
        <EmptyState
          className="mt-6"
          title={
            query
              ? `No cases match “${query}”`
              : EMPTY_STATE[filter] ?? "No cases."
          }
        />
      )}

      {/* Desktop: two-pane master/detail. Mobile: list or conversation. */}
      {!dbError && cases.length > 0 && (
        <div className="mt-6 grid gap-0 overflow-hidden rounded-xl border border-border lg:grid-cols-[380px_1fr]">
          {/* CASE LIST PANE */}
          <nav
            aria-label="Cases"
            className={
              "border-b border-border bg-white lg:border-b-0 lg:border-r " +
              (selectedCase ? "hidden lg:block" : "block")
            }
          >
            <ul className="max-h-[70vh] overflow-y-auto">
              {cases.map((c) => (
                <CaseListItem
                  key={c.id}
                  case={c}
                  selected={selectedCase?.id === c.id}
                  preserveParams={preserveParams}
                  replyCount={replyCounts.get(c.id) ?? 0}
                />
              ))}
            </ul>
          </nav>

          {/* CASE DETAIL PANE */}
          <div className="bg-white">
            {selectedCase ? (
              <CaseDetail
                caseRow={selectedCase}
                replies={replies}
                notes={notes}
                actions={actions}
                decisions={decisions}
                communications={communications}
                referrals={referrals}
                linkedOrganisation={linkedOrganisation}
                linkedPerson={linkedPerson}
                admins={admins}
                adminNames={adminNames}
                csrfToken={csrfToken}
                csrfFieldName={CSRF_FIELD_NAME}
                fromAddress={fromAddress}
                preserveParams={preserveParams}
              />
            ) : (
              <div className="hidden items-center justify-center p-12 lg:flex">
                <EmptyState
                  title="Select a case to view the conversation"
                  description="Choose a case from the list to read, reply and manage the workflow."
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edge case: list is empty but a case is selected */}
      {!dbError && cases.length === 0 && selectedCase && (
        <div className="mt-6 grid gap-0 overflow-hidden rounded-xl border border-border lg:grid-cols-[380px_1fr]">
          <div className="border-b border-border bg-white lg:border-b-0 lg:border-r">
            <EmptyState
              title={
                query
                  ? `No cases match “${query}”`
                  : EMPTY_STATE[filter] ?? "No cases."
              }
            />
          </div>
          <div className="bg-white">
            <CaseDetail
              caseRow={selectedCase}
              replies={replies}
              notes={notes}
              actions={actions}
              decisions={decisions}
              communications={communications}
              referrals={referrals}
              linkedOrganisation={linkedOrganisation}
              linkedPerson={linkedPerson}
              admins={admins}
              adminNames={adminNames}
              csrfToken={csrfToken}
              csrfFieldName={CSRF_FIELD_NAME}
              fromAddress={fromAddress}
              preserveParams={preserveParams}
            />
          </div>
        </div>
      )}
    </Container>
  );
}

function getCountForFilter(
  counts: Awaited<ReturnType<typeof getCaseCounts>>,
  filter: CaseFilter,
): number {
  const map: Record<CaseFilter, number> = {
    new: counts.new,
    triage: counts.triage,
    awaiting_vantage: counts.awaiting_vantage,
    awaiting_external: counts.awaiting_external,
    under_review: counts.under_review,
    due_diligence: counts.due_diligence,
    meeting_scheduled: counts.meeting_scheduled,
    decision_required: counts.decision_required,
    accepted: counts.accepted,
    referred: counts.referred,
    declined: counts.declined,
    completed: counts.completed,
    archived: counts.archived,
    active: counts.active,
    all: counts.all,
    overdue: counts.overdue,
    safeguarding: counts.safeguarding,
    high_priority: counts.high_priority,
    my_cases: 0, // my_cases count requires actorId; not shown in tab counts
  };
  return map[filter] ?? 0;
}

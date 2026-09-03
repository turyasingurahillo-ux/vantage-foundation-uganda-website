import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatDateTime, formatDate } from "@/lib/format";
import { ReplyComposer } from "@/components/admin/ReplyComposer";
import { ConversationTimeline } from "@/components/admin/hq/ConversationTimeline";
import { CaseWorkflowControls } from "@/components/admin/hq/CaseWorkflowControls";
import { CaseOutcomeControls } from "@/components/admin/hq/CaseOutcomeControls";
import { CaseNotes } from "@/components/admin/hq/CaseNotes";
import { CaseActionHistory } from "@/components/admin/hq/CaseActionHistory";
import { CaseDecisionRecord } from "@/components/admin/hq/CaseDecisionRecord";
import { CaseCommunicationLog } from "@/components/admin/hq/CaseCommunicationLog";
import { CaseReferralHistory } from "@/components/admin/hq/CaseReferralHistory";
import { CaseLinkingControls } from "@/components/admin/hq/CaseLinkingControls";
import { MessageWorkflowActions } from "@/components/admin/hq/MessageWorkflowActions";
import { REPLY_MAX_LENGTH } from "@/lib/contact-reply";
import {
  getCaseSourceLabel,
  getCaseTypeLabel,
  getCaseProgrammeLabel,
  getWorkflowStatusLabel,
} from "@/lib/case-types";
import type { CaseRow } from "@/lib/db/cases";
import type { ContactReplyRow } from "@/lib/db/contact-replies";
import type { CaseNoteRow } from "@/lib/db/cases";
import type {
  CaseActionRow,
  CaseDecisionRow,
  CaseCommunicationRow,
  CaseReferralRow,
  OrganisationRow,
  PersonRow,
} from "@/lib/organisation-types";

interface CaseDetailProps {
  caseRow: CaseRow;
  replies: ContactReplyRow[];
  notes: CaseNoteRow[];
  actions: CaseActionRow[];
  decisions: CaseDecisionRow[];
  communications: CaseCommunicationRow[];
  referrals: CaseReferralRow[];
  linkedOrganisation: OrganisationRow | null;
  linkedPerson: PersonRow | null;
  admins: { id: number; username: string }[];
  adminNames: Record<string, string>;
  csrfToken: string;
  csrfFieldName: string;
  fromAddress: string;
  preserveParams: string;
}

/**
 * Case detail pane — the conversation + case-management controls.
 *
 * Layout (top to bottom):
 *   1. Mobile back link
 *   2. Case header (sender info, source, case type, timestamps)
 *   3. Case workflow controls (status, owner, priority, next action)
 *   4. Conversation timeline (original message + replies)
 *   5. Reply composer
 *   6. Case outcome controls (outcome, decline, referral)
 *   7. Internal notes
 *   8. Legacy message workflow actions (resend notification)
 *
 * Progressive disclosure: workflow controls and outcome controls are
 * collapsed by default; the conversation and reply composer are always
 * visible. Internal notes are always visible because they are the primary
 * operational record.
 */
export function CaseDetail({
  caseRow,
  replies,
  notes,
  actions,
  decisions,
  communications,
  referrals,
  linkedOrganisation,
  linkedPerson,
  admins,
  adminNames,
  csrfToken,
  csrfFieldName,
  fromAddress,
  preserveParams,
}: CaseDetailProps) {
  return (
    <div className="flex flex-col max-h-[70vh]">
      {/* Mobile back link */}
      <div className="border-b border-border p-3 lg:hidden">
        <Link
          href={`/admin/messages?${preserveParams}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to cases
        </Link>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {/* Case header */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold text-foreground">
              {caseRow.name}
            </h2>
            <time
              dateTime={caseRow.createdAt.toISOString()}
              className="text-xs text-muted-foreground"
            >
              {formatDateTime(caseRow.createdAt)}
            </time>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>Source: {getCaseSourceLabel(caseRow.source)}</span>
            {caseRow.caseType && (
              <span>· {getCaseTypeLabel(caseRow.caseType)}</span>
            )}
            {caseRow.programme && (
              <span>· {getCaseProgrammeLabel(caseRow.programme)}</span>
            )}
            <span>· Workflow: {getWorkflowStatusLabel(caseRow.workflowStatus)}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>{caseRow.email}</span>
            {caseRow.phone && <span>· {caseRow.phone}</span>}
            {caseRow.organisation && (
              <span>· {caseRow.organisation}</span>
            )}
          </div>
          {caseRow.firstResponseAt && (
            <p className="text-xs text-muted-foreground">
              First response: {formatDate(caseRow.firstResponseAt)}
            </p>
          )}
        </div>

        {/* Case workflow controls */}
        <div className="mt-6 border-t border-border pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Workflow
          </p>
          <CaseWorkflowControls
            case={caseRow}
            admins={admins}
            csrfToken={csrfToken}
            csrfFieldName={csrfFieldName}
          />
        </div>

        {/* Conversation timeline */}
        <div className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Conversation
          </p>
          <ConversationTimeline
            message={caseRow}
            replies={replies}
            adminNames={adminNames}
          />
        </div>

        {/* Reply composer */}
        <div className="mt-6 border-t border-border pt-5">
          <ReplyComposer
            messageId={caseRow.id}
            recipientName={caseRow.name}
            recipientEmail={caseRow.email}
            fromAddress={fromAddress}
            csrfToken={csrfToken}
            csrfFieldName={csrfFieldName}
            maxLength={REPLY_MAX_LENGTH}
          />
        </div>

        {/* Case outcome controls */}
        <div className="mt-6 border-t border-border pt-4">
          <CaseOutcomeControls
            case={caseRow}
            csrfToken={csrfToken}
            csrfFieldName={csrfFieldName}
          />
        </div>

        {/* Decision record */}
        <div className="mt-6 border-t border-border pt-4">
          <CaseDecisionRecord
            caseId={caseRow.id}
            decisions={decisions}
            csrfToken={csrfToken}
            csrfFieldName={csrfFieldName}
          />
        </div>

        {/* Referral history */}
        <div className="mt-6 border-t border-border pt-4">
          <CaseReferralHistory
            caseId={caseRow.id}
            referrals={referrals}
            csrfToken={csrfToken}
            csrfFieldName={csrfFieldName}
          />
        </div>

        {/* Action history */}
        <div className="mt-6 border-t border-border pt-4">
          <CaseActionHistory
            caseId={caseRow.id}
            actions={actions}
            csrfToken={csrfToken}
            csrfFieldName={csrfFieldName}
          />
        </div>

        {/* Communication log */}
        <div className="mt-6 border-t border-border pt-4">
          <CaseCommunicationLog
            caseId={caseRow.id}
            communications={communications}
            csrfToken={csrfToken}
            csrfFieldName={csrfFieldName}
          />
        </div>

        {/* Organisation & person linking */}
        <div className="mt-6 border-t border-border pt-4">
          <CaseLinkingControls
            caseRow={caseRow}
            linkedOrganisation={linkedOrganisation}
            linkedPerson={linkedPerson}
            csrfToken={csrfToken}
            csrfFieldName={csrfFieldName}
          />
        </div>

        {/* Internal notes */}
        <div className="mt-6 border-t border-border pt-4">
          <CaseNotes
            caseId={caseRow.id}
            notes={notes}
            adminNames={adminNames}
            csrfToken={csrfToken}
            csrfFieldName={csrfFieldName}
          />
        </div>

        {/* Legacy message workflow actions (resend notification) */}
        <div className="mt-6 border-t border-border pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Notification
          </p>
          <MessageWorkflowActions
            messageId={caseRow.id}
            status={caseRow.status}
            csrfToken={csrfToken}
          />
        </div>
      </div>
    </div>
  );
}

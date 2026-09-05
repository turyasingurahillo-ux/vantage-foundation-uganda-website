# Case & Enquiry Management — Admin Workflow Guide

This document describes how Vantage HQ's Cases & Enquiries workspace
(`/admin/messages`) works operationally: the dual-state model, the reply
workflow, case workflow transitions, internal notes, manual intake, and the
audit trail.

It is intended for administrators and operators, not developers. For the
technical architecture, see `AGENTS.md` and the source files referenced
therein.

---

## 1. The dual-state model

Every enquiry — whether from the website form, WhatsApp, phone, or walk-in —
is a **case**. Each case has two independent states:

### Message delivery state (`status`)

Tracks whether an email reply has been sent to the enquirer.

| State | Meaning | How it gets there |
|---|---|---|
| `new` | Nobody has actioned it yet | Default on creation |
| `awaiting_response` | Vantage owes a reply | Set manually by admin, or automatically when a reply attempt fails |
| `replied` | At least one reply reached the email provider | Set automatically after a successful send — an admin cannot set this without an email going out |
| `archived` | Filed away | Set manually by admin; archived conversations stay archived even when replied to |

### Case workflow state (`workflow_status`)

Tracks where the relationship/enquiry stands operationally — what happens
next, who owns it, and what ultimately happened.

| State | Meaning |
|---|---|
| `new` | Untriaged — has not been reviewed yet |
| `triage` | Being assessed — manual intake starts here |
| `awaiting_vantage` | Vantage needs to do something |
| `awaiting_external` | Waiting on the enquirer or a third party |
| `under_review` | Being evaluated |
| `due_diligence` | Background checks in progress |
| `meeting_scheduled` | A meeting is booked |
| `decision_required` | A decision is needed |
| `accepted` | Taken on as a partner/project/grant |
| `referred` | Sent to another organisation |
| `declined` | Not taken forward |
| `completed` | Concluded |
| `archived` | Out of the active workflow |

**Key principle**: a successful email reply sets the delivery state to
`replied` and stamps `first_response_at` for SLA reporting, but does **not**
change the case workflow state. The admin decides what happens next via the
case workflow controls. Replying is not the same as resolving.

---

## 2. The workspace layout

`/admin/messages` is a two-pane master/detail workspace on desktop:

- **Left pane**: filterable, searchable list of cases with bounded message
  previews (160 characters), reply counts, and workflow status badges.
- **Right pane**: the selected case's full detail — original submission,
  conversation timeline, case workflow controls, internal notes, actions,
  decisions, communications, and referrals.

On mobile, the list and detail are shown one at a time: tap a case to open
it, tap back to return to the list.

### Filters

The filter tabs show counts for each state:

- **Active** (default): all cases not in `accepted`, `completed`, or
  `archived`
- **New**, **Triage**, **Awaiting Vantage**, **Awaiting External**, **Under
  Review**, **Due Diligence**, **Meeting Scheduled**, **Decision Required**:
  per workflow status
- **Accepted**, **Referred**, **Declined**, **Completed**, **Archived**:
  terminal states
- **Overdue**: cases with a `next_action_due_at` in the past
- **Safeguarding**: cases with `case_type = safeguarding`
- **High Priority**: cases with `critical` or `high` priority
- **My Cases**: cases owned by the current admin
- **All**: everything

Search matches name, email, organisation, category, case type, and message
body. The search runs against the full message body server-side, but only a
160-character preview is returned to the browser — the full body is loaded
only for the selected case.

---

## 3. Reply workflow

### Sending a reply

1. Open a case from the list.
2. The conversation timeline shows the original submission and all
   outbound replies in chronological order.
3. The reply composer is at the bottom of the timeline.
4. Write the reply and submit. The recipient is read from the stored
   contact row — the browser only submits a message id, so a caller cannot
   redirect mail to an arbitrary address.
5. A pending reply row is created **before** the email provider is called.
6. If the provider accepts the email, the reply is marked `sent` and the
   conversation is marked `replied`. `first_response_at` is stamped for SLA
   reporting.
7. If the provider rejects the email, the reply is marked `failed` and the
   conversation moves to `awaiting_response` (unless it is archived or
   already replied). The failed attempt is saved in the timeline with its
   error detail.

### Idempotency

Each composer carries a one-shot idempotency key. A double-click or browser
retry hits the unique index and returns the existing row — no second email
is sent. The idempotency key is scoped to the conversation
(`(message_id, idempotency_key)`), so a key collision with a different
conversation cannot resolve to another conversation's reply.

### Retrying a failed reply

1. A failed reply shows a "Not sent" badge and its error detail in the
   timeline.
2. Click "Retry this reply" — the composer pre-fills with the original body
   and tags the new attempt with the failed reply's id.
3. Submitting creates a new reply row that points back at the failed one
   (`retry_of_reply_id`), so the audit trail keeps both the failure and its
   resolution.
4. The failed attempt is never rewritten — it stays in the timeline.

### Resolving an interrupted send

If a reply is stuck in `pending` for more than 10 minutes, it is considered
"stale" — the application handed the email to SMTP and never learned the
answer (function timeout, instance recycle). SMTP is not transactional, so
the system will not guess:

1. The stale pending reply shows a "Sending" badge and a resolve prompt.
2. An administrator checks the sending mailbox to see if the email actually
   arrived.
3. "Mark as sent" records that the email was delivered — the conversation
   is marked `replied` exactly as a confirmed send would.
4. "Mark as failed" records that the email was not delivered — the attempt
   becomes a failed reply that can be retried.

The system never auto-resolves a stale pending row. Only a human who has
checked the mailbox can settle it.

### Resending the internal notification

"Resend internal notification" re-sends the team notification email for the
original submission — it does **not** email the enquirer. This is for cases
where the original notification failed (SMTP was down, misconfigured) and
the submission is in the database with `email_sent = false`. The recipient
is resolved from the stored category plus server environment, not from the
browser.

---

## 4. Case workflow controls

The case detail pane includes workflow controls for:

- **Workflow status**: move the case through the workflow states listed in
  §1. Moving to `accepted`, `completed`, or `archived` stamps `closed_at`.
  Moving back to an active state clears `closed_at`.
- **Case type**: categorise the enquiry (partnership, funding, safeguarding,
  volunteer, media, general, etc.).
- **Programme**: link to a programme area (health, education, livelihoods,
  etc.).
- **Priority**: `critical`, `high`, `normal`, `low`.
- **Risk level**: `high`, `medium`, `low`, `unknown`.
- **Strategic value**: `high`, `medium`, `low`, `unknown`.
- **Owner**: assign an admin as the case owner.
- **Collaborators**: add additional admins as collaborators.
- **Next action + due date**: what needs to happen next and when. Overdue
  cases surface in the dashboard attention centre and the "Overdue" filter.
- **Outcome**: what ultimately happened (`accepted`, `explore_further`,
  `information_requested`, `referred`, `declined`, `no_response_required`,
  `completed`).
- **Decline reason + detail**: if declined, why.
- **Referral**: organisation, date, link, follow-up date, outcome, detail.

When a case moves from `new` to any triaged state, `triaged_at` is stamped
for SLA reporting.

Every workflow change is written to the immutable audit log with the actor
identity, before/after snapshot, and IP address.

---

## 5. Internal notes

Internal notes are operational context visible only to administrators. They
are:

- **Never emailed** to the enquirer.
- **Never exposed publicly**.
- Structurally separate from `contact_message_replies` (outward-facing
  correspondence), so no code path can accidentally send a note as an email.

Use notes to record:
- Context from a phone call or WhatsApp conversation.
- Internal discussion about how to handle a case.
- Decisions and rationale that should not be emailed but should be
  retrievable by other admins.

---

## 6. Manual intake

"Log enquiry" creates a case from a non-website source (WhatsApp, phone,
social media, referral, walk-in, direct email, other). This reuses the
`contact_messages` table so the case has the full reply/note/audit
infrastructure.

- **Source**: distinguishes the intake channel.
- **Email is optional** for non-email sources (phone, WhatsApp, walk-in). A
  placeholder is stored when no email is available; the case UI shows the
  phone instead.
- **Workflow status starts at `triage`** (not `new`) because a manual intake
  has already been received by a person.
- **Received at**: defaults to now, but can be overridden to record when the
  person originally contacted Vantage (which may differ from data-entry
  time). SLA calculations use `received_at`, not `created_at`, so
  manually logged cases do not contaminate response-time statistics with
  data-entry delay.

---

## 7. Case history

In addition to the current workflow state, each case preserves its full
operational history:

- **Actions**: follow-up tasks with owner, due date, and completion status.
  Previous actions are preserved when the next action changes.
- **Decisions**: organisational judgments (`proceed`, `proceed_with
  conditions`, `request more information`, `refer`, `decline`, `close
  without action`). The latest decision is current; previous decisions
  remain for the audit trail.
- **Communications**: manual logging of WhatsApp/phone/social/meeting/walk-in
  conversations on an existing case, so a new channel does not create a new
  case. Distinct from email replies and internal notes.
- **Referrals**: historical referral records with organisation, opportunity,
  status, and outcome tracking.

---

## 8. Dashboard attention centre

The main admin dashboard (`/admin`) shows:

- **Case-pipeline attention cards**: untriaged, awaiting Vantage, overdue,
  safeguarding, high priority, active cases.
- **Upcoming actions**: overdue (red), today, this week.
- **Legacy attention cards**: pending donations, new messages, awaiting
  response, draft stories, media pending consent.
- **Content performance**: this month's content KPIs and top performing
  article.
- **Quick links** to donation verifications and other admin sections.

---

## 9. SLA reporting

The system records timestamps for the case lifecycle:

| Timestamp | Meaning |
|---|---|
| `received_at` | When Vantage received the enquiry (equals `created_at` for website forms; staff-supplied for manual intake) |
| `triaged_at` | When the case was first triaged (moved from `new` to any triaged state) |
| `first_response_at` | When the first outbound email reply was sent |
| `closed_at` | When the case reached a terminal state (`accepted`, `completed`, `archived`) |

The SLA target for first response is **48 elapsed hours** (configurable in
`lib/db/case-history.ts`). The analytics dashboard shows median and average
response times, within-target percentage, and breakdowns by source and case
type.

---

## 10. Audit trail

Every state-changing action is written to the immutable `audit_log` table
with:

- Actor identity (admin id or `bootstrap`)
- Action type
- Resource type and id
- Before/after JSON snapshot
- IP address

Audit actions for the case workspace:

| Action | When |
|---|---|
| `contact_message.reply` | A reply is successfully sent |
| `contact_message.reply_resolved` | An interrupted send is resolved by an admin |
| `contact_message.status` | The message delivery state is changed |
| `contact_message.resend` | The internal notification is re-sent |
| `case.update` | Case workflow fields are updated |
| `case.note_added` | An internal note is added |
| `case.manual_intake` | A case is created from manual intake |

The audit log is append-only — there is no UPDATE or DELETE path. It is
viewable at `/admin/audit`.

---

## 11. Inbound email (infrastructure-ready)

The system includes an inbound email endpoint (`/api/inbound/email`) that
receives parsed email replies from a Cloudflare Email Worker. When
configured:

1. The Cloudflare Email Worker extracts headers and body from an inbound
   email and POSTs JSON to the endpoint with a shared secret
   (`INBOUND_EMAIL_SECRET`).
2. The endpoint matches the email to an existing case via `In-Reply-To` /
   `References` headers.
3. An inbound reply row is created in `contact_message_replies` with
   `direction = 'inbound'`.
4. The case workflow moves to `awaiting_vantage` and the delivery state
   moves to `awaiting_response`.
5. Replay protection via a hash of Message-ID + sender + date prevents
   duplicate processing.

**Status**: The endpoint fails closed (503) when `INBOUND_EMAIL_SECRET` is
not set. It is infrastructure-ready but requires Cloudflare Email Routing /
Email Worker configuration to activate. See
`docs/inbound-email-continuity.md` for the continuity plan.

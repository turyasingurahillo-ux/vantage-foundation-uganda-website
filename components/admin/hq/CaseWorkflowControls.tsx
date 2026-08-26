"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import {
  CASE_WORKFLOW_STATUSES,
  CASE_PRIORITIES,
  CASE_RISK_LEVELS,
  CASE_STRATEGIC_VALUES,
  CASE_TYPES,
  CASE_PROGRAMMES,
  type CaseWorkflowStatus,
  type CasePriority,
  type CaseRiskLevel,
  type CaseStrategicValue,
  type CaseType,
  type CaseProgramme,
} from "@/lib/case-types";
import type { CaseRow } from "@/lib/db/cases";

interface CaseWorkflowControlsProps {
  case: CaseRow;
  admins: { id: number; username: string }[];
  csrfToken: string;
  csrfFieldName: string;
}

/**
 * Case workflow controls — the primary case-management form.
 *
 * Posts to /api/admin/cases/update as a normal form (works without JS).
 * The client-side parts add progressive disclosure: the form is collapsed
 * into a summary view by default and expands on demand, so the conversation
 * pane is not overloaded.
 *
 * Fields: workflow status, case type, programme, priority, risk, strategic
 * value, owner, next action + due date. Outcome/decline/referral are in a
 * separate component (CaseOutcomeControls) to keep this view focused on
 * the active workflow.
 */
export function CaseWorkflowControls({
  case: caseRow,
  admins,
  csrfToken,
  csrfFieldName,
}: CaseWorkflowControlsProps) {
  const [expanded, setExpanded] = useState(false);
  const [pending, startTransition] = useTransition();

  const hasMetadata =
    caseRow.caseType ||
    caseRow.programme ||
    caseRow.priority !== "normal" ||
    caseRow.riskLevel !== "unknown" ||
    caseRow.strategicValue !== "unknown" ||
    caseRow.ownerId ||
    caseRow.nextAction ||
    caseRow.nextActionDueAt;

  return (
    <div className="space-y-3">
      {/* Summary view — always visible */}
      <div className="flex flex-wrap items-center gap-2">
        <form
          method="post"
          action="/api/admin/cases/update"
          className="inline-flex"
          onSubmit={(e) => {
            // Let the form submit normally; the transition is for UX state.
            startTransition(() => {});
            // Don't preventDefault — we want the native form POST + redirect.
            void e;
          }}
        >
          <input type="hidden" name={csrfFieldName} value={csrfToken} />
          <input type="hidden" name="id" value={caseRow.id} />
          <label htmlFor={`workflow-${caseRow.id}`} className="sr-only">
            Workflow status
          </label>
          <select
            id={`workflow-${caseRow.id}`}
            name="workflowStatus"
            value={caseRow.workflowStatus}
            onChange={(e) => {
              const form = e.currentTarget.form;
              if (form) form.requestSubmit();
            }}
            disabled={pending}
            className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {CASE_WORKFLOW_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </form>

        {caseRow.priority !== "normal" && caseRow.priority !== "low" && (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
              caseRow.priority === "critical"
                ? "bg-destructive-bg text-destructive-fg"
                : "bg-warning-bg text-warning-fg",
            )}
          >
            {caseRow.priority}
          </span>
        )}

        {caseRow.nextActionDueAt && (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              isOverdue(caseRow.nextActionDueAt)
                ? "bg-destructive-bg text-destructive-fg"
                : "bg-surface text-muted-foreground",
            )}
          >
            {isOverdue(caseRow.nextActionDueAt) ? "Overdue: " : "Due: "}
            {formatDate(caseRow.nextActionDueAt)}
          </span>
        )}

        {caseRow.ownerId && (
          <span className="inline-flex items-center rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {adminName(caseRow.ownerId, admins)}
          </span>
        )}

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="ml-auto text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
        >
          {expanded ? "Hide details" : hasMetadata ? "Edit details" : "Add details"}
        </button>
      </div>

      {/* Expanded view — progressive disclosure */}
      {expanded && (
        <form
          method="post"
          action="/api/admin/cases/update"
          className="space-y-4 rounded-lg border border-border bg-surface/50 p-4"
        >
          <input type="hidden" name={csrfFieldName} value={csrfToken} />
          <input type="hidden" name="id" value={caseRow.id} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Case type" id={`caseType-${caseRow.id}`}>
              <Select
                id={`caseType-${caseRow.id}`}
                name="caseType"
                value={caseRow.caseType ?? ""}
                options={CASE_TYPES}
              />
            </Field>

            <Field label="Programme" id={`programme-${caseRow.id}`}>
              <Select
                id={`programme-${caseRow.id}`}
                name="programme"
                value={caseRow.programme ?? ""}
                options={CASE_PROGRAMMES}
              />
            </Field>

            <Field label="Priority" id={`priority-${caseRow.id}`}>
              <Select
                id={`priority-${caseRow.id}`}
                name="priority"
                value={caseRow.priority}
                options={CASE_PRIORITIES}
              />
            </Field>

            <Field label="Risk level" id={`risk-${caseRow.id}`}>
              <Select
                id={`risk-${caseRow.id}`}
                name="riskLevel"
                value={caseRow.riskLevel}
                options={CASE_RISK_LEVELS}
              />
            </Field>

            <Field label="Strategic value" id={`strategic-${caseRow.id}`}>
              <Select
                id={`strategic-${caseRow.id}`}
                name="strategicValue"
                value={caseRow.strategicValue}
                options={CASE_STRATEGIC_VALUES}
              />
            </Field>

            <Field label="Owner" id={`owner-${caseRow.id}`}>
              <select
                id={`owner-${caseRow.id}`}
                name="ownerId"
                defaultValue={caseRow.ownerId ?? ""}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="">Unassigned</option>
                {admins.map((a) => (
                  <option key={a.id} value={String(a.id)}>
                    {a.username}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Next action" id={`nextAction-${caseRow.id}`}>
            <input
              id={`nextAction-${caseRow.id}`}
              name="nextAction"
              type="text"
              maxLength={500}
              defaultValue={caseRow.nextAction ?? ""}
              placeholder="e.g. Send registration certificate request"
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </Field>

          <Field label="Next action due date" id={`dueDate-${caseRow.id}`}>
            <input
              id={`dueDate-${caseRow.id}`}
              name="nextActionDueAt"
              type="date"
              defaultValue={
                caseRow.nextActionDueAt
                  ? caseRow.nextActionDueAt.toISOString().split("T")[0]
                  : ""
              }
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </Field>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Save details
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function Select({
  id,
  name,
  value,
  defaultValue,
  options,
}: {
  id: string;
  name: string;
  value?: string;
  defaultValue?: string;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <select
      id={id}
      name={name}
      {...(value !== undefined ? { value } : { defaultValue: defaultValue ?? "" })}
      className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <option value="">—</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function isOverdue(dueAt: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueAt) < today;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function adminName(
  ownerId: string,
  admins: { id: number; username: string }[],
): string {
  const admin = admins.find((a) => String(a.id) === ownerId);
  return admin ? admin.username : "Assigned";
}

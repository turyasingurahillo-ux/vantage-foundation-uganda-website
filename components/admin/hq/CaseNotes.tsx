"use client";

import { useState } from "react";
import { formatDateTime } from "@/lib/format";
import type { CaseNoteRow } from "@/lib/db/cases";

interface CaseNotesProps {
  caseId: number;
  notes: CaseNoteRow[];
  adminNames: Record<string, string>;
  csrfToken: string;
  csrfFieldName: string;
}

const NOTE_MAX_LENGTH = 5000;

/**
 * Internal notes section for a case.
 *
 * Notes are NEVER emailed to the enquirer and NEVER exposed publicly. They
 * live in the case_notes table, structurally separate from
 * contact_message_replies (outward-facing correspondence), so no code path
 * can accidentally send a note as an email.
 *
 * The form posts to /api/admin/cases/note as a normal form (works without
 * JS). The client-side part only adds a pending state.
 */
export function CaseNotes({
  caseId,
  notes,
  adminNames,
  csrfToken,
  csrfFieldName,
}: CaseNotesProps) {
  const [pending, setPending] = useState(false);
  const [value, setValue] = useState("");
  const empty = value.trim().length === 0;
  const textareaId = `note-body-${caseId}`;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Internal notes
        </p>
        {notes.length > 0 && (
          <span className="inline-flex items-center rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {notes.length}
          </span>
        )}
        <span className="text-xs text-muted-foreground">
          Never emailed to the enquirer
        </span>
      </div>

      {/* Existing notes — oldest first */}
      {notes.length > 0 && (
        <ul className="space-y-2">
          {notes.map((note) => (
            <li
              key={note.id}
              className="rounded-lg border border-border bg-surface/50 p-3"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {note.adminActorId
                    ? adminNames[note.adminActorId] ?? "Admin"
                    : "System"}
                </p>
                <time
                  dateTime={note.createdAt.toISOString()}
                  className="text-xs text-muted-foreground"
                >
                  {formatDateTime(note.createdAt)}
                </time>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                {note.body}
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* Note composer */}
      <form
        method="post"
        action="/api/admin/cases/note"
        onSubmit={(e) => {
          if (pending || empty) {
            e.preventDefault();
            return;
          }
          setPending(true);
        }}
      >
        <input type="hidden" name={csrfFieldName} value={csrfToken} />
        <input type="hidden" name="id" value={caseId} />

        <label htmlFor={textareaId} className="sr-only">
          Add an internal note
        </label>
        <textarea
          id={textareaId}
          name="body"
          required
          rows={3}
          maxLength={NOTE_MAX_LENGTH}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          readOnly={pending}
          aria-disabled={pending}
          placeholder="Add an internal note (never sent to the enquirer)…"
          className={`w-full rounded-lg border border-border p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary${
            pending ? " opacity-60" : ""
          }`}
        />

        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground" aria-live="polite">
            {value.length}/{NOTE_MAX_LENGTH}
          </span>
          <button
            type="submit"
            disabled={pending || empty}
            className="rounded-lg bg-surface px-4 py-2 text-sm font-medium border border-border hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {pending ? "Saving…" : "Add note"}
          </button>
        </div>
      </form>
    </div>
  );
}

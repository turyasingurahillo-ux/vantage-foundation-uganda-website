"use client";

import { useState } from "react";

/**
 * Inline reply composer for one conversation.
 *
 * Posts a normal form to /api/admin/messages/reply, so it still works without
 * JavaScript. The client-side parts only add polish: a disabled/pending state
 * and a stable idempotency key so a double-click cannot queue two emails.
 *
 * The key is generated once per mount. If the admin submits twice, both
 * requests carry the same key, the second collides with the UNIQUE index
 * server-side, and no second email is sent.
 */
export function ReplyComposer({
  messageId,
  recipientName,
  recipientEmail,
  fromAddress,
  csrfToken,
  /** Passed in rather than imported: lib/csrf is server-only. */
  csrfFieldName,
  maxLength,
}: {
  messageId: number;
  recipientName: string;
  recipientEmail: string;
  fromAddress: string;
  csrfToken: string;
  csrfFieldName: string;
  maxLength: number;
}) {
  const [idempotencyKey] = useState(
    () => `${messageId}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
  );
  const [pending, setPending] = useState(false);
  const [value, setValue] = useState("");

  const empty = value.trim().length === 0;
  const textareaId = `reply-body-${messageId}`;

  return (
    <form
      method="post"
      action="/api/admin/messages/reply"
      className="mt-6 border-t border-border pt-5"
      onSubmit={(e) => {
        if (pending || empty) {
          e.preventDefault();
          return;
        }
        setPending(true);
      }}
    >
      <input type="hidden" name={csrfFieldName} value={csrfToken} />
      <input type="hidden" name="id" value={messageId} />
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <label htmlFor={textareaId} className="text-sm font-semibold">
          Reply to {recipientName}
        </label>
        <p className="text-xs text-muted-foreground">
          To <span className="font-medium">{recipientEmail}</span>
          {fromAddress ? <> · from {fromAddress}</> : null}
        </p>
      </div>

      <textarea
        id={textareaId}
        name="body"
        required
        rows={5}
        maxLength={maxLength}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={pending}
        placeholder={`Write your reply to ${recipientName}…`}
        aria-describedby={`${textareaId}-hint`}
        className="mt-2 w-full rounded-lg border border-border p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
      />

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <p id={`${textareaId}-hint`} className="text-xs text-muted-foreground">
          Sent as a normal email from Vantage. Their original message is quoted
          underneath automatically.
        </p>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground" aria-live="polite">
            {value.length}/{maxLength}
          </span>
          <button
            type="submit"
            disabled={pending || empty}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Sending…" : "Send reply"}
          </button>
        </div>
      </div>
    </form>
  );
}

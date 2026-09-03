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
 * server-side, and no second email is sent. A retry deliberately gets a
 * different key — it is a new attempt, not a replay of the failed one — which
 * `serverKey` supplies from the page render so it works with JavaScript off.
 *
 * `context` carries where in the inbox the administrator is (tab, search,
 * page). The server validates every field and rebuilds the URL itself; these
 * are hints, not a destination.
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
  context = {},
  initialBody = "",
  retryOfReplyId,
  serverKey,
  autoFocus = false,
}: {
  messageId: number;
  recipientName: string;
  recipientEmail: string;
  fromAddress: string;
  csrfToken: string;
  csrfFieldName: string;
  maxLength: number;
  context?: Record<string, string>;
  initialBody?: string;
  retryOfReplyId?: number;
  serverKey?: string;
  autoFocus?: boolean;
}) {
  const [idempotencyKey] = useState(
    () =>
      serverKey ??
      `${messageId}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
  );
  const [pending, setPending] = useState(false);
  const [value, setValue] = useState(initialBody);

  const empty = value.trim().length === 0;
  const textareaId = `reply-body-${messageId}`;
  const isRetry = typeof retryOfReplyId === "number";

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
      {isRetry && (
        <input type="hidden" name="retryOf" value={retryOfReplyId} />
      )}
      {Object.entries(context).map(([name, fieldValue]) => (
        <input key={name} type="hidden" name={name} value={fieldValue} />
      ))}

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <label htmlFor={textareaId} className="text-sm font-semibold">
          {isRetry ? "Retry reply to" : "Reply to"} {recipientName}
        </label>
        <p className="text-xs text-muted-foreground">
          To <span className="font-medium">{recipientEmail}</span>
          {fromAddress ? <> · from {fromAddress}</> : null}
        </p>
      </div>

      {isRetry && (
        <p className="mt-2 rounded-md border border-warning-fg/30 bg-warning-bg p-3 text-xs text-warning-fg">
          This is the text of the reply that failed to send. Edit it if you want
          to, then send. The failed attempt stays in the conversation below as a
          record — it is not overwritten.
        </p>
      )}

      <textarea
        id={textareaId}
        name="body"
        required
        rows={5}
        maxLength={maxLength}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        // A `disabled` control is omitted from FormData, so disabling the
        // textarea while a reply is in flight caused the submitted `body` to
        // become null and the server to reject the reply with a raw Zod
        // error. `readOnly` keeps the value in the form (readOnly controls
        // are still submitted) while still blocking edits during submission;
        // `aria-disabled` communicates the inactive state to assistive tech.
        readOnly={pending}
        aria-disabled={pending}
        // Focus follows the action that opened the composer, so replying is
        // keyboard-only from the inbox: activate Reply, start typing. The page
        // suppresses it when it is showing a banner, so that a send failure is
        // never scrolled past on the way to the text box.
        autoFocus={autoFocus}
        placeholder={`Write your reply to ${recipientName}…`}
        aria-describedby={`${textareaId}-hint`}
        className={`mt-2 w-full rounded-lg border border-border p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary${
          pending ? " opacity-60" : ""
        }`}
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
            {pending ? "Sending…" : isRetry ? "Send retry" : "Send reply"}
          </button>
        </div>
      </div>
    </form>
  );
}

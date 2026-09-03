import { CSRF_FIELD_NAME } from "@/lib/csrf";
import type { ContactMessageStatus } from "@/lib/db/contact";
import { cn } from "@/lib/utils";

interface MessageWorkflowActionsProps {
  messageId: number;
  status: ContactMessageStatus;
  csrfToken: string;
}

/**
 * Workflow action buttons for a conversation.
 *
 * Hierarchy:
 *   PRIMARY:   (none — the reply composer is the primary action)
 *   SECONDARY: status transitions appropriate to the current state
 *   TERTIARY:  resend internal notification
 *
 * The resend action is visually de-emphasised because it is an operational
 * recovery action, not a reply to the enquirer.
 *
 * Note: the status and resend APIs redirect back to /admin/messages with
 * their own params. They do not preserve the open/search state. That can
 * be addressed later only if we intentionally design a safe allow-listed
 * return-state mechanism. Do not add arbitrary returnTo URLs.
 */
export function MessageWorkflowActions({
  messageId,
  status,
  csrfToken,
}: MessageWorkflowActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "archived" ? (
        <StatusForm
          action="/api/admin/messages/status"
          messageId={messageId}
          status="new"
          csrfToken={csrfToken}
          label="Reopen"
          variant="secondary"
        />
      ) : (
        <>
          {status !== "new" && (
            <StatusForm
              action="/api/admin/messages/status"
              messageId={messageId}
              status="new"
              csrfToken={csrfToken}
              label="Mark as new"
              variant="secondary"
            />
          )}
          {status === "new" && (
            <StatusForm
              action="/api/admin/messages/status"
              messageId={messageId}
              status="awaiting_response"
              csrfToken={csrfToken}
              label="Mark as awaiting response"
              variant="secondary"
            />
          )}
          <StatusForm
            action="/api/admin/messages/status"
            messageId={messageId}
            status="archived"
            csrfToken={csrfToken}
            label="Archive"
            variant="secondary"
          />
        </>
      )}

      {/* Tertiary: internal team notification, NOT a reply to the sender. */}
      <StatusForm
        action="/api/admin/messages/resend"
        messageId={messageId}
        csrfToken={csrfToken}
        label="Resend team notification"
        variant="tertiary"
      />
    </div>
  );
}

function StatusForm({
  action,
  messageId,
  status,
  csrfToken,
  label,
  variant,
}: {
  action: string;
  messageId: number;
  status?: string;
  csrfToken: string;
  label: string;
  variant: "secondary" | "tertiary";
}) {
  return (
    <form method="post" action={action} className="inline">
      <input type="hidden" name={CSRF_FIELD_NAME} value={csrfToken} />
      <input type="hidden" name="id" value={messageId} />
      {status ? <input type="hidden" name="status" value={status} /> : null}
      <button
        type="submit"
        className={cn(
          "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          variant === "secondary"
            ? "border border-border bg-white text-foreground hover:bg-surface"
            : "text-muted-foreground underline hover:text-foreground",
        )}
      >
        {label}
      </button>
    </form>
  );
}

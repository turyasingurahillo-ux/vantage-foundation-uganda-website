import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";
import type { ContactMessageRow } from "@/lib/db/contact";
import type { ContactReplyRow } from "@/lib/db/contact-replies";

interface ConversationTimelineProps {
  message: ContactMessageRow;
  replies: ContactReplyRow[];
  adminNames: Record<string, string>;
  onRetry?: (reply: ContactReplyRow) => void;
}

function actorLabel(
  adminActorId: string | undefined,
  adminNames: Record<string, string>,
): string | null {
  if (!adminActorId) return null;
  const name = adminNames[adminActorId];
  if (name) return `Sent by ${name}`;
  return "Sent by Vantage admin";
}

/**
 * Chronological conversation timeline: original submission followed by
 * outbound replies in order.
 *
 * Message and reply bodies are rendered as plain text (whitespace-pre-wrap)
 * — never as HTML.
 */
export function ConversationTimeline({
  message,
  replies,
  adminNames,
  onRetry,
}: ConversationTimelineProps) {
  return (
    <div className="space-y-4">
      {/* Original submission */}
      <div className="rounded-lg bg-surface p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">{message.name}</p>
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
        <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">
          {message.message}
        </p>
      </div>

      {/* Correspondence, oldest first */}
      {replies.map((reply) => {
        const isOutbound = reply.direction === "outbound";
        return (
          <div
            key={reply.id}
            className={cn(
              "rounded-lg p-4",
              isOutbound
                ? "border border-primary/30 bg-primary/5 md:ml-8"
                : "bg-surface",
            )}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">
                {isOutbound ? "Vantage Foundation Uganda" : message.name}
              </p>
              <div className="flex items-center gap-2">
                {reply.sendStatus === "failed" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-destructive-bg px-2 py-0.5 text-xs font-semibold text-destructive-fg">
                    Not sent
                  </span>
                )}
                {reply.sendStatus === "pending" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-warning-bg px-2 py-0.5 text-xs font-semibold text-warning-fg">
                    Sending
                  </span>
                )}
                {reply.sendStatus === "sent" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2 py-0.5 text-xs font-semibold text-success-fg">
                    Sent
                  </span>
                )}
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
              {reply.adminActorId ? (
                <> · {actorLabel(reply.adminActorId, adminNames)}</>
              ) : null}
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">
              {reply.body}
            </p>
            {reply.sendStatus === "failed" && (
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {reply.errorDetail && (
                  <p className="text-xs text-destructive-fg">
                    Delivery failed: {reply.errorDetail}.
                  </p>
                )}
                {isOutbound && onRetry && (
                  <button
                    type="button"
                    onClick={() => onRetry(reply)}
                    className="text-xs font-semibold text-primary underline hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    Retry this reply
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

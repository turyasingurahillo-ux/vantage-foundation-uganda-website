import { formatDateTime } from "@/lib/format";
import { getCategoryLabel } from "@/lib/contact-categories";
import type { ContactMessageRow } from "@/lib/db/contact";
import { MessageStatusBadge } from "./MessageStatusBadge";

interface ConversationHeaderProps {
  message: ContactMessageRow;
}

/**
 * Header for the conversation pane showing sender metadata and
 * workflow status.
 */
export function ConversationHeader({ message }: ConversationHeaderProps) {
  return (
    <div className="border-b border-border pb-4">
      <div className="flex flex-wrap items-center gap-2">
        <MessageStatusBadge status={message.status} />
        <span className="inline-flex shrink-0 items-center rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {getCategoryLabel(message.category)}
        </span>
        {!message.emailSent && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-destructive-bg px-2 py-0.5 text-xs font-medium text-destructive-fg">
            Team notification not sent
          </span>
        )}
      </div>

      <h2 className="mt-3 text-lg font-semibold text-foreground">
        {message.name}
        {message.organisation ? (
          <span className="font-normal text-muted-foreground">
            {" "}
            — {message.organisation}
          </span>
        ) : null}
      </h2>

      <dl className="mt-2 space-y-0.5 text-sm text-muted-foreground">
        <div className="flex gap-2">
          <dt className="shrink-0 font-medium">Email</dt>
          <dd className="min-w-0 break-all">
            <a
              href={`mailto:${encodeURIComponent(message.email)}`}
              className="text-primary underline hover:text-primary-dark"
            >
              {message.email}
            </a>
          </dd>
        </div>
        {message.phone && (
          <div className="flex gap-2">
            <dt className="shrink-0 font-medium">Phone</dt>
            <dd>{message.phone}</dd>
          </div>
        )}
        {message.organisation && (
          <div className="flex gap-2">
            <dt className="shrink-0 font-medium">Organisation</dt>
            <dd>{message.organisation}</dd>
          </div>
        )}
        <div className="flex gap-2">
          <dt className="shrink-0 font-medium">Submitted</dt>
          <dd>
            <time dateTime={message.createdAt.toISOString()}>
              {formatDateTime(message.createdAt)}
            </time>
          </dd>
        </div>
        {message.lastRepliedAt && (
          <div className="flex gap-2">
            <dt className="shrink-0 font-medium">Last replied</dt>
            <dd>
              <time dateTime={message.lastRepliedAt.toISOString()}>
                {formatDateTime(message.lastRepliedAt)}
              </time>
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}

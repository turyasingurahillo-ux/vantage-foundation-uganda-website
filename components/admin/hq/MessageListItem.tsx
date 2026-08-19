import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import { getCategoryLabel } from "@/lib/contact-categories";
import type { ContactMessageRow } from "@/lib/db/contact";
import { MessageStatusBadge } from "./MessageStatusBadge";

interface MessageListItemProps {
  message: ContactMessageRow;
  selected: boolean;
  /** URL search params string to preserve, e.g. "filter=new&q=hello". */
  preserveParams: string;
  replyCount?: number;
}

/**
 * One row in the inbox message list.
 *
 * The row is a link so it works without JavaScript. The selected state
 * is communicated by aria-current and a visual indicator, not by colour
 * alone.
 */
export function MessageListItem({
  message,
  selected,
  preserveParams,
  replyCount = 0,
}: MessageListItemProps) {
  const href = `/admin/messages?${preserveParams}&open=${message.id}`;

  return (
    <li role="none">
      <Link
        href={href}
        aria-current={selected ? "true" : undefined}
        className={cn(
          "block border-b border-border p-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
          selected
            ? "bg-primary/5 border-l-2 border-l-primary"
            : "hover:bg-surface border-l-2 border-l-transparent",
        )}
      >
        <div className="flex items-center gap-2">
          <MessageStatusBadge status={message.status} />
          {!message.emailSent && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-destructive-bg px-2 py-0.5 text-xs font-medium text-destructive-fg">
              Notification not sent
            </span>
          )}
          <time
            dateTime={message.createdAt.toISOString()}
            className="ml-auto shrink-0 text-xs text-muted-foreground"
          >
            {formatRelativeTime(message.createdAt)}
          </time>
        </div>

        <p className="mt-1.5 truncate text-sm font-semibold text-foreground">
          {message.name}
          {message.organisation ? (
            <span className="font-normal text-muted-foreground">
              {" "}
              — {message.organisation}
            </span>
          ) : null}
        </p>

        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {getCategoryLabel(message.category)}
        </p>

        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
          {message.message}
        </p>

        {replyCount > 0 && (
          <p className="mt-1 text-xs font-medium text-primary">
            {replyCount} {replyCount === 1 ? "reply" : "replies"}
          </p>
        )}
      </Link>
    </li>
  );
}

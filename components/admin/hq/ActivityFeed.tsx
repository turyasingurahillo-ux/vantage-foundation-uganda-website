import { formatRelativeTime } from "@/lib/format";
import type { AuditLogEntry } from "@/lib/db/audit";
import { EmptyState } from "./EmptyState";

interface ActivityFeedProps {
  entries: AuditLogEntry[];
  /** Lookup from admin id to username. */
  adminNames?: Record<string, string>;
}

const ACTION_LABELS: Record<string, string> = {
  "donation.verified": "Verified a donation",
  "donation.rejected": "Rejected a donation",
  "donation.pending": "Reset a donation to pending",
  "media.created": "Uploaded media",
  "media.updated": "Updated media",
  "media.deleted": "Deleted media",
  "story.created": "Created a story",
  "story.updated": "Updated a story",
  "story.deleted": "Deleted a story",
  "admin.created": "Created an admin account",
  "admin.disabled": "Disabled an admin account",
  "contact_message.reply": "Replied to a contact message",
  "contact_message.status": "Updated a contact message",
  "contact_message.resend": "Resent an internal message notification",
};

function actorLabel(
  actorId: string,
  actorKind: string,
  adminNames: Record<string, string>,
): string {
  if (actorKind === "bootstrap") return "Bootstrap";
  if (actorKind === "system") return "System";
  return adminNames[actorId] ?? `Admin #${actorId}`;
}

function resourceLink(entry: AuditLogEntry): string | null {
  if (!entry.resourceId) return null;
  switch (entry.resourceType) {
    case "donation":
      return `/admin/donations/${entry.resourceId}`;
    case "story":
      return `/admin/stories/${entry.resourceId}`;
    case "media":
      return `/admin/media`;
    case "contact_message":
      return `/admin/messages?open=${entry.resourceId}`;
    default:
      return null;
  }
}

/**
 * Recent activity feed for the dashboard.
 *
 * Renders human-readable entries from the audit log — never raw JSON.
 * Each entry shows the actor, action, resource, and relative time.
 */
export function ActivityFeed({ entries, adminNames = {} }: ActivityFeedProps) {
  if (entries.length === 0) {
    return (
      <EmptyState
        title="No recent activity"
        description="Actions will appear here once admins start verifying donations or managing content."
      />
    );
  }

  return (
    <ol className="space-y-1">
      {entries.map((entry) => {
        const label =
          ACTION_LABELS[entry.action] ?? entry.action.replace(/\./g, " ");
        const actor = actorLabel(entry.actorId, entry.actorKind, adminNames);
        const link = resourceLink(entry);
        const time = formatRelativeTime(entry.createdAt);

        return (
          <li
            key={entry.id}
            className="flex items-start gap-3 rounded-lg px-3 py-2 hover:bg-surface"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground">
                <span className="font-medium">{actor}</span>{" "}
                <span className="text-muted-foreground">{label}</span>
                {entry.resourceId && (
                  <>
                    {" "}
                    {link ? (
                      <a
                        href={link}
                        className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
                      >
                        #{entry.resourceId}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">
                        #{entry.resourceId}
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>
            <time
              dateTime={new Date(entry.createdAt).toISOString()}
              className="shrink-0 text-xs text-muted-foreground"
            >
              {time}
            </time>
          </li>
        );
      })}
    </ol>
  );
}

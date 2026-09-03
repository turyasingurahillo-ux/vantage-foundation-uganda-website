import { formatDateTime } from "@/lib/format";
import {
  COMMUNICATION_CHANNELS,
  COMMUNICATION_DIRECTIONS,
  getCommunicationChannelLabel,
  type CaseCommunicationRow,
} from "@/lib/organisation-types";

interface CaseCommunicationLogProps {
  caseId: number;
  communications: CaseCommunicationRow[];
  csrfToken: string;
  csrfFieldName: string;
}

/**
 * Manual communication logging for an existing case.
 *
 * Lets staff record WhatsApp messages, phone calls, meetings, social media
 * conversations, and walk-in interactions without creating a new case.
 * This avoids the problem of the same requester contacting Vantage through
 * multiple channels and each interaction becoming a separate case.
 */
export function CaseCommunicationLog({
  caseId,
  communications,
  csrfToken,
  csrfFieldName,
}: CaseCommunicationLogProps) {
  return (
    <div>
      <details>
        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Communication log ({communications.length})
        </summary>
        <div className="mt-3 space-y-3">
          {/* Existing communications */}
          {communications.length > 0 && (
            <ul className="space-y-2">
              {communications.map((comm) => (
                <li
                  key={comm.id}
                  className="rounded-md border border-border p-3 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">
                      {getCommunicationChannelLabel(comm.channel)}
                      <span className="ml-2 text-xs text-muted-foreground">
                        {comm.direction === "inbound" ? "← Inbound" : "→ Outbound"}
                      </span>
                    </span>
                    <time className="text-xs text-muted-foreground">
                      {formatDateTime(comm.occurredAt)}
                    </time>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {comm.summary}
                  </p>
                  {comm.staffMember && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Staff: {comm.staffMember}
                    </p>
                  )}
                  {comm.isInternal && (
                    <span className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-xs">
                      Internal
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Add communication form */}
          <form
            action="/api/admin/cases/communication"
            method="POST"
            className="space-y-2 rounded-md border border-dashed border-border p-3"
          >
            <input type="hidden" name={csrfFieldName} value={csrfToken} />
            <input type="hidden" name="caseId" value={caseId} />
            <div className="flex gap-2">
              <select
                name="direction"
                required
                className="rounded-md border border-border bg-background px-2 py-1.5 text-xs"
              >
                {COMMUNICATION_DIRECTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
              <select
                name="channel"
                required
                className="rounded-md border border-border bg-background px-2 py-1.5 text-xs"
              >
                {COMMUNICATION_CHANNELS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                type="datetime-local"
                name="occurredAt"
                className="rounded-md border border-border bg-background px-2 py-1.5 text-xs"
                title="When it occurred"
              />
            </div>
            <textarea
              name="summary"
              placeholder="Summary of the conversation..."
              required
              maxLength={2000}
              rows={2}
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
            />
            <div className="flex gap-2">
              <input
                type="text"
                name="staffMember"
                placeholder="Staff member name"
                maxLength={200}
                className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-xs"
              />
              <label className="flex items-center gap-1 text-xs text-muted-foreground">
                <input type="checkbox" name="isInternal" value="true" />
                Internal
              </label>
              <button
                type="submit"
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-fg hover:bg-primary/90"
              >
                Log
              </button>
            </div>
          </form>
        </div>
      </details>
    </div>
  );
}

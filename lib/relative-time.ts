/**
 * Short relative timestamps for operational screens.
 *
 * An inbox is read by someone deciding what to do next, and "3 hours ago"
 * answers that question directly where "17 Aug 2026, 09:14" has to be
 * subtracted from the current time first. The exact timestamp is never
 * discarded — callers put it in the `title` and `dateTime` attributes, so it
 * stays available to anyone who needs the real value, including screen
 * readers and anybody copying it into an email.
 *
 * Rendered on the server (these pages are force-dynamic), so there is no
 * client clock to disagree with.
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

function plural(value: number, unit: string): string {
  return `${value} ${unit}${value === 1 ? "" : "s"}`;
}

/**
 * "just now", "12 min ago", "3 hours ago", "2 days ago", "5 weeks ago".
 *
 * Past the eight-week mark relative distances stop being useful and the caller
 * is better served by the absolute date, so this returns null and lets it
 * decide.
 */
export function formatRelativeTime(
  date: Date,
  now: Date = new Date(),
): string | null {
  const diff = now.getTime() - date.getTime();

  // A clock skew of a few seconds between database and server is normal and
  // should not produce "in 2 seconds".
  if (diff < MINUTE) return "just now";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} min ago`;
  if (diff < DAY) return `${plural(Math.floor(diff / HOUR), "hour")} ago`;
  if (diff < WEEK) return `${plural(Math.floor(diff / DAY), "day")} ago`;
  if (diff < 8 * WEEK) return `${plural(Math.floor(diff / WEEK), "week")} ago`;
  return null;
}

/** The full timestamp, for titles and accessible text. */
export function formatDateTime(date: Date): string {
  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/**
 * Relative where that reads well, absolute where it does not — and always with
 * the exact value available as `title`.
 */
export function describeTime(
  date: Date,
  now: Date = new Date(),
): { text: string; exact: string } {
  const exact = formatDateTime(date);
  return { text: formatRelativeTime(date, now) ?? exact, exact };
}

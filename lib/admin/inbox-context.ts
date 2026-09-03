import { isInboxFilter, type InboxFilter } from "@/lib/db/contact";
import { isContactCategory } from "@/lib/contact-categories";

/**
 * Where in the inbox an administrator was when they pressed a button.
 *
 * Every mutation on /admin/messages ends in a redirect, and the redirect has
 * to land them back on the page they were looking at — same tab, same search,
 * same page number, same conversation open — or archiving the fourth of forty
 * conversations throws away the position they had worked to reach.
 *
 * The browser is NOT asked where to go back to. It submits these individual
 * fields, each of which is validated against a closed set here, and the
 * destination is then built from scratch server-side. There is no field
 * anywhere in the inbox that accepts a URL, so there is no input from which an
 * open redirect could be constructed: an attacker who forges
 * `filter=https://evil.example` gets the default tab, because that string is
 * not one of the five permitted filters.
 */

/** Longest search term accepted. Bounds both the URL and the ILIKE pattern. */
export const MAX_SEARCH_LENGTH = 100;

/** Refuses absurd page numbers rather than trusting a hand-edited URL. */
const MAX_PAGE = 10_000;

export interface InboxContext {
  filter: InboxFilter;
  q: string;
  page: number;
  /** Conversation to expand on arrival, if any. */
  open: number | null;
  category: string;
}

/** A field source: form submissions and URL query strings both provide this. */
export interface FieldSource {
  get(name: string): unknown;
}

function str(source: FieldSource, name: string): string {
  const value = source.get(name);
  return typeof value === "string" ? value : "";
}

/**
 * Validates whatever the browser sent into a context that can only describe a
 * place inside /admin/messages. Anything unrecognised falls back to a default
 * — this never throws, because a mangled hidden field should not cost an
 * administrator the action they just took.
 */
export function parseInboxContext(source: FieldSource): InboxContext {
  const rawFilter = str(source, "filter");
  const rawCategory = str(source, "category");
  const rawPage = Number(str(source, "page"));
  const rawOpen = Number(str(source, "open"));

  return {
    filter: isInboxFilter(rawFilter) ? rawFilter : "new",
    q: str(source, "q").slice(0, MAX_SEARCH_LENGTH),
    page:
      Number.isInteger(rawPage) && rawPage >= 1 && rawPage <= MAX_PAGE
        ? rawPage
        : 1,
    open: Number.isInteger(rawOpen) && rawOpen > 0 ? rawOpen : null,
    category: isContactCategory(rawCategory) ? rawCategory : "",
  };
}

/**
 * Builds the inbox URL for a validated context.
 *
 * Always relative, always /admin/messages, and only ever carries parameters
 * the parser above produced. `extra` adds the outcome banner (replied=1,
 * error=send, …); its values are encoded like everything else.
 *
 * Defaults are omitted so the common URL stays short and readable.
 */
export function buildInboxUrl(
  context: InboxContext,
  extra: Record<string, string | number | null | undefined> = {},
): string {
  const params = new URLSearchParams();
  params.set("filter", context.filter);
  if (context.q) params.set("q", context.q);
  if (context.category) params.set("category", context.category);
  if (context.page > 1) params.set("page", String(context.page));
  if (context.open) params.set("open", String(context.open));

  for (const [key, value] of Object.entries(extra)) {
    if (value === null || value === undefined || value === "") continue;
    params.set(key, String(value));
  }

  const fragment = context.open ? `#message-${context.open}` : "";
  return `/admin/messages?${params.toString()}${fragment}`;
}

/** The same context with a different conversation expanded (or none). */
export function withOpen(
  context: InboxContext,
  open: number | null,
): InboxContext {
  return { ...context, open };
}

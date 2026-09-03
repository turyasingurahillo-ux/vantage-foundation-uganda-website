/**
 * Centralised formatting helpers for admin UI.
 *
 * Amounts are stored as NUMERIC(12,2) with a separate currency column.
 * The canonical display format is "{currency} {amount}" with thousands
 * separators and no decimal places for UGX (which has no minor unit).
 * Other supported currencies (USD, EUR, GBP, KES) also display without
 * cents in the admin queue for readability; the review workspace shows
 * the full amount.
 *
 * Never prefix the currency symbol twice — the DB stores the ISO code
 * (e.g. "UGX"), not a symbol, so we always render the code, never "UGX UGX".
 */

const NO_DECIMAL_CURRENCIES = new Set(["UGX", "KES"]);

/**
 * Formats a monetary amount as "{currency} {amount}" with thousands separators.
 * UGX and KES (no minor unit) render without decimals; others use 2 decimals.
 *
 * Examples:
 *   formatMoney(100000, "UGX") → "UGX 100,000"
 *   formatMoney(50.5, "USD")   → "USD 50.50"
 */
export function formatMoney(amount: number, currency: string = "UGX"): string {
  const code = currency || "UGX";
  const decimals = NO_DECIMAL_CURRENCIES.has(code) ? 0 : 2;
  const formatted = Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const sign = amount < 0 ? "-" : "";
  return `${sign}${code} ${formatted}`;
}

/**
 * Compact money format for tight table cells — same as formatMoney but
 * guaranteed no decimals, suitable for the donation queue list.
 */
export function formatMoneyCompact(amount: number, currency: string = "UGX"): string {
  const code = currency || "UGX";
  const formatted = Math.round(Math.abs(amount)).toLocaleString("en-US");
  const sign = amount < 0 ? "-" : "";
  return `${sign}${code} ${formatted}`;
}

/**
 * Formats a date as a readable admin timestamp.
 * Example: "19 Aug 2026, 13:39"
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formats a date as a short date only.
 * Example: "19 Aug 2026"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Relative time for activity feeds.
 * Returns a human-readable "time ago" string.
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(d);
}

import "server-only";

/**
 * Google Search Console integration — server-only architecture.
 *
 * SECURITY: Google service credentials are NEVER exposed to the browser. They
 * are read from environment variables and used only in this server module.
 * The admin UI only reads the connection status (connected/not connected) and
 * cached query data from the database — never the credentials themselves.
 *
 * ARCHITECTURE: Search Console metrics are fetched periodically by a server-
 * side sync job (e.g. Vercel Cron) and stored in the article_search_queries
 * cache table. The admin dashboard reads from the cache, so opening the
 * dashboard never makes an expensive Search Console API request.
 *
 * IMPORTANT: article_search_queries stores the current Search Console query
 * window and is not daily-partitioned. Its click/impression totals must not be
 * copied into article_analytics_daily, because doing so on successive dates
 * would double-count cumulative Search Console totals. Dashboard search
 * metrics therefore read directly from this cache until a true daily Search
 * Console table exists.
 *
 * ENVIRONMENT VARIABLES (all server-only):
 *   GSC_SERVICE_ACCOUNT_EMAIL  — Google service account email
 *   GSC_PRIVATE_KEY            — Google service account private key
 *   GSC_SITE_URL               — The verified site URL in Search Console
 *
 * When any of these is unset, the integration reports as "not connected" and
 * the admin UI shows a clean setup state instead of broken/empty widgets.
 *
 * MAPPING: Analytics are mapped to articles by matching the article's canonical
 * URL (https://www.vantagefoundationuganda.com/stories/<slug>) against the
 * Search Console URL dimension. Articles whose URLs don't appear in Search
 * Console data simply have no cached query rows.
 */

import { createHmac } from "crypto";
import {
  upsertSearchQuery,
  setSearchConsoleStatus,
  getSearchConsoleStatus,
  getArticleSearchQueries,
} from "@/lib/db/analytics";
import { getAllAnalyticsArticles } from "@/lib/db/analytics-articles";
import { logError, logInfo } from "@/lib/logger";

interface SearchConsoleConfig {
  serviceAccountEmail: string;
  privateKey: string;
  siteUrl: string;
}

function getConfig(): SearchConsoleConfig | null {
  const email = process.env.GSC_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GSC_PRIVATE_KEY;
  const siteUrl = process.env.GSC_SITE_URL;
  if (!email || !key || !siteUrl) return null;
  return { serviceAccountEmail: email, privateKey: key, siteUrl };
}

/**
 * Returns whether Search Console is configured (credentials present). Does NOT
 * expose the credentials. Used by the admin UI to decide whether to show the
 * setup state or the data widgets.
 */
export async function isSearchConsoleConfigured(): Promise<boolean> {
  return getConfig() !== null;
}

/** Returns a safe, credential-free status object for the admin UI. */
export async function getSafeSearchConsoleStatus() {
  const configured = await isSearchConsoleConfigured();
  const dbStatus = await getSearchConsoleStatus();
  return {
    configured,
    connected: dbStatus.connected,
    siteUrl: dbStatus.siteUrl,
    lastSyncAt: dbStatus.lastSyncAt,
    lastError: dbStatus.lastError,
  };
}

async function createJwt(config: SearchConsoleConfig): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: config.serviceAccountEmail,
    scope: "https://www.googleapis.com/auth/webmasters.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };
  const encoded = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");
  const signingInput = `${encoded(header)}.${encoded(claim)}`;

  const pemContents = config.privateKey
    .replace(/\\n/g, "\n")
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const der = Buffer.from(pemContents, "base64");
  const key = await crypto.subtle.importKey(
    "pkcs8",
    der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(signingInput),
  );
  return `${signingInput}.${Buffer.from(new Uint8Array(signature)).toString("base64url")}`;
}

async function getAccessToken(config: SearchConsoleConfig): Promise<string> {
  const jwt = await createJwt(config);
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Search Console auth failed: ${response.status} ${text.slice(0, 200)}`,
    );
  }
  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

interface SearchConsoleRow {
  keys: string[];
  clicks: number;
  impressions: number;
  position: number;
}

/**
 * Fetches search analytics from Search Console for the configured site URL,
 * maps query-level data to articles by canonical URL, and upserts the
 * article_search_queries cache. Intended to be called by a periodic cron job,
 * NOT on every admin page load.
 *
 * @param days - Number of days of recent search data to fetch (default 28).
 */
export async function syncSearchConsoleData(days: number = 28): Promise<{
  synced: number;
  error: string | null;
}> {
  const config = getConfig();
  if (!config) {
    return { synced: 0, error: "Search Console credentials not configured" };
  }

  try {
    const token = await getAccessToken(config);
    const endDate = new Date();
    const startDate = new Date(
      endDate.getTime() - days * 24 * 60 * 60 * 1000,
    );
    const formatDate = (d: Date) => d.toISOString().slice(0, 10);

    const response = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(config.siteUrl)}/searchAnalytics/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          dimensions: ["query", "page"],
          rowLimit: 5000,
        }),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Search Console API failed: ${response.status} ${text.slice(0, 200)}`,
      );
    }

    const data = (await response.json()) as { rows?: SearchConsoleRow[] };
    const rows = data.rows ?? [];

    // Only currently active registry rows are returned. Removed/unpublished
    // stories keep their historical analytics but are not targets for a new
    // Search Console sync.
    const articles = await getAllAnalyticsArticles();
    const slugToId = new Map(articles.map((a) => [a.slug, a.id]));

    let synced = 0;
    for (const row of rows) {
      const [query, pageUrl] = row.keys;
      if (!query || !pageUrl) continue;
      const slugMatch = pageUrl.match(/\/stories\/([^/?#]+)/);
      if (!slugMatch) continue;
      const slug = slugMatch[1];
      const articleId = slugToId.get(slug);
      if (!articleId) continue;
      await upsertSearchQuery(
        articleId,
        query,
        row.impressions,
        row.clicks,
        row.position,
      );
      synced++;
    }

    await setSearchConsoleStatus({
      connected: true,
      siteUrl: config.siteUrl,
      lastError: null,
    });

    // Deliberately no daily-rollup backfill here. The cache is cumulative for
    // the requested Search Console window; dashboard queries read it directly.
    logInfo("search_console_synced", { synced, days });
    return { synced, error: null };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    await setSearchConsoleStatus({
      connected: false,
      siteUrl: config.siteUrl,
      lastError: msg.slice(0, 500),
    });
    logError("search_console_sync_failed", { error: msg.slice(0, 200) });
    return { synced: 0, error: msg };
  }
}

export { getArticleSearchQueries };

// Reserved for future credential verification use.
void createHmac;

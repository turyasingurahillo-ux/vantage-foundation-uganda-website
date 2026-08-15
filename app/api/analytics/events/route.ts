import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { logError, logInfo, logWarn } from "@/lib/logger";
import { getStoryBySlug } from "@/lib/db/stories";
import {
  ingestEvent,
  classifySource,
  type AnalyticsEventType,
  type SourceGroup,
} from "@/lib/db/analytics";

/**
 * Public article analytics ingestion endpoint.
 *
 * Privacy design:
 *   - The only reader identifier is a random anonymous cookie (`vantage_reader`)
 *     set by the client tracker. The server hashes it with HMAC-SHA256 keyed
 *     with ADMIN_SECRET before storing, so the stored `reader_hash` is a
 *     pseudonymous dedup key that cannot be reversed to a person or cookie.
 *   - No IP addresses, names, emails, or browsing profiles are stored.
 *   - The endpoint is rate-limited to prevent abuse.
 *   - Events for unpublished or non-existent articles are rejected so drafts
 *     are never included in public-performance totals.
 *
 * The endpoint accepts POST with a JSON body containing one event. It always
 * returns 204 No Content (even on non-critical errors) so the client tracker
 * never blocks page rendering or throws unhandled promise rejections.
 */

const READER_COOKIE_NAME = "vantage_reader";

const eventSchema = z.object({
  articleSlug: z.string().min(1).max(150),
  eventType: z.enum([
    "article_view",
    "article_scroll",
    "article_complete",
    "article_share",
    "article_cta_click",
    "article_engagement",
  ]) as z.ZodType<AnalyticsEventType>,
  percentage: z.number().min(0).max(100).optional(),
  platform: z.string().max(50).optional(),
  ctaType: z.string().max(50).optional(),
  destination: z.string().max(500).optional(),
  position: z.string().max(50).optional(),
  engagementSeconds: z.number().min(0).max(7200).optional(),
  referrer: z.string().max(2000).optional(),
  utm: z
    .object({
      source: z.string().max(200).optional(),
      medium: z.string().max(200).optional(),
      campaign: z.string().max(200).optional(),
      content: z.string().max(200).optional(),
    })
    .optional(),
});

function hashReaderId(rawReaderId: string | null, ip: string): string {
  // Use the anonymous cookie if present; otherwise derive a throwaway hash
  // from the IP so we still get rough dedup without storing the IP itself.
  // The IP is never persisted — only its HMAC hash, which is not reversible.
  const secret = process.env.ADMIN_SECRET ?? "vantage-analytics-fallback";
  const input = rawReaderId || `ip:${ip}`;
  return createHmac("sha256", secret).update(input).digest("hex");
}

function isSameOriginReferrer(referrer: string | undefined, requestHost: string): boolean {
  if (!referrer) return false;
  try {
    const u = new URL(referrer);
    return u.host === requestHost;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  // Generous rate limit: a reader scrolling through an article fires several
  // scroll milestones + engagement pings. 120/min per IP is comfortable.
  if (!rateLimit({ key: `analytics:${ip}`, limit: 120, windowMs: 60_000 })) {
    return new NextResponse(null, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    logWarn("analytics_event_invalid", { issues: parsed.error.issues.length });
    return new NextResponse(null, { status: 204 });
  }
  const data = parsed.data;

  // Resolve the article and verify it is published. Reject events for drafts
  // or non-existent articles so they never enter public-performance totals.
  let articleId: number;
  try {
    const story = await getStoryBySlug(data.articleSlug);
    if (!story || !story.published) {
      // Silently ignore — don't leak which slugs exist.
      return new NextResponse(null, { status: 204 });
    }
    articleId = story.id;
  } catch {
    // DB not configured or error — fail silently (no tracking, no crash).
    return new NextResponse(null, { status: 204 });
  }

  // Classify the traffic source. Same-origin referrer = direct navigation.
  const requestHost = new URL(request.url).host;
  const rawReferrer = data.referrer;
  const referrer = isSameOriginReferrer(rawReferrer, requestHost) ? null : rawReferrer ?? null;
  const sourceGroup: SourceGroup = classifySource(referrer, data.utm);

  // Hash the anonymous reader cookie for dedup. The cookie value is read from
  // the Cookie header (the client tracker sets it). If absent, derive a
  // throwaway hash from the IP so we still dedup within a session.
  const cookieHeader = request.headers.get("cookie") ?? "";
  const readerCookie = parseCookie(cookieHeader, READER_COOKIE_NAME);
  const readerHash = hashReaderId(readerCookie, ip);

  try {
    await ingestEvent({
      articleId,
      eventType: data.eventType,
      readerHash,
      sourceGroup,
      percentage: data.percentage,
      platform: data.platform,
      ctaType: data.ctaType,
      destination: data.destination,
      position: data.position,
      engagementSeconds: data.engagementSeconds,
    });
    logInfo("analytics_event", {
      type: data.eventType,
      article: articleId,
      source: sourceGroup,
    });
  } catch (error) {
    // Never let analytics break the page. Log and return success.
    logError("analytics_ingest_failed", { error: String(error).slice(0, 200) });
  }

  return new NextResponse(null, { status: 204 });
}

// Also support OPTIONS for any preflight (the tracker uses same-origin POSTs
// with JSON, but some browsers/proxies may preflight).
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: { "Access-Control-Allow-Methods": "POST, OPTIONS" },
  });
}

function parseCookie(cookieHeader: string, name: string): string | null {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? match[1] : null;
}

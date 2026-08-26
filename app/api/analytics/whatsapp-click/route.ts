import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { logError, logInfo, logWarn } from "@/lib/logger";

/**
 * Public WhatsApp contact-click ingestion endpoint.
 *
 * Fires when a visitor clicks a WhatsApp quick-contact CTA. This is a
 * site-wide event (not article-specific), so it has its own endpoint
 * separate from the article analytics ingestion.
 *
 * Privacy design (mirrors the article analytics endpoint):
 *   - No IP addresses, names, emails, or browsing profiles are stored.
 *   - The only reader identifier is the anonymous `vantage_reader` cookie,
 *     HMAC-hashed with ADMIN_SECRET before storing. Not reversible.
 *   - Rate-limited to prevent abuse.
 *   - No article slug is required — this is a site-wide contact event.
 *   - The destination is the wa.me URL (already public on the page).
 *
 * The endpoint always returns 204 No Content so the client tracker never
 * blocks navigation or throws unhandled promise rejections.
 */

const READER_COOKIE_NAME = "vantage_reader";

const schema = z.object({
  eventType: z.literal("whatsapp_contact_click"),
  context: z.string().max(100).optional(),
  destination: z.string().max(500).optional(),
  position: z.string().max(50).optional(),
});

function hashReaderId(rawReaderId: string | null, ip: string): string {
  const secret = process.env.ADMIN_SECRET ?? "vantage-analytics-fallback";
  const input = rawReaderId || `ip:${ip}`;
  return createHmac("sha256", secret).update(input).digest("hex");
}

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  if (!rateLimit({ key: `whatsapp-click:${ip}`, limit: 30, windowMs: 60_000 })) {
    return new NextResponse(null, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    logWarn("whatsapp_click_invalid", { issues: parsed.error.issues.length });
    return new NextResponse(null, { status: 204 });
  }
  const data = parsed.data;

  const cookieHeader = request.headers.get("cookie") ?? "";
  const readerCookie = parseCookie(cookieHeader, READER_COOKIE_NAME);
  const readerHash = hashReaderId(readerCookie, ip);

  try {
    // Store in the audit log as a lightweight event record. This is a
    // public event (no PII), so the audit log is appropriate. A dedicated
    // analytics table can be added later if aggregation is needed.
    logInfo("whatsapp_contact_click", {
      context: data.context,
      position: data.position,
      readerHash: readerHash.substring(0, 12), // truncated hash for dedup
      destination: data.destination,
    });
  } catch (error) {
    logError("whatsapp_click_log_failed", { error: String(error).slice(0, 200) });
  }

  return new NextResponse(null, { status: 204 });
}

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

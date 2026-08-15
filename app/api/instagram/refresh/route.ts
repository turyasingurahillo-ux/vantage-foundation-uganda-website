import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { refreshInstagramCache } from "@/lib/instagram/client";
import { logWarn } from "@/lib/logger";

/**
 * Cron endpoint to refresh the Instagram cache.
 *
 * Configure an external scheduler (e.g. Vercel Cron) to send a POST request
 * to this endpoint every 6 to 12 hours.
 *
 * Security: requires a CRON_SECRET bearer token. If CRON_SECRET is not set,
 * the endpoint fails closed (returns 503) — it is never left open. Only
 * POST is accepted; GET is rejected to prevent accidental triggering by
 * crawlers, prefetch, or browsers.
 */

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function POST(request: Request): Promise<NextResponse> {
  const cronSecret = process.env.CRON_SECRET;

  // Fail closed when no secret is configured — never leave the endpoint open.
  if (!cronSecret) {
    logWarn("instagram_cron_no_secret", {});
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !safeEqual(authHeader, `Bearer ${cronSecret}`)) {
    logWarn("instagram_cron_unauthorized", {});
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const count = await refreshInstagramCache();
    return NextResponse.json({ success: true, count, refreshedAt: Date.now() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message.slice(0, 200) },
      { status: 502 },
    );
  }
}

// GET is rejected — this is a state-changing action and must not be
// triggerable by crawlers, prefetch, or accidental browser navigation.
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

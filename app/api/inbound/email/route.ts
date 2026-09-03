import { NextResponse } from "next/server";
import { z } from "zod";
import { processInboundEmail } from "@/lib/db/inbound-email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { logWarn, logInfo } from "@/lib/logger";
import { safeSecretEqual, parseBearerToken } from "@/lib/safe-compare";

/**
 * Inbound email endpoint — receives parsed email from Cloudflare Email Worker.
 *
 * Authentication: Bearer token via INBOUND_EMAIL_SECRET env var.
 * The Cloudflare Email Worker extracts headers and body, then POSTs JSON
 * to this endpoint with the shared secret.
 *
 * Security:
 *   - Bearer token must match INBOUND_EMAIL_SECRET
 *   - Replay protection via message_id_hash UNIQUE constraint
 *   - Sender/thread validation: In-Reply-To must match a stored provider_message_id
 *   - No arbitrary case-ID injection: case is resolved from reply thread
 *   - Body truncated to 100KB
 *   - No secrets exposed in response
 */

const emailSchema = z.object({
  messageId: z.string().min(1).max(500),
  fromAddress: z.string().min(1).max(200),
  inReplyTo: z.string().max(500).nullable().optional(),
  references: z.string().max(2000).nullable().optional(),
  subject: z.string().max(500).nullable().optional(),
  body: z.string().max(200_000),
  date: z.string().min(1).max(100),
});

export async function POST(request: Request) {
  // Authenticate via bearer token
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.INBOUND_EMAIL_SECRET;

  if (!expectedSecret) {
    logWarn("inbound_email_no_secret", {});
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  if (!authHeader) {
    logWarn("inbound_email_unauthorized", { reason: "missing_header" });
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const providedToken = parseBearerToken(authHeader);
  if (!providedToken || !safeSecretEqual(providedToken, expectedSecret)) {
    logWarn("inbound_email_unauthorized", { reason: "invalid_token" });
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Rate limit
  const ip = getClientIp(request.headers);
  if (!rateLimit({ key: `inbound-email:${ip}`, limit: 60, windowMs: 60_000 })) {
    logWarn("inbound_email_rate_limited", { ip });
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }

  // Parse JSON body
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const parsed = emailSchema.safeParse(json);
  if (!parsed.success) {
    logWarn("inbound_email_invalid", { issues: parsed.error.issues.length });
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  try {
    const result = await processInboundEmail({
      messageId: parsed.data.messageId,
      fromAddress: parsed.data.fromAddress,
      inReplyTo: parsed.data.inReplyTo ?? null,
      references: parsed.data.references ?? null,
      subject: parsed.data.subject ?? null,
      body: parsed.data.body,
      date: parsed.data.date,
    });
    logInfo("inbound_email_processed", { status: result.status, caseId: result.caseId });

    // Return minimal info — no secrets, no case details
    return NextResponse.json({
      status: result.status,
      caseId: result.caseId ?? null,
    });
  } catch (error) {
    logWarn("inbound_email_error", { error: String(error) });
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

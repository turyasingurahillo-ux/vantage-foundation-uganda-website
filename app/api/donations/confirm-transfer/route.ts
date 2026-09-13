import { NextResponse } from "next/server";
import { z } from "zod";
import { attachDonationTransferReference } from "@/lib/db";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { logError, logInfo, logWarn } from "@/lib/logger";

const confirmationSchema = z.object({
  donationReference: z
    .string()
    .trim()
    .regex(/^VFU-\d{4}-[A-Z0-9]{10}$/, "Invalid Vantage donation reference"),
  email: z.string().trim().email("Please enter a valid email address").max(254),
  transactionReference: z
    .string()
    .trim()
    .min(3, "Please enter the transfer reference shown by your bank or provider")
    .max(200, "Transfer reference is too long"),
});

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const allowed = rateLimit({
    key: `donation-transfer-confirm:${ip}`,
    limit: 6,
    windowMs: 60_000,
  });

  if (!allowed) {
    logWarn("donation_transfer_confirmation_rate_limited", {});
    return NextResponse.json(
      {
        success: false,
        message: "Too many attempts. Please wait a minute and try again.",
      },
      { status: 429 },
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "We could not read that confirmation." },
      { status: 400 },
    );
  }

  const parsed = confirmationSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Please check the transfer details.",
      },
      { status: 400 },
    );
  }

  try {
    const donation = await attachDonationTransferReference(parsed.data);
    if (!donation) {
      logWarn("donation_transfer_confirmation_not_matched", {
        reference: parsed.data.donationReference,
      });
      return NextResponse.json(
        {
          success: false,
          message:
            "We could not match that confirmation to a pending donation. Check the Vantage reference and use the same email address you entered earlier.",
        },
        { status: 400 },
      );
    }

    logInfo("donation_transfer_reference_attached", {
      id: donation.id,
      reference: parsed.data.donationReference,
    });

    return NextResponse.json({
      success: true,
      message:
        "Transfer reference received. Your donation remains pending until Vantage verifies the funds in the official bank account.",
    });
  } catch (error) {
    const code =
      typeof error === "object" && error && "code" in error
        ? String((error as { code?: unknown }).code)
        : "";

    if (code === "23505") {
      return NextResponse.json(
        {
          success: false,
          message:
            "That transfer reference is already attached to a donation. Please check the reference or contact Vantage if you need help.",
        },
        { status: 409 },
      );
    }

    logError("donation_transfer_confirmation_failed", {
      error: error instanceof Error ? error.message.substring(0, 200) : String(error).substring(0, 200),
    });

    return NextResponse.json(
      {
        success: false,
        message: "We could not save the transfer reference just now. Please try again.",
      },
      { status: 500 },
    );
  }
}

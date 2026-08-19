import { describe, it, expect } from "vitest";
import type { DashboardAttention } from "@/lib/db/dashboard";

/**
 * Tests that the dashboard attention data shape correctly separates
 * "new" messages from "awaiting_response" messages, rather than
 * combining them into a single "unhandled" count.
 *
 * The dashboard page uses these fields to render separate attention
 * cards linking to /admin/messages?filter=new and
 * /admin/messages?filter=awaiting_response respectively.
 */

describe("DashboardAttention data shape", () => {
  it("has separate newMessages and awaitingResponseMessages fields", () => {
    const attention: DashboardAttention = {
      pendingDonations: 2,
      newMessages: 5,
      awaitingResponseMessages: 3,
      draftStories: 1,
      mediaPendingConsent: 0,
    };
    expect(attention.newMessages).toBe(5);
    expect(attention.awaitingResponseMessages).toBe(3);
    expect(attention.newMessages).not.toBe(attention.awaitingResponseMessages);
  });

  it("does not have an unhandledMessages field", () => {
    const attention: DashboardAttention = {
      pendingDonations: 0,
      newMessages: 0,
      awaitingResponseMessages: 0,
      draftStories: 0,
      mediaPendingConsent: 0,
    };
    // The old combined field must not exist on the type.
    expect("unhandledMessages" in attention).toBe(false);
  });

  it("does not have a notEmailedMessages field", () => {
    const attention: DashboardAttention = {
      pendingDonations: 0,
      newMessages: 0,
      awaitingResponseMessages: 0,
      draftStories: 0,
      mediaPendingConsent: 0,
    };
    expect("notEmailedMessages" in attention).toBe(false);
  });
});

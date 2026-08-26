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
 *
 * Also verifies the case-management pipeline attention fields are present
 * so the dashboard can surface untriaged cases, overdue actions,
 * safeguarding concerns and high-priority items.
 */

describe("DashboardAttention data shape", () => {
  it("has separate newMessages and awaitingResponseMessages fields", () => {
    const attention: DashboardAttention = {
      pendingDonations: 2,
      newMessages: 5,
      awaitingResponseMessages: 3,
      draftStories: 1,
      mediaPendingConsent: 0,
      untriagedCases: 4,
      awaitingVantageCases: 2,
      overdueCases: 1,
      safeguardingCases: 0,
      highPriorityCases: 3,
      activeCases: 12,
          referralFollowupsDue: 0,
          dueDiligenceConcerns: 0,
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
      untriagedCases: 0,
      awaitingVantageCases: 0,
      overdueCases: 0,
      safeguardingCases: 0,
      highPriorityCases: 0,
      activeCases: 0,
          referralFollowupsDue: 0,
          dueDiligenceConcerns: 0,
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
      untriagedCases: 0,
      awaitingVantageCases: 0,
      overdueCases: 0,
      safeguardingCases: 0,
      highPriorityCases: 0,
      activeCases: 0,
          referralFollowupsDue: 0,
          dueDiligenceConcerns: 0,
    };
    expect("notEmailedMessages" in attention).toBe(false);
  });

  it("has case-management pipeline attention fields", () => {
    const attention: DashboardAttention = {
      pendingDonations: 0,
      newMessages: 0,
      awaitingResponseMessages: 0,
      draftStories: 0,
      mediaPendingConsent: 0,
      untriagedCases: 5,
      awaitingVantageCases: 3,
      overdueCases: 2,
      safeguardingCases: 1,
      highPriorityCases: 4,
      activeCases: 15,
          referralFollowupsDue: 0,
          dueDiligenceConcerns: 0,
    };
    expect(attention.untriagedCases).toBe(5);
    expect(attention.awaitingVantageCases).toBe(3);
    expect(attention.overdueCases).toBe(2);
    expect(attention.safeguardingCases).toBe(1);
    expect(attention.highPriorityCases).toBe(4);
    expect(attention.activeCases).toBe(15);
  });

  it("has relationship-layer attention fields", () => {
    const attention: DashboardAttention = {
      pendingDonations: 0,
      newMessages: 0,
      awaitingResponseMessages: 0,
      draftStories: 0,
      mediaPendingConsent: 0,
      untriagedCases: 0,
      awaitingVantageCases: 0,
      overdueCases: 0,
      safeguardingCases: 0,
      highPriorityCases: 0,
      activeCases: 0,
      referralFollowupsDue: 3,
      dueDiligenceConcerns: 1,
    };
    expect(attention.referralFollowupsDue).toBe(3);
    expect(attention.dueDiligenceConcerns).toBe(1);
  });
});

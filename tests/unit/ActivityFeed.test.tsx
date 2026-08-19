import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ActivityFeed } from "@/components/admin/hq/ActivityFeed";
import type { AuditLogEntry } from "@/lib/db/audit";

function makeEntry(overrides: Partial<AuditLogEntry> = {}): AuditLogEntry {
  return {
    id: 1,
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
    actorId: "1",
    actorKind: "admin",
    action: "donation.verified",
    resourceType: "donation",
    resourceId: "42",
    before: null,
    after: null,
    ip: null,
    ...overrides,
  };
}

describe("ActivityFeed", () => {
  it("renders empty state when no entries", () => {
    render(<ActivityFeed entries={[]} />);
    expect(screen.getByText("No recent activity")).toBeInTheDocument();
  });

  it("renders human-readable action labels, not raw action strings", () => {
    const entries = [makeEntry({ action: "donation.verified" })];
    render(<ActivityFeed entries={entries} adminNames={{ "1": "Hillary" }} />);
    expect(screen.getByText("Hillary")).toBeInTheDocument();
    expect(screen.getByText("Verified a donation")).toBeInTheDocument();
    // Should not show the raw action string
    expect(screen.queryByText("donation.verified")).not.toBeInTheDocument();
  });

  it("resolves actor names from the adminNames lookup", () => {
    const entries = [makeEntry({ actorId: "1", actorKind: "admin" })];
    render(<ActivityFeed entries={entries} adminNames={{ "1": "Hillary" }} />);
    expect(screen.getByText("Hillary")).toBeInTheDocument();
  });

  it("falls back to Admin #id when no name is found", () => {
    const entries = [makeEntry({ actorId: "99", actorKind: "admin" })];
    render(<ActivityFeed entries={entries} adminNames={{}} />);
    expect(screen.getByText("Admin #99")).toBeInTheDocument();
  });

  it("shows Bootstrap for bootstrap actor kind", () => {
    const entries = [
      makeEntry({ actorId: "bootstrap", actorKind: "bootstrap" }),
    ];
    render(<ActivityFeed entries={entries} />);
    expect(screen.getByText("Bootstrap")).toBeInTheDocument();
  });

  it("links to the donation review page for donation resources", () => {
    const entries = [
      makeEntry({ resourceType: "donation", resourceId: "42" }),
    ];
    render(<ActivityFeed entries={entries} adminNames={{ "1": "Hillary" }} />);
    const link = screen.getByRole("link", { name: "#42" });
    expect(link).toHaveAttribute("href", "/admin/donations/42");
  });

  it("renders relative time", () => {
    const entries = [makeEntry({ createdAt: new Date(Date.now() - 5 * 60 * 1000) })];
    render(<ActivityFeed entries={entries} adminNames={{ "1": "Hillary" }} />);
    expect(screen.getByText("5m ago")).toBeInTheDocument();
  });

  it("renders multiple entries as a list", () => {
    const entries = [
      makeEntry({ id: 1, action: "donation.verified", resourceId: "1" }),
      makeEntry({ id: 2, action: "media.created", resourceType: "media", resourceId: "5" }),
      makeEntry({ id: 3, action: "story.updated", resourceType: "story", resourceId: "10" }),
    ];
    render(<ActivityFeed entries={entries} adminNames={{ "1": "Hillary" }} />);
    expect(screen.getByText("Verified a donation")).toBeInTheDocument();
    expect(screen.getByText("Uploaded media")).toBeInTheDocument();
    expect(screen.getByText("Updated a story")).toBeInTheDocument();
  });
});

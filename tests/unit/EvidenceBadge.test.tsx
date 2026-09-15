import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EvidenceBadge } from "@/components/shared/EvidenceBadge";

describe("EvidenceBadge", () => {
  it("renders the English label for each evidence status", () => {
    const cases: Array<[Parameters<typeof EvidenceBadge>[0]["status"], string]> = [
      ["verified", "Verified"],
      ["programme-team-figure", "Programme-team figure"],
      ["estimated-catchment", "Estimated catchment"],
      ["pilot", "Pilot / early finding"],
      ["planned", "Planned / target"],
      ["external-evidence", "External evidence"],
    ];
    for (const [status, label] of cases) {
      const { unmount } = render(<EvidenceBadge status={status} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    }
  });

  it("renders localised labels", () => {
    render(<EvidenceBadge status="estimated-catchment" locale="de" />);
    expect(screen.getByText("Geschätztes Einzugsgebiet")).toBeInTheDocument();
  });

  it("communicates status through text, not colour alone", () => {
    const { container } = render(<EvidenceBadge status="verified" />);
    const badge = container.firstElementChild;
    expect(badge?.textContent?.trim().length).toBeGreaterThan(0);
    // No icon-only or aria-hidden status encoding — the label is the badge.
    expect(badge?.querySelector("[aria-hidden='true']")).toBeNull();
  });
});

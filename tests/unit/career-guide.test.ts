import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  extractGuideOpening,
  parseOpportunityBoard,
  parseRoadmaps,
  splitGuideSections,
} from "@/lib/career-guide";

const guide = readFileSync(
  join(process.cwd(), "content", "stories", "beyond-the-ward.md"),
  "utf8"
);

describe("Beyond the Ward guide structure", () => {
  it("keeps the full guide architecture available to the enhanced renderer", () => {
    const { preamble, sections } = splitGuideSections(guide);
    const opening = extractGuideOpening(preamble);

    expect(sections).toHaveLength(18);
    expect(opening.quickStartItems).toHaveLength(7);
    expect(opening.introMarkdown).toContain("Uganda placed 2,417 medical interns");
    expect(sections.map((section) => section.id)).toEqual(
      expect.arrayContaining([
        "1-your-next-30-days",
        "6-do-not-let-cheap-tuition-mislead-you",
        "9-pick-the-roadmap-that-fits-you",
        "11-opportunity-board-14-august-2026",
        "frequently-asked-questions",
        "the-vantage-position",
        "verification-and-corrections",
      ])
    );
  });

  it("turns all six existing roadmaps into progressions without losing detail", () => {
    const { sections } = splitGuideSections(guide);
    const section = sections.find(
      (candidate) => candidate.id === "9-pick-the-roadmap-that-fits-you"
    );
    expect(section).toBeDefined();

    const parsed = parseRoadmaps(section!.body);
    expect(parsed.roadmaps).toHaveLength(6);
    expect(parsed.roadmaps[0].steps).toEqual([
      "MBChB",
      "Research Assistant",
      "publication",
      "funded MSc",
      "research career",
    ]);
    expect(parsed.roadmaps[5].detailMarkdown).toContain("Health Data Analyst");
  });

  it("preserves all 28 opportunity-board entries and their action groups", () => {
    const { sections } = splitGuideSections(guide);
    const section = sections.find(
      (candidate) => candidate.id === "11-opportunity-board-14-august-2026"
    );
    expect(section).toBeDefined();

    const parsed = parseOpportunityBoard(section!.body);
    expect(parsed.checkedAt).toBe("23:08 EAT");
    expect(parsed.groups.map((group) => group.opportunities.length)).toEqual([
      7, 12, 9,
    ]);
    expect(parsed.guidanceMarkdown).toContain(
      "The list is not the opportunity. The funder is the opportunity."
    );
  });
});

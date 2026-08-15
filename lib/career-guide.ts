import { headingId } from "@/lib/heading-id";

export interface GuideSection {
  heading: string;
  id: string;
  body: string;
  markdown: string;
}

export interface GuideRoadmap {
  heading: string;
  id: string;
  steps: string[];
  detailMarkdown: string;
}

export type OpportunityStatus = "act" | "watch" | "not-now";
export type OpportunityType =
  | "Scholarship"
  | "Internship"
  | "Job"
  | "Training"
  | "Programme";

export interface GuideOpportunity {
  id: string;
  status: OpportunityStatus;
  type: OpportunityType;
  funding: string;
  markdown: string;
}

export interface OpportunityGroup {
  status: OpportunityStatus;
  heading: string;
  opportunities: GuideOpportunity[];
}

export function splitGuideSections(markdown: string): {
  preamble: string;
  sections: GuideSection[];
} {
  const matches = Array.from(markdown.matchAll(/^## (?!#)(.+)$/gm));

  if (matches.length === 0) {
    return { preamble: markdown.trim(), sections: [] };
  }

  const firstIndex = matches[0].index ?? 0;
  const sections = matches.map((match, index) => {
    const start = match.index ?? 0;
    const end = matches[index + 1]?.index ?? markdown.length;
    const heading = match[1].trim();
    const bodyStart = start + match[0].length;
    const body = markdown.slice(bodyStart, end).trim();

    return {
      heading,
      id: headingId(heading),
      body,
      markdown: `## ${heading}\n\n${body}`.trim(),
    };
  });

  return {
    preamble: markdown.slice(0, firstIndex).trim(),
    sections,
  };
}

export function extractGuideOpening(preamble: string): {
  quickStartItems: string[];
  introMarkdown: string;
} {
  const lines = preamble.split(/\r?\n/);
  const quickStartItems: string[] = [];
  const introLines: string[] = [];
  let inQuickStart = false;

  for (const line of lines) {
    if (/^\*Companion to /.test(line) || /^\*Last verified: /.test(line)) {
      continue;
    }

    if (/^> ## Too tired to read the whole article\?/.test(line)) {
      inQuickStart = true;
      continue;
    }

    if (inQuickStart) {
      const item = line.match(/^> - (.+)$/);
      if (item) {
        quickStartItems.push(item[1]);
        continue;
      }

      if (line.startsWith(">") || line.trim() === "") {
        continue;
      }

      inQuickStart = false;
    }

    introLines.push(line);
  }

  return {
    quickStartItems,
    introMarkdown: introLines.join("\n").trim(),
  };
}

export function removeLegacyJumpList(sectionBody: string): string {
  return sectionBody.split(/^### Read only what you need$/m)[0].trim();
}

export function parseRoadmaps(sectionBody: string): {
  introMarkdown: string;
  roadmaps: GuideRoadmap[];
} {
  const matches = Array.from(sectionBody.matchAll(/^### (.+)$/gm));
  const firstIndex = matches[0]?.index ?? sectionBody.length;
  const introMarkdown = sectionBody.slice(0, firstIndex).trim();

  const roadmaps = matches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? sectionBody.length;
    const heading = match[1].trim();
    const rawBody = sectionBody.slice(start, end).trim();
    const progression = rawBody.match(/^\*\*(.+?→.+?)\*\*\s*/);
    const steps = progression
      ? progression[1].split("→").map((step) => step.trim())
      : [];
    const detailMarkdown = progression
      ? rawBody.slice(progression[0].length).trim()
      : rawBody;

    return {
      heading,
      id: headingId(heading),
      steps,
      detailMarkdown,
    };
  });

  return { introMarkdown, roadmaps };
}

function inferOpportunityType(markdown: string): OpportunityType {
  const value = markdown.toLowerCase();
  if (/skill|certificate|openwho|gcp|dhis2/.test(value)) return "Training";
  if (/internship|volunteer|youth volunteer|placement/.test(value)) {
    return "Internship";
  }
  if (
    /scholarship|chevening|daad|erasmus|türkiye|ughe|vlir|orange knowledge|mastercard/.test(
      value
    )
  ) {
    return "Scholarship";
  }
  if (/vacanc|laboratory post|job|role/.test(value)) return "Job";
  return "Programme";
}

function inferFunding(markdown: string): string {
  const value = markdown.toLowerCase();
  if (/skills — always available|openwho certificates/.test(value)) return "Free";
  if (/unicef internships/.test(value)) return "Paid stipend";
  if (/chevening|daad epos|commonwealth shared|ughe\/mastercard|erasmus mundus|türkiye scholarships|vlir-uos/.test(value)) {
    return "Funded route";
  }
  if (/promise of acceptance or pay|financial terms|allowance|support depend/.test(value)) {
    return "Unconfirmed";
  }
  return "Unconfirmed";
}

function parseOpportunityCards(
  body: string,
  status: OpportunityStatus
): { opportunities: GuideOpportunity[]; remainder: string } {
  if (status === "act") {
    const blocks = body.split(/\n\s*\n/).filter(Boolean);
    return {
      opportunities: blocks.map((markdown, index) => ({
        id: `${status}-${index + 1}`,
        status,
        type: inferOpportunityType(markdown),
        funding: inferFunding(markdown),
        markdown,
      })),
      remainder: "",
    };
  }

  const lines = body.split(/\r?\n/);
  const itemLines: string[] = [];
  const remainderLines: string[] = [];
  let collectingItems = true;

  for (const line of lines) {
    if (collectingItems && line.startsWith("- ")) {
      itemLines.push(line.slice(2));
      continue;
    }

    if (collectingItems && line.trim() === "") continue;
    collectingItems = false;
    remainderLines.push(line);
  }

  return {
    opportunities: itemLines.map((markdown, index) => ({
      id: `${status}-${index + 1}`,
      status,
      type: inferOpportunityType(markdown),
      funding: inferFunding(markdown),
      markdown,
    })),
    remainder: remainderLines.join("\n").trim(),
  };
}

export function parseOpportunityBoard(sectionBody: string): {
  checkedAt: string;
  groups: OpportunityGroup[];
  guidanceMarkdown: string;
} {
  const checkedAt = sectionBody.match(/^\*Status last checked at (.+)\.\*$/m)?.[1] ?? "";
  const withoutCheckedAt = sectionBody
    .replace(/^\*Status last checked at .+\.\*$/m, "")
    .trim();
  const matches = Array.from(withoutCheckedAt.matchAll(/^### (.+)$/gm));
  let guidanceMarkdown = "";

  const groups = matches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? withoutCheckedAt.length;
    const heading = match[1].trim();
    const status: OpportunityStatus = /act now/i.test(heading)
      ? "act"
      : /watch/i.test(heading)
        ? "watch"
        : "not-now";
    const parsed = parseOpportunityCards(
      withoutCheckedAt.slice(start, end).trim(),
      status
    );

    if (parsed.remainder) guidanceMarkdown = parsed.remainder;

    return {
      status,
      heading,
      opportunities: parsed.opportunities,
    };
  });

  return { checkedAt, groups, guidanceMarkdown };
}

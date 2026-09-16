import type { EvidenceItem, ProgrammeId, Project } from "@/types";
import { getProgrammeBySlug } from "@/content/programmes";
import { getProjectBySlug } from "@/content/projects";

/**
 * The public evidence library — where approved evidence and learning
 * outputs are published for inspection.
 *
 * Honesty rules for this file:
 * - An item is added only when it exists and is approved for publication.
 *   An empty array is valid and renders an honest empty state — never
 *   pad the library with placeholder documents.
 * - This is NOT the reports library. Reports are formal organizational
 *   reporting documents (content/reports.ts). Evidence items are
 *   inspectable evidence/learning outputs: results briefs, learning
 *   notes, research, evaluations, evidence summaries, external evidence.
 * - Every item must carry an `evidenceStatus` when it presents a figure
 *   or finding — the epistemic status of the claim, not its confidence.
 * - Never invent URLs, dates, auditors, datasets or methodologies.
 */
export const evidenceItems: EvidenceItem[] = [];

/** All evidence items — the library may legitimately be empty. */
export function getEvidenceItems(): EvidenceItem[] {
  return evidenceItems;
}

/** Evidence items related to a given portfolio. */
export function getEvidenceItemsByProgramme(
  programmeId: ProgrammeId,
): EvidenceItem[] {
  return evidenceItems.filter((item) =>
    (item.programmeIds ?? []).includes(programmeId),
  );
}

/** Evidence items related to a given project slug. */
export function getEvidenceItemsByProject(slug: string): EvidenceItem[] {
  return evidenceItems.filter((item) =>
    (item.projectSlugs ?? []).includes(slug),
  );
}

/**
 * Resolve an evidence item's programme references to titles, for display.
 * Unresolvable ids are dropped — content validation fails first anyway.
 */
export function evidenceItemProgrammes(item: EvidenceItem): {
  slug: string;
  title: string;
}[] {
  return (item.programmeIds ?? [])
    .map((id) => getProgrammeBySlug(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => ({ slug: p.slug, title: p.title }));
}

/** Resolve an evidence item's project references for display. */
export function evidenceItemProjects(item: EvidenceItem): Project[] {
  return (item.projectSlugs ?? [])
    .map((slug) => getProjectBySlug(slug))
    .filter((p): p is Project => Boolean(p));
}

import { cn } from "@/lib/utils";

export type ActionStatus =
  | "act"
  | "build"
  | "watch"
  | "not-now"
  | "funding-trap";

const actionStyles: Record<ActionStatus, string> = {
  act: "border-success/25 bg-success-bg text-success-fg",
  build: "border-warning/30 bg-warning-bg text-warning-fg",
  watch: "border-primary/25 bg-primary-light text-primary-dark",
  "not-now": "border-destructive/25 bg-destructive-bg text-destructive-fg",
  "funding-trap": "border-warning/30 bg-warning-bg text-warning-fg",
};

const actionLabels: Record<ActionStatus, string> = {
  act: "Act now",
  build: "Build toward it",
  watch: "Watch",
  "not-now": "Not for now",
  "funding-trap": "Funding trap",
};

export function ActionStatusBadge({
  status,
  className,
}: {
  status: ActionStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-[0.06em]",
        actionStyles[status],
        className
      )}
      aria-label={`Reader action: ${actionLabels[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {actionLabels[status]}
    </span>
  );
}

export type EvidenceStatus = "verified" | "corroborated" | "unconfirmed";

/**
 * Evidence badges describe how well a claim is sourced; action badges describe
 * what the reader should do. They must not be confusable, so evidence reads as
 * an outlined "stamp" (no fill, square corners, leading rule) while actions
 * stay filled pills with a status dot.
 */
const evidenceStyles: Record<EvidenceStatus, string> = {
  verified: "border-primary/50 text-primary-dark before:bg-primary",
  corroborated: "border-slate-400 text-slate-600 before:bg-slate-400",
  unconfirmed: "border-warning/60 text-warning-fg before:bg-warning",
};

const evidenceLabels: Record<EvidenceStatus, string> = {
  verified: "Verified",
  corroborated: "Corroborated",
  unconfirmed: "Unconfirmed",
};

export function EvidenceBadge({ status }: { status: EvidenceStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[0.1875rem] border bg-transparent px-1.5 py-0.5 align-middle text-[0.68rem] font-bold uppercase tracking-[0.1em]",
        "before:block before:h-2.5 before:w-0.5 before:content-['']",
        evidenceStyles[status]
      )}
      aria-label={`Evidence status: ${evidenceLabels[status]}`}
    >
      {evidenceLabels[status]}
    </span>
  );
}

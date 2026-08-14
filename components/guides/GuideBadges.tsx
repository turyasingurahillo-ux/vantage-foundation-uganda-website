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

const evidenceStyles: Record<EvidenceStatus, string> = {
  verified: "border-primary/25 bg-primary-light text-primary-dark",
  corroborated: "border-slate-300 bg-slate-100 text-slate-700",
  unconfirmed: "border-warning/30 bg-warning-bg text-warning-fg",
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
        "inline-flex items-center rounded-md border px-2 py-0.5 align-middle text-[0.72rem] font-bold uppercase tracking-[0.08em]",
        evidenceStyles[status]
      )}
      aria-label={`Evidence status: ${evidenceLabels[status]}`}
    >
      {evidenceLabels[status]}
    </span>
  );
}

import type { EvidenceStatus } from "@/types";
import type { Locale } from "@/lib/i18n/config";
import { getPageContent } from "@/lib/i18n/content/pages";
import { cn } from "@/lib/utils";

/**
 * Renders the claim-status label for a published figure (verified, programme-
 * team figure, estimated catchment, pilot, planned, external evidence).
 * Deliberately neutral styling: the label text carries the meaning, so no
 * certification-style colours or icons are used.
 */
export function EvidenceBadge({
  status,
  locale = "en",
  className,
}: {
  status: EvidenceStatus;
  locale?: Locale;
  className?: string;
}) {
  const label = getPageContent(locale).common.evidenceStatus[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground",
        className
      )}
    >
      {label}
    </span>
  );
}

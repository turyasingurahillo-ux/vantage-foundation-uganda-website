import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { programmeLabel, type ProgrammeId } from "@/lib/design-tokens";
import type { ReachDistrict } from "@/content/reach";

export type DistrictStatus = "active" | "completed" | "planned" | "reached";

export interface DistrictMeta {
  district: ReachDistrict;
  status: DistrictStatus;
  projects: { slug: string; title: string }[];
  programmes: string[];
}

export interface MapTooltipProps {
  selected: DistrictMeta | null;
  projection: (point: [number, number]) => [number, number] | null;
  viewW: number;
  viewH: number;
}

const STATUS_LABEL: Record<DistrictStatus, string> = {
  active: "Active project",
  completed: "Completed project",
  planned: "Planned project",
  reached: "Area reached",
};

const BADGE_VARIANT: Record<
  DistrictStatus,
  "default" | "success" | "warning" | "outline"
> = {
  active: "default",
  completed: "success",
  planned: "warning",
  reached: "outline",
};

export function MapTooltip({ selected, projection, viewW, viewH }: MapTooltipProps) {
  if (!selected) return null;

  const [lon, lat] = [selected.district.longitude, selected.district.latitude];
  const projected = projection([lon, lat]);
  if (!projected) return null;
  const [x, y] = projected;

  const leftPct = Math.max(8, Math.min(92, (x / viewW) * 100));
  const topPct = Math.max(8, Math.min(92, (y / viewH) * 100));
  const primaryProgramme = selected.programmes[0] as ProgrammeId | undefined;

  return (
    <div
      role="tooltip"
      className={cn(
        "pointer-events-none absolute z-10 w-56 -translate-x-1/2 -translate-y-[115%]",
        "rounded-xl border border-border bg-white p-3 shadow-lg",
      )}
      style={{ left: `${leftPct}%`, top: `${topPct}%` }}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-foreground">
          {selected.district.district}
        </h4>
        <Badge variant={BADGE_VARIANT[selected.status]}>{STATUS_LABEL[selected.status]}</Badge>
      </div>

      {selected.district.description ? (
        <p className="mt-1 text-xs text-muted-foreground">
          {selected.district.description}
        </p>
      ) : null}

      {primaryProgramme ? (
        <p className="mt-1 text-xs text-primary">
          {programmeLabel(primaryProgramme)}
        </p>
      ) : null}

      {selected.projects.length > 0 ? (
        <ul className="mt-2 space-y-1 border-t border-border pt-2">
          {selected.projects.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/projects/${p.slug}`}
                className="pointer-events-auto text-xs text-primary underline-offset-4 hover:underline"
              >
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

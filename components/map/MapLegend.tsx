import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DistrictStatus } from "./MapTooltip";

const COLOR_CLASS: Record<DistrictStatus, string> = {
  active: "text-primary",
  completed: "text-success",
  planned: "text-warning",
  reached: "text-muted-foreground",
};

const STATUS_ORDER: DistrictStatus[] = [
  "active",
  "completed",
  "planned",
  "reached",
];

export interface MapLegendProps {
  labels: Record<DistrictStatus, string>;
}

export function MapLegend({ labels }: MapLegendProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
      {STATUS_ORDER.map((status) => (
        <span key={status} className="flex items-center gap-1.5">
          <MapPin
            className={cn("h-4 w-4", COLOR_CLASS[status])}
            fill="currentColor"
            fillOpacity={0.15}
          />
          {labels[status]}
        </span>
      ))}
    </div>
  );
}

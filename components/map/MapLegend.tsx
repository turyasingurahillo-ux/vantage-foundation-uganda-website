import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export type DistrictStatus = "active" | "completed" | "planned" | "reached";

const LEGEND_ITEMS: { status: DistrictStatus; label: string; colorClass: string }[] = [
  { status: "active", label: "Active project", colorClass: "text-primary" },
  { status: "planned", label: "Planned project", colorClass: "text-warning" },
  { status: "completed", label: "Completed project", colorClass: "text-success" },
  { status: "reached", label: "Area reached", colorClass: "text-muted-foreground" },
];

export function MapLegend() {
  return (
    <div
      className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground"
      aria-label="Map legend"
    >
      {LEGEND_ITEMS.map((item) => (
        <span key={item.status} className="flex items-center gap-1.5">
          <MapPin className={cn("h-4 w-4", item.colorClass)} fill="currentColor" fillOpacity={0.15} />
          <span className="sr-only">{item.label} marker</span>
          {item.label}
        </span>
      ))}
    </div>
  );
}

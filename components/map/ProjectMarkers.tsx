"use client";

import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export type DistrictStatus = "active" | "completed" | "planned" | "reached";

export interface MapMarker {
  name: string;
  x: number;
  y: number;
  status: DistrictStatus;
}

export interface ProjectMarkersProps {
  markers: MapMarker[];
  viewW: number;
  viewH: number;
  selected: string | null;
  idBase: string;
  onSelect: (name: string) => void;
  onToggle: (name: string) => void;
}

const STATUS_FILL: Record<DistrictStatus, string> = {
  active: "text-primary",
  completed: "text-success",
  planned: "text-warning",
  reached: "text-muted-foreground",
};

export function ProjectMarkers({
  markers,
  viewW,
  viewH,
  selected,
  idBase,
  onSelect,
  onToggle,
}: ProjectMarkersProps) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden={false}>
      {markers.map((marker) => {
        const isSelected = selected === marker.name;
        const leftPct = (marker.x / viewW) * 100;
        const topPct = (marker.y / viewH) * 100;
        return (
          <button
            key={marker.name}
            type="button"
            onClick={() => onToggle(marker.name)}
            onMouseEnter={() => onSelect(marker.name)}
            onFocus={() => onSelect(marker.name)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggle(marker.name);
              }
            }}
            aria-expanded={isSelected}
            aria-controls={`${idBase}-${marker.name}`}
            aria-label={`${marker.name} on the map: view details`}
            className={cn(
              "group pointer-events-auto absolute -translate-x-1/2 -translate-y-full",
              "rounded-full p-1 focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-primary focus-visible:ring-offset-2",
              STATUS_FILL[marker.status]
            )}
            style={{ left: `${leftPct}%`, top: `${topPct}%` }}
          >
            <MapPin
              className={cn(
                "h-6 w-6 drop-shadow transition-transform",
                isSelected && "scale-125"
              )}
              fill="currentColor"
              fillOpacity={0.15}
            />
            <span className="sr-only">{marker.name}</span>
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { geoMercator, geoPath, type GeoProjection } from "d3-geo";
import type { FeatureCollection, Feature, Geometry } from "geojson";
import mapData from "@/public/geojson/uganda-map.json";
import { UgandaBoundary } from "./UgandaBoundary";
import { WaterBodies, type Lake } from "./WaterBodies";
import { AdministrativeBoundaries, type BoundaryRegion } from "./AdministrativeBoundaries";
import { ProjectMarkers, type MapMarker } from "./ProjectMarkers";
import { MapTooltip, type DistrictMeta } from "./MapTooltip";

interface MapProperties {
  layer: string;
  name: string;
}

const VIEW_W = 800;
const VIEW_H = 800;

interface UgandaMapProps {
  districts: DistrictMeta[];
  selected: string | null;
  idBase: string;
  onSelect: (name: string) => void;
  onToggle: (name: string) => void;
}

export function UgandaMap({
  districts,
  selected,
  idBase,
  onSelect,
  onToggle,
}: UgandaMapProps) {
  const {
    projection,
    ugandaPath,
    neighborPaths,
    lakePaths,
    regionPaths,
    markers,
  } = useMemo(() => {
    const raw = mapData as unknown as FeatureCollection<Geometry, MapProperties>;
    const features = raw.features as Feature<Geometry, MapProperties>[];

    const uganda = features.find((f) => f.properties.layer === "uganda");
    if (!uganda) throw new Error("Uganda boundary missing from map data");

    const projection: GeoProjection = geoMercator().fitSize(
      [VIEW_W, VIEW_H],
      uganda,
    );
    const path = geoPath(projection);

    const neighbors: { name: string; d: string }[] = [];
    const lakes: Lake[] = [];
    const regions: BoundaryRegion[] = [];

    features.forEach((f) => {
      if (f === uganda) return;
      const d = path(f);
      if (!d) return;
      if (f.properties.layer === "neighbors") {
        neighbors.push({ name: f.properties.name, d });
      } else if (f.properties.layer === "lakes") {
        lakes.push({ name: f.properties.name, d });
      } else if (f.properties.layer === "regions") {
        regions.push({ name: f.properties.name, d });
      }
    });

    const ugandaD = path(uganda)!;

    const projectedMarkers: MapMarker[] = districts.map((d) => {
      const [x, y] = projection([d.district.longitude, d.district.latitude]) ?? [
        0, 0,
      ];
      return {
        name: d.district.name,
        x,
        y,
        status: d.status,
      };
    });

    return {
      projection,
      ugandaPath: ugandaD,
      neighborPaths: neighbors,
      lakePaths: lakes,
      regionPaths: regions,
      markers: projectedMarkers,
    };
  }, [districts]);

  const selectedMeta = useMemo(
    () => districts.find((d) => d.district.name === selected) ?? null,
    [districts, selected],
  );

  const projectPoint = (point: [number, number]) => projection(point);

  return (
    <div className="relative w-full aspect-square overflow-hidden rounded-2xl border border-border bg-surface">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="h-full w-full"
        aria-hidden="true"
      >
        {neighborPaths.map((n) => (
          <path
            key={n.name}
            d={n.d}
            className="fill-surface-strong stroke-border"
            strokeWidth={0.5}
          />
        ))}

        <UgandaBoundary d={ugandaPath} />
        <WaterBodies lakes={lakePaths} />
        <AdministrativeBoundaries regions={regionPaths} />
      </svg>

      <ProjectMarkers
        markers={markers}
        viewW={VIEW_W}
        viewH={VIEW_H}
        selected={selected}
        idBase={idBase}
        onSelect={onSelect}
        onToggle={onToggle}
      />

      <MapTooltip
        selected={selectedMeta}
        projection={projectPoint}
        viewW={VIEW_W}
        viewH={VIEW_H}
      />
    </div>
  );
}

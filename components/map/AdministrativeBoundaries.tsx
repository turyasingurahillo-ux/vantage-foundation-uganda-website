export interface BoundaryRegion {
  name: string;
  d: string;
}

export interface AdministrativeBoundariesProps {
  regions: BoundaryRegion[];
}

export function AdministrativeBoundaries({ regions }: AdministrativeBoundariesProps) {
  if (regions.length === 0) return null;
  return (
    <g className="admin-boundaries" aria-hidden="true">
      {regions.map((region) => (
        <path
          key={region.name}
          d={region.d}
          className="fill-none stroke-muted-foreground"
          strokeWidth={0.6}
          strokeDasharray="2 2"
          opacity={0.35}
        />
      ))}
    </g>
  );
}

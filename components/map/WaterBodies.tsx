export interface Lake {
  name: string;
  d: string;
}

export interface WaterBodiesProps {
  lakes: Lake[];
}

export function WaterBodies({ lakes }: WaterBodiesProps) {
  return (
    <g className="water-bodies" aria-label="Major lakes" role="group">
      {lakes.map((lake) => (
        <path
          key={lake.name}
          d={lake.d}
          fill="var(--bright-aqua)"
          fillOpacity={0.7}
          stroke="var(--border)"
          strokeWidth={0.5}
        />
      ))}
    </g>
  );
}

import { getPageContent } from "@/lib/i18n/content/pages";
import type { Locale } from "@/lib/i18n/config";

export interface Lake {
  name: string;
  d: string;
}

export interface WaterBodiesProps {
  lakes: Lake[];
  locale?: Locale;
}

export function WaterBodies({ lakes, locale = "en" }: WaterBodiesProps) {
  const t = getPageContent(locale).ui.map;
  return (
    <g className="water-bodies" aria-label={t.majorLakes} role="group">
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

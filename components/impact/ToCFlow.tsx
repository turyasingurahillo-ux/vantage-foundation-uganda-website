import { ArrowDown, ArrowRight } from "lucide-react";
import type { TocLayer } from "@/types";

/**
 * Theory-of-change causal flow — context/problems → interventions →
 * intermediate outcomes → longer-term outcomes.
 *
 * The semantic DOM is the text equivalent: an ordered list whose reading
 * order IS the causal order, so the diagram is fully understandable
 * without CSS and to screen readers. Arrows are decorative aria-hidden
 * glyphs — no meaning is carried by colour, position or graphics alone.
 *
 * Desktop renders the four layers horizontally; narrow viewports collapse
 * to a vertical sequence preserving the same reading order.
 */
export function ToCFlow({ layers }: { layers: TocLayer[] }) {
  return (
    <ol className="grid gap-8 lg:grid-cols-4 lg:gap-6">
      {layers.map((layer, index) => (
        <li key={layer.kind} className="relative flex flex-col">
          {/* Vertical connector on mobile / horizontal connector on desktop.
              Purely decorative — order is semantic, not visual. */}
          {index > 0 && (
            <>
              <ArrowDown
                className="mx-auto -mb-2 -mt-4 h-5 w-5 text-primary/50 lg:hidden"
                aria-hidden="true"
              />
              <ArrowRight
                className="absolute -left-6 top-10 hidden h-5 w-5 text-primary/50 lg:block"
                aria-hidden="true"
              />
            </>
          )}
          <div className="flex h-full flex-col rounded-xl border border-border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <h3 className="text-lg font-bold text-foreground">
                {layer.title}
              </h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {layer.description}
            </p>
            <ul className="mt-4 space-y-2 border-t border-border pt-4">
              {layer.items.map((item) => (
                <li
                  key={item}
                  className="flex gap-2 text-sm leading-relaxed text-foreground"
                >
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ol>
  );
}

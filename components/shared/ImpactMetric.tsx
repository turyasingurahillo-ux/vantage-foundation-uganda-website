import { cn } from "@/lib/utils";
import { getPageContent } from "@/lib/i18n/content/pages";
import type { Locale } from "@/lib/i18n/config";

/**
 * The three tiers of impact measurement, ordered from immediate to long-term.
 * Used by ImpactMetric to label and visually distinguish each item.
 */
export type ImpactTier = "output" | "outcome" | "long-term";

const badgeClassForTier: Record<
  ImpactTier,
  { badgeClass: string }
> = {
  output: {
    badgeClass:
      "bg-primary-light text-primary border-primary/20",
  },
  outcome: {
    badgeClass:
      "bg-primary text-white border-primary",
  },
  "long-term": {
    badgeClass:
      "bg-charcoal text-white border-charcoal",
  },
};

function tierConfig(locale: Locale, tier: ImpactTier) {
  const i = getPageContent(locale).impact;
  const map: Record<ImpactTier, { label: string; description: string }> = {
    output: { label: i.outputBadge, description: i.outputDescription },
    outcome: { label: i.outcomeBadge, description: i.outcomeDescription },
    "long-term": { label: i.longTermBadge, description: i.longTermDescription },
  };
  return map[tier];
}

interface ImpactMetricProps {
  tier: ImpactTier;
  /** The metric text or statement. */
  text: string;
  /** Optional supporting detail shown beneath the text. */
  detail?: string;
  className?: string;
  locale?: Locale;
}

export function ImpactMetric({
  tier,
  text,
  detail,
  className,
  locale = "en",
}: ImpactMetricProps) {
  const cfg = tierConfig(locale, tier);
  const styles = badgeClassForTier[tier];
  return (
    <li className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
            styles.badgeClass,
          )}
        >
          {cfg.label}
        </span>
        <span className="text-xs text-muted-foreground">{cfg.description}</span>
      </div>
      <p className="text-sm leading-relaxed text-foreground">{text}</p>
      {detail && (
        <p className="text-xs leading-relaxed text-muted-foreground">{detail}</p>
      )}
    </li>
  );
}

/**
 * Section wrapper that renders a titled list of ImpactMetric items, grouped
 * by tier. Use this on the impact page and project pages to replace the
 * three separate flat cards with a single, tiered, semantically-ordered list.
 */
interface ImpactMetricListProps {
  items: { tier: ImpactTier; text: string; detail?: string }[];
  title?: string;
  description?: string;
  className?: string;
  locale?: Locale;
}

export function ImpactMetricList({
  items,
  title,
  description,
  className,
  locale = "en",
}: ImpactMetricListProps) {
  // Order: outputs first, then outcomes, then long-term.
  const order: ImpactTier[] = ["output", "outcome", "long-term"];
  const sorted = [...items].sort(
    (a, b) => order.indexOf(a.tier) - order.indexOf(b.tier),
  );

  return (
    <div className={className}>
      {title && (
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      )}
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
      <ul className="mt-4 space-y-4">
        {sorted.map((item, i) => (
          <ImpactMetric
            key={`${item.tier}-${i}`}
            tier={item.tier}
            text={item.text}
            detail={item.detail}
            locale={locale}
          />
        ))}
      </ul>
    </div>
  );
}

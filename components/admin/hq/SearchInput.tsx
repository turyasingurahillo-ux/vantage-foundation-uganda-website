import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  /** Current search query value. */
  defaultValue?: string;
  /** Form action URL (the current page with status params). */
  action: string;
  /** Hidden input fields to preserve, e.g. status=pending. */
  hiddenFields?: { name: string; value: string }[];
  /** Placeholder text. */
  placeholder?: string;
  /** Accessible label. */
  ariaLabel?: string;
  className?: string;
}

/**
 * Server-friendly search input.
 *
 * Submits via GET form (no client JS required) so search works without
 * hydration. The clear button links back to the same URL without the
 * query parameter.
 */
export function SearchInput({
  defaultValue,
  action,
  hiddenFields = [],
  placeholder = "Search…",
  ariaLabel = "Search",
  className,
}: SearchInputProps) {
  return (
    <form
      method="get"
      action={action}
      className={cn("relative flex items-center", className)}
      role="search"
    >
      {hiddenFields.map((f) => (
        <input key={f.name} type="hidden" name={f.name} value={f.value} />
      ))}
      <Search
        className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="h-10 w-full rounded-lg border border-border bg-white pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      />
      {defaultValue && (
        <a
          href={action + (hiddenFields.length ? "?" + hiddenFields.map((f) => `${f.name}=${encodeURIComponent(f.value)}`).join("&") : "")}
          className="absolute right-2 inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </a>
      )}
    </form>
  );
}

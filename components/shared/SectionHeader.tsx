import { Container } from "./Container";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  light?: boolean;
  /**
   * Heading level. Use "h1" when this is the page's main heading (one per
   * page). Defaults to "h2" for section headings.
   */
  level?: "h1" | "h2";
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className = "",
  light = false,
  level = "h2",
}: SectionHeaderProps) {
  const Heading = level;
  return (
    <Container className={className}>
      <div
        className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}
      >
        {eyebrow && (
          <p
            className={cn(
              "mb-3 text-sm font-semibold uppercase tracking-wider",
              light ? "text-white/90" : "text-primary"
            )}
          >
            {eyebrow}
          </p>
        )}
        <Heading
          className={cn(
            "text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl",
            light ? "text-white" : "text-foreground"
          )}
        >
          {title}
        </Heading>
        {description && (
          <p
            className={cn(
              "mt-4 text-lg leading-relaxed",
              light ? "text-white/90" : "text-muted-foreground"
            )}
          >
            {description}
          </p>
        )}
      </div>
    </Container>
  );
}

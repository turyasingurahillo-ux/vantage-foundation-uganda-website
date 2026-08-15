import { cn } from "@/lib/utils";

const widths = {
  /** Standard page width. */
  default: "max-w-7xl",
  /**
   * Editorial width for article layouts with side rails. The reading column
   * stays narrow inside it; the extra room goes to the margins so a widescreen
   * monitor gets rail content instead of blank space.
   */
  wide: "max-w-[96rem]",
} as const;

export function Container({
  children,
  className,
  width = "default",
}: {
  children: React.ReactNode;
  className?: string;
  width?: keyof typeof widths;
}) {
  return (
    <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", widths[width], className)}>
      {children}
    </div>
  );
}

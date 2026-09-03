import { cn } from "@/lib/utils";

type AlertVariant = "success" | "info" | "warning" | "error";

interface AlertProps {
  variant: AlertVariant;
  children: React.ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<AlertVariant, string> = {
  success: "bg-success-bg text-success-fg",
  info: "bg-surface text-foreground border border-border",
  warning: "bg-warning-bg text-warning-fg",
  error: "bg-destructive-bg text-destructive-fg",
};

const VARIANT_ROLE: Record<AlertVariant, "status" | "alert"> = {
  success: "status",
  info: "status",
  warning: "status",
  error: "alert",
};

/**
 * Inline alert for action feedback (success, error, etc.).
 * Uses role="status" for non-critical and role="alert" for errors.
 */
export function Alert({ variant, children, className }: AlertProps) {
  return (
    <div
      role={VARIANT_ROLE[variant]}
      className={cn(
        "rounded-lg p-4 text-sm",
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {children}
    </div>
  );
}

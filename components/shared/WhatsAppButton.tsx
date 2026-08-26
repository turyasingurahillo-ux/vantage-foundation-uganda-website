import { cn } from "@/lib/utils";
import {
  buildWhatsAppUrl,
  buildWhatsAppAriaLabel,
  DEFAULT_WHATSAPP_MESSAGE,
} from "@/lib/whatsapp";

interface WhatsAppButtonProps {
  /** Display form of the number, e.g. "+256 786 585 216". */
  number: string;
  /** Optional prefilled message override. */
  message?: string;
  /** Optional context for the aria-label, e.g. "quick contact". */
  context?: string;
  /** Visual variant. */
  variant?: "primary" | "outline" | "ghost";
  /** Button size. */
  size?: "sm" | "md" | "lg";
  /** Optional className override. */
  className?: string;
  /** Optional label override (defaults to "WhatsApp us"). */
  label?: string;
}

const VARIANT_CLASSES = {
  primary:
    "bg-[#0e7a5f] text-white hover:bg-[#0a5c45] focus-visible:ring-[#0e7a5f]",
  outline:
    "border border-[#0e7a5f] text-[#0e7a5f] hover:bg-[#0e7a5f]/10 focus-visible:ring-[#0e7a5f]",
  ghost:
    "text-[#0e7a5f] hover:bg-[#0e7a5f]/10 focus-visible:ring-[#0e7a5f]",
};

const SIZE_CLASSES = {
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2.5",
};

/**
 * WhatsApp quick-contact button — the prominent quick-contact CTA.
 *
 * Renders as an anchor to a wa.me URL with a prefilled message. The number
 * is normalised to digits for the URL; the display form is used in the
 * aria-label. Opens in a new tab with noopener/noreferrer.
 *
 * This is a server component (no "use client") — it renders a plain anchor
 * that works without JavaScript. The wa.me URL is built at render time.
 */
export function WhatsAppButton({
  number,
  message = DEFAULT_WHATSAPP_MESSAGE,
  context,
  variant = "primary",
  size = "md",
  className,
  label = "WhatsApp us",
}: WhatsAppButtonProps) {
  const href = buildWhatsAppUrl(number, message);
  if (!href) return null;

  const ariaLabel = buildWhatsAppAriaLabel(number, context);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
    >
      <WhatsAppIcon className="h-4 w-4" aria-hidden="true" />
      {label}
    </a>
  );
}

/**
 * WhatsApp icon — the official WhatsApp glyph in a simple SVG.
 * Kept inline to avoid an external icon dependency for this one glyph.
 */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

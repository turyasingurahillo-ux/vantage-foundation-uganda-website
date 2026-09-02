import Link from "next/link";

interface FormPrivacyNoticeProps {
  /** Customize the notice text for the specific form. */
  text?: string;
  className?: string;
  /**
   * Use light text colors when rendered on a dark background (e.g.
   * bg-primary). Defaults to false (dark text on light backgrounds).
   */
  light?: boolean;
  privacyLabel?: string;
  privacyHref?: string;
}

const defaultText =
  "We will only use your details to respond to your enquiry. See our";

export function FormPrivacyNotice({
  text = defaultText,
  className,
  light = false,
  privacyLabel = "Privacy Policy",
  privacyHref = "/privacy",
}: FormPrivacyNoticeProps) {
  return (
    <p
      className={`text-xs ${light ? "text-white/90" : "text-muted-foreground"} ${className ?? ""}`}
    >
      {text}{" "}
      <Link
        href={privacyHref}
        className={light ? "text-white underline" : "text-primary underline"}
      >
        {privacyLabel}
      </Link>
      .
    </p>
  );
}

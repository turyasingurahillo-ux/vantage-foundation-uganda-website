"use client";

import Script from "next/script";

/**
 * Cloudflare Turnstile challenge.
 *
 * Renders nothing unless NEXT_PUBLIC_TURNSTILE_SITE_KEY is set, so the site
 * works normally until an administrator configures Turnstile. Only the site
 * key (public by design) is used here; the secret key stays server-side in
 * lib/turnstile.ts.
 *
 * The widget is configured as "managed" with an invisible-first behaviour:
 * most visitors are cleared silently and only suspicious sessions ever see an
 * interactive challenge, which keeps friction off legitimate donors,
 * grantmakers and researchers.
 */
export function TurnstileWidget() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!siteKey) return null;

  return (
    <div>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="lazyOnload"
      />
      <div
        className="cf-turnstile"
        data-sitekey={siteKey}
        data-appearance="interaction-only"
        data-theme="light"
        data-size="flexible"
      />
      <noscript>
        <p className="text-sm text-muted-foreground">
          This form uses a bot check that needs JavaScript. If you cannot enable
          it, please call or WhatsApp us instead.
        </p>
      </noscript>
    </div>
  );
}

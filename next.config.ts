import type { NextConfig } from "next";

// Content-Security-Policy.
//
// A nonce-based CSP (via proxy.ts) is the gold standard but forces every
// matched page into dynamic rendering, which would regress this mostly-static
// site. Instead we use a strict static CSP that allows 'unsafe-inline' for
// scripts/styles (required by Next.js's inline runtime without nonces) but
// denies all external-origin resource loading. This blocks the most common
// XSS exfiltration vectors (external scripts/styles/images/fonts) while
// keeping static prerendering intact.
//
// Future enhancement: move to nonce-based CSP via proxy.ts once the site
// moves to full dynamic rendering or edge caching makes the cost negligible.
// Cloudflare Turnstile, when configured, needs its script and its challenge
// iframe allowed. This is gated on the site key being present so the default
// CSP stays exactly as strict as before on deployments without Turnstile —
// enabling the bot challenge is the only thing that widens it, and only to one
// named Cloudflare origin.
const turnstileEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
const TURNSTILE_ORIGIN = "https://challenges.cloudflare.com";

const csp = [
  "default-src 'self'",
  // Next.js injects inline runtime scripts; without nonces we must allow them.
  `script-src 'self' 'unsafe-inline'${turnstileEnabled ? ` ${TURNSTILE_ORIGIN}` : ""}`,
  // Next.js injects inline styles (e.g. for next/font CSS variables).
  "style-src 'self' 'unsafe-inline'",
  // next/image serves optimized images from self; data: for placeholder SVGs;
  // Cloudflare R2 for admin-uploaded media (presigned GET URLs, see
  // lib/media-public.ts) — R2's S3-compatible endpoint is always
  // <account-id>.r2.cloudflarestorage.com, so the wildcard only ever matches
  // Cloudflare-hosted buckets, never an arbitrary external origin.
  "img-src 'self' data: blob: https://*.r2.cloudflarestorage.com",
  // Self-hosted fonts via next/font/google (downloaded at build time).
  "font-src 'self'",
  // No plugins (Flash, Java, PDF embeds).
  "object-src 'none'",
  // No nested browsing contexts, except the Turnstile challenge iframe when
  // Turnstile is configured.
  turnstileEnabled ? `frame-src ${TURNSTILE_ORIGIN}` : "frame-src 'none'",
  // Forms submit to same origin (server actions are same-origin POSTs).
  "form-action 'self'",
  // Clickjacking: deny all framers (reinforces X-Frame-Options: DENY).
  "frame-ancestors 'none'",
  // Only allow same-origin base elements.
  "base-uri 'self'",
  // Upgrade http: to https: on same-origin requests.
  "upgrade-insecure-requests",
  // Restrict fetch/XHR/WebSocket to same origin (plus Turnstile's own
  // telemetry endpoint when the challenge is enabled).
  `connect-src 'self'${turnstileEnabled ? ` ${TURNSTILE_ORIGIN}` : ""}`,
].join("; ");

const securityHeaders = [
  // Content-Security-Policy (see csp constant above).
  { key: "Content-Security-Policy", value: csp },
  // Clickjacking: CSP frame-ancestors is the modern mechanism, but X-Frame-Options
  // is still respected by older browsers. DENY is the strictest value.
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME-type sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Only send origin (not full URL) to cross-origin destinations, full URL same-origin.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Lock down browser feature APIs the site does not use.
  {
    key: "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "interest-cohort=()",
      "browsing-topics=()",
      "payment=()",
      "usb=()",
      "magnetometer=()",
      "gyroscope=()",
      "accelerometer=()",
    ].join(", "),
  },
  // Force HTTPS for 2 years, including subdomains, and preload into browser HSTS lists.
  // Only takes effect when served over HTTPS (Vercel terminates TLS).
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Disable cross-origin prefetch control to avoid leaking navigation patterns.
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/blog",
        destination: "/stories",
        permanent: true,
      },
      {
        source: "/blog/:slug",
        destination: "/stories/:slug",
        permanent: true,
      },
    ];
  },
  images: {
    formats: ["image/webp", "image/avif"],
    // Allow our own brand SVG logos to be served via next/image. These are
    // trusted, hand-authored assets in /public/brand/logos/ — not user uploads.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Admin-uploaded media served via presigned R2 GET URLs (see
    // lib/media-public.ts / /admin/media). Wildcard matches any Cloudflare R2
    // bucket's S3-compatible endpoint, not an arbitrary external host.
    remotePatterns: [
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
    ],
  },
  // Disabling the X-Powered-By header avoids advertising the framework.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

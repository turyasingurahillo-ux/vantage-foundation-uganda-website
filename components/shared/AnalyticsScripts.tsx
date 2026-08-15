import Script from "next/script";

/**
 * AnalyticsScripts — loads GA4 once if NEXT_PUBLIC_GA4_MEASUREMENT_ID is set.
 *
 * The measurement ID is a PUBLIC identifier (G-XXXXXXX) safe to expose in the
 * browser — it is not a credential. It is supplied via env var so the site can
 * be deployed without analytics (dev/preview) and enabled in production by
 * setting one variable, with no code changes.
 *
 * If the ID is absent, this component renders nothing and no GA4 script loads,
 * so there is no double-tracking or empty-config risk. The first-party
 * /api/analytics/events endpoint works independently of GA4.
 *
 * Admin traffic exclusion: set a GA4 internal-traffic filter in the GA4
 * property for the /admin path, or use GA4's built-in developer-traffic
 * exclusion. The first-party endpoint does not track admin pages (the tracker
 * only mounts on public article pages).
 */
export function AnalyticsScripts() {
  const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  if (!measurementId || !/^G-[A-Z0-9]{6,}$/.test(measurementId)) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}

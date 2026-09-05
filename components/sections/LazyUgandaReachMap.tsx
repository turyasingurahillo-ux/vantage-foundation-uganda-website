"use client";

import dynamic from "next/dynamic";
import type { Locale } from "@/lib/i18n/config";

// The Uganda reach map pulls in d3-geo and district data (~150 KB).
// It is below the fold on the homepage, so defer it to a separate chunk
// that loads only when the user scrolls near it. The LazySection wrapper
// in the page handles the IntersectionObserver; this client wrapper
// ensures the map's JS is not in the initial page bundle by using
// next/dynamic with ssr: false.
const UgandaReachMapInner = dynamic(
  () =>
    import("@/components/sections/UgandaReachMap").then(
      (m) => m.UgandaReachMap,
    ),
  { ssr: false, loading: () => null },
);

export function LazyUgandaReachMap({ locale }: { locale: Locale }) {
  return <UgandaReachMapInner locale={locale} />;
}

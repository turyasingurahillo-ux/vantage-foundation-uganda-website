"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * ArticleAnalytics — privacy-safe client-side content analytics tracker.
 *
 * Fires the following events to /api/analytics/events (first-party):
 *   - article_view           (once on mount)
 *   - article_scroll         (at 25/50/75/90% scroll depth, deduped per session)
 *   - article_complete       (when 90% is reached)
 *   - article_engagement     (periodic heartbeat with cumulative active time)
 *
 * Also exposes window.__vantageArticle helpers for share/CTA tracking:
 *   - window.__vantageArticle.trackShare(platform)
 *   - window.__vantageArticle.trackCta(ctaType, destination, position)
 *
 * Privacy:
 *   - Sets a random anonymous cookie `vantage_reader` (UUID, 30-day, not PII).
 *   - Sends the cookie + referrer + UTM params to the server, which hashes
 *     them server-side. No names, emails, or IPs are stored.
 *   - Respects prefers-reduced-motion (skips engagement heartbeats).
 *   - Never blocks page rendering — all sends use sendBeacon or fetch+keepalive.
 *
 * GA4: if NEXT_PUBLIC_GA4_MEASUREMENT_ID is set, the GA4 script is loaded once
 * (via AnalyticsScripts in the layout) and events are mirrored to gtag so
 * Vantage can use both first-party analytics and GA4 without double-tracking
 * page views. The first-party endpoint is the source of truth for the admin
 * dashboard; GA4 is a complementary marketing analytics view.
 */

interface ArticleAnalyticsProps {
  articleId: number;
  articleSlug: string;
  articleTitle: string;
}

const READER_COOKIE_NAME = "vantage_reader";
const MILESTONES = [25, 50, 75, 90] as const;
const ENGAGEMENT_HEARTBEAT_MS = 15_000;

function getOrCreateReaderId(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${READER_COOKIE_NAME}=([^;]+)`));
  if (match) return match[1];
  const id = crypto.randomUUID();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
  // Not HttpOnly so the client can read it for dedup; sameSite=strict for safety.
  document.cookie = `${READER_COOKIE_NAME}=${id}; expires=${expires}; path=/; SameSite=Strict; Max-Age=2592000`;
  return id;
}

function getUtms() {
  if (typeof window === "undefined") return undefined;
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content"]) {
    const value = params.get(key);
    if (value) utm[key.replace("utm_", "")] = value;
  }
  return Object.keys(utm).length ? utm : undefined;
}

function sendEvent(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);
  // Prefer sendBeacon for reliability on page unload; fall back to fetch keepalive.
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon("/api/analytics/events", blob)) return;
  }
  fetch("/api/analytics/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {/* analytics must never throw */});
}

function ga4Event(name: string, params: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === "function") {
    w.gtag("event", name, params);
  }
}

export function ArticleAnalytics({ articleId, articleSlug, articleTitle }: ArticleAnalyticsProps) {
  const reachedMilestonesRef = useRef<Set<number>>(new Set());
  const startTimeRef = useRef<number>(0);
  const lastActiveRef = useRef<number>(0);
  const viewSentRef = useRef(false);

  const fireScroll = useCallback(
    (percentage: number) => {
      if (reachedMilestonesRef.current.has(percentage)) return;
      reachedMilestonesRef.current.add(percentage);
      sendEvent({
        articleSlug,
        eventType: "article_scroll",
        percentage,
        referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
        utm: getUtms(),
      });
      ga4Event("article_scroll", { article_id: articleId, article_slug: articleSlug, percentage });
      if (percentage >= 90) {
        sendEvent({ articleSlug, eventType: "article_complete" });
        ga4Event("article_complete", { article_id: articleId, article_slug: articleSlug });
      }
    },
    [articleId, articleSlug]
  );

  // article_view (once) + scroll tracking + engagement heartbeat.
  useEffect(() => {
    if (viewSentRef.current) return;
    viewSentRef.current = true;
    startTimeRef.current = Date.now();
    lastActiveRef.current = Date.now();
    getOrCreateReaderId();
    sendEvent({
      articleSlug,
      eventType: "article_view",
      referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
      utm: getUtms(),
    });
    ga4Event("article_view", { article_id: articleId, article_slug: articleSlug, article_title: articleTitle });

    const onScroll = () => {
      lastActiveRef.current = Date.now();
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const pct = Math.min((scrollTop / docHeight) * 100, 100);
      for (const m of MILESTONES) {
        if (pct >= m) fireScroll(m);
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Send final engagement ping on page hide/unload.
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
        sendEvent({ articleSlug, eventType: "article_engagement", engagementSeconds: elapsed });
      }
    };

    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let heartbeat: ReturnType<typeof setInterval> | undefined;
    if (!prefersReducedMotion) {
      heartbeat = setInterval(() => {
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
        sendEvent({ articleSlug, eventType: "article_engagement", engagementSeconds: elapsed });
      }, ENGAGEMENT_HEARTBEAT_MS);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (heartbeat) clearInterval(heartbeat);
      onVisibilityChange();
    };
  }, [articleId, articleSlug, articleTitle, fireScroll]);

  // Expose share/CTA trackers on window for use by share buttons and CTAs.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as unknown as {
      __vantageArticle?: {
        trackShare: (platform: string) => void;
        trackCta: (ctaType: string, destination?: string, position?: string) => void;
        trackRelatedClick: (destinationSlug: string) => void;
        trackNewsletterSignup: () => void;
      };
    };
    w.__vantageArticle = {
      trackShare: (platform: string) => {
        sendEvent({ articleSlug, eventType: "article_share", platform });
        ga4Event("article_share", { article_id: articleId, article_slug: articleSlug, article_title: articleTitle, platform });
      },
      trackCta: (ctaType: string, destination?: string, position?: string) => {
        sendEvent({ articleSlug, eventType: "article_cta_click", ctaType, destination, position });
        ga4Event("article_cta_click", { article_id: articleId, article_slug: articleSlug, cta_type: ctaType, destination, position_on_page: position });
      },
      trackRelatedClick: (destinationSlug: string) => {
        sendEvent({ articleSlug, eventType: "article_cta_click", ctaType: "related_story", destination: destinationSlug, position: "related" });
        ga4Event("article_related_story_click", { article_id: articleId, article_slug: articleSlug, destination_slug: destinationSlug });
      },
      trackNewsletterSignup: () => {
        sendEvent({ articleSlug, eventType: "article_cta_click", ctaType: "newsletter", position: "newsletter" });
        ga4Event("newsletter_signup_from_article", { article_id: articleId, article_slug: articleSlug });
      },
    };
    return () => {
      delete w.__vantageArticle;
    };
  }, [articleId, articleSlug, articleTitle]);

  return null;
}

/**
 * Helper for share buttons to call the tracker. Safe to call even if the
 * tracker hasn't mounted (no-ops gracefully).
 */
export function trackArticleShare(platform: string) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { __vantageArticle?: { trackShare: (p: string) => void } };
  w.__vantageArticle?.trackShare(platform);
}

/**
 * Helper for CTA links/buttons to call the tracker.
 */
export function trackArticleCta(ctaType: string, destination?: string, position?: string) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { __vantageArticle?: { trackCta: (c: string, d?: string, p?: string) => void } };
  w.__vantageArticle?.trackCta(ctaType, destination, position);
}

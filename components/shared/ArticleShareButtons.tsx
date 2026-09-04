"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { trackArticleShare } from "./ArticleAnalytics";
import { getPageContent } from "@/lib/i18n/content/pages";
import { localePath, type Locale } from "@/lib/i18n/config";

/**
 * ArticleShareButtons — social share controls for a story page.
 *
 * Each platform click fires an `article_share` event with the platform name so
 * the admin analytics panel can show a per-platform share breakdown. Uses the
 * global window.__vantageArticle tracker exposed by ArticleAnalytics.
 *
 * Platforms tracked separately: WhatsApp, LinkedIn, X, Facebook, Copy link,
 * Native device share.
 *
 * `variant="bar"` is the horizontal row used below the article on narrow
 * screens; `variant="rail"` is the stacked form used in the sticky desktop
 * margin. Only one is rendered at a time, so a share is never counted twice.
 */
interface ArticleShareButtonsProps {
  slug: string;
  title: string;
  variant?: "bar" | "rail";
  className?: string;
  locale?: Locale;
}

function shareUrl(slug: string, locale: Locale): string {
  const path = localePath(`/stories/${slug}`, locale);
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

export function ArticleShareButtons({
  slug,
  title,
  variant = "bar",
  className,
  locale = "en",
}: ArticleShareButtonsProps) {
  const c = getPageContent(locale);
  const [copied, setCopied] = useState(false);
  const url = shareUrl(slug, locale);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const isRail = variant === "rail";

  const handleShare = (platform: string, href: string) => {
    trackArticleShare(platform);
    if (typeof window !== "undefined") window.open(href, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async () => {
    trackArticleShare("copy-link");
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may be unavailable; ignore silently.
    }
  };

  const handleNativeShare = async () => {
    trackArticleShare("native");
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled — ignore.
      }
    }
  };

  const hasNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const buttonClass = cn(
    "rounded-lg border border-border bg-white text-sm font-medium hover:border-primary hover:bg-slate-50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
    isRail ? "block w-full px-3 py-2 text-start" : "px-3 py-1.5"
  );

  return (
    <div className={cn(isRail ? "space-y-2" : "flex flex-wrap items-center gap-2", className)}>
      <span
        className={cn(
          "font-medium text-muted-foreground",
          isRail
            ? "block text-xs font-bold uppercase tracking-[0.1em] text-primary"
            : "text-sm"
        )}
      >
        {isRail ? c.common.share : `${c.common.share}:`}
      </span>
      <button
        type="button"
        onClick={() => handleShare("whatsapp", `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`)}
        className={buttonClass}
        aria-label={`${c.common.shareOn} WhatsApp`}
      >
        WhatsApp
      </button>
      <button
        type="button"
        onClick={() => handleShare("linkedin", `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`)}
        className={buttonClass}
        aria-label={`${c.common.shareOn} LinkedIn`}
      >
        LinkedIn
      </button>
      <button
        type="button"
        onClick={() => handleShare("x", `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`)}
        className={buttonClass}
        aria-label={`${c.common.shareOn} X`}
      >
        X
      </button>
      <button
        type="button"
        onClick={() => handleShare("facebook", `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)}
        className={buttonClass}
        aria-label={`${c.common.shareOn} Facebook`}
      >
        Facebook
      </button>
      <button
        type="button"
        onClick={handleCopyLink}
        className={buttonClass}
        aria-label={c.common.copyLink}
      >
        {copied ? c.common.copied : c.common.copyLink}
      </button>
      {hasNativeShare && (
        <button
          type="button"
          onClick={handleNativeShare}
          className={buttonClass}
          aria-label={`${c.common.share} …`}
        >
          {c.common.share}…
        </button>
      )}
    </div>
  );
}

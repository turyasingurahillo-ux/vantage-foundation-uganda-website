"use client";

import { useState } from "react";
import { trackArticleShare } from "./ArticleAnalytics";

/**
 * ArticleShareButtons — social share controls for a story page.
 *
 * Each platform click fires an `article_share` event with the platform name so
 * the admin analytics panel can show a per-platform share breakdown. Uses the
 * global window.__vantageArticle tracker exposed by ArticleAnalytics.
 *
 * Platforms tracked separately: WhatsApp, LinkedIn, X, Facebook, Copy link,
 * Native device share.
 */
interface ArticleShareButtonsProps {
  slug: string;
  title: string;
}

function shareUrl(slug: string): string {
  if (typeof window === "undefined") return `/stories/${slug}`;
  return `${window.location.origin}/stories/${slug}`;
}

export function ArticleShareButtons({ slug, title }: ArticleShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const url = shareUrl(slug);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

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

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Share:</span>
      <button
        type="button"
        onClick={() => handleShare("whatsapp", `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`)}
        className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Share on WhatsApp"
      >
        WhatsApp
      </button>
      <button
        type="button"
        onClick={() => handleShare("linkedin", `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`)}
        className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Share on LinkedIn"
      >
        LinkedIn
      </button>
      <button
        type="button"
        onClick={() => handleShare("x", `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`)}
        className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Share on X"
      >
        X
      </button>
      <button
        type="button"
        onClick={() => handleShare("facebook", `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)}
        className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Share on Facebook"
      >
        Facebook
      </button>
      <button
        type="button"
        onClick={handleCopyLink}
        className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Copy link"
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
      {hasNativeShare && (
        <button
          type="button"
          onClick={handleNativeShare}
          className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Share via device"
        >
          Share…
        </button>
      )}
    </div>
  );
}

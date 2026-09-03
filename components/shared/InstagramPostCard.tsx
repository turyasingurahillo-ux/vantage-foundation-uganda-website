import Image from "next/image";
import { Camera, Film, Images, Play, Heart } from "lucide-react";
import type { InstagramPost } from "@/types";
import { Card } from "@/components/ui/Card";
import { truncateCaption, getMediaTypeLabel } from "@/lib/instagram/scoring";

import { getPageContent } from "@/lib/i18n/content/pages";
import type { Locale } from "@/lib/i18n/config";

interface InstagramPostCardProps {
  post: InstagramPost;
  locale?: Locale;
}

export function InstagramPostCard({ post, locale = "en" }: InstagramPostCardProps) {
  const ui = getPageContent(locale).ui.instagram;
  const displayUrl = post.thumbnailUrl || post.mediaUrl;
  const typeKey = post.mediaType as keyof typeof ui.mediaTypes;
  const mediaLabel = ui.mediaTypes[typeKey] ?? getMediaTypeLabel(post.mediaType);
  const altText = truncateCaption(post.caption, 100) || `Instagram ${mediaLabel}`;
  const isVideo = post.mediaType === "VIDEO" || post.mediaType === "REEL";
  const isCarousel = post.mediaType === "CAROUSEL_ALBUM";
  const dateLocale =
    locale === "fr" ? "fr-FR" : locale === "de" ? "de-DE" : "en-GB";

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(dateLocale, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <Card className="group flex flex-col overflow-hidden">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-surface-strong">
        {displayUrl ? (
          <Image
            src={displayUrl}
            alt={altText}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Camera className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          </div>
        )}

        {/* Media-type indicator */}
        {(isVideo || isCarousel) && (
          <div className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur">
            {isVideo && <Play className="h-3 w-3" fill="currentColor" aria-hidden="true" />}
            {isCarousel && <Images className="h-3 w-3" aria-hidden="true" />}
            <span className="sr-only">{mediaLabel}</span>
          </div>
        )}

        {/* Badge */}
        {post.featuredCampaign && (
          <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-xs font-semibold text-white">
            <Heart className="h-3 w-3" fill="currentColor" aria-hidden="true" />
            {ui.featured}
          </div>
        )}
        {post.pinned && !post.featuredCampaign && (
          <div className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-primary backdrop-blur">
            {ui.popular}
          </div>
        )}
      </div>

      {/* Caption and metadata */}
      <div className="flex flex-1 flex-col p-4">
        <p className="line-clamp-3 text-sm leading-relaxed text-foreground">
          {truncateCaption(post.caption, 140)}
        </p>

        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          {isVideo && <Film className="h-3.5 w-3.5" aria-hidden="true" />}
          {isCarousel && <Images className="h-3.5 w-3.5" aria-hidden="true" />}
          {!isVideo && !isCarousel && <Camera className="h-3.5 w-3.5" aria-hidden="true" />}
          <span>{mediaLabel}</span>
          {post.timestamp && (
            <>
              <span aria-hidden="true">·</span>
              <time dateTime={post.timestamp}>{formatDate(post.timestamp)}</time>
            </>
          )}
        </div>

        <a
          href={post.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface"
          aria-label={`${ui.viewOnInstagram}${post.caption ? `: ${truncateCaption(post.caption, 60)}` : ""}`}
        >
          {ui.viewOnInstagram}
        </a>
      </div>
    </Card>
  );
}

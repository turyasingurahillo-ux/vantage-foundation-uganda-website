"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { MediaAsset } from "@/types";
import { BLUR_DATA_URL } from "@/lib/blur-placeholder";
import { getPageContent } from "@/lib/i18n/content/pages";
import type { Locale } from "@/lib/i18n/config";

interface GalleryGridProps {
  images: MediaAsset[];
}

const THUMBNAIL_SIZES = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw";
const LIGHTBOX_SIZES = "(max-width: 1024px) 100vw, 1024px";

export function GalleryGrid({ images }: GalleryGridProps) {
  const { locale } = useParams() as { locale?: Locale };
  const g = getPageContent(locale ?? "en").ui.gallery;
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (openIndex !== null && !dialog.open) {
      dialog.showModal();
    } else if (openIndex === null && dialog.open) {
      dialog.close();
    }
  }, [openIndex]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => setOpenIndex(null);
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  const goToOffset = (offset: number) => {
    setOpenIndex((current) => {
      if (current === null) return current;
      return (current + offset + images.length) % images.length;
    });
  };

  const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToOffset(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToOffset(-1);
    }
  };

  const handleDialogClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    // A click that lands on the dialog element itself (not a child) means the
    // user clicked the backdrop area — close the lightbox.
    if (event.target === dialogRef.current) {
      setOpenIndex(null);
    }
  };

  if (images.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center">
        <p className="text-muted-foreground">{g.empty}</p>
      </div>
    );
  }

  const current = openIndex !== null ? images[openIndex] : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setOpenIndex(index)}
            aria-label={g.viewPhoto.replace("{alt}", image.alt)}
            className="group relative aspect-square overflow-hidden rounded-xl bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Image
              src={image.src}
              alt=""
              fill
              sizes={THUMBNAIL_SIZES}
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
            />
          </button>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        onKeyDown={handleDialogKeyDown}
        onClick={handleDialogClick}
        aria-label={g.photoViewer}
        className="max-h-[90vh] w-[95vw] max-w-5xl rounded-2xl border-0 bg-transparent p-0 backdrop:bg-black/80 backdrop:backdrop-blur-sm"
      >
        {current && (
          <div className="relative flex max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-black">
            <div className="flex items-center justify-between gap-4 bg-black/90 px-4 py-3 text-white">
              <p className="text-sm text-white/70">
                {(openIndex ?? 0) + 1} / {images.length}
              </p>
              <button
                type="button"
                onClick={() => setOpenIndex(null)}
                aria-label={g.closePhotoViewer}
                autoFocus
                className="rounded-full p-1.5 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="relative min-h-[50vh] flex-1">
              <Image
                src={current.src}
                alt={current.alt}
                fill
                sizes={LIGHTBOX_SIZES}
                className="object-contain"
                preload
              />

              <button
                type="button"
                onClick={() => goToOffset(-1)}
                aria-label={g.previousPhoto}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronLeft className="h-6 w-6" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => goToOffset(1)}
                aria-label={g.nextPhoto}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronRight className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <p className="bg-black/90 px-4 py-3 text-sm leading-relaxed text-white/90">
              {current.alt}
            </p>
          </div>
        )}
      </dialog>
    </>
  );
}

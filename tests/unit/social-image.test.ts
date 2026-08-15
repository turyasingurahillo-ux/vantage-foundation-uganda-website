import { describe, expect, it } from "vitest";
import {
  DEFAULT_SOCIAL_IMAGE,
  SOCIAL_CARD_HEIGHT,
  SOCIAL_CARD_WIDTH,
  contentSocialImageCandidates,
  isSocialSafeImage,
  resolveSocialImage,
  socialCard,
  socialMimeType,
} from "@/lib/social-image";
import { CANONICAL_SITE_URL } from "@/lib/site-url";
import { createPublicMetadata } from "@/lib/metadata";
import { stories } from "@/content/stories";
import { projects } from "@/content/projects";

const DEFAULT_CARD_URL = `${CANONICAL_SITE_URL}${DEFAULT_SOCIAL_IMAGE.url}`;

describe("socialMimeType", () => {
  it("maps the formats every link-preview crawler decodes", () => {
    expect(socialMimeType("/a.jpg")).toBe("image/jpeg");
    expect(socialMimeType("/a.jpeg")).toBe("image/jpeg");
    expect(socialMimeType("/a.png")).toBe("image/png");
    expect(socialMimeType("/a.gif")).toBe("image/gif");
  });

  it("rejects WebP and AVIF, which is the bug this module exists to prevent", () => {
    expect(socialMimeType("/images/stories/hero.webp")).toBeUndefined();
    expect(socialMimeType("/images/stories/hero.avif")).toBeUndefined();
  });

  it("ignores query strings and casing", () => {
    expect(socialMimeType("/a.JPG?v=2")).toBe("image/jpeg");
    expect(socialMimeType("/a.webp?width=1200")).toBeUndefined();
  });

  it("returns undefined for an extensionless path", () => {
    expect(socialMimeType("/images/social/card")).toBeUndefined();
  });
});

describe("isSocialSafeImage", () => {
  it("accepts a site-relative image in a supported format", () => {
    expect(isSocialSafeImage("/images/social/x-og.jpg")).toBe(true);
  });

  it("rejects an off-origin URL", () => {
    // Admin-authored stories carry a presigned R2 hero URL that expires after
    // 24 hours; crawlers cache an og:image far longer than that.
    expect(
      isSocialSafeImage(
        "https://acct.r2.cloudflarestorage.com/vantage/hero.jpg?X-Amz-Signature=abc"
      )
    ).toBe(false);
    expect(isSocialSafeImage("//cdn.example.com/hero.jpg")).toBe(false);
  });

  it("rejects an explicit WebP type even when the extension looks safe", () => {
    expect(
      isSocialSafeImage({ url: "/images/x.jpg", type: "image/webp" })
    ).toBe(false);
  });

  it("rejects empty and whitespace URLs", () => {
    expect(isSocialSafeImage("")).toBe(false);
    expect(isSocialSafeImage({ url: "   " })).toBe(false);
  });
});

describe("socialCard", () => {
  it("describes the 1200x630 JPEG the generator writes", () => {
    expect(socialCard("beyond-the-ward")).toEqual({
      url: "/images/social/beyond-the-ward-og.jpg",
      width: SOCIAL_CARD_WIDTH,
      height: SOCIAL_CARD_HEIGHT,
      type: "image/jpeg",
    });
  });

  it("carries alt text when given one", () => {
    expect(socialCard("x", "A description").alt).toBe("A description");
  });
});

describe("resolveSocialImage", () => {
  it("falls back to the branded site card when there are no candidates", () => {
    const resolved = resolveSocialImage([], "Vantage Foundation Uganda");
    expect(resolved).toEqual({
      url: DEFAULT_CARD_URL,
      alt: "Vantage Foundation Uganda",
      type: "image/jpeg",
      width: 1200,
      height: 630,
    });
  });

  it("returns an absolute production HTTPS URL for a relative path", () => {
    const resolved = resolveSocialImage(["/images/social/a-og.jpg"], "Alt");
    expect(resolved.url).toBe(`${CANONICAL_SITE_URL}/images/social/a-og.jpg`);
    expect(resolved.url.startsWith("https://")).toBe(true);
  });

  it("skips a WebP hero and keeps walking the chain", () => {
    const resolved = resolveSocialImage(
      ["/images/stories/hero.webp", socialCard("beyond-the-ward")],
      "Alt"
    );
    expect(resolved.url).toBe(
      `${CANONICAL_SITE_URL}/images/social/beyond-the-ward-og.jpg`
    );
    expect(resolved.width).toBe(1200);
    expect(resolved.height).toBe(630);
    expect(resolved.type).toBe("image/jpeg");
  });

  it("uses the branded card rather than a WebP-only chain", () => {
    const resolved = resolveSocialImage(
      ["/images/a.webp", "/images/b.avif"],
      "Alt"
    );
    expect(resolved.url).toBe(DEFAULT_CARD_URL);
  });

  it("prefers an explicitly described card over later candidates", () => {
    const resolved = resolveSocialImage(
      [
        { url: "/images/og/hand-made.png", width: 1200, height: 630, alt: "Made by hand" },
        socialCard("generated"),
      ],
      "Fallback alt"
    );
    expect(resolved.url).toBe(`${CANONICAL_SITE_URL}/images/og/hand-made.png`);
    expect(resolved.type).toBe("image/png");
    expect(resolved.alt).toBe("Made by hand");
  });

  it("uses the fallback alt when a candidate carries none", () => {
    const resolved = resolveSocialImage([{ url: "/a.jpg" }], "Fallback alt");
    expect(resolved.alt).toBe("Fallback alt");
  });

  it("omits width and height rather than inventing them", () => {
    const resolved = resolveSocialImage(["/images/og/unknown-size.png"], "Alt");
    expect(resolved.width).toBeUndefined();
    expect(resolved.height).toBeUndefined();
    expect(resolved.type).toBe("image/png");
  });

  it("skips null and undefined entries", () => {
    const resolved = resolveSocialImage(
      [undefined, null, "/images/social/a-og.jpg"],
      "Alt"
    );
    expect(resolved.url).toBe(`${CANONICAL_SITE_URL}/images/social/a-og.jpg`);
  });
});

describe("contentSocialImageCandidates", () => {
  it("puts a hand-made OG image ahead of the generated card", () => {
    const resolved = resolveSocialImage(
      contentSocialImageCandidates({
        slug: "healers",
        heroImage: "/images/stories/healers.webp",
        seo: { ogImage: "/images/og/healers.png" },
      }),
      "Alt"
    );
    expect(resolved.url).toBe(`${CANONICAL_SITE_URL}/images/og/healers.png`);
  });

  it("uses the generated card when the item only has a WebP hero", () => {
    const resolved = resolveSocialImage(
      contentSocialImageCandidates({
        slug: "a-story",
        heroImage: "/images/stories/a-story.webp",
      }),
      "Alt"
    );
    expect(resolved.url).toBe(
      `${CANONICAL_SITE_URL}/images/social/a-story-og.jpg`
    );
  });

  it("does not advertise a generated card for database-authored items", () => {
    // Those are written after the build, so the card file would not exist.
    const resolved = resolveSocialImage(
      contentSocialImageCandidates({
        slug: "admin-post",
        dbId: 7,
        heroImage: "https://acct.r2.cloudflarestorage.com/h.jpg?X-Amz-Signature=a",
      }),
      "Alt"
    );
    expect(resolved.url).toBe(DEFAULT_CARD_URL);
  });
});

describe("createPublicMetadata social cards", () => {
  const base = {
    title: "A Page",
    description: "A description of the page.",
    path: "/a-page" as const,
  };

  it("emits the branded card with dimensions and type when given no image", () => {
    const metadata = createPublicMetadata(base);
    const [image] = metadata.openGraph!.images as Array<Record<string, unknown>>;
    expect(image.url).toBe(DEFAULT_CARD_URL);
    expect(image.secureUrl).toBe(DEFAULT_CARD_URL);
    expect(image.width).toBe(1200);
    expect(image.height).toBe(630);
    expect(image.type).toBe("image/jpeg");
    expect(image.alt).toBe("A Page | Vantage Foundation Uganda");
  });

  it("always requests a large-image Twitter card backed by the same asset", () => {
    const metadata = createPublicMetadata({
      ...base,
      image: socialCard("beyond-the-ward"),
    });
    // `Twitter` is a union over card types, so narrow to read `card`.
    expect((metadata.twitter as { card: string }).card).toBe(
      "summary_large_image"
    );
    const [twitterImage] = metadata.twitter!.images as Array<
      Record<string, unknown>
    >;
    const [ogImage] = metadata.openGraph!.images as Array<
      Record<string, unknown>
    >;
    expect(twitterImage.url).toBe(
      `${CANONICAL_SITE_URL}/images/social/beyond-the-ward-og.jpg`
    );
    expect(twitterImage.url).toBe(ogImage.url);
    expect(twitterImage.width).toBe(1200);
    expect(twitterImage.height).toBe(630);
    expect(twitterImage.type).toBe("image/jpeg");
  });

  it("degrades a WebP article image to the branded card instead of emitting it", () => {
    const metadata = createPublicMetadata({
      ...base,
      image: "/images/stories/hero.webp",
    });
    const [image] = metadata.openGraph!.images as Array<Record<string, unknown>>;
    expect(image.url).toBe(DEFAULT_CARD_URL);
  });

  it("uses imageAlt for the card's alt text", () => {
    const metadata = createPublicMetadata({
      ...base,
      image: socialCard("x"),
      imageAlt: "A health worker at a crossroads",
    });
    const [image] = metadata.openGraph!.images as Array<Record<string, unknown>>;
    expect(image.alt).toBe("A health worker at a crossroads");
  });

  it("keeps the canonical path untouched", () => {
    const metadata = createPublicMetadata({ ...base, type: "article" });
    expect(metadata.alternates!.canonical).toBe("/a-page");
    // `OpenGraph` is a union over og:type variants, so narrow to read `type`.
    expect((metadata.openGraph as { type: string }).type).toBe("article");
  });
});

describe("published content social cards", () => {
  it("every published story and project resolves to a JPEG or PNG card", () => {
    for (const item of [...stories, ...projects]) {
      if (item.published === false) continue;
      const resolved = resolveSocialImage(
        contentSocialImageCandidates(item),
        item.title
      );
      expect(resolved.url, item.slug).toMatch(
        new RegExp(`^${CANONICAL_SITE_URL}/.+\\.(jpg|jpeg|png)$`)
      );
      expect(["image/jpeg", "image/png"], item.slug).toContain(resolved.type);
    }
  });

  it("no published item advertises a WebP or AVIF card", () => {
    for (const item of [...stories, ...projects]) {
      if (item.published === false) continue;
      const resolved = resolveSocialImage(
        contentSocialImageCandidates(item),
        item.title
      );
      expect(resolved.url, item.slug).not.toMatch(/\.(webp|avif)$/);
    }
  });
});

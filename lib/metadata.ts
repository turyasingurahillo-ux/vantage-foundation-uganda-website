import type { Metadata } from "next";
import { site } from "@/content/site";

type PublicPageMetadata = {
  title: string;
  description: string;
  path: `/${string}` | "/";
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
};

export function createPublicMetadata({
  title,
  description,
  path,
  image = "/brand/social/vantage-foundation-uganda-og.jpg",
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
}: PublicPageMetadata): Metadata {
  const socialTitle = title.includes(site.name)
    ? title
    : `${title} | ${site.name}`;
  const socialImage =
    image === "/brand/social/vantage-foundation-uganda-og.jpg"
      ? {
          url: image,
          width: 1200,
          height: 630,
          alt: socialTitle,
        }
      : {
          url: image,
          alt: socialTitle,
        };
  const openGraphBase = {
    title: socialTitle,
    description,
    url: path,
    siteName: site.name,
    locale: "en_UG",
    images: [socialImage],
  };

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph:
      type === "article"
        ? {
            ...openGraphBase,
            type: "article",
            publishedTime,
            modifiedTime,
            authors,
          }
        : {
            ...openGraphBase,
            type: "website",
          },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [
        {
          url: image,
          alt: socialTitle,
        },
      ],
    },
  };
}

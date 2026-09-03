import Link from "next/link";
import { TeamMember } from "@/types";
import { Card } from "@/components/ui/Card";
import { ImageOrPlaceholder } from "./ImageOrPlaceholder";
import { localePath, type Locale } from "@/lib/i18n/config";
import { getPageContent } from "@/lib/i18n/content/pages";

interface TeamCardProps {
  member: TeamMember;
  /** Resolved presigned URL from an /admin/media upload, if one exists. */
  photoOverrideSrc?: string;
  locale?: Locale;
}

export function TeamCard({ member, photoOverrideSrc, locale = "en" }: TeamCardProps) {
  const c = getPageContent(locale).common;

  return (
    <Card className="overflow-hidden text-center">
      <div className="relative aspect-square overflow-hidden">
        <ImageOrPlaceholder
          src={photoOverrideSrc ?? `${member.image}-square.webp`}
          alt={member.imageAlt}
          fill
          preset="team"
          containerClassName="h-full w-full"
        />
      </div>
      <div className="p-5">
        <h3 className="text-base font-semibold leading-snug">
          <Link href={localePath(`/about-us/team/${member.slug}`, locale)} className="hover:text-primary">
            {member.displayName}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-primary">{member.role}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {member.shortBio}
        </p>
        <Link
          href={localePath(`/about-us/team/${member.slug}`, locale)}
          className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline"
        >
          {c.readFullBio}
        </Link>
      </div>
    </Card>
  );
}

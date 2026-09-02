import Link from "next/link";
import { Project } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ImageOrPlaceholder } from "./ImageOrPlaceholder";
import { programmeTokenForCategory } from "@/lib/design-tokens";
import { MapPin } from "lucide-react";
import { localePath, type Locale } from "@/lib/i18n/config";
import { getPageContent } from "@/lib/i18n/content/pages";

interface ProjectCardProps {
  project: Project;
  locale: Locale;
}

export function ProjectCard({ project, locale }: ProjectCardProps) {
  const c = getPageContent(locale).common;
  const prog = programmeTokenForCategory(project.category);
  const href = localePath(`/projects/${project.slug}`, locale);

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative aspect-[16/10] overflow-hidden">
        <ImageOrPlaceholder
          src={project.heroImage}
          alt={project.title}
          fill
          containerClassName="h-full w-full"
        />
        <span
          className="absolute left-3 top-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
          style={{ backgroundColor: prog.safeHex }}
        >
          {project.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{project.status}</Badge>
        </div>
        <h3 className="mt-3 text-lg font-semibold leading-snug">
          <Link href={href} className="hover:text-primary">
            {project.title}
          </Link>
        </h3>
        <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {project.location}
        </p>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {project.summary}
        </p>
        <Link
          href={href}
          className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline"
        >
          {c.viewProject}
        </Link>
      </div>
    </Card>
  );
}

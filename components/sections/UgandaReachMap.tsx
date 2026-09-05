"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { reachDistricts, type ReachDistrict } from "@/content/reach";
import { getProjectBySlug, getPublishedProjects } from "@/content/projects";
import { programmeIdForCategory } from "@/lib/design-tokens";
import { Container } from "@/components/shared/Container";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { UgandaMap } from "@/components/map/UgandaMap";
import { MapLegend } from "@/components/map/MapLegend";
import { type DistrictMeta } from "@/components/map/MapTooltip";
import { cn } from "@/lib/utils";
import { getPageContent } from "@/lib/i18n/content/pages";
import { localePath, type Locale } from "@/lib/i18n/config";

type DistrictStatus = "active" | "completed" | "planned" | "reached";

const STATUS_STYLE: Record<
  DistrictStatus,
  { pin: string; badge: "default" | "success" | "warning" | "outline" }
> = {
  active: { pin: "text-primary", badge: "default" },
  planned: { pin: "text-warning", badge: "warning" },
  completed: { pin: "text-success", badge: "success" },
  reached: { pin: "text-muted-foreground", badge: "outline" },
};

/** Set of published project slugs — used to filter out unpublished projects from the map. */
const publishedProjectSlugs = new Set(getPublishedProjects().map((p) => p.slug));

function districtStatus(district: ReachDistrict): DistrictStatus {
  const projects = (district.projectSlugs ?? [])
    .filter((slug) => publishedProjectSlugs.has(slug))
    .map((slug) => getProjectBySlug(slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  if (projects.length === 0) return "reached";
  if (projects.some((p) => p.status === "Active")) return "active";
  if (projects.some((p) => p.status === "Planned")) return "planned";
  return "completed";
}

/**
 * Returns the set of programme ids a district's projects belong to
 * (considering both primaryProgramme and secondaryProgrammes), so the
 * filter can surface a district under every relevant programme.
 */
function districtProgrammes(district: ReachDistrict): string[] {
  const projects = (district.projectSlugs ?? [])
    .filter((slug) => publishedProjectSlugs.has(slug))
    .map((slug) => getProjectBySlug(slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const programmes = new Set<string>();
  for (const p of projects) {
    const primary = p.primaryProgramme ?? programmeIdForCategory(p.category);
    programmes.add(primary);
    for (const sec of p.secondaryProgrammes ?? []) programmes.add(sec);
  }
  return [...programmes];
}

export function UgandaReachMap({ locale = "en" }: { locale?: Locale }) {
  const t = getPageContent(locale).ui.map;
  const statusLabels: Record<DistrictStatus, string> = {
    active: t.activeProject,
    planned: t.plannedProject,
    completed: t.completedProject,
    reached: t.areaReached,
  };
  const filters = [
    { id: "all", label: t.all },
    { id: "health", label: t.health },
    { id: "education", label: t.education },
    { id: "humanitarian", label: t.humanitarian },
    { id: "water", label: t.wash },
  ];
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const idBase = useId();

  const districtsWithMeta = useMemo(
    () =>
      reachDistricts.map((d) => {
        const projects = (d.projectSlugs ?? [])
          .filter((slug) => publishedProjectSlugs.has(slug))
          .map((slug) => getProjectBySlug(slug))
          .filter((p): p is NonNullable<typeof p> => Boolean(p))
          .map((p) => ({ slug: p.slug, title: p.title }));
        return {
          district: d,
          status: districtStatus(d),
          projects,
          programmes: districtProgrammes(d),
        } satisfies DistrictMeta;
      }),
    [],
  );

  const visibleDistricts =
    filter === "all"
      ? districtsWithMeta
      : districtsWithMeta.filter((d) => d.programmes.includes(filter));

  function select(name: string) {
    setSelected(name);
  }

  function toggle(name: string) {
    setSelected((current) => (current === name ? null : name));
  }

  return (
    <section className="bg-white py-16 md:py-24 lg:py-32">
      <Container>
        <SectionHeader
          eyebrow={t.eyebrow}
          title={t.title}
          description={t.description}
        />

        {/* Programme filter */}
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">{t.filter}</span>
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setFilter(f.id);
                setSelected(null);
              }}
              aria-pressed={filter === f.id}
              className={cn(
                "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                filter === f.id
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white text-foreground hover:border-primary/50",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-start">
          <div role="group" aria-label={t.mapAriaLabel}>
            <UgandaMap
              districts={visibleDistricts}
              selected={selected}
              idBase={idBase}
              onSelect={select}
              locale={locale}
            />
            <MapLegend
              labels={{
                active: t.activeProject,
                completed: t.completedProject,
                planned: t.plannedProject,
                reached: t.areaReached,
              }}
            />
            <p className="mt-2 text-right text-xs text-muted-foreground">
              {t.attribution}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
              {t.districtsHeading}
            </h3>
            {visibleDistricts.length === 0 ? (
              <p className="mt-4 rounded-xl border border-border p-4 text-sm text-muted-foreground">
                {t.emptyState}
              </p>
            ) : (
              <ul className="mt-4 space-y-2" aria-label={t.districtListAriaLabel}>
                {visibleDistricts.map(({ district, status, projects }) => {
                  const isSelected = selected === district.name;
                  return (
                    <li
                      key={district.name}
                      id={`${idBase}-${district.name}`}
                      className={cn(
                        "rounded-xl border p-3 transition-colors",
                        isSelected ? "border-primary bg-primary-light/40" : "border-border",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => toggle(district.name)}
                        aria-expanded={isSelected}
                        className="flex w-full items-center justify-between gap-2 text-left"
                      >
                        <span className="flex items-center gap-2 text-sm font-medium">
                          <MapPin
                            className={cn("h-4 w-4 shrink-0", STATUS_STYLE[status].pin)}
                            aria-hidden="true"
                          />
                          {district.name}
                        </span>
                        <Badge variant={STATUS_STYLE[status].badge}>
                          {statusLabels[status]}
                        </Badge>
                      </button>

                      {projects.length > 0 ? (
                        <ul className="mt-2 space-y-1 pl-6">
                          {projects.map((p) => (
                            <li key={p.slug}>
                              <Link
                                href={localePath(`/projects/${p.slug}`, locale)}
                                className="text-sm text-primary underline-offset-4 hover:underline"
                              >
                                {p.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 pl-6 text-sm text-muted-foreground">
                          {t.noProjectPage}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="mt-6 text-sm text-muted-foreground">
              {t.markersNote}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

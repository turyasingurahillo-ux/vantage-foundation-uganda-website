"use client";

import { useState, useMemo } from "react";
import { Project } from "@/types";
import { ProjectCard } from "@/components/shared/ProjectCard";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Search } from "lucide-react";
import { getPageContent } from "@/lib/i18n/content/pages";
import type { Locale } from "@/lib/i18n/config";

const categories = ["All", "Health", "Education", "Humanitarian Aid", "Water & Sanitation"];
const statuses = ["All", "Active", "Completed", "Planned"];

export function ProjectList({ projects, locale }: { projects: Project[]; locale: Locale }) {
  const c = getPageContent(locale).common;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");

  const filtered = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(search.toLowerCase()) ||
        project.summary.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "All" || project.category === category;
      const matchesStatus = status === "All" || project.status === status;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [search, category, status, projects]);

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-md flex-1">
          <label htmlFor="project-search" className="sr-only">
            {c.search}
          </label>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id="project-search"
            type="search"
            placeholder={c.searchProjectsPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label={c.filterByCategory}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label={c.filterByStatus}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">{c.noProjectsMatch}</p>
        </div>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.slug} project={project} locale={locale} />
          ))}
        </div>
      )}
    </>
  );
}

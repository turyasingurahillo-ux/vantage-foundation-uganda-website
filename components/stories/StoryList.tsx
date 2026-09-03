"use client";

import { useState, useMemo } from "react";
import { Story } from "@/types";
import { StoryCard } from "@/components/shared/StoryCard";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Search } from "lucide-react";
import { getPageContent } from "@/lib/i18n/content/pages";
import type { Locale } from "@/lib/i18n/config";

interface StoryListProps {
  stories: Story[];
  /** Categories to show in the filter, derived from the published stories. */
  categories: string[];
  locale?: Locale;
}

export function StoryList({ stories, categories, locale = "en" }: StoryListProps) {
  const c = getPageContent(locale).common;
  const p = getPageContent(locale).stories;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(c.all);

  const filtered = useMemo(() => {
    return stories.filter((story) => {
      const matchesSearch =
        story.title.toLowerCase().includes(search.toLowerCase()) ||
        story.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        (story.author ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === c.all || story.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [search, category, stories, c.all]);

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-md flex-1">
          <label htmlFor="story-search" className="sr-only">
            {c.search}
          </label>
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="story-search"
            type="search"
            placeholder={p.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label={p.filterCategoryLabel}
          >
            {[c.all, ...categories].map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">{p.noResults}</p>
        </div>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((story) => (
            <StoryCard key={story.slug} story={story} locale={locale} />
          ))}
        </div>
      )}
    </>
  );
}

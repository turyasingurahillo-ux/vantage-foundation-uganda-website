"use client";

import { useState, useMemo } from "react";
import { Story } from "@/types";
import { StoryCard } from "@/components/shared/StoryCard";
import { Input } from "@/components/ui/Input";
import { Search } from "lucide-react";
import { getPageContent } from "@/lib/i18n/content/pages";
import type { Locale } from "@/lib/i18n/config";

interface StoryListProps {
  stories: Story[];
  locale?: Locale;
}

export function StoryList({ stories, locale = "en" }: StoryListProps) {
  const c = getPageContent(locale).common;
  const p = getPageContent(locale).stories;
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return stories.filter(
      (story) =>
        story.title.toLowerCase().includes(q) ||
        story.excerpt.toLowerCase().includes(q) ||
        (story.author ?? "").toLowerCase().includes(q),
    );
  }, [search, stories]);

  return (
    <>
      <div className="relative max-w-md">
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

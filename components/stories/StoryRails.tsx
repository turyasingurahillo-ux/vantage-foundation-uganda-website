import { ArticleShareButtons } from "@/components/shared/ArticleShareButtons";
import type { OutlineEntry, PullQuote } from "@/lib/story-article";
import type { Locale } from "@/lib/i18n/config";
import { getPageContent } from "@/lib/i18n/content/pages";

interface StoryShareRailProps {
  slug: string;
  title: string;
  readingTime: number;
  locale?: Locale;
}

export function StoryShareRail({ slug, title, readingTime, locale = "en" }: StoryShareRailProps) {
  const s = getPageContent(locale).story;
  const c = getPageContent(locale).common;

  return (
    <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start" aria-label={c.share}>
      <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary">{s.readTime}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {s.readTime}: {c.minRead.replace("{minutes}", String(readingTime))}
      </p>
      <div className="mt-6 border-t border-border pt-5">
        <ArticleShareButtons slug={slug} title={title} variant="rail" locale={locale} />
      </div>
    </aside>
  );
}

interface StoryContextRailProps {
  outline: OutlineEntry[];
  pullQuote: PullQuote | null;
  locale?: Locale;
}

export function StoryContextRail({ outline, pullQuote, locale = "en" }: StoryContextRailProps) {
  const s = getPageContent(locale).story;

  if (outline.length < 2 && !pullQuote) return null;

  return (
    <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
      {outline.length >= 2 && (
        <nav aria-label={s.moreStories}>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary">
            {s.moreStories}
          </p>
          <ol className="mt-3 max-h-[45vh] space-y-1 overflow-y-auto overscroll-contain">
            {outline.map((entry) => (
              <li key={entry.id}>
                <a
                  href={`#${entry.id}`}
                  className="block rounded-md px-2.5 py-1.5 text-sm leading-5 text-slate-600 hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {entry.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {pullQuote && (
        <figure className={outline.length >= 2 ? "mt-8 border-t border-border pt-6" : undefined}>
          <blockquote className="border-l-2 border-primary pl-4 text-[1.0625rem] font-medium leading-[1.45] text-foreground">
            {pullQuote.quoted ? `“${pullQuote.text}”` : pullQuote.text}
          </blockquote>
        </figure>
      )}
    </aside>
  );
}

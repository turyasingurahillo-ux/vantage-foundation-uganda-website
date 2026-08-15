import { ArticleShareButtons } from "@/components/shared/ArticleShareButtons";
import type { OutlineEntry, PullQuote } from "@/lib/story-article";

/**
 * The desktop margins of a story page.
 *
 * Below `lg` neither rail is rendered and the article is a single column; the
 * space they occupy on a widescreen monitor would otherwise be blank margin.
 * Both rails stick to the top of the viewport as the reader scrolls, offset to
 * clear the site header.
 */

interface StoryShareRailProps {
  slug: string;
  title: string;
  readingTime: number;
}

export function StoryShareRail({ slug, title, readingTime }: StoryShareRailProps) {
  return (
    <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start" aria-label="Share this story">
      <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary">Read time</p>
      <p className="mt-1 text-sm text-muted-foreground">{readingTime} min</p>
      <div className="mt-6 border-t border-border pt-5">
        <ArticleShareButtons slug={slug} title={title} variant="rail" />
      </div>
    </aside>
  );
}

interface StoryContextRailProps {
  outline: OutlineEntry[];
  pullQuote: PullQuote | null;
}

export function StoryContextRail({ outline, pullQuote }: StoryContextRailProps) {
  // With neither an outline nor a quotable line there is nothing worth
  // reserving a column for, and an empty rail would just move the whitespace.
  if (outline.length < 2 && !pullQuote) return null;

  return (
    <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
      {outline.length >= 2 && (
        <nav aria-label="In this story">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary">
            In this story
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

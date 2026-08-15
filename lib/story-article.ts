import { headingId } from "@/lib/heading-id";
import type { ImageDimensions } from "@/lib/image-dimensions";

/**
 * Pure helpers behind the Stories & Insights article template: hero framing,
 * the "In this story" outline, the margin pull-quote and reading time.
 *
 * Kept free of React and of `server-only` imports so the rules are unit
 * testable and shared by the page, the cards and the listing.
 */

/** Words per minute used for reading-time estimates. */
export const READING_WORDS_PER_MINUTE = 200;

/**
 * Vertical focus for cropped photography. Faces in Vantage's field photography
 * sit above the optical centre of the frame, so a centred crop is the one that
 * reliably clips heads. Biasing upward keeps them in view without pushing
 * landscape scenes off their subject.
 */
export const DEFAULT_LANDSCAPE_FOCAL_POINT = "50% 38%";

/** Portraits are framed head-and-shoulders, so their subject sits higher still. */
export const DEFAULT_PORTRAIT_FOCAL_POINT = "50% 25%";

/**
 * Aspect ratio below which an image is treated as portrait. Anything squarer
 * than 1:1 survives a wide crop; taller frames do not.
 */
const PORTRAIT_ASPECT_THRESHOLD = 1;

export type HeroVariant = "cinematic" | "portrait" | "textOnly";

export interface HeroFraming {
  /**
   * `cinematic` — a wide landscape image runs edge to edge behind the headline.
   * `portrait`  — a tall image keeps its own shape beside the headline.
   * `textOnly`  — no usable hero image.
   */
  variant: HeroVariant;
  objectPosition: string;
}

/**
 * Chooses a hero treatment that will not crop through the subject.
 *
 * A cinematic band shows roughly a quarter of a 3:4 photograph's height on a
 * widescreen monitor, which is not enough to hold a person, so portrait
 * sources get a frame shaped like the photograph instead of a letterbox slot
 * cut out of it.
 */
export function resolveHeroFraming({
  src,
  dimensions,
  focalPoint,
}: {
  src?: string;
  dimensions?: ImageDimensions | null;
  focalPoint?: string;
}): HeroFraming {
  if (!src) return { variant: "textOnly", objectPosition: DEFAULT_LANDSCAPE_FOCAL_POINT };

  const isPortrait = dimensions
    ? dimensions.width / dimensions.height < PORTRAIT_ASPECT_THRESHOLD
    : false;

  return {
    variant: isPortrait ? "portrait" : "cinematic",
    objectPosition:
      focalPoint ??
      (isPortrait ? DEFAULT_PORTRAIT_FOCAL_POINT : DEFAULT_LANDSCAPE_FOCAL_POINT),
  };
}

/** Strips Markdown syntax down to the words a reader actually reads. */
function toPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_`~|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Estimates reading time in whole minutes from the article body. */
export function estimateReadingTime(body: string): number {
  const text = toPlainText(body);
  if (!text) return 1;
  const words = text.split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / READING_WORDS_PER_MINUTE));
}

export interface OutlineEntry {
  id: string;
  label: string;
}

/**
 * Section outline built from the article's `##` headings, matching the ids
 * `Markdown` renders so the rail links land on the right section.
 *
 * Fenced code blocks are skipped so a `#` comment inside one is not mistaken
 * for a heading.
 */
export function extractOutline(body: string): OutlineEntry[] {
  const entries: OutlineEntry[] = [];
  const seen = new Set<string>();
  let inFence = false;

  for (const line of body.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^##\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;

    const label = match[1]
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/[*_`~]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!label) continue;
    // Derived from the raw heading, exactly as `Markdown` derives the id it
    // renders, so a rail link and its section agree.
    const id = headingId(match[1]);
    if (!id || seen.has(id)) continue;

    seen.add(id);
    entries.push({ id, label });
  }

  return entries;
}

export interface PullQuote {
  text: string;
  /** True when the quote is the author's own blockquote rather than a lifted sentence. */
  quoted: boolean;
}

const PULL_QUOTE_MIN_LENGTH = 60;
const PULL_QUOTE_MAX_LENGTH = 220;

/**
 * Picks a line worth setting in the margin: the article's own blockquote when
 * it has one, otherwise a self-contained sentence from the body.
 *
 * Sentences carrying links, images, statistics-heavy markup or list syntax are
 * skipped — they read as fragments once pulled out of their paragraph.
 */
export function extractPullQuote(body: string): PullQuote | null {
  const blockquote = extractBlockquote(body);
  if (blockquote) return { text: blockquote, quoted: true };

  const paragraphs = body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(
      (block) =>
        block.length > 0 &&
        !block.startsWith("#") &&
        !block.startsWith(">") &&
        !block.startsWith("!") &&
        !/^[-*+]\s/.test(block) &&
        !/^\d+\.\s/.test(block) &&
        !block.startsWith("|") &&
        !block.startsWith("---")
    );

  if (paragraphs.length === 0) return null;

  // Openings are scene-setting and endings are conclusions; the middle of an
  // article is where its most quotable single sentence tends to live.
  const ordered = [...paragraphs.keys()].sort(
    (a, b) => Math.abs(a - (paragraphs.length - 1) / 2) - Math.abs(b - (paragraphs.length - 1) / 2)
  );

  for (const index of ordered) {
    for (const sentence of splitSentences(paragraphs[index])) {
      const text = toPlainText(sentence);
      if (text.length < PULL_QUOTE_MIN_LENGTH || text.length > PULL_QUOTE_MAX_LENGTH) continue;
      if (/https?:\/\//.test(sentence) || sentence.includes("](")) continue;
      return { text, quoted: false };
    }
  }

  return null;
}

function extractBlockquote(body: string): string | null {
  const lines = body.split("\n");
  const collected: string[] = [];

  for (const line of lines) {
    const match = /^>\s?(.*)$/.exec(line);
    if (match) {
      collected.push(match[1]);
      continue;
    }
    if (collected.length > 0) break;
  }

  const text = toPlainText(collected.join(" ")).replace(/^["“”']+|["“”']+$/g, "").trim();
  return text.length >= PULL_QUOTE_MIN_LENGTH && text.length <= PULL_QUOTE_MAX_LENGTH
    ? text
    : null;
}

function splitSentences(paragraph: string): string[] {
  return paragraph
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z“"'])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

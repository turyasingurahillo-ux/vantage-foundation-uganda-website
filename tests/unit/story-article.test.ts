import { describe, expect, it } from "vitest";
import {
  DEFAULT_LANDSCAPE_FOCAL_POINT,
  DEFAULT_PORTRAIT_FOCAL_POINT,
  estimateReadingTime,
  extractOutline,
  extractPullQuote,
  resolveHeroFraming,
} from "@/lib/story-article";
import { headingId } from "@/lib/heading-id";
import { stories } from "@/content/stories";

describe("resolveHeroFraming", () => {
  it("frames a portrait photograph in its own shape rather than a wide band", () => {
    const framing = resolveHeroFraming({
      src: "/images/photos/photo-058.webp",
      dimensions: { width: 1152, height: 1536 },
    });

    expect(framing.variant).toBe("portrait");
    expect(framing.objectPosition).toBe(DEFAULT_PORTRAIT_FOCAL_POINT);
  });

  it("runs a landscape photograph across a cinematic band", () => {
    const framing = resolveHeroFraming({
      src: "/images/photos/photo-073.webp",
      dimensions: { width: 1536, height: 1152 },
    });

    expect(framing.variant).toBe("cinematic");
    expect(framing.objectPosition).toBe(DEFAULT_LANDSCAPE_FOCAL_POINT);
  });

  it("lets an editor override the focal point per photograph", () => {
    const framing = resolveHeroFraming({
      src: "/images/photos/photo-058.webp",
      dimensions: { width: 1152, height: 1536 },
      focalPoint: "40% 12%",
    });

    expect(framing.objectPosition).toBe("40% 12%");
  });

  it("falls back to a cinematic band when dimensions cannot be read", () => {
    // Database-backed stories serve presigned remote URLs, which have no
    // readable local file behind them.
    expect(resolveHeroFraming({ src: "https://r2.example/hero.webp" }).variant).toBe(
      "cinematic"
    );
  });

  it("reports a story with no hero image as text only", () => {
    expect(resolveHeroFraming({}).variant).toBe("textOnly");
  });

  it("keeps the default focal point above centre, where faces sit", () => {
    const verticalPercent = (value: string) => Number(value.split(" ")[1].replace("%", ""));

    expect(verticalPercent(DEFAULT_LANDSCAPE_FOCAL_POINT)).toBeLessThan(50);
    expect(verticalPercent(DEFAULT_PORTRAIT_FOCAL_POINT)).toBeLessThan(
      verticalPercent(DEFAULT_LANDSCAPE_FOCAL_POINT)
    );
  });
});

describe("estimateReadingTime", () => {
  it("estimates from word count at 200 words per minute", () => {
    expect(estimateReadingTime(new Array(600).fill("word").join(" "))).toBe(3);
  });

  it("never reports less than a minute", () => {
    expect(estimateReadingTime("Three words only")).toBe(1);
    expect(estimateReadingTime("")).toBe(1);
  });

  it("ignores Markdown syntax, link targets and image markup", () => {
    const markdown = `## Heading\n\n![A long descriptive alt text that should not count](/images/photo.webp)\n\n**Bold** [text](https://example.com/a/very/long/url/that/is/not/read).`;

    // "Heading", "A long ... count" is dropped with the image, "Bold text."
    expect(estimateReadingTime(markdown)).toBe(1);
  });
});

describe("extractOutline", () => {
  it("lists level-two headings with ids that match the rendered article", () => {
    const outline = extractOutline(
      `Intro paragraph.\n\n## Uganda's youth opportunity\n\nBody.\n\n## Why action is urgent\n\nBody.`
    );

    expect(outline).toEqual([
      { id: headingId("Uganda's youth opportunity"), label: "Uganda's youth opportunity" },
      { id: headingId("Why action is urgent"), label: "Why action is urgent" },
    ]);
  });

  it("ignores other heading levels and headings inside fenced code", () => {
    const outline = extractOutline(
      `# Title\n\n### Sub-heading\n\n\`\`\`\n## Not a heading\n\`\`\`\n\n## Real heading`
    );

    expect(outline.map((entry) => entry.label)).toEqual(["Real heading"]);
  });

  it("strips emphasis from labels but keeps the rendered id", () => {
    const outline = extractOutline("## **Paid** to disappear");

    expect(outline[0].label).toBe("Paid to disappear");
    expect(outline[0].id).toBe(headingId("**Paid** to disappear"));
  });

  it("drops duplicate headings so rail links stay unambiguous", () => {
    expect(extractOutline("## Sources\n\n## Sources")).toHaveLength(1);
  });
});

describe("extractPullQuote", () => {
  it("prefers the article's own blockquote", () => {
    const quote = extractPullQuote(
      `Opening.\n\n> "Advantage isn't about driving the latest cars. It's about how that elevated post helps your people."\n\nMore body text.`
    );

    expect(quote?.quoted).toBe(true);
    expect(quote?.text).toContain("elevated post helps your people");
    expect(quote?.text.startsWith('"')).toBe(false);
  });

  it("lifts a self-contained sentence when there is no blockquote", () => {
    const body = [
      "A short opening line.",
      "Dreams do not first ask about our income, gender, race, religion or social class before appearing inside us.",
      "A short closing line.",
    ].join("\n\n");

    const quote = extractPullQuote(body);
    expect(quote?.quoted).toBe(false);
    expect(quote?.text).toContain("Dreams do not first ask");
  });

  it("skips sentences carrying links, which read as fragments once pulled out", () => {
    const body = [
      "Opening.",
      "According to [Uganda Bureau of Statistics data](https://www.ubos.org/uganda-profile/), half of young people were not in employment, education or training.",
      "Youth spaces are not simply rooms; they are infrastructure for belonging and opportunity.",
      "Closing.",
    ].join("\n\n");

    const quote = extractPullQuote(body);
    expect(quote?.text).toContain("infrastructure for belonging");
  });

  it("returns null when nothing is quotable", () => {
    expect(extractPullQuote("Too short.")).toBeNull();
    expect(extractPullQuote("")).toBeNull();
  });
});

describe("published story content", () => {
  const published = stories.filter((story) => story.published !== false);

  it("gives every story a reading time the template can show", () => {
    for (const story of published) {
      const readingTime = story.readingTimeMinutes ?? estimateReadingTime(story.body);
      expect(readingTime, story.slug).toBeGreaterThan(0);
    }
  });

  it("keeps any focal-point override a valid two-axis object-position", () => {
    for (const story of published) {
      if (!story.heroImageFocalPoint) continue;
      expect(story.heroImageFocalPoint, story.slug).toMatch(
        /^(\d+(\.\d+)?%|left|right|center)\s+(\d+(\.\d+)?%|top|bottom|center)$/
      );
    }
  });
});

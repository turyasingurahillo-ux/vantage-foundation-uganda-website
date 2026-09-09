import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/(public)/[locale]/stories/rss.xml/route";

const mockGetPublishedStoriesWithDb = vi.hoisted(() => vi.fn());

vi.mock("@/lib/stories-public", () => ({
  getPublishedStoriesWithDb: mockGetPublishedStoriesWithDb,
}));

const baseStory = {
  id: 1,
  slug: "beyond-the-ward",
  title: "Beyond the Ward",
  excerpt: "A practical guide.",
  date: "2026-08-14T00:00:00.000Z",
  author: "Vantage Research Team",
  published: true,
  tags: ["health workforce", "career guidance"],
};

function parseRssXml(text: string) {
  const channelLink =
    text.match(/<channel>[\s\S]*?<link>(.*?)<\/link>/)?.[1] ?? "";
  const selfLink =
    text.match(/<atom:link[^>]*?href="(.*?)"[^>]*?rel="self"/)?.[1] ?? "";
  const itemCount = (text.match(/<item>/g) ?? []).length;
  return { channelLink, selfLink, itemCount };
}

describe("stories RSS feed", () => {
  beforeEach(() => {
    mockGetPublishedStoriesWithDb.mockReset();
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it("emits canonical HTTPS www URLs for channel, self and story links", async () => {
    process.env.NEXT_PUBLIC_SITE_URL =
      "https://http://vantagefoundationuganda.com//";
    mockGetPublishedStoriesWithDb.mockResolvedValue([baseStory]);

    const text = await (await GET()).text();
    const { channelLink, selfLink, itemCount } = parseRssXml(text);

    expect(itemCount).toBe(1);
    expect(channelLink).toBe("https://www.vantagefoundationuganda.com/stories");
    expect(selfLink).toBe(
      "https://www.vantagefoundationuganda.com/stories/rss.xml"
    );
    expect(text).toContain(
      "<link>https://www.vantagefoundationuganda.com/stories/beyond-the-ward</link>"
    );
    expect(text).toContain(
      '<guid isPermaLink="true">https://www.vantagefoundationuganda.com/stories/beyond-the-ward</guid>'
    );
  });

  it.each([
    "https://http//vantagefoundationuganda.com/",
    "https://http://vantagefoundationuganda.com/",
    "http://vantagefoundationuganda.com",
    "http://vantagefoundationuganda.com/",
    "https://www.vantagefoundationuganda.com/",
    "https://www.vantagefoundationuganda.com////",
  ])(
    "does not allow malformed env %j to corrupt feed URLs",
    async (envValue) => {
      process.env.NEXT_PUBLIC_SITE_URL = envValue;
      mockGetPublishedStoriesWithDb.mockResolvedValue([baseStory]);

      const text = await (await GET()).text();

      expect(text).not.toContain("https://http");
      expect(text).not.toContain("http://vantagefoundationuganda.com/stories");
      expect(text).not.toMatch(/vantagefoundationuganda\.com\/\//);
      expect(text).toContain(
        "https://www.vantagefoundationuganda.com/stories/beyond-the-ward"
      );
    }
  );

  it("escapes XML-sensitive content in story fields", async () => {
    const story = {
      ...baseStory,
      title: 'Bad < & "chars"',
      excerpt: "A & B < C",
      author: "O'Brien",
    };
    mockGetPublishedStoriesWithDb.mockResolvedValue([story]);

    const text = await (await GET()).text();

    expect(text).toContain(
      "<title>Bad &lt; &amp; &quot;chars&quot;</title>"
    );
    expect(text).toContain("<description>A &amp; B &lt; C</description>");
    expect(text).toContain("<dc:creator>O&apos;Brien</dc:creator>");
  });

  it("only includes stories returned by the publication gate", async () => {
    mockGetPublishedStoriesWithDb.mockResolvedValue([baseStory]);

    const text = await (await GET()).text();

    expect((text.match(/<item>/g) ?? []).length).toBe(1);
  });
});

import { getPublishedStoriesWithDb } from "@/lib/stories-public";
import { site } from "@/content/site";

export const revalidate = 3600;

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function storyToItem(story: Awaited<ReturnType<typeof getPublishedStoriesWithDb>>[number], baseUrl: string): string {
  const url = `${baseUrl}/stories/${story.slug}`;
  const description = escapeXml(story.excerpt);
  const title = escapeXml(story.title);
  const author = story.author ? escapeXml(story.author) : site.name;
  const categories = story.tags
    ? story.tags.map((t) => `      <category>${escapeXml(t)}</category>`).join("\n")
    : "";

  return `    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${description}</description>
      <dc:creator>${author}</dc:creator>
      <pubDate>${new Date(story.date).toUTCString()}</pubDate>${categories ? "\n" + categories : ""}
    </item>`;
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || site.url || "https://vantagefoundationuganda.org";
  const stories = await getPublishedStoriesWithDb();
  const lastBuildDate = stories.length > 0
    ? new Date(stories[0].date).toUTCString()
    : new Date().toUTCString();

  const items = stories.map((s) => storyToItem(s, baseUrl)).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.name)} — Stories</title>
    <link>${baseUrl}/stories</link>
    <atom:link href="${baseUrl}/stories/rss.xml" rel="self" type="application/rss+xml" />
    <description>Stories and updates from ${escapeXml(site.name)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <generator>Vantage Foundation Uganda Website</generator>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

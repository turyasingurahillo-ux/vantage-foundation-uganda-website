import { describe, expect, it } from "vitest";
import { getLocalImageDimensions, parseImageDimensions } from "@/lib/image-dimensions";
import { stories } from "@/content/stories";

describe("getLocalImageDimensions", () => {
  it("reads the real shape of a portrait story hero", () => {
    // The photograph that the cinematic band used to crop through.
    expect(getLocalImageDimensions("/images/photos/photo-058.webp")).toEqual({
      width: 1152,
      height: 1536,
    });
  });

  it("reads the real shape of a landscape story hero", () => {
    expect(getLocalImageDimensions("/images/photos/photo-073.webp")).toEqual({
      width: 1536,
      height: 1152,
    });
  });

  it("resolves every published story hero that lives in public/", () => {
    const localHeroes = stories
      .filter((story) => story.published !== false)
      .map((story) => story.heroImage)
      .filter((src): src is string => Boolean(src?.startsWith("/")));

    expect(localHeroes.length).toBeGreaterThan(0);
    for (const src of localHeroes) {
      expect(getLocalImageDimensions(src), src).not.toBeNull();
    }
  });

  it("returns null for remote, missing and traversing paths", () => {
    expect(getLocalImageDimensions("https://example.com/hero.webp")).toBeNull();
    expect(getLocalImageDimensions("/images/does-not-exist.webp")).toBeNull();
    expect(getLocalImageDimensions("/../package.json")).toBeNull();
    expect(getLocalImageDimensions(undefined)).toBeNull();
  });
});

describe("parseImageDimensions", () => {
  it("reads a PNG header", () => {
    const buffer = Buffer.alloc(24);
    buffer.write("\x89PNG", 0, "binary");
    buffer.writeUInt32BE(0x49484452, 12);
    buffer.writeUInt32BE(800, 16);
    buffer.writeUInt32BE(600, 20);

    expect(parseImageDimensions(buffer)).toEqual({ width: 800, height: 600 });
  });

  it("reads an extended (VP8X) WebP canvas size", () => {
    const buffer = Buffer.alloc(30);
    buffer.write("RIFF", 0, "ascii");
    buffer.write("WEBP", 8, "ascii");
    buffer.write("VP8X", 12, "ascii");
    // Canvas dimensions are stored 24-bit little-endian, each minus one.
    buffer.writeUIntLE(1919, 24, 3);
    buffer.writeUIntLE(1079, 27, 3);

    expect(parseImageDimensions(buffer)).toEqual({ width: 1920, height: 1080 });
  });

  it("returns null for data it does not recognise", () => {
    expect(parseImageDimensions(Buffer.alloc(4))).toBeNull();
    expect(parseImageDimensions(Buffer.alloc(64))).toBeNull();
  });
});

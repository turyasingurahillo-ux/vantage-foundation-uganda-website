import "server-only";

import { closeSync, openSync, readSync } from "node:fs";
import { join, normalize, sep } from "node:path";

/**
 * Intrinsic dimensions for images that live in `public/`.
 *
 * Story heroes are stored as plain path strings (`/images/photos/photo-058.webp`)
 * rather than static imports, so next/image never learns their shape and the
 * template cannot tell a portrait photograph from a landscape one. Framing a
 * 3:4 portrait inside a cinematic band crops it through the subject's face, so
 * the template needs the real aspect ratio to choose a safe frame.
 *
 * Only the file header is parsed — a few dozen bytes — and results are cached
 * for the lifetime of the server process. Remote sources (presigned R2 URLs on
 * database-backed stories) return null and callers fall back to their default
 * framing.
 */

export interface ImageDimensions {
  width: number;
  height: number;
}

const cache = new Map<string, ImageDimensions | null>();

function parsePng(buffer: Buffer): ImageDimensions | null {
  // 8-byte signature, then the IHDR chunk: length, type, width, height.
  if (buffer.length < 24) return null;
  if (buffer.readUInt32BE(12) !== 0x49484452) return null; // "IHDR"
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function parseWebp(buffer: Buffer): ImageDimensions | null {
  if (buffer.length < 30) return null;
  const format = buffer.toString("ascii", 12, 16);

  if (format === "VP8 ") {
    // Lossy: 3-byte frame tag, 3-byte sync code, then 14-bit width/height.
    if (buffer[23] !== 0x9d || buffer[24] !== 0x01 || buffer[25] !== 0x2a) return null;
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  }

  if (format === "VP8L") {
    // Lossless: signature byte, then 14 bits of (width - 1) and (height - 1).
    if (buffer[20] !== 0x2f) return null;
    const bits = buffer.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }

  if (format === "VP8X") {
    // Extended: 24-bit little-endian canvas width/height, each minus one.
    const width = buffer[24] | (buffer[25] << 8) | (buffer[26] << 16);
    const height = buffer[27] | (buffer[28] << 8) | (buffer[29] << 16);
    return { width: width + 1, height: height + 1 };
  }

  return null;
}

function parseJpeg(buffer: Buffer): ImageDimensions | null {
  let offset = 2; // Skip the SOI marker.

  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    // Start-of-frame markers carry the dimensions; DHT/DAC/RST/SOS do not.
    const isStartOfFrame =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isStartOfFrame) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd9)) {
      offset += 2;
      continue;
    }
    offset += 2 + buffer.readUInt16BE(offset + 2);
  }

  return null;
}

export function parseImageDimensions(buffer: Buffer): ImageDimensions | null {
  if (buffer.length < 24) return null;

  const dimensions =
    buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP"
      ? parseWebp(buffer)
      : buffer[0] === 0x89 && buffer.toString("ascii", 1, 4) === "PNG"
        ? parsePng(buffer)
        : buffer[0] === 0xff && buffer[1] === 0xd8
          ? parseJpeg(buffer)
          : null;

  if (!dimensions) return null;
  if (!Number.isFinite(dimensions.width) || !Number.isFinite(dimensions.height)) return null;
  if (dimensions.width <= 0 || dimensions.height <= 0) return null;
  return dimensions;
}

/**
 * Reads the intrinsic size of a site-relative image under `public/`.
 * Returns null for remote URLs, data URIs, missing files and unreadable
 * headers so callers can fall back rather than fail a page render.
 */
export function getLocalImageDimensions(src?: string): ImageDimensions | null {
  if (!src || !src.startsWith("/") || src.startsWith("//")) return null;

  const cached = cache.get(src);
  if (cached !== undefined) return cached;

  let dimensions: ImageDimensions | null = null;
  try {
    const publicDir = join(process.cwd(), "public");
    const relative = normalize(decodeURIComponent(src.split(/[?#]/)[0])).replace(/^[\\/]+/, "");
    const absolute = join(publicDir, relative);
    // normalize() collapses any `..` segments; anything that still escapes
    // public/ is rejected rather than opened.
    if (absolute.startsWith(publicDir + sep)) {
      // JPEG dimensions can sit behind large EXIF/ICC segments, so read enough
      // of the header to walk past them without loading whole photographs.
      const header = Buffer.alloc(65_536);
      const handle = openSync(absolute, "r");
      try {
        const bytesRead = readSync(handle, header, 0, header.length, 0);
        dimensions = parseImageDimensions(header.subarray(0, bytesRead));
      } finally {
        closeSync(handle);
      }
    }
  } catch {
    dimensions = null;
  }

  cache.set(src, dimensions);
  return dimensions;
}

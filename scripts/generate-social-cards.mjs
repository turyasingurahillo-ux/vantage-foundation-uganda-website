/**
 * Social-card generator.
 *
 * Link-preview crawlers (X, LinkedIn, Facebook, WhatsApp) do not render the
 * WebP and AVIF heroes the site serves to browsers — see lib/social-image.ts
 * for the full reasoning. This script derives a crawler-safe card from each
 * story's hero image so the article's own artwork still shows in a feed.
 *
 * Contract, relied upon by `socialCard()` in lib/social-image.ts: every file
 * written here is exactly 1200x630 JPEG. That is why the metadata layer can
 * declare og:image:width/height without reading the file at render time —
 * public/ is served by the CDN and is not reliably readable from the
 * filesystem in a serverless render.
 *
 * A story can opt out by pointing `seo.socialImage` at a hand-made card
 * elsewhere (as Healers in Crisis does); those are skipped rather than
 * overwritten.
 *
 * Output is deterministic: same input, same bytes. Re-running it is a no-op in
 * git unless a hero image actually changed.
 *
 * Usage: npm run generate:social
 */
import { mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { stories } from "../content/stories.ts";
import { projects } from "../content/projects.ts";
import { isSocialSafeImage } from "../lib/social-image.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const OUTPUT_DIR = path.join(PUBLIC_DIR, "images", "social");

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;
const JPEG_QUALITY = 82;

/**
 * Sources at least this wide relative to their height are cropped to fill;
 * anything squarer is fitted whole over a blurred backdrop. 1.7 keeps 16:9
 * heroes (1.78) on the crop path while sending 3:2 (1.5) and 4:3 (1.33) down
 * the fit path.
 */
const CROP_MIN_ASPECT_RATIO = 1.7;

/** Mirrors SOCIAL_CARD_DIRECTORY in lib/social-image.ts. */
const CARD_URL_PREFIX = "/images/social/";

/**
 * Read a CSS `object-position` value like "50% 12%" into fractions.
 * Returns undefined for anything that is not a plain percentage pair —
 * keywords and length units are left to the saliency path.
 */
function parseFocalPoint(value) {
  const match = /^\s*([\d.]+)%\s+([\d.]+)%\s*$/.exec(value ?? "");
  if (!match) return undefined;
  return { x: Number(match[1]) / 100, y: Number(match[2]) / 100 };
}

/**
 * The largest card-shaped rectangle inside the source, centred on the focal
 * point and clamped to stay within the image.
 */
function focalCrop(sourceWidth, sourceHeight, { x, y }) {
  const targetRatio = CARD_WIDTH / CARD_HEIGHT;
  const sourceRatio = sourceWidth / sourceHeight;

  const width =
    sourceRatio > targetRatio
      ? Math.round(sourceHeight * targetRatio)
      : sourceWidth;
  const height =
    sourceRatio > targetRatio
      ? sourceHeight
      : Math.round(sourceWidth / targetRatio);

  const clamp = (value, max) => Math.max(0, Math.min(Math.round(value), max));

  return {
    left: clamp(x * sourceWidth - width / 2, sourceWidth - width),
    top: clamp(y * sourceHeight - height / 2, sourceHeight - height),
    width,
    height,
  };
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  let written = 0;
  let skipped = 0;
  const problems = [];

  for (const item of [...stories, ...projects]) {
    if (item.published === false) continue;

    // A hand-made card outside the generated directory already wins the
    // preference chain in lib/social-image.ts; don't produce a dead file.
    const handMade = [item.seo?.socialImage, item.seo?.ogImage].find(
      (candidate) =>
        candidate &&
        isSocialSafeImage(candidate) &&
        !(typeof candidate === "string"
          ? candidate
          : candidate.url
        ).startsWith(CARD_URL_PREFIX)
    );
    if (handMade) {
      const url = typeof handMade === "string" ? handMade : handMade.url;
      console.log(`  skip  ${item.slug} — hand-made card at ${url}`);
      skipped += 1;
      continue;
    }

    if (!item.heroImage) {
      console.log(`  skip  ${item.slug} — no hero image, uses site default`);
      skipped += 1;
      continue;
    }

    const sourcePath = path.join(PUBLIC_DIR, item.heroImage.replace(/^\//, ""));
    if (!existsSync(sourcePath)) {
      problems.push(`${item.slug}: hero image not found at ${item.heroImage}`);
      continue;
    }

    const outputPath = path.join(OUTPUT_DIR, `${item.slug}-og.jpg`);

    // How the source is fitted depends on how far its shape is from the
    // card's 1.9:1.
    //
    // A 16:9 hero loses only a sliver of height, so it is cropped to fill —
    // that reads best in a feed. A 4:3 or 3:2 hero would lose nearly half its
    // height, which decapitates a standing subject: cropping one of those
    // produced a headless torso, and switching to saliency gravity still cut
    // the face. Those are instead fitted whole over a blurred, darkened copy
    // of themselves, so the card is still exactly 1200x630 with no bars and
    // nothing important is lost.
    const { width: sourceWidth, height: sourceHeight } =
      await sharp(sourcePath).metadata();
    const sourceRatio = sourceWidth / sourceHeight;

    // A story that declares heroImageFocalPoint has already told us where its
    // subject is, for exactly this reason (see "Story hero images" in
    // AGENTS.md). Honour it rather than second-guessing with saliency, so the
    // card and the page hero frame the same thing.
    const focalPoint = parseFocalPoint(item.heroImageFocalPoint);

    const pipeline =
      sourceRatio >= CROP_MIN_ASPECT_RATIO
        ? focalPoint
          ? sharp(sourcePath)
              .extract(
                focalCrop(sourceWidth, sourceHeight, focalPoint)
              )
              .resize(CARD_WIDTH, CARD_HEIGHT)
          : sharp(sourcePath).resize(CARD_WIDTH, CARD_HEIGHT, {
              fit: "cover",
              position: sharp.strategy.attention,
            })
        : sharp(
            await sharp(sourcePath)
              .resize(CARD_WIDTH, CARD_HEIGHT, { fit: "cover" })
              .blur(28)
              .modulate({ brightness: 0.55 })
              .toBuffer()
          ).composite([
            {
              input: await sharp(sourcePath)
                .resize(CARD_WIDTH, CARD_HEIGHT, { fit: "inside" })
                .toBuffer(),
              gravity: "centre",
            },
          ]);

    const info = await pipeline
      // JPEG has no alpha; flatten onto white so transparent sources do not
      // come out with black fringes.
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true, progressive: true })
      .toFile(outputPath);

    console.log(
      `  write ${item.slug}-og.jpg  ${info.width}x${info.height}  ${(
        info.size / 1024
      ).toFixed(0)} kB`
    );
    written += 1;
  }

  console.log(`\n${written} card(s) written, ${skipped} skipped.`);

  if (problems.length) {
    console.error("\nProblems:");
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

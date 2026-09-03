import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(scriptDir, "..");
const deliverablesDir = path.join(projectDir, "deliverables");
const sourcePath = path.join(
  deliverablesDir,
  "Vantage-Foundation-Uganda-Brand-Identity-Pack.html",
);
const pdfPath = path.join(
  deliverablesDir,
  "Vantage-Foundation-Uganda-Brand-Identity-Pack.pdf",
);
const previewDir = path.join(deliverablesDir, "brand-pack-previews");
const printAssetDir = path.join(deliverablesDir, "brand-pack-assets");

await mkdir(previewDir, { recursive: true });
await mkdir(printAssetDir, { recursive: true });

for (const filename of ["photo-059", "photo-064", "photo-075", "photo-088"]) {
  await sharp(path.join(projectDir, "public", "images", "photos", `${filename}.webp`))
    .resize({ width: 1400, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(printAssetDir, `${filename}.jpg`));
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });

await page.goto(pathToFileURL(sourcePath).href, { waitUntil: "load" });
await page.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all(
    [...document.images].map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
          }),
    ),
  );
});

const missingImages = await page.locator("img").evaluateAll((images) =>
  images
    .filter((img) => !img.complete || img.naturalWidth === 0)
    .map((img) => img.getAttribute("src")),
);
if (missingImages.length > 0) {
  throw new Error(`Missing image assets: ${missingImages.join(", ")}`);
}

const pageCount = await page.locator(".page").count();
if (pageCount !== 27) {
  throw new Error(`Expected 27 designed pages; found ${pageCount}.`);
}

const pageMetrics = await page.locator(".page").evaluateAll((pages) =>
  pages.map((item, index) => ({
    page: index + 1,
    width: item.clientWidth,
    height: item.clientHeight,
    scrollWidth: item.scrollWidth,
    scrollHeight: item.scrollHeight,
  })),
);
const overflow = pageMetrics.filter(
  (item) => item.scrollWidth > item.width + 1 || item.scrollHeight > item.height + 1,
);
if (overflow.length > 0) {
  throw new Error(`Page overflow detected: ${JSON.stringify(overflow)}`);
}

for (const pageNumber of [1, 3, 6, 10, 12, 16, 19, 22, 24, 27]) {
  await page
    .locator(".page")
    .nth(pageNumber - 1)
    .screenshot({
      path: path.join(previewDir, `page-${String(pageNumber).padStart(2, "0")}.png`),
      animations: "disabled",
    });
}

await page.pdf({
  path: pdfPath,
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: "0", right: "0", bottom: "0", left: "0" },
  displayHeaderFooter: false,
  tagged: true,
  outline: true,
});

console.log(
  JSON.stringify(
    {
      source: sourcePath,
      pdf: pdfPath,
      previews: previewDir,
      pages: pageCount,
      pageMetrics: pageMetrics[0],
    },
    null,
    2,
  ),
);

await browser.close();

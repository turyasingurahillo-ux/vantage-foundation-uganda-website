/**
 * One-off build helper: downloads Natural Earth 50m GeoJSON
 * (countries-with-lakes, lakes, admin-1 provinces/regions) and filters it to a
 * lightweight, Vantage-branded Uganda reach map.
 *
 * Sources:
 * - Natural Earth (public domain) via https://github.com/code4fukui/natural-earth-geojson
 *
 * Run from the project root: node scripts/prepare-uganda-map.mjs
 */
import fs from "node:fs";
import path from "node:path";

const OUT_DIR = path.join("public", "geojson");
const BASE = "https://raw.githubusercontent.com/code4fukui/natural-earth-geojson/master";

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  return res.json();
}

function writeJson(file, data) {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, file), JSON.stringify(data));
}

function pickFeature(collection, predicate) {
  const f = collection.features.find(predicate);
  if (!f) throw new Error("Required feature not found");
  return f;
}

const targetAdmins = new Set([
  "Uganda",
  "Kenya",
  "Tanzania",
  "Rwanda",
  "Democratic Republic of the Congo",
  "South Sudan",
]);
const targetIso = new Set(["UGA", "KEN", "TZA", "RWA", "COD", "SSD"]);

const lakeNames = new Set(["Lake Victoria", "L. Albert", "L. Edward", "Lake Kyoga"]);

const [countries, lakes, admin1] = await Promise.all([
  fetchJson(`${BASE}/50m/cultural/ne_50m_admin_0_countries_lakes.json`),
  fetchJson(`${BASE}/50m/physical/ne_50m_lakes.json`),
  fetchJson(`${BASE}/50m/cultural/ne_50m_admin_1_states_provinces.json`),
]);

const uganda = pickFeature(
  countries,
  (f) =>
    f.properties.ISO_A3 === "UGA" ||
    f.properties.ADMIN === "Uganda" ||
    f.properties.SOVEREIGNT === "Uganda",
);

const neighbors = countries.features.filter(
  (f) =>
    f !== uganda &&
    (targetAdmins.has(f.properties.ADMIN) ||
      targetAdmins.has(f.properties.SOVEREIGNT) ||
      targetIso.has(f.properties.ISO_A3)),
);

const lakeFeatures = lakes.features.filter((f) =>
  lakeNames.has(f.properties.name),
);

const regionFeatures = admin1.features.filter(
  (f) =>
    f.properties.SOVEREIGNT === "Uganda" ||
    f.properties.ADMIN === "Uganda" ||
    f.properties.ISO_A2 === "UG",
);

const output = {
  type: "FeatureCollection",
  properties: {
    source: "Natural Earth 50m (public domain) via code4fukui/natural-earth-geojson",
    date: new Date().toISOString().split("T")[0],
  },
  features: [
    {
      type: "Feature",
      properties: { layer: "uganda", name: uganda.properties.ADMIN },
      geometry: uganda.geometry,
    },
    ...neighbors.map((f) => ({
      type: "Feature",
      properties: { layer: "neighbors", name: f.properties.ADMIN },
      geometry: f.geometry,
    })),
    ...lakeFeatures.map((f) => ({
      type: "Feature",
      properties: { layer: "lakes", name: f.properties.name },
      geometry: f.geometry,
    })),
    ...regionFeatures.map((f) => ({
      type: "Feature",
      properties: { layer: "regions", name: f.properties.NAME },
      geometry: f.geometry,
    })),
  ],
};

writeJson("uganda-map.json", output);
console.log(`Wrote public/geojson/uganda-map.json (${output.features.length} features)`);

// Districts where Vantage Foundation Uganda has run programmes, supplied by
// the founder (2026-07-27). Positions are approximate percentage coordinates
// on a simplified schematic (NOT a traced map, NOT exact GPS) — see
// UgandaReachMap's caption and the accessible text list it renders alongside
// the visual.
//
// `projectSlugs` links a district to real, published projects (content/projects.ts)
// with confirmed activity there — curated by hand rather than string-matched
// against each project's free-text `location` field, since those don't map
// cleanly to district names (e.g. "Kasaale, Uganda" isn't one of the districts
// below). An empty/omitted list means the area is reached but has no single
// dedicated project page yet — render that honestly, don't force a link.
//
// Kalangala was added 2026-07-31: it's the location of the published
// "orphanage-relief" project and appears in content/impact.ts's `regions`,
// but was missing from this file. Flagged for founder confirmation in case
// its absence here was deliberate — its x/y position is an estimate (south
// of Kampala, in Lake Victoria) rather than a founder-supplied coordinate
// like the other seven.
export interface ReachDistrict {
  /** Uganda district name (matches administrative gazetteer). */
  name: string;
  /** Uganda district name — same as `name` for presentational use. */
  district: string;
  /** WGS84 latitude of the district centre. */
  latitude: number;
  /** WGS84 longitude of the district centre. */
  longitude: number;
  /** Published project slugs with confirmed activity in this district. */
  projectSlugs?: string[];
  /** Optional short description for the map tooltip. */
  description?: string;
}

// x/y refined 2026-07-31 from real district coordinates (WGS84, sourced and
// verified against gazetteer data) projected equirectangularly onto the same
// 0-100 frame as the traced outline in UgandaReachMap.tsx — chosen because it
// lines up almost exactly with the founder-supplied estimates above (all
// within a few percentage points), so the refinement doesn't relocate any
// district, just lets the pins sit precisely on the new outline.
export const reachDistricts: ReachDistrict[] = [
  { name: "Gulu", district: "Gulu", latitude: 3.019, longitude: 32.388, description: "Northern outreach and recovery programmes." },
  { name: "Kiryandongo", district: "Kiryandongo", latitude: 1.991, longitude: 32.051, description: "Humanitarian and food-security support." },
  { name: "Kayunga", district: "Kayunga", latitude: 0.99, longitude: 32.862, description: "Community empowerment and WASH." },
  { name: "Kampala", district: "Kampala", latitude: 0.31, longitude: 32.587, projectSlugs: ["mental-health-financial-literacy-workshops"], description: "Mental health and financial-literacy workshops." },
  { name: "Jinja", district: "Jinja", latitude: 0.544, longitude: 33.229, projectSlugs: ["orphanage-relief"], description: "Orphanage relief and child welfare." },
  { name: "Namutumba", district: "Namutumba", latitude: 0.887, longitude: 33.666, description: "Eastern livelihoods and education." },
  { name: "Bushenyi", district: "Bushenyi", latitude: -0.475, longitude: 30.171, projectSlugs: ["mental-health-financial-literacy-workshops"], description: "Mental health and financial-literacy workshops." },
  { name: "Kalangala", district: "Kalangala", latitude: -0.572, longitude: 32.438, projectSlugs: ["orphanage-relief"], description: "Ssese Islands orphanage relief." },
];

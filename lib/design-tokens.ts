/**
 * Vantage Foundation Uganda — Design Tokens (TypeScript source of truth).
 *
 * Mirrors the CSS custom properties in app/globals.css so that JS-side code
 * (brand-guide page, charts, email templates, OG image generation) can reference
 * the same values without duplicating literals.
 *
 * When updating the palette, update BOTH this file and app/globals.css.
 */

// Exactly three dominant colours across the site, roughly a third each:
// teal, white, and black/dark charcoal. See docs/brand/colour-system.md.
export const brandColors = {
  deepTeal: "#008f95",
  brightAqua: "#ddf5f4", // teal light — pale wash, never text
  oceanBlue: "#006b70", // teal dark
  darkNavy: "#050708", // black
  white: "#ffffff",
  charcoal: "#0b1b22", // dark charcoal
} as const;

// --primary uses teal dark (#006b70), not teal primary (#008f95): teal
// primary only reaches ~3.9:1 contrast on white, short of WCAG AA's 4.5:1
// for normal text, and this token backs buttons/links everywhere. Teal
// primary (brandColors.deepTeal) stays available for large text/surfaces
// (24px+, which only needs 3:1 contrast).
export const semanticColors = {
  background: "#fbfefd",
  foreground: "#050708",
  primary: "#006b70",
  primaryDark: "#00565a",
  primaryLight: "#ddf5f4",
  accent: "#006b70", // aliased to teal dark — no orange/yellow accents
  muted: "#f4faf9",
  mutedForeground: "#475569",
  border: "#dce5e5",
  surface: "#f1f8f7",
  surfaceStrong: "#e7f2f1",
} as const;

export const statusColors = {
  success: { fg: "#15803d", bg: "#dcfce7", text: "#166534" },
  warning: { fg: "#b45309", bg: "#fef3c7", text: "#78350f" },
  destructive: { fg: "#b91c1c", bg: "#fee2e2", text: "#7f1d1d" },
  info: { fg: "#006b70", bg: "#e0f2fe", text: "#0c4a6e" },
} as const;

export type ProgrammeId =
  | "health"
  | "education"
  | "water"
  | "humanitarian"
  | "research"
  | "environment"
  | "youth"
  | "alert";

export interface ProgrammeToken {
  id: ProgrammeId;
  label: string;
  hex: string;
  /** Tailwind utility class token (e.g. "programme-health" → bg-programme-health) */
  token: string;
  /** Accessible text colour to pair on top of the programme colour (white or navy). */
  onColor: string;
  /**
   * A shade of this programme's colour guaranteed to pass WCAG AA (4.5:1)
   * both as text on white AND as a background for white text at any size.
   * `hex` (Teal Primary, #008f95) only passes 3:1 — fine for large headings,
   * but fails for small badges/labels/eyebrow text. Use `safeHex` for any
   * section background or text colour that carries small text; `hex` is
   * still fine for large headings and non-text decoration (icon tints,
   * bullet dots).
   */
  safeHex: string;
}

// Kept within the teal/black brand system — no unrelated hues (orange,
// purple, sky blue, cyan). "alert" stays red: a functional safety/status
// colour, not a decorative brand accent.
export const programmeColours: Record<ProgrammeId, ProgrammeToken> = {
  health: { id: "health", label: "Health", hex: "#008f95", safeHex: "#006b70", token: "programme-health", onColor: "#ffffff" },
  education: { id: "education", label: "Education", hex: "#006b70", safeHex: "#006b70", token: "programme-education", onColor: "#ffffff" },
  water: { id: "water", label: "Water & WASH", hex: "#0b1b22", safeHex: "#0b1b22", token: "programme-water", onColor: "#ffffff" },
  humanitarian: { id: "humanitarian", label: "Humanitarian Assistance", hex: "#050708", safeHex: "#050708", token: "programme-humanitarian", onColor: "#ffffff" },
  research: { id: "research", label: "Research", hex: "#008f95", safeHex: "#006b70", token: "programme-research", onColor: "#ffffff" },
  environment: { id: "environment", label: "Environment & Agriculture", hex: "#006b70", safeHex: "#006b70", token: "programme-environment", onColor: "#ffffff" },
  youth: { id: "youth", label: "Youth Empowerment", hex: "#0b1b22", safeHex: "#0b1b22", token: "programme-youth", onColor: "#ffffff" },
  alert: { id: "alert", label: "Emergency Alert", hex: "#dc2626", safeHex: "#dc2626", token: "programme-alert", onColor: "#ffffff" },
};

/**
 * Maps an area-of-work id from content/areas.ts to a programme accent token.
 * Falls back to primary teal for unmapped areas.
 */
export function programmeTokenForArea(areaId: string): ProgrammeToken {
  const map: Record<string, ProgrammeId> = {
    health: "health",
    education: "education",
    water: "water",
    humanitarian: "humanitarian",
    "youth-leadership": "youth",
  };
  const id = map[areaId];
  return id ? programmeColours[id] : { ...programmeColours.health, hex: brandColors.deepTeal, token: "primary" };
}

/**
 * Maps a ProjectCategory string (from content/projects.ts) to a programme
 * accent token. Falls back to primary teal for unmapped categories.
 */
export function programmeTokenForCategory(category: string): ProgrammeToken {
  const map: Record<string, ProgrammeId> = {
    Health: "health",
    Education: "education",
    "Water & Sanitation": "water",
    "Humanitarian Aid": "humanitarian",
    "Youth Leadership": "youth",
  };
  const id = map[category];
  return id ? programmeColours[id] : { ...programmeColours.health, hex: brandColors.deepTeal, token: "primary" };
}

/**
 * Maps a ProjectCategory string to a canonical ProgrammeId (the four primary
 * programmes). "Youth Leadership" maps to "education" as the closest primary
 * programme since youth leadership is a cross-cutting approach, not a fifth
 * standalone programme. Falls back to "health" for unknown categories.
 */
export function programmeIdForCategory(category: string): ProgrammeId {
  const map: Record<string, ProgrammeId> = {
    Health: "health",
    Education: "education",
    "Water & Sanitation": "water",
    "Humanitarian Aid": "humanitarian",
    "Youth Leadership": "education",
  };
  return map[category] ?? "health";
}

/** Human-readable label for a ProgrammeId, matching the programme page titles. */
export function programmeLabel(id: ProgrammeId): string {
  const map: Partial<Record<ProgrammeId, string>> = {
    health: "Vantage Care",
    education: "KikumiKyo Academy",
    humanitarian: "Humanitarian Assistance",
    water: "Water, Sanitation and Hygiene",
  };
  return map[id] ?? id;
}

export const typography = {
  fontFamily: "var(--font-source-sans), 'Frutiger', 'Segoe UI', system-ui, -apple-system, sans-serif",
  scale: {
    display: { size: "3.5rem", lineHeight: 1.1, weight: 700, tracking: "-0.02em" },
    h1: { size: "2.5rem", lineHeight: 1.15, weight: 700, tracking: "-0.02em" },
    h2: { size: "1.875rem", lineHeight: 1.2, weight: 600, tracking: "-0.01em" },
    h3: { size: "1.5rem", lineHeight: 1.3, weight: 600, tracking: "0" },
    h4: { size: "1.25rem", lineHeight: 1.4, weight: 600, tracking: "0" },
    bodyLg: { size: "1.125rem", lineHeight: 1.6, weight: 400, tracking: "0" },
    body: { size: "1rem", lineHeight: 1.625, weight: 400, tracking: "0" },
    bodySm: { size: "0.875rem", lineHeight: 1.5, weight: 400, tracking: "0" },
    caption: { size: "0.75rem", lineHeight: 1.4, weight: 400, tracking: "0.02em" },
    overline: { size: "0.75rem", lineHeight: 1.4, weight: 600, tracking: "0.08em" },
  },
} as const;

export const spacing = {
  "1": "0.25rem", "2": "0.5rem", "3": "0.75rem", "4": "1rem",
  "6": "1.5rem", "8": "2rem", "12": "3rem", "16": "4rem",
  "20": "5rem", "24": "6rem", "32": "8rem",
} as const;

export const radii = {
  sm: "0.375rem", md: "0.5rem", lg: "0.75rem", xl: "1rem", "2xl": "1.5rem", full: "9999px",
} as const;

export const shadows = {
  sm: "0 1px 2px 0 rgb(8 35 58 / 0.05)",
  md: "0 4px 6px -1px rgb(8 35 58 / 0.08), 0 2px 4px -2px rgb(8 35 58 / 0.06)",
  lg: "0 10px 15px -3px rgb(8 35 58 / 0.1), 0 4px 6px -4px rgb(8 35 58 / 0.05)",
  xl: "0 20px 25px -5px rgb(8 35 58 / 0.12), 0 8px 10px -6px rgb(8 35 58 / 0.05)",
} as const;

export const breakpoints = {
  sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536,
} as const;

export const imageRatios = {
  hero: "16 / 9",
  feature: "3 / 2",
  card: "4 / 3",
  square: "1 / 1",
  portrait: "4 / 5",
  socialPortrait: "9 / 16",
  socialSquare: "1 / 1",
  socialLandscape: "1.91 / 1",
  thumbnail: "1 / 1",
} as const;

export const zScale = {
  base: 0, dropdown: 1000, sticky: 1020, header: 1030, overlay: 1040, modal: 1050, toast: 1080,
} as const;

/** Approximate WCAG contrast ratio between two hex colours. */
export function contrastRatio(fg: string, bg: string): number {
  const lum = (hex: string) => {
    const m = hex.replace("#", "");
    const r = parseInt(m.slice(0, 2), 16) / 255;
    const g = parseInt(m.slice(2, 4), 16) / 255;
    const b = parseInt(m.slice(4, 6), 16) / 255;
    const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  };
  const l1 = lum(fg);
  const l2 = lum(bg);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

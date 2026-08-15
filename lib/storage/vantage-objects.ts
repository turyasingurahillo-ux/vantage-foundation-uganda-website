import "server-only";

/**
 * Object-key conventions for Vantage Foundation Uganda media stored in the
 * shared Cloudflare R2 bucket.
 *
 * All Vantage objects live under a `vantage/` prefix inside the shared bucket
 * so they never collide with the sibling kikumikyo project's own prefixes
 * (`academy/`, `organizations/`). Do not change this prefix — existing
 * uploads would become unreachable.
 *
 * Layout:
 *   vantage/programmes/{slug}/{id}-{filename}
 *   vantage/team/{slug}/{id}-{filename}
 *   vantage/gallery/{id}-{filename}
 *   vantage/documents/{id}-{filename}
 *   vantage/logos/{id}-{filename}
 *   vantage/resources/{id}-{filename}
 *   vantage/stories/{slug}/{id}-{filename}
 *
 * Each key includes a server-generated `id` (a short random token) so that
 * re-uploading a file with the same name does not overwrite the previous
 * object — important for audit and for keeping stale DB records valid.
 */

export type MediaFolder =
  | "programmes"
  | "team"
  | "gallery"
  | "documents"
  | "logos"
  | "resources"
  | "stories";

const VANTAGE_PREFIX = "vantage";

/**
 * Generates a random 12-character alphanumeric id (lowercase, no ambiguous
 * chars like 0/O or 1/l). Used as the leading segment of the object key so
 * re-uploads never overwrite.
 */
export function generateMediaId(): string {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

/**
 * Sanitises a user-supplied filename into a safe, lowercase, dash-separated
 * slug segment. Strips path separators, collapses whitespace, drops anything
 * that isn't alphanumeric, dash, or dot.
 */
export function sanitizeFilename(input: string): string {
  // Take only the basename in case the client sent a path.
  const base = input.split(/[/\\]/).pop() ?? input;
  const cleaned = base
    .toLowerCase()
    // Replace runs of non-allowed chars with a single dash.
    .replace(/[^a-z0-9.\-]+/g, "-")
    // Collapse consecutive dashes.
    .replace(/-+/g, "-")
    // Drop dashes adjacent to dots (e.g. "1-.jpg" -> "1.jpg", "a.-png" -> "a.png").
    .replace(/-\./g, ".")
    .replace(/\.-/g, ".")
    // Trim leading/trailing dashes and dots.
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 80);
  // Fall back when nothing meaningful remains (empty, or only dots/dashes).
  return cleaned || "file";
}

/**
 * Builds the full R2 object key for a new upload.
 *
 * `slug` is optional and only used for the programmes/team folders (it's the
 * programme or team-member slug). For gallery/documents/logos/resources the
 * id alone disambiguates.
 */
export function buildObjectKey(options: {
  folder: MediaFolder;
  filename: string;
  slug?: string;
  id?: string;
}): string {
  const id = options.id ?? generateMediaId();
  const safeName = sanitizeFilename(options.filename);
  const segments = [VANTAGE_PREFIX, options.folder];
  if (options.slug) {
    segments.push(sanitizeFilename(options.slug));
  }
  segments.push(`${id}-${safeName}`);
  return segments.join("/");
}

/**
 * Parses an object key back into its structured parts. Returns null if the
 * key is not under the vantage/ prefix or is malformed.
 */
export function parseObjectKey(
  key: string
): { folder: MediaFolder; slug?: string; id: string; filename: string } | null {
  const parts = key.split("/");
  if (parts[0] !== VANTAGE_PREFIX || parts.length < 3) return null;
  const folder = parts[1] as MediaFolder;
  const validFolders: MediaFolder[] = [
    "programmes",
    "team",
    "gallery",
    "documents",
    "logos",
    "resources",
    "stories",
  ];
  if (!validFolders.includes(folder)) return null;

  const last = parts[parts.length - 1];
  const dashIdx = last.indexOf("-");
  if (dashIdx < 1) return null;
  const id = last.slice(0, dashIdx);
  const filename = last.slice(dashIdx + 1);

  // programmes/team/stories have a slug segment between folder and filename.
  let slug: string | undefined;
  if (
    (folder === "programmes" || folder === "team" || folder === "stories") &&
    parts.length === 4
  ) {
    slug = parts[2];
  }
  return { folder, slug, id, filename };
}

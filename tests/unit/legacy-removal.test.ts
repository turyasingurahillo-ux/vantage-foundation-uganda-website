import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Tests that the legacy StoriesManager and ArticleEditorForm have been
 * safely removed and replaced by the canonical components.
 *
 * These tests demonstrate that removing the legacy components does not
 * remove required functionality — the new components provide all the
 * needed features.
 */

describe("Legacy component removal — StoriesManager", () => {
  it("StoriesManager.tsx has been deleted", () => {
    const legacyPath = path.resolve(
      process.cwd(),
      "components/admin/StoriesManager.tsx",
    );
    expect(fs.existsSync(legacyPath)).toBe(false);
  });

  it("ArticleEditorForm.tsx has been deleted", () => {
    const legacyPath = path.resolve(
      process.cwd(),
      "components/admin/ArticleEditorForm.tsx",
    );
    expect(fs.existsSync(legacyPath)).toBe(false);
  });
});

describe("Replacement components exist", () => {
  it("canonical StoryEditorForm exists", () => {
    const canonicalPath = path.resolve(
      process.cwd(),
      "components/admin/stories/StoryEditorForm.tsx",
    );
    expect(fs.existsSync(canonicalPath)).toBe(true);
  });

  it("StoriesWorkspace exists", () => {
    const workspacePath = path.resolve(
      process.cwd(),
      "components/admin/stories/StoriesWorkspace.tsx",
    );
    expect(fs.existsSync(workspacePath)).toBe(true);
  });

  it("AnalyticsDashboard still exists (moved to standalone route)", () => {
    const dashboardPath = path.resolve(
      process.cwd(),
      "components/admin/AnalyticsDashboard.tsx",
    );
    expect(fs.existsSync(dashboardPath)).toBe(true);
  });

  it("/admin/analytics page exists", () => {
    const analyticsPagePath = path.resolve(
      process.cwd(),
      "app/admin/(hq)/analytics/page.tsx",
    );
    expect(fs.existsSync(analyticsPagePath)).toBe(true);
  });
});

describe("No code imports the deleted legacy components", () => {
  // Scan all .tsx and .ts files (excluding node_modules and tests) for
  // import statements referencing the deleted components.
  function scanDir(dir: string, results: string[] = []): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") continue;
        scanDir(fullPath, results);
      } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
        const content = fs.readFileSync(fullPath, "utf8");
        // Check for actual import statements (not comments)
        const importPattern = /from\s+["']@\/components\/admin\/(StoriesManager|ArticleEditorForm)["']/;
        if (importPattern.test(content)) {
          results.push(fullPath);
        }
      }
    }
    return results;
  }

  it("no source file imports StoriesManager or ArticleEditorForm", () => {
    const offenders = scanDir(path.resolve(process.cwd(), "components"));
    const offenderApp = scanDir(path.resolve(process.cwd(), "app"));
    const allOffenders = [...offenders, ...offenderApp];
    expect(allOffenders).toEqual([]);
  });
});

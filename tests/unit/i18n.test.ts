import { describe, expect, it } from "vitest";
import {
  defaultLocale,
  isLocale,
  localeFromPathname,
  localePath,
  stripLocale,
} from "@/lib/i18n/config";
import { getByKey, getDictionary, resolveTranslation } from "@/lib/i18n/dictionaries";

describe("internationalization routing", () => {
  it("keeps English as the unprefixed default", () => {
    expect(defaultLocale).toBe("en");
    expect(localePath("/about-us", "en")).toBe("/about-us");
  });

  it("creates stable German and French routes", () => {
    expect(localePath("/about-us?ref=nav", "de")).toBe("/de/about-us?ref=nav");
    expect(localePath("/de/about-us", "fr")).toBe("/fr/about-us");
    expect(localePath("/fr", "en")).toBe("/");
  });

  it("recognizes and strips only supported locale prefixes", () => {
    expect(isLocale("de")).toBe(true);
    expect(isLocale("es")).toBe(false);
    expect(localeFromPathname("/fr/contact")).toBe("fr");
    expect(stripLocale("/de/projects/example")).toBe("/projects/example");
  });
});

describe("translation dictionaries", () => {
  it("contains professional German and French navigation copy", async () => {
    expect((await getDictionary("de")).navigation.donate).toBe("Spenden");
    expect((await getDictionary("fr")).navigation.about).toBe("À propos");
  });

  it("falls back to English when a localized key is absent", () => {
    expect(getByKey("de", "common.learnMore")).toBe("Mehr erfahren");
    expect(getByKey("fr", "common.allRightsReserved")).toBe("Tous droits réservés.");
    expect(resolveTranslation({}, "common.learnMore")).toBe("Learn more");
    expect(getByKey("fr", "common.unknownKey")).toBe("");
  });
});

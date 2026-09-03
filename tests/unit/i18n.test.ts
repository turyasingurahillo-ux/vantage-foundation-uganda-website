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
    expect(localePath("/es/about-us", "ar")).toBe("/ar/about-us");
  });

  it("recognizes and strips all supported locale prefixes", () => {
    expect(isLocale("de")).toBe(true);
    expect(isLocale("es")).toBe(true);
    expect(isLocale("ar")).toBe(true);
    expect(isLocale("it")).toBe(false);
    expect(localeFromPathname("/fr/contact")).toBe("fr");
    expect(localeFromPathname("/ar/contact")).toBe("ar");
    expect(stripLocale("/de/projects/example")).toBe("/projects/example");
    expect(stripLocale("/es/projects/example")).toBe("/projects/example");
    expect(stripLocale("/ar/projects/example")).toBe("/projects/example");
  });
});

describe("translation dictionaries", () => {
  it("contains professional German, French, Spanish and Arabic navigation copy", async () => {
    expect((await getDictionary("de")).navigation.donate).toBe("Spenden");
    expect((await getDictionary("fr")).navigation.about).toBe("À propos");
    expect((await getDictionary("es")).navigation.donate).toBe("Donar");
    expect((await getDictionary("ar")).navigation.about).toBe("نبذة عنا");
  });

  it("falls back to English when a localized key is absent", () => {
    expect(getByKey("de", "common.learnMore")).toBe("Mehr erfahren");
    expect(getByKey("fr", "common.allRightsReserved")).toBe("Tous droits réservés.");
    expect(resolveTranslation({}, "common.learnMore")).toBe("Learn more");
    expect(getByKey("fr", "common.unknownKey")).toBe("");
  });
});

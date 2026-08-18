import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Regressie-test: Googlebot crawlt met `Accept-Language: en`. De NL homepage (`/`)
 * mag NOOIT in het Engels renderen, ongeacht navigator.language. De init-taal
 * moet uitsluitend uit het URL-pad komen.
 */

const setLocation = (pathname: string) => {
  Object.defineProperty(window, "location", {
    writable: true,
    configurable: true,
    value: { ...window.location, pathname, hostname: "woonaanbod-nl.nl", href: `https://woonaanbod-nl.nl${pathname}` },
  });
};

const setNavigatorLanguage = (lang: string) => {
  Object.defineProperty(window.navigator, "language", { value: lang, configurable: true });
  Object.defineProperty(window.navigator, "languages", { value: [lang], configurable: true });
};

const loadI18n = async () => {
  vi.resetModules();
  const mod = await import("./i18n");
  return mod.default;
};

describe("i18n init – locale komt uit URL, niet uit Accept-Language", () => {
  beforeEach(() => {
    setNavigatorLanguage("en-US");
  });

  it("rendert / in het Nederlands ondanks Accept-Language: en", async () => {
    setLocation("/");
    const i18n = await loadI18n();
    expect(i18n.language).toBe("nl");
    expect(i18n.resolvedLanguage).toBe("nl");
  });

  it("rendert /woning/amsterdam-... in het Nederlands ondanks Accept-Language: en", async () => {
    setLocation("/woning/amsterdam-appartement-123");
    const i18n = await loadI18n();
    expect(i18n.language).toBe("nl");
  });

  it("rendert /en in het Engels", async () => {
    setLocation("/en");
    const i18n = await loadI18n();
    expect(i18n.language).toBe("en");
  });

  it("rendert /de/woning/... in het Duits", async () => {
    setLocation("/de/woning/amsterdam-appartement-123");
    const i18n = await loadI18n();
    expect(i18n.language).toBe("de");
  });

  it("valt terug op NL voor onbekend prefix", async () => {
    setLocation("/zz/foo");
    const i18n = await loadI18n();
    expect(i18n.language).toBe("nl");
  });
});

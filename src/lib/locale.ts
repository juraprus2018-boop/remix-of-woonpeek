import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from "@/lib/brand";

const PREFIX_LOCALES = SUPPORTED_LOCALES.filter((l) => l !== DEFAULT_LOCALE) as Exclude<Locale, typeof DEFAULT_LOCALE>[];

export function getLocaleFromPath(pathname: string): Locale {
  const seg = pathname.split("/")[1]?.toLowerCase();
  if (seg && (PREFIX_LOCALES as readonly string[]).includes(seg)) {
    return seg as Locale;
  }
  return DEFAULT_LOCALE;
}

/** Strip /en /de /fr prefix and return the bare path (always starts with "/"). */
export function stripLocale(pathname: string): string {
  const seg = pathname.split("/")[1]?.toLowerCase();
  if (seg && (PREFIX_LOCALES as readonly string[]).includes(seg)) {
    const rest = pathname.slice(seg.length + 1);
    return rest === "" ? "/" : rest;
  }
  return pathname;
}

/** Prefix a "/foo" path with the given locale. NL stays unprefixed. */
export function withLocale(path: string, locale: Locale): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  if (clean === "/") return `/${locale}`;
  return `/${locale}${clean}`;
}

/** Best-effort match of navigator.language to a supported locale. */
export function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;
  const langs = [navigator.language, ...(navigator.languages ?? [])];
  for (const raw of langs) {
    const code = raw?.slice(0, 2).toLowerCase();
    if (code && (SUPPORTED_LOCALES as readonly string[]).includes(code)) {
      return code as Locale;
    }
  }
  return DEFAULT_LOCALE;
}

export { PREFIX_LOCALES };

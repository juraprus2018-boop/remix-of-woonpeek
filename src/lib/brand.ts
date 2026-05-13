/**
 * Centrale brand-constanten. Wijzig hier 1x om de hele site te rebranden.
 */
export const BRAND_NAME = "Domora";
export const BRAND_TAGLINE = "Wonen vinden, eenvoudig gemaakt";
export const SUPPORT_EMAIL = "info@domora.com";

/** Canonieke host zonder protocol/trailing slash. Leeg laten zolang er nog geen domein is. */
export const CANONICAL_HOST = "domora.com";
export const CANONICAL_URL = CANONICAL_HOST ? `https://${CANONICAL_HOST}` : "";

export const SUPPORTED_LOCALES = ["nl", "en", "de", "fr"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "nl";

export const LOCALE_LABELS: Record<Locale, string> = {
  nl: "Nederlands",
  en: "English",
  de: "Deutsch",
  fr: "Français",
};

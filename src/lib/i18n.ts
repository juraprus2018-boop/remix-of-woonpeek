import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import nlCommon from "@/locales/nl/common.json";
import enCommon from "@/locales/en/common.json";
import deCommon from "@/locales/de/common.json";
import frCommon from "@/locales/fr/common.json";

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/brand";

/**
 * Initiële taal komt UITSLUITEND uit het URL-pad, nooit uit navigator.language.
 * Waarom: Googlebot crawlt met Accept-Language: en, wat eerder de NL homepage
 * in het Engels deed renderen. Dat werd door Google geïndexeerd. Nooit meer.
 * LocaleSync upgrade hierna naar en/de/fr als het pad daarmee begint.
 */
function initialLocale(): string {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const seg = window.location.pathname.split("/")[1]?.toLowerCase();
  if (seg && (SUPPORTED_LOCALES as readonly string[]).includes(seg)) {
    return seg;
  }
  return DEFAULT_LOCALE;
}

void i18n
  .use(initReactI18next)
  .init({
    resources: {
      nl: { common: nlCommon },
      en: { common: enCommon },
      de: { common: deCommon },
      fr: { common: frCommon },
    },
    lng: initialLocale(),
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: [...SUPPORTED_LOCALES],
    defaultNS: "common",
    ns: ["common"],
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export default i18n;


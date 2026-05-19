import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import nlCommon from "@/locales/nl/common.json";
import enCommon from "@/locales/en/common.json";
import deCommon from "@/locales/de/common.json";
import frCommon from "@/locales/fr/common.json";

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/brand";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      nl: { common: nlCommon },
      en: { common: enCommon },
      de: { common: deCommon },
      fr: { common: frCommon },
    },
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: [...SUPPORTED_LOCALES],
    defaultNS: "common",
    ns: ["common"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["path", "localStorage", "navigator", "htmlTag"],
      lookupLocalStorage: "huurbaasje_locale",
      caches: ["localStorage"],
    },
    react: { useSuspense: false },
  });

export default i18n;

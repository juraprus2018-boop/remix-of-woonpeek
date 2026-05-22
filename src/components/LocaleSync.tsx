import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getLocaleFromPath } from "@/lib/locale";

/**
 * Houdt i18n + <html lang> in sync met de URL-prefix.
 *
 * GEEN auto-redirect meer op basis van navigator.language. Reden: Googlebot
 * stuurt Accept-Language: en en werd zo van de NL homepage geredirect naar /en.
 * Resultaat: Google indexeerde de Engelse versie als hoofdpagina. Taalkeuze
 * gebeurt alleen nog handmatig via de LanguageSwitcher.
 */
const LocaleSync = () => {
  const { i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    const locale = getLocaleFromPath(location.pathname);
    if (i18n.language?.slice(0, 2) !== locale) {
      void i18n.changeLanguage(locale);
    }
    document.documentElement.lang = locale;
  }, [location.pathname, i18n]);

  return null;
};

export default LocaleSync;


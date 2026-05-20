import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { detectBrowserLocale, getLocaleFromPath, withLocale, stripLocale } from "@/lib/locale";
import { DEFAULT_LOCALE } from "@/lib/brand";

const REDIRECT_KEY = "huurbaasje_locale_redirected";

/**
 * Keeps i18n + <html lang> in sync with the URL prefix.
 * On the very first visit to "/" auto-redirects to /en|/de|/fr if the
 * browser's preferred language is one of those (one-shot, remembered).
 */
const LocaleSync = () => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // Sync i18n language + html lang to URL on every navigation
  useEffect(() => {
    const locale = getLocaleFromPath(location.pathname);
    if (i18n.language?.slice(0, 2) !== locale) {
      void i18n.changeLanguage(locale);
    }
    document.documentElement.lang = locale;
  }, [location.pathname, i18n]);

  // One-time browser-language redirect when landing on bare "/"
  useEffect(() => {
    if (location.pathname !== "/") return;
    if (typeof window === "undefined") return;
    try {
      if (localStorage.getItem(REDIRECT_KEY)) return;
      const detected = detectBrowserLocale();
      localStorage.setItem(REDIRECT_KEY, "1");
      if (detected !== DEFAULT_LOCALE) {
        const target = withLocale(stripLocale(location.pathname) + location.search, detected);
        navigate(target, { replace: true });
      }
    } catch {
      // localStorage unavailable — silent
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default LocaleSync;

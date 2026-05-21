import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { Link, type LinkProps } from "react-router-dom";
import { forwardRef, useCallback } from "react";
import { withLocale, stripLocale } from "@/lib/locale";
import type { Locale } from "@/lib/brand";

/** Prefix an absolute "/foo" path with the active locale prefix. */
export function useLocalePath() {
  const { i18n } = useTranslation();
  const locale = (i18n.resolvedLanguage ?? i18n.language ?? "nl").slice(0, 2) as Locale;
  return (path: string) => withLocale(path, locale);
}

/** Locale-aware navigate(). Pass "/inloggen" — it becomes "/de/inloggen" etc. */
export function useLocalizedNavigate() {
  const navigate = useNavigate();
  const localize = useLocalePath();
  return useCallback(
    (to: string, options?: { replace?: boolean }) => navigate(localize(to), options),
    [navigate, localize],
  );
}

/** Locale-aware <Link>. Pass `to="/login"` — it becomes `/de/inloggen` etc. */
export const L = forwardRef<HTMLAnchorElement, LinkProps>(function L(
  { to, ...rest },
  ref,
) {
  const localize = useLocalePath();
  const target = typeof to === "string" ? localize(to) : to;
  return <Link ref={ref} to={target} {...rest} />;
});

/** Build the alternate-href map for hreflang tags for the current pathname. */
export function useHreflangAlternates() {
  const { pathname } = useLocation();
  const bare = stripLocale(pathname);
  return {
    nl: bare,
    en: withLocale(bare, "en"),
    de: withLocale(bare, "de"),
    fr: withLocale(bare, "fr"),
  } as Record<Locale, string>;
}


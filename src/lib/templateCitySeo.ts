import { isTemplateCityPath } from "../../supabase/functions/_shared/sitemapPolicy";
import { stripLocale } from "./locale";

export function templateCitySlug(pathname: string): string | undefined {
  return isTemplateCityPath(pathname) ? stripLocale(pathname).split("/")[2] : undefined;
}

export function templateCitySeo(pathname: string, activeRentals?: number) {
  const slug = templateCitySlug(pathname);
  if (!slug) return undefined;
  return {
    noindex: true,
    canonical: activeRentals !== undefined && activeRentals >= 6
      ? `/huurwoningen/${slug}`
      : pathname.replace(/\/+$/, ""),
  };
}
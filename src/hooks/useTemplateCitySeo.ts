import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getValidCityName } from "@/lib/dutchCities";
import { citySlugToName } from "@/lib/cities";
import { templateCitySeo, templateCitySlug } from "@/lib/templateCitySeo";
import { rentalCityAliases } from "../../supabase/functions/_shared/rentalCityIdentity";

/** Only template routes need this compact, exact active-rental count. */
export function useTemplateCitySeo(pathname: string) {
  const slug = templateCitySlug(pathname);
  const city = slug ? getValidCityName(slug) || citySlugToName(slug) : "";
  const { data } = useQuery({
    queryKey: ["template-city-rental-count", city],
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    queryFn: async ({ signal }) => {
      const { count, error } = await supabase.from("properties")
        .select("id", { count: "exact", head: true })
        .eq("status", "actief").eq("listing_type", "huur")
        .or(rentalCityAliases(city).map(name => `city.ilike.${name}`).join(",")).abortSignal(signal);
      if (error) throw error;
      return count ?? 0;
    },
  });
  return templateCitySeo(pathname, data);
}
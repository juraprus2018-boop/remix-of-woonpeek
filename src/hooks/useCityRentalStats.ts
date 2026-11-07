import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { calculateCityRentalStats, type RentalObservation } from "@/lib/cityRentalStats";

export function useCityRentalStats(city: string) {
  return useQuery({
    queryKey: ["city-rental-insights", city],
    enabled: Boolean(city),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    queryFn: async ({ signal }) => {
      const fetchPage = async (offset: number) => {
        const { data, error, count } = await supabase.from("properties")
          .select("id, city, status, listing_type, property_type, price, surface_area, neighborhood, created_at", { count: "exact" })
          .eq("status", "actief").eq("listing_type", "huur").ilike("city", city)
          .order("id", { ascending: true }).range(offset, offset + 999).abortSignal(signal);
        if (error) throw error;
        return { rows: data as RentalObservation[], count: count ?? 0 };
      };
      const first = await fetchPage(0);
      const rows = [...first.rows];
      for (let offset = 1000; offset < first.count; offset += 3000) {
        const offsets = [offset, offset + 1000, offset + 2000].filter(value => value < first.count);
        const pages = await Promise.all(offsets.map(fetchPage));
        rows.push(...pages.flatMap(page => page.rows));
      }
      return { ...calculateCityRentalStats(rows, city), checkedAt: new Date().toISOString() };
    },
  });
}
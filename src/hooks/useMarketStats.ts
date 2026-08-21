import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CityRow {
  city: string;
  n: number;
  per_m2?: number;
  avg_price?: number;
  median_price?: number;
  min_price?: number;
  avg_area?: number;
  rent_n?: number;
  buy_n?: number;
  week_start?: string;
  avg_rent?: number;
}

export interface MarketStats {
  generated_at: string;
  national: {
    total: number;
    rent_total: number;
    buy_total: number;
    new_7d: number;
    new_30d: number;
    rent_avg: number | null;
    rent_median: number | null;
    rent_per_m2: number | null;
    buy_avg: number | null;
    buy_median: number | null;
    buy_per_m2: number | null;
    rent_under_1500: number;
    buy_under_400k: number;
  };
  rent_per_m2_cities: CityRow[];
  rent_avg_cities: CityRow[];
  new_this_week_cities: CityRow[];
  rent_under_1500_cities: CityRow[];
  buy_under_400k_cities: CityRow[];
  buy_avg_cities: CityRow[];
}

export interface MarketStatsExtra {
  generated_at: string;
  period_start: string;
  period_end: string;
  analyzed: number;
  rent_count_cities: CityRow[];
  buy_count_cities: CityRow[];
  cheapest_rent_cities: CityRow[];
  new_per_week: CityRow[];
  newbuild_provinces: CityRow[];
  provinces_all: CityRow[];
}

/**
 * Eigen woningmarktdata, live berekend uit het actieve aanbod van Woonaanbod NL.
 * Dit is unieke first-party data (geen overgenomen makelaarsteksten).
 */
export const useMarketStats = () =>
  useQuery({
    queryKey: ["market-stats"],
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<MarketStats> => {
      const { data, error } = await supabase.rpc("market_stats");
      if (error) throw error;
      return data as unknown as MarketStats;
    },
  });

/** Aanvullende cijfers voor de sectie Woningmarkt Nederland (per gemeente, per week, per provincie). */
export const useMarketStatsExtra = () =>
  useQuery({
    queryKey: ["market-stats-extra"],
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<MarketStatsExtra> => {
      const { data, error } = await supabase.rpc("market_stats_extra");
      if (error) throw error;
      return data as unknown as MarketStatsExtra;
    },
  });

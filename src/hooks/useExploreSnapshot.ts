import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { decodeExploreSnapshot } from "@/lib/exploreSnapshot";

export function useExploreSnapshot() {
  return useQuery({
    queryKey: ["explore-map-snapshot"],
    queryFn: async ({ signal }) => {
      const { data, error } = await supabase.rpc("explore_map_snapshot").abortSignal(signal);
      if (error) throw error;
      return decodeExploreSnapshot(data);
    },
    staleTime: 5 * 60_000,
    gcTime: 15 * 60_000,
    refetchOnWindowFocus: false,
  });
}
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Aantal woningen dat vandaag (UTC dag) actief is toegevoegd. */
export const useNewTodayCount = () => {
  return useQuery({
    queryKey: ["new-today-count"],
    queryFn: async () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const { count, error } = await supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("status", "actief")
        .gte("created_at", start.toISOString());
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 5 * 60 * 1000,
  });
};

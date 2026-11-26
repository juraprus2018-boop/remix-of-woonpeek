import { useQuery } from "@tanstack/react-query";
import { History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { priceChanges } from "@/lib/priceHistory";

const STATUS: Record<string, string> = { actief: "Beschikbaar", verhuurd: "Verhuurd", verkocht: "Verkocht", inactief: "Offline" };

/** Toont alleen werkelijk vastgelegde prijs- of statuswijzigingen; zonder wijziging niets. */
const PriceHistory = ({ propertyId, perMonth }: { propertyId: string; perMonth: boolean }) => {
  const { data } = useQuery({
    queryKey: ["price-history", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase.from("property_price_history").select("price, status, changed_at").eq("property_id", propertyId).order("changed_at").limit(50);
      if (error) throw error;
      return priceChanges(data);
    },
    staleTime: 10 * 60 * 1000,
  });
  if (!data || data.length < 2) return null;
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm" aria-label="Prijsgeschiedenis">
      <h3 className="flex items-center gap-2 text-sm font-semibold"><History className="h-4 w-4 text-primary" /> Prijsgeschiedenis</h3>
      <ul className="mt-2 space-y-1 text-sm">
        {[...data].reverse().map((r) => (
          <li key={r.changed_at} className="flex justify-between gap-3">
            <span className="text-muted-foreground">{new Date(r.changed_at).toLocaleDateString("nl-NL")}</span>
            <span>
              {r.price != null ? `€ ${r.price.toLocaleString("nl-NL")}${perMonth ? " per maand" : ""}` : ""}
              {r.diff ? <span className={r.diff < 0 ? "ml-2 text-primary" : "ml-2 text-destructive"}>{r.diff > 0 ? "+" : "−"}€ {Math.abs(r.diff).toLocaleString("nl-NL")}</span> : null}
              {r.status && r.status !== "actief" ? <span className="ml-2 text-muted-foreground">({STATUS[r.status] ?? r.status})</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default PriceHistory;

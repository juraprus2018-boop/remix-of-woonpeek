import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, Clock, Users, Calendar, Gauge } from "lucide-react";

interface CityPulseProps {
  cityName: string;
}

/** Landelijk gemiddelde prijs per m² (CBS 2024, vrije sector huur). Fallback constante. */
const NL_AVG_PRICE_PER_M2 = 18;

/**
 * Unieke marktinzichten per stad: rauwe data uit eigen DB die concurrenten niet
 * leveren (supply/demand ratio, mediaan dagen online, prijs vs landelijk,
 * historisch beste maand). Volledig client-side berekend uit `properties`.
 */
const CityPulse = ({ cityName }: CityPulseProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ["city-pulse", cityName],
    queryFn: async () => {
      // Actief aanbod
      const { data: active } = await supabase
        .from("properties")
        .select("price, surface, created_at, listing_type")
        .ilike("city", `%${cityName}%`)
        .eq("status", "actief")
        .limit(500);
      // Recent gedeactiveerd (laatste 90 dagen) → proxy voor verhuurd
      const cutoff = new Date(Date.now() - 90 * 86400000).toISOString();
      const { data: closed } = await supabase
        .from("properties")
        .select("created_at, updated_at")
        .ilike("city", `%${cityName}%`)
        .eq("status", "inactief")
        .gte("updated_at", cutoff)
        .limit(500);

      const list = active || [];
      const closedList = closed || [];

      // Prijs per m²
      const pricesPerM2 = list
        .filter((p) => p.price && p.surface && p.surface > 10 && p.listing_type === "huur")
        .map((p) => p.price! / p.surface!);
      const avgPriceM2 = pricesPerM2.length
        ? pricesPerM2.reduce((a, b) => a + b, 0) / pricesPerM2.length
        : null;

      // Mediaan dagen online (closed listings: updated_at - created_at)
      const days = closedList
        .map((c) => (new Date(c.updated_at).getTime() - new Date(c.created_at).getTime()) / 86400000)
        .filter((d) => d > 0 && d < 365)
        .sort((a, b) => a - b);
      const medianDays = days.length ? Math.round(days[Math.floor(days.length / 2)]) : null;

      // Beste maand om te zoeken (maand met meeste historische listings)
      const monthCounts = new Array(12).fill(0);
      for (const c of [...list, ...closedList]) {
        const m = new Date(c.created_at).getMonth();
        monthCounts[m]++;
      }
      const bestMonth = monthCounts.indexOf(Math.max(...monthCounts));

      return {
        supply: list.length,
        demand: closedList.length, // ~aantal verhuurd laatste 90d
        avgPriceM2,
        medianDays,
        bestMonth,
      };
    },
    staleTime: 1000 * 60 * 30,
  });

  if (isLoading || !data || data.supply === 0) return null;

  const priceDelta = data.avgPriceM2
    ? Math.round(((data.avgPriceM2 - NL_AVG_PRICE_PER_M2) / NL_AVG_PRICE_PER_M2) * 100)
    : null;
  const competition = data.supply > 0 ? data.demand / data.supply : 0;
  const competitionLabel =
    competition > 1.2 ? "Zeer hoog" : competition > 0.6 ? "Hoog" : competition > 0.3 ? "Gemiddeld" : "Laag";
  const months = ["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"];

  const cards = [
    {
      icon: Gauge,
      label: "Concurrentiedruk",
      value: competitionLabel,
      hint: `${data.demand} verhuurd / ${data.supply} actief (90d)`,
    },
    data.medianDays
      ? {
          icon: Clock,
          label: "Gem. tijd op markt",
          value: `${data.medianDays} dgn`,
          hint: "mediaan recent verhuurd",
        }
      : null,
    priceDelta !== null
      ? {
          icon: priceDelta > 0 ? TrendingUp : TrendingDown,
          label: "Prijs vs landelijk",
          value: `${priceDelta > 0 ? "+" : ""}${priceDelta}%`,
          hint: `€${data.avgPriceM2!.toFixed(1)}/m² vs €${NL_AVG_PRICE_PER_M2}/m²`,
        }
      : null,
    {
      icon: Calendar,
      label: "Beste zoekmaand",
      value: months[data.bestMonth],
      hint: "meeste nieuw aanbod historisch",
    },
  ].filter(Boolean) as Array<{ icon: typeof Users; label: string; value: string; hint: string }>;

  return (
    <section className="border-y-2 border-foreground bg-card py-10">
      <div className="container">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Marktpols
            </p>
            <h2 className="font-display text-2xl text-foreground md:text-3xl">
              Slimme inzichten {cityName}
            </h2>
          </div>
          <p className="hidden max-w-sm text-sm text-muted-foreground md:block">
            Realtime data uit ons eigen platform. Wat anderen niet laten zien.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.label}
                className="rounded-2xl border-2 border-foreground bg-background p-5"
              >
                <Icon className="mb-3 h-5 w-5 text-primary" />
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</p>
                <p className="mt-1 font-display text-2xl text-foreground">{c.value}</p>
                <p className="mt-2 text-xs text-muted-foreground">{c.hint}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CityPulse;

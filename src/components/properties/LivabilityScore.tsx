import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Sparkles, Users, MapPin, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Props {
  city: string;
  postalCode: string;
}

type LivabilityData = {
  safety_score: number | null;
  livability_score: number | null;
  amenities_score: number | null;
  crime_per_1000: number | null;
  population_density: number | null;
  source: string;
  details?: string;
};

const scoreColor = (s: number | null) => {
  if (s == null) return "bg-muted text-muted-foreground";
  if (s >= 8) return "bg-green-500/15 text-green-700 dark:text-green-400";
  if (s >= 6) return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
  return "bg-red-500/15 text-red-700 dark:text-red-400";
};

const LivabilityScore = ({ city, postalCode }: Props) => {
  const pc4 = String(postalCode || "").replace(/\s+/g, "").slice(0, 4);

  const { data, isLoading } = useQuery({
    queryKey: ["livability", city, pc4],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("fetch-livability", {
        body: { city, postal_code: pc4 },
      });
      if (error) throw error;
      return data as LivabilityData;
    },
    enabled: !!city,
    staleTime: 1000 * 60 * 60,
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <Skeleton className="h-6 w-48" />
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const items = [
    { key: "safety", label: "Veiligheid", icon: Shield, score: data.safety_score, sub: data.crime_per_1000 ? `${data.crime_per_1000.toFixed(1)} delicten / 1.000 inw.` : "Open data" },
    { key: "livability", label: "Leefbaarheid", icon: Sparkles, score: data.livability_score, sub: data.population_density ? `${Math.round(data.population_density)} inw./km²` : "CBS-data" },
    { key: "amenities", label: "Voorzieningen", icon: Users, score: data.amenities_score, sub: "Winkels, OV, scholen" },
  ];

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Leefbaarheid in deze buurt
        </h2>
        <Popover>
          <PopoverTrigger className="text-muted-foreground hover:text-foreground">
            <Info className="h-4 w-4" />
          </PopoverTrigger>
          <PopoverContent className="text-xs max-w-xs">
            Scores op basis van open data van CBS (demografie, dichtheid) en Politie (geregistreerde delicten). Bron: {data.source}. Bedoeld als indicatie, niet als juridisch oordeel.
          </PopoverContent>
        </Popover>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {items.map((it) => (
          <div key={it.key} className={`rounded-xl p-4 ${scoreColor(it.score)}`}>
            <div className="flex items-center justify-between">
              <it.icon className="h-5 w-5" />
              <span className="font-display text-2xl font-bold">
                {it.score != null ? it.score.toFixed(1) : "—"}<span className="text-xs opacity-60">/10</span>
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold">{it.label}</p>
            <p className="text-xs opacity-80">{it.sub}</p>
          </div>
        ))}
      </div>

      {data.details && (
        <p className="mt-4 text-xs text-muted-foreground leading-relaxed">{data.details}</p>
      )}
    </div>
  );
};

export default LivabilityScore;

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { cityPath } from "@/lib/cities";

interface RelatedCitiesProps {
  currentCity: string;
}

interface RelatedCity {
  city: string;
  count: number;
  km?: number;
}

const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const r = (d: number) => (d * Math.PI) / 180;
  const a =
    Math.sin(r(lat2 - lat1) / 2) ** 2 +
    Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(r(lng2 - lng1) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
};

/**
 * Plaatsen in de buurt: centrum van de huidige stad bepalen uit eigen woningen,
 * daarna actieve woningen binnen een kader van ~35 km ophalen en op afstand sorteren.
 * Valt terug op de grootste steden als er geen coördinaten zijn.
 */
const useRelatedCities = (currentCity: string) =>
  useQuery({
    queryKey: ["related-cities-nearby", currentCity],
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<{ nearby: boolean; cities: RelatedCity[] }> => {
      const { data: own } = await supabase
        .from("properties")
        .select("latitude, longitude")
        .eq("status", "actief")
        .ilike("city", currentCity)
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .limit(50);

      const pts = (own || []).filter((p) => p.latitude && p.longitude);
      if (pts.length) {
        const lat = pts.reduce((s, p) => s + Number(p.latitude), 0) / pts.length;
        const lng = pts.reduce((s, p) => s + Number(p.longitude), 0) / pts.length;
        const { data, error } = await supabase
          .from("properties")
          .select("city, latitude, longitude")
          .eq("status", "actief")
          .gte("latitude", lat - 0.32)
          .lte("latitude", lat + 0.32)
          .gte("longitude", lng - 0.5)
          .lte("longitude", lng + 0.5)
          .limit(3000);
        if (!error && data?.length) {
          const agg: Record<string, { count: number; lat: number; lng: number }> = {};
          data.forEach((p) => {
            const c = (p.city || "").trim();
            if (!c || c.toLowerCase() === currentCity.toLowerCase()) return;
            const a = (agg[c] ||= { count: 0, lat: 0, lng: 0 });
            a.count++;
            a.lat += Number(p.latitude);
            a.lng += Number(p.longitude);
          });
          const cities = Object.entries(agg)
            .map(([city, a]) => ({
              city,
              count: a.count,
              km: Math.round(haversineKm(lat, lng, a.lat / a.count, a.lng / a.count)),
            }))
            .filter((c) => c.km <= 35)
            .sort((a, b) => a.km - b.km)
            .slice(0, 12);
          if (cities.length >= 3) return { nearby: true, cities };
        }
      }

      const { data, error } = await supabase
        .from("properties")
        .select("city")
        .eq("status", "actief")
        .limit(3000);
      if (error) throw error;
      const counts: Record<string, number> = {};
      data.forEach((p) => {
        const c = (p.city || "").trim();
        if (c && c.toLowerCase() !== currentCity.toLowerCase()) counts[c] = (counts[c] || 0) + 1;
      });
      return {
        nearby: false,
        cities: Object.entries(counts)
          .map(([city, count]) => ({ city, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 12),
      };
    },
  });

const RelatedCities = ({ currentCity }: RelatedCitiesProps) => {
  const { data, isLoading } = useRelatedCities(currentCity);
  const cities = data?.cities;

  if (isLoading || !cities?.length) return null;

  return (
    <section className="border-t bg-card py-12">
      <div className="container">
        <h2 className="font-display text-2xl font-bold text-foreground">
          {data?.nearby ? `Woningen in de buurt van ${currentCity}` : "Andere steden"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {data?.nearby
            ? `Niets passends in ${currentCity}? Bekijk het aanbod in plaatsen binnen 35 km.`
            : "Bekijk ook het woningaanbod in andere steden van Nederland"}
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {cities.map(({ city, count, km }) => (
            <Link
              key={city}
              to={cityPath(city)}
              className="group flex items-center gap-3 rounded-xl border bg-background p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <span className="block truncate font-medium text-foreground group-hover:text-primary transition-colors">
                  {city}
                </span>
                <span className="text-xs text-muted-foreground">
                  {count} {count === 1 ? "woning" : "woningen"}
                  {km !== undefined ? ` · ${km} km` : ""}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedCities;

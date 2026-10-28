import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShoppingCart, Store, TrainFront, Route, Car, School, GraduationCap, Baby, Backpack,
  Stethoscope, Pill, Hospital, Trees, Library, UtensilsCrossed, Dumbbell,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

type Item = { key: string; label: string; icon: typeof ShoppingCart };

const GROUPS: { title: string; items: Item[] }[] = [
  { title: "Boodschappen", items: [
    { key: "supermarket", label: "Grote supermarkt", icon: ShoppingCart },
    { key: "shop", label: "Bakker, slager of buurtwinkel", icon: Store },
  ] },
  { title: "Bereikbaarheid", items: [
    { key: "train", label: "Treinstation", icon: TrainFront },
    { key: "hub", label: "Groot overstapstation", icon: Route },
    { key: "highway", label: "Oprit snelweg", icon: Car },
  ] },
  { title: "Kinderen", items: [
    { key: "daycare", label: "Kinderdagverblijf", icon: Baby },
    { key: "afterschool", label: "Buitenschoolse opvang", icon: Backpack },
    { key: "primary", label: "Basisschool", icon: School },
    { key: "secondary", label: "Middelbare school", icon: GraduationCap },
  ] },
  { title: "Zorg", items: [
    { key: "doctor", label: "Huisarts", icon: Stethoscope },
    { key: "pharmacy", label: "Apotheek", icon: Pill },
    { key: "hospital", label: "Ziekenhuis", icon: Hospital },
  ] },
  { title: "Vrije tijd", items: [
    { key: "park", label: "Park of plantsoen", icon: Trees },
    { key: "sport", label: "Sportterrein", icon: Dumbbell },
    { key: "restaurant", label: "Restaurant", icon: UtensilsCrossed },
    { key: "library", label: "Bibliotheek", icon: Library },
  ] },
];

interface Result {
  buurt: string | null;
  peiljaar: number;
  distances: Record<string, number | null>;
}

function formatKm(km: number) {
  if (km < 1) return `${Math.round(km * 1000 / 50) * 50 || 50} m`;
  return `${km.toFixed(1).replace(".", ",")} km`;
}

function travelHint(km: number) {
  if (km <= 1.2) return `${Math.max(1, Math.round((km * 1000) / 80))} min lopen`;
  if (km <= 7) return `${Math.max(2, Math.round((km * 1000) / 250))} min fietsen`;
  return `${Math.max(5, Math.round((km / 50) * 60))} min met de auto`;
}

const memory: Record<string, Result> = {};

interface Props { latitude: number; longitude: number; city: string; }

const NearbyAmenities = ({ latitude, longitude, city }: Props) => {
  const key = `nearby_v3_${latitude.toFixed(4)}_${longitude.toFixed(4)}`;
  const initial = (() => {
    if (memory[key]) return memory[key];
    try { const s = sessionStorage.getItem(key); return s ? (JSON.parse(s) as Result) : null; } catch { return null; }
  })();
  const [data, setData] = useState<Result | null>(initial);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (initial) return;
    let cancelled = false;
    supabase.functions
      .invoke("nearby-amenities", { body: { lat: latitude, lon: longitude } })
      .then(({ data: res, error }) => {
        if (cancelled) return;
        if (error || !res?.distances) { setFailed(true); return; }
        memory[key] = res;
        try { sessionStorage.setItem(key, JSON.stringify(res)); } catch { /* ignore */ }
        setData(res);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (failed) return null;

  return (
    <section className="mt-8 min-w-0">
      <h2 className="font-display text-lg font-semibold text-foreground mb-1 break-words">
        Hoe ver is het naar winkels, station, school en kinderopvang?
      </h2>
      <p className="text-[0.9375rem] text-muted-foreground mb-4">
        Gemiddelde afstand over de weg vanuit de buurt{data?.buurt ? ` ${data.buurt}` : ""} in {city}.
      </p>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        {GROUPS.map((g) => {
          const rows = g.items.filter((it) => !data || data.distances[it.key] != null);
          if (data && rows.length === 0) return null;
          return (
            <Card key={g.title} className="overflow-hidden">
              <CardContent className="p-4">
                <h3 className="text-[0.9375rem] font-semibold mb-3">{g.title}</h3>
                <ul className="space-y-2.5">
                  {rows.map((it) => {
                    const Icon = it.icon;
                    const km = data?.distances[it.key];
                    return (
                      <li key={it.key} className="flex items-center gap-2.5 text-[0.9375rem]">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                          <Icon className="h-3.5 w-3.5 text-primary" />
                        </span>
                        <span className="min-w-0 flex-1 text-muted-foreground leading-snug">{it.label}</span>
                        {km == null ? (
                          <Skeleton className="h-4 w-16" />
                        ) : (
                          <span className="shrink-0 text-right leading-tight">
                            <span className="block font-semibold text-foreground">{formatKm(km)}</span>
                            <span className="block text-xs text-muted-foreground">{travelHint(km)}</span>
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Bron: CBS, Nabijheid voorzieningen {data?.peiljaar ?? 2024}. Reistijden zijn een schatting.
      </p>
    </section>
  );
};

export default NearbyAmenities;

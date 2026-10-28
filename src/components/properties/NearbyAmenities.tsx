import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, GraduationCap, Bus, TrainFront, Baby, Stethoscope } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface AmenityCategory {
  key: string;
  label: string;
  icon: typeof ShoppingCart;
  query: string;
  radius: number;
  match: (t: Record<string, string>) => boolean;
  fallback: string;
}

interface AmenityResult {
  name: string;
  distance: number; // meters
}

const CATEGORIES: AmenityCategory[] = [
  { key: "supermarket", label: "Supermarkten", icon: ShoppingCart, radius: 3000, fallback: "Supermarkt",
    query: `nwr["shop"="supermarket"]`, match: (t) => t.shop === "supermarket" },
  { key: "train", label: "Treinstations", icon: TrainFront, radius: 8000, fallback: "Station",
    query: `node["railway"="station"]["station"!="subway"]`, match: (t) => t.railway === "station" },
  { key: "bus", label: "Bushaltes", icon: Bus, radius: 1000, fallback: "Bushalte",
    query: `node["highway"="bus_stop"]`, match: (t) => t.highway === "bus_stop" },
  { key: "school", label: "Scholen", icon: GraduationCap, radius: 3000, fallback: "School",
    query: `nwr["amenity"="school"]`, match: (t) => t.amenity === "school" },
  { key: "childcare", label: "Kinderopvang", icon: Baby, radius: 3000, fallback: "Kinderopvang",
    query: `nwr["amenity"~"^(kindergarten|childcare)$"]`, match: (t) => t.amenity === "kindergarten" || t.amenity === "childcare" },
  { key: "doctor", label: "Huisarts", icon: Stethoscope, radius: 3000, fallback: "Huisarts",
    query: `nwr["amenity"~"^(doctors|clinic)$"]`, match: (t) => t.amenity === "doctors" || t.amenity === "clinic" },
];

function walkMinutes(m: number) { return Math.max(1, Math.round(m / 80)); }

/** Haversine distance in meters */
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

interface Props {
  latitude: number;
  longitude: number;
  city: string;
}



/** Simple in-memory + sessionStorage cache for Overpass results */
const memoryCache: Record<string, Record<string, AmenityResult[]>> = {};

function getCacheKey(lat: number, lon: number) {
  return `amenities_v2_${lat.toFixed(4)}_${lon.toFixed(4)}`;
}

function getCached(key: string): Record<string, AmenityResult[]> | null {
  if (memoryCache[key]) return memoryCache[key];
  try {
    const stored = sessionStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      memoryCache[key] = parsed;
      return parsed;
    }
  } catch { /* ignore */ }
  return null;
}

function setCache(key: string, data: Record<string, AmenityResult[]>) {
  memoryCache[key] = data;
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch { /* ignore */ }
}

const NearbyAmenities = ({ latitude, longitude, city }: Props) => {
  const cacheKey = getCacheKey(latitude, longitude);
  const cached = getCached(cacheKey);

  const [results, setResults] = useState<Record<string, AmenityResult[]>>(cached || {});
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (cached) {
      setResults(cached);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchAmenities = async () => {
      setLoading(true);
      setError(false);

      try {
        const { data, error: fnError } = await supabase.functions.invoke("nearby-amenities", {
          body: { lat: latitude, lon: longitude },
        });
        if (fnError || !data?.results) throw new Error("failed");
        if (cancelled) return;

        const grouped: Record<string, AmenityResult[]> = data.results;
        setCache(cacheKey, grouped);
        setResults(grouped);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAmenities();
    return () => { cancelled = true; };
  }, [latitude, longitude, cacheKey, cached]);

  if (error) return null;

  return (
    <section className="mt-8 min-w-0">
      <h3 className="font-display text-lg font-semibold text-foreground mb-1 break-words">
        In de buurt van deze woning in {city}
      </h3>
      <p className="text-[0.9375rem] text-muted-foreground mb-4">
        Afstand hemelsbreed, met geschatte looptijd. Bron: OpenStreetMap
      </p>

      {loading ? (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <Card key={cat.key} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => {
            const items = results[cat.key] || [];
            const Icon = cat.icon;

            return (
              <Card key={cat.key} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <h4 className="text-[0.9375rem] font-semibold">{cat.label}</h4>
                  </div>
                  {items.length > 0 ? (
                    <ul className="space-y-2">
                      {items.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between text-[0.9375rem]"
                        >
                          <span className="text-muted-foreground truncate mr-2">
                            {item.name}
                          </span>
                          <span className="shrink-0 font-medium text-foreground">
                            {formatDistance(item.distance)}
                            <span className="ml-1 font-normal text-muted-foreground">· {walkMinutes(item.distance)} min lopen</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[0.9375rem] text-muted-foreground">
                      Geen gevonden binnen {cat.radius / 1000} km
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default NearbyAmenities;

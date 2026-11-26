import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, GraduationCap, Bus, TrainFront } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AmenityCategory {
  key: string;
  label: string;
  icon: typeof ShoppingCart;
}

interface AmenityResult {
  name: string;
  distance: number; // meters
}

const CATEGORIES: AmenityCategory[] = [
  {
    key: "supermarket",
    label: "Supermarkten",
    icon: ShoppingCart,
  },
  {
    key: "school",
    label: "Scholen",
    icon: GraduationCap,
  },
  {
    key: "bus",
    label: "Bushaltes",
    icon: Bus,
  },
  {
    key: "train",
    label: "Treinstations",
    icon: TrainFront,
  },
];

function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

interface Props {
  latitude: number;
  longitude: number;
  city: string;
}

const RADIUS = 5000; // 5km search radius

/** Simple in-memory + sessionStorage cache for Overpass results */
const memoryCache: Record<string, Record<string, AmenityResult[]>> = {};

function getCacheKey(lat: number, lon: number) {
  return `amenities_${lat.toFixed(4)}_${lon.toFixed(4)}`;
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
        const params = new URLSearchParams({
          lat: latitude.toFixed(6),
          lng: longitude.toFixed(6),
        });
        const res = await fetch(`/api/public/nearby-amenities?${params}`);
        if (!res.ok) throw new Error("Voorzieningen konden niet worden opgehaald");
        const data = await res.json() as {
          available: boolean;
          results: Record<string, AmenityResult[]> | null;
        };
        if (cancelled) return;
        if (!data.available || !data.results) {
          setError(true);
          return;
        }

        setCache(cacheKey, data.results);
        setResults(data.results);
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
        Voorzieningen binnen {RADIUS / 1000} km
      </p>

      {loading ? (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
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
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
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
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[0.9375rem] text-muted-foreground">
                      Geen gevonden binnen {RADIUS / 1000} km
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

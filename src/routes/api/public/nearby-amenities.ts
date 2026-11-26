import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const RADIUS = 5000;
const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
] as const;

const querySchema = z.object({
  lat: z.coerce.number().finite().min(-90).max(90),
  lng: z.coerce.number().finite().min(-180).max(180),
});

interface AmenityResult {
  name: string;
  distance: number;
}

interface OverpassElement {
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
}

const categories = [
  { key: "supermarket", radius: 2000, query: 'node["shop"="supermarket"]' },
  { key: "school", radius: 2000, query: 'node["amenity"~"^(school|university|college)$"]' },
  { key: "bus", radius: 1000, query: 'node["highway"="bus_stop"]' },
  { key: "train", radius: RADIUS, query: 'node["railway"="station"]["station"!="subway"]' },
] as const;

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadius = 6371000;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function groupAmenities(elements: OverpassElement[], latitude: number, longitude: number) {
  const grouped: Record<string, AmenityResult[]> = Object.fromEntries(
    categories.map((category) => [category.key, []]),
  );

  for (const element of elements) {
    if (typeof element.lat !== "number" || typeof element.lon !== "number") continue;
    const tags = element.tags ?? {};
    const distance = haversine(latitude, longitude, element.lat, element.lon);
    const item = { name: tags.name ?? "", distance };

    if (tags.shop === "supermarket") {
      grouped.supermarket.push({ ...item, name: item.name || "Supermarkt" });
    } else if (["school", "university", "college"].includes(tags.amenity ?? "")) {
      grouped.school.push({ ...item, name: item.name || "School" });
    } else if (tags.highway === "bus_stop") {
      grouped.bus.push({ ...item, name: item.name || "Bushalte" });
    } else if (tags.railway === "station") {
      grouped.train.push({ ...item, name: item.name || "Station" });
    }
  }

  for (const items of Object.values(grouped)) {
    items.sort((a, b) => a.distance - b.distance);
    items.splice(3);
  }
  return grouped;
}

export const Route = createFileRoute("/api/public/nearby-amenities")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const parsed = querySchema.safeParse(
          Object.fromEntries(new URL(request.url).searchParams),
        );
        if (!parsed.success) {
          return Response.json(
            { available: false, error: "Ongeldige coördinaten" },
            { status: 400 },
          );
        }

        const { lat, lng } = parsed.data;
        const union = categories
          .map((category) => `${category.query}(around:${category.radius},${lat},${lng});`)
          .join("\n");
        const query = `[out:json][timeout:15];(\n${union}\n);out body 400;`;

        for (const endpoint of ENDPOINTS) {
          try {
            const response = await fetch(endpoint, {
              method: "POST",
              body: `data=${encodeURIComponent(query)}`,
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
                "User-Agent": "WoonaanbodNL/1.0 (+https://www.woonaanbod-nl.nl)",
              },
              signal: AbortSignal.timeout(15_000),
            });
            if (!response.ok) continue;
            const data = await response.json() as { elements?: OverpassElement[] };
            return Response.json(
              {
                available: true,
                results: groupAmenities(data.elements ?? [], lat, lng),
              },
              {
                headers: {
                  "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
                },
              },
            );
          } catch {
            // Probeer de reservebron; een storing mag de woningpagina niet blokkeren.
          }
        }

        return Response.json(
          { available: false, results: null },
          { headers: { "Cache-Control": "public, max-age=300, s-maxage=900" } },
        );
      },
    },
  },
});

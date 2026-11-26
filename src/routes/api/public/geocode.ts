import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const querySchema = z.object({
  q: z.string().trim().min(2).max(200),
});

type Coords = { lat: number; lng: number; label: string };

async function fromPdok(q: string): Promise<Coords | null> {
  const url = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?rows=1&fl=centroide_ll,weergavenaam&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(6_000) });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    response?: { docs?: { centroide_ll?: string; weergavenaam?: string }[] };
  };
  const doc = data.response?.docs?.[0];
  const match = doc?.centroide_ll?.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
  if (!match) return null;
  return { lng: Number(match[1]), lat: Number(match[2]), label: doc?.weergavenaam ?? q };
}

async function fromNominatim(q: string): Promise<Coords | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=nl&limit=1&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: {
      "Accept-Language": "nl",
      "User-Agent": "WoonaanbodNL/1.0 (+https://www.woonaanbod-nl.nl)",
    },
    signal: AbortSignal.timeout(6_000),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { lat?: string; lon?: string; display_name?: string }[];
  const first = data[0];
  if (!first?.lat || !first.lon) return null;
  return { lat: Number(first.lat), lng: Number(first.lon), label: first.display_name ?? q };
}

export const Route = createFileRoute("/api/public/geocode")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const parsed = querySchema.safeParse(
          Object.fromEntries(new URL(request.url).searchParams),
        );
        if (!parsed.success) {
          return Response.json({ found: false, error: "Ongeldig adres" }, { status: 400 });
        }
        for (const source of [fromPdok, fromNominatim]) {
          try {
            const result = await source(parsed.data.q);
            if (result && Number.isFinite(result.lat) && Number.isFinite(result.lng)) {
              return Response.json(
                { found: true, ...result },
                { headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800" } },
              );
            }
          } catch {
            // Volgende bron proberen; een storing mag het zoeken niet breken.
          }
        }
        return Response.json(
          { found: false },
          { headers: { "Cache-Control": "public, max-age=300" } },
        );
      },
    },
  },
});

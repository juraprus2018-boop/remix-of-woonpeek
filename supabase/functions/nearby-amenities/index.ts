// Haalt voorzieningen in de buurt op via OpenStreetMap (Overpass) en cachet
// het resultaat per afgeronde coördinaat, zodat bezoekers direct resultaat zien.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CATS = [
  { key: "supermarket", r: 3000, q: `nwr["shop"="supermarket"]`, m: (t: any) => t.shop === "supermarket", f: "Supermarkt" },
  { key: "train", r: 8000, q: `node["railway"="station"]["station"!="subway"]`, m: (t: any) => t.railway === "station", f: "Station" },
  { key: "bus", r: 1000, q: `node["highway"="bus_stop"]`, m: (t: any) => t.highway === "bus_stop", f: "Bushalte" },
  { key: "school", r: 3000, q: `nwr["amenity"="school"]`, m: (t: any) => t.amenity === "school", f: "School" },
  { key: "childcare", r: 3000, q: `nwr["amenity"~"^(kindergarten|childcare)$"]`, m: (t: any) => t.amenity === "kindergarten" || t.amenity === "childcare", f: "Kinderopvang" },
  { key: "doctor", r: 3000, q: `nwr["amenity"~"^(doctors|clinic)$"]`, m: (t: any) => t.amenity === "doctors" || t.amenity === "clinic", f: "Huisarts" },
];

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

function hav(a: number, b: number, c: number, d: number) {
  const R = 6371000, t = (x: number) => (x * Math.PI) / 180;
  const x = Math.sin(t(c - a) / 2) ** 2 + Math.cos(t(a)) * Math.cos(t(c)) * Math.sin(t(d - b) / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

async function overpass(query: string): Promise<any | null> {
  const ctrls = ENDPOINTS.map(() => new AbortController());
  const timer = setTimeout(() => ctrls.forEach((c) => c.abort()), 18000);
  try {
    return await new Promise((resolve) => {
      let left = ENDPOINTS.length;
      ENDPOINTS.forEach(async (url, i) => {
        try {
          const res = await fetch(url, {
            method: "POST",
            body: `data=${encodeURIComponent(query)}`,
            headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "WoonaanbodNL/1.0 (info@woonaanbod-nl.nl)", Accept: "application/json" },
            signal: ctrls[i].signal,
          });
          if (!res.ok) throw new Error(String(res.status));
          const j = await res.json();
          if (!Array.isArray(j?.elements)) throw new Error("bad");
          resolve(j);
        } catch {
          if (--left === 0) resolve(null);
        }
      });
    });
  } finally {
    clearTimeout(timer);
    ctrls.forEach((c) => c.abort());
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  try {
    const body = await req.json().catch(() => ({}));
    const lat = Number(body.lat), lon = Number(body.lon);
    // Alleen Nederland en omgeving
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < 50 || lat > 54 || lon < 2.5 || lon > 7.5) {
      return json({ error: "Ongeldige locatie" }, 400);
    }
    const rlat = Math.round(lat * 1000) / 1000, rlon = Math.round(lon * 1000) / 1000;
    const key = `${rlat.toFixed(3)}_${rlon.toFixed(3)}`;
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: cached } = await sb.from("nearby_amenities_cache").select("data, updated_at").eq("cache_key", key).maybeSingle();
    if (cached && Date.now() - new Date(cached.updated_at).getTime() < 90 * 86400000) {
      return json({ results: cached.data, cached: true });
    }

    const answers = await Promise.all(
      CATS.map((c) => overpass(`[out:json][timeout:15];${c.q}(around:${c.r},${rlat},${rlon});out center tags 40;`)),
    );
    const okCount = answers.filter(Boolean).length;
    if (okCount === 0) {
      if (cached) return json({ results: cached.data, cached: true });
      return json({ error: "Kaartdienst niet bereikbaar" }, 503);
    }
    const data = { elements: answers.flatMap((a) => a?.elements ?? []) };

    const grouped: Record<string, { name: string; distance: number }[]> = {};
    for (const c of CATS) grouped[c.key] = [];
    for (const el of data.elements) {
      const t = el.tags || {};
      const la = el.lat ?? el.center?.lat, lo = el.lon ?? el.center?.lon;
      if (la == null || lo == null) continue;
      const c = CATS.find((x) => x.m(t));
      if (!c) continue;
      const name = t.name || c.f;
      if (grouped[c.key].some((x) => x.name === name)) continue;
      grouped[c.key].push({ name, distance: Math.round(hav(lat, lon, la, lo)) });
    }
    for (const k of Object.keys(grouped)) grouped[k] = grouped[k].sort((a, b) => a.distance - b.distance).slice(0, 3);

    // Alleen cachen als alle categorieën gelukt zijn
    if (okCount === CATS.length) await sb.from("nearby_amenities_cache").upsert({ cache_key: key, data: grouped, updated_at: new Date().toISOString() });
    return json({ results: grouped, cached: false });
  } catch (e) {
    console.error("nearby-amenities", e);
    return json({ error: String(e) }, 500);
  }
});

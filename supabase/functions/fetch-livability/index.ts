import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** Clamp number into [min,max]. */
const clamp = (n: number, min = 0, max = 10) => Math.max(min, Math.min(max, n));

/**
 * Fetches recent crime totals for a city via CBS open data (47018NED — Geregistreerde
 * misdrijven; regio + perioden). Returns crimes per 1000 inhabitants if possible.
 */
async function fetchCrimePer1000(cityName: string, inhabitants: number | null): Promise<number | null> {
  if (!inhabitants || inhabitants < 100) return null;
  try {
    // 47018NED RegioS lookup
    const regUrl = `https://opendata.cbs.nl/ODataApi/odata/47018NED/RegioS?$filter=startswith(Key,'GM')`;
    const regRes = await fetch(regUrl, { headers: { Accept: "application/json" } });
    if (!regRes.ok) return null;
    const regJson = await regRes.json();
    const regions: Array<{ Key: string; Title: string }> = regJson.value || [];
    const target = cityName.toLowerCase().trim();
    const hit = regions.find((r) => r.Title.toLowerCase().trim() === target)
      || regions.find((r) => slugify(r.Title) === slugify(cityName));
    if (!hit) return null;
    // Fetch most recent year totals (SoortMisdrijf=0.0.0 = totaal)
    const dsUrl = `https://opendata.cbs.nl/ODataApi/odata/47018NED/TypedDataSet?$filter=RegioS eq '${hit.Key.trim()}' and SoortMisdrijf eq '0.0.0  '&$orderby=Perioden desc&$top=1`;
    const dsRes = await fetch(dsUrl, { headers: { Accept: "application/json" } });
    if (!dsRes.ok) return null;
    const dsJson = await dsRes.json();
    const row = dsJson.value?.[0];
    const total = row?.GeregistreerdeMisdrijven_1 ?? row?.GeregistreerdeMisdrijvenRelatief_2;
    if (!total) return null;
    return (Number(total) / inhabitants) * 1000;
  } catch (e) {
    console.warn("crime fetch failed", e);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { city, postal_code } = await req.json();
    if (!city) {
      return new Response(JSON.stringify({ error: "city required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const pc4 = String(postal_code || "").slice(0, 4);
    const cacheKey = `${slugify(city)}:${pc4 || "all"}`;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Cache: fresh < 7 days
    const { data: cached } = await supabase
      .from("livability_cache")
      .select("data, fetched_at")
      .eq("cache_key", cacheKey)
      .maybeSingle();
    if (cached && Date.now() - new Date(cached.fetched_at).getTime() < 7 * 24 * 3600 * 1000) {
      return new Response(JSON.stringify(cached.data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Pull CBS city stats from existing cache (populated by fetch-cbs-stats)
    const { data: cbsRow } = await supabase
      .from("cbs_stats_cache")
      .select("data")
      .eq("city_slug", slugify(city))
      .maybeSingle();

    const cbs = (cbsRow?.data || {}) as Record<string, number | null>;
    const inhabitants = cbs.inhabitants ?? null;
    const density = cbs.population_density ?? null;

    const crimePer1000 = await fetchCrimePer1000(city, inhabitants);

    // Safety score: 10 at 0 crimes, 1 at 150 crimes per 1000 (high). Linear inverse.
    const safetyScore = crimePer1000 == null
      ? null
      : clamp(10 - (crimePer1000 / 150) * 9, 1, 10);

    // Livability: balance density (urban = higher amenities but lower space). Score peaks ~ 2500-5000 inw/km².
    let livabilityScore: number | null = null;
    if (density != null) {
      const d = Number(density);
      if (d < 200) livabilityScore = 6.5; // very rural
      else if (d < 1500) livabilityScore = 8.2; // village/suburb sweet spot
      else if (d < 4000) livabilityScore = 8.0;
      else if (d < 7500) livabilityScore = 7.2;
      else livabilityScore = 6.5; // very dense urban
    }

    // Amenities score: proxy via density (denser = more amenities) clamped 5-9.5
    let amenitiesScore: number | null = null;
    if (density != null) {
      amenitiesScore = clamp(5 + (Number(density) / 7500) * 4.5, 5, 9.5);
    }

    const payload = {
      safety_score: safetyScore,
      livability_score: livabilityScore,
      amenities_score: amenitiesScore,
      crime_per_1000: crimePer1000,
      population_density: density,
      source: "CBS + Politie open data",
      details: `Indicatieve scores voor ${city}${pc4 ? ` (PC ${pc4})` : ""}. Berekend op basis van bevolkingsdichtheid (CBS) en geregistreerde misdrijven per 1.000 inwoners (Politie/CBS open data). Hoger is beter.`,
    };

    await supabase.from("livability_cache").upsert({
      cache_key: cacheKey,
      city,
      postal_code: pc4 || null,
      data: payload,
      fetched_at: new Date().toISOString(),
    }, { onConflict: "cache_key" });

    return new Response(JSON.stringify(payload), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("fetch-livability error", err);
    return new Response(JSON.stringify({
      safety_score: null, livability_score: null, amenities_score: null,
      crime_per_1000: null, population_density: null,
      source: "unavailable",
      details: "Open data tijdelijk niet beschikbaar.",
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// Dataset 85984NED = Regionale kerncijfers Nederland, RegioS = Gemeente codes (GM####)
const CBS_BASE = "https://opendata.cbs.nl/ODataApi/odata/85984NED";

async function findRegionCode(cityName: string): Promise<{ code: string; title: string } | null> {
  // RegioS lookup: filter by Title containing city name
  const url = `${CBS_BASE}/RegioS?$filter=startswith(Key,'GM')`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const json = await res.json();
  const regions: Array<{ Key: string; Title: string; Description: string }> = json.value || [];
  const target = cityName.toLowerCase().trim();
  // exact match first
  let hit = regions.find((r) => r.Title.toLowerCase().trim() === target);
  if (!hit) hit = regions.find((r) => r.Title.toLowerCase().replace(/\s*\(.*\)\s*/, "").trim() === target);
  if (!hit) hit = regions.find((r) => slugify(r.Title) === slugify(cityName));
  if (!hit) return null;
  return { code: hit.Key.trim(), title: hit.Title.trim() };
}

async function fetchCityStats(regionCode: string) {
  const url = `${CBS_BASE}/TypedDataSet?$filter=RegioS eq '${regionCode}'&$orderby=Perioden desc&$top=1`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`CBS fetch failed: ${res.status}`);
  const json = await res.json();
  return (json.value && json.value[0]) || null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { city } = await req.json();
    if (!city || typeof city !== "string") {
      return new Response(JSON.stringify({ error: "city required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const citySlug = slugify(city);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check cache (fresh < 30 days)
    const { data: cached } = await supabase
      .from("cbs_stats_cache")
      .select("*")
      .eq("city_slug", citySlug)
      .maybeSingle();

    const isFresh = cached && (Date.now() - new Date(cached.fetched_at).getTime() < 30 * 24 * 3600 * 1000);
    if (isFresh) {
      return new Response(JSON.stringify({ ...cached.data, _cached: true, city_name: cached.city_name, region_code: cached.region_code }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find region code
    const region = await findRegionCode(city);
    if (!region) {
      return new Response(JSON.stringify({ error: "Stad niet gevonden bij CBS" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const raw = await fetchCityStats(region.code);
    if (!raw) {
      return new Response(JSON.stringify({ error: "Geen CBS-data beschikbaar" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Pick interesting fields (CBS 85984NED has many — common ones below)
    const data = {
      period: raw.Perioden,
      inhabitants: raw.TotaleBevolking_1 ?? raw.AantalInwoners_5 ?? null,
      men: raw.Mannen_2 ?? null,
      women: raw.Vrouwen_3 ?? null,
      age_0_15: raw.k_0Tot15Jaar_8 ?? raw.YoungerThan15Years_8 ?? null,
      age_15_25: raw.k_15Tot25Jaar_9 ?? null,
      age_25_45: raw.k_25Tot45Jaar_10 ?? null,
      age_45_65: raw.k_45Tot65Jaar_11 ?? null,
      age_65_plus: raw.k_65JaarOfOuder_12 ?? null,
      avg_household_size: raw.GemiddeldeHuishoudensgrootte_28 ?? null,
      households: raw.ParticuliereHuishoudens_27 ?? null,
      single_households: raw.Eenpersoonshuishoudens_24 ?? null,
      population_density: raw.Bevolkingsdichtheid_33 ?? null,
      area_km2: raw.OppervlakteTotaal_103 ?? raw.OppervlakteLand_104 ?? null,
      avg_income: raw.GemiddeldInkomenPerInkomensontvanger_72 ?? null,
      avg_house_value: raw.GemiddeldeWoningwaarde_99 ?? null,
      housing_stock: raw.Woningvoorraad_100 ?? null,
      raw,
    };

    await supabase.from("cbs_stats_cache").upsert({
      city_slug: citySlug,
      city_name: region.title,
      region_code: region.code,
      data,
      fetched_at: new Date().toISOString(),
    }, { onConflict: "city_slug" });

    return new Response(JSON.stringify({ ...data, city_name: region.title, region_code: region.code, _cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("fetch-cbs-stats error", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

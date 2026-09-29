import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// Dataset 70072ned = Regionale kerncijfers Nederland (85984NED is door CBS ingetrokken).
// RegioS bevat gemeentecodes (GM####).
const CBS_BASES = [
  "https://opendata.cbs.nl/ODataApi/odata/70072ned",
  "https://dataderden.cbs.nl/ODataApi/OData/70072ned",
];

async function cbsFetch(path: string): Promise<any> {
  let lastErr: unknown = null;
  for (const base of CBS_BASES) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 15000);
        const res = await fetch(`${base}${path}`, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (!res.ok) {
          lastErr = new Error(`CBS ${res.status} at ${base}`);
          break; // host antwoordt maar faalt -> volgende host
        }
        return await res.json();
      } catch (err) {
        lastErr = err;
        if (attempt === 0) await new Promise((r) => setTimeout(r, 800));
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("CBS onbereikbaar");
}

async function findRegionCode(cityName: string): Promise<{ code: string; title: string } | null> {
  const json = await cbsFetch(`/RegioS?$filter=startswith(Key,'GM')`);
  const regions: Array<{ Key: string; Title: string; Description: string }> = json.value || [];
  const target = cityName.toLowerCase().trim();
  // opgeheven gemeenten achteraan
  const active = regions.filter((r) => !/Opgeheven/i.test(r.Description || ""));
  const ordered = [...active, ...regions.filter((r) => /Opgeheven/i.test(r.Description || ""))];
  // exact match first
  let hit = ordered.find((r) => r.Title.toLowerCase().trim() === target);
  if (!hit) hit = ordered.find((r) => r.Title.toLowerCase().replace(/\s*\(.*\)\s*/, "").trim() === target);
  if (!hit) hit = ordered.find((r) => slugify(r.Title) === slugify(cityName));
  if (!hit) return null;
  return { code: hit.Key.trim(), title: hit.Title.trim() };
}

// Niet elk veld is in elk jaar gevuld; neem per veld de meest recente waarde.
async function fetchCityStats(regionCode: string) {
  const json = await cbsFetch(`/TypedDataSet?$filter=startswith(RegioS,'${regionCode}')`);
  const rows: any[] = json.value || [];
  if (!rows.length) return null;
  const sorted = rows.sort((a, b) => String(a.Perioden).localeCompare(String(b.Perioden)));
  const merged: Record<string, any> = {};
  for (const row of sorted) {
    for (const [k, v] of Object.entries(row)) {
      if (v !== null && v !== undefined && !(typeof v === "string" && !v.trim())) merged[k] = v;
    }
  }
  merged.Perioden = sorted[sorted.length - 1].Perioden;
  return merged;
}


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  let cityParam: string | null = null;
  try {
    const body = await req.json().catch(() => ({}));
    const city = (body as any)?.city;
    if (!city || typeof city !== "string") {
      return new Response(JSON.stringify({ error: "city required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    cityParam = city;
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

    const year = String(raw.Perioden || "").replace(/JJ\d*$/, "");
    const data = {
      period: year || raw.Perioden,
      inhabitants: raw.TotaleBevolking_1 ?? null,
      men: raw.Mannen_2 ?? null,
      women: raw.Vrouwen_3 ?? null,
      age_0_15: raw.k_0Tot15Jaar_4 ?? null,
      age_15_25: raw.k_15Tot25Jaar_5 ?? null,
      age_25_45: raw.k_25Tot45Jaar_6 ?? null,
      age_45_65: raw.k_45Tot65Jaar_7 ?? null,
      age_65_plus: (raw.k_65Tot80Jaar_8 ?? 0) + (raw.k_80JaarOfOuder_9 ?? 0) || null,
      avg_household_size: raw.GemiddeldeHuishoudensgrootte_59 ?? null,
      households: raw.TotaalParticuliereHuishoudens_52 ?? null,
      single_households: raw.Eenpersoonshuishoudens_53 ?? null,
      population_density: raw.Bevolkingsdichtheid_27 ?? null,
      area_km2: raw.TotaleOppervlakte_218 ?? raw.TotaleOppervlakte_158 ?? null,
      avg_income: null,
      avg_house_value: raw.GemiddeldeWOZWaardeVanWoningen_68 ?? null,
      housing_stock: raw.VoorraadOp1Januari_60 ?? null,
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
    // Vangnet: serveer verlopen cache als CBS onbereikbaar is
    try {
      if (cityParam) {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const { data: stale } = await supabase
          .from("cbs_stats_cache")
          .select("*")
          .eq("city_slug", slugify(cityParam))
          .maybeSingle();
        if (stale) {
          return new Response(JSON.stringify({ ...stale.data, _cached: true, _stale: true, city_name: stale.city_name, region_code: stale.region_code }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    } catch (fallbackErr) {
      console.error("fetch-cbs-stats stale fallback error", fallbackErr);
    }
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});


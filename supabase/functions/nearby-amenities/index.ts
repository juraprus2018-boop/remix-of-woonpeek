// Afstanden tot voorzieningen per buurt, uit officiële CBS-cijfers
// ("Nabijheid voorzieningen", gemiddelde afstand over de weg).
// Buurt wordt bepaald via PDOK; resultaat wordt per buurt gecachet.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CBS_TABLE = "86134NED"; // peiljaar 2024
const FIELDS: Record<string, string> = {
  supermarket: "AfstandTotGroteSupermarkt_24",
  shop: "AfstandTotOvDagelLevensmiddelen_28",
  train: "AfstandTotTreinstationsTotaal_90",
  hub: "AfstandTotBelangrijkOverstapstation_91",
  highway: "AfstandTotOpritHoofdverkeersweg_89",
  primary: "AfstandTotSchool_60",
  secondary: "AfstandTotSchool_64",
  daycare: "AfstandTotKinderdagverblijf_52",
  afterschool: "AfstandTotBuitenschoolseOpvang_56",
  doctor: "AfstandTotHuisartsenpraktijk_5",
  pharmacy: "AfstandTotApotheek_10",
  hospital: "AfstandTotZiekenhuis_11",
  park: "AfstandTotParkOfPlantsoen_77",
  library: "AfstandTotBibliotheek_92",
  restaurant: "AfstandTotRestaurant_44",
  sport: "AfstandTotSportterrein_84",
};

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

async function getJson(url: string) {
  const r = await fetch(url, { signal: AbortSignal.timeout(12000) });
  if (!r.ok) throw new Error(`[${r.status}] ${url}`);
  return r.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const lat = Number(body.lat), lon = Number(body.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < 50.6 || lat > 53.7 || lon < 3.2 || lon > 7.3) {
      return json({ error: "Ongeldige locatie" }, 400);
    }

    const rev = await getJson(`https://api.pdok.nl/bzk/locatieserver/search/v3_1/reverse?lat=${lat}&lon=${lon}&type=buurt&rows=1`);
    const id = rev?.response?.docs?.[0]?.id;
    if (!id) return json({ error: "Geen buurt gevonden" }, 404);
    const look = await getJson(`https://api.pdok.nl/bzk/locatieserver/search/v3_1/lookup?id=${encodeURIComponent(id)}&fl=buurtcode,buurtnaam`);
    const doc = look?.response?.docs?.[0];
    const code: string | undefined = doc?.buurtcode;
    if (!code || !/^BU\d{8}$/.test(code)) return json({ error: "Geen buurtcode" }, 404);

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: cached } = await sb.from("nearby_amenities_cache").select("data").eq("cache_key", code).maybeSingle();
    if (cached) return json(cached.data);

    const cbs = await getJson(
      `https://opendata.cbs.nl/ODataApi/odata/${CBS_TABLE}/TypedDataSet?$filter=WijkenEnBuurten%20eq%20'${code}'`,
    );
    const row = cbs?.value?.[0];
    if (!row) return json({ error: "Geen CBS-cijfers voor deze buurt" }, 404);

    const distances: Record<string, number | null> = {};
    for (const [k, f] of Object.entries(FIELDS)) {
      const v = row[f];
      distances[k] = typeof v === "number" ? v : null;
    }
    const result = { buurt: doc?.buurtnaam ?? null, buurtcode: code, peiljaar: 2024, distances };
    await sb.from("nearby_amenities_cache").upsert({ cache_key: code, data: result, updated_at: new Date().toISOString() });
    return json(result);
  } catch (e) {
    console.error("nearby-amenities", e);
    return json({ error: String(e) }, 502);
  }
});

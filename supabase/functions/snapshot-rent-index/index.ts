import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireAdmin } from "../_shared/auth.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const gate = await requireAdmin(req, corsHeaders);
  if (gate.response) return gate.response;
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const today = new Date();
    const snapshotMonth = `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, "0")}-01`;

    // Pull all active huur listings
    const { data: properties, error } = await supabase
      .from("properties")
      .select("city, price, surface_area")
      .eq("status", "actief")
      .eq("listing_type", "huur");
    if (error) throw error;

    const byCity = new Map<string, { name: string; prices: number[]; m2: number[] }>();
    for (const p of properties || []) {
      const city = (p.city || "").trim();
      if (!city || city === "Onbekend" || !p.price) continue;
      const slug = slugify(city);
      if (!byCity.has(slug)) byCity.set(slug, { name: city, prices: [], m2: [] });
      const g = byCity.get(slug)!;
      g.prices.push(Number(p.price));
      if (p.surface_area && p.surface_area > 10) g.m2.push(Number(p.price) / (p.surface_area as number));
    }

    let written = 0;
    const rows = [];
    for (const [slug, g] of byCity) {
      if (g.prices.length < 3) continue;
      const sorted = [...g.prices].sort((a, b) => a - b);
      const avg = Math.round(sorted.reduce((s, n) => s + n, 0) / sorted.length);
      const median = sorted[Math.floor(sorted.length / 2)];
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      const ppm2 = g.m2.length ? Math.round(g.m2.reduce((s, n) => s + n, 0) / g.m2.length) : null;
      rows.push({
        city_slug: slug,
        city_name: g.name,
        snapshot_month: snapshotMonth,
        avg_rent: avg,
        median_rent: median,
        min_rent: min,
        max_rent: max,
        sample_size: sorted.length,
        avg_price_per_m2: ppm2,
      });
      written++;
    }

    if (rows.length) {
      const { error: upErr } = await supabase
        .from("rent_index_snapshots")
        .upsert(rows, { onConflict: "city_slug,snapshot_month" });
      if (upErr) throw upErr;
    }

    return new Response(JSON.stringify({ ok: true, month: snapshotMonth, cities_written: written }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("snapshot-rent-index error", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

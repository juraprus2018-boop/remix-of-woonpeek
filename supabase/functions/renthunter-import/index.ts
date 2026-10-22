import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import Papa from "npm:papaparse@5.5.3";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { requireAdmin } from "../_shared/auth.ts";
import { mapRenthunter, rentalIdentity, type FeedRow } from "./mapping.ts";

const FEED = "https://api.renthunter.nl/affiliate/feed-nl.csv";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const gate = await requireAdmin(req, corsHeaders);
  if (gate.response) return gate.response;
  const respond = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
  try {
    const response = await fetch(FEED, { signal: AbortSignal.timeout(45000) });
    if (!response.ok) throw new Error(`Feed returned ${response.status}`);
    const text = await response.text();
    if (text.length > 100_000_000) throw new Error("Feed exceeds size limit");
    const parsed = Papa.parse<FeedRow>(text.replace(/^\uFEFF/, ""), {
      header: true, delimiter: ";", skipEmptyLines: true,
    });
    if (parsed.errors.length || !["id", "link", "plaats", "huurprijs", "woningtype"].every(k => parsed.meta.fields?.includes(k))) {
      throw new Error("Incomplete or malformed CSV; existing listings left untouched");
    }
    const checkedAt = new Date().toISOString();
    const unique = new Map<string, ReturnType<typeof mapRenthunter>>();
    for (const row of parsed.data) unique.set(row.id, mapRenthunter(row, checkedAt));
    if (unique.size < 100) throw new Error("Unexpectedly small feed; existing listings left untouched");
    const db = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const existing = new Map<string, string>();
    let activeCount = 0;
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await db.from("properties").select("id, source_url, status")
        .eq("source_site", "Renthunter").order("id").range(offset, offset + 999);
      if (error) throw error;
      for (const p of data || []) {
        const key = rentalIdentity(p.source_url);
        // Prefer an already migrated row over an old affiliate duplicate.
        if (key && (!existing.has(key) || p.source_url?.startsWith("https://renthunter.nl/"))) existing.set(key, p.id);
        if (p.status === "actief") activeCount++;
      }
      if (!data || data.length < 1000) break;
    }
    if (unique.size < activeCount * 0.5) throw new Error("Feed dropped by more than 50%; sync paused for review");
    const rows = [...unique.entries()].map(([sku, property]) => ({ ...property, id: existing.get(sku) || crypto.randomUUID() }));
    let imported = 0;
    let updated = 0;
    for (let offset = 0; offset < rows.length; offset += 200) {
      const batch = rows.slice(offset, offset + 200);
      const { error } = await db.rpc("sync_renthunter_batch", { _rows: batch });
      if (error) throw error;
      for (const row of batch) { if (existing.has(row.source_raw.sku)) updated++; else imported++; }
    }
    // Only reconcile missing/legacy listings after every validated batch succeeds.
    const { error: cleanupError, count } = await db.from("properties")
      .update({ status: "inactief", updated_at: checkedAt }, { count: "exact" })
      .eq("source_site", "Renthunter").eq("status", "actief").lt("last_checked_at", checkedAt);
    if (cleanupError) throw cleanupError;
    const outcome = { success: true, imported, updated, deactivated: count, feed_rows: rows.length, checked_at: checkedAt };
    console.log(JSON.stringify(outcome));
    return respond(outcome);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Renthunter sync failed:", message);
    return respond({ success: false, error: message }, 500);
  }
});
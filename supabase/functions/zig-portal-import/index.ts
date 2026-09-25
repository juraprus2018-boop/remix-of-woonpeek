import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { propertyUrl } from "../_shared/propertyUrl.ts";
import { requireAdmin } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_USER_ID = "dbf1773b-5120-458f-8719-590b9fa4c787";
const SITE_URL = "https://www.woonaanbod-nl.nl";
const INDEXNOW_KEY = "b8f3e2a1d4c5f6e7a9b0c1d2e3f4a5b6";

/**
 * All of these portals run the same Zig/Woonmatch software as Wooniezie, so they
 * expose the identical JSON endpoint and object shape.
 */
interface Portal {
  key: string;
  name: string;
  host: string;
}

const PORTALS: Portal[] = [
  { key: "wonenindekop", name: "Wonen in de Kop", host: "https://www.wonenindekop.nl" },
  { key: "dewoningzoeker", name: "De Woningzoeker", host: "https://www.dewoningzoeker.nl" },
  { key: "antares", name: "Thuis bij Antares", host: "https://wonen.thuisbijantares.nl" },
  { key: "klikvoorwonen", name: "Klik voor Wonen", host: "https://www.klikvoorwonen.nl" },
  { key: "hurennoordveluwe", name: "Huren Noord-Veluwe", host: "https://www.hurennoordveluwe.nl" },
  { key: "oostwestwonen", name: "Oost West Wonen", host: "https://woningzoeken.oostwestwonen.nl" },
  { key: "ofw", name: "OFW", host: "https://woningzoeken.ofw.nl" },
  { key: "klikvoorkamers", name: "Klik voor Kamers", host: "https://www.klikvoorkamers.nl" },
  { key: "thuiskompas", name: "Thuiskompas", host: "https://www.thuiskompas.nl" },
  { key: "svnk", name: "SVNK", host: "https://www.svnk.nl" },
];

interface ZigProperty {
  id: string;
  urlKey: string;
  street: string;
  houseNumber: string;
  houseNumberAddition?: string;
  postalcode: string;
  city?: { name: string | null };
  municipality?: { name: string | null };
  neighborhood?: { name: string | null };
  dwellingType?: { localizedName?: string; categorie?: string };
  netRent: number;
  totalRent: number;
  sellingPrice: number;
  rentBuy: string;
  sleepingRoom?: { amountOfRooms: string };
  energyLabel?: { icon?: string };
  constructionYear?: number;
  areaDwelling?: number;
  latitude?: string;
  longitude?: string;
  pictures?: Array<{ uri: string; type?: string }>;
  isGepubliceerd?: boolean;
}

function parseEnergyLabel(icon: string | undefined): string | null {
  if (!icon) return null;
  const map: Record<string, string> = {
    icon_label_a_plus_plus: "A++",
    icon_label_a_plus: "A+",
    icon_label_a: "A",
    icon_label_b: "B",
    icon_label_c: "C",
    icon_label_d: "D",
    icon_label_e: "E",
    icon_label_f: "F",
    icon_label_g: "G",
  };
  return map[icon] || null;
}

function mapPropertyType(dwellingType: string): "appartement" | "huis" | "studio" | "kamer" {
  const t = (dwellingType || "").toLowerCase();
  if (t.includes("studio")) return "studio";
  if (t.includes("kamer") || t.includes("room")) return "kamer";
  if (t.includes("appartement") || t.includes("flat") || t.includes("etage") || t.includes("portiek")) return "appartement";
  if (t.includes("eengezins") || t.includes("woning") || t.includes("huis") || t.includes("maisonnette") || t.includes("maisonette")) return "huis";
  return "appartement";
}

function sourceUrlFor(portal: Portal, item: ZigProperty): string {
  return `${portal.host}/aanbod/${item.urlKey}`;
}

function mapToProperty(portal: Portal, item: ZigProperty) {
  const isRent = item.rentBuy !== "Koop";
  const price = isRent ? item.totalRent || item.netRent : item.sellingPrice;
  const houseNumber = item.houseNumberAddition
    ? `${item.houseNumber} ${item.houseNumberAddition}`.trim()
    : item.houseNumber;

  const images = (item.pictures || [])
    .filter((p) => p.uri)
    .map((p) => (p.uri.startsWith("http") ? p.uri : `${portal.host}${p.uri}`));

  const city = item.city?.name || item.municipality?.name || "";
  const title = `${item.street} ${houseNumber}, ${city}`.trim();

  return {
    title,
    street: item.street,
    house_number: houseNumber,
    city,
    postal_code: item.postalcode || null,
    neighborhood: item.neighborhood?.name || null,
    price,
    listing_type: isRent ? ("huur" as const) : ("koop" as const),
    property_type: mapPropertyType(item.dwellingType?.localizedName || ""),
    surface_area: item.areaDwelling && item.areaDwelling > 0 ? item.areaDwelling : null,
    bedrooms: item.sleepingRoom ? parseInt(item.sleepingRoom.amountOfRooms) || null : null,
    energy_label: parseEnergyLabel(item.energyLabel?.icon),
    build_year: item.constructionYear || null,
    latitude: item.latitude ? parseFloat(item.latitude) : null,
    longitude: item.longitude ? parseFloat(item.longitude) : null,
    images,
    source_url: sourceUrlFor(portal, item),
    source_site: portal.name,
    user_id: SYSTEM_USER_ID,
    status: "actief" as const,
    description: null,
  };
}

async function submitToIndexNow(urls: string[]) {
  if (urls.length === 0) return;
  try {
    const resp = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: "www.woonaanbod-nl.nl",
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: urls.slice(0, 10000),
      }),
    });
    console.log(`IndexNow: submitted ${urls.length} URLs, status ${resp.status}`);
  } catch (e) {
    console.error("IndexNow submission error:", e);
  }
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// deno-lint-ignore no-explicit-any
async function importPortal(supabase: any, portal: Portal, includeKoop: boolean) {
  const result = { portal: portal.name, imported: 0, updated: 0, skipped: 0, errors: 0 };
  const newUrls: string[] = [];

  const endpoints = [`${portal.host}/portal/object/frontend/getallobjects/format/json?configurationKey=rent`];
  if (includeKoop) {
    endpoints.push(`${portal.host}/portal/object/frontend/getallobjects/format/json?configurationKey=buy`);
  }

  const items: ZigProperty[] = [];
  for (const url of endpoints) {
    try {
      const resp = await fetch(url, { headers: { Accept: "application/json" } });
      if (!resp.ok) {
        console.error(`${portal.name}: endpoint ${resp.status}`);
        result.errors++;
        continue;
      }
      const data = await resp.json();
      const batch: ZigProperty[] = data.result || [];
      items.push(...batch);
    } catch (e) {
      console.error(`${portal.name}: fetch failed`, e);
      result.errors++;
    }
  }

  const published = items.filter((i) => i.isGepubliceerd !== false && i.urlKey && (i.city?.name || i.municipality?.name));
  result.skipped += items.length - published.length;

  if (published.length === 0) {
    console.log(`${portal.name}: nothing to import (0 published of ${items.length})`);
    return result;
  }

  // Look up existing listings in batches instead of one query per listing.
  const bySourceUrl = new Map<string, ZigProperty>();
  for (const item of published) bySourceUrl.set(sourceUrlFor(portal, item), item);
  const allUrls = [...bySourceUrl.keys()];

  const existing = new Map<string, { id: string; status: string }>();
  // Small chunks: long source URLs in a big IN-list exceed the request URL limit.
  for (const part of chunk(allUrls, 40)) {
    // A failed lookup would make existing listings look new, so retry before giving up.
    let lastError: string | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data, error } = await supabase
        .from("properties")
        .select("id, status, source_url")
        .in("source_url", part);
      if (!error) {
        for (const row of data || []) existing.set(row.source_url, { id: row.id, status: row.status });
        lastError = null;
        break;
      }
      lastError = error.message;
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
    if (lastError) {
      console.error(`${portal.name}: lookup failed after retries: ${lastError}`);
      result.errors++;
      return result; // Abort this portal rather than risk duplicate-insert batch failures.
    }
  }


  const nowIso = new Date().toISOString();

  // Refresh + reactivate existing listings
  const seenIds = [...existing.values()].map((e) => e.id);
  for (const part of chunk(seenIds, 100)) {
    await supabase.from("properties").update({ last_checked_at: nowIso }).in("id", part);
  }
  const reactivateIds = [...existing.values()].filter((e) => e.status === "inactief").map((e) => e.id);
  for (const part of chunk(reactivateIds, 200)) {
    const { error } = await supabase
      .from("properties")
      .update({ status: "actief", updated_at: nowIso, last_checked_at: nowIso })
      .in("id", part);
    if (error) result.errors++;
    else result.updated += part.length;
  }
  result.skipped += existing.size - reactivateIds.length;

  // Insert new listings in batches
  const toInsert = allUrls.filter((u) => !existing.has(u)).map((u) => mapToProperty(portal, bySourceUrl.get(u)!));
  for (const part of chunk(toInsert, 50)) {
    // Upsert so one already-known source_url cannot drop the other 49 new listings.
    const { data, error } = await supabase
      .from("properties")
      .upsert(part, { onConflict: "source_url", ignoreDuplicates: true })
      .select("id, slug, address_slug, city, listing_type");

    if (error) {
      console.error(`${portal.name}: insert error ${error.message}`);
      result.errors += part.length;
      continue;
    }
    result.imported += data?.length || 0;
    // deno-lint-ignore no-explicit-any
    for (const row of data || []) newUrls.push(propertyUrl(row as any));
  }

  await submitToIndexNow(newUrls);

  // Listings that disappeared from the portal for 3+ days go inactive (never deleted, for SEO).
  const staleCutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const { data: stale, error: staleError } = await supabase
    .from("properties")
    .update({ status: "inactief", updated_at: nowIso })
    .eq("source_site", portal.name)
    .eq("status", "actief")
    .lt("last_checked_at", staleCutoff)
    .select("id");
  if (staleError) console.error(`${portal.name}: deactivation error ${staleError.message}`);
  else if (stale?.length) console.log(`${portal.name}: ${stale.length} listings deactivated`);

  // Keep the scrapers overview in sync

  const { data: scraper } = await supabase
    .from("scrapers")
    .select("id, properties_found")
    .eq("name", portal.name)
    .maybeSingle();

  if (scraper) {
    await supabase
      .from("scrapers")
      .update({
        last_run_at: nowIso,
        last_run_status: result.errors > 0 ? "partial" : "success",
        properties_found: (scraper.properties_found || 0) + result.imported,
        updated_at: nowIso,
      })
      .eq("id", scraper.id);
    await supabase.from("scraper_logs").insert({
      scraper_id: scraper.id,
      status: result.errors > 0 ? "partial" : "success",
      properties_scraped: result.imported,
      message: `Imported ${result.imported}, reactivated ${result.updated}, skipped ${result.skipped}, errors ${result.errors}`,
    });
  } else {
    await supabase.from("scrapers").insert({
      name: portal.name,
      website_url: portal.host,
      description: `Woonmatch-portaal, dagelijkse import van ${portal.name}`,

      is_active: true,
      last_run_at: nowIso,
      last_run_status: result.errors > 0 ? "partial" : "success",
      properties_found: result.imported,
    });
  }

  console.log(
    `${portal.name}: ${result.imported} imported, ${result.updated} reactivated, ${result.skipped} skipped, ${result.errors} errors`,
  );
  return result;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const gate = await requireAdmin(req, corsHeaders);
  if (gate.response) return gate.response;

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json().catch(() => ({}));
    const includeKoop = body.include_koop === true;

    // Optional: one portal at a time (used by the nightly rotation).
    let portals = PORTALS;
    if (typeof body.portal === "string" && body.portal !== "all") {
      portals = PORTALS.filter((p) => p.key === body.portal);
      if (portals.length === 0) {
        return new Response(JSON.stringify({ error: `Unknown portal: ${body.portal}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
    if (typeof body.slot === "number") {
      // Split the portal list across nightly slots so each run stays short.
      const slots = typeof body.slots === "number" && body.slots > 0 ? body.slots : 5;
      portals = PORTALS.filter((_, i) => i % slots === body.slot % slots);
    }

    const results = [];
    for (const portal of portals) {
      results.push(await importPortal(supabase, portal, includeKoop));
    }

    const totals = results.reduce(
      (acc, r) => ({
        imported: acc.imported + r.imported,
        updated: acc.updated + r.updated,
        skipped: acc.skipped + r.skipped,
        errors: acc.errors + r.errors,
      }),
      { imported: 0, updated: 0, skipped: 0, errors: 0 },
    );

    return new Response(JSON.stringify({ success: true, ...totals, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Zig portal import error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

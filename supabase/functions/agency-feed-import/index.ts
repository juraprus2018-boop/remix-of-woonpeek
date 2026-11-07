import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { isServiceRole } from "../_shared/auth.ts";
import { propertyUrl } from "../_shared/propertyUrl.ts";
import { parseXmlFeed, mapPropertyType, mapListingType, parseEnergyLabel, stripHtml, type XmlProperty } from "./parser.ts";

const SITE_URL = "https://www.woonaanbod-nl.nl";
const INDEXNOW_KEY = "b8f3e2a1d4c5f6e7a9b0c1d2e3f4a5b6";
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

/** JSON-feed: array of objects, or {properties|items|data|objects: [...]}. Veldnamen zoals in XML. */
function parseJsonFeed(text: string): XmlProperty[] {
  const raw = JSON.parse(text);
  const list: any[] = Array.isArray(raw) ? raw : raw.properties || raw.items || raw.data || raw.objects || raw.woningen || [];
  const pick = (o: any, keys: string[]) => { for (const k of keys) if (o?.[k] != null && o[k] !== "") return o[k]; return undefined; };
  const num = (v: any) => { if (v == null) return undefined; const n = parseFloat(String(v).replace(/[^0-9.,]/g, "").replace(",", ".")); return isNaN(n) ? undefined : n; };
  return list.map((o) => {
    const imgs = pick(o, ["images", "photos", "fotos", "media"]);
    const images = Array.isArray(imgs) ? imgs.map((i: any) => (typeof i === "string" ? i : i?.url || i?.src)).filter((u: any) => typeof u === "string" && /^https?:\/\//.test(u)) : undefined;
    return {
      title: pick(o, ["title", "titel", "name", "naam"]),
      street: pick(o, ["street", "straat", "straatnaam"]),
      house_number: pick(o, ["house_number", "housenumber", "huisnummer"])?.toString(),
      city: pick(o, ["city", "plaats", "woonplaats", "stad"]),
      postal_code: pick(o, ["postal_code", "postalcode", "postcode", "zipcode"]),
      price: num(pick(o, ["price", "prijs", "huurprijs", "koopprijs", "rent"])),
      listing_type: pick(o, ["listing_type", "listingtype", "type", "koophuur"]),
      property_type: pick(o, ["property_type", "propertytype", "woningtype", "objecttype"]),
      surface_area: num(pick(o, ["surface_area", "surface", "oppervlakte", "woonoppervlakte", "living_area"])),
      bedrooms: num(pick(o, ["bedrooms", "slaapkamers"])),
      bathrooms: num(pick(o, ["bathrooms", "badkamers"])),
      build_year: num(pick(o, ["build_year", "bouwjaar"])),
      energy_label: pick(o, ["energy_label", "energielabel"]),
      latitude: num(pick(o, ["latitude", "lat"])),
      longitude: num(pick(o, ["longitude", "lng", "lon"])),
      description: pick(o, ["description", "omschrijving", "beschrijving"]),
      source_url: pick(o, ["url", "link", "detail_url", "deeplink"]),
      neighborhood: pick(o, ["neighborhood", "wijk", "buurt"]),
      images,
    } as XmlProperty;
  }).filter((p) => p.city || p.street || p.source_url);
}

async function fetchFeed(feedType: string, url: string): Promise<XmlProperty[]> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 25000);
  try {
    const resp = await fetch(url, { signal: ctrl.signal, headers: { Accept: "application/xml, application/json, text/xml, */*", "User-Agent": "WoonaanbodNL-FeedBot/1.0" } });
    if (!resp.ok) throw new Error(`Feed gaf HTTP ${resp.status}`);
    const text = await resp.text();
    if (text.length > 30_000_000) throw new Error("Feed is groter dan 30 MB");
    const looksJson = /^\s*[\[{]/.test(text);
    if (feedType === "json" || (looksJson && feedType !== "xml" && feedType !== "realworks")) return parseJsonFeed(text);
    return parseXmlFeed(text);
  } finally { clearTimeout(t); }
}

function toRow(p: XmlProperty, agency: any) {
  if (!p.city || !p.price || p.price <= 0) return null;
  const listing = mapListingType(p.listing_type || "");
  return {
    user_id: agency.owner_user_id,
    agency_id: agency.id,
    title: (p.title || `${p.street || "Woning"} ${p.house_number || ""}, ${p.city}`).slice(0, 200),
    description: stripHtml(p.description),
    property_type: mapPropertyType(p.property_type || p.title || ""),
    listing_type: listing,
    price: p.price,
    surface_area: p.surface_area ? Math.round(p.surface_area) : null,
    bedrooms: p.bedrooms ? Math.round(p.bedrooms) : null,
    bathrooms: p.bathrooms ? Math.round(p.bathrooms) : null,
    build_year: p.build_year ? Math.round(p.build_year) : null,
    energy_label: parseEnergyLabel(p.energy_label),
    street: p.street || "-",
    house_number: p.house_number || "-",
    postal_code: (p.postal_code || "").replace(/\s/g, "").toUpperCase() || "-",
    city: p.city.trim(),
    neighborhood: p.neighborhood || null,
    latitude: p.latitude || null,
    longitude: p.longitude || null,
    images: (p.images || []).slice(0, 40),
    source_url: p.source_url || null,
    source_site: agency.name,
    status: "actief",
    last_checked_at: new Date().toISOString(),
  };
}

async function importAgency(supabase: any, agency: any) {
  const items = await fetchFeed(agency.feed_type, agency.feed_url);
  const rows = items.map((p) => toRow(p, agency)).filter(Boolean) as any[];
  const { data: existing } = await supabase.from("properties").select("id, source_url, street, house_number, postal_code").eq("agency_id", agency.id);
  const key = (r: any) => r.source_url || `${r.street}|${r.house_number}|${r.postal_code}`.toLowerCase();
  const byKey = new Map<string, string>((existing || []).map((e: any) => [key(e), e.id]));
  const seen = new Set<string>();
  const newUrls: string[] = [];
  let inserted = 0, updated = 0, failed = 0;
  for (const r of rows) {
    const k = key(r); seen.add(k);
    const id = byKey.get(k);
    if (id) {
      const { error } = await supabase.from("properties").update(r).eq("id", id);
      error ? failed++ : updated++;
    } else {
      const { data, error } = await supabase.from("properties").insert(r).select("id, city, listing_type, address_slug, slug").single();
      if (error) { failed++; continue; }
      inserted++; newUrls.push(propertyUrl(data));
    }
  }
  // Niet meer in feed → inactief (nooit verwijderen)
  const gone = (existing || []).filter((e: any) => !seen.has(key(e))).map((e: any) => e.id);
  if (gone.length && rows.length > 0) await supabase.from("properties").update({ status: "inactief" }).in("id", gone).eq("status", "actief");
  if (newUrls.length) {
    fetch("https://api.indexnow.org/indexnow", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host: "www.woonaanbod-nl.nl", key: INDEXNOW_KEY, keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`, urlList: newUrls }) }).catch(() => {});
  }
  const msg = `${rows.length} woningen in feed, ${inserted} nieuw, ${updated} bijgewerkt, ${gone.length} offline${failed ? `, ${failed} mislukt` : ""}`;
  await supabase.from("agencies").update({ feed_last_sync_at: new Date().toISOString(), feed_last_status: rows.length ? "ok" : "leeg", feed_last_message: msg, feed_last_count: rows.length }).eq("id", agency.id);
  return { found: rows.length, inserted, updated, offline: gone.length, failed };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const body = await req.json().catch(() => ({}));
  const mode = body?.mode as string | undefined;

  // Cron: alle gekoppelde makelaars
  const cronSecret = req.headers.get("x-cron-secret");
  const isCron = isServiceRole(req) || (cronSecret ? (await supabase.rpc("verify_cron_secret", { _secret: cronSecret })).data === true : false);
  if (isCron && mode !== "test") {
    const { data: agencies } = await supabase.from("agencies").select("*").neq("feed_type", "handmatig").not("feed_url", "is", null).eq("is_visible", true);
    const results: any[] = [];
    for (const a of agencies || []) {
      try { results.push({ agency: a.slug, ...(await importAgency(supabase, a)) }); }
      catch (e) {
        const m = e instanceof Error ? e.message : String(e);
        await supabase.from("agencies").update({ feed_last_sync_at: new Date().toISOString(), feed_last_status: "fout", feed_last_message: m }).eq("id", a.id);
        results.push({ agency: a.slug, error: m });
      }
    }
    return json({ ok: true, results });
  }

  // Ingelogde makelaar: test of sync van eigen feed
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  const { data: u } = await supabase.auth.getUser(token);
  if (!u?.user) return json({ error: "Niet ingelogd" }, 401);
  const { data: agency } = await supabase.from("agencies").select("*").eq("owner_user_id", u.user.id).maybeSingle();
  if (!agency) return json({ error: "Geen makelaarsprofiel gevonden" }, 404);

  try {
    if (mode === "test") {
      const feedType = ["xml", "json", "realworks"].includes(body?.feed_type) ? body.feed_type : agency.feed_type;
      const url = typeof body?.feed_url === "string" ? body.feed_url.trim() : agency.feed_url;
      if (!url || !/^https?:\/\//.test(url) || url.length > 1000) return json({ error: "Ongeldige feed-URL" }, 400);
      const items = await fetchFeed(feedType, url);
      const valid = items.filter((p) => p.city && p.price);
      return json({ ok: true, found: items.length, valid: valid.length,
        samples: valid.slice(0, 3).map((p) => ({ title: p.title, city: p.city, price: p.price, street: p.street, house_number: p.house_number, images: (p.images || []).length })) });
    }
    if (mode === "sync") {
      if (agency.feed_type === "handmatig" || !agency.feed_url) return json({ error: "Geen feed gekoppeld" }, 400);
      return json({ ok: true, ...(await importAgency(supabase, agency)) });
    }
    return json({ error: "Onbekende actie" }, 400);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 502);
  }
});

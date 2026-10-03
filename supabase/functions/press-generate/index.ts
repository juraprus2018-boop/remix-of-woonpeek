// Generates recurring press publications from our own tracked listings.
// Scheduled via pg_cron (07:00 and 08:00 UTC); only acts when it is 09:00 in Europe/Amsterdam.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { requireAdmin } from "../_shared/auth.ts";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const MONTHS = ["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"];
const MIN_LOCAL = 30;
const MIN_NATIONAL = 300;
const MIN_TREND_DAYS = 25;
const euro = (n: number) => "€ " + new Intl.NumberFormat("nl-NL").format(Math.round(n));
const pct = (n: number) => (n > 0 ? "+" : "") + n.toFixed(1).replace(".", ",") + "%";
const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const median = (a: number[]) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

function amsterdamNow() {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Amsterdam", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", weekday: "short", hour12: false }).formatToParts(new Date()).map((p) => [p.type, p.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) % 24, weekday: parts.weekday as string, day: Number(parts.day), month: Number(parts.month), year: Number(parts.year) };
}

type Row = { city: string; price: number; surface_area: number | null; bedrooms: number | null; property_type: string; created_at: string };

async function loadListings(): Promise<Row[]> {
  const out: Row[] = [];
  for (let from = 0; from < 200000; from += 1000) {
    const { data, error } = await supabase.from("properties")
      .select("city, price, surface_area, bedrooms, property_type, created_at")
      .eq("status", "actief").eq("listing_type", "huur")
      .gte("price", 200).lte("price", 10000)
      .order("id").range(from, from + 999);
    if (error) throw error;
    out.push(...(data as Row[]).filter((r) => r.city && r.city !== "Onbekend"));
    if (!data || data.length < 1000) break;
  }
  return out;
}

const ppm2 = (rows: Row[]) => rows.filter((r) => r.surface_area && r.surface_area >= 12 && r.surface_area <= 400).map((r) => r.price / r.surface_area!);
const TYPE_LABEL: Record<string, string> = { appartement: "Appartement", huis: "Huis", studio: "Studio", kamer: "Kamer", vakantiehuis: "Vakantiehuis" };

function stats(rows: Row[], refDate: Date) {
  const m2 = ppm2(rows);
  const weekAgo = refDate.getTime() - 7 * 864e5;
  const monthAgo = refDate.getTime() - 30 * 864e5;
  return {
    count: rows.length,
    median_rent: Math.round(median(rows.map((r) => r.price))),
    median_ppm2: m2.length >= 10 ? Math.round(median(m2) * 10) / 10 : null,
    m2_sample: m2.length,
    new_7d: rows.filter((r) => new Date(r.created_at).getTime() >= weekAgo).length,
    new_30d: rows.filter((r) => new Date(r.created_at).getTime() >= monthAgo).length,
  };
}

function groupMedian(rows: Row[], key: (r: Row) => string | null, minN: number) {
  const g = new Map<string, number[]>();
  for (const r of rows) { const k = key(r); if (!k) continue; if (!g.has(k)) g.set(k, []); g.get(k)!.push(r.price); }
  return [...g.entries()].filter(([, v]) => v.length >= minN).map(([label, v]) => ({ label, median: Math.round(median(v)), count: v.length }));
}

async function log(kind: string, status: string, message: string, release_id: string | null = null) {
  await supabase.from("press_generation_log").insert({ kind, status, message, release_id });
}

const METHOD_BASE = "Analyse van alle actieve huurwoningen die Woonaanbod NL op de peildatum volgt (eigen aanbod, makelaars, woningcorporaties en partnersites). Huurprijzen tussen € 200 en € 10.000 per maand; prijs per m² alleen voor woningen met 12 tot 400 m². Waarden zijn medianen. Dit beschrijft het door ons gevolgde aanbod, niet automatisch de volledige Nederlandse huurmarkt.";

async function previous(kind: string, filter: Record<string, string>) {
  let q = supabase.from("press_releases").select("data, fingerprint, topic, reference_date, published_at").eq("kind", kind);
  for (const [k, v] of Object.entries(filter)) q = q.eq(k, v);
  const { data } = await q.order("published_at", { ascending: false }).limit(10);
  return data ?? [];
}

function trendFrom(prev: any, refDate: string, current: number, sample: number, minN: number) {
  if (!prev?.data?.stats?.median_rent || !prev.reference_date) return null;
  const days = (new Date(refDate).getTime() - new Date(prev.reference_date).getTime()) / 864e5;
  if (days < MIN_TREND_DAYS || (prev.data.stats.count ?? 0) < minN || sample < minN || prev.data.method_version !== 1) return null;
  const change = ((current - prev.data.stats.median_rent) / prev.data.stats.median_rent) * 100;
  return { previous: prev.data.stats.median_rent, previous_date: prev.reference_date, change_pct: Math.round(change * 10) / 10, days: Math.round(days) };
}

async function buildNational(rows: Row[], now: ReturnType<typeof amsterdamNow>) {
  if (rows.length < MIN_NATIONAL) return { skip: `Te weinig woningen (${rows.length})` };
  const ref = new Date(now.date + "T09:00:00");
  const s = stats(rows, ref);
  const cities = groupMedian(rows, (r) => r.city.trim(), MIN_LOCAL).sort((a, b) => b.count - a.count).slice(0, 12);
  const types = groupMedian(rows, (r) => TYPE_LABEL[r.property_type] ?? null, 20).sort((a, b) => b.count - a.count);
  const expensive = [...cities].sort((a, b) => b.median - a.median);
  const fingerprint = `L|${Math.round(s.median_rent / 10)}|${s.median_ppm2 ? Math.round(s.median_ppm2) : "-"}|${Math.round(s.count / 100)}|${expensive.slice(0, 3).map((c) => c.label).join(",")}`;
  const prevs = await previous("landelijk", {});
  if (prevs[0]?.fingerprint === fingerprint) return { skip: "Geen inhoudelijk nieuwe bevinding t.o.v. vorige Huurmonitor" };
  const trend = trendFrom(prevs[0], now.date, s.median_rent, s.count, MIN_NATIONAL);
  const monthName = MONTHS[now.month - 1];
  const findings = [
    `De mediane vraaghuur van het gevolgde aanbod is ${euro(s.median_rent)} per maand (${s.count.toLocaleString("nl-NL")} woningen).`,
    s.median_ppm2 ? `De mediane prijs per vierkante meter is ${euro(s.median_ppm2)} (gebaseerd op ${s.m2_sample.toLocaleString("nl-NL")} woningen met bekende oppervlakte).` : null,
    expensive.length >= 2 ? `Van de steden met minimaal ${MIN_LOCAL} woningen is ${expensive[0].label} het duurst (${euro(expensive[0].median)}) en ${expensive[expensive.length - 1].label} het goedkoopst (${euro(expensive[expensive.length - 1].median)}).` : null,
    `In de laatste 30 dagen kwamen ${s.new_30d.toLocaleString("nl-NL")} van deze woningen nieuw in ons aanbod.`,
    trend ? `Ten opzichte van de vorige Huurmonitor (peildatum ${trend.previous_date}) veranderde de mediane vraaghuur met ${pct(trend.change_pct)}.` : null,
  ].filter(Boolean) as string[];
  return {
    release: {
      slug: `woonaanbod-huurmonitor-${monthName}-${now.year}`,
      kind: "landelijk", topic: "huurmonitor", city_slug: null, city_name: "Nederland",
      title: `Woonaanbod Huurmonitor ${monthName} ${now.year}: mediane vraaghuur ${euro(s.median_rent)}`,
      summary: findings.slice(0, 2).join(" "),
      body: `De Woonaanbod Huurmonitor beschrijft maandelijks het huuraanbod dat Woonaanbod NL volgt. Op peildatum ${now.date} stonden er ${s.count.toLocaleString("nl-NL")} actieve huurwoningen in onze database.`,
      findings,
      chart: { type: "bar", title: "Mediane vraaghuur per stad (steden met het meeste aanbod)", unit: "€", rows: cities.map((c) => ({ label: c.label, value: c.median })) },
      data: { method_version: 1, stats: s, trend, table: { columns: ["Stad", "Aantal woningen", "Mediane huur (€)"], rows: cities.map((c) => [c.label, c.count, c.median]) }, types },
      methodology: METHOD_BASE + ` Steden worden alleen getoond bij minimaal ${MIN_LOCAL} woningen. Trends alleen bij een vorige meting van minstens ${MIN_TREND_DAYS} dagen eerder met dezelfde methode.`,
      reference_date: now.date, sample_size: s.count, fingerprint,
    },
  };
}

const TOPICS = ["huurprijs", "prijs-per-m2", "slaapkamers", "woningtype", "nieuw-aanbod"] as const;

async function buildLocal(rows: Row[], now: ReturnType<typeof amsterdamNow>) {
  const ref = new Date(now.date + "T09:00:00");
  const byCity = new Map<string, Row[]>();
  for (const r of rows) { const k = slugify(r.city.trim()); if (!byCity.has(k)) byCity.set(k, []); byCity.get(k)!.push(r); }
  const candidates = [...byCity.entries()].filter(([, v]) => v.length >= MIN_LOCAL).sort((a, b) => b[1].length - a[1].length);
  if (!candidates.length) return { skip: "Geen stad met voldoende data" };

  const { data: recent } = await supabase.from("press_releases").select("city_slug, topic, published_at, fingerprint").eq("kind", "lokaal").order("published_at", { ascending: false }).limit(200);
  const lastByCity = new Map<string, number>();
  for (const r of recent ?? []) if (r.city_slug && !lastByCity.has(r.city_slug)) lastByCity.set(r.city_slug, new Date(r.published_at).getTime());
  const lastTopic = recent?.[0]?.topic;
  const cutoff = Date.now() - 8 * 7 * 864e5;
  // Cities not covered in last 8 weeks first (largest first), else least recently covered.
  const ordered = [...candidates].sort((a, b) => {
    const la = lastByCity.get(a[0]) ?? 0, lb = lastByCity.get(b[0]) ?? 0;
    const fa = la < cutoff ? 0 : 1, fb = lb < cutoff ? 0 : 1;
    return fa - fb || (fa ? la - lb : b[1].length - a[1].length);
  });

  for (const [citySlug, cRows] of ordered.slice(0, 15)) {
    const cityName = cRows[0].city.trim();
    const s = stats(cRows, ref);
    const cityPrev = (recent ?? []).filter((r) => r.city_slug === citySlug);
    const topicOrder = [...TOPICS].sort((a, b) => {
      const ia = cityPrev.findIndex((r) => r.topic === a), ib = cityPrev.findIndex((r) => r.topic === b);
      return (ia === -1 ? -1e9 : -ia) - (ib === -1 ? -1e9 : -ib) || (a === lastTopic ? 1 : 0) - (b === lastTopic ? 1 : 0);
    });
    for (const topic of topicOrder) {
      const built = localTopic(topic, cityName, cRows, s);
      if (!built) continue;
      const fingerprint = `${citySlug}|${topic}|${built.fp}`;
      if (cityPrev.some((r) => r.fingerprint === fingerprint)) continue;
      const prevFull = await previous("lokaal", { city_slug: citySlug });
      const trend = trendFrom(prevFull[0], now.date, s.median_rent, s.count, MIN_LOCAL);
      const findings = [...built.findings];
      if (trend) findings.push(`Ten opzichte van onze vorige meting in ${cityName} (peildatum ${trend.previous_date}) veranderde de mediane vraaghuur met ${pct(trend.change_pct)}.`);
      return {
        release: {
          slug: `${citySlug}-${topic}-${now.date}`,
          kind: "lokaal", topic, city_slug: citySlug, city_name: cityName,
          title: built.title, summary: findings.slice(0, 2).join(" "),
          body: `Lokale update over het huuraanbod in ${cityName} dat Woonaanbod NL volgt. Op peildatum ${now.date} stonden er ${s.count} actieve huurwoningen in ${cityName} in onze database.`,
          findings, chart: built.chart,
          data: { method_version: 1, stats: s, trend, table: built.table },
          methodology: METHOD_BASE + ` Lokale updates alleen voor steden met minimaal ${MIN_LOCAL} actieve huurwoningen; groepen met minder dan ${built.minGroup} woningen worden niet getoond.`,
          reference_date: now.date, sample_size: s.count, fingerprint,
        },
      };
    }
  }
  return { skip: "Geen inhoudelijk nieuwe lokale bevinding gevonden" };
}

function localTopic(topic: string, city: string, rows: Row[], s: ReturnType<typeof stats>) {
  const n = s.count;
  if (topic === "huurprijs") {
    const bands = [[0, 1000], [1000, 1500], [1500, 2000], [2000, 2500], [2500, 1e9]];
    const r = bands.map(([a, b]) => ({ label: b > 1e8 ? `€ ${a}+` : `€ ${a} - ${b}`, value: rows.filter((x) => x.price >= a && x.price < b).length }));
    const under = rows.filter((x) => x.price < 1250).length;
    return { minGroup: 1, fp: `${Math.round(s.median_rent / 25)}|${Math.round((under / n) * 20)}`,
      title: `Huurwoningen ${city}: mediane vraaghuur ${euro(s.median_rent)}`,
      findings: [`In ${city} volgt Woonaanbod NL ${n} actieve huurwoningen met een mediane vraaghuur van ${euro(s.median_rent)} per maand.`, `${Math.round((under / n) * 100)}% van dit aanbod vraagt minder dan € 1.250 per maand.`],
      chart: { type: "bar", title: `Aantal huurwoningen in ${city} per prijsklasse`, unit: "", rows: r },
      table: { columns: ["Prijsklasse", "Aantal woningen"], rows: r.map((x) => [x.label, x.value]) } };
  }
  if (topic === "prijs-per-m2") {
    if (!s.median_ppm2 || s.m2_sample < MIN_LOCAL) return null;
    const g = new Map<string, number[]>();
    const band = (m: number) => (m < 40 ? "< 40 m²" : m < 60 ? "40 - 60 m²" : m < 80 ? "60 - 80 m²" : m < 100 ? "80 - 100 m²" : "100+ m²");
    for (const r of rows) if (r.surface_area && r.surface_area >= 12 && r.surface_area <= 400) { const k = band(r.surface_area); if (!g.has(k)) g.set(k, []); g.get(k)!.push(r.price / r.surface_area); }
    const order = ["< 40 m²", "40 - 60 m²", "60 - 80 m²", "80 - 100 m²", "100+ m²"];
    const r = order.filter((k) => (g.get(k)?.length ?? 0) >= 8).map((k) => ({ label: k, value: Math.round(median(g.get(k)!) * 10) / 10, count: g.get(k)!.length }));
    if (r.length < 2) return null;
    return { minGroup: 8, fp: `${Math.round(s.median_ppm2)}|${r.map((x) => Math.round(x.value)).join(",")}`,
      title: `Prijs per m² in ${city}: ${euro(s.median_ppm2)} voor een huurwoning`,
      findings: [`De mediane vraaghuur per vierkante meter in ${city} is ${euro(s.median_ppm2)} (${s.m2_sample} woningen met bekende oppervlakte).`, `Kleine woningen (${r[0].label}) kosten ${euro(r[0].value)} per m², grotere woningen (${r[r.length - 1].label}) ${euro(r[r.length - 1].value)} per m².`],
      chart: { type: "bar", title: `Mediane huur per m² in ${city} naar oppervlakte`, unit: "€", rows: r.map(({ label, value }) => ({ label, value })) },
      table: { columns: ["Oppervlakte", "Aantal woningen", "Mediane huur per m² (€)"], rows: r.map((x) => [x.label, x.count, x.value]) } };
  }
  if (topic === "slaapkamers") {
    const r = groupMedian(rows, (x) => (x.bedrooms == null ? null : x.bedrooms >= 4 ? "4+ slaapkamers" : `${x.bedrooms} slaapkamer${x.bedrooms === 1 ? "" : "s"}`), 8).sort((a, b) => a.label.localeCompare(b.label));
    if (r.length < 2) return null;
    return { minGroup: 8, fp: r.map((x) => `${x.label}:${Math.round(x.median / 25)}`).join(","),
      title: `Wat kost een huurwoning in ${city} per aantal slaapkamers?`,
      findings: [`In ${city} vraagt een huurwoning met ${r[0].label} mediaan ${euro(r[0].median)} per maand.`, `Voor ${r[r.length - 1].label} is dat ${euro(r[r.length - 1].median)} (op basis van ${n} gevolgde woningen).`],
      chart: { type: "bar", title: `Mediane vraaghuur in ${city} per aantal slaapkamers`, unit: "€", rows: r.map((x) => ({ label: x.label, value: x.median })) },
      table: { columns: ["Slaapkamers", "Aantal woningen", "Mediane huur (€)"], rows: r.map((x) => [x.label, x.count, x.median]) } };
  }
  if (topic === "woningtype") {
    const r = groupMedian(rows, (x) => TYPE_LABEL[x.property_type] ?? null, 8).sort((a, b) => b.count - a.count);
    if (r.length < 2) return null;
    return { minGroup: 8, fp: r.map((x) => `${x.label}:${Math.round(x.median / 25)}:${Math.round((x.count / n) * 10)}`).join(","),
      title: `Huuraanbod ${city}: ${Math.round((r[0].count / n) * 100)}% is ${r[0].label.toLowerCase()}`,
      findings: [`Van de ${n} gevolgde huurwoningen in ${city} is ${Math.round((r[0].count / n) * 100)}% een ${r[0].label.toLowerCase()}, met een mediane vraaghuur van ${euro(r[0].median)}.`, `Een ${r[1].label.toLowerCase()} vraagt mediaan ${euro(r[1].median)} per maand.`],
      chart: { type: "bar", title: `Mediane vraaghuur in ${city} per woningtype`, unit: "€", rows: r.map((x) => ({ label: x.label, value: x.median })) },
      table: { columns: ["Woningtype", "Aantal woningen", "Mediane huur (€)"], rows: r.map((x) => [x.label, x.count, x.median]) } };
  }
  if (topic === "nieuw-aanbod") {
    if (s.new_7d < 10) return null;
    const newRows = rows.filter((x) => Date.now() - new Date(x.created_at).getTime() < 7 * 864e5);
    const newMed = Math.round(median(newRows.map((x) => x.price)));
    const r = [{ label: "Nieuw (laatste 7 dagen)", value: newMed }, { label: "Al langer in aanbod", value: Math.round(median(rows.filter((x) => !newRows.includes(x)).map((x) => x.price))) }];
    return { minGroup: 10, fp: `${Math.round(s.new_7d / 5)}|${Math.round(newMed / 25)}`,
      title: `${s.new_7d} nieuwe huurwoningen in ${city} in een week`,
      findings: [`In de afgelopen 7 dagen kwamen er in ${city} ${s.new_7d} huurwoningen nieuw in het aanbod van Woonaanbod NL.`, `De mediane vraaghuur van dit nieuwe aanbod is ${euro(newMed)}, tegenover ${euro(r[1].value)} voor woningen die al langer te huur staan.`],
      chart: { type: "bar", title: `Mediane vraaghuur in ${city}: nieuw versus bestaand aanbod`, unit: "€", rows: r },
      table: { columns: ["Groep", "Aantal woningen", "Mediane huur (€)"], rows: [[r[0].label, newRows.length, r[0].value], [r[1].label, n - newRows.length, r[1].value]] } };
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const gate = await requireAdmin(req, corsHeaders);
  if (gate.response) return gate.response;
  let body: any = {};
  try { body = await req.json(); } catch { /* empty */ }
  const kind = body.kind === "landelijk" ? "landelijk" : body.kind === "lokaal" ? "lokaal" : null;
  if (!kind) return json({ error: "kind moet 'lokaal' of 'landelijk' zijn" }, 400);
  const manual = body.manual === true; // caller is already admin, service role or cron
  const now = amsterdamNow();

  if (!manual) {
    if (now.hour !== 9) return json({ ok: true, skipped: `Niet 09:00 in Amsterdam (nu ${now.hour}:00)` });
    if (kind === "lokaal" && now.weekday !== "Mon") return json({ ok: true, skipped: "Geen maandag" });
    if (kind === "landelijk" && now.day !== 1) return json({ ok: true, skipped: "Niet de eerste van de maand" });
  }
  // Max one publication per kind per Amsterdam day.
  const { data: today } = await supabase.from("press_releases").select("id").eq("kind", kind).eq("reference_date", now.date).limit(1);
  if (today?.length) { await log(kind, "skipped", "Vandaag al gepubliceerd"); return json({ ok: true, skipped: "Vandaag al gepubliceerd" }); }

  try {
    const rows = await loadListings();
    const result: any = kind === "landelijk" ? await buildNational(rows, now) : await buildLocal(rows, now);
    if (result.skip) { await log(kind, "skipped", result.skip); return json({ ok: true, skipped: result.skip }); }
    const { data, error } = await supabase.from("press_releases").insert(result.release).select("id, slug").single();
    if (error) throw error;
    await log(kind, "published", result.release.title, data.id);
    return json({ ok: true, published: data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await log(kind, "error", msg);
    return json({ error: msg }, 500);
  }
});

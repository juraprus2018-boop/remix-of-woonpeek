import { calculateCityRentalStats, type RentalObservation } from "./cityRentalStats";
import { cityLocalContext } from "./cityLocalContext";
import { citySlug } from "./citySlug";

export const escapeHtml = (value: unknown) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export interface CrawlableRental extends RentalObservation { title: string; address_slug: string | null; slug: string | null }

export const CRAWLABLE_CITIES = [
  { name: "Utrecht", slug: "utrecht", aliases: ["Utrecht"] },
  { name: "Amsterdam", slug: "amsterdam", aliases: ["Amsterdam"] },
  { name: "Rotterdam", slug: "rotterdam", aliases: ["Rotterdam"] },
  { name: "Den Haag", slug: "den-haag", aliases: ["Den Haag", "'s-Gravenhage", "The Hague"] },
  { name: "Eindhoven", slug: "eindhoven", aliases: ["Eindhoven"] },
  { name: "Groningen", slug: "groningen", aliases: ["Groningen"] },
  { name: "Tilburg", slug: "tilburg", aliases: ["Tilburg"] },
  { name: "Breda", slug: "breda", aliases: ["Breda"] },
];

export interface CityTarget { name: string; slug: string; aliases: string[] }
export interface PageFilter { slug: string; label: string; match: (p: CrawlableRental) => boolean }

const MERGED: Record<string, { slug: string; name: string }> = {
  "s-gravenhage": { slug: "den-haag", name: "Den Haag" }, "den-haag": { slug: "den-haag", name: "Den Haag" }, "the-hague": { slug: "den-haag", name: "Den Haag" },
  "s-hertogenbosch": { slug: "den-bosch", name: "Den Bosch" }, "den-bosch": { slug: "den-bosch", name: "Den Bosch" },
};
export const pageSlug = (raw: string) => { const s = citySlug(raw).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); return MERGED[s]?.slug ?? s; };

export const PAGE_FILTERS: PageFilter[] = [
  ...([["appartement", "Appartementen"], ["huis", "Huizen"], ["studio", "Studio's"], ["kamer", "Kamers"]] as const).map(([t, label]) => ({ slug: t, label, match: (p: CrawlableRental) => p.property_type === t })),
  ...[750, 1000, 1250, 1500, 2000].map(max => ({ slug: `onder-${max}`, label: `Huurwoningen tot € ${max.toLocaleString("nl-NL")}`, match: (p: CrawlableRental) => p.price > 0 && p.price <= max })),
];

/** Group one nationwide snapshot into hub pages (>= 6 rentals) then filter pages, within a file budget. */
export function planCrawlablePages(rows: CrawlableRental[], budget: number) {
  const groups = new Map<string, { rows: CrawlableRental[]; names: Map<string, number> }>();
  for (const p of rows) {
    if (!p.city || p.status !== "actief" || p.listing_type !== "huur") continue;
    const slug = pageSlug(p.city); if (!slug) continue;
    const g = groups.get(slug) ?? { rows: [] as CrawlableRental[], names: new Map<string, number>() }; groups.set(slug, g);
    g.rows.push(p); const n = p.city.trim(); g.names.set(n, (g.names.get(n) ?? 0) + 1);
  }
  const hubs = [...groups.entries()].filter(([, g]) => g.rows.length >= 6).sort((a, b) => b[1].rows.length - a[1].rows.length).map(([slug, g]) => {
    const name = Object.values(MERGED).find(m => m.slug === slug)?.name ?? [...g.names.entries()].sort((a, b) => b[1] - a[1])[0][0];
    return { city: { name, slug, aliases: [...g.names.keys()] } as CityTarget, rows: g.rows };
  });
  const pages: { city: CityTarget; rows: CrawlableRental[]; filter?: PageFilter }[] = hubs.slice(0, budget);
  const filters = hubs.flatMap(h => PAGE_FILTERS.map(f => ({ city: h.city, filter: f, rows: h.rows.filter(f.match) }))).filter(x => x.rows.length >= 6).sort((a, b) => b.rows.length - a.rows.length);
  pages.push(...filters.slice(0, Math.max(0, budget - pages.length)));
  return pages;
}

export function citySeoContent(rows: CrawlableRental[], snapshot: string, city: CityTarget, filter?: PageFilter) {
  const aliases = city.aliases.map(name => name.trim().toLocaleLowerCase("nl"));
  const rentals = [...new Map(rows.filter(p => aliases.includes(p.city.trim().toLocaleLowerCase("nl")) && p.status === "actief" && p.listing_type === "huur" && (!filter || filter.match(p))).map(p => [p.id, p])).values()];
  const stats = calculateCityRentalStats(rentals.map(p => ({ ...p, city: city.name })), city.name, Date.parse(snapshot));
  const hub = `/huurwoningen/${city.slug}`;
  const base = filter ? `${hub}/${filter.slug}` : hub;
  const heading = filter ? `${filter.label.startsWith("Huurwoningen") ? filter.label : `${filter.label} te huur`} in ${city.name}` : `Huurwoningen in ${city.name}`;
  const price = stats.averagePrice === null ? "" : `, gem. € ${Math.round(stats.averagePrice).toLocaleString("nl-NL")}`;
  const month = new Date(snapshot).toLocaleDateString("nl-NL", { month: "long", year: "numeric", timeZone: "Europe/Amsterdam" });
  const title = `${heading}: ${stats.total} te huur${price} (${month}) | Woonaanbod NL`;
  const description = `Bekijk ${stats.total} actieve huuradvertenties in ${city.name}. Vergelijk huurprijzen, kamers en appartementen, met actuele aanbodcijfers en lokale informatie.`;
  const selected = [...rentals].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, 24);
  const href = (p: CrawlableRental) => `/huurwoning/${pageSlug(p.city) || city.slug}/${encodeURIComponent(p.address_slug || p.slug || p.id)}`;
  const links = selected.map(p => `<li><a href="${escapeHtml(href(p))}">${escapeHtml(p.title)}</a>${p.price > 0 ? `, € ${escapeHtml(p.price.toLocaleString("nl-NL"))} per maand` : ""}${p.surface_area ? `, ${escapeHtml(p.surface_area)} m²` : ""}</li>`).join("");
  const context = cityLocalContext[city.slug];
  const types = stats.types.filter(t => t.count >= 3).map(t => `<tr><th scope="row">${escapeHtml(t.type)}</th><td>${t.count}</td><td>${t.medianPrice === null ? "Niet bekend" : `€ ${t.medianPrice.toLocaleString("nl-NL")}`}</td></tr>`).join("");
  const schema = {
    "@context": "https://schema.org", "@graph": [
      { "@type": "CollectionPage", "@id": `https://www.woonaanbod-nl.nl${base}`, name: heading, description, inLanguage: "nl-NL", dateModified: snapshot, spatialCoverage: { "@type": "City", name: city.name } },
      { "@type": "ItemList", numberOfItems: selected.length, itemListElement: selected.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.title, url: `https://www.woonaanbod-nl.nl${href(p)}` })) },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Huurwoningen", item: "https://www.woonaanbod-nl.nl/huurwoningen" }, { "@type": "ListItem", position: 2, name: city.name, item: `https://www.woonaanbod-nl.nl${hub}` }, ...(filter ? [{ "@type": "ListItem", position: 3, name: heading, item: `https://www.woonaanbod-nl.nl${base}` }] : [])] },
    ],
  };
  const content = `<div class="ssr-home-content"><h1>${escapeHtml(heading)}</h1>${filter ? `<p><a href="${hub}">Alle huurwoningen in ${escapeHtml(city.name)}</a></p>` : ""}<p>${escapeHtml(description)}</p><p>Snapshot: ${escapeHtml(snapshot)}. Bron: actief huuraanbod op Woonaanbod NL. ${stats.priceSample} advertenties met een positieve prijs. Geen unieke woningen of gerealiseerde verhuurprijzen; dezelfde woning kan bij meerdere aanbieders staan.</p>${stats.medianPrice !== null ? `<h2>Wat kost huren in ${escapeHtml(city.name)}?</h2><p>Mediane vraaghuur: € ${stats.medianPrice.toLocaleString("nl-NL")} per maand.${stats.medianPerM2 !== null ? ` Mediaan per m²: € ${stats.medianPerM2.toLocaleString("nl-NL", { maximumFractionDigits: 2 })} per maand, uit ${stats.areaSample} advertenties met oppervlakte.` : ""}</p>` : ""}<p>${stats.new7d} van deze actieve advertenties zijn in de afgelopen zeven dagen toegevoegd.</p><h2>Beschikbare huurwoningen</h2><ul>${links}</ul><h2>Huurwoningen per budget</h2><ul>${stats.budgets.filter(b => b.count >= 6).map(b => `<li><a href="${hub}/onder-${b.max}">Tot € ${b.max.toLocaleString("nl-NL")} per maand: ${b.count} advertenties</a></li>`).join("")}</ul>${types ? `<h2>Huurprijzen per woningtype</h2><table><thead><tr><th>Woningtype</th><th>Actieve advertenties</th><th>Mediane vraaghuur per maand</th></tr></thead><tbody>${types}</tbody></table>` : ""}${context ? `<h2>Wijken en buurten in ${escapeHtml(city.name)}</h2><p>${escapeHtml(context.text)}</p><p><a href="${escapeHtml(context.source)}">${escapeHtml(context.label)}</a></p>` : ""}<p><a href="/woning-zoeken?locatie=${encodeURIComponent(city.name)}&amp;aanbod=huur">Zoek alle beschikbare huurwoningen in ${escapeHtml(city.name)}</a> · <a href="/woonmelding">Ontvang nieuw huuraanbod</a></p></div><script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>`;
  return { title, description, content, indexable: stats.total >= 6 };
}

export function utrechtSeoContent(rows: CrawlableRental[], snapshot: string) {
  return citySeoContent(rows, snapshot, CRAWLABLE_CITIES[0]);
}

/** Replace inherited homepage content and metadata, retaining Vite's app scripts. */
export function withStaticSeo(html: string, page: { title: string; description: string; path: string; content: string; indexable: boolean }) {
  const canonical = `https://www.woonaanbod-nl.nl${page.path}`;
  const tags = `<title>${escapeHtml(page.title)}</title><meta name="description" content="${escapeHtml(page.description)}"><meta name="robots" content="${page.indexable ? "index,follow" : "noindex,follow"}"><link rel="canonical" href="${canonical}"><meta property="og:title" content="${escapeHtml(page.title)}"><meta property="og:description" content="${escapeHtml(page.description)}"><meta property="og:url" content="${canonical}"><meta name="twitter:title" content="${escapeHtml(page.title)}"><meta name="twitter:description" content="${escapeHtml(page.description)}">`;
  return html.replace(/<title>[\s\S]*?<\/title>/gi, "")
    .replace(/<meta\b[^>]*(?:name=["'](?:description|robots|twitter:title|twitter:description)["']|property=["'](?:og:title|og:description|og:url)["'])[^>]*>/gi, "")
    .replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi, "")
    .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, "")
    .replace("</head>", `${tags}</head>`)
    .replace(/<div id="root">[\s\S]*?<\/div>(?=\s*(?:<script\b[^>]*type="module"|<\/body>))/, `<div id="root">${page.content}</div>`);
}
import { calculateCityRentalStats, type RentalObservation } from "./cityRentalStats";
import { cityLocalContext } from "./cityLocalContext";

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

export function citySeoContent(rows: CrawlableRental[], snapshot: string, city: typeof CRAWLABLE_CITIES[number]) {
  const aliases = city.aliases.map(name => name.toLocaleLowerCase("nl"));
  const rentals = [...new Map(rows.filter(p => aliases.includes(p.city.trim().toLocaleLowerCase("nl")) && p.status === "actief" && p.listing_type === "huur").map(p => [p.id, p])).values()];
  const stats = calculateCityRentalStats(rentals.map(p => ({ ...p, city: city.name })), city.name, Date.parse(snapshot));
  const base = `/huurwoningen/${city.slug}`;
  const price = stats.averagePrice === null ? "" : `, gem. € ${Math.round(stats.averagePrice).toLocaleString("nl-NL")}`;
  const month = new Date(snapshot).toLocaleDateString("nl-NL", { month: "long", year: "numeric", timeZone: "Europe/Amsterdam" });
  const title = `Huurwoningen in ${city.name}: ${stats.total} te huur${price} (${month}) | Woonaanbod NL`;
  const description = `Bekijk ${stats.total} actieve huuradvertenties in ${city.name}. Vergelijk huurprijzen, kamers en appartementen, met actuele aanbodcijfers en lokale informatie.`;
  const selected = [...rentals].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, 24);
  const href = (p: CrawlableRental) => `/huurwoning/${city.slug}/${encodeURIComponent(p.address_slug || p.slug || p.id)}`;
  const links = selected.map(p => `<li><a href="${escapeHtml(href(p))}">${escapeHtml(p.title)}</a>${p.price > 0 ? `, € ${escapeHtml(p.price.toLocaleString("nl-NL"))} per maand` : ""}${p.surface_area ? `, ${escapeHtml(p.surface_area)} m²` : ""}</li>`).join("");
  const context = cityLocalContext[city.slug];
  const types = stats.types.filter(t => t.count >= 3).map(t => `<tr><th scope="row">${escapeHtml(t.type)}</th><td>${t.count}</td><td>${t.medianPrice === null ? "Niet bekend" : `€ ${t.medianPrice.toLocaleString("nl-NL")}`}</td></tr>`).join("");
  const schema = {
    "@context": "https://schema.org", "@graph": [
      { "@type": "CollectionPage", "@id": `https://www.woonaanbod-nl.nl${base}`, name: `Huurwoningen in ${city.name}`, description, inLanguage: "nl-NL", dateModified: snapshot, spatialCoverage: { "@type": "City", name: city.name } },
      { "@type": "ItemList", numberOfItems: selected.length, itemListElement: selected.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.title, url: `https://www.woonaanbod-nl.nl${href(p)}` })) },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Huurwoningen", item: "https://www.woonaanbod-nl.nl/huurwoningen" }, { "@type": "ListItem", position: 2, name: city.name, item: `https://www.woonaanbod-nl.nl${base}` }] },
    ],
  };
  const content = `<div class="ssr-home-content"><h1>Huurwoningen in ${escapeHtml(city.name)}</h1><p>${escapeHtml(description)}</p><p>Snapshot: ${escapeHtml(snapshot)}. Bron: actief huuraanbod op Woonaanbod NL. ${stats.priceSample} advertenties met een positieve prijs. Geen unieke woningen of gerealiseerde verhuurprijzen; dezelfde woning kan bij meerdere aanbieders staan.</p>${stats.medianPrice !== null ? `<h2>Wat kost huren in ${escapeHtml(city.name)}?</h2><p>Mediane vraaghuur: € ${stats.medianPrice.toLocaleString("nl-NL")} per maand.${stats.medianPerM2 !== null ? ` Mediaan per m²: € ${stats.medianPerM2.toLocaleString("nl-NL", { maximumFractionDigits: 2 })} per maand, uit ${stats.areaSample} advertenties met oppervlakte.` : ""}</p>` : ""}<p>${stats.new7d} van deze actieve advertenties zijn in de afgelopen zeven dagen toegevoegd.</p><h2>Beschikbare huurwoningen</h2><ul>${links}</ul><h2>Huurwoningen per budget</h2><ul>${stats.budgets.filter(b => b.count >= 6).map(b => `<li><a href="${base}/onder-${b.max}">Tot € ${b.max.toLocaleString("nl-NL")} per maand: ${b.count} advertenties</a></li>`).join("")}</ul>${types ? `<h2>Huurprijzen per woningtype</h2><table><thead><tr><th>Woningtype</th><th>Actieve advertenties</th><th>Mediane vraaghuur per maand</th></tr></thead><tbody>${types}</tbody></table>` : ""}${context ? `<h2>Wijken en buurten in ${escapeHtml(city.name)}</h2><p>${escapeHtml(context.text)}</p><p><a href="${escapeHtml(context.source)}">${escapeHtml(context.label)}</a></p>` : ""}<p><a href="/woning-zoeken?locatie=${encodeURIComponent(city.name)}&amp;aanbod=huur">Zoek alle beschikbare huurwoningen in ${escapeHtml(city.name)}</a> · <a href="/woonmelding">Ontvang nieuw huuraanbod</a></p></div><script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>`;
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
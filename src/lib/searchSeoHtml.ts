import { calculateCityRentalStats, type RentalObservation } from "./cityRentalStats";
import { cityLocalContext } from "./cityLocalContext";

export const escapeHtml = (value: unknown) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export interface CrawlableRental extends RentalObservation { title: string; address_slug: string | null; slug: string | null }

export function utrechtSeoContent(rows: CrawlableRental[], snapshot: string) {
  const stats = calculateCityRentalStats(rows, "Utrecht", Date.parse(snapshot));
  const rentals = rows.filter(p => p.city.trim().toLowerCase() === "utrecht" && p.status === "actief" && p.listing_type === "huur");
  const price = stats.averagePrice === null ? "" : `, gem. € ${Math.round(stats.averagePrice).toLocaleString("nl-NL")}`;
  const month = new Date(snapshot).toLocaleDateString("nl-NL", { month: "long", year: "numeric", timeZone: "Europe/Amsterdam" });
  const title = `Huurwoningen in Utrecht: ${stats.total} te huur${price} (${month}) | Woonaanbod NL`;
  const description = `Bekijk ${stats.total} actieve huuradvertenties in Utrecht. Vergelijk huurprijzen, kamers en appartementen, met actuele aanbodcijfers en lokale informatie.`;
  const links = rentals.slice(0, 24).map(p => `<li><a href="/huurwoning/utrecht/${escapeHtml(p.address_slug || p.slug || p.id)}">${escapeHtml(p.title)}</a>${p.price > 0 ? `, € ${escapeHtml(p.price.toLocaleString("nl-NL"))} per maand` : ""}${p.surface_area ? `, ${escapeHtml(p.surface_area)} m²` : ""}</li>`).join("");
  const content = `<div class="ssr-home-content"><h1>Huurwoningen in Utrecht</h1><p>${escapeHtml(description)}</p><p>Snapshot: ${escapeHtml(snapshot)}. Bron: actief huuraanbod op Woonaanbod NL. ${stats.priceSample} advertenties met een positieve prijs. Geen unieke woningen of gerealiseerde verhuurprijzen; dezelfde woning kan bij meerdere aanbieders staan.</p>${stats.medianPrice !== null ? `<h2>Wat kost huren in Utrecht?</h2><p>Mediane vraaghuur: € ${stats.medianPrice.toLocaleString("nl-NL")} per maand.${stats.medianPerM2 !== null ? ` Mediaan per m²: € ${stats.medianPerM2.toLocaleString("nl-NL", { maximumFractionDigits: 2 })} per maand, uit ${stats.areaSample} advertenties met oppervlakte.` : ""}</p>` : ""}<h2>Beschikbare huurwoningen</h2><ul>${links}</ul><h2>Huurwoningen per budget</h2><ul>${stats.budgets.filter(b => b.count >= 6).map(b => `<li><a href="/huurwoningen/utrecht/onder-${b.max}">Tot € ${b.max.toLocaleString("nl-NL")} per maand: ${b.count} advertenties</a></li>`).join("")}</ul><h2>Wijken en buurten in Utrecht</h2><p>${escapeHtml(cityLocalContext.utrecht.text)}</p><p><a href="${escapeHtml(cityLocalContext.utrecht.source)}">${escapeHtml(cityLocalContext.utrecht.label)}</a></p><p><a href="/woning-zoeken?locatie=Utrecht&amp;aanbod=huur">Zoek alle beschikbare huurwoningen in Utrecht</a> · <a href="/woonmelding">Ontvang nieuw huuraanbod</a></p></div>`;
  return { title, description, content, indexable: stats.total >= 6 };
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
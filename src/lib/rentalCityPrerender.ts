import { calculateCityRentalStats, type RentalObservation } from "./cityRentalStats";
import { cityToSlug } from "./cities";
import { getValidCityName } from "./dutchCities";
import { cityLocalContext } from "./cityLocalContext";
import { formatAddress, propertyPath } from "./propertyUrl";
import { isRentalCityIndexable } from "./rentalCityIndexing";
import { rentalCityName, rentalCitySlug } from "../../supabase/functions/_shared/rentalCityIdentity";

export interface StaticRental extends Omit<RentalObservation, "property_type"> {
  property_type: string | null;
  street: string;
  house_number: string;
  postal_code: string;
  slug: string | null;
  address_slug: string | null;
  title: string;
  bedrooms: number | null;
  number_of_rooms?: string | number | null;
  updated_at?: string;
}

const BASE = "https://www.woonaanbod-nl.nl";
const escapeHtml = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] || char);
const money = (value: number) => value.toLocaleString("nl-NL", { maximumFractionDigits: 0 });
const json = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");

export function groupRentalCities(rows: StaticRental[], includeSmall = false) {
  const groups = new Map<string, { city: string; rows: StaticRental[] }>();
  for (const row of rows) {
    if (row.status !== "actief" || row.listing_type !== "huur") continue;
    const slug = cityToSlug(row.city);
    const city = getValidCityName(slug) || (["den-haag", "den-bosch"].includes(slug) ? rentalCityName(row.city) : undefined);
    // Only emit routes the existing React city validator accepts.
    if (!city || /[/\\\u0000]/.test(slug)) continue;
    const group = groups.get(slug) || { city, rows: [] };
    group.rows.push(row);
    groups.set(slug, group);
  }
  return [...groups].filter(([, group]) => includeSmall || isRentalCityIndexable(new Set(group.rows.map(row => row.id)).size));
}

export function renderRentalCity(shell: string, city: string, rows: StaticRental[], now = new Date()) {
  const rentals = [...new Map(rows.filter(row => row.status === "actief" && row.listing_type === "huur" && rentalCitySlug(row.city) === rentalCitySlug(city)).map(row => [row.id, row])).values()];
  const stats = calculateCityRentalStats(rentals.map(row => ({ ...row, property_type: row.property_type || "" })), city, now.getTime());
  if (!isRentalCityIndexable(stats.total)) throw new Error(`Insufficient active rentals for ${city}`);
  const slug = cityToSlug(city);
  const canonical = `${BASE}/huurwoningen/${slug}`;
  const dateOptions = { timeZone: "Europe/Amsterdam" };
  const monthYear = now.toLocaleDateString("nl-NL", { ...dateOptions, month: "long", year: "numeric" });
  const date = now.toLocaleDateString("nl-NL", { ...dateOptions, day: "numeric", month: "long", year: "numeric" });
  const average = stats.averagePrice === null ? "" : `, gem. € ${money(stats.averagePrice)}`;
  const title = `Huurwoningen in ${city}: ${stats.total} te huur${average} (${monthYear}) | Woonaanbod NL`;
  const description = `${stats.total} actieve huurwoningen in ${city}.${stats.averagePrice === null ? "" : ` Gemiddelde huur € ${money(stats.averagePrice)} per maand.`} Vergelijk beschikbare woningen. Het aanbod wordt dagelijks ververst.`;
  const areas = rentals.filter(row => Number.isFinite(row.price) && row.price > 0 && row.surface_area !== null && row.surface_area > 0);
  const perM2 = areas.length ? areas.reduce((sum, row) => sum + row.price / Number(row.surface_area), 0) / areas.length : null;
  const facts = [`Op ${date} staan er ${stats.total} actieve huurwoningen in ${city} op Woonaanbod NL.`];
  if (stats.medianPrice !== null) facts.push(`De mediane huur is € ${money(stats.medianPrice)} per maand (steekproef: ${stats.priceSample} woningen).`);
  if (perM2 !== null) facts.push(`De gemiddelde huurprijs per m² is € ${perM2.toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (steekproef: ${areas.length} woningen).`);
  const pc4 = new Map<string, number[]>();
  for (const row of rentals) {
    const code = row.postal_code?.trim().match(/^([1-9]\d{3})\s?[a-z]{2}$/i)?.[1];
    if (code && Number.isFinite(row.price) && row.price > 0) pc4.set(code, [...(pc4.get(code) || []), row.price]);
  }
  const tableRows = [...pc4].filter(([, prices]) => prices.length >= 3).sort(([a], [b]) => a.localeCompare(b));
  const table = tableRows.length ? `<h2>Gemiddelde huur per postcodegebied</h2><table><thead><tr><th scope="col">Postcode (PC4)</th><th scope="col">Gemiddelde huur per maand</th><th scope="col">Aantal woningen met huurprijs</th></tr></thead><tbody>${tableRows.map(([code, prices]) => `<tr><th scope="row">${code}</th><td>€ ${money(prices.reduce((a, b) => a + b, 0) / prices.length)}</td><td>${prices.length}</td></tr>`).join("")}</tbody></table>` : "";
  // Bedrooms are not rooms. Only use an explicit provider room count; never infer one.
  const listings = rentals.slice(0, 10);
  const list = listings.map(row => {
    const rooms = Number(row.number_of_rooms);
    const roomLabel = Number.isInteger(rooms) && rooms > 0 ? `${rooms} ${rooms === 1 ? "kamer" : "kamers"}` : "Kamertal niet opgegeven";
    const details = [formatAddress(row) || row.title, Number.isFinite(row.price) && row.price > 0 ? `€ ${money(row.price)} per maand` : "Huurprijs niet opgegeven", row.surface_area !== null && row.surface_area > 0 ? `${row.surface_area} m²` : "Oppervlakte niet opgegeven", roomLabel];
    return `<li><a href="${escapeHtml(propertyPath(row))}">${escapeHtml(details.join(" · "))}</a></li>`;
  }).join("");
  const localSlugs = ["eindhoven", "rotterdam", "amsterdam", "utrecht", "den-haag", "groningen", "tilburg", "breda"];
  const local = slug === "eindhoven" ? "Vergelijk in Eindhoven de ligging van woningen in Strijp-S en Woensel en de afstand tot de campus van de TU/e. Woonbedrijf en Trudo zijn Eindhovense woningcorporaties; controleer bij deze organisaties hun eigen aanbod en inschrijfvoorwaarden. Deze stadsstatistieken beschrijven alleen de actieve advertenties op Woonaanbod NL, niet het volledige corporatieaanbod." : localSlugs.includes(slug) ? cityLocalContext[slug]?.text : undefined;
  const faqs = [{ question: `Hoeveel huurwoningen zijn er in ${city}?`, answer: `Op ${date} staan er ${stats.total} actieve huurwoningen in ${city} op Woonaanbod NL. Het aanbod wordt dagelijks ververst.` }];
  if (stats.averagePrice !== null) faqs.push({ question: `Wat is de gemiddelde huurprijs in ${city}?`, answer: `De gemiddelde huurprijs in ${city} is € ${money(stats.averagePrice)} per maand, berekend uit ${stats.priceSample} advertenties met een geldige huurprijs binnen ${stats.total} actieve huurwoningen op ${date}.` });
  const schemas = [
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: BASE }, { "@type": "ListItem", position: 2, name: "Huurwoningen", item: `${BASE}/huurwoningen` }, { "@type": "ListItem", position: 3, name: `Huurwoningen in ${city}`, item: canonical }] },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(faq => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) },
    { "@context": "https://schema.org", "@type": "ItemList", numberOfItems: listings.length, itemListElement: listings.map((row, i) => ({ "@type": "ListItem", position: i + 1, name: formatAddress(row) || row.title, url: `${BASE}${propertyPath(row)}` })) },
  ];
  const content = `<main class="ssr-home-content"><h1>Huurwoningen in ${escapeHtml(city)}</h1><p>${escapeHtml(facts.join(" "))}</p>${local ? `<p>${escapeHtml(local)}</p>` : ""}${table}<h2>Beschikbare huurwoningen in ${escapeHtml(city)}</h2><ul>${list}</ul><h2>Veelgestelde vragen</h2>${faqs.map(faq => `<h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p>`).join("")}</main>`;
  return renderStaticShell(shell, { title, description, canonical, content, schemas });
}

export function renderStaticShell(shell: string, options: { title: string; description: string; canonical: string; content: string; noindex?: boolean; schemas?: unknown[] }) {
  const { title, description, canonical, content, noindex = false, schemas = [] } = options;
  // Parse the root's nested divs rather than assuming the module script follows it.
  const root = /<div\b[^>]*\bid=["']root["'][^>]*>/i.exec(shell);
  if (!root || root.index === undefined) throw new Error("Build shell has no #root");
  const start = root.index + root[0].length;
  const tags = /<\/?div\b[^>]*>/gi;
  tags.lastIndex = start;
  let depth = 1;
  let end = -1;
  for (let tag = tags.exec(shell); tag; tag = tags.exec(shell)) {
    depth += /^<\//.test(tag[0]) ? -1 : 1;
    if (depth === 0) { end = tag.index; break; }
  }
  if (end < 0) throw new Error("Build shell has unclosed #root");
  let html = shell.slice(0, start) + content + shell.slice(end);
  html = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, "")
    .replace(/<script\b(?=[^>]*type=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/gi, "")
    .replace(/<meta\b(?=[^>]*(?:name|property)=["'](?:description|robots|og:title|og:description|og:url|twitter:title|twitter:description)["'])[^>]*>/gi, "");
  const head = `<title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><meta name="robots" content="${noindex ? "noindex" : "index"},follow"><link rel="canonical" href="${escapeHtml(canonical)}"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${escapeHtml(canonical)}"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}">${schemas.map(schema => `<script type="application/ld+json" data-rental-city-static>${json(schema)}</script>`).join("")}`;
  return html.replace(/<\/head>/i, `${head}</head>`);
}
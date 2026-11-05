import { SITE_URL, isTemplateCityPath, staticPathSelection, rentalSelectionCount, snapshotPathIndexable } from "../../supabase/functions/_shared/sitemapPolicy";
import { rentalCityName, rentalCitySlug } from "../../supabase/functions/_shared/rentalCityIdentity";
import { calculateCityRentalStats } from "./cityRentalStats";
import { groupRentalCities, renderStaticShell, type StaticRental } from "./rentalCityPrerender";
import { formatAddress, propertyPath } from "./propertyUrl";

const esc = (value: string) => value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] || char);
const money = (value: number) => Math.round(value).toLocaleString("nl-NL");

/** Extra index.html files allowed beside Vite's own dist/index.html; publishing fails above this. */
export const MAX_STATIC_RENTAL_FILES = 800;

export interface StaticRentalPlan { hubs: string[]; rich: string[]; noindex: string[]; total: number }

/**
 * Bounded static HTML inventory, in priority order: rich city hubs, then
 * threshold-passing rent index/heatmap pages, then noindex alias/template files.
 * Properties, postcodes, neighbourhoods, filters and locale copies stay on the SPA shell.
 */
export function planStaticRentalFiles(rows: StaticRental[], limit = MAX_STATIC_RENTAL_FILES): StaticRentalPlan {
  const hubs = groupRentalCities(rows)
    .map(([slug, group]) => ({ slug, size: new Set(group.rows.map(row => row.id)).size }))
    .sort((a, b) => b.size - a.size || a.slug.localeCompare(b.slug));
  if (hubs.length > limit) throw new Error(`Static rental HTML budget exceeded: ${hubs.length} hubs > ${limit}`);
  const hubSet = new Set(hubs.map(hub => hub.slug));
  const aliases = [
    ...(hubSet.has("den-haag") ? ["/huurwoningen/'s-gravenhage"] : []),
    ...(hubSet.has("den-bosch") ? ["/huurwoningen/'s-hertogenbosch"] : []),
  ];
  // Index/heatmap pages from the largest cities first; smaller cities fall back to the SPA shell.
  const richBudget = Math.max(0, limit - hubs.length - aliases.length);
  const rich = hubs.flatMap(({ slug }) => [`/huurprijs-index/${slug}`, `/heatmap/${slug}`]).filter(path => snapshotPathIndexable(rows, path)).slice(0, richBudget);
  const required = hubs.length + rich.length;
  const candidates = [...aliases, ...hubs.flatMap(({ slug }) => [`/stad/${slug}`, `/energie/${slug}`])];
  const noindex = candidates.slice(0, Math.max(0, limit - required));
  return { hubs: hubs.map(hub => hub.slug), rich, noindex, total: required + noindex.length };
}

export function staticNoindexCanonical(path: string, rows: StaticRental[]): string {
  const nl = path.replace(/^\/(en|de|fr)(?=\/|$)/, "") || "/";
  if (nl !== path) return SITE_URL + nl;
  const slug = nl.split("/")[2];
  if (slug && (isTemplateCityPath(nl) || (nl.startsWith("/huurwoningen/") && rentalCitySlug(slug) !== slug)) && rentalSelectionCount(rows, slug) >= 6) return `${SITE_URL}/huurwoningen/${rentalCitySlug(slug)}`;
  return SITE_URL + nl;
}

/** Real snapshot facts for a specific selection, never a copied homepage root. */
export function renderSnapshotPage(shell: string, path: string, rows: StaticRental[], now: Date, noindex = false): string {
  const nl = path.replace(/^\/(en|de|fr)(?=\/|$)/, "") || "/";
  const parts = nl.split("/").filter(Boolean);
  if (noindex) {
    const heading = parts.length ? parts.map(part => part.replace(/-/g, " ")).join(" | ") : "Woonaanbod NL";
    return renderStaticShell(shell, { title: `${path === nl ? "" : `${path.split("/")[1]} | `}${heading} | Woonaanbod NL`, description: "Deze pagina is niet opgenomen in de zoekindex.", canonical: staticNoindexCanonical(path, rows), noindex: true, content: `<main><h1>${esc(heading)}</h1><p>Deze pagina is niet opgenomen in de zoekindex.</p></main>` });
  }
  const property = parts[0] === "huurwoning" ? rows.find(row => propertyPath(row) === nl) : undefined;
  const selected = property ? [property] : /^(huurwoningen|huurprijs-index|heatmap|postcode|buurt)$/.test(parts[0] || "") && parts[1] ? staticPathSelection(rows, nl) : parts[1] && isTemplateCityPath(nl) ? staticPathSelection(rows, nl) : rows;
  const city = parts[1] ? rentalCityName(parts[1].replace(/-/g, " ")) : "Nederland";
  const label = property ? formatAddress(property) || property.title : parts.length ? parts.map(part => part.replace(/-/g, " ")).join(" | ") : "Woonaanbod NL";
  const cityLabel = rentalCityName(selected[0]?.city || city);
  const familyHeading = parts.length === 2 && parts[0] === "huurprijs-index" ? `Huurprijs-index ${cityLabel}` : parts.length === 2 && parts[0] === "heatmap" ? `Huurprijzen per postcode in ${cityLabel}` : undefined;
  const heading = property ? `${property.property_type || "Woning"} te huur: ${label} (${property.id})` : familyHeading || label.charAt(0).toUpperCase() + label.slice(1);
  // The selected rows may span several cities, so normalize only this calculation's city field.
  const stats = calculateCityRentalStats(selected.map(row => ({ ...row, city, property_type: row.property_type || "" })), city);
  const date = now.toLocaleDateString("nl-NL", { timeZone: "Europe/Amsterdam", day: "numeric", month: "long", year: "numeric" });
  const facts = `${date}: ${stats.total} actieve huuradvertenties in deze selectie.${stats.priceSample && stats.averagePrice !== null ? ` Gemiddelde huur € ${money(stats.averagePrice)} per maand; mediaan € ${money(stats.medianPrice ?? 0)} (steekproef: ${stats.priceSample}).` : " Deze maand is er geen bruikbare huurprijssteekproef."}${stats.areaSample && stats.medianPerM2 !== null ? ` Mediane huur per m² € ${stats.medianPerM2.toLocaleString("nl-NL", { maximumFractionDigits: 2 })} (steekproef: ${stats.areaSample}).` : ""}`;
  const links = selected.slice(0, 10).map(row => `<li><a href="${esc(propertyPath(row))}">${esc(formatAddress(row) || row.title)}${row.price > 0 ? ` · € ${money(row.price)} per maand` : ""}${row.surface_area && row.surface_area > 0 ? ` · ${row.surface_area} m²` : ""}${Number(row.number_of_rooms) > 0 ? ` · ${Number(row.number_of_rooms)} kamers` : ""}</a></li>`).join("");
  const pcs = new Map<string, number[]>();
  for (const row of selected) {
    const pc = row.postal_code?.match(/^([1-9]\d{3})/)?.[1];
    if (pc && row.price > 0) pcs.set(pc, [...(pcs.get(pc) || []), row.price]);
  }
  const tableRows = [...pcs].filter(([, prices]) => prices.length >= 3);
  const table = tableRows.length ? `<table><thead><tr><th>PC4</th><th>Gemiddelde huur</th><th>Aantal</th></tr></thead><tbody>${tableRows.map(([pc, prices]) => `<tr><th>${pc}</th><td>€ ${money(prices.reduce((a, b) => a + b, 0) / prices.length)}</td><td>${prices.length}</td></tr>`).join("")}</tbody></table>` : "";
  const month = now.toLocaleDateString("nl-NL", { timeZone: "Europe/Amsterdam", month: "long", year: "numeric" });
  const title = familyHeading ? `${familyHeading}: ${stats.total} huurwoningen${stats.priceSample && stats.averagePrice !== null ? `, gem. € ${money(stats.averagePrice)}` : ""} (${month}) | Woonaanbod NL` : `${heading} | Woonaanbod NL`;
  return renderStaticShell(shell, { title, description: facts, canonical: noindex ? staticNoindexCanonical(path, rows) : SITE_URL + path, noindex,
    content: `<main><h1>${esc(heading)}</h1>${noindex ? `<p>Deze pagina is niet opgenomen in de zoekindex.</p>` : `<p>${esc(facts)}</p>${table}<ul>${links}</ul>`}</main>` });
}
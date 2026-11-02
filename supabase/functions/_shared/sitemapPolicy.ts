import { rentalCitySlug } from "./rentalCityIdentity.ts";
export const SITE_URL = "https://www.woonaanbod-nl.nl";
export const URLSET_OPEN = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;
export const xmlEscape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
/** City templates and guides are not independent search destinations. National routes stay intact. */
export function isTemplateCityPath(path: string): boolean {
  const pathname = path.split(/[?#]/)[0].replace(/^\/(?:en|de|fr)(?=\/)/, "");
  return /^\/(?:energie|nieuwbouw|studenten|woz-waarde|verhuisservice|stadsgids|vandaag|markt|cijfers|toplijst|stad)\/[^/]+(?:\/.*)?$/.test(pathname);
}
export function urlEntry(path: string, lastmod: string | undefined, changefreq = "daily", priority = "0.6") {
  const url = xmlEscape(`${SITE_URL}${path}`);
  return `  <url>\n    <loc>${url}</loc>\n${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ""}    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n    <xhtml:link rel="alternate" hreflang="nl" href="${url}" />\n    <xhtml:link rel="alternate" hreflang="x-default" href="${url}" />\n  </url>\n`;
}

export interface SitemapRental { city: string; status: string; listing_type: string; property_type: string | null; price: number; bedrooms: number | null; updated_at?: string; postal_code?: string; neighborhood?: string | null }
export const rentalFilters = ["appartement", "huis", "studio", "kamer", "onder-1000", "onder-1250", "onder-1500", "onder-2000", "1-slaapkamers", "2-slaapkamers", "3-slaapkamers"];
export const areaSlug = (value: string) => value.trim().toLowerCase().replace(/\s+/g, "-");
export const rentalPc4 = (value?: string) => value?.trim().match(/^([1-9]\d{3})(?:\s?[a-z]{2})?$/i)?.[1];
export function rentalSelection<T extends SitemapRental>(rows: T[], slug: string, filter?: string): T[] {
  return rows.filter(row => {
    if (row.status !== "actief" || row.listing_type !== "huur" || rentalCitySlug(row.city) !== rentalCitySlug(slug)) return false;
    if (!filter) return true;
    if (/^onder-\d+$/.test(filter)) return row.price > 0 && row.price <= Number(filter.slice(6));
    if (/^\d+-slaapkamers$/.test(filter)) return Number(row.bedrooms) >= Number(filter.split("-")[0]);
    return row.property_type === filter;
  });
}
export function rentalSelectionCount(rows: SitemapRental[], slug: string, filter?: string) {
  return rentalSelection(rows, slug, filter).length;
}
export function staticPathSelection<T extends SitemapRental>(rows: T[], path: string): T[] {
  const [, family, city, filter] = path.split("/");
  const active = rows.filter(row => row.status === "actief" && row.listing_type === "huur");
  if (family === "postcode") return active.filter(row => rentalPc4(row.postal_code) === city);
  if (family === "buurt") return rentalSelection(active, city).filter(row => areaSlug(row.neighborhood || "") === filter);
  if (family === "huurwoningen") return rentalSelection(active, city, filter);
  if (["huurprijs-index", "heatmap"].includes(family)) return rentalSelection(active, city).filter(row => Number.isFinite(row.price) && row.price > 0);
  return rentalSelection(active, city);
}
export function isSnapshotPath(path: string): boolean {
  return /^\/(?:huurwoningen|huurprijs-index|heatmap|postcode|buurt)\/[^/]+/.test(path);
}
export function snapshotPathIndexable(rows: SitemapRental[], path: string): boolean {
  if (!isSnapshotPath(path)) return false;
  const [, family, slug, filter] = path.split("/");
  if (family !== "postcode" && rentalCitySlug(slug) !== slug) return false;
  if (family === "huurwoningen" && filter && !rentalFilters.includes(filter)) return false;
  const subset = staticPathSelection(rows, path);
  if (subset.length < 6) return false;
  if (family !== "heatmap") return true;
  const counts = new Map<string, number>();
  for (const row of subset) {
    const code = rentalPc4(row.postal_code);
    if (code) counts.set(code, (counts.get(code) || 0) + 1);
  }
  return [...counts.values()].some(count => count >= 3);
}
export function snapshotCityPaths(rows: SitemapRental[], cities: string[]): string[] {
  const paths = new Set<string>();
  for (const slug of new Set(cities.map(rentalCitySlug))) {
    paths.add(`/huurwoningen/${slug}`);
    for (const filter of rentalFilters) paths.add(`/huurwoningen/${slug}/${filter}`);
    paths.add(`/huurprijs-index/${slug}`);
    paths.add(`/heatmap/${slug}`);
  }
  for (const row of rows) {
    if (row.status !== "actief" || row.listing_type !== "huur") continue;
    const code = rentalPc4(row.postal_code);
    if (code) paths.add(`/postcode/${code}`);
    if (row.neighborhood?.trim()) paths.add(`/buurt/${rentalCitySlug(row.city)}/${areaSlug(row.neighborhood)}`);
  }
  return [...paths];
}

/** Keep unrelated entries, but regenerate rental hub/filter URLs from the exact HTML snapshot. */
export function repairSitemap(xml: string, rows: SitemapRental[], hubs: string[], snapshotDate: string, kind: "steden" | "pages" | "woningen") {
  const entries = xml.match(/<url>[\s\S]*?<\/url>/g) || [];
  const repaired = entries.flatMap(entry => {
    const loc = entry.match(/<loc>([\s\S]*?)<\/loc>/)?.[1];
    if (!loc) return [];
    const path = loc.replace(SITE_URL, "");
    if (/^\/(?:inkomen\/|(?:en|de|fr)(?:\/|$))/.test(path) || isTemplateCityPath(path)) return [];
    if (isSnapshotPath(path)) {
      // Regenerate the entire data family, never retain old below-threshold XML.
      if (kind === "steden" || !snapshotPathIndexable(rows, path)) return [];
    }
    if (kind === "steden") return [];
    let clean = entry.replace(/\s*<xhtml:link\b[^>]*\/?\s*>/g, "");
    // Static page dates were generated from request/build time, not page changes.
    if (kind === "pages") clean = clean.replace(/\s*<lastmod>[\s\S]*?<\/lastmod>/g, "");
    const alternates = `    <xhtml:link rel="alternate" hreflang="nl" href="${loc}" />\n    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />\n`;
    return [clean.replace(/<\/url>/, `${alternates}  </url>`)];
  });
  if (kind === "steden") for (const path of snapshotCityPaths(rows, hubs)) {
    if (snapshotPathIndexable(rows, path)) repaired.push(urlEntry(path, snapshotDate));
  }
  return URLSET_OPEN + repaired.join("\n") + "\n</urlset>\n";
}
export const SITE_URL = "https://www.woonaanbod-nl.nl";
export const URLSET_OPEN = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;
export const xmlEscape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
export function urlEntry(path: string, lastmod: string | undefined, changefreq = "daily", priority = "0.6") {
  const url = xmlEscape(`${SITE_URL}${path}`);
  return `  <url>\n    <loc>${url}</loc>\n${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ""}    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n    <xhtml:link rel="alternate" hreflang="nl" href="${url}" />\n    <xhtml:link rel="alternate" hreflang="x-default" href="${url}" />\n  </url>\n`;
}

export interface SitemapRental { city: string; status: string; listing_type: string; property_type: string | null; price: number; bedrooms: number | null; updated_at?: string }
export const rentalFilters = ["appartement", "huis", "studio", "kamer", "onder-1000", "onder-1250", "onder-1500", "onder-2000", "1-slaapkamers", "2-slaapkamers", "3-slaapkamers"];
export function rentalSelectionCount(rows: SitemapRental[], slug: string, filter?: string) {
  return rows.filter(row => {
    if (row.status !== "actief" || row.listing_type !== "huur" || row.city.trim().toLowerCase().replace(/\s+/g, "-") !== slug) return false;
    if (!filter) return true;
    if (/^onder-\d+$/.test(filter)) return row.price > 0 && row.price <= Number(filter.slice(6));
    if (/^\d+-slaapkamers$/.test(filter)) return Number(row.bedrooms) >= Number(filter.split("-")[0]);
    return row.property_type === filter;
  }).length;
}

/** Keep unrelated entries, but regenerate rental hub/filter URLs from the exact HTML snapshot. */
export function repairSitemap(xml: string, rows: SitemapRental[], hubs: string[], snapshotDate: string, kind: "steden" | "pages" | "woningen") {
  const entries = xml.match(/<url>[\s\S]*?<\/url>/g) || [];
  const repaired = entries.flatMap(entry => {
    const loc = entry.match(/<loc>([\s\S]*?)<\/loc>/)?.[1];
    if (!loc) return [];
    const path = loc.replace(SITE_URL, "");
    if (/^\/(?:inkomen\/|(?:en|de|fr)(?:\/|$))/.test(path)) return [];
    if (kind === "steden" && /^\/huurwoningen\//.test(path)) return [];
    let clean = entry.replace(/\s*<xhtml:link\b[^>]*\/?\s*>/g, "");
    // Static page dates were generated from request/build time, not page changes.
    if (kind === "pages") clean = clean.replace(/\s*<lastmod>[\s\S]*?<\/lastmod>/g, "");
    if (kind === "steden") {
      const citySlug = path.split("/")[2];
      const cityDates = rows.filter(row => row.city.trim().toLowerCase().replace(/\s+/g, "-") === citySlug).flatMap(row => row.updated_at ? [row.updated_at] : []);
      const date = cityDates.sort().at(-1)?.split("T")[0];
      if (path.startsWith("/postcode/")) clean = clean.replace(/\s*<lastmod>[\s\S]*?<\/lastmod>/g, "");
      else if (date) clean = clean.replace(/<lastmod>[\s\S]*?<\/lastmod>/, `<lastmod>${date}</lastmod>`);
    }
    const alternates = `    <xhtml:link rel="alternate" hreflang="nl" href="${loc}" />\n    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />\n`;
    return [clean.replace(/<\/url>/, `${alternates}  </url>`)];
  });
  if (kind === "steden") for (const slug of hubs) {
    if (rentalSelectionCount(rows, slug) < 6) continue;
    repaired.push(urlEntry(`/huurwoningen/${slug}`, snapshotDate, "daily", "0.8"));
    for (const filter of rentalFilters) if (rentalSelectionCount(rows, slug, filter) >= 6) {
      const subsetDate = rows.filter(row => row.city.trim().toLowerCase().replace(/\s+/g, "-") === slug).flatMap(row => row.updated_at ? [row.updated_at] : []).sort().at(-1)?.split("T")[0];
      repaired.push(urlEntry(`/huurwoningen/${slug}/${filter}`, subsetDate));
    }
  }
  return URLSET_OPEN + repaired.join("\n") + "\n</urlset>\n";
}
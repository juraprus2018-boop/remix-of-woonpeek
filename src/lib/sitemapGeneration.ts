import { pageSlug, planCrawlablePages, type CrawlableRental } from "./searchSeoHtml";
import { propertyUrl } from "./propertyUrl";

export const SITEMAP_BASE_URL = "https://www.woonaanbod-nl.nl";
const MAX_URLS = 50_000;
const MAX_BYTES = 50 * 1024 * 1024;

export interface SitemapFile {
  filename: string;
  xml: string;
  urlCount: number;
}

const escapeXml = (value: string) => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&apos;");

const checkedXml = (xml: string, urlCount: number) => {
  if (urlCount > MAX_URLS) throw new Error(`Sitemap contains ${urlCount} URLs; the limit is ${MAX_URLS}`);
  if (new TextEncoder().encode(xml).length > MAX_BYTES) throw new Error("Sitemap exceeds the 50 MB limit");
  return xml;
};

export function sitemapUrlSet(locations: string[]): string {
  const urls = [...new Set(locations)];
  const entries = urls.map((loc) => `  <url><loc>${escapeXml(loc)}</loc></url>`).join("\n");
  return checkedXml(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`, urls.length);
}

export function sitemapIndex(filenames: string[]): string {
  const locations = [...new Set(filenames)].map((filename) => `${SITEMAP_BASE_URL}/${filename}`);
  const entries = locations.map((loc) => `  <sitemap><loc>${escapeXml(loc)}</loc></sitemap>`).join("\n");
  return checkedXml(`<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>\n`, locations.length);
}

const chunks = <T,>(items: T[], size: number) => Array.from(
  { length: Math.ceil(items.length / size) },
  (_, index) => items.slice(index * size, (index + 1) * size),
);

/** Active canonical property URLs, grouped by canonical city and split at protocol limits. */
export function createPropertySitemaps(rows: CrawlableRental[]): SitemapFile[] {
  const cities = new Map<string, Set<string>>();
  for (const row of rows) {
    if (row.status !== "actief" || !row.city?.trim()) continue;
    const city = pageSlug(row.city);
    if (!city) continue;
    const url = propertyUrl({ ...row, city }, SITEMAP_BASE_URL);
    const group = cities.get(city) ?? new Set<string>();
    group.add(url);
    cities.set(city, group);
  }

  return [...cities.entries()].sort(([a], [b]) => a.localeCompare(b)).flatMap(([city, group]) => {
    const urls = [...group].sort();
    return chunks(urls, MAX_URLS).map((part, index) => ({
      filename: `sitemap-woningen-${city}${index ? `-${index + 1}` : ""}.xml`,
      xml: sitemapUrlSet(part),
      urlCount: part.length,
    }));
  });
}

/** Only current rental hubs and filters with enough real supply; legacy city templates stay out. */
export function createCitySitemaps(rows: CrawlableRental[]): SitemapFile[] {
  const paths = planCrawlablePages(rows, 760).map((page) =>
    `${SITEMAP_BASE_URL}/huurwoningen/${page.city.slug}${page.filter ? `/${page.filter.slug}` : ""}`,
  );
  const groups: string[][] = [[], [], []];
  [...new Set(paths)].forEach((path, index) => groups[index % 3]?.push(path));
  return groups.map((urls, index) => ({
    filename: `sitemap-steden-${index + 1}.xml`,
    xml: sitemapUrlSet(urls),
    urlCount: urls.length,
  }));
}

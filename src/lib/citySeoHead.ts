import { citySeoContent, pageSlug, PAGE_FILTERS, type CrawlableRental, type CityTarget } from "@/lib/searchSeoHtml";

/**
 * Server-rendered head for /huurwoningen/{stad}[/{filter}]: title, description, robots,
 * canonical and JSON-LD from today's active rentals, so crawlers get the facts without JS.
 * Runs only during SSR; client navigation keeps using SEOHead, so no extra queries per click.
 */
export interface CitySeoHead {
  title: string;
  description: string;
  indexable: boolean;
  canonical: string;
  schema: unknown;
}

const SITE = "https://www.woonaanbod-nl.nl";
const MERGED_NAMES: Record<string, { name: string; patterns: string[] }> = {
  "den-haag": { name: "Den Haag", patterns: ["den haag", "'s-gravenhage", "s-gravenhage", "the hague"] },
  "den-bosch": { name: "Den Bosch", patterns: ["den bosch", "'s-hertogenbosch", "s-hertogenbosch"] },
};

const ilikePattern = (value: string) => value.replace(/[%_*,()"]/g, "").replace(/[-\s']+/g, "_");

async function fetchCityRentals(patterns: string[]): Promise<CrawlableRental[]> {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
  if (!url || !key) return [];
  const rows: CrawlableRental[] = [];
  const or = `(${patterns.map((p) => `city.ilike.${ilikePattern(p)}`).join(",")})`;
  for (let offset = 0; offset < 10000; offset += 1000) {
    const query = new URLSearchParams({
      select: "id,city,status,listing_type,property_type,price,surface_area,neighborhood,created_at,title,address_slug,slug",
      status: "eq.actief",
      listing_type: "eq.huur",
      or,
      order: "id.asc",
      offset: String(offset),
      limit: "1000",
    });
    const res = await fetch(`${url}/rest/v1/properties?${query}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const batch = (await res.json()) as CrawlableRental[];
    rows.push(...batch);
    if (batch.length < 1000) break;
  }
  return rows;
}

export async function loadCitySeoHead(cityParam: string, filterSlug?: string): Promise<CitySeoHead | null> {
  if (typeof window !== "undefined") return null;
  try {
    const raw = decodeURIComponent(cityParam).toLowerCase();
    const slug = pageSlug(raw);
    if (!slug) return null;
    const filter = filterSlug ? PAGE_FILTERS.find((f) => f.slug === filterSlug) : undefined;
    if (filterSlug && !filter) return null;
    const merged = MERGED_NAMES[slug];
    const rows = (await fetchCityRentals(merged?.patterns ?? [slug])).filter((p) => p.city && pageSlug(p.city) === slug);
    if (rows.length === 0) return null;
    const names = new Map<string, number>();
    for (const p of rows) names.set(p.city.trim(), (names.get(p.city.trim()) ?? 0) + 1);
    const name = merged?.name ?? [...names.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? raw;
    const city: CityTarget = { name, slug, aliases: [...names.keys()] };
    const page = citySeoContent(rows, new Date().toISOString(), city, filter);
    const path = `/huurwoningen/${slug}${filter ? `/${filter.slug}` : ""}`;
    // Alias URLs (e.g. 's-gravenhage) point at the merged municipality and stay out of the index.
    const isAlias = slug !== raw;
    return {
      title: page.title,
      description: page.description,
      indexable: page.indexable && !isAlias,
      canonical: `${SITE}${path}`,
      schema: page.schema,
    };
  } catch {
    return null;
  }
}

export function citySeoHeadTags(seo: CitySeoHead | null | undefined) {
  if (!seo) return {};
  return {
    meta: [
      { title: seo.title },
      { name: "description", content: seo.description },
      { name: "robots", content: seo.indexable ? "index, follow, max-image-preview:large" : "noindex, follow" },
      { property: "og:title", content: seo.title },
      { property: "og:description", content: seo.description },
      { property: "og:url", content: seo.canonical },
      { name: "twitter:title", content: seo.title },
      { name: "twitter:description", content: seo.description },
    ],
    links: [{ rel: "canonical", href: seo.canonical }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(seo.schema).replace(/</g, "\\u003c") }],
  };
}

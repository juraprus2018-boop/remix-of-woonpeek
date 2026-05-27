import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SITE_URL = "https://www.huurbaasje.nl";

/** Locales served by the app. NL is default (no path prefix). */
const LOCALES = ["nl", "en", "de", "fr"] as const;
const DEFAULT_LOCALE = "nl";

/** URLSET opening tag including xhtml namespace required for hreflang alternates. */
const URLSET_OPEN = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

/** Build a path for a given locale (NL stays unprefixed). */
function localizedPath(path: string, locale: string): string {
  if (locale === DEFAULT_LOCALE) return path;
  if (path === "/") return `/${locale}`;
  return `/${locale}${path}`;
}

/**
 * Render a single <url> entry with hreflang alternates pointing to every
 * supported locale + x-default. `path` must be the NL (canonical) path.
 */
function urlEntry(
  path: string,
  lastmod: string,
  changefreq: string,
  priority: string,
): string {
  const alternates = LOCALES.map(
    (lng) =>
      `    <xhtml:link rel="alternate" hreflang="${lng}" href="${SITE_URL}${localizedPath(path, lng)}" />`,
  ).join("\n");
  return `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${alternates}
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${localizedPath(path, DEFAULT_LOCALE)}" />
  </url>
`;
}

function buildSitemapIndex(lastmod: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap-pages.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-steden.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-woningen.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-blog.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
</sitemapindex>`;
}

function buildPagesSitemap(now: string): string {
  const staticPages = [
    { loc: "/", changefreq: "daily", priority: "1.0" },
    { loc: "/vinden", changefreq: "daily", priority: "0.9" },
    { loc: "/plekken", changefreq: "daily", priority: "0.8" },
    { loc: "/op-kaart", changefreq: "daily", priority: "0.7" },
    { loc: "/vandaag", changefreq: "daily", priority: "0.8" },
    { loc: "/huren", changefreq: "daily", priority: "0.8" },
    { loc: "/kopen", changefreq: "daily", priority: "0.8" },
    { loc: "/appartement", changefreq: "daily", priority: "0.7" },
    { loc: "/huis", changefreq: "daily", priority: "0.7" },
    { loc: "/studio", changefreq: "daily", priority: "0.7" },
    { loc: "/kamer", changefreq: "daily", priority: "0.7" },
    { loc: "/plaatsen-start", changefreq: "weekly", priority: "0.7" },
    { loc: "/journaal", changefreq: "daily", priority: "0.8" },
    { loc: "/woonradar", changefreq: "monthly", priority: "0.6" },
    { loc: "/vragen", changefreq: "monthly", priority: "0.5" },
    { loc: "/woordenboek", changefreq: "monthly", priority: "0.7" },
    { loc: "/transparantie", changefreq: "monthly", priority: "0.4" },
    { loc: "/budgetcheck", changefreq: "monthly", priority: "0.5" },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
  for (const page of staticPages) {
    xml += `  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  }
  xml += `</urlset>`;
  return xml;
}

function buildCitiesSitemap(
  properties: Array<{ city: string; updated_at: string; listing_type: string; property_type: string; neighborhood: string | null }>,
  searchQueries: Array<{ city: string; listing_type: string | null; property_type: string | null; max_price: number | null; min_bedrooms: number | null; count: number }> = [],
  cityGuides: Array<{ city_slug: string; updated_at: string }> = [],
  postcodes: string[] = [],
): string {
  const cityMap = new Map<string, string>();
  for (const p of properties) {
    const citySlug = p.city.trim().toLowerCase().replace(/\s+/g, "-");
    const existing = cityMap.get(citySlug);
    if (!existing || p.updated_at > existing) {
      cityMap.set(citySlug, p.updated_at);
    }
  }

  const propertyTypeSlugs = [
    { slug: "appartement", type: "appartement" },
    { slug: "huis", type: "huis" },
    { slug: "studio", type: "studio" },
    { slug: "kamer", type: "kamer" },
  ];

  const cityTypeSet = new Set<string>();
  const cityNeighborhoods = new Map<string, Set<string>>();
  for (const p of properties) {
    const citySlug = p.city.trim().toLowerCase().replace(/\s+/g, "-");
    cityTypeSet.add(`${citySlug}:${p.property_type}`);
    if (p.neighborhood) {
      if (!cityNeighborhoods.has(citySlug)) cityNeighborhoods.set(citySlug, new Set());
      cityNeighborhoods.get(citySlug)!.add(p.neighborhood.trim().toLowerCase().replace(/\s+/g, "-"));
    }
  }

  // Pre-defined price/bedroom filters already in sitemap
  const defaultPrices = new Set([750, 1000, 1250, 1500, 2000]);
  const defaultBedrooms = new Set([1, 2, 3, 4]);

  // Collect extra filtered URLs from search queries
  const extraUrls = new Set<string>();
  for (const q of searchQueries) {
    if (!q.city) continue;
    const citySlug = q.city.trim().toLowerCase().replace(/\s+/g, "-");
    if (!cityMap.has(citySlug)) continue; // only cities with active properties

    if (q.max_price && q.max_price > 0) {
      const rounded = Math.round(q.max_price);
      if (!defaultPrices.has(rounded)) {
        extraUrls.add(`${SITE_URL}/aanbod-in/${citySlug}/onder-${rounded}`);
      }
    }
    if (q.min_bedrooms && q.min_bedrooms > 0) {
      if (!defaultBedrooms.has(q.min_bedrooms)) {
        extraUrls.add(`${SITE_URL}/aanbod-in/${citySlug}/${q.min_bedrooms}-kamers`);
      }
    }
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
  for (const [citySlug, lastMod] of cityMap) {
    const date = lastMod.split("T")[0];
    xml += `  <url>
    <loc>${SITE_URL}/stad/${citySlug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
    // Verhuizen-naar gids per stad
    xml += `  <url>
    <loc>${SITE_URL}/stadsgids/${citySlug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
    // Best-of listicle pages per city
    for (const slug of ["goedkoop-huur", "grootste-huur", "buurten"]) {
      xml += `  <url>
    <loc>${SITE_URL}/toplijst/${citySlug}/${slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
    }
    // Budget landingspagina's per stad (huur en koop)
    for (const budget of [750, 1000, 1250, 1500, 2000, 2500]) {
      xml += `  <url>
    <loc>${SITE_URL}/budget-huur/${budget}/${citySlug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
    }
    for (const budget of [200000, 300000, 400000, 500000, 750000, 1000000]) {
      xml += `  <url>
    <loc>${SITE_URL}/budget-koop/${budget}/${citySlug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
    }
    // Inkomen-landingspagina's per stad (3x huur regel)
    for (const income of [2000, 2500, 3000, 3500, 4000, 4500, 5000, 6000]) {
      xml += `  <url>
    <loc>${SITE_URL}/inkomen/${income}/${citySlug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
    }
    xml += `  <url>
    <loc>${SITE_URL}/huren/${citySlug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
`;
    xml += `  <url>
    <loc>${SITE_URL}/kopen/${citySlug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
`;
    for (const pt of propertyTypeSlugs) {
      if (cityTypeSet.has(`${citySlug}:${pt.type}`)) {
        xml += `  <url>
    <loc>${SITE_URL}/${pt.slug}/${citySlug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
`;
        // Combination: property type + price filter
        for (const price of [750, 1000, 1250, 1500, 2000]) {
          xml += `  <url>
    <loc>${SITE_URL}/${pt.slug}/${citySlug}/onder-${price}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.5</priority>
  </url>
`;
        }
        // Combination: property type + bedroom filter
        for (const beds of [1, 2, 3, 4]) {
          xml += `  <url>
    <loc>${SITE_URL}/${pt.slug}/${citySlug}/${beds}-kamers</loc>
    <lastmod>${date}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.5</priority>
  </url>
`;
        }
      }
    }
    // Listing type + price/bedroom combos
    for (const lt of [{ slug: "huren" }, { slug: "kopen" }]) {
      for (const price of [750, 1000, 1250, 1500, 2000]) {
        xml += `  <url>
    <loc>${SITE_URL}/${lt.slug}/${citySlug}/onder-${price}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.5</priority>
  </url>
`;
      }
      for (const beds of [1, 2, 3, 4]) {
        xml += `  <url>
    <loc>${SITE_URL}/${lt.slug}/${citySlug}/${beds}-kamers</loc>
    <lastmod>${date}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.5</priority>
  </url>
`;
      }
    }
    // Generic price/bedroom filters (no type/listing prefix)
    for (const price of [750, 1000, 1250, 1500, 2000]) {
      xml += `  <url>
    <loc>${SITE_URL}/aanbod-in/${citySlug}/onder-${price}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.5</priority>
  </url>
`;
    }
    for (const beds of [1, 2, 3, 4]) {
      xml += `  <url>
    <loc>${SITE_URL}/aanbod-in/${citySlug}/${beds}-kamers</loc>
    <lastmod>${date}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.5</priority>
  </url>
`;
    }
    xml += `  <url>
    <loc>${SITE_URL}/vandaag/${citySlug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>
`;
    xml += `  <url>
    <loc>${SITE_URL}/markt/${citySlug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
`;
    const neighborhoods = cityNeighborhoods.get(citySlug);
    if (neighborhoods) {
      let count = 0;
      for (const nhSlug of neighborhoods) {
        if (count >= 20) break;
        xml += `  <url>
    <loc>${SITE_URL}/buurt/${citySlug}/${nhSlug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
`;
        count++;
      }
    }
  }

  // Add extra URLs from popular search queries
  const today = new Date().toISOString().split("T")[0];
  for (const loc of extraUrls) {
    xml += `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.5</priority>
  </url>
`;
  }

  // Postcode landingspagina's (uniek 4-cijferig)
  for (const pc of postcodes) {
    xml += `  <url>
    <loc>${SITE_URL}/postcode/${pc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
`;
  }

  xml += `</urlset>`;
  return xml;
}

function buildPropertiesSitemap(
  properties: Array<{ slug: string | null; id: string; updated_at: string }>,
): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
  for (const p of properties) {
    xml += `  <url>
    <loc>${SITE_URL}/aanbod/${p.slug || p.id}</loc>
    <lastmod>${p.updated_at.split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
  }
  xml += `</urlset>`;
  return xml;
}

function buildBlogSitemap(
  blogPosts: Array<{ slug: string; updated_at: string }>,
): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
  for (const b of blogPosts) {
    xml += `  <url>
    <loc>${SITE_URL}/journaal/${b.slug}</loc>
    <lastmod>${b.updated_at.split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  }
  xml += `</urlset>`;
  return xml;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "index";

  try {
    const now = new Date().toISOString().split("T")[0];

    if (type === "index") {
      return new Response(buildSitemapIndex(now), {
        headers: { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
      });
    }

    if (type === "pages") {
      return new Response(buildPagesSitemap(now), {
        headers: { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
      });
    }

    if (type === "steden" || type === "woningen") {
      const pageSize = 1000;
      let from = 0;
      const allProperties: Array<{ slug: string | null; id: string; city: string; updated_at: string; listing_type: string; property_type: string; neighborhood: string | null }> = [];
      while (true) {
        const { data, error } = await supabase
          .from("properties")
          .select("slug, id, city, updated_at, listing_type, property_type, neighborhood, postal_code")
          .eq("status", "actief")
          .order("updated_at", { ascending: false })
          .range(from, from + pageSize - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        allProperties.push(...data);
        if (data.length < pageSize) break;
        from += pageSize;
      }

      if (type === "steden") {
        // Fetch popular search queries (count >= 3) to add extra filtered URLs
        const { data: searchQueries } = await supabase
          .from("search_queries")
          .select("city, listing_type, property_type, max_price, min_bedrooms, count")
          .gte("count", 3)
          .not("city", "is", null)
          .order("count", { ascending: false })
          .limit(500);

        // Fetch unique 4-digit postcodes from active properties
        const postcodeSet = new Set<string>();
        for (const p of allProperties as any[]) {
          const pc = (p.postal_code || "").toString().trim().slice(0, 4);
          if (/^\d{4}$/.test(pc)) postcodeSet.add(pc);
        }

        // Fetch existing city guides for sitemap inclusion
        const { data: cityGuides } = await supabase
          .from("city_guides")
          .select("city_slug, updated_at");

        return new Response(
          buildCitiesSitemap(
            allProperties,
            searchQueries || [],
            cityGuides || [],
            Array.from(postcodeSet).sort(),
          ),
          {
          headers: { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
          },
        );
      }

      return new Response(buildPropertiesSitemap(allProperties), {
        headers: { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
      });
    }

    if (type === "blog") {
      const { data: blogPosts, error } = await supabase
        .from("blog_posts")
        .select("slug, updated_at")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      if (error) throw error;

      return new Response(buildBlogSitemap(blogPosts || []), {
        headers: { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
      });
    }

    return new Response(buildSitemapIndex(now), {
      headers: { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
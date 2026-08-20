import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SITE_URL = "https://www.woonaanbod-nl.nl";

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
    { loc: "/woonradar", changefreq: "monthly", priority: "0.6" },
    { loc: "/vragen", changefreq: "monthly", priority: "0.5" },
    { loc: "/woordenboek", changefreq: "monthly", priority: "0.7" },
    { loc: "/transparantie", changefreq: "monthly", priority: "0.4" },
    { loc: "/budgetcheck", changefreq: "monthly", priority: "0.5" },
    { loc: "/verhuischecklist", changefreq: "monthly", priority: "0.8" },
    { loc: "/energie", changefreq: "monthly", priority: "0.7" },
    { loc: "/nieuwbouw", changefreq: "weekly", priority: "0.7" },
    { loc: "/hypotheek-berekenen", changefreq: "monthly", priority: "0.7" },
    { loc: "/woz-waarde", changefreq: "monthly", priority: "0.6" },
    { loc: "/internet", changefreq: "monthly", priority: "0.7" },
    { loc: "/verhuisservice", changefreq: "monthly", priority: "0.7" },
    { loc: "/verhuiskosten", changefreq: "monthly", priority: "0.8" },
    { loc: "/sociale-huur-wachttijd", changefreq: "weekly", priority: "0.8" },
    { loc: "/huurcontract-uitleg", changefreq: "monthly", priority: "0.8" },
    { loc: "/expat-housing", changefreq: "monthly", priority: "0.8" },
  ];

  // 50 long-tail SEO gidsen — sync met src/lib/longtailPages.ts
  const LONGTAIL_SLUGS = [
    "huurwoning-amsterdam-met-balkon","huurwoning-amsterdam-met-tuin","gemeubileerd-huren-amsterdam","expat-rental-amsterdam","starterswoning-amsterdam",
    "betaalbaar-huren-rotterdam","huurwoning-rotterdam-met-tuin","starterswoning-rotterdam","loft-huren-rotterdam","penthouse-rotterdam-kopen",
    "studentenkamer-utrecht","betaalbaar-huren-utrecht","starterswoning-utrecht","huurwoning-utrecht-met-balkon",
    "huurwoning-den-haag-met-tuin","expat-rental-the-hague","huren-scheveningen-zeezicht","starterswoning-den-haag",
    "expat-rental-eindhoven","huurwoning-eindhoven-met-balkon","starterswoning-eindhoven",
    "studentenkamer-groningen","huis-kopen-onder-300000-groningen","betaalbaar-huren-groningen",
    "studentenkamer-nijmegen","huurwoning-nijmegen-met-tuin",
    "huurwoning-arnhem-met-balkon","betaalbaar-huren-arnhem","studentenkamer-tilburg",
    "huurwoning-breda-met-tuin","betaalbaar-huren-breda","huurwoning-haarlem-met-tuin","betaalbaar-huren-haarlem",
    "studentenwoning-leiden","huurwoning-maastricht-met-tuin","betaalbaar-huren-maastricht",
    "huurwoning-almere-met-tuin","starterswoning-almere","huurwoning-zwolle-met-tuin",
    "huurwoning-amersfoort-met-balkon","betaalbaar-huren-zaanstad","huurwoning-leeuwarden-met-tuin","betaalbaar-huren-enschede",
    "studentenkamer-delft","huurwoning-amstelveen","huurwoning-rijswijk","huurwoning-zoetermeer",
    "huurwoning-apeldoorn-met-tuin","huurwoning-deventer-met-tuin","huurwoning-hilversum",
    "huurwoning-groningen-met-tuin","eengezinswoning-amstelveen-huren","huurwoning-dordrecht-met-tuin","huurwoning-alkmaar-met-tuin","huurwoning-helmond",
  ];
  for (const slug of LONGTAIL_SLUGS) {
    staticPages.push({ loc: `/gids/${slug}`, changefreq: "weekly", priority: "0.7" });
  }


  // Programmatic "verhuizen van X naar Y" — top NL cities, both directions.
  const TOP = ["amsterdam","rotterdam","utrecht","den-haag","eindhoven","groningen","tilburg","almere","breda","nijmegen","haarlem","arnhem","zwolle","leiden","maastricht"];
  for (const a of TOP) {
    for (const b of TOP) {
      if (a === b) continue;
      staticPages.push({ loc: `/verhuizen/${a}/${b}`, changefreq: "monthly", priority: "0.5" });
      staticPages.push({ loc: `/duel/${a}-vs-${b}`, changefreq: "monthly", priority: "0.5" });
    }
  }

  let xml = URLSET_OPEN;
  for (const page of staticPages) {
    xml += urlEntry(page.loc, now, page.changefreq, page.priority);
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

  let xml = URLSET_OPEN;
  for (const [citySlug, lastMod] of cityMap) {
    const date = lastMod.split("T")[0];
    xml += urlEntry(`/stad/${citySlug}`, date, "daily", "0.8");
    xml += urlEntry(`/energie/${citySlug}`, date, "monthly", "0.6");
    xml += urlEntry(`/nieuwbouw/${citySlug}`, date, "weekly", "0.6");
    xml += urlEntry(`/studenten/${citySlug}`, date, "weekly", "0.6");
    xml += urlEntry(`/woz-waarde/${citySlug}`, date, "monthly", "0.6");
    xml += urlEntry(`/verhuisservice/${citySlug}`, date, "monthly", "0.6");
    // Feature-based filter landings (text-match)
    for (const feat of ["met-tuin", "met-balkon", "gemeubileerd", "huisdieren-toegestaan"]) {
      xml += urlEntry(`/aanbod-in/${citySlug}/${feat}`, date, "weekly", "0.5");
    }
    // Verhuizen-naar gids per stad
    xml += urlEntry(`/stadsgids/${citySlug}`, date, "monthly", "0.6");
    // Best-of listicle pages per city
    for (const slug of ["goedkoop-huur", "grootste-huur", "buurten"]) {
      xml += urlEntry(`/toplijst/${citySlug}/${slug}`, date, "weekly", "0.6");
    }
    // Budget landingspagina's per stad (huur en koop)
    for (const budget of [750, 1000, 1250, 1500, 2000, 2500]) {
      xml += urlEntry(`/budget-huur/${budget}/${citySlug}`, date, "weekly", "0.6");
    }
    for (const budget of [200000, 300000, 400000, 500000, 750000, 1000000]) {
      xml += urlEntry(`/budget-koop/${budget}/${citySlug}`, date, "weekly", "0.6");
    }
    // Inkomen-landingspagina's per stad (3x huur regel)
    for (const income of [2000, 2500, 3000, 3500, 4000, 4500, 5000, 6000]) {
      xml += urlEntry(`/inkomen/${income}/${citySlug}`, date, "weekly", "0.6");
    }
    xml += urlEntry(`/huren/${citySlug}`, date, "daily", "0.7");
    xml += urlEntry(`/kopen/${citySlug}`, date, "daily", "0.7");
    for (const pt of propertyTypeSlugs) {
      if (cityTypeSet.has(`${citySlug}:${pt.type}`)) {
        xml += urlEntry(`/${pt.slug}/${citySlug}`, date, "daily", "0.6");
        // Combination: property type + price filter
        for (const price of [750, 1000, 1250, 1500, 2000]) {
          xml += urlEntry(`/${pt.slug}/${citySlug}/onder-${price}`, date, "daily", "0.5");
        }
        // Combination: property type + bedroom filter
        for (const beds of [1, 2, 3, 4]) {
          xml += urlEntry(`/${pt.slug}/${citySlug}/${beds}-kamers`, date, "daily", "0.5");
        }
      }
    }
    // Listing type + price/bedroom combos
    for (const lt of [{ slug: "huren" }, { slug: "kopen" }]) {
      for (const price of [750, 1000, 1250, 1500, 2000]) {
        xml += urlEntry(`/${lt.slug}/${citySlug}/onder-${price}`, date, "daily", "0.5");
      }
      for (const beds of [1, 2, 3, 4]) {
        xml += urlEntry(`/${lt.slug}/${citySlug}/${beds}-kamers`, date, "daily", "0.5");
      }
    }
    // Generic price/bedroom filters (no type/listing prefix)
    for (const price of [750, 1000, 1250, 1500, 2000]) {
      xml += urlEntry(`/aanbod-in/${citySlug}/onder-${price}`, date, "daily", "0.5");
    }
    for (const beds of [1, 2, 3, 4]) {
      xml += urlEntry(`/aanbod-in/${citySlug}/${beds}-kamers`, date, "daily", "0.5");
    }
    xml += urlEntry(`/vandaag/${citySlug}`, date, "daily", "0.6");
    xml += urlEntry(`/markt/${citySlug}`, date, "daily", "0.7");
    xml += urlEntry(`/huurprijs-index/${citySlug}`, date, "monthly", "0.7");
    xml += urlEntry(`/heatmap/${citySlug}`, date, "weekly", "0.6");
    xml += urlEntry(`/cijfers/${citySlug}`, date, "weekly", "0.6");
    const neighborhoods = cityNeighborhoods.get(citySlug);
    if (neighborhoods) {
      let count = 0;
      for (const nhSlug of neighborhoods) {
        if (count >= 20) break;
        xml += urlEntry(`/buurt/${citySlug}/${nhSlug}`, date, "weekly", "0.5");
        count++;
      }
    }
  }

  // Add extra URLs from popular search queries
  const today = new Date().toISOString().split("T")[0];
  for (const loc of extraUrls) {
    // extraUrls already include SITE_URL prefix; convert back to path for urlEntry
    const path = loc.startsWith(SITE_URL) ? loc.slice(SITE_URL.length) : loc;
    xml += urlEntry(path, today, "daily", "0.5");
  }

  // Postcode landingspagina's (uniek 4-cijferig)
  for (const pc of postcodes) {
    xml += urlEntry(`/postcode/${pc}`, today, "weekly", "0.5");
  }

  xml += `</urlset>`;
  return xml;
}

function buildPropertiesSitemap(
  properties: Array<{ slug: string | null; id: string; updated_at: string }>,
): string {
  let xml = URLSET_OPEN;
  for (const p of properties) {
    xml += urlEntry(`/aanbod/${p.slug || p.id}`, p.updated_at.split("T")[0], "weekly", "0.6");
  }
  xml += `</urlset>`;
  return xml;
}

function buildBlogSitemap(
  blogPosts: Array<{ slug: string; updated_at: string }>,
): string {
  let xml = URLSET_OPEN;
  for (const b of blogPosts) {
    xml += urlEntry(`/journaal/${b.slug}`, b.updated_at.split("T")[0], "monthly", "0.7");
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
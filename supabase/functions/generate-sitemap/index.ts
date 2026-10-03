import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { propertyPath } from "../_shared/propertyUrl.ts";

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

const FN_URL = "https://kppotnzwhxkflceiscto.supabase.co/functions/v1/generate-sitemap";
function buildSitemapIndex(lastmod: string, live = false): string {
  if (live) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${["pages", "steden", "woningen"].map((t) => `  <sitemap>
    <loc>${FN_URL}?type=${t}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`).join("\n")}
</sitemapindex>`;
  }
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
</sitemapindex>`;
}

function buildPagesSitemap(now: string, blogSlugs: string[] = [], agencySlugs: string[] = [], pressSlugs: string[] = []): string {
  const staticPages = [
    { loc: "/voor-makelaars", changefreq: "weekly", priority: "0.7" },
    { loc: "/makelaars", changefreq: "daily", priority: "0.6" },
    ...agencySlugs.map((s) => ({ loc: `/makelaars/${s}`, changefreq: "daily", priority: "0.6" })),
    { loc: "/pers", changefreq: "weekly", priority: "0.7" },
    ...pressSlugs.map((s) => ({ loc: `/pers/${s}`, changefreq: "yearly", priority: "0.6" })),
    { loc: "/", changefreq: "daily", priority: "1.0" },
    { loc: "/blog", changefreq: "daily", priority: "0.8" },

    { loc: "/woning-zoeken", changefreq: "daily", priority: "0.9" },
    { loc: "/woonaanbod-per-stad", changefreq: "daily", priority: "0.8" },
    { loc: "/op-kaart", changefreq: "daily", priority: "0.7" },
    { loc: "/vandaag", changefreq: "daily", priority: "0.8" },
    { loc: "/woningmarkt", changefreq: "daily", priority: "0.9" },
    { loc: "/woningmarkt/huurprijzen-nederland", changefreq: "daily", priority: "0.8" },
    { loc: "/woningmarkt/huurprijzen-per-gemeente", changefreq: "daily", priority: "0.8" },
    { loc: "/woningmarkt/koopprijzen-per-gemeente", changefreq: "daily", priority: "0.8" },
    { loc: "/woningmarkt/nieuw-woningaanbod-per-week", changefreq: "daily", priority: "0.8" },
    { loc: "/woningmarkt/meeste-huurwoningen-per-stad", changefreq: "daily", priority: "0.8" },
    { loc: "/woningmarkt/betaalbaarste-steden-voor-huurders", changefreq: "daily", priority: "0.8" },
    { loc: "/woningmarkt/huurwoningen-onder-1500-euro", changefreq: "daily", priority: "0.8" },
    { loc: "/woningmarkt/koopwoningen-onder-400000-euro", changefreq: "daily", priority: "0.8" },
    { loc: "/woningmarkt/nieuwbouw-per-provincie", changefreq: "daily", priority: "0.8" },
    { loc: "/huurwoningen", changefreq: "daily", priority: "0.8" },
    { loc: "/koopwoningen", changefreq: "daily", priority: "0.8" },
    { loc: "/appartement-huren", changefreq: "daily", priority: "0.7" },
    { loc: "/huis-huren", changefreq: "daily", priority: "0.7" },
    { loc: "/studio-huren", changefreq: "daily", priority: "0.7" },
    { loc: "/kamer-huren", changefreq: "daily", priority: "0.7" },
    { loc: "/plaatsen-start", changefreq: "weekly", priority: "0.7" },
    { loc: "/woonmelding", changefreq: "monthly", priority: "0.6" },
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

  for (const slug of blogSlugs) {
    staticPages.push({ loc: `/blog/${slug}`, changefreq: "monthly", priority: "0.7" });
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
  properties: Array<{ city: string; updated_at: string; listing_type: string; property_type: string; neighborhood: string | null; price?: number | null; bedrooms?: number | null }>,
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
    { slug: "appartement-huren", type: "appartement" },
    { slug: "huis-huren", type: "huis" },
    { slug: "studio-huren", type: "studio" },
    { slug: "kamer-huren", type: "kamer" },
  ];

  const cityTypeSet = new Set<string>();
  // Indexeerbaarheidsregel: filterpagina alleen in sitemap bij >= MIN_LISTINGS aanbod.
  const MIN_LISTINGS = 6;
  const counts = new Map<string, number>();
  const inc = (k: string) => counts.set(k, (counts.get(k) || 0) + 1);
  for (const p of properties) {
    const cs = p.city.trim().toLowerCase().replace(/\s+/g, "-");
    const lt = p.listing_type === "koop" ? "koopwoningen" : "huurwoningen";
    inc(`${lt}:${cs}`);
    if (lt === "huurwoningen") inc(`${lt}:${cs}:${p.property_type}`);
    const price = Number(p.price || 0);
    const priceSteps = lt === "huurwoningen" ? [1000, 1250, 1500, 2000] : [300000, 400000, 500000];
    for (const step of priceSteps) if (price > 0 && price <= step) inc(`${lt}:${cs}:onder-${step}`);
    const beds = Number(p.bedrooms || 0);
    for (const b of [1, 2, 3]) if (beds >= b) inc(`${lt}:${cs}:${b}-slaapkamers`);
  }
  const has = (k: string) => (counts.get(k) || 0) >= MIN_LISTINGS;
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

  let xml = URLSET_OPEN;
  for (const [citySlug, lastMod] of cityMap) {
    const date = lastMod.split("T")[0];
    xml += urlEntry(`/stad/${citySlug}`, date, "daily", "0.8");
    xml += urlEntry(`/energie/${citySlug}`, date, "monthly", "0.6");
    xml += urlEntry(`/nieuwbouw/${citySlug}`, date, "weekly", "0.6");
    xml += urlEntry(`/studenten/${citySlug}`, date, "weekly", "0.6");
    xml += urlEntry(`/woz-waarde/${citySlug}`, date, "monthly", "0.6");
    xml += urlEntry(`/verhuisservice/${citySlug}`, date, "monthly", "0.6");
    // Verhuizen-naar gids per stad
    xml += urlEntry(`/stadsgids/${citySlug}`, date, "monthly", "0.6");
    // Best-of listicle pages per city
    for (const slug of ["goedkoop-huur", "grootste-huur", "buurten"]) {
      xml += urlEntry(`/toplijst/${citySlug}/${slug}`, date, "weekly", "0.6");
    }
    // Inkomen-landingspagina's per stad (3x huur regel)
    for (const income of [2000, 2500, 3000, 3500, 4000, 4500, 5000, 6000]) {
      xml += urlEntry(`/inkomen/${income}/${citySlug}`, date, "weekly", "0.6");
    }
    // Canonieke aanbodstructuur: /huurwoningen/{stad}/{filter}, alleen bij genoeg aanbod.
    for (const lt of ["huurwoningen", "koopwoningen"]) {
      if (!has(`${lt}:${citySlug}`)) continue;
      xml += urlEntry(`/${lt}/${citySlug}`, date, "daily", "0.8");
      const filters = lt === "huurwoningen"
        ? ["appartement", "huis", "studio", "kamer", "onder-1000", "onder-1250", "onder-1500", "onder-2000", "1-slaapkamers", "2-slaapkamers", "3-slaapkamers"]
        : ["onder-300000", "onder-400000", "onder-500000", "1-slaapkamers", "2-slaapkamers", "3-slaapkamers"];
      for (const f of filters) {
        if (has(`${lt}:${citySlug}:${f}`)) xml += urlEntry(`/${lt}/${citySlug}/${f}`, date, "daily", "0.6");
      }
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

  const today = new Date().toISOString().split("T")[0];
  // Postcode landingspagina's (uniek 4-cijferig)
  for (const pc of postcodes) {
    xml += urlEntry(`/postcode/${pc}`, today, "weekly", "0.5");
  }

  xml += `</urlset>`;
  return xml;
}

function buildPropertiesSitemap(
  properties: Array<{
    slug: string | null;
    address_slug?: string | null;
    id: string;
    city: string;
    listing_type: string;
    updated_at: string;
  }>,
): string {
  let xml = URLSET_OPEN;
  for (const p of properties) {
    xml += urlEntry(propertyPath(p), p.updated_at.split("T")[0], "weekly", "0.6");
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

    if (type === "index" || type === "live") {
      return new Response(buildSitemapIndex(now, type === "live"), {
        headers: { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
      });
    }

    if (type === "pages") {
      const { data: blogRows } = await supabase
        .from("blog_posts")
        .select("slug")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(1000);
      const blogSlugs = (blogRows || []).map((r: { slug: string }) => r.slug).filter(Boolean);
      const { data: agencyRows } = await supabase.from("agencies").select("slug").eq("is_visible", true).limit(5000);
      const agencySlugs = (agencyRows || []).map((r: { slug: string }) => r.slug);
      const { data: pressRows } = await supabase.from("press_releases").select("slug").eq("status", "published").limit(5000);
      const pressSlugs = (pressRows || []).map((r: { slug: string }) => r.slug);
      return new Response(buildPagesSitemap(now, blogSlugs, agencySlugs, pressSlugs), {
        headers: { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
      });
    }


    if (type === "steden" || type === "woningen") {
      const pageSize = 1000;
      let from = 0;
      const allProperties: Array<{ slug: string | null; address_slug?: string | null; id: string; city: string; updated_at: string; listing_type: string; property_type: string; neighborhood: string | null }> = [];
      while (true) {
        const { data, error } = await supabase
          .from("properties")
          .select("slug, address_slug, id, city, updated_at, listing_type, property_type, neighborhood, postal_code, price, bedrooms")
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
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { propertyPath } from "../_shared/propertyUrl.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

import { SITE_URL, URLSET_OPEN, urlEntry, isTemplateCityPath, repairSitemap, type SitemapRental } from "../_shared/sitemapPolicy.ts";

const FN_URL = "https://kppotnzwhxkflceiscto.supabase.co/functions/v1/generate-sitemap";
function buildSitemapIndex(lastmod: string, live = false): string {
  if (live) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${["pages", "steden", "woningen"].map((t) => `  <sitemap>
    <loc>${FN_URL}?type=${t}</loc>
  </sitemap>`).join("\n")}
</sitemapindex>`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap-pages.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-steden.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-woningen.xml</loc>
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
    { loc: "/huurprijs-check", changefreq: "monthly", priority: "0.7" },
    { loc: "/borg-terugvorderen", changefreq: "monthly", priority: "0.7" },
    { loc: "/makelaars/claim", changefreq: "monthly", priority: "0.4" },
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
    { loc: "/particulier-huren", changefreq: "weekly", priority: "0.8" },
    { loc: "/vrije-sector-huur", changefreq: "weekly", priority: "0.8" },
    { loc: "/tijdelijke-woonruimte", changefreq: "weekly", priority: "0.8" },
    { loc: "/urgentie-aanvragen", changefreq: "weekly", priority: "0.8" },
    { loc: "/scheiden-geen-woning", changefreq: "weekly", priority: "0.8" },
    { loc: "/gemeubileerd-huren", changefreq: "weekly", priority: "0.8" },
    { loc: "/antikraak-wonen", changefreq: "weekly", priority: "0.8" },
    { loc: "/permanent-wonen-recreatiewoning", changefreq: "weekly", priority: "0.8" },
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
    if (isTemplateCityPath(page.loc)) continue;
    xml += urlEntry(page.loc, undefined, page.changefreq, page.priority);
  }
  xml += `</urlset>`;
  return xml;
}

function buildCitiesSitemap(
  properties: Array<{ city: string; updated_at: string; listing_type: string; property_type: string; neighborhood: string | null; price?: number | null; bedrooms?: number | null }>,
  searchQueries: Array<{ city: string; listing_type: string | null; property_type: string | null; max_price: number | null; min_bedrooms: number | null; count: number }> = [],
  cityGuides: Array<{ city_slug: string; updated_at: string }> = [],
  postcodes: string[] = [],
  hubSnapshotDates: Record<string, string> = {},
): string {
  const rentals: SitemapRental[] = properties.filter(p => p.listing_type === "huur").map(p => ({ ...p, status: "actief", price: Number(p.price || 0), bedrooms: p.bedrooms ?? null }));
  const cities = [...new Set(rentals.map(row => row.city))];
  // All data destinations share the postbuild selection and threshold policy.
  const dates = Object.values(hubSnapshotDates).sort();
  const snapshotDate = dates.at(-1);
  if (!snapshotDate) throw new Error("Published rental snapshot date unavailable");
  return repairSitemap("", rentals, cities, snapshotDate, "steden");
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

// Only dates belonging to actual HTML snapshots qualify as rental-hub lastmod.
async function readPublishedHubSnapshotDates(): Promise<Record<string, string>> {
  try {
    const response = await fetch(`${SITE_URL}/rental-city-prerender-manifest.json`, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return {};
    const manifest = await response.json();
    if (!Array.isArray(manifest.cities) || !/^\d{4}-\d{2}-\d{2}T/.test(manifest.generatedAt)) return {};
    return Object.fromEntries(manifest.cities.map((slug: string) => [slug, manifest.generatedAt.slice(0, 10)]));
  } catch { return {}; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseKey) return new Response("Data connection unavailable", { status: 500 });
  const supabase = createClient(supabaseUrl, supabaseKey);

  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "index";

  try {
    const now = new Date().toISOString().split("T")[0];

    if (type === "index") {
      const D = "https://www.woonaanbod-nl.nl";
      const files = ["sitemap-pages.xml", "sitemap-steden-1.xml", "sitemap-steden-2.xml", "sitemap-steden-3.xml", "sitemap-woningen.xml"];
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${files.map((f) => `  <sitemap><loc>${D}/${f}</loc></sitemap>`).join("\n")}\n</sitemapindex>\n`;
      return new Response(xml, {
        headers: { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
      });
    }

    if (type === "live") {
      return new Response(buildSitemapIndex(now, true), {
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
            await readPublishedHubSnapshotDates(),
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
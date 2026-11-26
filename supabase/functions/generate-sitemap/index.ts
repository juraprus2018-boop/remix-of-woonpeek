const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SITE_URL = "https://www.woonaanbod-nl.nl";
const destinations: Record<string, string> = {
  index: "/sitemap.xml",
  live: "/sitemap.xml",
  pages: "/sitemap-pages.xml",
  steden: "/sitemap-steden.xml",
  woningen: "/sitemap-woningen.xml",
};

// The website build now owns sitemap generation. Keep this legacy public endpoint as a
// lightweight compatibility redirect, without service-role reads or partial XML responses.
Deno.serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const type = new URL(req.url).searchParams.get("type") || "index";
  const destination = destinations[type] ?? "/sitemap.xml";
  return new Response(null, {
    status: 308,
    headers: {
      ...corsHeaders,
      Location: `${SITE_URL}${destination}`,
      "Cache-Control": "public, max-age=3600",
    },
  });
});

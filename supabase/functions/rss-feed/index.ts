import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE = "https://woonaanbod-nl.nl";

const escapeXml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const { data, error } = await supabase
    .from("properties")
    .select("id, slug, title, description, city, price, listing_type, images, created_at")
    .eq("status", "actief")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return new Response(`Error: ${error.message}`, { status: 500, headers: corsHeaders });
  }

  const items = (data ?? [])
    .map((p) => {
      const link = `${BASE}/aanbod/${p.slug ?? p.id}`;
      const desc = p.description?.slice(0, 400) ?? p.title;
      const img = p.images?.[0];
      const price = new Intl.NumberFormat("nl-NL", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
      }).format(Number(p.price));
      return `
    <item>
      <title>${escapeXml(`${p.title} - ${price}${p.listing_type === "huur" ? "/mnd" : ""}`)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(p.created_at).toUTCString()}</pubDate>
      <description>${escapeXml(`${desc} (${p.city})`)}</description>
      ${img ? `<enclosure url="${escapeXml(img)}" type="image/jpeg" />` : ""}
      <category>${escapeXml(p.city)}</category>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Woonaanbod NL - Nieuwste woningen</title>
    <link>${BASE}</link>
    <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml" />
    <description>De 50 nieuwste huur- en koopwoningen op Woonaanbod NL</description>
    <language>nl-NL</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=900",
    },
  });
});

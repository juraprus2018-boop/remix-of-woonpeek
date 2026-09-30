// Geeft het (publieke) Google Analytics meet-ID terug aan de browser.
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const raw = (Deno.env.get("GOOGLE_ANALYTICS_MEASUREMENT_ID") ?? "").trim();
  const match = raw.match(/G-[A-Z0-9]+/i);
  return new Response(JSON.stringify({ id: match ? match[0].toUpperCase() : null }), {
    headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "public, max-age=3600" },
  });
});

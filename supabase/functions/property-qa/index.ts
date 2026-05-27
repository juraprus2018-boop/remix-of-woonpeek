const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { question, property } = await req.json();
    if (!question || typeof question !== "string" || question.length > 500) {
      return new Response(JSON.stringify({ error: "Vraag is verplicht (max 500 tekens)." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!property || typeof property !== "object") {
      return new Response(JSON.stringify({ error: "Woning ontbreekt." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY niet geconfigureerd");

    const facts = [
      `Titel: ${property.title}`,
      `Adres: ${property.street} ${property.house_number}, ${property.postal_code} ${property.city}`,
      property.neighborhood ? `Buurt: ${property.neighborhood}` : null,
      `Type: ${property.property_type} (${property.listing_type})`,
      `Prijs: €${property.price}${property.listing_type === "huur" ? "/mnd" : ""}`,
      property.surface_area ? `Oppervlakte: ${property.surface_area} m²` : null,
      property.bedrooms ? `Slaapkamers: ${property.bedrooms}` : null,
      property.bathrooms ? `Badkamers: ${property.bathrooms}` : null,
      property.energy_label ? `Energielabel: ${property.energy_label}` : null,
      property.build_year ? `Bouwjaar: ${property.build_year}` : null,
      property.description ? `Beschrijving: ${String(property.description).slice(0, 1500)}` : null,
    ].filter(Boolean).join("\n");

    const systemPrompt = `Je bent een behulpzame Nederlandse woonassistent. Beantwoord vragen over een specifieke woning op basis van de feiten hieronder. Wees beknopt (max 4 zinnen), eerlijk en geef aan wanneer iets niet uit de gegevens blijkt. Spreek de gebruiker aan met je/jij. Gebruik geen em-dashes.

WONINGGEGEVENS:
${facts}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "429: rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "402: payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const answer = data?.choices?.[0]?.message?.content || "Geen antwoord beschikbaar.";

    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("property-qa error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string" || text.length < 100) {
      return new Response(JSON.stringify({ error: "Onvoldoende tekst uit contract" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const truncated = text.slice(0, 30000);

    const systemPrompt = `Je bent een Nederlandse huurrecht-expert. Analyseer een huurcontract en geef een gestructureerde risico-analyse volgens Nederlands huurrecht (Boek 7 BW, Wet goed verhuurderschap, Wet betaalbare huur, puntenstelsel WWS).

Beoordeel op:
- Onredelijke bepalingen (boetes, opzegtermijnen, servicekosten)
- Verboden bedingen (bemiddelingskosten, dubbele courtage)
- Huurprijs (vrije sector vs sociaal vs middenhuur)
- Borg (max 2 maanden huur)
- Opzegtermijn (huurder: 1 maand, verhuurder: 3-6 maanden)
- Onderhoudsverdeling (klein vs groot)
- Indexering / huurverhoging
- Servicekosten transparantie

Antwoord ALTIJD in JSON met deze structuur:
{
  "score": 0-100,
  "scoreLabel": "Veilig" | "Aandachtspunten" | "Risicovol",
  "summary": "korte samenvatting van 2 zinnen",
  "findings": [
    {
      "severity": "high" | "medium" | "low" | "info",
      "title": "korte titel",
      "description": "uitleg in 1-2 zinnen",
      "law": "verwijzing naar wetsartikel indien van toepassing"
    }
  ],
  "recommendations": ["concrete actie 1", "concrete actie 2"]
}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyseer dit huurcontract:\n\n${truncated}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI error", aiRes.status, errText);
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Te veel verzoeken, probeer over een minuut opnieuw." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI-tegoed op. Neem contact op met de beheerder." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI-analyse mislukt" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { score: 50, scoreLabel: "Aandachtspunten", summary: content.slice(0, 200), findings: [], recommendations: [] };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("analyze-contract error", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

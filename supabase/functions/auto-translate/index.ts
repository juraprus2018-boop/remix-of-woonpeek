// Auto-translate edge function — translates batches of Dutch text to en/de/fr.
// Uses public.translations_cache for persistence and Lovable AI Gateway for new strings.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const LANG_NAMES: Record<string, string> = {
  en: "English",
  de: "German",
  fr: "French",
};

async function sha256(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const texts: string[] = Array.isArray(body?.texts) ? body.texts : [];
    const lang: string = String(body?.lang || "");

    if (!LANG_NAMES[lang]) {
      return new Response(JSON.stringify({ error: "invalid lang" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Dedupe, trim, drop empty / numeric-only
    const unique = Array.from(
      new Set(
        texts
          .map((t) => (typeof t === "string" ? t.trim() : ""))
          .filter((t) => t.length > 0 && t.length <= 2000),
      ),
    );

    if (unique.length === 0) {
      return new Response(JSON.stringify({ translations: {} }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const hashes = await Promise.all(unique.map(sha256));
    const hashToText = new Map<string, string>();
    unique.forEach((t, i) => hashToText.set(hashes[i], t));

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Lookup existing cache
    const { data: cached } = await supabase
      .from("translations_cache")
      .select("source_hash, translated_text")
      .eq("lang", lang)
      .in("source_hash", hashes);

    const result: Record<string, string> = {};
    const cachedHashes = new Set<string>();
    for (const row of cached ?? []) {
      const src = hashToText.get(row.source_hash);
      if (src) {
        result[src] = row.translated_text;
        cachedHashes.add(row.source_hash);
      }
    }

    const missing = hashes
      .map((h, i) => ({ h, text: unique[i] }))
      .filter((x) => !cachedHashes.has(x.h));

    if (missing.length > 0) {
      // Translate in chunks of 40 strings to keep prompts manageable
      const CHUNK = 40;
      const toInsert: { source_hash: string; lang: string; source_text: string; translated_text: string }[] = [];

      for (let i = 0; i < missing.length; i += CHUNK) {
        const chunk = missing.slice(i, i + CHUNK);
        const numbered = chunk.map((m, idx) => `${idx + 1}. ${m.text.replace(/\\n/g, " ")}`).join("\n");

        const prompt = `Translate the following Dutch UI strings to ${LANG_NAMES[lang]}.
Rules:
- Return ONLY a JSON array of strings, in the same order, with the same length as the input.
- Preserve placeholders like {{count}}, {city}, %s, <0> exactly.
- Keep proper nouns, brand names, and URLs unchanged.
- Natural, fluent ${LANG_NAMES[lang]}. No quotes around output. No commentary.

Input (${chunk.length} items):
${numbered}`;

        const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "You are a precise translator. Output strict JSON only." },
              { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
          }),
        });

        if (!aiResp.ok) {
          const errText = await aiResp.text();
          console.error("AI gateway error", aiResp.status, errText);
          if (aiResp.status === 429 || aiResp.status === 402) {
            return new Response(JSON.stringify({ error: "ai_unavailable", status: aiResp.status }), {
              status: aiResp.status,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          continue;
        }

        const aiJson = await aiResp.json();
        const raw = aiJson?.choices?.[0]?.message?.content ?? "";

        let arr: string[] = [];
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) arr = parsed;
          else if (Array.isArray(parsed?.translations)) arr = parsed.translations;
          else if (Array.isArray(parsed?.items)) arr = parsed.items;
          else {
            // Try to find any array in the object
            for (const v of Object.values(parsed)) {
              if (Array.isArray(v)) { arr = v as string[]; break; }
            }
          }
        } catch (e) {
          console.error("JSON parse failure", e, raw.slice(0, 500));
          continue;
        }

        for (let j = 0; j < chunk.length; j++) {
          const translated = typeof arr[j] === "string" ? arr[j] : null;
          if (!translated) continue;
          result[chunk[j].text] = translated;
          toInsert.push({
            source_hash: chunk[j].h,
            lang,
            source_text: chunk[j].text,
            translated_text: translated,
          });
        }
      }

      if (toInsert.length > 0) {
        await supabase.from("translations_cache").upsert(toInsert, { onConflict: "source_hash,lang" });
      }
    }

    return new Response(JSON.stringify({ translations: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("auto-translate error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

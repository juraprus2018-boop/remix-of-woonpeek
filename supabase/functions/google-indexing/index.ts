import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { propertyUrl } from "../_shared/propertyUrl.ts";
import { requireAdmin } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const INDEXING_API_URL = "https://indexing.googleapis.com/v3/urlNotifications:publish";
// Indexing API default daily quota is 200 publishes; stay safely under it.
const MAX_SUBMISSIONS = 190;

function base64Url(input: string): string {
  return btoa(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const gate = await requireAdmin(req, corsHeaders);
  if (gate.response) return gate.response;

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const googleServiceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");

    // Fail fast with a clear message when the secret is missing or a placeholder.
    if (
      !googleServiceAccountJson ||
      googleServiceAccountJson.includes("PLACEHOLDE") ||
      !googleServiceAccountJson.trim().startsWith("{")
    ) {
      return new Response(
        JSON.stringify({
          error:
            "GOOGLE_SERVICE_ACCOUNT_JSON ontbreekt of is nog een placeholder. Plaats de JSON-sleutel van een Google Service Account (Indexing API geactiveerd, e-mailadres als eigenaar in Search Console) in de project-secrets.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let serviceAccount: { client_email?: string; private_key?: string };
    try {
      serviceAccount = JSON.parse(googleServiceAccountJson);
    } catch {
      return new Response(
        JSON.stringify({ error: "GOOGLE_SERVICE_ACCOUNT_JSON is geen geldige JSON." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!serviceAccount.client_email || !serviceAccount.private_key) {
      return new Response(
        JSON.stringify({
          error: "Service account JSON mist client_email of private_key.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Properties created OR updated in the last 24 hours (imports refresh updated_at).
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: newProperties, error } = await supabase
      .from("properties")
      .select("id, slug, address_slug, city, listing_type")
      .eq("status", "actief")
      .gte("updated_at", oneDayAgo)
      .not("slug", "is", null)
      .order("updated_at", { ascending: false })
      .limit(200);

    if (error) throw error;

    // Blog posts published in the last 24 hours.
    const { data: newPosts } = await supabase
      .from("blog_posts")
      .select("slug")
      .eq("status", "published")
      .gte("published_at", oneDayAgo)
      .limit(20);

    if ((!newProperties || newProperties.length === 0) && (!newPosts || newPosts.length === 0)) {
      return new Response(
        JSON.stringify({ message: "No new URLs to index", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate JWT for Google API
    const now = Math.floor(Date.now() / 1000);
    const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const claim = base64Url(JSON.stringify({
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/indexing",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    }));

    const pemContent = serviceAccount.private_key
      .replace(/-----BEGIN PRIVATE KEY-----/, "")
      .replace(/-----END PRIVATE KEY-----/, "")
      .replace(/\n/g, "");

    const binaryKey = Uint8Array.from(atob(pemContent), (c: string) => c.charCodeAt(0));

    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      binaryKey,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureInput = new TextEncoder().encode(`${header}.${claim}`);
    const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, signatureInput);
    const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const jwt = `${header}.${claim}.${encodedSignature}`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      throw new Error(`Failed to get access token: ${JSON.stringify(tokenData)}`);
    }

    const accessToken = tokenData.access_token;
    let submitted = 0;
    let errors = 0;
    let quotaHit = false;
    const logEntries: Array<{url: string; url_type: string; status: string; response_status: number | null; response_body: string | null}> = [];

    const submitUrl = async (url: string, urlType: string): Promise<void> => {
      if (quotaHit || submitted >= MAX_SUBMISSIONS) return;
      try {
        const res = await fetch(INDEXING_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ url, type: "URL_UPDATED" }),
        });

        const resBody = await res.text();
        logEntries.push({
          url,
          url_type: urlType,
          status: res.ok ? "submitted" : "error",
          response_status: res.status,
          response_body: resBody.substring(0, 500),
        });

        if (res.ok) {
          submitted++;
        } else {
          console.error(`Failed to index ${url}: ${resBody}`);
          errors++;
          // 403 with quota/permission errors: stop, retrying won't help today.
          if (res.status === 403 || res.status === 429) {
            quotaHit = true;
          }
        }
      } catch (e: any) {
        console.error(`Error indexing ${url}:`, e);
        logEntries.push({
          url,
          url_type: urlType,
          status: "error",
          response_status: null,
          response_body: e?.message?.substring(0, 500) || "Unknown error",
        });
        errors++;
      }

      if (submitted % 50 === 0 && submitted > 0) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    };

    // Submit property URLs
    for (const prop of newProperties || []) {
      await submitUrl(propertyUrl(prop as any), "property");
    }

    // Submit city pages for cities with fresh properties
    const uniqueCities = [...new Set((newProperties || []).map((p) => p.city))];
    for (const city of uniqueCities.slice(0, 20)) {
      const citySlug = city.toLowerCase().replace(/\s+/g, "-");
      await submitUrl(`https://www.woonaanbod-nl.nl/woningen-${citySlug}`, "city");
    }

    // Submit fresh blog posts
    for (const post of newPosts || []) {
      await submitUrl(`https://www.woonaanbod-nl.nl/blog/${post.slug}`, "blog");
    }

    // Batch insert log entries
    if (logEntries.length > 0) {
      const { error: logError } = await supabase
        .from("google_indexing_log")
        .insert(logEntries);
      if (logError) {
        console.error("Failed to insert indexing log:", logError);
      }
    }

    console.log(`Google Indexing: ${submitted} submitted, ${errors} errors, quotaHit=${quotaHit}`);

    return new Response(
      JSON.stringify({
        message: "Indexing complete",
        properties: newProperties?.length ?? 0,
        cities: uniqueCities.length,
        blogPosts: newPosts?.length ?? 0,
        submitted,
        errors,
        quotaHit,
        logged: logEntries.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Google Indexing error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

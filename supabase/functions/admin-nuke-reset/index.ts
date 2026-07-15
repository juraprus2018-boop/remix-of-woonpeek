// Volledige "nuke" reset: verwijdert ALLE content data (properties, blogs,
// scrapers, socials, analytics, leads, chats, favorieten). Behoudt users,
// roles, site-config, city guides/realtors, feeds/tokens, storage buckets.
//
// Alleen admins. Vereist { confirm: "RESET" } in body.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const NIL_UUID = "00000000-0000-0000-0000-000000000000";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  // Auth check via anon client + JWT
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json({ error: "Unauthorized" }, 401);
  }
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: authErr } = await userClient.auth.getUser();
  if (authErr || !userData?.user) return json({ error: "Unauthorized" }, 401);

  const admin = createClient(supabaseUrl, serviceKey);
  const { data: isAdmin } = await admin.rpc("has_role", {
    _user_id: userData.user.id,
    _role: "admin",
  });
  if (!isAdmin) return json({ error: "Forbidden" }, 403);

  // Require explicit confirmation
  let body: { confirm?: string } = {};
  try { body = await req.json(); } catch { /* ignore */ }
  if (body.confirm !== "RESET") {
    return json({ error: "Confirmation required: body must be { confirm: 'RESET' }" }, 400);
  }

  const results: Record<string, { deleted?: number; error?: string }> = {};

  // Helper: delete all rows from a table
  async function nuke(table: string, idCol = "id") {
    try {
      const { data, error } = await admin
        .from(table)
        .delete()
        .neq(idCol, NIL_UUID)
        .select(idCol);
      if (error) throw error;
      results[table] = { deleted: data?.length ?? 0 };
    } catch (e) {
      results[table] = { error: e instanceof Error ? e.message : String(e) };
    }
  }

  // Order matters: children first waar FK's zijn
  // 1. User-generated content op properties
  await nuke("property_comments");
  await nuke("neighborhood_reviews");
  await nuke("favorites");
  await nuke("chat_messages");
  await nuke("conversations");

  // 2. Alerts, leads, subscribers
  await nuke("makelaar_leads");
  await nuke("daily_alert_subscribers");
  await nuke("search_alerts");

  // 3. Analytics
  await nuke("search_queries");
  await nuke("page_views");
  await nuke("google_rank_tracking");
  await nuke("google_indexing_log");
  await nuke("missing_cities_log");
  await nuke("daisycon_clicks");
  await nuke("admin_sent_emails");

  // 4. Socials
  await nuke("facebook_group_posts");
  await nuke("tiktok_posts");

  // 5. Blogs
  await nuke("blog_posts");

  // 6. Scraped + properties
  await nuke("scraped_properties");
  await nuke("scraper_logs");
  await nuke("properties");

  // 7. Reset scraper counters (behoud rijen)
  try {
    const { error } = await admin
      .from("scrapers")
      .update({ properties_found: 0 })
      .gte("properties_found", 0);
    if (error) throw error;
    results["scrapers_reset"] = { deleted: 0 };
  } catch (e) {
    results["scrapers_reset"] = { error: e instanceof Error ? e.message : String(e) };
  }

  return json({ success: true, results }, 200);

  function json(payload: unknown, status = 200) {
    return new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

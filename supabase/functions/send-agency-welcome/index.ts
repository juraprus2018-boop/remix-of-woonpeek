import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { sendTemplateEmail } from "../_shared/transactional-email-templates/send-email.ts";

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

// Sends the agency-signup confirmation to the signed-in owner of their own agency.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: u } = await admin.auth.getUser(token);
    const user = u?.user;
    if (!user?.email) return json({ error: "Unauthorized" }, 401);

    const { data: agency } = await admin
      .from("agencies").select("id, name, slug, feed_type, email")
      .eq("owner_user_id", user.id).order("created_at", { ascending: true }).limit(1).maybeSingle();
    if (!agency) return json({ error: "Geen makelaarsprofiel gevonden" }, 404);

    const result = await sendTemplateEmail("agency-welcome", user.email, {
      templateData: { agencyName: agency.name, slug: agency.slug, feedLinked: agency.feed_type !== "handmatig" },
      idempotencyKey: `agency-welcome-${agency.id}`,
    });
    return json(result);
  } catch (e) {
    console.error("agency welcome error", e);
    return json({ error: "failed" }, 500);
  }
});

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { sendTemplateEmail } from "../_shared/transactional-email-templates/send-email.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: u } = await admin.auth.getUser(token);
    const user = u?.user;
    if (!user?.email) return json({ error: "Unauthorized" }, 401);

    const { data: profile } = await admin
      .from("profiles").select("display_name, welcome_sent_at").eq("user_id", user.id).maybeSingle();
    if (profile?.welcome_sent_at) return json({ skipped: true });

    // Claim first so parallel calls never send twice.
    const { data: claimed } = await admin
      .from("profiles").update({ welcome_sent_at: new Date().toISOString() })
      .eq("user_id", user.id).is("welcome_sent_at", null).select("id");
    if (!claimed?.length) return json({ skipped: true });

    const name = (profile?.display_name || "").trim().slice(0, 60);
    await sendTemplateEmail("welcome", user.email, {
      templateData: { name },
      idempotencyKey: `welcome-${user.id}`,
    });
    return json({ success: true });
  } catch (e) {
    console.error("welcome error", e);
    return json({ error: "failed" }, 500);
  }
});

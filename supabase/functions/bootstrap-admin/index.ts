import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const email = "jura2010@live.nl";
  const password = "Worldlove7@";

  // Check existing
  const { data: list } = await supabase.auth.admin.listUsers();
  let user = list?.users?.find((u) => u.email?.toLowerCase() === email);

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: "Jura" },
    });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    user = data.user!;
  } else {
    await supabase.auth.admin.updateUserById(user.id, { password, email_confirm: true });
  }

  // Ensure admin role
  const { error: roleErr } = await supabase
    .from("user_roles")
    .upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id,role" });

  return new Response(
    JSON.stringify({ success: true, user_id: user.id, email, role_error: roleErr?.message ?? null }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});

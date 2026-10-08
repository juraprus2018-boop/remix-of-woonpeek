import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { sendMail, MAIL_FROM } from "../_shared/smtp.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });

const SITE = "https://www.woonaanbod-nl.nl";

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

    const { data: banner } = await admin
      .from("daisycon_banners").select("click_url")
      .ilike("advertiser_name", "huurzone%").eq("is_active", true).limit(1).maybeSingle();
    const huurzone = banner?.click_url || `${SITE}/huurwoningen`;
    const name = (profile?.display_name || "").replace(/[<>&"]/g, "") || "daar";

    const btn = (href: string, label: string) =>
      `<a href="${href}" style="display:inline-block;background:#173e63;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">${label}</a>`;

    const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;line-height:1.55">
<h2 style="color:#173e63">Welkom bij Woonaanbod NL, ${name}!</h2>
<p>Fijn dat je er bent. Met deze 3 tips vind je sneller een huurwoning:</p>
<h3 style="color:#173e63">1. Reageer direct bij particuliere verhuurders</h3>
<p>Via Huurzone reageer je zonder wachtlijst op woningen van particuliere verhuurders en vraag je meteen een bezichtiging aan.</p>
<p>${btn(huurzone, "Bekijk woningen op Huurzone")}</p>
<p style="font-size:11px;color:#888">Advertentie</p>
<h3 style="color:#173e63">2. Zet een gratis Woonmelding aan</h3>
<p>Krijg een mail zodra er een nieuwe woning in jouw stad verschijnt. Wie snel reageert, maakt meer kans.</p>
<p>${btn(`${SITE}/woonmelding`, "Woonmelding instellen")}</p>
<h3 style="color:#173e63">3. Houd je papieren klaar</h3>
<p>Verhuurders vragen vaak om een kopie ID, je laatste 3 loonstroken, een werkgeversverklaring en soms een verhuurdersverklaring. Heb je ze klaar, dan ben je vaak eerder dan de rest.</p>
<p>${btn(`${SITE}/account`, "Naar mijn dashboard")}</p>
<p>Succes met zoeken!<br/>Team Woonaanbod NL</p></div>`;

    await sendMail({
      from: MAIL_FROM,
      to: user.email,
      subject: "Welkom bij Woonaanbod NL: zo vind je sneller een huurwoning",
      content: "text/html",
      html,
    });
    return json({ success: true });
  } catch (e) {
    console.error("welcome error", e);
    return json({ error: "failed" }, 500);
  }
});

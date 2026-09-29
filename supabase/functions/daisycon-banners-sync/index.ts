import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { requireAdmin } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TOKEN_URL = "https://login.daisycon.com/oauth/access-token";
const CLI_REDIRECT = "https://login.daisycon.com/oauth/cli";
const API = "https://services.daisycon.com";

async function getToken(supabase: any): Promise<string> {
  const { data: row, error } = await supabase
    .from("daisycon_tokens").select("*").order("created_at", { ascending: false }).limit(1).single();
  if (error || !row) throw new Error("Daisycon niet verbonden");
  if (Date.now() < new Date(row.expires_at).getTime() - 120_000) return row.access_token;
  const payload = {
    grant_type: "refresh_token",
    client_id: Deno.env.get("DAISYCON_CLIENT_ID")?.trim(),
    client_secret: Deno.env.get("DAISYCON_CLIENT_SECRET")?.trim() ?? "",
    redirect_uri: CLI_REDIRECT,
    refresh_token: row.refresh_token,
  };
  const send = (secret: string) => fetch(TOKEN_URL, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, client_secret: secret }),
  });
  let res = await send(payload.client_secret);
  if (!res.ok && (await res.clone().text()).includes("invalid_client")) res = await send("");
  if (!res.ok) throw new Error(`Token refresh failed [${res.status}]`);
  const t = await res.json();
  await supabase.from("daisycon_tokens").update({
    access_token: t.access_token, refresh_token: t.refresh_token,
    expires_at: new Date(Date.now() + 29 * 60_000).toISOString(), updated_at: new Date().toISOString(),
  }).eq("id", row.id);
  return t.access_token;
}

const pick = (o: any, keys: string[]) => {
  for (const k of keys) {
    const v = k.split(".").reduce((a: any, p) => (a == null ? a : a[p]), o);
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return null;
};

function normalize(item: any, programId: number, mediaId: number) {
  const id = pick(item, ["id", "material_id", "banner_id"]);
  let image = pick(item, ["image_url", "url", "source", "src", "image", "file_url", "preview_url", "content.url"]);
  const width = Number(pick(item, ["width", "dimensions.width", "size.width"])) || null;
  const height = Number(pick(item, ["height", "dimensions.height", "size.height"])) || null;
  const type = String(pick(item, ["type", "material_type", "mime_type"]) ?? "").toLowerCase();
  if (!id || !image || typeof image !== "string") return null;
  if (image.startsWith("//")) image = "https:" + image;
  if (!/^https?:\/\//.test(image)) return null;
  if (/html|flash|swf|text/.test(type) && !/\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(image)) return null;
  const click = `https://ds1.nl/c/?si=${programId}&li=${id}&wi=${mediaId}&ws=woonaanbod-banner`;
  return {
    program_id: programId, media_id: mediaId, material_id: String(id),
    name: pick(item, ["name", "description", "title"]), width, height,
    image_url: image, click_url: click,
  };
}

async function fetchBanners(token: string, publisherId: string, programId: number, mediaId: number, debug: any[]) {
  const candidates = [
    `${API}/publishers/${publisherId}/material/programs/${programId}/banners?media_id=${mediaId}&page=1&per_page=100`,
    `${API}/publishers/${publisherId}/programs/${programId}/material/banners?media_id=${mediaId}&page=1&per_page=100`,
    `${API}/publishers/${publisherId}/material/banners?program_id=${programId}&media_id=${mediaId}&page=1&per_page=100`,
    `${API}/publishers/${publisherId}/programs/${programId}/media/${mediaId}/material?page=1&per_page=100`,
  ];
  for (const url of candidates) {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } });
    const text = await res.text();
    debug.push({ url: url.replace(publisherId, "PUB"), status: res.status, sample: text.slice(0, 600) });
    if (!res.ok) continue;
    try {
      const json = JSON.parse(text);
      const list = Array.isArray(json) ? json : (json.data ?? json.items ?? json.banners ?? []);
      if (Array.isArray(list)) return list;
    } catch { /* ignore */ }
  }
  return [];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const gate = await requireAdmin(req, corsHeaders);
  if (gate.response) return gate.response;

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const body = await req.json().catch(() => ({}));
    const publisherId = Deno.env.get("DAISYCON_PUBLISHER_ID");
    if (!publisherId) throw new Error("DAISYCON_PUBLISHER_ID ontbreekt");
    const token = await getToken(supabase);

    if (Array.isArray(body.probe)) {
      const out: any[] = [];
      for (const p of body.probe.slice(0, 30)) {
        const r = await fetch(`${API}/publishers/${publisherId}${p}`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } });
        out.push({ p, s: r.status, t: (await r.text()).slice(0, 400) });
      }
      return new Response(JSON.stringify(out), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }


    const { data: feeds } = await supabase.from("daisycon_feeds")
      .select("id, name, program_id, media_id").eq("is_active", true);

    const seen = new Set<string>();
    const report: any[] = [];
    const debug: any[] = [];
    for (const feed of feeds ?? []) {
      const key = `${feed.program_id}-${feed.media_id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const items = await fetchBanners(token, publisherId, feed.program_id, feed.media_id, debug);
      const rows = items.map((i: any) => normalize(i, feed.program_id, feed.media_id)).filter(Boolean)
        .map((r: any) => ({ ...r, feed_id: feed.id, advertiser_name: feed.name, is_active: true, last_seen_at: new Date().toISOString() }));
      if (rows.length) {
        const { error } = await supabase.from("daisycon_banners")
          .upsert(rows, { onConflict: "program_id,media_id,material_id" });
        if (error) console.error("upsert", feed.name, error.message);
      }
      // Deactivate banners no longer offered, only when the API returned a list
      if (items.length) {
        await supabase.from("daisycon_banners").update({ is_active: false })
          .eq("program_id", feed.program_id).eq("media_id", feed.media_id)
          .lt("last_seen_at", new Date(Date.now() - 60 * 60_000).toISOString());
      }
      report.push({ feed: feed.name, found: items.length, saved: rows.length });
    }

    return new Response(JSON.stringify({ success: true, report, ...(body.debug ? { debug } : {}) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

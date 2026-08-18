// Daily job: check favorited properties for price drops / status changes
// and send a digest email per user.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const fmtEUR = (n: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

type UpdateItem = {
  favoriteId: string;
  property: any;
  changeType: "price_drop" | "price_increase" | "status_change";
  oldPrice?: number | null;
  newPrice?: number | null;
  oldStatus?: string | null;
  newStatus?: string | null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    // Fetch all favorites that opted in
    const { data: favorites, error: favErr } = await supabase
      .from("favorites")
      .select("id, user_id, property_id, notify_changes, last_price_seen, last_status_seen, last_notified_at")
      .eq("notify_changes", true);

    if (favErr) throw favErr;
    if (!favorites?.length) {
      return new Response(JSON.stringify({ ok: true, checked: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const propertyIds = [...new Set(favorites.map((f) => f.property_id))];
    const { data: properties } = await supabase
      .from("properties")
      .select("id, title, price, status, slug, city, street, house_number, images, listing_type")
      .in("id", propertyIds);

    const propMap = new Map((properties || []).map((p) => [p.id, p]));

    // Group changes per user
    const perUser = new Map<string, UpdateItem[]>();
    const favUpdates: { id: string; last_price_seen: number; last_status_seen: string; last_notified_at?: string }[] = [];

    for (const fav of favorites) {
      const prop = propMap.get(fav.property_id);
      if (!prop) continue;

      const newPrice = Number(prop.price);
      const newStatus = String(prop.status);
      const oldPrice = fav.last_price_seen != null ? Number(fav.last_price_seen) : null;
      const oldStatus = fav.last_status_seen;

      // First time: just record baseline, no email
      if (oldPrice == null || oldStatus == null) {
        favUpdates.push({
          id: fav.id,
          last_price_seen: newPrice,
          last_status_seen: newStatus,
        });
        continue;
      }

      const changes: UpdateItem[] = [];
      if (newStatus !== oldStatus) {
        changes.push({
          favoriteId: fav.id,
          property: prop,
          changeType: "status_change",
          oldStatus,
          newStatus,
        });
      } else if (newPrice < oldPrice) {
        changes.push({
          favoriteId: fav.id,
          property: prop,
          changeType: "price_drop",
          oldPrice,
          newPrice,
        });
      } else if (newPrice > oldPrice * 1.02) {
        // significant increase
        changes.push({
          favoriteId: fav.id,
          property: prop,
          changeType: "price_increase",
          oldPrice,
          newPrice,
        });
      }

      // Always update baseline snapshot
      favUpdates.push({
        id: fav.id,
        last_price_seen: newPrice,
        last_status_seen: newStatus,
        last_notified_at: changes.length ? new Date().toISOString() : undefined,
      });

      if (changes.length) {
        const arr = perUser.get(fav.user_id) || [];
        arr.push(...changes);
        perUser.set(fav.user_id, arr);
      }
    }

    // Resolve user emails (auth.users) via admin API
    let sent = 0;
    for (const [userId, items] of perUser.entries()) {
      const { data: userInfo } = await supabase.auth.admin.getUserById(userId);
      const email = userInfo?.user?.email;
      if (!email) continue;

      const html = renderDigest(items);
      const subject =
        items.length === 1
          ? `Update voor je opgeslagen woning${items[0].changeType === "price_drop" ? " — prijs verlaagd!" : ""}`
          : `${items.length} updates voor je opgeslagen woningen`;

      const sendRes = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SERVICE_KEY}`,
        },
        body: JSON.stringify({ to: email, subject, html }),
      });
      if (sendRes.ok) sent++;
      else console.error("send-email failed for", email, await sendRes.text());
    }

    // Persist baseline updates
    for (const u of favUpdates) {
      const patch: Record<string, unknown> = {
        last_price_seen: u.last_price_seen,
        last_status_seen: u.last_status_seen,
      };
      if (u.last_notified_at) patch.last_notified_at = u.last_notified_at;
      await supabase.from("favorites").update(patch).eq("id", u.id);
    }

    return new Response(
      JSON.stringify({ ok: true, checked: favorites.length, users_emailed: sent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("notify-favorite-updates error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function renderDigest(items: UpdateItem[]): string {
  const base = "https://www.woonaanbod-nl.nl";
  const rows = items
    .map((it) => {
      const p = it.property;
      const url = `${base}/aanbod/${p.slug || p.id}`;
      const img = p.images?.[0] || "";
      let badge = "";
      let detail = "";
      if (it.changeType === "price_drop") {
        const diff = (it.oldPrice! - it.newPrice!);
        const pct = Math.round((diff / it.oldPrice!) * 100);
        badge = `<span style="background:#16a34a;color:#fff;padding:3px 8px;border-radius:6px;font-size:12px;font-weight:600">PRIJS -${pct}%</span>`;
        detail = `Van <s>${fmtEUR(it.oldPrice!)}</s> naar <strong>${fmtEUR(it.newPrice!)}</strong> (- ${fmtEUR(diff)})`;
      } else if (it.changeType === "price_increase") {
        badge = `<span style="background:#dc2626;color:#fff;padding:3px 8px;border-radius:6px;font-size:12px;font-weight:600">PRIJS GESTEGEN</span>`;
        detail = `Van ${fmtEUR(it.oldPrice!)} naar <strong>${fmtEUR(it.newPrice!)}</strong>`;
      } else {
        badge = `<span style="background:#1f2937;color:#fff;padding:3px 8px;border-radius:6px;font-size:12px;font-weight:600">STATUS GEWIJZIGD</span>`;
        detail = `Status: <strong>${it.newStatus}</strong> (was ${it.oldStatus})`;
      }
      return `
        <tr><td style="padding:14px 0;border-bottom:1px solid #e5e7eb">
          <table width="100%"><tr>
            ${img ? `<td width="120" style="vertical-align:top"><img src="${img}" width="110" style="border-radius:8px;display:block"/></td>` : ""}
            <td style="vertical-align:top;padding-left:${img ? "12px" : "0"}">
              <div style="margin-bottom:6px">${badge}</div>
              <div style="font-size:15px;font-weight:600;color:#0f172a;margin-bottom:4px">${p.title}</div>
              <div style="font-size:13px;color:#64748b;margin-bottom:6px">${p.street} ${p.house_number}, ${p.city}</div>
              <div style="font-size:14px;color:#0f172a;margin-bottom:8px">${detail}</div>
              <a href="${url}" style="display:inline-block;background:#16a34a;color:#fff;padding:8px 14px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:600">Bekijk woning →</a>
            </td>
          </tr></table>
        </td></tr>`;
    })
    .join("");

  return `<!DOCTYPE html><html><body style="font-family:system-ui,-apple-system,sans-serif;background:#f8fafc;padding:20px;margin:0">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;padding:24px">
      <tr><td>
        <h1 style="font-size:20px;color:#0f172a;margin:0 0 6px">Updates voor je opgeslagen woningen</h1>
        <p style="color:#64748b;font-size:14px;margin:0 0 16px">Er zijn wijzigingen in woningen die jij hebt opgeslagen op Woonaanbod NL.</p>
        <table width="100%">${rows}</table>
        <p style="margin-top:24px;font-size:12px;color:#94a3b8">
          Je ontvangt deze e-mail omdat je deze woningen hebt opgeslagen als favoriet.
          <a href="${base}/favorieten" style="color:#16a34a">Beheer meldingen</a>.
        </p>
      </td></tr>
    </table>
  </body></html>`;
}

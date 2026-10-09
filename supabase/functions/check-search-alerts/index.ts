import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { propertyUrl } from "../_shared/propertyUrl.ts";
import { sendMail, MAIL_FROM } from "../_shared/smtp.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendWhatsApp(phoneNumber: string, message: string) {
  const token = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
  const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
  if (!token || !phoneNumberId) {
    console.warn("WhatsApp credentials not configured, skipping WhatsApp notification");
    return false;
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phoneNumber.replace(/[^0-9]/g, ""),
          type: "text",
          text: { body: message },
        }),
      }
    );

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`WhatsApp API error [${res.status}]: ${errBody}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("WhatsApp send error:", err);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let searchAlertNotificationsSent = 0;
    let dailySubscriberNotificationsSent = 0;
    let whatsappNotificationsSent = 0;

    // ─── PART 1: Search alerts (existing logic) ───
    const { data: alerts, error: alertsError } = await supabase
      .from("search_alerts")
      .select("*")
      .eq("is_active", true)
      .eq("email_notifications", true);

    if (alertsError) throw alertsError;

    if (alerts && alerts.length > 0) {
      for (const alert of alerts) {
        const sinceDate = alert.last_notified_at || alert.created_at;

        let query = supabase
          .from("properties")
          .select("id, title, city, price, listing_type, property_type, slug, address_slug, street, house_number, images, surface_area, bedrooms")
          .eq("status", "actief")
          .gt("created_at", sinceDate)
          .order("created_at", { ascending: false })
          .limit(6);

        if (alert.city) query = query.ilike("city", `%${alert.city}%`);
        if (alert.property_type) query = query.eq("property_type", alert.property_type);
        if (alert.listing_type) query = query.eq("listing_type", alert.listing_type);
        if (alert.min_price) query = query.gte("price", alert.min_price);
        if (alert.max_price) query = query.lte("price", alert.max_price);

        const { data: properties } = await query;
        if (!properties || properties.length === 0) continue;

        const { data: userData } = await supabase.auth.admin.getUserById(alert.user_id);
        if (!userData?.user?.email) continue;

        const html = buildEmailHtml(properties, `${properties.length} nieuwe ${properties.length === 1 ? 'woning' : 'woningen'} voor "${alert.name}"`, "Hier zijn de nieuwste resultaten voor jouw zoekalert.", "https://www.woonaanbod-nl.nl/zoeken", null);

        try {
          await sendMail({
            from: MAIL_FROM,
            to: userData.user.email,
            subject: `${properties.length} nieuwe ${properties.length === 1 ? 'woning' : 'woningen'} voor "${alert.name}"`,
            content: "text/html",
            html,
          });
          await supabase.from("search_alerts").update({ last_notified_at: new Date().toISOString() }).eq("id", alert.id);
          searchAlertNotificationsSent++;
        } catch (emailError) {
          console.error(`Failed to send email for alert ${alert.id}:`, emailError);
        }
      }
    }

    // ─── PART 2: Daily alert subscribers (filtered by city) ───
    const { data: dailySubscribers, error: subscribersError } = await supabase
      .from("daily_alert_subscribers")
      .select("*")
      .eq("is_active", true);

    if (subscribersError) throw subscribersError;

    for (const subscriber of dailySubscribers || []) {
      const sinceDate = subscriber.last_notified_at || subscriber.subscribed_at || subscriber.created_at;
      const subscriberCity = subscriber.city;

      const applyFilters = (q: any) => {
        if (subscriberCity) q = q.ilike("city", subscriberCity);
        if (subscriber.listing_type) q = q.eq("listing_type", subscriber.listing_type);
        if (subscriber.property_type) q = q.eq("property_type", subscriber.property_type);
        if (subscriber.min_price) q = q.gte("price", subscriber.min_price);
        if (subscriber.max_price) q = q.lte("price", subscriber.max_price);
        if (subscriber.min_rooms) q = q.gte("bedrooms", subscriber.min_rooms);
        return q;
      };

      // Count new properties matching this subscriber's search
      const { count: filteredCount, error: filteredCountError } = await applyFilters(
        supabase
          .from("properties")
          .select("id", { count: "exact", head: true })
          .eq("status", "actief")
          .gt("created_at", sinceDate)
      );

      if (filteredCountError) {
        console.error("Count error for daily subscriber:", subscriber.email, filteredCountError);
        continue;
      }

      if (!filteredCount || filteredCount === 0) continue;

      // Fetch actual properties
      const { data: latestProperties, error: propsError } = await applyFilters(
        supabase
          .from("properties")
          .select("id, title, city, price, listing_type, property_type, slug, address_slug, street, house_number, images, surface_area, bedrooms")
          .eq("status", "actief")
          .gt("created_at", sinceDate)
          .order("created_at", { ascending: false })
          .limit(6)
      );

      if (propsError) {
        console.error("Properties error for daily subscriber:", subscriber.email, propsError);
        continue;
      }

      if (!latestProperties || latestProperties.length === 0) continue;

      const cityLabel = subscriberCity || "Nederland";
      const searchLabel = subscriber.search_label || `woningaanbod in ${cityLabel}`;
      const unsubscribeUrl = `https://www.woonaanbod-nl.nl/alerts/afmelden/${subscriber.id}`;
      const html = buildEmailHtml(
        latestProperties,
        `Nieuwe woningen te huur in en rondom ${cityLabel}`,
        `Nieuw aanbod voor jouw zoekopdracht: ${searchLabel}.`,
        `https://www.woonaanbod-nl.nl/nieuw-aanbod`,
        unsubscribeUrl,
        filteredCount,
        cityLabel
      );


      // Send email
      try {
        await sendMail({
          from: MAIL_FROM,
          to: subscriber.email,
          subject: alertSubject(cityLabel),
          content: "text/html",
          html,
        });
        dailySubscriberNotificationsSent++;
      } catch (emailError) {
        console.error(`Failed to send daily alert email to ${subscriber.email}:`, emailError);
      }

      // Send WhatsApp if enabled
      if (subscriber.whatsapp_enabled && subscriber.phone_number) {
        const propertyList = latestProperties.slice(0, 3).map((p: any) => {
          const price = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(p.price);
          return `🏠 ${p.title}\n💰 ${price}${p.listing_type === 'huur' ? '/mnd' : ''}\n🔗 ${propertyUrl(p as any)}`;
        }).join("\n\n");

        const whatsappMessage = `🏠 *Woonaanbod NL Alert – ${cityLabel}*\n\n${filteredCount} nieuwe ${filteredCount === 1 ? 'woning' : 'woningen'} gevonden!\n\n${propertyList}\n\n👉 Bekijk alles: https://www.woonaanbod-nl.nl/nieuw-aanbod`;

        const sent = await sendWhatsApp(subscriber.phone_number, whatsappMessage);
        if (sent) whatsappNotificationsSent++;
      }

      // Update last_notified_at
      await supabase
        .from("daily_alert_subscribers")
        .update({ last_notified_at: new Date().toISOString() })
        .eq("id", subscriber.id);
    }


    return new Response(
      JSON.stringify({
        success: true,
        search_alert_notifications_sent: searchAlertNotificationsSent,
        daily_alert_notifications_sent: dailySubscriberNotificationsSent,
        whatsapp_notifications_sent: whatsappNotificationsSent,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Check search alerts error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function esc(v: unknown) {
  return String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function dayPart() {
  const h = Number(new Intl.DateTimeFormat("nl-NL", { hour: "numeric", hour12: false, timeZone: "Europe/Amsterdam" }).format(new Date()));
  if (h < 12) return "Voor de middag";
  if (h < 18) return "Vanmiddag";
  return "Vanavond";
}

export function alertSubject(cityLabel: string) {
  const date = new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", timeZone: "Europe/Amsterdam" }).format(new Date());
  return `${dayPart()}: verse huurvondsten in ${cityLabel} van ${date}`;
}

function buildEmailHtml(
  properties: any[],
  heading: string,
  subheading: string,
  ctaUrl: string,
  unsubscribeUrl: string | null,
  totalCount?: number,
  cityLabel?: string,
) {
  const count = totalCount ?? properties.length;
  const citySlug = cityLabel && cityLabel !== "Nederland" ? cityLabel.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : "";
  const overviewUrl = citySlug ? `https://www.woonaanbod-nl.nl/huurwoningen/${citySlug}` : ctaUrl;
  const fmt = (n: number) => new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(n);
  const typeLabel = (t?: string) => t ? t.charAt(0).toUpperCase() + t.slice(1) : "Woning";

  const rows = properties.map((p) => {
    const url = propertyUrl(p as any);
    const image = p.images?.[0] || "";
    const facts: string[] = [];
    if (p.surface_area) facts.push(`${p.surface_area} m²`);
    if (p.bedrooms) facts.push(`${p.bedrooms} ${p.bedrooms === 1 ? "kamer" : "kamers"}`);
    facts.push(`${fmt(Number(p.price))}${p.listing_type === "huur" ? " p.m." : ""}`);
    return `
      <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>
          <td width="132" style="vertical-align:top;">
            <a href="${url}">${image
              ? `<img src="${esc(image)}" width="120" height="90" alt="${esc(p.title)}" style="display:block;width:120px;height:90px;object-fit:cover;border-radius:8px;" />`
              : `<div style="width:120px;height:90px;background:#e8eef5;border-radius:8px;"></div>`}</a>
          </td>
          <td style="vertical-align:top;">
            <a href="${url}" style="color:#173e63;font-weight:700;font-size:15px;text-decoration:none;">${esc(typeLabel(p.property_type))} in ${esc(p.city)}</a>
            <div style="font-size:13px;color:#475569;margin:3px 0;">${esc([p.street, p.house_number].filter(Boolean).join(" ") || p.title)}</div>
            <div style="font-size:13px;color:#15803d;margin:3px 0;">✅ Beschikbaar</div>
            <div style="font-size:13px;color:#0f172a;font-weight:600;">${facts.join(" • ")}</div>
            <a href="${url}" style="display:inline-block;margin-top:6px;color:#3d7ab8;font-weight:700;font-size:13px;text-decoration:none;">reageren »</a>
          </td>
        </tr></table>
      </td></tr>`;
  }).join("");

  const tips = [
    "Verhuurders krijgen soms tientallen reacties op één woning. Maak daarom meteen duidelijk wie je bent en waarom je interesse hebt.",
    "Stel jezelf kort voor: je leeftijd, je huidige woonsituatie en met wie je wilt gaan wonen.",
    "Vertel hoe je werk eruitziet (loondienst, zzp, thuiswerken) en noem praktische zaken zoals een huisdier of een verhuurdersreferentie.",
    "Leg uit waarom juist deze woning je aanspreekt: de buurt, de indeling of de ligging. Zo zie je er niet uit als een standaardbericht.",
    "Houd het kort. Een paar zinnen over wie je bent, je situatie en waarom deze woning past, is genoeg.",
  ];
  const tipsHtml = tips.map((t, i) => `
    <tr>
      <td width="34" style="vertical-align:top;padding:6px 0;"><div style="width:24px;height:24px;line-height:24px;border-radius:12px;background:#173e63;color:#ffffff;text-align:center;font-size:12px;font-weight:700;">${i + 1}</div></td>
      <td style="vertical-align:top;padding:6px 0;font-size:13px;line-height:1.55;color:#334155;">${t}</td>
    </tr>`).join("");

  return `<!DOCTYPE html><html lang="nl"><body style="margin:0;padding:0;background:#ffffff;">
  <div style="display:none;max-height:0;overflow:hidden;">${esc(subheading)}</div>
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;"><tr><td align="center" style="padding:16px 8px;">
  <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;font-family:Manrope,'Segoe UI',Arial,sans-serif;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
    <tr><td style="background:#173e63;padding:20px 26px;">
      <table cellpadding="0" cellspacing="0" role="presentation"><tr>
        <td><img src="https://www.woonaanbod-nl.nl/icon-192.png" width="38" height="38" alt="Woonaanbod NL" style="display:block;border-radius:8px;" /></td>
        <td style="padding-left:12px;color:#ffffff;font-size:20px;font-family:Sora,Arial,sans-serif;">woonaanbod<span style="font-weight:700;color:#9cc3ea;">-nl.nl</span></td>
      </tr></table>
    </td></tr>

    <tr><td style="padding:26px 26px 6px;">
      <table cellpadding="0" cellspacing="0" role="presentation"><tr>
        <td style="vertical-align:top;padding-right:14px;"><div style="min-width:46px;height:46px;line-height:46px;border-radius:10px;background:#e8a317;color:#173e63;text-align:center;font-size:22px;font-weight:800;">${count}</div></td>
        <td style="vertical-align:top;font-size:16px;line-height:1.5;color:#0f172a;font-weight:600;">Heb je het al gezien? In ${esc(cityLabel || "Nederland")} ${count === 1 ? "staat" : "staan"} ${count} ${count === 1 ? "nieuwe huurwoning" : "nieuwe huurwoningen"} voor je klaar. Zit jouw nieuwe thuis ertussen?</td>
      </tr></table>
      <p style="font-size:14px;line-height:1.6;color:#475569;margin:16px 0 0;">${esc(subheading)} Reageer snel: de beste woningen zijn vaak binnen een dag weg.</p>
    </td></tr>

    <tr><td style="padding:16px 26px 0;">
      <div style="font-family:Sora,Arial,sans-serif;font-size:17px;font-weight:700;color:#173e63;margin-bottom:4px;">${esc(heading)}</div>
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">${rows}</table>
      ${count > properties.length ? `<p style="font-size:13px;color:#64748b;margin:10px 0 0;">...en nog ${count - properties.length} andere woningen.</p>` : ""}
      <p style="text-align:center;margin:22px 0 6px;">
        <a href="${overviewUrl}" style="display:inline-block;background:#173e63;color:#ffffff;text-decoration:none;padding:13px 28px;border-radius:10px;font-weight:700;font-size:15px;">Bekijk al het aanbod in ${esc(cityLabel || "Nederland")} »</a>
      </p>
      <p style="font-size:12px;color:#94a3b8;text-align:center;margin:8px 0 0;">Let op: vragen over woningen kunnen we helaas niet per e-mail beantwoorden.</p>
    </td></tr>

    <tr><td style="padding:22px 26px 0;">
      <div style="background:#f4f7fb;border-radius:12px;padding:18px 20px;">
        <div style="font-size:16px;font-weight:700;color:#173e63;margin-bottom:6px;">🧩 Zoek je iets specifiekers?</div>
        <p style="font-size:13px;line-height:1.6;color:#334155;margin:0 0 12px;">Stel een extra Woonmelding in met jouw plaats, woningtype en maximale huur. Komt er iets binnen dat past, dan hoor je het meteen.</p>
        <a href="https://www.woonaanbod-nl.nl/woonmelding" style="color:#3d7ab8;font-weight:700;font-size:13px;text-decoration:none;">zoekprofiel instellen »</a>
      </div>
    </td></tr>

    <tr><td style="padding:22px 26px 0;">
      <div style="font-size:16px;font-weight:700;color:#173e63;margin-bottom:6px;">Maak van je eerste bericht meer dan een reactie</div>
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">${tipsHtml}</table>
    </td></tr>

    <tr><td style="padding:22px 26px;">
      <div style="border:1px solid #e2e8f0;border-radius:12px;padding:16px 18px;text-align:center;">
        <p style="color:#334155;font-size:13px;line-height:1.6;margin:0 0 10px;">Hoi! Fijn dat je Woonaanbod NL gebruikt bij het zoeken naar een huurwoning. Zou je ons willen helpen met een korte review op Google? Het kost maar een minuutje en helpt andere woningzoekenden ons te vinden.</p>
        <a href="https://g.page/r/CYZL1fpfWpFOEBM/review" style="display:inline-block;background:#e8a317;color:#173e63;text-decoration:none;padding:9px 22px;border-radius:8px;font-weight:700;font-size:13px;">⭐ Laat een Google-review achter</a>
      </div>
    </td></tr>

    <tr><td style="background:#f4f7fb;padding:18px 26px;border-top:1px solid #e2e8f0;text-align:center;font-size:12px;line-height:1.6;color:#64748b;">
      <a href="https://www.woonaanbod-nl.nl/privacy" style="color:#64748b;">Privacybeleid</a> ∙
      <a href="mailto:info@woonaanbod-nl.nl" style="color:#64748b;">Contact</a> ∙
      ${unsubscribeUrl ? `<a href="${unsubscribeUrl}" style="color:#64748b;">Afmelden</a>` : `<a href="https://www.woonaanbod-nl.nl/zoekalerts" style="color:#64748b;">Beheer alerts</a>`} ∙
      <a href="https://www.woonaanbod-nl.nl/voorwaarden" style="color:#64748b;">Algemene voorwaarden</a>
      <br />Je ontvangt deze mail omdat je een Woonmelding hebt ingesteld op Woonaanbod NL.
      <br />© ${new Date().getFullYear()} Woonaanbod NL
    </td></tr>
  </table>
  </td></tr></table>
</body></html>`;
}

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { propertyUrl } from "../_shared/propertyUrl.ts";
import { sendTemplateEmail } from "../_shared/transactional-email-templates/send-email.ts";

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

        try {
          await sendTemplateEmail("alert-digest", userData.user.email, {
            templateData: { ...digestData(properties, properties.length, alert.city || "Nederland", `Nieuwe woningen voor "${alert.name}"`, "Hier zijn de nieuwste resultaten voor jouw zoekalert.", `${properties.length} nieuwe ${properties.length === 1 ? 'woning' : 'woningen'} voor "${alert.name}"`), manageUrl: "https://www.woonaanbod-nl.nl/radarmeldingen" },
            idempotencyKey: `alert-digest-search-${alert.id}-${new Date().toISOString().slice(0, 10)}`,
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
      try {
        await sendTemplateEmail("alert-digest", subscriber.email, {
          templateData: { ...digestData(latestProperties, filteredCount, cityLabel, `Nieuwe woningen te huur in en rondom ${cityLabel}`, `Nieuw aanbod voor jouw zoekopdracht: ${searchLabel}.`, alertSubject(cityLabel)), unsubscribeUrl: `https://www.woonaanbod-nl.nl/alerts/afmelden/${subscriber.id}` },
          idempotencyKey: `alert-digest-daily-${subscriber.id}-${new Date().toISOString().slice(0, 10)}`,
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

function digestData(properties: any[], count: number, city: string, heading: string, intro: string, subject: string) {
  const fmt = (n: number) => new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(n);
  const slug = city !== "Nederland" ? city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : "";
  const homes = properties.map((p) => {
    const facts: string[] = [];
    if (p.surface_area) facts.push(`${p.surface_area} m²`);
    if (p.bedrooms) facts.push(`${p.bedrooms} ${p.bedrooms === 1 ? "kamer" : "kamers"}`);
    facts.push(`${fmt(Number(p.price))}${p.listing_type === "huur" ? " p.m." : ""}`);
    const type = p.property_type ? p.property_type.charAt(0).toUpperCase() + p.property_type.slice(1) : "Woning";
    return { url: propertyUrl(p as any), image: p.images?.[0] || "", title: `${type} in ${p.city}`, address: [p.street, p.house_number].filter(Boolean).join(" ") || p.title, facts: facts.join(" • ") };
  });
  return { city, count, heading, intro, subject, homes, overviewUrl: slug ? `https://www.woonaanbod-nl.nl/huurwoningen/${slug}` : "https://www.woonaanbod-nl.nl/nieuw-aanbod" };
}

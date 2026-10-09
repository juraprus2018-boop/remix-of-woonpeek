import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { sendTemplateEmail } from "../_shared/transactional-email-templates/send-email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { property_id, sender_name, sender_email, sender_phone, message } = await req.json();

    if (!property_id || !sender_name || !sender_email || !message) {
      return new Response(JSON.stringify({ error: "Vul alle verplichte velden in" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sender_email)) {
      return new Response(JSON.stringify({ error: "Ongeldig e-mailadres" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get property details
    const { data: property, error: propError } = await supabase
      .from("properties")
      .select("title, city, street, house_number, user_id")
      .eq("id", property_id)
      .single();

    if (propError || !property) {
      return new Response(JSON.stringify({ error: "Woning niet gevonden" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get owner email
    const { data: ownerData } = await supabase.auth.admin.getUserById(property.user_id);
    const ownerEmail = ownerData?.user?.email;

    if (!ownerEmail) {
      return new Response(JSON.stringify({ error: "Eigenaar niet gevonden" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sanitizedName = sender_name.substring(0, 100).replace(/[<>]/g, "");
    const sanitizedMessage = message.substring(0, 2000).replace(/[<>]/g, "");
    const sanitizedPhone = sender_phone ? sender_phone.substring(0, 20).replace(/[<>]/g, "") : null;

    const submissionId = crypto.randomUUID();
    const data = {
      propertyTitle: property.title,
      address: [property.street, property.house_number].filter(Boolean).join(" ") + (property.city ? `, ${property.city}` : ""),
      senderName: sanitizedName,
      senderEmail: sender_email,
      senderPhone: sanitizedPhone,
      message: sanitizedMessage,
    };
    await sendTemplateEmail("property-contact", ownerEmail, {
      templateData: data, replyTo: sender_email, idempotencyKey: `property-contact-${submissionId}`,
    });
    await sendTemplateEmail("property-contact", "info@woonaanbod-nl.nl", {
      templateData: { ...data, isCopy: true }, replyTo: sender_email, idempotencyKey: `property-contact-copy-${submissionId}`,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Contact email error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

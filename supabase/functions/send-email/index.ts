import { createSmtpClient, closeSmtpQuietly, MAIL_FROM, type SMTPClient } from "../_shared/smtp.ts";
import { isServiceRole } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Public (non service-role) callers may only trigger internal notifications to
// our own inbox. Arbitrary recipients require an internal service-role call.
const INTERNAL_RECIPIENTS = ["info@woonaanbod-nl.nl"];
const MAX_SUBJECT = 300;
const MAX_HTML = 100_000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => null);
    const to = typeof body?.to === "string" ? body.to.trim().toLowerCase() : "";
    const subject = typeof body?.subject === "string" ? body.subject : "";
    const html = typeof body?.html === "string" ? body.html : "";

    if (!to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to) || !subject || !html) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (subject.length > MAX_SUBJECT || html.length > MAX_HTML) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isServiceRole(req) && !INTERNAL_RECIPIENTS.includes(to)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }


    const client = createSmtpClient();

    await client.send({
      from: MAIL_FROM,
      to,
      subject,
      content: "text/html",
      html,
    });

    await client.close();

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("SMTP error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

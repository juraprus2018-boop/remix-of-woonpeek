import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

export const authCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function bearer(req: Request): string | null {
  const header = req.headers.get("Authorization") ?? req.headers.get("authorization");
  if (!header) return null;
  return header.replace(/^Bearer\s+/i, "").trim() || null;
}

/** True when the request is made with the service-role key (internal/cron caller). */
export function isServiceRole(req: Request): boolean {
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceKey) return false;
  const token = bearer(req);
  const apikey = req.headers.get("apikey");
  return token === serviceKey || apikey === serviceKey;
}

/**
 * Verifies the caller is either an internal service-role caller or a signed-in
 * user holding the 'admin' role. Returns a Response to send back when denied,
 * or null when the caller is allowed.
 */
export async function requireAdmin(
  req: Request,
  corsHeaders: Record<string, string> = authCorsHeaders,
): Promise<{ response: Response | null; userId: string | null }> {
  const deny = (status: number, error: string) => ({
    response: new Response(JSON.stringify({ error }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }),
    userId: null,
  });

  if (isServiceRole(req)) return { response: null, userId: null };

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Scheduled (pg_cron) invocations authenticate with a private shared secret.
  const cronSecret = req.headers.get("x-cron-secret");
  if (cronSecret) {
    const { data: valid } = await supabase.rpc("verify_cron_secret", { _secret: cronSecret });
    if (valid === true) return { response: null, userId: null };
  }

  const token = bearer(req);
  if (!token) return deny(401, "Unauthorized");



  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return deny(401, "Unauthorized");

  const { data: isAdmin } = await supabase.rpc("has_role", {
    _user_id: user.id,
    _role: "admin",
  });

  if (!isAdmin) return deny(403, "Forbidden");

  return { response: null, userId: user.id };
}

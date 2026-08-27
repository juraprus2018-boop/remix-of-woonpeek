const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BLOCKED_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^0\./,
  /^169\.254\./,
  /^::1$/i,
  /^fc/i,
  /^fd/i,
];

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=86400, s-maxage=604800",
  "Vary": "Accept",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const requestUrl = new URL(req.url);
    const src = requestUrl.searchParams.get("src")?.trim();

    if (!src) {
      return json({ error: "Missing src parameter" }, 400);
    }

    const targetUrl = new URL(src);
    if (!/^https?:$/i.test(targetUrl.protocol)) {
      return json({ error: "Only http and https images are allowed" }, 400);
    }

    if (BLOCKED_HOST_PATTERNS.some((pattern) => pattern.test(targetUrl.hostname))) {
      return json({ error: "Host is not allowed" }, 400);
    }

    const upstream = await fetchImage(targetUrl);

    if (!upstream || !upstream.ok) {
      // Upstream hosts often block hotlinking or serve expired URLs. Returning a
      // 502 leaves broken images in the UI, so serve a neutral placeholder instead.
      return placeholderResponse();
    }

    const contentType = upstream.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      return placeholderResponse();
    }


    const headers = new Headers({
      ...corsHeaders,
      ...CACHE_HEADERS,
      "Content-Type": contentType,
    });

    const contentLength = upstream.headers.get("content-length");
    const etag = upstream.headers.get("etag");
    const lastModified = upstream.headers.get("last-modified");

    if (contentLength) headers.set("Content-Length", contentLength);
    if (etag) headers.set("ETag", etag);
    if (lastModified) headers.set("Last-Modified", lastModified);

    return new Response(upstream.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.warn("Image proxy error:", error instanceof Error ? error.message : error);
    return placeholderResponse();
  }
});

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

/**
 * Fetch the upstream image with browser-like headers. Many listing sites use
 * hotlink protection and reject unknown user agents or requests without a
 * Referer, so we retry once with the target's own origin as Referer.
 */
async function fetchImage(targetUrl: URL): Promise<Response | null> {
  const attempts: HeadersInit[] = [
    {
      "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      "Accept-Language": "nl-NL,nl;q=0.9,en;q=0.8",
      "User-Agent": BROWSER_UA,
      "Referer": `${targetUrl.origin}/`,
    },
    {
      "Accept": "image/avif,image/webp,image/*,*/*;q=0.8",
      "User-Agent": BROWSER_UA,
    },
  ];

  let last: Response | null = null;
  for (const headers of attempts) {
    try {
      const res = await fetch(targetUrl.toString(), { redirect: "follow", headers });
      if (res.ok) return res;
      await res.body?.cancel();
      last = res;
    } catch (err) {
      console.warn("Image fetch attempt failed:", err instanceof Error ? err.message : err);
    }
  }
  return last;
}

const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600"><rect width="800" height="600" fill="#eef2f6"/><g fill="none" stroke="#173e63" stroke-opacity="0.35" stroke-width="14" stroke-linejoin="round"><path d="M250 300 L400 190 L550 300"/><path d="M290 300 v130 h220 v-130"/></g></svg>`;

/** Neutral house placeholder so listings never show a broken image. */
function placeholderResponse() {
  return new Response(PLACEHOLDER_SVG, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}


function json(payload: Record<string, string>, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}
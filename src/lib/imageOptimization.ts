/**
 * Image optimization helpers.
 * For Supabase-hosted images we use the built-in render/transform endpoint to
 * deliver correctly-sized WebP variants. For external (scraped) images we fall
 * back to weserv.nl, a free image proxy that resizes and converts to WebP.
 */

const SUPABASE_HOST = "kppotnzwhxkflceiscto.supabase.co";
const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const IMAGE_PROXY_BASE = PROJECT_ID
  ? `https://${PROJECT_ID}.supabase.co/functions/v1/image-proxy`
  : "";

export interface ImgOpts {
  width: number;
  height?: number;
  quality?: number;
  /** Output format. 'auto' picks AVIF when supported by the proxy. Defaults to 'webp'. */
  format?: "webp" | "avif" | "auto";
}

/** Build an optimized URL (WebP, resized) for a property image. */
export const optimizeImage = (src: string | undefined | null, opts: ImgOpts): string => {
  if (!src) return "";
  const { width, height, quality = 70, format = "webp" } = opts;

  // Local bundled assets (Vite hashed paths) - return as-is
  if (src.startsWith("/") || src.startsWith("data:") || src.startsWith("blob:")) {
    return src;
  }

  try {
    const url = new URL(src);

    // Supabase storage: rewrite /object/public/ -> /render/image/public/
    if (url.hostname.endsWith(SUPABASE_HOST) && url.pathname.includes("/storage/v1/object/public/")) {
      const renderPath = url.pathname.replace(
        "/storage/v1/object/public/",
        "/storage/v1/render/image/public/"
      );
      const params = new URLSearchParams({
        width: String(width),
        quality: String(quality),
        resize: "cover",
        // Supabase render endpoint only supports origin/webp; keep webp for broad support
        format: format === "avif" ? "webp" : "webp",
      });
      if (height) params.set("height", String(height));
      return `${url.origin}${renderPath}?${params.toString()}`;
    }

    // External images: proxy through our own backend endpoint so third-party IP bans
    // cannot break property cards in preview or production.
    if (IMAGE_PROXY_BASE) {
      return `${IMAGE_PROXY_BASE}?src=${encodeURIComponent(src)}`;
    }

    return src;
  } catch {
    return src;
  }
};

/**
 * Generate a srcset string for responsive images. Returns "" when the source
 * cannot be resized (external proxy, local assets), so the browser is never
 * told that identical files are different widths.
 */
export const buildSrcSet = (src: string | undefined | null, widths: number[], height?: number, quality = 70, format: ImgOpts["format"] = "webp"): string => {
  if (!src || widths.length === 0) return "";
  const first = widths[0] ?? 1;
  const entries = widths.map((w) => {
    const h = height ? Math.round((height / first) * w) : undefined;
    return { w, url: optimizeImage(src, { width: w, height: h, quality, format }) };
  });
  if (new Set(entries.map((e) => e.url)).size < entries.length) return "";
  return entries.map((e) => `${e.url} ${e.w}w`).join(", ");
};

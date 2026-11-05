import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { SITE_URL, isTemplateCityPath } from "../supabase/functions/_shared/sitemapPolicy";
import { MAX_STATIC_RENTAL_FILES } from "../src/lib/rentalStaticPages";

/** Sitemap families that must be backed by their own static file; all other URLs use the SPA shell. */
export const isStaticSitemapRoute = (route: string) => /^\/(?:huurwoningen|huurprijs-index|heatmap)\/[^/]+$/.test(route);

/** Count generated index.html files beside Vite's own dist/index.html and fail before publishing. */
export async function assertStaticFileBudget(root: string, limit = MAX_STATIC_RENTAL_FILES) {
  const entries = await readdir(root, { recursive: true }) as string[];
  const extra = entries.filter(entry => entry !== "index.html" && path.basename(entry) === "index.html").length;
  if (extra > limit) throw new Error(`dist has ${extra} extra index.html files; limit is ${limit}`);
  return extra;
}

const decode = (value: string) => value.replace(/&amp;/g, "&").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const canonical = (html: string) => decode(html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/i)?.[1] || "");
const robots = (html: string) => html.match(/<meta\b[^>]*name="robots"[^>]*content="([^"]+)"/i)?.[1];

/** Validate files, not the running SPA or a host's fallback response. */
export async function verifyRentalSeoOutput(root: string, sitemapXml: string[]) {
  const urls = new Set(sitemapXml.flatMap(xml => [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => decode(match[1]))));
  const titles = new Map<string, string>();
  for (const url of urls) {
    if (!url.startsWith(`${SITE_URL}/`)) throw new Error(`Unexpected sitemap origin: ${url}`);
    const route = url.slice(SITE_URL.length);
    if (isTemplateCityPath(route) || /^\/(?:en|de|fr)(?:\/|$)/.test(route) || route.includes("'s-gravenhage") || route.includes("'s-hertogenbosch")) throw new Error(`Retired sitemap route: ${route}`);
    if (!isStaticSitemapRoute(route)) continue;
    const html = await readFile(path.join(root, route.slice(1), "index.html"), "utf8").catch(error => {
      // Hubs must be static; index/heatmap pages beyond the file budget stay on the SPA shell.
      if (route.startsWith("/huurwoningen/")) throw error;
      return null;
    });
    if (html === null) continue;
    const title = decode(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
    if (!title || titles.has(title)) throw new Error(`Missing or duplicate static title: ${route} (${titles.get(title) || ""})`);
    titles.set(title, route);
    if ((html.match(/<h1\b/gi) || []).length !== 1 || canonical(html) !== url || robots(html) !== "index,follow") throw new Error(`Invalid index HTML: ${route}`);
    if (html.includes("<h1>Huurwoningen en koopwoningen in heel Nederland</h1>")) throw new Error(`Homepage shell at ${route}`);
  }
  return titles.size;
}

export async function verifyRequestedRentalFiles(root: string, sitemapXml: string[]) {
  const indexed = new Set(sitemapXml.flatMap(xml => [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => decode(match[1]))));
  const expectations = [
    ["/huurwoningen/eindhoven", "/huurwoningen/eindhoven", "index,follow"],
    ["/stad/eindhoven", "/huurwoningen/eindhoven", "noindex,follow"],
    ["/energie/eindhoven", "/huurwoningen/eindhoven", "noindex,follow"],
    ["/huurwoningen/'s-gravenhage", "/huurwoningen/den-haag", "noindex,follow"],
    ["/huurwoningen/'s-hertogenbosch", "/huurwoningen/den-bosch", "noindex,follow"],
    ...["/huurprijs-index/eindhoven", "/heatmap/eindhoven"].filter(route => indexed.has(SITE_URL + route)).map(route => [route, route, "index,follow"]),
  ];
  for (const [route, target, status] of expectations) {
    const optional = route.startsWith("/stad/") || route.startsWith("/energie/");
    const html = await readFile(path.join(root, route.slice(1), "index.html"), "utf8").catch(error => { if (optional) return null; throw error; });
    // Template noindex files are lowest priority and may be trimmed by the static file budget.
    if (html === null) { console.log(`SEO file skipped by budget: ${route}`); continue; }
    if (canonical(html) !== SITE_URL + target || robots(html) !== status || (html.match(/<h1\b/gi) || []).length !== 1) throw new Error(`Requested SEO check failed: ${route}`);
    if (!/<div\b[^>]*id="root"/.test(html) || !/<script\b[^>]*src=/.test(html)) throw new Error(`Missing SPA shell: ${route}`);
    if (status === "noindex,follow" && Buffer.byteLength(html) > 6000) throw new Error(`Noindex HTML is not compact: ${route}`);
    if (route === "/huurwoningen/eindhoven" && (!html.includes("Strijp-S") || !/href="\/huurwoning\/eindhoven\//.test(html) || !html.includes("<h1>Huurwoningen in Eindhoven</h1>"))) throw new Error("Eindhoven rich HTML is incomplete");
    console.log(`SEO file verified: ${route} (${Buffer.byteLength(html)} bytes, ${status})`);
  }
  const llms = await readFile(path.join(root, "llms.txt"), "utf8");
  const once = (name: string) => (llms.match(new RegExp(`^[-*] .*Huurwoningen in ${name}\\]`, "gm")) || []).length === 1;
  if (!llms.includes("Taal: Nederlands.") || !once("Den Haag") || !once("Den Bosch") || /'s-(?:gravenhage|hertogenbosch)/i.test(llms)) throw new Error("Invalid Dutch llms city identities");
  const steden = (await Promise.all([1, 2, 3].map(i => readFile(path.join(root, `sitemap-steden-${i}.xml`), "utf8")))).join("\n");
  for (const loc of steden.matchAll(/<loc>(.*?)<\/loc>/g)) {
    const route = decode(loc[1]).slice(SITE_URL.length);
    if (isTemplateCityPath(route) || /^\/(?:en|de|fr)(?:\/|$)/.test(route) || /'s-|s-gravenhage|s-hertogenbosch/.test(route)) throw new Error(`Forbidden sitemap-steden route: ${route}`);
  }
}
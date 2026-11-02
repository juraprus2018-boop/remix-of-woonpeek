import { readFile } from "node:fs/promises";
import path from "node:path";
import { SITE_URL, isTemplateCityPath } from "../supabase/functions/_shared/sitemapPolicy";

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
    const html = await readFile(path.join(root, route.slice(1), "index.html"), "utf8");
    const title = decode(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
    if (!title || titles.has(title)) throw new Error(`Missing or duplicate static title: ${route} (${titles.get(title) || ""})`);
    titles.set(title, route);
    if ((html.match(/<h1\b/gi) || []).length !== 1 || canonical(html) !== url || robots(html) !== "index,follow") throw new Error(`Invalid index HTML: ${route}`);
    if (route !== "/" && html.includes("<h1>Huurwoningen en koopwoningen in heel Nederland</h1>")) throw new Error(`Homepage shell at ${route}`);
  }
  return urls.size;
}

export async function verifyRequestedRentalFiles(root: string, sitemapXml: string[]) {
  const indexed = new Set(sitemapXml.flatMap(xml => [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => decode(match[1]))));
  const expectations = [
    ["/huurwoningen/eindhoven", "/huurwoningen/eindhoven", "index,follow"],
    ["/stad/swalmen", "/stad/swalmen", "noindex,follow"],
    ["/energie/eindhoven", "/huurwoningen/eindhoven", "noindex,follow"],
    ["/en/huurwoningen/eindhoven", "/huurwoningen/eindhoven", "noindex,follow"],
    ["/huurwoningen/'s-gravenhage", "/huurwoningen/den-haag", "noindex,follow"],
    ["/huurwoningen/'s-hertogenbosch", "/huurwoningen/den-bosch", "noindex,follow"],
    ["/huurprijs-index/eindhoven", "/huurprijs-index/eindhoven", indexed.has(`${SITE_URL}/huurprijs-index/eindhoven`) ? "index,follow" : "noindex,follow"],
  ];
  for (const [route, target, status] of expectations) {
    const html = await readFile(path.join(root, route.slice(1), "index.html"), "utf8");
    if (canonical(html) !== SITE_URL + target || robots(html) !== status || (html.match(/<h1\b/gi) || []).length !== 1) throw new Error(`Requested SEO check failed: ${route}`);
    if (!/<div\b[^>]*id="root"/.test(html) || !/<script\b[^>]*src=/.test(html)) throw new Error(`Missing SPA shell: ${route}`);
    if (status === "noindex,follow" && Buffer.byteLength(html) > 6000) throw new Error(`Noindex HTML is not compact: ${route}`);
    if (route === "/huurwoningen/eindhoven" && (!html.includes("Strijp-S") || !/href="\/huurwoning\/eindhoven\//.test(html) || !html.includes("<h1>Huurwoningen in Eindhoven</h1>"))) throw new Error("Eindhoven rich HTML is incomplete");
    console.log(`SEO file verified: ${route} (${Buffer.byteLength(html)} bytes, ${status})`);
  }
  const llms = await readFile(path.join(root, "llms.txt"), "utf8");
  if (!llms.includes("Taal: Nederlands.") || (llms.match(/^[-*] .*Huurwoningen in Den Haag/gm) || []).length !== 1 || llms.includes("/huurwoningen/'s-gravenhage")) throw new Error("Invalid Dutch llms city identities");
}
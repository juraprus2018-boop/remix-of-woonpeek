// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// Never set ssr.external or resolve.external: the Worker has no runtime module resolution, so
// the build fails. Never add compression (compressPublicAssets, vite-plugin-compression):
// hosting already compresses at the edge.
import fs from "node:fs";
import path from "node:path";
import { loadEnv, type Plugin } from "vite";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { planCrawlablePages, citySeoContent, type CrawlableRental } from "./src/lib/searchSeoHtml";

const CLIENT_DIR = path.resolve(__dirname, "dist", "client");

const backendEnv = (mode: string, root: string) => {
  const env = loadEnv(mode, root, "VITE_");
  return {
    url: process.env["VITE_SUPABASE_URL"] || env["VITE_SUPABASE_URL"],
    key: process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || env["VITE_SUPABASE_PUBLISHABLE_KEY"],
  };
};

// Pages render on the server now, so no static HTML is written. This only refreshes the
// lastmod of committed city sitemaps for hubs that are indexable in today's rental snapshot.
function sitemapLastmodPlugin(): Plugin {
  let creds: { url?: string; key?: string } = {};
  return {
    name: "sitemap-lastmod-refresh",
    apply: "build",
    configResolved(config) {
      creds = backendEnv(config.mode, config.root);
    },
    async closeBundle() {
      if (this.environment?.name !== "client") return;
      const { url, key } = creds;
      if (!url || !key) return console.warn("Sitemap lastmod skipped: no backend credentials");
      try {
        const snapshot = new Date().toISOString();
        const rows: CrawlableRental[] = [];
        for (let offset = 0; ; offset += 1000) {
          const query = new URLSearchParams({ select: "id,city,status,listing_type,property_type,price,surface_area,neighborhood,created_at,title,address_slug,slug", status: "eq.actief", listing_type: "eq.huur", order: "id.asc", offset: String(offset), limit: "1000" });
          const res = await fetch(`${url}/rest/v1/properties?${query}`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(30000) });
          if (!res.ok) throw new Error(`snapshot failed (${res.status})`);
          const batch = (await res.json()) as CrawlableRental[];
          rows.push(...batch);
          if (batch.length < 1000) break;
        }
        const indexable = new Set<string>();
        for (const p of planCrawlablePages(rows, 760)) {
          const page = citySeoContent(p.rows, snapshot, p.city, p.filter);
          if (page.indexable) indexable.add(`https://www.woonaanbod-nl.nl/huurwoningen/${p.city.slug}${p.filter ? `/${p.filter.slug}` : ""}`);
        }
        const day = snapshot.slice(0, 10);
        for (const file of ["sitemap-steden-1.xml", "sitemap-steden-2.xml", "sitemap-steden-3.xml"]) {
          const target = path.join(CLIENT_DIR, file);
          if (!fs.existsSync(target)) continue;
          const xml = fs.readFileSync(target, "utf8").replace(/<url>[\s\S]*?<\/url>/g, (entry) => {
            const loc = entry.match(/<loc>(.*?)<\/loc>/)?.[1];
            if (!loc || !indexable.has(loc)) return entry;
            return /<lastmod>/.test(entry) ? entry.replace(/<lastmod>.*?<\/lastmod>/, `<lastmod>${day}</lastmod>`) : entry.replace("</url>", `<lastmod>${day}</lastmod></url>`);
          });
          fs.writeFileSync(target, xml);
        }
        console.log(`Sitemap lastmod refreshed for ${indexable.size} city pages`);
      } catch (err) {
        console.warn("Sitemap lastmod skipped:", (err as Error).message);
      }
    },
  };
}

// Writes our own market figures (RPC market_stats) as marktdata.json so AI crawlers and
// journalists can read the data without JavaScript.
function marketDataPlugin(): Plugin {
  let creds: { url?: string; key?: string } = {};
  return {
    name: "static-market-data",
    apply: "build",
    configResolved(config) {
      creds = backendEnv(config.mode, config.root);
    },
    async closeBundle() {
      if (this.environment?.name !== "client") return;
      const { url, key } = creds;
      if (!url || !key) return;
      try {
        const res = await fetch(`${url}/rest/v1/rpc/market_stats`, {
          method: "POST",
          headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: "{}",
        });
        if (!res.ok) return;
        const json = (await res.json()) as Record<string, unknown> | null;
        if (!json?.["national"]) return;
        fs.writeFileSync(
          path.join(CLIENT_DIR, "marktdata.json"),
          JSON.stringify(
            {
              source: "Woonaanbod NL",
              url: "https://www.woonaanbod-nl.nl/woningmarkt",
              license: "CC BY 4.0 – overname met bronvermelding en link",
              method:
                "Live berekend uit het actieve woningaanbod op Woonaanbod NL. Huur EUR 200-10.000 p/m, koop EUR 50.000-5.000.000, prijs per m2 alleen bij 10-500 m2.",
              generated_at: new Date().toISOString(),
              note: "Tellingen zijn actieve advertenties; één woning kan bij meerdere aanbieders staan.",
              ...json,
            },
            null,
            2,
          ),
        );
      } catch {
        // keep the previously generated file
      }
    },
  };
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [sitemapLastmodPlugin(), marketDataPlugin()],
  },
});

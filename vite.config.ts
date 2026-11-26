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
import { type CrawlableRental } from "./src/lib/searchSeoHtml";
import { createCitySitemaps, createPropertySitemaps, sitemapIndex, type SitemapFile } from "./src/lib/sitemapGeneration";

const CLIENT_DIR = path.resolve(__dirname, "dist", "client");

const backendEnv = (mode: string, root: string) => {
  const env = loadEnv(mode, root, "VITE_");
  return {
    url: process.env["VITE_SUPABASE_URL"] || env["VITE_SUPABASE_URL"],
    key: process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || env["VITE_SUPABASE_PUBLISHABLE_KEY"],
  };
};

// Generate focused sitemaps from the same active public snapshot. Query failures fail the
// build instead of silently publishing stale or partial XML. No build-date lastmod is added.
function sitemapGeneratorPlugin(): Plugin {
  let creds: { url?: string; key?: string } = {};
  const writeFiles = (files: SitemapFile[]) => {
    for (const file of files) fs.writeFileSync(path.join(CLIENT_DIR, file.filename), file.xml);
  };
  return {
    name: "sitemap-generator",
    apply: "build",
    configResolved(config) {
      creds = backendEnv(config.mode, config.root);
    },
    async closeBundle() {
      if (this.environment?.name !== "client") return;
      const { url, key } = creds;
      if (!url || !key) throw new Error("Sitemap generation requires public backend credentials");
      const rows: CrawlableRental[] = [];
      for (let offset = 0; ; offset += 1000) {
        const query = new URLSearchParams({ select: "id,city,status,listing_type,property_type,price,surface_area,neighborhood,created_at,title,address_slug,slug", status: "eq.actief", order: "id.asc", offset: String(offset), limit: "1000" });
        const res = await fetch(`${url}/rest/v1/properties?${query}`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(30000) });
        if (!res.ok) throw new Error(`Sitemap property snapshot failed (${res.status}) at offset ${offset}`);
        const batch = (await res.json()) as unknown;
        if (!Array.isArray(batch)) throw new Error(`Sitemap property snapshot returned invalid data at offset ${offset}`);
        rows.push(...batch as CrawlableRental[]);
        if (batch.length < 1000) break;
      }

      for (const stale of fs.readdirSync(CLIENT_DIR).filter((file) => /^sitemap-woningen-.+\.xml$/.test(file))) {
        fs.rmSync(path.join(CLIENT_DIR, stale));
      }
      const propertyFiles = createPropertySitemaps(rows);
      const cityFiles = createCitySitemaps(rows);
      writeFiles(propertyFiles);
      writeFiles(cityFiles);
      fs.writeFileSync(path.join(CLIENT_DIR, "sitemap-woningen.xml"), sitemapIndex(propertyFiles.map((file) => file.filename)));
      fs.writeFileSync(path.join(CLIENT_DIR, "sitemap-steden.xml"), sitemapIndex(cityFiles.map((file) => file.filename)));
      fs.writeFileSync(path.join(CLIENT_DIR, "sitemap.xml"), sitemapIndex([
        "sitemap-pages.xml",
        ...cityFiles.map((file) => file.filename),
        ...propertyFiles.map((file) => file.filename),
      ]));
      console.log(`Sitemaps generated: ${propertyFiles.length} city property files, ${propertyFiles.reduce((sum, file) => sum + file.urlCount, 0)} active properties, ${cityFiles.reduce((sum, file) => sum + file.urlCount, 0)} city pages`);
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
    plugins: [sitemapGeneratorPlugin(), marketDataPlugin()],
  },
});

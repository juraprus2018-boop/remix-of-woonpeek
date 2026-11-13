import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";
import { PORTAL_GUIDES, portalGuideHtml } from "./src/lib/portalGuides";
import { CRAWLABLE_CITIES, citySeoContent, withStaticSeo, type CrawlableRental } from "./src/lib/searchSeoHtml";

// Preserve committed sitemaps instead of fetching a possibly older live generator.
// Eight priority city hubs plus search and guides stay safely below 800 files.
function sitemapPlugin() {
  let env: Record<string, string> = {};
  return {
    name: "static-search-and-city-hubs",
    apply: "build" as const,
    configResolved(config: { mode: string; root: string }) {
      env = loadEnv(config.mode, config.root, "VITE_");
    },
    async closeBundle() {
      const dir = path.resolve(__dirname, "dist");
      const template = fs.readFileSync(path.join(dir, "index.html"), "utf8");
      const writePage = (route: string, html: string) => {
        const target = path.join(dir, route, "index.html");
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, html);
      };
      writePage("woning-zoeken", withStaticSeo(template, {
        path: "/woning-zoeken", title: "Huur- en koopwoningen zoeken | Woonaanbod NL",
        description: "Zoek huurwoningen en koopwoningen in Nederland. Vergelijk beschikbaar aanbod op plaats, minimum- en maximumprijs, woningtype en aantal kamers.",
        indexable: true,
        content: '<div class="ssr-home-content"><h1>Huur- en koopwoningen zoeken</h1><p>Vergelijk beschikbaar woningaanbod in Nederland op plaats, postcode, minimum- en maximumprijs, woningtype en aantal kamers.</p><h2>Beschikbaar aanbod per stad</h2><ul>' + CITY_LINKS.map(([name, slug]) => `<li><a href="/huurwoningen/${slug}">Huurwoningen in ${name}</a></li>`).join("") + '</ul><p><a href="/huurwoningen">Alle huurwoningen</a> · <a href="/koopwoningen">Alle koopwoningen</a> · <a href="/woonmelding">Gratis woningmelding</a></p></div>',
      }));
      const INFO_PAGES: [string, string, string, string][] = [
        ["over", "Over Woonaanbod NL: gratis huur- en koopwoningen zoeken | Woonaanbod NL", "Woonaanbod NL verzamelt dagelijks huur- en koopwoningen uit heel Nederland op één plek. Gratis voor woningzoekers, met woningmeldingen en eigen marktcijfers.", '<h1>Over Woonaanbod NL</h1><p>Woonaanbod NL verzamelt dagelijks huur- en koopwoningen van makelaars, verhuurders en partnerplatforms uit heel Nederland. Zoeken en woningmeldingen zijn gratis.</p><p><a href="/transparantie">Hoe wij werken</a> · <a href="/woningmarkt">Actuele marktcijfers</a> · <a href="/contact">Contact</a></p>'],
        ["transparantie", "Transparantie - Hoe Woonaanbod NL werkt | Woonaanbod NL", "Lees hoe Woonaanbod NL aan zijn aanbod komt, welke databronnen we gebruiken, hoe we kwaliteit borgen en hoe je een woning kunt laten verwijderen.", '<h1>Transparantie: hoe Woonaanbod NL werkt</h1><p>Ons aanbod komt uit feeds van partnerplatforms, makelaars en verhuurders. Eén woning kan bij meerdere aanbieders staan; tellingen gaan over actieve advertenties. Verlopen advertenties zetten we op inactief.</p><p><a href="/over">Over ons</a> · <a href="/partners">Partners en aanbieders</a> · <a href="/contact">Woning laten verwijderen</a></p>'],
        ["woonaanbod-per-stad", "Woonaanbod per stad: huurwoningen in heel Nederland | Woonaanbod NL", "Bekijk het actuele huur- en koopaanbod per stad in Nederland, met links naar alle beschikbare woningen per gemeente.", '<h1>Woonaanbod per stad</h1><p>Kies een stad om het actuele woningaanbod te bekijken.</p><ul>' + CITY_LINKS.map(([name, slug]) => `<li><a href="/huurwoningen/${slug}">Huurwoningen in ${name}</a></li>`).join("") + '</ul>'],
      ];
      for (const [route, title, description, body] of INFO_PAGES) writePage(route, withStaticSeo(template, { path: `/${route}`, title, description, indexable: true, content: `<div class="ssr-home-content">${body}</div>` }));
      for (const g of PORTAL_GUIDES) writePage(g.slug, withStaticSeo(template, { path: `/${g.slug}`, title: g.title, description: g.description, indexable: true, content: portalGuideHtml(g) }));
      const url = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
      const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;
      if (!url || !key) { console.warn("City snapshots skipped: no backend credentials"); return; }
      for (const city of CRAWLABLE_CITIES) {
      try {
      const snapshot = new Date().toISOString();
      const rows: CrawlableRental[] = [];
      for (let offset = 0; ; offset += 1000) {
        const query = new URLSearchParams({ select: "id,city,status,listing_type,property_type,price,surface_area,neighborhood,created_at,title,address_slug,slug", or: `(${city.aliases.map(name => `city.ilike.${name}`).join(",")})`, status: "eq.actief", listing_type: "eq.huur", order: "id.asc", offset: String(offset), limit: "1000" });
        const res = await fetch(`${url}/rest/v1/properties?${query}`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(20000) });
        if (!res.ok) throw new Error(`${city.name} snapshot failed (${res.status}); refusing stale city HTML`);
        const batch = await res.json() as CrawlableRental[];
        rows.push(...batch);
        if (batch.length < 1000) break;
      }
      const page = citySeoContent(rows, snapshot, city);
      writePage(`huurwoningen/${city.slug}`, withStaticSeo(template, { ...page, path: `/huurwoningen/${city.slug}` }));
      // Only this hub was rebuilt. Its sitemap lastmod must match its own snapshot.
      for (const file of ["sitemap-steden-1.xml", "sitemap-steden-2.xml", "sitemap-steden-3.xml"]) {
        const target = path.join(dir, file);
        if (!fs.existsSync(target)) continue;
        const xml = fs.readFileSync(target, "utf8").replace(/<url>[\s\S]*?<\/url>/g, entry => {
          if (!entry.includes(`<loc>https://www.woonaanbod-nl.nl/huurwoningen/${city.slug}</loc>`)) return entry;
          if (!page.indexable) return "";
          return /<lastmod>/.test(entry) ? entry.replace(/<lastmod>.*?<\/lastmod>/, `<lastmod>${snapshot.slice(0, 10)}</lastmod>`) : entry.replace("</url>", `<lastmod>${snapshot.slice(0, 10)}</lastmod></url>`);
        });
        fs.writeFileSync(target, xml);
      }
      } catch (err) {
        // Never write stale Utrecht HTML; skip it rather than failing the whole build.
        console.warn(`${city.name} snapshot skipped:`, (err as Error).message);
      }
      }
    },
  };
}


const esc = (s: string) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const CITY_LINKS: Array<[string, string]> = [
  ["Amsterdam", "amsterdam"],
  ["Rotterdam", "rotterdam"],
  ["Utrecht", "utrecht"],
  ["Den Haag", "den-haag"],
  ["Eindhoven", "eindhoven"],
  ["Groningen", "groningen"],
  ["Tilburg", "tilburg"],
  ["Almere", "almere"],
  ["Breda", "breda"],
  ["Nijmegen", "nijmegen"],
  ["Arnhem", "arnhem"],
  ["Haarlem", "haarlem"],
  ["Amersfoort", "amersfoort"],
  ["Apeldoorn", "apeldoorn"],
  ["Zwolle", "zwolle"],
  ["Maastricht", "maastricht"],
];

// Haalt onze eigen woningmarktcijfers op (RPC market_stats) en schrijft ze als
// machine-leesbaar bestand naar public/marktdata.json, zodat AI-crawlers en
// journalisten de data zonder JavaScript kunnen lezen.
function marketDataPlugin() {
  let env: Record<string, string> = {};
  return {
    name: "static-market-data",
    apply: "build" as const,
    configResolved(config: { mode: string; root: string }) {
      env = loadEnv(config.mode, config.root, "VITE_");
    },
    async closeBundle() {
      const url = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
      const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;
      if (!url || !key) return;
      try {
        const res = await fetch(`${url}/rest/v1/rpc/market_stats`, {
          method: "POST",
          headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: "{}",
        });
        if (!res.ok) return;
        const json = (await res.json()) as Record<string, unknown> | null;
        if (!json?.national) return;
        fs.writeFileSync(
          path.resolve(__dirname, "dist", "marktdata.json"),
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
        // laat het eerder gegenereerde bestand staan
      }
    },
  };
}

// Builds server-side (build-time) HTML for the homepage: headings, body copy,
// internal links and a real listing overview with titles, prices and cities.
// React replaces #root on hydration, so crawlers without JS still get content.
async function prerenderHomeContentPlugin() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  async function fetchListings() {
    if (!url || !key) return [];
    try {
      const res = await fetch(
        `${url}/rest/v1/properties?select=id,slug,address_slug,title,city,price,listing_type,property_type,bedrooms,surface_area&status=eq.actief&order=created_at.desc&limit=24`,
        { headers: { apikey: key, Authorization: `Bearer ${key}` } },
      );
      if (!res.ok) return [];
      return (await res.json()) as Array<Record<string, unknown>>;
    } catch {
      return [];
    }
  }


  return {
    name: "prerender-home-content",
    apply: "build" as const,
    async transformIndexHtml(html: string) {
      const listings = await fetchListings();

      const listItems = listings
        .map((p) => {
          const href = `/${p.listing_type === "koop" ? "koopwoning" : "huurwoning"}/${String(p.city || "nederland").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}/${p.address_slug || p.slug || p.id}`;
          const price = Number(p.price || 0).toLocaleString("nl-NL");
          const kind = p.listing_type === "koop" ? "Te koop" : "Te huur";
          const details = [
            p.property_type ? String(p.property_type) : null,
            p.bedrooms ? `${p.bedrooms} kamers` : null,
            p.surface_area ? `${p.surface_area} m²` : null,
          ]
            .filter(Boolean)
            .join(" · ");
          return `<li><a href="${esc(href)}">${esc(String(p.title))}</a> — ${esc(String(p.city))} — € ${esc(price)} p/m — ${esc(kind)}${details ? ` — ${esc(details)}` : ""}</li>`;
        })
        .join("");

      const cityItems = CITY_LINKS.map(
        ([name, slug]) =>
          `<li><a href="/huurwoningen/${slug}">Huurwoningen in ${esc(name)}</a></li>`,
      ).join("");

      const content = `
      <div class="ssr-home-content">
        <h1>Huurwoningen en koopwoningen in heel Nederland</h1>
        <p>Woonaanbod NL bundelt dagelijks nieuw woningaanbod van verhuurders, makelaars en woningplatforms.
        Zoek op plaats, postcode, prijs, woningtype en aantal kamers, bekijk woningen op de kaart en stel
        een gratis dagelijkse alert in zodat je nieuw aanbod als eerste ziet.</p>
        <h2>Nieuwste woningen</h2>
        <ul>${listItems || '<li><a href="/woning-zoeken">Bekijk het actuele woningaanbod</a></li>'}</ul>
        <h2>Populaire steden</h2>
        <ul>${cityItems}</ul>
        <h2>Snel naar</h2>
        <ul>
          <li><a href="/huurwoningen">Huurwoningen</a></li>
          <li><a href="/appartement-huren">Appartementen</a></li>
          <li><a href="/studio-huren">Studio's</a></li>
          <li><a href="/kamer-huren">Kamers</a></li>
          <li><a href="/woning-zoeken">Woning zoeken</a></li>
          <li><a href="/op-kaart">Woningen op de kaart</a></li>
          <li><a href="/vandaag">Nieuw aanbod van vandaag</a></li>
          <li><a href="/woonmelding">Gratis dagelijkse alert</a></li>
          <li><a href="/woningmarkt">Woningmarktcijfers: huurprijs per m2 en actueel aanbod</a></li>
          <li><a href="/woningmarkt/huurprijzen-nederland">Huurprijzen Nederland</a></li>
          <li><a href="/woningmarkt/huurprijzen-per-gemeente">Huurprijzen per gemeente</a></li>
          <li><a href="/woningmarkt/koopprijzen-per-gemeente">Koopprijzen per gemeente</a></li>
          <li><a href="/woningmarkt/nieuw-woningaanbod-per-week">Nieuw woningaanbod per week</a></li>
          <li><a href="/woningmarkt/meeste-huurwoningen-per-stad">Meeste huurwoningen per stad</a></li>
          <li><a href="/woningmarkt/betaalbaarste-steden-voor-huurders">Betaalbaarste steden voor huurders</a></li>
          <li><a href="/woningmarkt/huurwoningen-onder-1500-euro">Huurwoningen onder 1.500 euro</a></li>
          <li><a href="/woningmarkt/koopwoningen-onder-400000-euro">Koopwoningen onder 400.000 euro</a></li>
          <li><a href="/woningmarkt/nieuwbouw-per-provincie">Nieuwbouw per provincie</a></li>
          <li><a href="/huurprijsmonitor">Huurprijsmonitor</a></li>

          <li><a href="/budgetcheck">Budget tool</a></li>
          <li><a href="/woonaanbod-per-stad">Alle steden</a></li>
        </ul>
      </div>`;

      return html.replace(
        '<div class="hero-fallback" aria-hidden="true"></div>',
        `<div class="hero-fallback" aria-hidden="true"></div>${content}`,
      );
    },
  };
}


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), sitemapPlugin(), marketDataPlugin(), prerenderHomeContentPlugin(), mode === "development" && componentTagger()].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: false,
    minify: "esbuild",
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes("node_modules")) return undefined;
          // Only split libs that do NOT depend on React at module-init time.
          // Splitting React-dependent libs (radix, router, tanstack, framer-motion, recharts)
          // into separate chunks can cause `createContext` errors when those chunks
          // evaluate before the React chunk is ready.
          if (id.includes("leaflet")) return "vendor-leaflet";
          if (id.includes("@supabase")) return "vendor-supabase";
          // Everything else (react, react-dom, radix, router, query, motion, charts, icons)
          // stays in the default vendor chunk so module init order is guaranteed.
          return "vendor";
        },
      },
    },
  },
}));

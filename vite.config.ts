import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

// Fetches the generated sitemaps at build time and writes them as static
// files, so https://www.woonaanbod-nl.nl/sitemap.xml resolves on our own domain.
function sitemapPlugin() {
  const base = `${process.env.VITE_SUPABASE_URL || ""}/functions/v1/generate-sitemap`;
  const targets: Array<[string, string]> = [
    ["index", "sitemap.xml"],
    ["pages", "sitemap-pages.xml"],
    ["steden", "sitemap-steden.xml"],
    ["woningen", "sitemap-woningen.xml"],
  ];
  // Oversized sitemaps (>9MB) can't live in git, so they are written to dist/
  // in closeBundle (after Vite has emptied the output dir) instead of public/.
  const oversized: Array<[string, string]> = [];
  return {
    name: "static-sitemaps",
    apply: "build" as const,
    async buildStart() {
      if (!process.env.VITE_SUPABASE_URL) return;
      await Promise.all(
        targets.map(async ([type, file]) => {
          try {
            const res = await fetch(`${base}?type=${type}`);
            if (!res.ok) return;
            const xml = await res.text();
            if (!xml.trim().startsWith("<?xml")) return;
            if (Buffer.byteLength(xml) > 9_000_000) {
              oversized.push([file, xml]);
            } else {
              fs.writeFileSync(path.resolve(__dirname, "public", file), xml);
            }
          } catch {
            // keep the previously committed file on failure
          }
        }),
      );
    },
    closeBundle() {
      const dir = path.resolve(__dirname, "dist");
      for (const [file, xml] of oversized) {
        try {
          fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(path.join(dir, file), xml);
        } catch {
          // non-fatal
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
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  return {
    name: "static-market-data",
    apply: "build" as const,
    async buildStart() {
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
          path.resolve(__dirname, "public", "marktdata.json"),
          JSON.stringify(
            {
              source: "Woonaanbod NL",
              url: "https://www.woonaanbod-nl.nl/woningmarkt",
              license: "CC BY 4.0 – overname met bronvermelding en link",
              method:
                "Live berekend uit het actieve woningaanbod op Woonaanbod NL. Huur EUR 200-10.000 p/m, koop EUR 50.000-5.000.000, prijs per m2 alleen bij 10-500 m2.",
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
          <li><a href="/woonradar">Gratis dagelijkse alert</a></li>
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
          <li><a href="/plekken">Alle steden</a></li>
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

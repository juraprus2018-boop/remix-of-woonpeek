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
            if (xml.trim().startsWith("<?xml")) {
              fs.writeFileSync(path.resolve(__dirname, "public", file), xml);
            }
          } catch {
            // keep the previously committed file on failure
          }
        }),
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
  plugins: [react(), sitemapPlugin(), mode === "development" && componentTagger()].filter(Boolean),

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

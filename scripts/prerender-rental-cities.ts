import { readFile, mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { loadEnv } from "vite";
import { writeRentalSeoArtifacts, writeSnapshotHtml } from "./rental-seo-artifacts";
import { groupRentalCities, renderRentalCity, type StaticRental } from "../src/lib/rentalCityPrerender";

const env = { ...loadEnv("production", process.cwd(), "VITE_"), ...process.env };
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) throw new Error("Rental city prerender requires the configured public data connection");
const columns = "id,city,status,listing_type,property_type,price,surface_area,neighborhood,created_at,street,house_number,postal_code,slug,address_slug,title,bedrooms,updated_at,number_of_rooms:source_raw->>number_of_rooms";
const rows: StaticRental[] = [];
let expected = 0;
for (let offset = 0; offset === 0 || offset < expected; offset += 1000) {
  const endpoint = new URL(`${url}/rest/v1/properties`);
  endpoint.search = new URLSearchParams({ select: columns, status: "eq.actief", listing_type: "eq.huur", order: "id.asc", offset: String(offset), limit: "1000" }).toString();
  let response: Response | undefined;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      response = await fetch(endpoint, { headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact" }, signal: AbortSignal.timeout(30000) });
      if (response.ok) break;
    } catch { /* Retry transient network failures, never publish partial data. */ }
    if (attempt < 2) await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 500));
  }
  if (!response?.ok) throw new Error(`Rental city data unavailable at batch ${offset}`);
  const count = Number(response.headers.get("content-range")?.split("/")[1]);
  if (!Number.isInteger(count) || count < 0) throw new Error("Rental city query did not return an exact count");
  if (offset === 0) expected = count;
  if (count !== expected) throw new Error("Active rental count changed during prerender; rebuild to get a complete snapshot");
  const batch = await response.json() as StaticRental[];
  if (batch.length !== Math.min(1000, expected - offset)) throw new Error("Rental city query returned an incomplete batch");
  rows.push(...batch);
}
if (new Set(rows.map(row => row.id)).size !== expected) throw new Error("Rental city snapshot contains missing or duplicate listings");
const dist = path.resolve("dist");
const shell = await readFile(path.join(dist, "index.html"), "utf8");
// Preserve homepage content, but make its existing index status explicit in raw HTML.
await writeFile(path.join(dist, "index.html"), shell.replace(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/gi, "").replace(/<meta\b(?=[^>]*name=["']robots["'])[^>]*>/gi, "").replace(/<\/head>/i, '<link rel="canonical" href="https://www.woonaanbod-nl.nl/"><meta name="robots" content="index,follow"></head>'));
const now = new Date();
const pages = groupRentalCities(rows).map(([slug, group]) => ({ slug, html: renderRentalCity(shell, group.city, group.rows, now) }));
// Remove only our own city indexes, never other route artifacts or the sitemap.
const manifestPath = path.join(dist, "rental-city-prerender-manifest.json");
try {
  const previous = JSON.parse(await readFile(manifestPath, "utf8")) as { cities: string[] };
  for (const slug of previous.cities) {
    if (!/[/\\\u0000]/.test(slug)) await rm(path.join(dist, "huurwoningen", slug, "index.html"), { force: true });
  }
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}
for (const page of pages) {
  const directory = path.join(dist, "huurwoningen", page.slug);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "index.html"), page.html);
}
await writeFile(manifestPath, JSON.stringify({ generatedAt: now.toISOString(), activeRentals: expected, cities: pages.map(page => page.slug) }, null, 2));
console.log(`Rental city HTML: ${pages.length} cities generated from ${expected} active rental listings.`);
const artifacts = await writeRentalSeoArtifacts(rows, now, ["dist"]);
await writeSnapshotHtml(shell, rows, now, artifacts.sitemapXml, artifacts.historicalXml);

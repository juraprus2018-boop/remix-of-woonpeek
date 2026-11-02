import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { repairSitemap } from "../supabase/functions/_shared/sitemapPolicy";
import { groupRentalCities, type StaticRental } from "../src/lib/rentalCityPrerender";
import { calculateCityRentalStats } from "../src/lib/cityRentalStats";
import { MAX_STATIC_RENTAL_FILES, renderSnapshotPage, type StaticRentalPlan } from "../src/lib/rentalStaticPages";
import { rentalCitySlug } from "../supabase/functions/_shared/rentalCityIdentity";

export async function writeSnapshotHtml(shell: string, rows: StaticRental[], now: Date, plan: StaticRentalPlan) {
  if (plan.total > MAX_STATIC_RENTAL_FILES) throw new Error(`Static rental HTML budget exceeded: ${plan.total} > ${MAX_STATIC_RENTAL_FILES}`);
  const cityRows = new Map<string, StaticRental[]>();
  for (const row of rows) {
    const slug = rentalCitySlug(row.city);
    const list = cityRows.get(slug);
    if (list) list.push(row); else cityRows.set(slug, [row]);
  }
  const smallShell = `<html lang="nl"><head>${(shell.match(/<script\b[^>]*\bsrc=[^>]*>[\s\S]*?<\/script>|<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi) || []).join("")}</head><body><div id="root"></div></body></html>`;
  const write = async (route: string, html: string) => {
    if (!route.startsWith("/") || route.includes("..") || /[\\\u0000?#]/.test(route)) throw new Error(`Unsafe static route: ${route}`);
    const directory = path.join("dist", route.slice(1));
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, "index.html"), html);
  };
  for (const route of plan.rich) await write(route, renderSnapshotPage(shell, route, cityRows.get(route.split("/")[2]) || [], now));
  for (const route of plan.noindex) await write(route, renderSnapshotPage(smallShell, route, cityRows.get(rentalCitySlug(route.split("/")[2] || "")) || [], now, true));
  // Build output is writable; public/ is read-only input.
  await writeFile("dist/seo-retired-paths.json", JSON.stringify(plan.noindex));
  console.log(`Snapshot HTML: ${plan.hubs.length} hubs, ${plan.rich.length} index/heatmap, ${plan.noindex.length} noindex (${plan.total}/${MAX_STATIC_RENTAL_FILES}).`);
}

export async function writeRentalSeoArtifacts(rows: StaticRental[], now: Date, roots: string[]) {
  if (roots.some(root => path.resolve(root) !== path.resolve("dist"))) throw new Error("Rental SEO artifacts may only be written to dist");
  const groups = groupRentalCities(rows);
  const snapshotDate = now.toISOString().slice(0, 10);
  const publicDir = path.resolve("public");
  const citiesXml = (await Promise.all([1, 2, 3].map(i => readFile(path.join(publicDir, `sitemap-steden-${i}.xml`), "utf8")))).join("\n");
  const cities = repairSitemap(citiesXml, rows, groups.map(([slug]) => slug), snapshotDate, "steden");
  const entries = cities.match(/<url>[\s\S]*?<\/url>/g) || [];
  const header = cities.slice(0, cities.indexOf("<url>"));
  const llms = await readFile(path.join(publicDir, "llms.txt"), "utf8");
  const top = groups.map(([slug, group]) => ({ slug, city: group.city, stats: calculateCityRentalStats(group.rows.map(row => ({ ...row, property_type: row.property_type || "" })), group.city, now.getTime()) })).sort((a, b) => b.stats.total - a.stats.total || a.city.localeCompare(b.city)).slice(0, 15);
  const section = `## Steden met het meeste actieve huuraanbod\n\nPeildatum: ${now.toLocaleDateString("nl-NL", { timeZone: "Europe/Amsterdam", day: "numeric", month: "long", year: "numeric" })}. Bron: dezelfde volledige actieve-huurwoningsnapshot als de statische stadspagina's. Aantallen zijn advertenties, niet noodzakelijk unieke woningen.\n\n${top.map(({ slug, city, stats }) => `- [Huurwoningen in ${city}](https://www.woonaanbod-nl.nl/huurwoningen/${slug}): ${stats.total} actieve huurwoningen${stats.priceSample > 0 && stats.averagePrice !== null ? `, gemiddelde huur € ${Math.round(stats.averagePrice).toLocaleString("nl-NL")} per maand (steekproef: ${stats.priceSample})` : ""}.`).join("\n")}\n\n`;
  const updatedLlms = llms.replace(/## (?:Populaire steden|Steden met het meeste actieve huuraanbod)\n[\s\S]*?(?=\n## |$)/, section.trimEnd()).replace(/- Talen?:[^\n]*/g, "- Taal: Nederlands.");
  const outputs = [cities];
  for (const root of roots) {
    const directory = path.resolve(root);
    for (let i = 0; i < 3; i++) {
      const size = Math.ceil(entries.length / 3);
      await writeFile(path.join(directory, `sitemap-steden-${i + 1}.xml`), header + entries.slice(i * size, (i + 1) * size).join("\n") + "\n</urlset>\n");
    }
    for (const kind of ["pages", "woningen"] as const) {
      const xml = await readFile(path.join(publicDir, `sitemap-${kind}.xml`), "utf8");
      const repaired = repairSitemap(xml, rows, [], snapshotDate, kind);
      await writeFile(path.join(directory, `sitemap-${kind}.xml`), repaired);
      if (root === "dist") outputs.push(repaired);
    }
    await writeFile(path.join(directory, "llms.txt"), updatedLlms);
  }
  return { sitemapXml: outputs };
}
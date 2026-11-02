import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { repairSitemap, snapshotCityPaths, snapshotPathIndexable, SITE_URL } from "../supabase/functions/_shared/sitemapPolicy";
import { groupRentalCities, type StaticRental } from "../src/lib/rentalCityPrerender";
import { calculateCityRentalStats } from "../src/lib/cityRentalStats";
import { renderSnapshotPage } from "../src/lib/rentalStaticPages";
import { DUTCH_CITIES } from "../src/lib/dutchCities";
import { rentalCitySlug } from "../supabase/functions/_shared/rentalCityIdentity";

export async function writeSnapshotHtml(shell: string, rows: StaticRental[], now: Date, sitemapXml: string[], historicalXml: string) {
  const cities = new Set([...DUTCH_CITIES.map(rentalCitySlug), ...groupRentalCities(rows, true).map(([slug]) => slug)]);
  // Index counts once, rather than rescanning the nationwide feed for each noindex file.
  const cityRows = new Map<string, StaticRental[]>();
  for (const row of rows) {
    const slug = rentalCitySlug(row.city);
    cityRows.set(slug, [...(cityRows.get(slug) || []), row]);
  }
  const paths = new Set(snapshotCityPaths(rows, [...cities]));
  const indexed = new Set(sitemapXml.flatMap(xml => [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1].replace(SITE_URL, "").replace(/&amp;/g, "&"))));
  for (const match of historicalXml.matchAll(/<loc>(.*?)<\/loc>/g)) paths.add(match[1].replace(SITE_URL, "").replace(/&amp;/g, "&"));
  for (const path of indexed) paths.add(path);
  for (const slug of cities) {
    for (const family of ["energie", "nieuwbouw", "studenten", "woz-waarde", "verhuisservice", "stadsgids", "vandaag", "markt", "cijfers", "stad"]) paths.add(`/${family}/${slug}`);
    for (const variant of ["goedkoop-huur", "grootste-huur", "buurten"]) paths.add(`/toplijst/${slug}/${variant}`);
  }
  paths.add("/huurwoningen/'s-gravenhage");
  paths.add("/huurwoningen/'s-hertogenbosch");
  // Keep a compact historical inventory so a future feed change cannot lose noindex files.
  let previous: string[] = [];
  try { previous = JSON.parse(await readFile("public/seo-retired-paths.json", "utf8")); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  for (const path of previous) paths.add(path);
  const retired = [...paths].filter(path => !indexed.has(path) && path !== "/" && !/^\/(?:en|de|fr)(?:\/|$)/.test(path));
  await writeFile("dist/seo-retired-paths.json", JSON.stringify(retired));
  await writeFile("public/seo-retired-paths.json", JSON.stringify(retired));
  const nlPaths = [...paths].filter(path => !/^\/(?:en|de|fr)(?:\/|$)/.test(path));
  for (const path of nlPaths) for (const language of ["en", "de", "fr"]) paths.add(`/${language}${path === "/" ? "" : path}`);
  const smallShell = `<html lang="nl"><head>${(shell.match(/<script\b[^>]*\bsrc=[^>]*>[\s\S]*?<\/script>|<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi) || []).join("")}</head><body><div id="root"></div></body></html>`;
  let count = 0;
  for (const route of paths) {
    if (!route.startsWith("/") || route.includes("..") || /[\\\u0000?#]/.test(route)) throw new Error(`Unsafe static route: ${route}`);
    // Preserve the rich homepage and city hubs written by the existing renderer.
    if (route === "/" || (/^\/huurwoningen\/[^/]+$/.test(route) && indexed.has(route) && snapshotPathIndexable(rows, route))) continue;
    const directory = path.join("dist", route.slice(1));
    await mkdir(directory, { recursive: true });
    const nl = route.replace(/^\/(?:en|de|fr)(?=\/|$)/, "");
    const data = indexed.has(route) ? rows : cityRows.get(rentalCitySlug(nl.split("/")[2] || "")) || [];
    await writeFile(path.join(directory, "index.html"), renderSnapshotPage(indexed.has(route) ? shell : smallShell, route, data, now, !indexed.has(route)));
    count++;
  }
  // Fail the build instead of publishing sitemap URLs backed only by the SPA shell.
  for (const route of indexed) await readFile(path.join("dist", route.slice(1), "index.html"), "utf8");
  console.log(`Snapshot HTML: ${count} supplementary index/noindex files; ${indexed.size} sitemap routes verified.`);
}

export async function writeRentalSeoArtifacts(rows: StaticRental[], now: Date, roots: string[]) {
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
  return { sitemapXml: outputs, historicalXml: citiesXml };
}
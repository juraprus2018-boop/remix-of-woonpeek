import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { repairSitemap } from "../supabase/functions/_shared/sitemapPolicy";
import { groupRentalCities, type StaticRental } from "../src/lib/rentalCityPrerender";
import { calculateCityRentalStats } from "../src/lib/cityRentalStats";

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
  const updatedLlms = llms.replace(/## (?:Populaire steden|Steden met het meeste actieve huuraanbod)\n[\s\S]*?(?=\n## |$)/, section.trimEnd());
  for (const root of roots) {
    const directory = path.resolve(root);
    for (let i = 0; i < 3; i++) {
      const size = Math.ceil(entries.length / 3);
      await writeFile(path.join(directory, `sitemap-steden-${i + 1}.xml`), header + entries.slice(i * size, (i + 1) * size).join("\n") + "\n</urlset>\n");
    }
    for (const kind of ["pages", "woningen"] as const) {
      const xml = await readFile(path.join(publicDir, `sitemap-${kind}.xml`), "utf8");
      await writeFile(path.join(directory, `sitemap-${kind}.xml`), repairSitemap(xml, rows, [], snapshotDate, kind));
    }
    await writeFile(path.join(directory, "llms.txt"), updatedLlms);
  }
}